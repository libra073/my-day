// src/services/ai/reasoningEngine.js
// Structured Deterministic Reasoning, Constraint Validation, Curiosity & Tradeoff Engine.

import { calculateBudget, calculateEstimatedMinimumCost } from "../budgetCalculatorService.js";

/**
 * Identify the single most impactful missing piece of information.
 */
export function evaluateCuriosity(state = {}) {
  const { eventType, budget, guestCount, location } = state;

  if (!eventType) {
    return {
      hasMissingInfo: true,
      missingField: "eventType",
      questionKey: "ASK_EVENT_TYPE",
      promptEn: "What type of event are we planning — wedding, send-off, birthday, or another celebration?",
      promptSw: "Unapanga tukio gani — harusi, send-off, birthday, au sherehe nyingine?"
    };
  }

  if (!budget) {
    const typeName = state.eventType === "wedding" ? "wedding" : state.eventType;
    return {
      hasMissingInfo: true,
      missingField: "budget",
      questionKey: "ASK_BUDGET",
      promptEn: `What target budget do you have in mind for your ${typeName}? (e.g. 500k, 2m, or 10 million TSh)`,
      promptSw: `Umeandaa bajeti ya kiasi gani hivi kwa ajili ya ${state.eventType}? (Mfano: laki 5, milioni 2, au milioni 10)`
    };
  }

  if (!guestCount) {
    return {
      hasMissingInfo: true,
      missingField: "guestCount",
      questionKey: "ASK_GUESTS",
      promptEn: "Roughly how many guests are you expecting to host?",
      promptSw: "Je, unatarajia kualika takriban wageni wangapi?"
    };
  }

  if (!location) {
    return {
      hasMissingInfo: true,
      missingField: "location",
      questionKey: "ASK_LOCATION",
      promptEn: "Which city or region of Tanzania will the event take place in? (e.g. Dar es Salaam, Pwani, Arusha, Mwanza, Dodoma)",
      promptSw: "Sherehe itafanyika katika mji au mkoa gani hapa Tanzania? (Mfano: Dar es Salaam, Pwani, Arusha, Mwanza, Dodoma)"
    };
  }

  return {
    hasMissingInfo: false,
    missingField: null,
    questionKey: null,
    promptEn: null,
    promptSw: null
  };
}

/**
 * Detect constraints and financial/scope conflicts.
 */
export function evaluateConstraints(state = {}) {
  const { eventType = "wedding", budget, guestCount, location = "Dar es Salaam", planType = "balanced", requirements = {} } = state;
  const conflicts = [];
  let calculation = null;

  if (budget) {
    const effectiveGuests = guestCount || 50;
    calculation = calculateBudget({
      eventType,
      guestCount: effectiveGuests,
      totalBudget: budget,
      location,
      planType,
      requirements
    });

    // 1. Budget Shortfall / Deficit Conflict
    if (calculation.shortfall > 0) {
      conflicts.push({
        type: "BUDGET_SHORTFALL",
        severity: calculation.feasibility === "unrealistic" ? "critical" : "warning",
        message: calculation.feasibilityReason,
        shortfall: calculation.shortfall,
        estimatedMinimum: calculation.estimatedMinimum,
        costPerGuest: calculation.costPerGuest,
        cateringPerGuest: calculation.cateringPerGuest
      });
    }

    // 2. High Guest Density Constraint
    if (effectiveGuests >= 200 && calculation.costPerGuest < 8000) {
      conflicts.push({
        type: "HIGH_GUEST_DENSITY",
        severity: "critical",
        message: `High guest count (${effectiveGuests}) with very low per-guest allowance (~TSh ${calculation.costPerGuest.toLocaleString()}/guest). Food and seating alone will strain the budget.`
      });
    }

    // 3. Premium tier requested on tight budget
    if (planType === "premium") {
      const minEst = calculateEstimatedMinimumCost({ eventType, guestCount: effectiveGuests, location, requirements });
      if (budget < minEst * 1.8) {
        conflicts.push({
          type: "INADEQUATE_PREMIUM_BUDGET",
          severity: "warning",
          message: `A true luxury premium event for ${effectiveGuests} guests in ${location} typically requires ~TSh ${Math.round(minEst * 1.8).toLocaleString()}+.`
        });
      }
    }
  }

  return {
    conflicts,
    hasCriticalConflict: conflicts.some(c => c.severity === "critical"),
    calculation
  };
}

/**
 * Handle dynamic reallocation between categories.
 * e.g. "Punguza decoration ongeza chakula" or "Take 100k from transport and put into catering"
 */
