// tests/aiPlannerIntelligence.test.mjs
// Comprehensive Intelligence Evolution Automated Test Suite for MY DAY AI Planner.

import assert from "node:assert/strict";
import { parseMoney, parseGuests, parseLocation, detectLanguage } from "../src/services/ai/languageParser.js";
import { classifyIntent } from "../src/services/ai/intentClassifier.js";
import { evaluateConstraints, evaluateCuriosity, executeReallocation } from "../src/services/ai/reasoningEngine.js";
import { processMessage } from "../src/services/aiPlannerService.js";
import { calculateBudget } from "../src/services/budgetCalculatorService.js";

console.log("=================================================");
console.log("🧪 RUNNING MY DAY AI INTELLIGENCE TEST SUITE");
console.log("=================================================\n");

let passedCount = 0;
let totalCount = 0;

function test(name, fn) {
  totalCount++;
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`❌ FAIL: ${name}`);
    console.error(err);
  }
}

async function testAsync(name, fn) {
  totalCount++;
  try {
    await fn();
    console.log(`✅ PASS: ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`❌ FAIL: ${name}`);
    console.error(err);
  }
}

// ---------------------------------------------------------------------------
// 1. MONEY PARSING TESTS
// ---------------------------------------------------------------------------
console.log("--- 1. Money Parsing Tests ---");

test("Parses 300k to 300,000", () => {
  const res = parseMoney("My budget is 300k");
  assert.equal(res?.value, 300000);
});

test("Parses laki 3 to 300,000", () => {
  const res = parseMoney("Nina laki 3");
  assert.equal(res?.value, 300000);
});

test("Parses laki tatu to 300,000", () => {
  const res = parseMoney("Bajeti yangu ni laki tatu");
  assert.equal(res?.value, 300000);
});

test("Parses laki tano to 500,000", () => {
  const res = parseMoney("Nimetenga laki tano");
  assert.equal(res?.value, 500000);
});

test("Parses 1.5m to 1,500,000", () => {
  const res = parseMoney("I have 1.5m for this event");
  assert.equal(res?.value, 1500000);
});

test("Parses milioni 2 to 2,000,000", () => {
  const res = parseMoney("Harusi ya milioni 2");
  assert.equal(res?.value, 2000000);
});

test("Parses milioni moja na nusu to 1,500,000", () => {
  const res = parseMoney("Bajeti ni milioni moja na nusu");
  assert.equal(res?.value, 1500000);
});

test("Parses TSh 15,000,000 to 15,000,000", () => {
  const res = parseMoney("Total is TSh 15,000,000");
  assert.equal(res?.value, 15000000);
});

// ---------------------------------------------------------------------------
// 2. GUEST PARSING TESTS
// ---------------------------------------------------------------------------
console.log("\n--- 2. Guest Parsing Tests ---");

test("Parses watu 80", () => {
  const res = parseGuests("Watu 80");
  assert.equal(res?.value, 80);
});

test("Parses watu kama 80 hivi as approximate", () => {
  const res = parseGuests("Watu kama 80 hivi");
  assert.equal(res?.value, 80);
  assert.equal(res?.approximate, true);
});

test("Parses around 100 people as approximate", () => {
  const res = parseGuests("We are hosting around 100 people");
  assert.equal(res?.value, 100);
  assert.equal(res?.approximate, true);
});

test("Parses watu mia moja to 100", () => {
  const res = parseGuests("Watu mia moja");
  assert.equal(res?.value, 100);
});

test("Parses +50 wageni as delta", () => {
  const res = parseGuests("+50 wageni");
  assert.equal(res?.isDelta, true);
  assert.equal(res?.deltaValue, 50);
});

// ---------------------------------------------------------------------------
// 3. LOCATION EXTRACTION TESTS
// ---------------------------------------------------------------------------
console.log("\n--- 3. Location Extraction Tests ---");

const testLocations = [
  { input: "Sherehe itakuwa Dar es Salaam", expected: "Dar es Salaam" },
  { input: "Venue iwe Pwani", expected: "Pwani" },
  { input: "Harusi ya Arusha", expected: "Arusha" },
  { input: "Mwanza Rock City", expected: "Mwanza" },
  { input: "Dodoma mjini", expected: "Dodoma" },
  { input: "Zanzibar beach wedding", expected: "Zanzibar" },
  { input: "Moshi Kilimanjaro", expected: "Kilimanjaro" }
];

testLocations.forEach(({ input, expected }) => {
  test(`Extracts ${expected} from "${input}"`, () => {
    const res = parseLocation(input);
    assert.equal(res?.value, expected);
  });
});

// ---------------------------------------------------------------------------
// 4. LANGUAGE DETECTION TESTS
// ---------------------------------------------------------------------------
console.log("\n--- 4. Language Detection Tests ---");

test("Detects Swahili in 'Nataka harusi ya watu 100 na budget ya 2m'", () => {
  const lang = detectLanguage("Nataka harusi ya watu 100 na budget ya 2m");
  assert.equal(lang, "sw");
});

test("Detects English in 'I want a wedding for 100 guests with a 2m budget'", () => {
  const lang = detectLanguage("I want a wedding for 100 guests with a 2m budget");
  assert.equal(lang, "en");
});

// ---------------------------------------------------------------------------
// 5. INTENT CLASSIFICATION & REALLOCATION TESTS
// ---------------------------------------------------------------------------
console.log("\n--- 5. Intent & Reallocation Tests ---");

test("Classifies 'Punguza decoration ongeza chakula' as category_reallocation", () => {
  const res = classifyIntent("Punguza decoration ongeza chakula", {}, {});
  assert.equal(res.intent, "category_reallocation");
  assert.equal(res.meta.from, "decor");
  assert.equal(res.meta.to, "catering");
});

test("Classifies 'Actually 150 guests' as guest_correction", () => {
  const res = classifyIntent("Actually 150 guests", { guests: { value: 150 } }, { guestCount: 100 });
  assert.equal(res.intent, "guest_correction");
  assert.equal(res.meta.guests, 150);
});

test("Reallocation transfers funds correctly without creating money", () => {
  const res = executeReallocation({
    sourceCategory: "decor",
    targetCategory: "catering",
    requestedAmount: 50000,
    currentState: { budget: 1000000, guestCount: 100 },
    currentPlan: { decor: 140000, catering: 360000 }
  });

  assert.equal(res.success, true);
  assert.equal(res.transferAmount, 50000);
  assert.equal(res.sourceAfter, 90000);
  assert.equal(res.targetAfter, 410000);
});

// ---------------------------------------------------------------------------
// 6. REASONING & CONFLICT DETECTION TESTS
// ---------------------------------------------------------------------------
console.log("\n--- 6. Reasoning & Conflict Detection Tests ---");

test("Detects shortfall for 200 guests with TSh 1,000,000", () => {
  const constraints = evaluateConstraints({
    eventType: "wedding",
    budget: 1000000,
    guestCount: 200,
    location: "Dar es Salaam"
  });

  assert.equal(constraints.hasCriticalConflict, true);
  assert.ok(constraints.calculation.shortfall > 0);
  assert.equal(constraints.calculation.feasibility, "unrealistic");
});

test("Evaluates curiosity: asks location if missing", () => {
  const curiosity = evaluateCuriosity({
    eventType: "wedding",
    budget: 2000000,
    guestCount: 100,
    location: null
  });

  assert.equal(curiosity.hasMissingInfo, true);
  assert.equal(curiosity.missingField, "location");
});

// ---------------------------------------------------------------------------
// 7. END-TO-END PIPELINE ASYNC TESTS
// ---------------------------------------------------------------------------
console.log("\n--- 7. End-to-End Async Pipeline Tests ---");

await testAsync("Multi-turn context retention & correction", async () => {
  // Turn 1: Wedding with 100 guests and 2M
  let step1 = await processMessage({}, "Nataka harusi ya watu 100 Dar na nina milioni 2.");
  assert.equal(step1.updatedContext.eventType, "wedding");
  assert.equal(step1.updatedContext.guestCount, 100);
  assert.equal(step1.updatedContext.budget, 2000000);
  assert.equal(step1.updatedContext.location, "Dar es Salaam");

  // Turn 2: Correction to 150 guests
  let step2 = await processMessage(step1.updatedContext, "Actually 150 guests.");
  assert.equal(step2.updatedContext.guestCount, 150);
  assert.equal(step2.updatedContext.budget, 2000000); // Preserved
  assert.equal(step2.updatedContext.eventType, "wedding"); // Preserved
});

await testAsync("Reallocation in dialogue", async () => {
  let ctx = {
    eventType: "wedding",
    budget: 2000000,
    guestCount: 100,
    location: "Dar es Salaam",
    language: "sw"
  };

  let step = await processMessage(ctx, "Punguza decoration ongeza chakula.");
  assert.equal(step.intent, "category_reallocation");
  assert.ok(step.message.includes("chakula"));
  assert.ok(step.plan.catering > 0);
});

await testAsync("Tight budget honest evaluation", async () => {
  let res = await processMessage({}, "I'm getting married, budget is TSh 300,000 for 50 guests in Dar es Salaam.");
  assert.equal(res.plan._meta.feasibility, "unrealistic");
  assert.ok(res.plan._meta.shortfall > 0);
  assert.ok(res.message.includes("300,000"));
});

console.log("\n=================================================");
console.log(`📊 TEST RESULTS: ${passedCount} / ${totalCount} PASSED`);
console.log("=================================================");

if (passedCount === totalCount) {
  process.exit(0);
} else {
  process.exit(1);
}
