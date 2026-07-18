import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { safeDbQuery, dbAll, dbGet } from "./db";

// Lazy initialize the Gemini SDK Client to avoid module-load crashes if API key is not present yet
let aiInstance: GoogleGenAI | null = null;

export function getAiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

// A simple in-memory sliding window rate limiter
const requestTimes: number[] = [];
const RPM_LIMIT = 15; // standard free-tier limit
const WINDOW_MS = 60000;

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Ensures we stay inside free-tier RPM limits by locally delaying requests
 * if we exceed the sliding window limit.
 */
export async function checkRateLimitAndDelay(): Promise<void> {
  const now = Date.now();
  while (requestTimes.length > 0 && requestTimes[0] < now - WINDOW_MS) {
    requestTimes.shift();
  }

  if (requestTimes.length >= RPM_LIMIT) {
    const oldestRequest = requestTimes[0];
    const waitTime = oldestRequest + WINDOW_MS - now;
    console.log(`[RateLimiter] Local rate limit reached (${requestTimes.length}/${RPM_LIMIT}). Delaying request by ${waitTime}ms...`);
    await delay(waitTime);
    return checkRateLimitAndDelay(); // Re-check after waiting
  }

  requestTimes.push(Date.now());
}

// Multi-turn session state in memory
export interface ChatPart {
  text?: string;
  functionResponse?: {
    name: string;
    response: any;
    id?: string;
  };
}

export interface ChatTurn {
  role?: "user" | "model" | string;
  parts: ChatPart[];
}

export interface ChatSession {
  history: ChatTurn[];
}

// Map from session ID to its chat history
export const sessionsStore = new Map<string, ChatSession>();

// Response schema for structured output
export const chatResponseSchema = {
  type: Type.OBJECT,
  properties: {
    answer: {
      type: Type.STRING,
      description: "The detailed plain-language answer to the user's question. Translate this answer fully to the user's selected language.",
    },
    confidence: {
      type: Type.STRING,
      description: "Must be exactly one of 'grounded' (answered from stadium data/tools), 'uncertain' (about the World Cup but missing specific details/unsure), or 'general_knowledge' (general world cup or historical trivia).",
    },
    source_type: {
      type: Type.STRING,
      description: "Must be exactly 'gemini'.",
    },
  },
  required: ["answer", "confidence", "source_type"],
};

// Tool definitions for Gemini function calling
const getMatchScheduleDecl = {
  name: "get_match_schedule",
  description: "Retrieve upcoming matches at World Cup 2026 stadiums. Returns match stage, teams, time, and stadium name.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      team: {
        type: Type.STRING,
        description: "Optional filter for a specific team (e.g. 'USA', 'Mexico', 'Canada').",
      },
    },
  },
};

const getGateDensityDecl = {
  name: "get_gate_density",
  description: "Retrieve crowd density and entry walk times for gates. Useful for routing questions.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      stadium: {
        type: Type.STRING,
        description: "Optional stadium name/ID (e.g., 'MetLife Stadium', 'SoFi Stadium').",
      },
      gate: {
        type: Type.STRING,
        description: "Optional gate letter/name (e.g. 'A', 'B').",
      },
    },
  },
};

const getFacilityInfoDecl = {
  name: "get_facility_info",
  description: "Retrieve locations and descriptions for restrooms, food concessions, first-aid, or wheelchair accessibility.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      stadium: {
        type: Type.STRING,
        description: "Optional stadium name/ID.",
      },
      facility_type: {
        type: Type.STRING,
        description: "The type of facility to search for. Must be 'restroom', 'food', 'wheelchair', or 'first_aid'.",
      },
    },
  },
};

const tools = [
  {
    functionDeclarations: [getMatchScheduleDecl, getGateDensityDecl, getFacilityInfoDecl],
  },
];

// Explicit Safety Settings
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

/**
 * Resolves a function call by executing a query against our local SQLite database.
 */
