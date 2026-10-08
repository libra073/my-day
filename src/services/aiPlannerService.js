// src/services/aiPlannerService.js
// Master AI Planner Orchestrator for MY DAY Tanzania.
// Coordinates Language Parsing, Intent Classification, Structured Reasoning,
// Financial Calculation, Marketplace Vendor Matching, and Response Composition.

import { parseInput } from "./ai/languageParser.js";
import { classifyIntent } from "./ai/intentClassifier.js";
import { runReasoning } from "./ai/reasoningEngine.js";
import { composeResponse } from "./ai/responseComposer.js";
import { generatePlans, calculateBudget, calculateEstimatedMinimumCost } from "./budgetCalculatorService.js";
import { matchVendors } from "./vendorMatcherService.js";

// ---------------------------------------------------------------------------
// Debug mode: set MYDAY_AI_DEBUG=true to enable console diagnostics
// In production, this is always false.
// ---------------------------------------------------------------------------
const DEBUG = typeof process !== "undefined"
  ? process.env.MYDAY_AI_DEBUG === "true"
  : false;

function debugLog(label, data) {
  if (!DEBUG) return;
  console.group(`[MYDAY AI DEBUG] ${label}`);
  console.log(JSON.stringify(data, null, 2));
  console.groupEnd();
}

/**
 * Build a fresh, validated context from parsed entities + previous context.
 * This is the single source of truth for context merging.
 */
function mergeContext(prevContext, detectedEntities, intentResult) {
  const ctx = {
    // Persisted from previous turn
    eventType: prevContext.eventType || "wedding",
    eventDate: prevContext.eventDate || null,
    budget: prevContext.budget || null,
    guestCount: prevContext.guestCount || null,
    location: prevContext.location || null,
    language: prevContext.language || "en",
    planType: prevContext.planType || "balanced",
    requirements: { ...(prevContext.requirements || {}) },
    customAllocations: prevContext.customAllocations ? { ...prevContext.customAllocations } : null,
    removedServices: Array.isArray(prevContext.removedServices) ? [...prevContext.removedServices] : [],
    lastRemoved: prevContext.lastRemoved || null,
    lastTopic: prevContext.lastTopic || null,
    priorities: Array.isArray(prevContext.priorities) ? [...prevContext.priorities] : [],
    // Conversation memory
    lastUserMessage: prevContext.lastUserMessage || null,
    lastAssistantMessage: prevContext.lastAssistantMessage || null,
    lastAssistantQuestion: prevContext.lastAssistantQuestion || null,
    lastSuggestedAction: prevContext.lastSuggestedAction || null,
    pendingAction: prevContext.pendingAction || null,
  };

  // Apply new entities (entities always win over previous stale values for direct fields)
  if (detectedEntities.eventType) ctx.eventType = detectedEntities.eventType;
  if (detectedEntities.date) ctx.eventDate = detectedEntities.date.value;
  if (detectedEntities.budget) ctx.budget = detectedEntities.budget.value;
  if (detectedEntities.location) ctx.location = detectedEntities.location.value;

  // Guest count: respect delta vs absolute
  if (detectedEntities.guests) {
    if (detectedEntities.guests.isDelta) {
      ctx.guestCount = Math.max(1, (prevContext.guestCount || 50) + detectedEntities.guests.deltaValue);
    } else {
      ctx.guestCount = detectedEntities.guests.value;
    }
  }

  // Merge new requirements
  if (detectedEntities.requirements && Object.keys(detectedEntities.requirements).length > 0) {
    ctx.requirements = { ...ctx.requirements, ...detectedEntities.requirements };
  }

  // Merge priorities (de-duplicate)
  if (detectedEntities.priorities && detectedEntities.priorities.length > 0) {
    const merged = new Set([...ctx.priorities, ...detectedEntities.priorities]);
    ctx.priorities = [...merged];
  }

  // Plan type modifications from intent
  if (intentResult.intent === "cheaper_plan") ctx.planType = "budget";
  else if (intentResult.intent === "premium_plan") ctx.planType = "premium";
  else if (intentResult.intent === "balanced_plan") ctx.planType = "balanced";

  // Handle requirement removals from intent
  if (intentResult.intent === "requirement_remove" && intentResult.meta.category) {
    const cat = intentResult.meta.category;
    if (!ctx.removedServices.includes(cat)) ctx.removedServices.push(cat);
    ctx.requirements[cat] = false;
    if (!ctx.customAllocations) ctx.customAllocations = {};
    ctx.customAllocations[cat] = 0;
  }

  // Handle requirement additions from intent
  if (intentResult.intent === "requirement_add" && intentResult.meta.category) {
    const cat = intentResult.meta.category;
    ctx.requirements[cat] = true;
    ctx.removedServices = ctx.removedServices.filter(c => c !== cat);
    if (ctx.customAllocations && ctx.customAllocations[cat] === 0) {
      delete ctx.customAllocations[cat];
    }
  }

  // Handle priority setting
  if (intentResult.intent === "set_priority" && intentResult.meta.priorities) {
    const merged = new Set([...ctx.priorities, ...intentResult.meta.priorities]);
    ctx.priorities = [...merged];
  }

  return ctx;
}

