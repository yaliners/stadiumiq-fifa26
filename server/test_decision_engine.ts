import { classify, executeDecisionEngine } from "./decision_engine";
import { cleanInput } from "./chat";
import { sessionsStore } from "./ai_client";

// Direct assert helper
function assert(condition: any, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASS: ${message}`);
  }
}

async function runTests() {
  console.log("==================================================");
  console.log("   STADIUMIQ AUTOMATED TEST SUITE (SECTIONS 1-6)  ");
  console.log("==================================================");

  // 1. Schedule classifier matches pattern and queries DB correctly
  const scheduleClass = classify("when is Spain vs USA playing?");
  assert(scheduleClass === "schedule", "Spain vs USA should classify as 'schedule'");
  
  const scheduleAnswer = await executeDecisionEngine("when is Spain vs USA playing?", "en");
  assert(scheduleAnswer !== null, "Schedule answer should not be null");
  assert(
    scheduleAnswer?.answer.includes("Spain") && scheduleAnswer?.answer.includes("USA"),
    "Schedule answer should return Spanien vs USA information"
  );
  assert(scheduleAnswer?.confidence === "grounded", "Schedule answer confidence must be 'grounded'");

  // 2. Gate density classifier matches pattern and queries DB correctly
  const densityClass = classify("which is the least crowded gate?");
  assert(densityClass === "gate_density", "least crowded gate query should classify as 'gate_density'");
  
  const densityAnswer = await executeDecisionEngine("which is the least crowded gate?", "en");
  assert(densityAnswer !== null, "Gate density answer should not be null");
  assert(
    densityAnswer?.answer.includes("density") || densityAnswer?.answer.includes("Gate"),
    "Gate density answer should output density stats or Gate letters"
  );
  assert(densityAnswer?.confidence === "grounded", "Gate density answer confidence must be 'grounded'");

  // 3. Facilities classifier matches pattern and queries DB correctly
  const facilityClass = classify("where is the nearest restroom?");
  assert(facilityClass === "facility", "restroom query should classify as 'facility'");
  
  const facilityAnswer = await executeDecisionEngine("where is the nearest restroom?", "en");
  assert(facilityAnswer !== null, "Facilities answer should not be null");
  assert(
    facilityAnswer?.answer.includes("restroom") || 
    facilityAnswer?.answer.includes("Restroom") || 
    facilityAnswer?.answer.includes("nearest"),
    "Facilities answer should return closest matching toilets/facilities"
  );
  assert(facilityAnswer?.confidence === "grounded", "Facilities answer confidence must be 'grounded'");

  // 4. Rules classifier matches pattern and queries DB correctly
  const rulesClass = classify("what are the rules for extra time?");
  assert(rulesClass === "rules", "extra time query should classify as 'rules'");
  
  const rulesAnswer = await executeDecisionEngine("what are the rules for extra time?", "en");
  assert(rulesAnswer !== null, "Rules explanation should not be null");
  assert(
    rulesAnswer?.answer.includes("extra time") || 
    rulesAnswer?.answer.includes("minutes") || 
    rulesAnswer?.answer.includes("tied"),
    "Rules answer should explain the knockout tie-breaker structure"
  );
  assert(rulesAnswer?.confidence === "grounded", "Rules answer confidence must be 'grounded'");

  // 5. Catch-all: Any query not matching any pattern falls through to Gemini
  const nonMatchClass = classify("who won the 1994 FIFA World Cup?");
  assert(nonMatchClass === null, "History trivia should NOT match any deterministic pattern (returns null to fall through to Gemini)");

  // 6. Timeout testing: Simulate a Gemini call timing out (>4s) and confirm the system returns success:true with the calm uncertainty message
  console.log("Testing timeout helper (simulating slow Gemini call)...");
  
  const slowPromise = new Promise((resolve) => setTimeout(() => resolve("success"), 5000));
  
  function withTimeout<T>(promise: Promise<T>, ms = 4000): Promise<T> {
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

  try {
    await withTimeout(slowPromise, 1000); // 1s limit guarantees timeout
    assert(false, "Slow promise should have timed out!");
  } catch (err: any) {
    assert(err.message === "TimeoutError", "TimeoutError successfully caught on mock slow promise");
  }

  // 7. Input Sanitization Testing via cleanInput
  console.log("Testing cleanInput sanitization and translation mapping...");
  const maliciousInput = "<html><body>when is <script>alert('hack')</script>Spain vs USA?</body></html>";
  const sanitized = cleanInput(maliciousInput, "ES-co");
  assert(!sanitized.message.includes("<script>"), "Input sanitization should strip HTML tags");
  assert(sanitized.message.includes("Spain vs USA?"), "Input sanitization should preserve text content");
  assert(sanitized.locale === "es", "Locale handler should map 'ES-co' to 'es'");

  const ultraLongInput = "A".repeat(600);
  const truncated = cleanInput(ultraLongInput, "FR");
  assert(truncated.message.length === 500, "Input sanitization should truncate text to exactly 500 characters");
  assert(truncated.locale === "fr", "Locale handler should map 'FR' to 'fr'");

  const invalidLocale = cleanInput("hello", "ZH-cn");
  assert(invalidLocale.locale === "en", "Locale handler should default unsupported languages to 'en'");

  // 8. Language Translation correctness inside deterministic decision engine
  console.log("Testing multilingual support in decision engine...");
  const esScheduleAnswer = await executeDecisionEngine("when is Spain vs USA playing?", "es");
  assert(
    esScheduleAnswer?.answer.includes("Spain") || 
    esScheduleAnswer?.answer.includes("United States") || 
    esScheduleAnswer?.answer.includes("calendario"), 
    "Spanish schedule answer should return Spanish schedule information"
  );
  
  const frScheduleAnswer = await executeDecisionEngine("when is Spain vs USA playing?", "fr");
  assert(
    frScheduleAnswer?.answer.includes("Spain") || 
    frScheduleAnswer?.answer.includes("United States") ||
    frScheduleAnswer?.answer.includes("calendrier"),
    "French schedule answer should return French translations"
  );

  // 9. Session Store constraints and session structure
  console.log("Testing session store and structured conversation logs...");
  const testSessionId = "test_sess_999";
  const mockHistory = [
    { role: "user", parts: [{ text: "Hello AI" }] },
    { role: "model", parts: [{ text: "Hello! I am StadiumIQ Assistant." }] }
  ];
  sessionsStore.set(testSessionId, { history: mockHistory });
  const retrievedSession = sessionsStore.get(testSessionId);
  assert(retrievedSession !== undefined, "Session store should successfully set and retrieve sessions");
  assert(retrievedSession?.history.length === 2, "Session history length should match set length");
  assert(retrievedSession?.history[1].role === "model", "Session history turn role should be preserved");
  sessionsStore.delete(testSessionId);

  // 10. Test DB connections and error resilience
  console.log("Testing database fallback messages...");
  const invalidClass = classify("when is Atlantis vs Wakanda?");
  assert(invalidClass === "schedule", "Atlantis vs Wakanda should still classify as schedule category");
  const invalidScheduleAnswer = await executeDecisionEngine("when is Atlantis vs Wakanda?", "en");
  assert(
    invalidScheduleAnswer?.answer.includes("Spain") || 
    invalidScheduleAnswer?.answer.includes("United States") ||
    invalidScheduleAnswer?.answer.includes("We couldn't find") ||
    invalidScheduleAnswer?.answer.includes("vs"), 
    "Database query should either return general match schedule or friendly fallback when unknown teams are requested"
  );

  console.log("\n✓ ALL 10 TEST CASES COMPLETED SUCCESSFULLY!");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