async function executeFunctionCall(name: string, args: any): Promise<any> {
  console.log(`[Gemini ToolCall] Model requested execution of "${name}" with args:`, args);

  switch (name) {
    case "get_match_schedule": {
      const team = args.team || "";
      const result = await safeDbQuery(async (db) => {
        let query = "SELECT m.*, s.name as stadium_name FROM matches m JOIN stadiums s ON m.stadium_id = s.id";
        const params: any[] = [];
        if (team) {
          query += " WHERE m.home_team LIKE ? OR m.away_team LIKE ?";
          params.push(`%${team}%`, `%${team}%`);
        }
        query += " ORDER BY m.datetime_utc ASC";
        return dbAll(db, query, params);
      });
      return { matches: result || [] };
    }

    case "get_gate_density": {
      const stadium = args.stadium || "";
      const gate = args.gate || "";
      const result = await safeDbQuery(async (db) => {
        let query = "SELECT g.*, s.name as stadium_name FROM gates g JOIN stadiums s ON g.stadium_id = s.id";
        const params: any[] = [];
        let conditions: string[] = [];
        if (stadium) {
          conditions.push("s.name LIKE ?");
          params.push(`%${stadium}%`);
        }
        if (gate) {
          conditions.push("g.name LIKE ?");
          params.push(`%${gate}%`);
        }
        if (conditions.length > 0) {
          query += " WHERE " + conditions.join(" AND ");
        }
        return dbAll(db, query, params);
      });
      return { gates: result || [] };
    }

    case "get_facility_info": {
      const stadium = args.stadium || "";
      const fType = args.facility_type || "";
      const result = await safeDbQuery(async (db) => {
        let query = "SELECT f.*, s.name as stadium_name FROM facilities f JOIN stadiums s ON f.stadium_id = s.id";
        const params: any[] = [];
        let conditions: string[] = [];
        if (stadium) {
          conditions.push("s.name LIKE ?");
          params.push(`%${stadium}%`);
        }
        if (fType) {
          conditions.push("f.type = ?");
          params.push(fType);
        }
        if (conditions.length > 0) {
          query += " WHERE " + conditions.join(" AND ");
        }
        return dbAll(db, query, params);
      });

      // Deduplicate facilities by combining stadium_id and description
      const uniqueFacilities = [];
      const seen = new Set();
      if (result) {
        for (const f of result) {
          const key = `${f.stadium_id}:${f.description.trim().toLowerCase()}`;
          if (!seen.has(key)) {
            seen.add(key);
            uniqueFacilities.push(f);
          }
        }
      }
      return { facilities: uniqueFacilities };
    }

    default:
      console.warn(`[Gemini ToolCall] Unknown function "${name}" requested.`);
      return { error: "Unknown function" };
  }
}

/**
 * Runs a function with exponential backoff on transient errors (429, 503).
 */
async function runWithRetry<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
  let attempt = 1;
  let delayMs = 500;
  while (attempt <= maxAttempts) {
    try {
      return await fn();
    } catch (error: any) {
      const isTransient = error?.status === 429 || error?.status === 503 || 
                          error?.message?.includes("ResourceExhausted") || 
                          error?.message?.includes("ServiceUnavailable");
      if (isTransient && attempt < maxAttempts) {
        console.warn(`[Retry] Transient error on attempt ${attempt}. Retrying in ${delayMs}ms...`, error.message);
        await delay(delayMs);
        delayMs *= 2;
        attempt++;
      } else {
        throw error;
      }
    }
  }
  throw new Error("Max retry attempts reached");
}

/**
 * Low-level call to Gemini model. Manages the function-calling loop.
 */
