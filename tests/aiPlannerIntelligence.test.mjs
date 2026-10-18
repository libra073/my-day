// tests/aiPlannerIntelligence.test.mjs
// Comprehensive Intelligence Evolution Automated Test Suite for MY DAY AI Planner.

import assert from "node:assert/strict";
import { parseMoney, parseGuests, parseLocation, detectLanguage } from "../src/services/ai/languageParser.js";
import { classifyIntent } from "../src/services/ai/intentClassifier.js";
import { evaluateConstraints, evaluateCuriosity, executeReallocation } from "../src/services/ai/reasoningEngine.js";
import { processMessage } from "../src/services/aiPlannerService.js";
import {
  calculateBudget,
  calculateEstimatedMinimumCost,
  calculateMinimumCostBreakdown,
  getRegionalMultiplier,
  EVENT_SERVICE_SCOPES,
  UNIT_COSTS_PER_GUEST,
  CATEGORY_BASE_MINIMUMS,
} from "../src/services/budgetCalculatorService.js";

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

test("Parses laki moja to 100,000", () => {
  assert.equal(parseMoney("laki moja")?.value, 100000);
});

test("Parses laki mbili to 200,000", () => {
  assert.equal(parseMoney("laki mbili")?.value, 200000);
});

test("Parses laki mbili na nusu to 250,000", () => {
  assert.equal(parseMoney("laki mbili na nusu")?.value, 250000);
});

test("Parses laki 2 na nusu to 250,000", () => {
  assert.equal(parseMoney("laki 2 na nusu")?.value, 250000);
});

test("Parses laki mbili na nusu tu to 250,000", () => {
  assert.equal(parseMoney("laki mbili na nusu tu")?.value, 250000);
});

test("Parses laki mbili na nusu hivi to 250,000", () => {
  assert.equal(parseMoney("laki mbili na nusu hivi")?.value, 250000);
});

test("Parses laki mbili na nusu milioni to 700,000 without multiplier collision", () => {
  assert.equal(parseMoney("laki mbili na nusu milioni")?.value, 700000);
});

test("Parses laki moja na nusu to 150,000", () => {
  assert.equal(parseMoney("laki moja na nusu")?.value, 150000);
});

test("Parses laki moja na sabini to 170,000", () => {
  assert.equal(parseMoney("laki moja na sabini")?.value, 170000);
});

test("Parses laki moja na sabini tu to 170,000 (regression)", () => {
  assert.equal(parseMoney("laki moja na sabini tu")?.value, 170000);
});

test("Parses laki moja na elfu hamsini to 150,000", () => {
  assert.equal(parseMoney("laki moja na elfu hamsini")?.value, 150000);
});

test("Parses milioni mbili na nusu to 2,500,000", () => {
  assert.equal(parseMoney("milioni mbili na nusu")?.value, 2500000);
});

test("Parses elfu hamsini to 50,000", () => {
  assert.equal(parseMoney("elfu hamsini")?.value, 50000);
});

test("Parses elfu sabini na tano to 75,000", () => {
  assert.equal(parseMoney("elfu sabini na tano")?.value, 75000);
});

test("Parses laki mbili na elfu hamsini to 250,000", () => {
  assert.equal(parseMoney("laki mbili na elfu hamsini")?.value, 250000);
});

test("Parses 250k to 250,000", () => {
  assert.equal(parseMoney("250k")?.value, 250000);
});

test("Parses 2.5m to 2,500,000", () => {
  assert.equal(parseMoney("2.5m")?.value, 2500000);
});

test("Parses TSh 250,000 to 250,000", () => {
  assert.equal(parseMoney("TSh 250,000")?.value, 250000);
});

test("Parses 250,000/= to 250,000", () => {
  assert.equal(parseMoney("250,000/=")?.value, 250000);
});

test("Parses 250,000/- to 250,000", () => {
  assert.equal(parseMoney("250,000/-")?.value, 250000);
});

