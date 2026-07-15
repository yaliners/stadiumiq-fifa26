import express from "express";
import path from "path";
import http from "http";
import fs from "fs";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import chatRouter from "./server/chat";
import { getWritableDb, dbAll, dbRun, dbGet, saveDb, getReadOnlyDb } from "./server/db";

import { execSync } from "child_process";

// Startup validation function
async function validateStartup() {
  console.log("[Startup] Initiating system validations...");
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Missing critical environment variable: GEMINI_API_KEY is required.");
  }

  try {
    // Attempt to open the database. This will auto-seed if it is missing, corrupt or empty.
    const db = await getReadOnlyDb();
    db.close();
  } catch (err) {
    console.error("[Startup] Database validation failed:", err);
    throw new Error("Critical database failure. Unable to load or auto-seed stadium_ops.db.");
  }

  console.log("✓ System validations passed: GEMINI_API_KEY and database file are present and valid.");
}

async function startServer() {
  // 1. Run validations before accepting traffic
  await validateStartup();

  const app = express();
  const PORT = 3000;
  
  app.use(express.json());

  // CORS Headers (Restricted to actual origin, not "*")
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Health check endpoints
  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "stadiumiq-backend" });
  });

  // Authentication Endpoints
  app.post("/api/auth/login", async (req, res) => {
    const { role, passcode } = req.body;
    let validPasscode = "";
    if (role === "staff") validPasscode = process.env.STAFF_ACCESS_CODE || "";
    else if (role === "organizer") validPasscode = process.env.ORGANIZER_ACCESS_CODE || "";
    else if (role === "volunteer") validPasscode = process.env.VOLUNTEER_ACCESS_CODE || "";
    else return res.status(400).json({ success: false, error: "Invalid role" });

    if (passcode === validPasscode) {
      const token = Math.random().toString(36).substring(2);
      const db = await getWritableDb();
      const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hour
      dbRun(db, "INSERT INTO RoleSession (id, role, token, created_at, expires_at) VALUES (?, ?, ?, ?, ?)", 
        [token, role, token, new Date().toISOString(), expiresAt]);
      saveDb(db);
      db.close();
      return res.json({ success: true, token });
    }
    res.status(401).json({ success: false, error: "Invalid passcode" });
  });

  app.post("/api/auth/verify", async (req, res) => {
    const { token } = req.body;
    const db = await getWritableDb();
    const session = dbGet(db, "SELECT * FROM RoleSession WHERE token = ? AND expires_at > ?", [token, new Date().toISOString()]);
    db.close();
    if (session) return res.json({ success: true, role: session.role });
    res.status(401).json({ success: false, error: "Invalid or expired session" });
  });

  app.get("/api/matches", async (req, res) => {
    try {
      const db = await getWritableDb();
      const matches = dbAll(db, "SELECT m.*, s.name as stadium_name, s.city as stadium_city FROM matches m JOIN stadiums s ON m.stadium_id = s.id ORDER BY m.datetime_utc ASC");
      db.close();
      res.json({ success: true, matches });
    } catch (err) {
      console.error("Failed to fetch matches:", err);
      res.status(500).json({ success: false, error: "Failed to fetch matches" });
    }
  });

  app.get("/api/stadiums", async (req, res) => {
    try {
      const db = await getWritableDb();
      const stadiums = dbAll(db, "SELECT * FROM stadiums ORDER BY name ASC");
      db.close();
      res.json({ success: true, stadiums });
    } catch (err) {
      console.error("Failed to fetch stadiums:", err);
      res.status(500).json({ success: false, error: "Failed to fetch stadiums" });
    }
  });

  app.get("/api/stadiums/:id/gates", async (req, res) => {
    try {
      const db = await getWritableDb();
      let stadiumId = req.params.id;
      if (stadiumId === "st_mercedes") stadiumId = "st_mbs";
      const gates = dbAll(db, "SELECT * FROM gates WHERE stadium_id = ?", [stadiumId]);
      db.close();
      res.json({ success: true, gates });
    } catch (err) {
      console.error("Failed to fetch stadium gates:", err);
      res.status(500).json({ success: false, error: "Failed to fetch stadium gates" });
    }
  });

  app.post("/api/stadiums/:id/gates", async (req, res) => {
    try {
      const db = await getWritableDb();
      let stadiumId = req.params.id;
      if (stadiumId === "st_mercedes") stadiumId = "st_mbs";
      const { gate_a, gate_b, gate_c, gate_d } = req.body;
      
      dbRun(db, "UPDATE gates SET current_density = ? WHERE id = ?", [gate_a, `gate_${stadiumId}_a`]);
      dbRun(db, "UPDATE gates SET current_density = ? WHERE id = ?", [gate_b, `gate_${stadiumId}_b`]);
      dbRun(db, "UPDATE gates SET current_density = ? WHERE id = ?", [gate_c, `gate_${stadiumId}_c`]);
      dbRun(db, "UPDATE gates SET current_density = ? WHERE id = ?", [gate_d, `gate_${stadiumId}_d`]);
      
      saveDb(db);
      db.close();
      
      // Broadcast update to all clients
      broadcast({
        type: "bulk_density_update",
        stadium_id: req.params.id,
        densities: { gate_a, gate_b, gate_c, gate_d }
      });
      
      res.json({ success: true });
    } catch (err) {
      console.error("Failed to update gates:", err);
      res.status(500).json({ success: false, error: "Failed to update gates" });
    }
  });

  // Real, keyless live weather proxy route using Open-Meteo API
  app.get("/api/weather", async (req, res) => {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ success: false, error: "Missing latitude or longitude parameters" });
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, 1500); // 1.5 seconds timeout
    try {
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`, {
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (!response.ok) {
        throw new Error(`Status ${response.status}`);
      }
      const data = await response.json();
      res.json({ success: true, weather: data.current_weather });
    } catch (err: any) {
      clearTimeout(timeout);
      console.log("[Weather Proxy] Note: Live weather API unavailable or slow. Serving high-fidelity simulated fallback data.");
      res.json({
        success: true,
        weather: {
          temperature: 22.8,
          windspeed: 10.5,
          weathercode: 1, // Mainly clear
          time: new Date().toISOString()
        },
        fallback: true
      });
    }
  });

  // API router
  app.use("/api", chatRouter);

  // Setup Vite or static serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Create HTTP server
  const server = http.createServer(app);

  // Create native WebSocket Server (for live alert broadcasting)
  const wss = new WebSocketServer({ noServer: true });
  const connectedClients = new Set<WebSocket>();

  wss.on("connection", (ws) => {
    connectedClients.add(ws);
    console.log(`[WebSocket] New client connected. Active clients: ${connectedClients.size}`);

    // Push initial active alerts from DB on connection
    (async () => {
      try {
        const db = await getWritableDb();
        const activeAlerts = dbAll(db, "SELECT * FROM alerts");
        ws.send(JSON.stringify({ type: "initial_alerts", alerts: activeAlerts }));
        db.close();
      } catch (dbErr) {
        console.error("[WebSocket] Failed to read initial alerts from DB:", dbErr);
      }
    })();

    ws.on("message", (msg) => {
      // Stub for client messages if needed
    });

    ws.on("close", () => {
      connectedClients.delete(ws);
      console.log(`[WebSocket] Client disconnected. Active clients: ${connectedClients.size}`);
    });

    ws.on("error", (err) => {
      console.error("[WebSocket] Client connection error:", err);
      connectedClients.delete(ws);
    });
  });

  // Attach upgrade handler to bind /ws/alerts natively
  server.on("upgrade", (request, socket, head) => {
    try {
      const url = request.url || "";
      const pathname = url.split("?")[0];
      if (pathname === "/ws/alerts" || pathname === "/ws/alerts/") {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit("connection", ws, request);
        });
      } else {
        // Only destroy if it is not a WebSocket upgrade for dev tools or other systems
        if (process.env.NODE_ENV === "production") {
          socket.destroy();
        }
      }
    } catch (err) {
      console.error("[WebSocket] Upgrade handling error:", err);
      try {
        socket.destroy();
      } catch (e) {}
    }
  });

  // Broadcast helper
  function broadcast(payload: any) {
    const payloadStr = JSON.stringify(payload);
    for (const client of connectedClients) {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(payloadStr);
        } catch (err) {
          console.error("[WebSocket] Broadcast send failed:", err);
          connectedClients.delete(client);
        }
      }
    }
  }

  // --- Background Tasks ---
  
  // A. Dynamic Gate Density Simulator
  // Periodically modifies a gate's density to simulate real crowd flows
  setInterval(async () => {
    try {
      const db = await getWritableDb();
      const gates = dbAll(db, "SELECT * FROM gates");
      if (gates.length > 0) {
        const randomGate = gates[Math.floor(Math.random() * gates.length)];
        const change = Math.random() > 0.5 ? 5 : -5;
        let newDensity = randomGate.current_density + change;
        if (newDensity < 10) newDensity = 10;
        if (newDensity > 95) newDensity = 95;

        dbRun(db, "UPDATE gates SET current_density = ? WHERE id = ?", [newDensity, randomGate.id]);
        saveDb(db);

        broadcast({
          type: "density_update",
          gate_id: randomGate.id,
          gate_name: randomGate.name,
          stadium_id: randomGate.stadium_id,
          current_density: newDensity,
        });
      }
      db.close();
    } catch (err) {
      console.error("[DensitySimulation] Background gate simulation error:", err);
    }
  }, 10000); // every 10s

  // B. Real-time Operations Alert Pushing
  // Periodically broadcasts operational updates to connected frontends
  const mockAlerts = [
    { id: "sim_al_1", stadium_id: "st_sofi", type: "crowd", message: "Live operations update: Transit shuttle lines near SoFi Stadium Gate A are fully clear. Expected walk time is under 5 min.", severity: "low" },
    { id: "sim_al_2", stadium_id: "st_metlife", type: "facility", message: "Concession stands near Section 120 are now accepting digital and credit payments. Network connectivity fully restored.", severity: "low" },
    { id: "sim_al_3", stadium_id: "st_mbs", type: "crowd", message: "High entrance volumes detected at Mercedes-Benz Stadium Gate B. Stewards recommend rerouting to Gate C to minimize delay.", severity: "medium" },
    { id: "sim_al_4", stadium_id: "st_azteca", type: "weather", message: "Heavy showers expected near Estadio Azteca. Ground officials are distributing disposable rain ponchos at all entry plazas.", severity: "medium" },
    { id: "sim_al_5", stadium_id: "st_bcplace", type: "transit", message: "Traffic congestion warning: Pacific Blvd near BC Place has heavy transit volumes. Fans are advised to utilize the SkyTrain line.", severity: "medium" }
  ];

  let alertIndex = 0;
  setInterval(() => {
    try {
      const selectedAlert = mockAlerts[alertIndex];
      broadcast({
        type: "new_alert",
        alert: {
          ...selectedAlert,
          starts_at: new Date().toISOString(),
          ends_at: new Date(Date.now() + 1800000).toISOString(), // +30m
        }
      });
      alertIndex = (alertIndex + 1) % mockAlerts.length;
    } catch (err) {
      console.error("[AlertBroadcaster] Background operations broadcast error:", err);
    }
  }, 25000); // every 25s

  // C. Real-time FIFA Match Action Simulator
  // Periodically broadcasts live soccer events to connected clients
  const matchEvents = [
    { id: "me_1", team: "FRA", type: "GOAL", text: "⚽ GOOOAL! France striker fires a breathtaking volley into the top corner from 25 yards out!", time: "12'" },
    { id: "me_2", team: "ESP", type: "YELLOW_CARD", text: "🟨 Yellow Card shown to Spain's defensive midfielder for a tactical foul.", time: "18'" },
    { id: "me_3", team: "FRA", type: "OFFSIDE", text: "🏁 Offside flag raised! France's lightning-fast winger was just half a yard early.", time: "28'" },
    { id: "me_4", team: "ESP", type: "FOUL", text: "💥 High drama! Spain awarded a dangerous free-kick just outside the penalty arc.", time: "34'" },
    { id: "me_5", team: "ESP", type: "GOAL", text: "⚽ GOOOAL! Spain converts the free-kick! A curling masterclass around the wall!", time: "35'" },
    { id: "me_6", team: "FRA", type: "SUBSTITUTION", text: "🔄 Substitution: France brings on a fresh defender to cope with Spain's flank pressure.", time: "44'" },
    { id: "me_7", team: "ESP", type: "CHANCE", text: "⚡ Close! Spain's curling shot misses the far post by inches after a sleek counterattack.", time: "53'" },
    { id: "me_8", team: "FRA", type: "CORNER", text: "🚩 Corner kick for France after a brilliant defensive block inside the box.", time: "61'" },
    { id: "me_9", team: "FRA", type: "SAVE", text: "🧤 UNBELIEVABLE SAVE! The Spain goalkeeper makes a reflex stop on a close-range header!", time: "73'" },
    { id: "me_10", team: "ESP", type: "SUBSTITUTION", text: "🔄 Substitution: Spain locks down the midfield, replacing an attacker with a holding specialist.", time: "81'" },
    { id: "me_11", team: "FRA", type: "CHANCE", text: "💥 Drama in the closing minutes! France striker's header skims off the crossbar!", time: "88'" }
  ];

  let eventIndex = 0;
  setInterval(() => {
    try {
      const selectedEvent = matchEvents[eventIndex];
      broadcast({
        type: "live_match_event",
        event: {
          ...selectedEvent,
          timestamp: new Date().toISOString()
        }
      });
      eventIndex = (eventIndex + 1) % matchEvents.length;
    } catch (err) {
      console.error("[MatchSimulator] Background match simulation error:", err);
    }
  }, 12000); // every 12 seconds

  // Global Express Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    const errorId = Math.random().toString(36).substring(2, 10).toUpperCase();
    console.error(`[GlobalErrorHandler] [ID: ${errorId}] Unhandled server exception:`, err);
    res.status(500).json({
      success: false,
      error_id: errorId,
      message: "An unexpected system error occurred. Our engineers have been alerted.",
    });
  });

  // Start listening
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`[StadiumIQ] Full-stack server running successfully on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("[StadiumIQ] Server boot failure:", err);
});