export function executeReallocation({
  sourceCategory,
  targetCategory,
  requestedAmount = null,
  currentState = {},
  currentPlan = {}
}) {
  const budget = currentState.budget || 500000;
  const customAllocations = { ...(currentState.customAllocations || {}) };
  const removedServices = Array.isArray(currentState.removedServices) ? [...currentState.removedServices] : [];

  const sourceCat = sourceCategory || "decor";
  const targetCat = targetCategory || "catering";

  // Current amount in source category
  const sourceCurrent = customAllocations[sourceCat] !== undefined
    ? customAllocations[sourceCat]
    : (currentPlan[sourceCat] !== undefined ? currentPlan[sourceCat] : Math.round(budget * 0.10));

  // Determine amount to move: requested amount or default 70% of source allocation
  const transferAmount = requestedAmount !== null && requestedAmount > 0
    ? Math.min(requestedAmount, sourceCurrent)
    : (sourceCurrent > 0 ? Math.round(sourceCurrent * 0.75) : Math.round(budget * 0.08));

  const sourceAfter = Math.max(0, sourceCurrent - transferAmount);
  if (sourceAfter === 0 && !removedServices.includes(sourceCat)) {
    removedServices.push(sourceCat);
  }

  // Current amount in target category
  const targetCurrent = customAllocations[targetCat] !== undefined
    ? customAllocations[targetCat]
    : (currentPlan[targetCat] !== undefined ? currentPlan[targetCat] : Math.round(budget * 0.35));

  const targetAfter = targetCurrent + transferAmount;

  customAllocations[sourceCat] = sourceAfter;
  customAllocations[targetCat] = targetAfter;

  const perGuest = currentState.guestCount ? Math.round(targetAfter / currentState.guestCount) : 0;

  return {
    success: true,
    sourceCategory: sourceCat,
    targetCategory: targetCat,
    transferAmount,
    sourceBefore: sourceCurrent,
    sourceAfter,
    targetBefore: targetCurrent,
    targetAfter,
    perGuestTarget: perGuest,
    updatedCustomAllocations: customAllocations,
    updatedRemovedServices: removedServices
  };
}

/**
 * Generate actionable tradeoffs when budget is insufficient.
 */
export function generateTradeoffs({ calculation, state }) {
  const guests = state.guestCount || 50;
  const budget = state.budget || 0;
  const shortfall = calculation ? calculation.shortfall : 0;
  const options = [];

  if (shortfall > 0 && budget > 0) {
    const affordableGuests = Math.max(10, Math.round(budget / 7500));
    options.push({
      id: "opt-reduce-guests",
      labelEn: `Reduce guest count from ${guests} to ~${affordableGuests} guests`,
      labelSw: `Punguza idadi ya wageni kutoka ${guests} hadi takriban wageni ${affordableGuests}`,
      impactEn: `Brings food & seating baseline into realistic alignment with your TSh ${budget.toLocaleString()} budget`,
      impactSw: `Inafanya gharama ya chakula na viti kuendana na bajeti yako ya TSh ${budget.toLocaleString()}`
    });

    options.push({
      id: "opt-venue-garden",
      labelEn: "Choose a community hall, parish grounds or open garden",
      labelSw: "Tumia ukumbi wa kijamii, eneo la kanisa/msikiti au bustani ya wazi",
      impactEn: "Saves up to TSh 400,000–800,000 compared to commercial banquet ballrooms",
      impactSw: "Inaokoa kati ya TSh 400,000–800,000 ikilinganishwa na kumbi kubwa za hoteli"
    });

    options.push({
      id: "opt-simplify-food",
      labelEn: "Opt for a single-course delicious buffet (Pilau/Biryani feast)",
      labelSw: "Chagua menyu rahisi na tamu ya sahani moja (Pilau au Biryani ya kushibisha)",
      impactEn: "Keeps per-guest catering cost around TSh 4,000–6,000 without sacrificing taste",
      impactSw: "Inabakiza gharama ya chakula kwa mgeni karibu TSh 4,000–6,000 bila kupoteza ubora"
    });

    options.push({
      id: "opt-cut-extras",
      labelEn: "Postpone optional extras (Bridal convoy, celebrity MC, heavy draping)",
      labelSw: "Ondoa huduma za ziada za anasa (Msafara wa magari, MC ghali, mapambo mazito)",
      impactEn: "Frees up funds directly for guests' core hospitality",
      impactSw: "Inaelekeza pesa moja kwa moja kwenye ukarimu wa wageni wako"
    });
  }

  return options;
}

/**
 * Master Reasoning Pipeline
 */
export function runReasoning({
  intentResult = {},
  _parsedInput = {},
  currentState = {},
  currentPlan = {}
}) {
  const curiosity = evaluateCuriosity(currentState);
  const constraintResult = evaluateConstraints(currentState);
  const tradeoffs = generateTradeoffs({ calculation: constraintResult.calculation, state: currentState });

  let reallocationResult = null;
  if (intentResult.intent === "category_reallocation") {
    reallocationResult = executeReallocation({
      sourceCategory: intentResult.meta.from,
      targetCategory: intentResult.meta.to,
      requestedAmount: intentResult.meta.amount,
      currentState,
      currentPlan
    });
  }

  return {
    curiosity,
    constraints: constraintResult,
    tradeoffs,
    reallocation: reallocationResult,
    calculation: constraintResult.calculation
  };
}

export default {
  evaluateCuriosity,
  evaluateConstraints,
  executeReallocation,
  generateTradeoffs,
  runReasoning
};
