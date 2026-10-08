// src/services/ai/intentClassifier.js
// Multi-factor Contextual Intent Classifier for MY DAY Tanzanian Event Planning.
// Supports 30+ intent categories, pending-action resolution, and social conversation.

import { parseCategory } from "./languageParser.js";

// ---------------------  Affirmation & Denial Sets  -------------------------
const AFFIRMATIONS = new Set([
  "ndio", "yes", "yap", "yeah", "sure", "ok", "okay", "sawa", "poa",
  "fanya", "endelea", "do it", "go ahead", "fanya hivyo", "safi", "let's do it",
  "sounds good", "basi", "sawa basi", "ndiyo", "yep", "sure thing"
]);

const DENIALS = new Set([
  "hapana", "no", "nope", "la", "siyo", "sitaki", "si hivyo", "badilisha",
  "hapana siyo", "not yet", "nah"
]);

// Social / greeting lexicons
const GREETING_WORDS = new Set([
  "hey", "hello", "hi", "mambo", "kwema", "habari", "jambo", "niaje", "vipi",
  "shikamoo", "good morning", "good afternoon", "good evening", "hujambo",
  "mambo vipi", "uko poa", "upo", "hujambo", "salama", "tumsifu"
]);

const SOCIAL_PHRASES = [
  /^(?:huko|uko)\s*salama[\s?.!]*$/i,
  /^(?:upo\s*salama|uko\s*sawa)[\s?.!]*$/i,
  /^(?:how\s*are\s*you|how'?s\s*(?:it\s*going|things?))[\s?.!]*$/i,
  /^(?:umekuwa\s*(?:aje|vipi))[\s?.!]*$/i,
  /^(?:poa|safi|freshi|fresh|cool)[\s?.!]*$/i,
  /^(?:what'?s\s*up|sup|wassup)[\s?.!]*$/i,
  /^(?:si\s*kitu|sijambo|niko\s*poa|poa\s*kabisa)[\s?.!]*$/i,
];

// Full-plan execution commands
const FULL_PLAN_TRIGGERS = [
  /nipangilie/i, /nipangie/i, /andaa.*kila\s+kitu/i, /niandalie/i,
  /nipe\s+mpango/i, /tengeneza\s+bajeti/i, /nipe\s+breakdown/i,
  /niambie\s+kila\s+kitu/i, /fanya\s+wewe/i, /andaa\s+wewe/i, /andaa\s+mpango/i,
  /plan\s+everything/i, /make\s+the\s+plan/i, /build\s+the\s+budget/i,
  /do\s+everything/i, /pangilia\s+bajeti/i, /pangilia\s+kila\s+kitu/i,
  /fanya\s+(?:yote|kila\s+kitu)/i, /anze\s+kupanga/i, /nipange/i,
  /nipa\s+(?:mpango|orodha|breakdown)/i
];

// Checklist / list request
const LIST_TRIGGERS = [
  /nipe\s+orodha/i, /orodha\s+ni\s+nini/i, /show\s+(?:me\s+)?(?:the\s+)?list/i,
  /nionyeshe\s+orodha/i, /give\s+(?:me\s+)?(?:a\s+)?list/i, /checklist/i,
  /vitu\s+(?:vya\s+)?kufanya/i, /nini\s+kinahitajika/i, /what\s+(?:do\s+i\s+)?need/i
];

// Timeline request
const TIMELINE_TRIGGERS = [
  /timeline/i, /ratiba/i, /mpangilio\s+wa\s+muda/i, /schedule/i, /hatua/i,
  /muda\s+wa\s+(?:kupanga|kufanya)/i, /when\s+should\s+i/i, /when\s+to\s+book/i
];

/**
 * Classify intent from message + parsed entities + conversation state.
 */
export function classifyIntent(text = "", parsedEntities = {}, prevContext = {}) {
  if (!text || typeof text !== "string") return { intent: "unknown", confidence: 0.5, meta: {} };
  const lowered = text.toLowerCase().trim();
  const wordCount = lowered.split(/\s+/).length;
  const { budget, guests, location, eventType, date, requirements } = parsedEntities;

  // ───────────────────────────────────────────────────────────────────────────
  // 1. RESET
  // ───────────────────────────────────────────────────────────────────────────
  if (/^(reset|start over|anza upya|futa kila kitu|reset planner)\b/i.test(lowered)) {
    return { intent: "reset", confidence: 0.99, meta: {} };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 2. SOCIAL CONVERSATION (e.g. "huko salama?", "how are you?")
  // Checked BEFORE greeting so multi-word social questions take precedence
  // ───────────────────────────────────────────────────────────────────────────
  if (SOCIAL_PHRASES.some(p => p.test(lowered)) && !budget && !guests && !eventType) {
    return { intent: "social_conversation", confidence: 0.97, meta: {} };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 3. GREETING (pure greetings, not embedded in longer planning messages)
  // ───────────────────────────────────────────────────────────────────────────
  const isShortMessage = wordCount <= 5;
  if (isShortMessage) {
    // Check greeting word set
    const words = lowered.split(/\s+/);
    const hasGreeting = words.some(w => GREETING_WORDS.has(w));
    if (hasGreeting && !budget && !guests && !eventType) {
      return { intent: "greeting", confidence: 0.98, meta: {} };
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 4. THANKS / APPRECIATION
  // ───────────────────────────────────────────────────────────────────────────
  if (/^(thanks|thank you|asante|shukrani|ahsante|nashukuru|ubarikiwe)\b/i.test(lowered)) {
    return { intent: "thanks", confidence: 0.98, meta: {} };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 5. AFFIRMATION — context-sensitive: resolves pendingAction if one exists
  // ───────────────────────────────────────────────────────────────────────────
  const words = lowered.split(/\s+/);
  const isPureAffirmation = words.every(w => AFFIRMATIONS.has(w)) && wordCount <= 4;
  if (isPureAffirmation) {
    // If there's a pending action from the previous AI message, resolve it
    if (prevContext.pendingAction) {
      return {
        intent: "confirm_pending_action",
        confidence: 0.99,
        meta: { action: prevContext.pendingAction }
      };
    }
    // If the AI last asked a specific question, try to answer it
    if (prevContext.lastAssistantQuestion === "ASK_FULL_PLAN") {
      return { intent: "generate_full_plan", confidence: 0.97, meta: {} };
    }
    if (prevContext.lastAssistantQuestion === "ASK_LIST") {
      return { intent: "show_list", confidence: 0.97, meta: {} };
    }
    return { intent: "confirmation", confidence: 0.95, meta: {} };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 6. DENIAL / REJECTION — may contain a correction value
  // ───────────────────────────────────────────────────────────────────────────
  const isPureDenial = words.every(w => DENIALS.has(w)) && wordCount <= 3;
  if (isPureDenial && !guests && !budget) {
    return { intent: "rejection", confidence: 0.95, meta: {} };
  }

  // "Hapana 23 tu" / "no, actually 80" — denial + correction in one message
  if (/^(?:hapana|no|la|nope)[,\s]/i.test(lowered) && guests) {
    return {
      intent: "guest_correction",
      confidence: 0.99,
      meta: { guests: guests.value, isDelta: false, correctionFromDenial: true }
    };
  }
  if (/^(?:hapana|no|la|nope)[,\s]/i.test(lowered) && budget) {
    return {
      intent: "budget_correction",
      confidence: 0.99,
      meta: { budget: budget.value, correctionFromDenial: true }
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 7. FULL PLAN GENERATION — "andaa kila kitu", "nipangilie", etc.
  // ───────────────────────────────────────────────────────────────────────────
  if (FULL_PLAN_TRIGGERS.some(p => p.test(lowered))) {
    return { intent: "generate_full_plan", confidence: 0.99, meta: {} };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 8. LIST / CHECKLIST REQUEST — "nipe orodha", "show me the list"
  // ───────────────────────────────────────────────────────────────────────────
  if (LIST_TRIGGERS.some(p => p.test(lowered))) {
    return { intent: "show_list", confidence: 0.98, meta: {} };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 9. TIMELINE REQUEST
  // ───────────────────────────────────────────────────────────────────────────
  if (TIMELINE_TRIGGERS.some(p => p.test(lowered))) {
    return { intent: "timeline_question", confidence: 0.96, meta: {} };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 10. CATEGORY REALLOCATION — "Punguza decoration ongeza chakula"
  // ───────────────────────────────────────────────────────────────────────────
  const isReallocationPattern = /(punguza|reduce|remove|ondoa|take|peleka|hamisha|move|give|weka).*?(ongeza|add|put|into|kwenye|kwa)/i.test(lowered);
  if (isReallocationPattern) {
    let fromCat = null;
    let toCat = null;
    const splitMatch = lowered.match(/(.*?)(?:ongeza|add|put|into|kwenye|peleka|hamisha)(.*)/i);
    if (splitMatch) {
      fromCat = parseCategory(splitMatch[1]);
      toCat = parseCategory(splitMatch[2]);
    }
    if (fromCat || toCat) {
      return {
        intent: "category_reallocation",
        confidence: 0.97,
        meta: {
          from: fromCat || "decor",
          to: toCat || "catering",
          amount: budget ? budget.value : null
        }
      };
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 11. PRIORITY SETTING — "food ndio priority", "photography ni muhimu"
  // ───────────────────────────────────────────────────────────────────────────
  const priorityMatch = /(chakula|food|picha|photography|mapambo|decor|venue|ukumbi|entertainment|mc|transport)\s+(?:ndio\s+priority|is\s+(?:the\s+)?priority|ni\s+muhimu|first|kwanza|most\s+important)/i.test(lowered) ||
    /(?:priority|muhimu)\s+(?:ni|is|ya)\s+(chakula|food|picha|photography)/i.test(lowered);
  if (priorityMatch && parsedEntities.priorities && parsedEntities.priorities.length > 0) {
    return {
      intent: "set_priority",
      confidence: 0.96,
      meta: { priorities: parsedEntities.priorities }
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 12. CONTEXT CORRECTIONS — "Actually 150 guests", "badilisha bajeti iwe 1m"
  // ───────────────────────────────────────────────────────────────────────────
  const isCorrectionPhrase = /(actually|badala ya|kumbe|badili|badilisha|siyo|badala yake|make\s+it|iwe|sasa\s+iwe)/i.test(lowered);
  if (isCorrectionPhrase) {
    if (guests !== null) return { intent: "guest_correction", confidence: 0.99, meta: { guests: guests.value } };
    if (budget !== null) return { intent: "budget_correction", confidence: 0.99, meta: { budget: budget.value } };
    if (location !== null) return { intent: "location_correction", confidence: 0.99, meta: { location: location.value } };
    if (eventType !== null) return { intent: "event_correction", confidence: 0.99, meta: { eventType } };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 13. STANDALONE ENTITY CORRECTIONS (when context already has value)
  // ───────────────────────────────────────────────────────────────────────────
  if (guests !== null && prevContext.guestCount && wordCount <= 5 && !lowered.includes("what if") && !lowered.includes("wakiwa")) {
    return { intent: "guest_correction", confidence: 0.94, meta: { guests: guests.value, isDelta: guests.isDelta, deltaValue: guests.deltaValue } };
  }
  if (budget !== null && prevContext.budget && wordCount <= 5 && !lowered.includes("is") && !lowered.includes("inatosha")) {
    return { intent: "budget_correction", confidence: 0.94, meta: { budget: budget.value } };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 14. REQUIREMENT REMOVE — "Sitaki DJ", "Ondoa MC", "No decoration"
  // ───────────────────────────────────────────────────────────────────────────
  if (/(remove|ondoa|sitaki|bila|no need for|cut)\s+(?:the\s+)?(mc|dj|entertainment|muziki|decor|decoration|mapambo|wapambaji|transport|usafiri|photography|photo|picha|venue|ukumbi|kumbi|catering|chakula)/i.test(lowered)) {
    const targetCat = parseCategory(lowered);
    return { intent: "requirement_remove", confidence: 0.96, meta: { category: targetCat } };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 15. REQUIREMENT ADD — "Nataka mpiga picha", "Weka usafiri wa maharusi", "Include MC"
  // ───────────────────────────────────────────────────────────────────────────
  if (/(nataka|weka|include|add|muhimu)\s+(?:the\s+)?(mc|dj|entertainment|muziki|decor|decoration|mapambo|wapambaji|transport|usafiri|photography|photo|picha|venue|ukumbi|kumbi|catering|chakula)/i.test(lowered) && !isReallocationPattern) {
    const targetCat = parseCategory(lowered);
    return { intent: "requirement_add", confidence: 0.95, meta: { category: targetCat } };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 16. AFFORDABILITY / FEASIBILITY CHECK
  // ───────────────────────────────────────────────────────────────────────────
  if (/(naweza\s+kumudu|can\s+i\s+afford|inatosha|inawezekana|is\s*(?:it\s+)?enough|can\s+this\s+work|inafaa|budget\s+inatosha|inatosha\s+kwa)/i.test(lowered)) {
    return {
      intent: "feasibility_check",
      confidence: 0.97,
      meta: { budget: budget ? budget.value : null, guests: guests ? guests.value : null }
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 17. PLAN MODE MODIFIERS
  // ───────────────────────────────────────────────────────────────────────────
  if (/(that'?s\s*too\s*much|too\s*expensive|ghali|hiyo\s*ni\s*kubwa|make\s*it\s*cheaper|punguza\s*bajeti|cheaper|nafuu\s*zaidi|budget\s*saver|budget\s*plan)/i.test(lowered)) {
    return { intent: "cheaper_plan", confidence: 0.96, meta: {} };
  }
  if (/(make\s*it\s*premium|luxury|kifahari|upgrade\s*plan|vip|premium\s*plan|premium\s*wedding)/i.test(lowered)) {
    return { intent: "premium_plan", confidence: 0.96, meta: {} };
  }
  if (/(balanced|mpango\s*wa\s*wastani|wastani|standard\s*plan)/i.test(lowered)) {
    return { intent: "balanced_plan", confidence: 0.95, meta: {} };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 18. CATEGORY-SPECIFIC QUESTIONS
  // ───────────────────────────────────────────────────────────────────────────
  if (/(spend\s*on\s*food|how\s*much\s*(?:for|on)?\s*food|catering\s*cost|chakula\s*nitumie|chakula\s*kiasi\s*gani|na\s*chakula\s*je|vipi\s*chakula|kuhusu\s*chakula|menu|chakula)/i.test(lowered) && /(how|what|kiasi|gani|spend|much|je|vipi)/i.test(lowered)) {
    return { intent: "category_question", confidence: 0.95, meta: { category: "catering" } };
  }
  if (/(what\s*about\s*decor|how\s*much\s*for\s*decor|na\s*decoration\s*je|vipi\s*(?:kuhusu\s*)?mapambo|wapambaji\s*je|gharama\s*za\s*mapambo)/i.test(lowered)) {
    return { intent: "category_question", confidence: 0.95, meta: { category: "decor" } };
  }
  if (/(what\s*about\s*(?:the\s*)?(?:venue|hall)|how\s*much\s*for\s*venue|ukumbi\s*je|kumbi\s*vipi|gharama\s*za\s*ukumbi)/i.test(lowered)) {
    return { intent: "category_question", confidence: 0.95, meta: { category: "venue" } };
  }
  if (/(can\s*i\s*afford\s*(?:a\s*)?photo|what\s*about\s*photograph|how\s*much\s*for\s*photo|naweza\s*kumudu\s*(?:mpiga\s*)?picha|picha\s*na\s*video\s*je|picha\s*je|mpiga\s*picha\s*je|videographer)/i.test(lowered)) {
    return { intent: "category_question", confidence: 0.95, meta: { category: "photography" } };
  }
  if (/(what\s*about\s*(?:mc|dj|entertainment)|how\s*much\s*for\s*mc|mc\s*je|burudani\s*je|muziki\s*vipi)/i.test(lowered)) {
    return { intent: "category_question", confidence: 0.95, meta: { category: "entertainment" } };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 19. VENDOR SEARCH — "find me a photographer", "nipatie caterer"
  // ───────────────────────────────────────────────────────────────────────────
  if (/(?:find|search|get|nipatie|tafuta|nionyeshe|show|recommend|look\s*for)\s*(?:me\s+)?(?:a|an|the|some)?\s*(photographer|photography|photo|picha|venue|kumbi|ukumbi|caterer|catering|food|chakula|decorator|decor|mapambo|wapambaji|mc|dj|entertainment|muziki|car|cars|limo|transport|usafiri|saloon|makeup)/i.test(lowered)) {
    const targetCat = parseCategory(lowered);
    return { intent: "vendor_search", confidence: 0.97, meta: { category: targetCat || "photography" } };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 20. WHAT-IF SCENARIOS
  // ───────────────────────────────────────────────────────────────────────────
  if (/(what\s*if\s*(?:i\s*have)?\s*\d+|wakiwa\s*wageni\s*\d+|nikiongeza\s*wageni|add\s*\d+\s*more\s*guests?|ongeza\s*wageni)/i.test(lowered)) {
    return { intent: "guest_count_provided", confidence: 0.96, meta: { guests: guests ? guests.value : null, isDelta: guests ? guests.isDelta : false } };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 21. FIRST-TIME ENTITY DECLARATIONS (when no prior context)
  // ───────────────────────────────────────────────────────────────────────────
  if (budget !== null && !prevContext.budget && wordCount <= 6) {
    return { intent: "budget_provided", confidence: 0.95, meta: { budget: budget.value } };
  }
  if (guests !== null && !prevContext.guestCount && wordCount <= 5) {
    return { intent: "guest_count_provided", confidence: 0.95, meta: { guests: guests.value, isDelta: guests.isDelta } };
  }
  if (location !== null && !prevContext.location && wordCount <= 4) {
    return { intent: "location_provided", confidence: 0.95, meta: { location: location.value } };
  }
  if (eventType !== null && (!prevContext.eventType || prevContext.eventType === "wedding") && wordCount <= 5) {
    return { intent: "event_type_provided", confidence: 0.95, meta: { eventType } };
  }
  if (date !== null && wordCount <= 5) {
    return { intent: "date_provided", confidence: 0.95, meta: { date: date.value } };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 22. NEW FULL PLAN — broad intent with multiple entities
  // ───────────────────────────────────────────────────────────────────────────
  if ((eventType !== null || /wedding|harusi|birthday|party|sherehe/i.test(lowered)) && (budget !== null || guests !== null || location !== null)) {
    return { intent: "new_plan", confidence: 0.95, meta: {} };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 23. ASK_STATUS — "how's my plan?", "mpango wangu uko vipi?"
  // ───────────────────────────────────────────────────────────────────────────
  if (/(mpango\s+wangu|my\s+plan|plan\s+status|uko\s+vipi\s+mpango|jinsi\s+inavyoenda)/i.test(lowered)) {
    return { intent: "ask_status", confidence: 0.93, meta: {} };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 24. GENERAL CONVERSATION (catch-all)
  // ───────────────────────────────────────────────────────────────────────────
  return { intent: "general_conversation", confidence: 0.70, meta: {} };
}

export default {
  classifyIntent
};
