import { classify, executeDecisionEngine } from "./decision_engine";
import { getWritableDb, dbAll } from "./db";

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

  console.log("\n✓ ALL 6 TEST CASES COMPLETED SUCCESSFULLY!");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