test("Ambiguous or invalid amounts return null rather than fabricating numbers", () => {
  assert.equal(parseMoney("pesa zipo za kutosha"), null);
  assert.equal(parseMoney("nina bajeti nzuri"), null);
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

await testAsync("End-to-End Birthday Party Swahili Money Flow & Correction", async () => {
  // Step 1: User says "birthday party"
  const turn1 = await processMessage({}, "birthday party");
  assert.equal(turn1.updatedContext.eventType, "birthday");
  assert.ok(turn1.message.toLowerCase().includes("budget") || turn1.message.toLowerCase().includes("bajeti"));

  // Step 2: User says "laki 2 na nusu"
  const turn2 = await processMessage(turn1.updatedContext, "laki 2 na nusu");
  assert.equal(turn2.updatedContext.budget, 250000);
  assert.ok(turn2.message.includes("TSh 250,000"));
  assert.ok(turn2.message.includes("bajeti yako ni TSh 250,000"));
  // Feasibility & calculator verify 250,000 is used
  assert.equal(turn2.plan._meta.totalBudget, 250000);
  assert.equal(turn2.plan._meta.allocatedTotal, 250000);

  // Step 3: User corrects the amount to "laki 3"
  const turn3 = await processMessage(turn2.updatedContext, "badilisha bajeti iwe laki 3");
  assert.equal(turn3.updatedContext.budget, 300000);
  assert.ok(turn3.message.includes("TSh 300,000"));

  // Step 4: User specifies guest count "watu 50"
  const turn4 = await processMessage(turn3.updatedContext, "watu 50");
  assert.equal(turn4.updatedContext.guestCount, 50);
  assert.equal(turn4.updatedContext.budget, 300000); // Preserved

  // Step 5: Ambiguous amount does not fabricate values
  const turn5 = await processMessage({}, "sherehe ya birthday, nina bajeti nzuri sana");
  assert.equal(turn5.updatedContext.budget, null); // Not fabricated
});

// ---------------------------------------------------------------------------
// 8. BUDGET ESTIMATION & COST CALCULATION TESTS
// ---------------------------------------------------------------------------
console.log("\n--- 8. Budget Estimation & Cost Calculation Tests ---");

test("Birthday party: 300 guests with TSh 200,000 in Dar es Salaam calculates transparent minimum and shortfall", () => {
  const result = calculateBudget({
    eventType: "birthday",
    guestCount: 300,
    totalBudget: 200000,
    location: "Dar es Salaam",
    requirements: {},
  });

  // Base variable: 300 * (3,500 + 1,200 + 800) = 300 * 5,500 = 1,650,000 TSh
  // Venue and decor are optional/recommended for birthday and not requested -> 0
  // Regional multiplier for Dar es Salaam: 1.15
  // Total minimum: Math.round(1,650,000 * 1.15) = 1,897,500 TSh
  assert.equal(result.estimatedMinimum, 1897500);
  assert.equal(result.costPerGuest, 667);
  assert.equal(result.shortfall, 1897500 - 200000); // 1,697,500
  assert.equal(result.feasibility, "unrealistic");
  assert.equal(result.costBreakdown.variableCosts.food, 300 * 3500);
  assert.equal(result.costBreakdown.variableCosts.drinks, 300 * 1200);
  assert.equal(result.costBreakdown.variableCosts.seating, 300 * 800);
  assert.equal(result.costBreakdown.fixedCosts.venue, 0);
  assert.equal(result.costBreakdown.fixedCosts.decor, 0);
  assert.equal(result.pricingType, "estimated_market_baseline");
});

test("Birthday party: 300 guests with TSh 250,000 in Dar es Salaam (Swahili laki 2 na nusu) feasibility & tradeoff verification", () => {
  const result = calculateBudget({
    eventType: "birthday",
    guestCount: 300,
    totalBudget: 250000,
    location: "Dar es Salaam",
    requirements: {},
  });

  assert.equal(result.estimatedMinimum, 1897500);
  assert.equal(result.costPerGuest, 833);
  assert.equal(result.shortfall, 1897500 - 250000); // 1,647,500
  assert.equal(result.feasibility, "unrealistic");
  assert.ok(result.feasibilityReason.includes("833"));
  assert.ok(result.tradeoffOptions.length >= 3);
  // Realistic guest capacity suggested: 250,000 / (5,500 * 1.15) = ~39 guests
  assert.ok(result.tradeoffOptions.some(opt => opt.includes("39") || opt.includes("wageni")));
});

test("Exact origin of TSh 2,127,500: explicitly requesting venue and decor for 300 guests", () => {
  // When commercial venue (150,000) and decor (50,000) are explicitly requested:
  // Base = (300 * 5,500) + 150,000 + 50,000 = 1,650,000 + 200,000 = 1,850,000 TSh
  // Dar multiplier = 1.15
  // Total = Math.round(1,850,000 * 1.15) = 2,127,500 TSh
  // Shortfall for 200,000 budget = 2,127,500 - 200,000 = 1,927,500 TSh
  const result = calculateBudget({
    eventType: "birthday",
    guestCount: 300,
    totalBudget: 200000,
    location: "Dar es Salaam",
    requirements: { venue: true, decor: true },
  });

  assert.equal(result.estimatedMinimum, 2127500);
  assert.equal(result.shortfall, 1927500);
  assert.equal(result.costBreakdown.fixedCosts.venue, 150000);
  assert.equal(result.costBreakdown.fixedCosts.decor, 50000);
});

test("Event-specific scopes: wedding includes essential venue while birthday does not by default", () => {
  const wedding = calculateMinimumCostBreakdown({
    eventType: "wedding",
    guestCount: 100,
    location: "Dar es Salaam",
    requirements: {},
  });
  // Wedding includes venue fixed cost (150,000)
  assert.equal(wedding.fixedCosts.venue, 150000);
  // (100 * 5,500 + 150,000) * 1.15 = 700,000 * 1.15 = 805,000
  assert.equal(wedding.total, 805000);

  const birthday = calculateMinimumCostBreakdown({
    eventType: "birthday",
    guestCount: 100,
    location: "Dar es Salaam",
    requirements: {},
  });
  // Birthday does NOT include venue fixed cost by default
  assert.equal(birthday.fixedCosts.venue, 0);
  // (100 * 5,500) * 1.15 = 550,000 * 1.15 = 632,500
  assert.equal(birthday.total, 632500);

  assert.notEqual(wedding.total, birthday.total);
});

test("Event-specific scopes: baby shower includes essential decor by default", () => {
  const babyShower = calculateMinimumCostBreakdown({
    eventType: "baby shower",
    guestCount: 50,
    location: "Dar es Salaam",
    requirements: {},
  });
  // Baby shower includes essential decor (50,000) but not venue
  assert.equal(babyShower.fixedCosts.decor, 50000);
  assert.equal(babyShower.fixedCosts.venue, 0);
  // (50 * 5,500 + 50,000) * 1.15 = 325,000 * 1.15 = 373,750
  assert.equal(babyShower.total, 373750);
});

test("Guest count scaling: cost strictly scales with guest count", () => {
  const cost20 = calculateEstimatedMinimumCost({ eventType: "birthday", guestCount: 20, location: "Dar es Salaam" });
  const cost50 = calculateEstimatedMinimumCost({ eventType: "birthday", guestCount: 50, location: "Dar es Salaam" });
  const cost100 = calculateEstimatedMinimumCost({ eventType: "birthday", guestCount: 100, location: "Dar es Salaam" });

  assert.equal(cost20, Math.round(20 * 5500 * 1.15)); // 126,500
  assert.equal(cost50, Math.round(50 * 5500 * 1.15)); // 316,250
  assert.equal(cost100, Math.round(100 * 5500 * 1.15)); // 632,500
  assert.ok(cost100 > cost50 && cost50 > cost20);
});

test("Regional multipliers: verifies regional price adjustments across Tanzania", () => {
  assert.equal(getRegionalMultiplier("Dar es Salaam"), 1.15);
  assert.equal(getRegionalMultiplier("Zanzibar"), 1.20);
  assert.equal(getRegionalMultiplier("Arusha"), 1.10);
  assert.equal(getRegionalMultiplier("Mwanza"), 0.95);
  assert.equal(getRegionalMultiplier("Dodoma"), 0.95);
  assert.equal(getRegionalMultiplier("Mbeya"), 0.90);
  assert.equal(getRegionalMultiplier("Moshi"), 1.00);
  assert.equal(getRegionalMultiplier("Kilimanjaro"), 1.00);
  assert.equal(getRegionalMultiplier("Unknown City"), 1.00);

  // Exact math across regions for 100 guests birthday (base = 550,000 TSh)
  const dar = calculateEstimatedMinimumCost({ eventType: "birthday", guestCount: 100, location: "Dar es Salaam" });
  const zanzibar = calculateEstimatedMinimumCost({ eventType: "birthday", guestCount: 100, location: "Zanzibar" });
  const mbeya = calculateEstimatedMinimumCost({ eventType: "birthday", guestCount: 100, location: "Mbeya" });
  const moshi = calculateEstimatedMinimumCost({ eventType: "birthday", guestCount: 100, location: "Moshi" });

  assert.equal(dar, Math.round(550000 * 1.15)); // 632,500
  assert.equal(zanzibar, Math.round(550000 * 1.20)); // 660,000
  assert.equal(mbeya, Math.round(550000 * 0.90)); // 495,000
  assert.equal(moshi, Math.round(550000 * 1.00)); // 550,000
});

test("Fixed vs variable expenses: removing seating and drinks reduces per-guest cost", () => {
  const standard = calculateMinimumCostBreakdown({
    eventType: "birthday",
    guestCount: 100,
    location: "Moshi", // mult 1.00 for clean unit testing
    requirements: {},
  });
  assert.equal(standard.variableCosts.totalPerGuest, 5500);

  const noSeating = calculateMinimumCostBreakdown({
    eventType: "birthday",
    guestCount: 100,
    location: "Moshi",
    requirements: { seating: false },
  });
  // 5,500 - 800 = 4,700
  assert.equal(noSeating.variableCosts.totalPerGuest, 4700);
  assert.equal(noSeating.total, 470000);

  const bitesOnly = calculateMinimumCostBreakdown({
    eventType: "birthday",
    guestCount: 100,
    location: "Moshi",
    requirements: { cateringType: "bites" },
  });
  // 2,000 (bites) + 1,200 (drinks) + 800 (seating) = 4,000
  assert.equal(bitesOnly.variableCosts.totalPerGuest, 4000);
  assert.equal(bitesOnly.total, 400000);
});

test("Budgets below, equal to, and above minimum cost: verifies feasibility tiers", () => {
  // 100 guests wedding in Dar es Salaam minimum is 805,000
  // Tier 1: Below minimum (deficit >= 30%)
  const unrealistic = calculateBudget({
    eventType: "wedding",
    guestCount: 100,
    totalBudget: 400000,
    location: "Dar es Salaam",
  });
  assert.equal(unrealistic.feasibility, "unrealistic");
  assert.equal(unrealistic.shortfall, 805000 - 400000);

  // Tier 2: Tight (budget covers minimum but < min * 1.25)
  const tight = calculateBudget({
    eventType: "wedding",
    guestCount: 100,
    totalBudget: 850000,
    location: "Dar es Salaam",
  });
  assert.equal(tight.feasibility, "tight");
  assert.equal(tight.shortfall, 0);

  // Tier 3: Balanced
  const balanced = calculateBudget({
    eventType: "wedding",
    guestCount: 100,
    totalBudget: 1500000,
    location: "Dar es Salaam",
  });
  assert.equal(balanced.feasibility, "balanced");
  assert.equal(balanced.shortfall, 0);

  // Tier 4: Surplus (> min * 2.5)
  const surplus = calculateBudget({
    eventType: "wedding",
    guestCount: 100,
    totalBudget: 3000000,
    location: "Dar es Salaam",
  });
  assert.equal(surplus.feasibility, "surplus");
  assert.equal(surplus.shortfall, 0);
});

test("Canonical accounting: allocations + reserve sum exactly to total budget with zero drift", () => {
  const budgets = [250000, 500000, 1000000, 2750000, 5000000, 15000000];
  for (const b of budgets) {
    const res = calculateBudget({
      eventType: "wedding",
      guestCount: 120,
      totalBudget: b,
      location: "Dar es Salaam",
    });
    const sum = Object.values(res.allocation).reduce((acc, val) => acc + val, 0);
    assert.equal(sum, b, `Allocation sum ${sum} must equal total budget ${b}`);
    assert.equal(res.remaining, 0);
  }
});

test("Graceful fallbacks for missing or unavailable parameters", () => {
  const fallback = calculateBudget({
    eventType: null,
    guestCount: 0,
    totalBudget: -500,
    location: "",
  });
  assert.ok(fallback.estimatedMinimum > 0);
  assert.equal(fallback.totalBudget, 0);
  assert.ok(fallback.costPerGuest >= 0);
});

await testAsync("End-to-End Dialogue Consistency: birthday 300 guests on laki 2 na nusu", async () => {
  let ctx = await processMessage({}, "birthday party ya watu 300");
  assert.equal(ctx.updatedContext.eventType, "birthday");
  assert.equal(ctx.updatedContext.guestCount, 300);

  let step2 = await processMessage(ctx.updatedContext, "laki 2 na nusu");
  assert.equal(step2.updatedContext.budget, 250000);
  assert.equal(step2.plan._meta.estimatedMinimum, 1897500);
  assert.equal(step2.plan._meta.shortfall, 1647500);
  assert.equal(step2.plan._meta.costPerGuest, 833);

  // Check AI written response mentions transparent rate and practical alternatives
  assert.ok(step2.message.includes("250,000"));
  assert.ok(step2.message.includes("300"));
  assert.ok(step2.message.includes("1,897,500"));
  assert.ok(step2.message.includes("1,647,500"));
  assert.ok(step2.message.includes("833"));
});

console.log("\n=================================================");
console.log(`📊 TEST RESULTS: ${passedCount} / ${totalCount} PASSED`);
console.log("=================================================");

if (passedCount === totalCount) {
  process.exit(0);
} else {
  process.exit(1);
}