/**
 * Compute the active budget plan from the current context.
 * Returns null if budget is not yet provided.
 */
function computeActivePlan(context) {
  if (!context.budget) return null;
  const effectiveGuests = context.guestCount || 50;
  const effectiveLocation = context.location || "Dar es Salaam";
  const effectiveType = context.eventType || "wedding";

  const allPlans = generatePlans({
    eventType: effectiveType,
    guestCount: effectiveGuests,
    totalBudget: context.budget,
    location: effectiveLocation,
    requirements: context.requirements,
  });

  let currentPlan = allPlans[context.planType] || allPlans["balanced"];
  let computed = { ...currentPlan };

  // Apply custom reallocations
  if (context.customAllocations) {
    computed = { ...computed, ...context.customAllocations };
  }

  // Apply removed services
  if (context.removedServices.length > 0) {
    context.removedServices.forEach(srv => {
      if (computed[srv] !== undefined) computed[srv] = 0;
    });
  }

  const calculation = calculateBudget({
    eventType: effectiveType,
    guestCount: effectiveGuests,
    totalBudget: context.budget,
    location: effectiveLocation,
    planType: context.planType,
    requirements: context.requirements,
  });

  computed._meta = calculation;
  return computed;
}

/**
 * Match vendors for all active categories in the plan.
 */
function computeVendorMatches(context, activePlan) {
  if (!activePlan || !context.budget) return null;

  const defaultCategories = ["venue", "catering", "decor", "decoration", "photography", "entertainment", "transport"];
  const categoriesForMatching = [];

  defaultCategories.forEach(cat => {
    const isExplicitFalse = context.requirements && (
      context.requirements[cat] === false ||
      (cat === "entertainment" && context.removedServices.includes("entertainment"))
    );
    const budgetVal = activePlan[cat] !== undefined ? activePlan[cat] : (cat === "decoration" ? activePlan["decor"] : undefined);
    if (!isExplicitFalse && budgetVal > 0) {
      const key = cat === "decor" ? "decoration" : cat;
      if (!categoriesForMatching.some(c => c.category === key)) {
        categoriesForMatching.push({ category: key, allocatedBudget: budgetVal });
      }
    }
  });

  if (categoriesForMatching.length === 0) return null;

  return matchVendors({
    eventType: context.eventType,
    budget: context.budget,
    guestCount: context.guestCount || 50,
    location: context.location || "Dar es Salaam",
    categories: categoriesForMatching,
  });
}

/**
 * Main Conversational Processor Pipeline
 * @param {Object} prevContext - Current state of the planner session
 * @param {string} userMessage - Raw message typed by the user
 * @returns {Promise<Object>} Structured planning response and state update
 */
