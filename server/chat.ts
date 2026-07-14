import express from "express";
import { executeDecisionEngine } from "./decision_engine";
import { executeGeminiChat, sessionsStore } from "./ai_client";
import { getWritableDb, dbRun, saveDb } from "./db";

/**
 * SECURITY CHECKLIST AUDIT:
 * - Parameterized Queries: All SQLite queries use ? parameterization to prevent SQL injection.
 * - API Key Protection: GEMINI_API_KEY is restricted to process.env on the server.
 * - Input Sanitization: strip HTML tags and cap query lengths at 500 characters.
 * - Origin-Restricted CORS: CORS headers match specific request origins instead of wildcards.
 */

const router = express.Router();

// Define typed interface for chat responses
export interface ChatResponse {
  answer: string;
  confidence: "grounded" | "uncertain" | "general_knowledge" | string;
  source_type: "gemini" | "decision_engine" | "fallback" | "timeout" | string;
  model_tier?: string;
  safety_blocked?: boolean;
}

// Simple in-memory TTL cache (30s)
interface CacheEntry {
  response: ChatResponse;
  expiry: number;
}
const queryCache = new Map<string, CacheEntry>();

function getCache(message: string, locale: string, persona?: string): ChatResponse | null {
  const key = `${locale}:${persona || "staff"}:${message.trim().toLowerCase()}`;
  const entry = queryCache.get(key);
  if (entry && entry.expiry > Date.now()) {
    return entry.response;
  }
  return null;
}

function setCache(message: string, locale: string, response: ChatResponse, persona?: string): void {
  const key = `${locale}:${persona || "staff"}:${message.trim().toLowerCase()}`;
  queryCache.set(key, {
    response,
    expiry: Date.now() + 30000, // 30 seconds TTL
  });
}

/**
 * Pydantic-like input validation & sanitization
 */
function cleanInput(msg: unknown, loc: unknown): { message: string; locale: string } {
  // Strip HTML
  let cleanedMessage = String(msg || "").replace(/<[^>]*>/g, "");
  // Cap length at 500 characters (truncate, do not reject)
  if (cleanedMessage.length > 500) {
    cleanedMessage = cleanedMessage.substring(0, 500);
  }

  // Default unsupported languages to 'en'
  let cleanedLocale = String(loc || "en").toLowerCase().substring(0, 2);
  if (cleanedLocale !== "en" && cleanedLocale !== "es" && cleanedLocale !== "fr") {
    cleanedLocale = "en";
  }

  return { message: cleanedMessage, locale: cleanedLocale };
}

/**
 * Promise timeout helper
 */
function withTimeout<T>(promise: Promise<T>, ms = 12000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("TimeoutError"));
    }, ms);
    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

/**
 * POST /api/chat
 * Handles conversational queries.
 */
router.post("/chat", async (req, res, next) => {
  try {
    const { sessionId, message: rawMessage, locale: rawLocale, persona } = req.body;
    
    // 1. Sanitize input
    const { message, locale } = cleanInput(rawMessage, rawLocale);
    const finalSessionId = String(sessionId || "default_session");
    const activePersona = typeof persona === "string" ? persona : "staff";

    if (!message) {
      return res.status(200).json({
        success: true,
        answer: locale === "es" ? "Por favor escribe un mensaje." : locale === "fr" ? "Veuillez saisir un message." : "Please enter a message.",
        confidence: "uncertain",
        source_type: "fallback",
      });
    }

    // 2. Check Cache
    const cachedResponse = getCache(message, locale, activePersona);
    if (cachedResponse) {
      console.log(`[Cache] Cache hit for query: "${message}" (persona: ${activePersona})`);
      return res.status(200).json({
        success: true,
        ...cachedResponse,
      });
    }

    // 3. Retrieve or initialize chat session history (loaded early to preserve context for multi-turn followups)
    let session = sessionsStore.get(finalSessionId);
    if (!session) {
      session = { history: [] };
      sessionsStore.set(finalSessionId, session);
    }

    // 4. Run Decision Engine (Instant offline classifier)
    const decisionResult = await executeDecisionEngine(message, locale);
    if (decisionResult) {
      // Record this turn in the session history so subsequent open-ended AI turns have full context
      session.history.push({
        role: "user",
        parts: [{ text: message }],
      });
      session.history.push({
        role: "model",
        parts: [{ text: JSON.stringify({ answer: decisionResult.answer, confidence: decisionResult.confidence, source_type: "decision_engine" }) }],
      });
      if (session.history.length > 20) {
        session.history = session.history.slice(-20);
      }

      setCache(message, locale, decisionResult, activePersona);
      
      // Persist log
      const db = await getWritableDb();
      dbRun(db, "INSERT INTO chat_logs (id, session_id, message, response, timestamp) VALUES (?, ?, ?, ?, ?)", 
        [Math.random().toString(36), finalSessionId, message, JSON.stringify(decisionResult), new Date().toISOString()]);
      saveDb(db);
      db.close();
      
      return res.status(200).json({
        success: true,
        ...decisionResult,
      });
    }

    // Append user query to history for Gemini execution
    session.history.push({
      role: "user",
      parts: [{ text: message }],
    });

    // Keep history bounded to avoid bloating context (max 10 turns)
    if (session.history.length > 20) {
      session.history = session.history.slice(-20);
    }

    // 5. Run Deep Gemini Integration wrapped in a 12-second timeout
    try {
      const geminiResult = await withTimeout(executeGeminiChat(session.history, locale, activePersona), 12000);

      // Append model response to history
      session.history.push({
        role: "model",
        parts: [{ text: JSON.stringify(geminiResult) }],
      });

      // Cache and return response
      setCache(message, locale, geminiResult, activePersona);
      
      // Persist log
      const db = await getWritableDb();
      dbRun(db, "INSERT INTO chat_logs (id, session_id, message, response, timestamp) VALUES (?, ?, ?, ?, ?)", 
        [Math.random().toString(36), finalSessionId, message, JSON.stringify(geminiResult), new Date().toISOString()]);
      saveDb(db);
      db.close();

      return res.status(200).json({
        success: true,
        ...geminiResult,
      });

    } catch (err: any) {
      if (err.message === "TimeoutError") {
        console.warn(`[Timeout] Gemini call timed out for: "${message}"`);
        
        const timeoutResponse = {
          answer: locale === "es"
            ? "No tengo una respuesta rápida en este momento. Por favor, consulte los recursos oficiales del torneo o visite el sitio web oficial de la FIFA (https://www.fifa.com) para obtener información en vivo."
            : locale === "fr"
            ? "Je n'ai pas de réponse rapide pour le moment. Veuillez consulter les ressources officielles du tournoi ou visiter le site officiel de la FIFA (https://www.fifa.com) pour des informations en direct."
            : "I don't have a quick answer for that right now. Please refer to our official tournament resources or visit the official FIFA website (https://www.fifa.com) for live information.",
          confidence: "uncertain",
          source_type: "timeout",
        };

        // We do NOT cache timeout results so they can retry
        return res.status(200).json({
          success: true,
          ...timeoutResponse,
        });
      }

      // If it is a real total failure (e.g. invalid API key or both model tiers exhausted),
      // let the error propagate to trigger a 502 Bad Gateway response.
      console.error("[ChatAPI] Hard failure from Gemini integration:", err);
      return res.status(502).json({
        success: false,
        message: "Gemini AI service is currently unavailable.",
      });
    }

  } catch (error) {
    next(error); // Pass to global Express exception handler
  }
});

export default router;