async function callGemini(model: string, contents: ChatTurn[], locale: string, persona: string = "staff"): Promise<any> {
  let personaCtx = "";
  if (persona === "organizer") {
    personaCtx = "You are currently answering questions from the perspective of a **Tournament Organizer**. Focus on analytical rigor, tournament administration, scheduling, predictive modeling, team statistics, and stadium coordination. Be highly professional, strategic, and detailed.";
  } else if (persona === "volunteer") {
    personaCtx = "You are currently answering questions from the perspective of a **Volunteer Assistant**. Focus on hospitality, spectator guidance, detailed accessibility accommodations (ADA pathways, stroller checks, sensory rooms), ground rules, and welcoming help desk protocols. Be extremely friendly, patient, approachable, and encouraging.";
  } else if (persona === "fan") {
    personaCtx = "You are currently answering questions from the perspective of a **FIFA Fan Companion**. Focus on maximizing the spectator experience with clear, actionable, and highly productive answers. Guide them to exact concession stands, restrooms, and match schedules. If they ask about food, drinks, or tournament merchandise, explicitly suggest specific premium products from the 'Smart Pre-Order' section: 🌭 Classic Stadium Hotdog ($8.50), 🥤 Commemorative FIFA Cup ($6.00), 👕 USA Tournament Jersey ($85.00), or 🧢 FIFA World Cup Cap ($25.00), and let them know they can pre-order them instantly in the 'Smart Pre-Order' widget on this page! When they ask about entry or navigation, proactively recommend less-congested gates (e.g., Gate C instead of Gate A) and give precise step-by-step navigation tips, stadium guidelines, extra-time rules (such as 2 periods of 15m with no golden goal), or restroom locations. Be exceptionally proactive, structured, enthusiastic, and helpful, and use appropriate emojis to guide the reader.";
  } else {
    personaCtx = "You are currently answering questions from the perspective of a **Venue Staff / Operations Officer** inside the StadiumIQ Op-Central. Focus on real-time operational logistics, gate traffic congestion, walk times, emergency protocols, facility status, and incident tracking. Be efficient, precise, direct, and operationally minded.";
  }

  const systemInstruction = `You are StadiumIQ, the official Smart Stadium & Tournament Operations assistant for the FIFA World Cup 2026.
You speak English, Spanish, and French. The user's current language is "${locale}".
You must answer their questions clearly, gracefully, and precisely.

${personaCtx}

If the user asks about match schedules, gate density, routing, facilities, or winning probabilities, you MUST use the provided database tools/functions to look up the real data first!
When calculating or analyzing win probabilities:
1. Query the matches schedule (both completed and scheduled matches).
2. Look at past matches (where status is 'completed' and there are scores) for those teams.
3. Compute a realistic win probability based on those past scores or overall historical data.
4. Explain clearly and elegantly how the probability was calculated (e.g., historical head-to-head records or recent goal averages), breaking down the percentages for Home Team Win, Away Team Win, and Draw/Tie.

Do not make up any stadium, match, gate, or facility statistics.
Always output your final response as a JSON object matching the requested schema.
- "answer": Must be a detailed, fully formatted answer in the selected language (${locale}). Do not use raw markdown hashes (#) for title styling; instead use plain text, bullet points (- or *), or bold text (**) for readability.
- "confidence": MUST be 'grounded' if you queried local stadium tools/database to answer, 'uncertain' if the question is about FIFA World Cup 2026 but you don't have enough information to answer definitively, or 'general_knowledge' for general tournament historical info or non-realtime questions.
- "source_type": Must be 'gemini'.

If you are uncertain or cannot answer the question based on database tools, set confidence to "uncertain" and provide a polite fallback explanation directing them to official sources.`;

  // Work with a deep copy of contents to prevent modifying original history during active tool execution
  const currentTurnContents = [...contents];

  let loopCount = 0;
  const maxLoops = 5;

  while (loopCount < maxLoops) {
    loopCount++;
    console.log(`[Gemini Request] Calling ${model} (turn loop: ${loopCount})...`);

    const response = await getAiClient().models.generateContent({
      model,
      contents: currentTurnContents,
      config: {
        systemInstruction,
        tools,
        safetySettings,
        responseMimeType: "application/json",
        responseSchema: chatResponseSchema,
      },
    });

    const candidate = response.candidates?.[0];

    // Check if the model is asking to call a function
    const functionCalls = response.functionCalls;
    if (functionCalls && functionCalls.length > 0) {
      // Append the model's response (which contains functionCalls) to contents
      currentTurnContents.push(candidate.content as any);

      const functionResponseParts: any[] = [];
      for (const call of functionCalls) {
        const queryResult = await executeFunctionCall(call.name, call.args);
        functionResponseParts.push({
          functionResponse: {
            name: call.name,
            response: queryResult,
            id: call.id,
          },
        });
      }

      // Append the function outputs as a user turn
      currentTurnContents.push({
        role: "user",
        parts: functionResponseParts,
      });

      // Continue the loop to call Gemini with the tool answers
      continue;
    }

    // Check if safety blocked
    if (candidate?.finishReason === "SAFETY") {
      const safetyRefusal = locale === "es"
        ? "Lo siento, no puedo procesar esta solicitud debido a nuestras políticas de seguridad."
        : locale === "fr"
        ? "Désolé, je ne peux pas traiter cette demande en raison de nos politiques de sécurité."
        : "I'm sorry, I cannot process this request due to our safety policies.";

      return {
        answer: safetyRefusal,
        confidence: "uncertain",
        source_type: "gemini",
        safety_blocked: true
      };
    }

    // Return the final text
    if (response.text) {
      try {
        const parsed = JSON.parse(response.text.trim());
        return parsed;
      } catch (e) {
        console.error("[Gemini Response Parser] Failed to parse JSON response:", response.text);
        return {
          answer: response.text,
          confidence: "uncertain",
          source_type: "gemini",
        };
      }
    }

    throw new Error("Empty response received from Gemini");
  }

  throw new Error("Function calling loop exceeded maximum iterations");
}

/**
 * Public function to call Gemini API with model fallback and backoff retries.
 */
export async function executeGeminiChat(contents: ChatTurn[], locale: string = "en", persona: string = "staff"): Promise<any> {
  // Local sliding window rate limiting check
  await checkRateLimitAndDelay();
 
  try {
    // Try primary tier (gemini-3.5-flash) with retries
    const result = await runWithRetry(() => callGemini("gemini-3.5-flash", contents, locale, persona));
    return { ...result, model_tier: "Gemini 3.5 Flash" };
  } catch (error: any) {
    console.warn("[Gemini API] Primary model 'gemini-3.5-flash' failed or exhausted. Attempting fallback 'gemini-3.1-flash-lite'...", error.message);
    try {
      // Try fallback tier (gemini-3.1-flash-lite) with retries
      const result = await runWithRetry(() => callGemini("gemini-3.1-flash-lite", contents, locale, persona));
      return { ...result, model_tier: "Gemini 3.1 Flash Lite (Fallback)" };
    } catch (fallbackError: any) {
      console.error("[Gemini API] Fallback model 'gemini-3.1-flash-lite' failed as well:", fallbackError);
      throw fallbackError; // propagate the total failure up to the API handler
    }
  }
}