export async function processMessage(prevContext = {}, userMessage = "") {
  const cleanInput = (userMessage || "").trim();

  // ── 1. Parse language & entities ──────────────────────────────────────────
  const parsed = parseInput(cleanInput, prevContext);
  const detectedEntities = parsed.entities;

  // ── 2. Classify intent ────────────────────────────────────────────────────
  const intentResult = classifyIntent(cleanInput, detectedEntities, prevContext);

  // ── 3. Merge context ──────────────────────────────────────────────────────
  const context = mergeContext(prevContext, detectedEntities, intentResult);
  context.language = parsed.language || context.language;

  // ── 4. Handle pending action execution ────────────────────────────────────
  // When user says "ndio" and there's a pending action, override intent
  let activeIntent = intentResult;
  if (intentResult.intent === "confirm_pending_action" && intentResult.meta.action) {
    // Execute the pending action by mapping it to the correct intent
    const actionMap = {
      "generate_full_plan": { intent: "generate_full_plan", confidence: 0.99, meta: {} },
      "show_list": { intent: "show_list", confidence: 0.99, meta: {} },
      "recalculate": { intent: "new_plan", confidence: 0.99, meta: {} },
    };
    activeIntent = actionMap[intentResult.meta.action] || intentResult;
    context.pendingAction = null; // Clear after execution
  }

  // ── 5. Compute plan ───────────────────────────────────────────────────────
  let activePlan = computeActivePlan(context);

  // ── 6. Run Reasoning Engine ───────────────────────────────────────────────
  const reasoningResult = runReasoning({
    intentResult: activeIntent,
    _parsedInput: parsed,
    currentState: context,
    currentPlan: activePlan || {}
  });

  // Reallocation result: update allocations and recompute
  if (reasoningResult.reallocation && reasoningResult.reallocation.success) {
    context.customAllocations = reasoningResult.reallocation.updatedCustomAllocations;
    context.removedServices = reasoningResult.reallocation.updatedRemovedServices;
    activePlan = computeActivePlan(context);
  }

  // ── 7. Vendor matching ────────────────────────────────────────────────────
  const vendorMatches = computeVendorMatches(context, activePlan);

  // ── 8. Compose response ───────────────────────────────────────────────────
  const composed = composeResponse({
    intentResult: activeIntent,
    reasoningResult,
    currentState: context,
    language: context.language,
    vendorMatches
  });

  // ── 9. Update conversation memory ─────────────────────────────────────────
  context.lastUserMessage = cleanInput;
  context.lastAssistantMessage = composed.message;

  // Clear pending action if it was just executed
  if (intentResult.intent === "confirm_pending_action") {
    context.pendingAction = null;
    context.lastAssistantQuestion = null;
  }

  // Track what the AI just asked so "ndio" can resolve it
  if (composed.pendingAction) {
    context.pendingAction = composed.pendingAction;
  }
  if (composed.lastAssistantQuestion) {
    context.lastAssistantQuestion = composed.lastAssistantQuestion;
  }

  // Debug output (development only)
  debugLog("Pipeline Result", {
    "language": context.language,
    "intent": activeIntent.intent,
    "confidence": activeIntent.confidence,
    "entities": {
      budget: detectedEntities.budget,
      guests: detectedEntities.guests,
      location: detectedEntities.location,
      eventType: detectedEntities.eventType,
      priorities: detectedEntities.priorities,
    },
    "prevContext_guestCount": prevContext.guestCount,
    "prevContext_budget": prevContext.budget,
    "mergedContext": {
      budget: context.budget,
      guestCount: context.guestCount,
      location: context.location,
      priorities: context.priorities,
    },
    "pendingAction": context.pendingAction,
    "calculationFeasibility": activePlan?._meta?.feasibility,
  });

  return {
    message: composed.message,
    intent: activeIntent.intent,
    updatedContext: context,
    plan: activePlan,
    vendorMatches,
    actions: composed.actions || [],
    language: context.language,
    reasoning: reasoningResult
  };
}

export default {
  processMessage,
  generatePlans,
  calculateBudget,
  calculateEstimatedMinimumCost
};
