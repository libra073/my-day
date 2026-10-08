// src/services/ai/responseComposer.js
// Professional Bilingual Response Composer for MY DAY Tanzania.
// Generates natural, varied, non-repetitive responses from structured AI state.

import { TANZANIAN_EVENT_TYPES } from "./eventKnowledge.js";

// ---------------------------------------------------------------------------
// Response variation helpers — prevents "Nimekuelewa!" every time
// ---------------------------------------------------------------------------
const ACK_SW = [
  "Sawa 😊", "Nimepata.", "Aah, nimekupata.", "Hapo sawa.", "Vizuri.", "Got it.",
  "Okay, hiyo inabadilisha mambo.", "Perfect —", "Safi —", "Nzuri —"
];
const ACK_EN = [
  "Got it 👍", "Okay —", "Noted.", "Perfect —", "Sure —", "Alright —",
  "Understood.", "Good to know —", "Right —", "That changes things —"
];

let _ackSwIndex = 0;
let _ackEnIndex = 0;

function nextAck(isSwahili) {
  if (isSwahili) {
    const msg = ACK_SW[_ackSwIndex % ACK_SW.length];
    _ackSwIndex++;
    return msg;
  } else {
    const msg = ACK_EN[_ackEnIndex % ACK_EN.length];
    _ackEnIndex++;
    return msg;
  }
}

// ---------------------------------------------------------------------------
// Format budget as "TSh X,XXX,XXX"
// ---------------------------------------------------------------------------
function fmt(n) {
  return `TSh ${(n || 0).toLocaleString()}`;
}

// ---------------------------------------------------------------------------
// Generate checklist text from event knowledge
// ---------------------------------------------------------------------------
function buildChecklistText(eventType, isSwahili) {
  const ev = TANZANIAN_EVENT_TYPES[eventType || "wedding"];
  if (!ev || !ev.checklist) {
    const fallback = isSwahili
      ? ["Ukumbi", "Catering", "Vinywaji", "Decoration", "MC", "Transport", "Photography", "Saloon", "Akiba ya dharura"]
      : ["Venue", "Catering", "Drinks", "Decoration", "MC", "Transport", "Photography", "Saloon/Makeup", "Emergency reserve"];
    return fallback.map((t, i) => `${i + 1}. ${t}`).join("\n");
  }
  return ev.checklist.map((item, i) => `${i + 1}. ${item.task}`).join("\n");
}

// ---------------------------------------------------------------------------
// Generate timeline text from event knowledge
// ---------------------------------------------------------------------------
function buildTimelineText(eventType, isSwahili) {
  const ev = TANZANIAN_EVENT_TYPES[eventType || "wedding"];
  if (!ev || !ev.timeline) return "";
  return ev.timeline.map(phase =>
    `📅 **${phase.timeframe}**\n${phase.tasks.map(t => `   • ${t}`).join("\n")}`
  ).join("\n\n");
}

// ---------------------------------------------------------------------------
// Generate a full budget plan summary text
// ---------------------------------------------------------------------------
function buildFullPlanText(context, calculation, isSwahili) {
  if (!context.budget) return "";
  const ev = TANZANIAN_EVENT_TYPES[context.eventType || "wedding"];
  const evName = ev ? (isSwahili ? ev.name : ev.id) : (context.eventType || "event");
  const guests = context.guestCount || "?";
  const loc = context.location || (isSwahili ? "Dar es Salaam (muda)" : "Dar es Salaam (provisional)");
  const planLabel = { budget: isSwahili ? "Bajeti Nafuu" : "Budget", balanced: isSwahili ? "Wastani" : "Balanced", premium: isSwahili ? "Kifahari" : "Premium" }[context.planType || "balanced"];
  const locationNote = !context.location
    ? (isSwahili ? "\n_(Location: Dar es Salaam — nitatumia hii kama muda; niambie location yako halisi ikibadilika.)_" : "\n_(Location: Dar es Salaam assumed — tell me your real location to recalibrate.)_")
    : "";

  if (!calculation) {
    return isSwahili
      ? `Sijapata hesabu — hakikisha umeweka bajeti na idadi ya wageni.`
      : `Calculation unavailable — please provide budget and guest count.`;
  }

  const cat = calculation.allocation || {};
  const allocationRows = Object.entries(cat)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => {
      const labels = {
        catering: isSwahili ? "🍽 Chakula na Vinywaji" : "🍽 Food & Catering",
        venue: isSwahili ? "🏛 Ukumbi" : "🏛 Venue",
        decor: isSwahili ? "🎀 Mapambo" : "🎀 Decoration",
        photography: isSwahili ? "📸 Picha na Video" : "📸 Photography & Video",
        entertainment: isSwahili ? "🎤 MC na Burudani" : "🎤 MC & Entertainment",
        transport: isSwahili ? "🚗 Usafiri wa Maharusi" : "🚗 Bridal Transport",
        saloon: isSwahili ? "💄 Saloon na Mapambo ya Mwili" : "💄 Saloon & Makeup",
        misc: isSwahili ? "📦 Miscellaneous" : "📦 Miscellaneous"
      };
      return `${labels[k] || k}: **${fmt(v)}**`;
    }).join("\n");

  const feasibilityIcon = {
    surplus: "✅", balanced: "✅", tight: "⚠️", unrealistic: "❌"
  }[calculation.feasibility || "balanced"] || "✅";

  const statusLine = isSwahili
    ? `${feasibilityIcon} Hali ya bajeti: **${calculation.feasibility || "balanced"}** | Kima cha chini: ${fmt(calculation.estimatedMinimum)}`
    : `${feasibilityIcon} Feasibility: **${calculation.feasibility || "balanced"}** | Min. estimate: ${fmt(calculation.estimatedMinimum)}`;

  const reserveLine = calculation.reserve > 0
    ? (isSwahili ? `💰 Akiba ya dharura: **${fmt(calculation.reserve)}**` : `💰 Emergency reserve: **${fmt(calculation.reserve)}**`)
    : (isSwahili ? `⚠️ Hakuna akiba ya dharura — bajeti imekaaaa!` : `⚠️ No emergency reserve — budget fully allocated.`);

  const shortfallLine = calculation.shortfall > 0
    ? (isSwahili ? `⚠️ Upungufu: **${fmt(calculation.shortfall)}** kulielekeza kima cha chini.` : `⚠️ Shortfall: **${fmt(calculation.shortfall)}** vs. minimum estimate.`)
    : "";

  return [
    isSwahili
      ? `📋 **Mpango wa ${evName} — ${planLabel}**`
      : `📋 **${evName} Plan — ${planLabel}**`,
    `${locationNote}`,
    isSwahili
      ? `👥 Wageni: **${guests}** | 💵 Bajeti: **${fmt(context.budget)}** | (~${fmt(calculation.costPerGuest)}/mgeni)`
      : `👥 Guests: **${guests}** | 💵 Budget: **${fmt(context.budget)}** | (~${fmt(calculation.costPerGuest)}/guest)`,
    "",
    isSwahili ? "**Mgawanyo wa Bajeti:**" : "**Budget Allocation:**",
    allocationRows,
    "",
    statusLine,
    reserveLine,
    shortfallLine,
  ].filter(l => l !== undefined).join("\n");
}

// ---------------------------------------------------------------------------
// Main Response Composer
// ---------------------------------------------------------------------------
export function composeResponse({
  intentResult = {},
  reasoningResult = {},
  currentState = {},
  language = "en",
  vendorMatches = null
}) {
  const isSwahili = language === "sw";
  const { intent, meta } = intentResult;
  const { curiosity, constraints, reallocation, calculation } = reasoningResult;
  const actions = [];
  let message = "";
  let pendingAction = null;
  let lastAssistantQuestion = null;

  const eventLabel = TANZANIAN_EVENT_TYPES[currentState.eventType]
    ? (isSwahili ? TANZANIAN_EVENT_TYPES[currentState.eventType].name : TANZANIAN_EVENT_TYPES[currentState.eventType].id)
    : (currentState.eventType || (isSwahili ? "sherehe" : "event"));

  // ────────────────────────────────────────────────────────────────────────
  // 1. SOCIAL CONVERSATION — "huko salama?", "how are you?"
  // ────────────────────────────────────────────────────────────────────────
  if (intent === "social_conversation") {
    const replies_sw = [
      "Niko salama kabisa 😄 Wewe je? Tukianza kupanga tukio lako leo, nitakusaidia mpaka bajeti iwe wazi!",
      "Poa sana! 😊 Nipo hapa tayari kukusaidia. Unapanga harusi au sherehe gani?",
      "Poa kabisa! 😄 Asante kwa kuuliza. Uko tayari kuanza kupanga? Niambie tukio lako.",
    ];
    const replies_en = [
      "All good, thanks! 😄 Ready to help you plan. What kind of event are you working on?",
      "I'm great, thank you! 😊 Let's get your event planned well. What are we working on today?",
      "Doing well! Ready to help you build a realistic plan. What's the event?",
    ];
    const opts = isSwahili ? replies_sw : replies_en;
    message = opts[Math.floor(Math.random() * opts.length)];
    return { message, actions };
  }

  // ────────────────────────────────────────────────────────────────────────
  // 2. GREETING
  // ────────────────────────────────────────────────────────────────────────
  if (intent === "greeting") {
    const greets_sw = [
      "Mambo 😄 Karibu MY DAY! Uko poa? Unapanga harusi au event gani?",
      "Habari! 😊 Karibu sana MY DAY. Niko hapa kukusaidia kupanga sherehe yako Tanzania. Unaanza na nini?",
      "Jambo! 👋 Karibu. Mimi ni msaidizi wako wa kupanga harusi na sherehe. Unataka kuanza wapi?",
    ];
    const greets_en = [
      "Hello! 👋 Welcome to MY DAY. I'm your event planning assistant for Tanzania. What are we planning today?",
      "Hey there! 😄 Ready to help you plan a smart, realistic event. What's the occasion?",
      "Hi! Welcome to MY DAY. I'll help you build a realistic budget and find verified vendors. What event are we planning?",
    ];
    const opts = isSwahili ? greets_sw : greets_en;
    message = opts[Math.floor(Math.random() * opts.length)];
    return { message, actions };
  }

  // ────────────────────────────────────────────────────────────────────────
  // 3. THANKS
  // ────────────────────────────────────────────────────────────────────────
  if (intent === "thanks") {
    message = isSwahili
      ? "Karibu sana! 😊 Mpango wako upo upande wa kulia. Niambie kama ungependa kurekebisha chochote."
      : "You're welcome! 😊 Your plan is live on the right. Let me know if you need to adjust anything.";
    return { message, actions };
  }

  // ────────────────────────────────────────────────────────────────────────
  // 4. GENERATE FULL PLAN — "andaa kila kitu", "nipangilie"
  // ────────────────────────────────────────────────────────────────────────
  if (intent === "generate_full_plan" || intent === "confirm_pending_action") {
    if (!currentState.budget) {
      message = isSwahili
        ? "Ili niandae mpango kamili, nahitaji kujua bajeti yako kwanza. Umeandaa kiasi gani?"
        : "To build a complete plan, I need your budget first. What's your target budget?";
      lastAssistantQuestion = "ASK_BUDGET";
      return { message, actions, lastAssistantQuestion };
    }

    // Generate full plan text
    const planText = buildFullPlanText(currentState, calculation, isSwahili);
    const checklist = buildChecklistText(currentState.eventType, isSwahili);
    const priorityNote = currentState.priorities && currentState.priorities.length > 0
      ? (isSwahili
          ? `\n\n🎯 **Vipaumbele vyako:** ${currentState.priorities.join(", ")} — tumezingatia katika mgawanyo huu.`
          : `\n\n🎯 **Your priorities:** ${currentState.priorities.join(", ")} — factored into this allocation.`)
      : "";

    // Warn if guest count was assumed
    const guestNote = !currentState.guestCount
      ? (isSwahili
          ? "\n\n_(Nimekisia wageni 50 — niambie idadi halisi ili nifanye hesabu sahihi.)_"
          : "\n\n_(Guest count assumed as 50 — tell me the real number to recalculate.)_")
      : "";

    message = isSwahili
      ? `${planText}${priorityNote}${guestNote}\n\n**Checklist:**\n${checklist}\n\nAngalia kadi upande wa kulia kwa mgawanyo wa kina na watoa huduma halisi!`
      : `${planText}${priorityNote}${guestNote}\n\n**Checklist:**\n${checklist}\n\nCheck the cards on the right for detailed breakdown and verified vendors!`;

    actions.push({ type: "VIEW_BUDGET", label: isSwahili ? "Angalia Mpango" : "View Plan" });
    return { message, actions };
  }

  // ────────────────────────────────────────────────────────────────────────
  // 5. SHOW LIST / CHECKLIST — "nipe orodha"
  // ────────────────────────────────────────────────────────────────────────
  if (intent === "show_list") {
    const checklist = buildChecklistText(currentState.eventType, isSwahili);
    message = isSwahili
      ? `Hii ndiyo checklist yako ya ${eventLabel}:\n\n${checklist}\n\nNiambie kama unataka niongeze au niondoe kitu chochote!`
      : `Here is your ${eventLabel} checklist:\n\n${checklist}\n\nLet me know if you want to add or remove anything!`;
    return { message, actions };
  }

  // ────────────────────────────────────────────────────────────────────────
  // 6. TIMELINE
  // ────────────────────────────────────────────────────────────────────────
  if (intent === "timeline_question") {
    const timeline = buildTimelineText(currentState.eventType, isSwahili);
    message = isSwahili
      ? `Ratiba ya kupanga ${eventLabel} yako:\n\n${timeline || "Ratiba haipatikani kwa aina hii ya sherehe."}`
      : `Planning timeline for your ${eventLabel}:\n\n${timeline || "Timeline not available for this event type."}`;
    return { message, actions };
  }

  // ────────────────────────────────────────────────────────────────────────
  // 7. CATEGORY REALLOCATION — "Punguza decoration ongeza chakula"
  // ────────────────────────────────────────────────────────────────────────
  if (intent === "category_reallocation" && reallocation) {
    const { sourceCategory, targetCategory, transferAmount, targetAfter, perGuestTarget } = reallocation;
    const catLabels = {
      catering: isSwahili ? "chakula na vinywaji" : "food & catering",
      decor: isSwahili ? "mapambo" : "decoration",
      venue: isSwahili ? "ukumbi" : "venue",
      photography: isSwahili ? "picha na video" : "photography",
      entertainment: isSwahili ? "MC na burudani" : "MC & entertainment",
      transport: isSwahili ? "usafiri wa maharusi" : "bridal transport"
    };
    const sLabel = catLabels[sourceCategory] || sourceCategory;
    const tLabel = catLabels[targetCategory] || targetCategory;

    message = isSwahili
      ? `${nextAck(true)} Nimehamisha ${fmt(transferAmount)} kutoka kwa ${sLabel} na kuiweka kwenye ${tLabel} (sasa jumla ya ${tLabel} ni ${fmt(targetAfter)}${perGuestTarget ? `, ~${fmt(perGuestTarget)}/mgeni` : ""}).`
      : `${nextAck(false)} Moved ${fmt(transferAmount)} from ${sLabel} into ${tLabel} (now ${fmt(targetAfter)} total${perGuestTarget ? `, ~${fmt(perGuestTarget)}/guest` : ""}).`;

    actions.push({ type: "VIEW_BUDGET", label: isSwahili ? "Angalia Mgawanyo" : "View Budget Plan" });
    return { message, actions };
  }

  // ────────────────────────────────────────────────────────────────────────
  // 8. PRIORITY SETTING — "food ndio priority"
  // ────────────────────────────────────────────────────────────────────────
  if (intent === "set_priority") {
    const priorities = currentState.priorities || [];
    message = isSwahili
      ? `${nextAck(true)} nimehifadhi kipaumbele chako: **${priorities.join(", ")}**. Mgawanyo wa bajeti utazingatia huduma hizi kwanza.`
      : `${nextAck(false)} saved your priority: **${priorities.join(", ")}**. Budget allocation will favor these services first.`;
    if (curiosity && curiosity.hasMissingInfo) {
      message += `\n\n${isSwahili ? curiosity.promptSw : curiosity.promptEn}`;
    }
    return { message, actions };
  }

  // ────────────────────────────────────────────────────────────────────────
  // 9. GUEST CORRECTION / PROVIDED
  // ────────────────────────────────────────────────────────────────────────
  if (intent === "guest_correction" || intent === "guest_count_provided") {
    const guests = currentState.guestCount || 50;
    const ack = nextAck(isSwahili);
    if (calculation && calculation.shortfall > 0) {
      message = isSwahili
        ? `${ack} wageni ${guests}.\n\nKwa bajeti ya ${fmt(currentState.budget)} huko ${currentState.location || "Dar es Salaam"}, hii inatoa wastani wa ~${fmt(calculation.costPerGuest)}/mgeni — ni finyu sana. Kima cha chini kinachohitajika ni ~${fmt(calculation.estimatedMinimum)} (upungufu wa ~${fmt(calculation.shortfall)}).`
        : `${ack} ${guests} guests.\n\nWith ${fmt(currentState.budget)} in ${currentState.location || "Dar es Salaam"}, that's only ~${fmt(calculation.costPerGuest)}/guest — very tight. Practical minimum is ~${fmt(calculation.estimatedMinimum)} (shortfall: ~${fmt(calculation.shortfall)}).`;
    } else if (calculation) {
      message = isSwahili
        ? `${ack} wageni ${guests} (~${fmt(calculation.costPerGuest)}/mgeni). Mpango wako unabaki imara na akiba ya ${fmt(calculation.reserve)}.`
        : `${ack} ${guests} guests (~${fmt(calculation.costPerGuest)}/guest). Your budget remains solid with a ${fmt(calculation.reserve)} reserve.`;
    } else {
      message = isSwahili ? `${ack} wageni ${guests}.` : `${ack} ${guests} guests.`;
    }
    if (curiosity && curiosity.hasMissingInfo) {
      message += `\n\n${isSwahili ? curiosity.promptSw : curiosity.promptEn}`;
    }
    return { message, actions };
  }

  // ────────────────────────────────────────────────────────────────────────
  // 10. BUDGET CORRECTION / PROVIDED
  // ────────────────────────────────────────────────────────────────────────
  if (intent === "budget_correction" || intent === "budget_provided") {
    const ack = nextAck(isSwahili);
    const fmtBudget = fmt(currentState.budget || 0);
    if (calculation && calculation.shortfall > 0) {
      message = isSwahili
        ? `${ack} bajeti ni ${fmtBudget}.\n\nUkiwa na wageni ${currentState.guestCount || "?"} huko ${currentState.location || "Dar es Salaam"}, hii inatoa wastani wa ~${fmt(calculation.costPerGuest)}/mgeni.\n\nKima cha chini cha kimsingi ni ~${fmt(calculation.estimatedMinimum)} (upungufu wa ~${fmt(calculation.shortfall)}).\n\n💡 Ili kufanikisha kiuhalisia:\n1. Punguza idadi ya wageni hadi ~${Math.round((currentState.budget || 0) / 7500)}\n2. Tumia ukumbi wa kijamii au bustani ya wazi\n3. Andaa menyu rahisi ya pilau/biryani`
        : `${ack} budget is ${fmtBudget}.\n\nWith ${currentState.guestCount || "?"} guests in ${currentState.location || "Dar es Salaam"}, that's ~${fmt(calculation.costPerGuest)}/guest.\n\nPractical minimum is ~${fmt(calculation.estimatedMinimum)} (shortfall: ~${fmt(calculation.shortfall)}).\n\n💡 To make it work:\n1. Reduce guests to ~${Math.round((currentState.budget || 0) / 7500)}\n2. Use a community hall or open garden\n3. Opt for a simple pilau/biryani buffet`;
    } else if (calculation) {
      message = isSwahili
        ? `${ack} bajeti ni ${fmtBudget} (~${fmt(calculation.costPerGuest)}/mgeni kwa wageni ${currentState.guestCount || 50}). Mpango imara — akiba ya dharura: ${fmt(calculation.reserve)}.`
        : `${ack} budget is ${fmtBudget} (~${fmt(calculation.costPerGuest)}/guest for ${currentState.guestCount || 50} guests). Solid plan — ${fmt(calculation.reserve)} reserve.`;
    } else {
      message = isSwahili ? `${ack} bajeti ni ${fmtBudget}.` : `${ack} budget is ${fmtBudget}.`;
    }
    if (curiosity && curiosity.hasMissingInfo) {
      message += `\n\n${isSwahili ? curiosity.promptSw : curiosity.promptEn}`;
    }
    return { message, actions };
  }

  // ────────────────────────────────────────────────────────────────────────
  // 11. LOCATION PROVIDED / CORRECTION
  // ────────────────────────────────────────────────────────────────────────
  if (intent === "location_correction" || intent === "location_provided") {
    message = isSwahili
      ? `${nextAck(true)} eneo la sherehe ni ${currentState.location}. Makadirio na watoa huduma wamerekebishwa.`
      : `${nextAck(false)} event location is ${currentState.location}. Pricing and vendor matches updated accordingly.`;
    if (curiosity && curiosity.hasMissingInfo) {
      message += `\n\n${isSwahili ? curiosity.promptSw : curiosity.promptEn}`;
    }
    return { message, actions };
  }

  // ────────────────────────────────────────────────────────────────────────
  // 12. AFFORDABILITY / FEASIBILITY CHECK — "naweza kumudu photographer?"
  // ────────────────────────────────────────────────────────────────────────
  if (intent === "feasibility_check") {
    const cat = meta && meta.category ? meta.category : null;
    if (cat === "photography" || /photo|picha|photographer|mpiga picha/i.test(currentState.lastUserMessage || "")) {
      if (calculation) {
        const photoAlloc = calculation.allocation?.photography || Math.round((currentState.budget || 0) * 0.10);
        const canAfford = photoAlloc >= 150000;
        message = isSwahili
          ? `Kwa bajeti yako ya ${fmt(currentState.budget)} na wageni ${currentState.guestCount || "?"}:\n\nTumetenga ~${fmt(photoAlloc)} kwa picha na video.\n\n${canAfford
              ? "✅ Kiasi hiki kinatosha kupata mpiga picha mzuri wa kidijitali Tanzania. Matarajiwa: TSh 150,000–350,000 kwa siku nzima."
              : "⚠️ Kiasi hiki ni kidogo kwa mpiga picha wa kitaalamu. Punguza kategoria nyingine (mfano mapambo) ili kuongeza picha, au tumia mpiga picha wa freelance."}`
          : `With your ${fmt(currentState.budget)} budget and ${currentState.guestCount || "?"} guests:\n\nPhotography is allocated ~${fmt(photoAlloc)}.\n\n${canAfford
              ? "✅ This is enough for a solid professional photographer in Tanzania (TSh 150,000–350,000 for full day)."
              : "⚠️ This is tight for professional photography. Consider reducing decor or another category to fund photography properly, or go with a freelance photographer."}`;
      } else {
        message = isSwahili
          ? "Ili nikuambie kama unaweza kumudu mpiga picha, nahitaji kujua bajeti yako kamili. Umeandaa kiasi gani?"
          : "To check if you can afford a photographer, I need your full budget. What's your target budget?";
      }
    } else if (calculation && calculation.shortfall > 0) {
      message = isSwahili
        ? `Ukweli wa kitaalamu: ${fmt(currentState.budget)} kwa wageni ${currentState.guestCount} huko ${currentState.location || "Dar es Salaam"} (~${fmt(calculation.costPerGuest)}/mgeni) ina upungufu wa ~${fmt(calculation.shortfall)} kufikia kima cha chini cha uhalisia (${fmt(calculation.estimatedMinimum)}).\n\nInaweza kufanya kazi ONLY kama:\n1. Kupunguza wageni hadi ~${Math.round((currentState.budget || 0) / 7500)}\n2. Kutumia ukumbi wa bure/wazi\n3. Kuondoa huduma za ziada.`
        : `Honestly: ${fmt(currentState.budget)} for ${currentState.guestCount} guests in ${currentState.location || "Dar es Salaam"} (~${fmt(calculation.costPerGuest)}/guest) has a ~${fmt(calculation.shortfall)} shortfall vs. the practical minimum of ${fmt(calculation.estimatedMinimum)}.\n\nIt can only work if:\n1. Guests reduced to ~${Math.round((currentState.budget || 0) / 7500)}\n2. Using a free/open venue\n3. Cutting non-essential extras.`;
    } else if (calculation) {
      message = isSwahili
        ? `Ndio! ${fmt(currentState.budget)} kwa wageni ${currentState.guestCount} huko ${currentState.location || "Dar es Salaam"} (~${fmt(calculation.costPerGuest)}/mgeni) inatosha vizuri na inakupa akiba ya ${fmt(calculation.reserve)}.`
        : `Yes! ${fmt(currentState.budget)} for ${currentState.guestCount} guests in ${currentState.location || "Dar es Salaam"} (~${fmt(calculation.costPerGuest)}/guest) is realistic and leaves a ${fmt(calculation.reserve)} reserve.`;
    } else {
      message = isSwahili
        ? "Nitaji bajeti yako na idadi ya wageni ili niweze kukuambia."
        : "I need your budget and guest count to give you a proper assessment.";
    }
    return { message, actions };
  }

  // ────────────────────────────────────────────────────────────────────────
  // 13. PLAN MODES
  // ────────────────────────────────────────────────────────────────────────
  if (intent === "cheaper_plan") {
    message = isSwahili
      ? "Nimebadili mpango kuwa **Bajeti Nafuu** 👍 Tumepunguza mapambo na huduma za anasa kulinda mahitaji makuu ya chakula na ukumbi. Angalia mgawanyo mpya upande wa kulia."
      : "Switched to **Budget Plan** 👍 Scaled back decor and non-essentials to protect core catering and venue. Check the updated breakdown on the right.";
    actions.push({ type: "CHANGE_PLAN", value: "budget", label: isSwahili ? "Bajeti Nafuu" : "Budget Plan" });
    return { message, actions };
  }
  if (intent === "premium_plan") {
    const minEst = calculation ? calculation.estimatedMinimum : 500000;
    const hasConflict = constraints && constraints.conflicts && constraints.conflicts.some(c => c.type === "INADEQUATE_PREMIUM_BUDGET");
    message = hasConflict
      ? (isSwahili
          ? `Mpango wa Kifahari kwa wageni ${currentState.guestCount || 50} huko ${currentState.location || "Dar es Salaam"} unahitaji angalau **${fmt(Math.round(minEst * 1.8))}**.\n\nKwa bajeti yako ya sasa ya ${fmt(currentState.budget)}, siwezi kudai ni ya kifahari — lakini nimekupanga bora zaidi inayowezekana ndani ya kiasi chako.`
          : `A true Premium plan for ${currentState.guestCount || 50} guests in ${currentState.location || "Dar es Salaam"} needs at least **${fmt(Math.round(minEst * 1.8))}**.\n\nAt your ${fmt(currentState.budget)} budget I won't pretend it's luxury, but I've maxed your quality within your means.`)
      : (isSwahili
          ? "Imebadilishwa! ✨ Mpango wa **Kifahari** — tumeimarisha mapambo ya kisasa, kumbi za hadhi na huduma kamili za picha/video."
          : "Upgraded! ✨ **Premium** mode — enhanced décor, high-tier venues, and full media coverage allocated.");
    actions.push({ type: "CHANGE_PLAN", value: "premium", label: isSwahili ? "Mpango wa Kifahari" : "Premium Plan" });
    return { message, actions };
  }
  if (intent === "balanced_plan") {
    message = isSwahili
      ? "Imebadilishwa kuwa mpango wa **Wastani** — usawa mzuri kati ya ubora na bei."
      : "Switched to **Balanced** plan — good quality across all categories at a sensible price.";
    return { message, actions };
  }

  // ────────────────────────────────────────────────────────────────────────
  // 14. CATEGORY QUESTIONS
  // ────────────────────────────────────────────────────────────────────────
  if (intent === "category_question") {
    const cat = meta.category || "catering";
    const budget = currentState.budget || 500000;
    const guests = currentState.guestCount || 50;

    if (cat === "catering") {
      const foodAlloc = calculation ? calculation.allocation?.catering : Math.round(budget * 0.36);
      const perGuest = foodAlloc ? Math.round(foodAlloc / guests) : 0;
      message = isSwahili
        ? `Ukiwa na wageni ${guests} na bajeti ya ${fmt(budget)} huko ${currentState.location || "Dar es Salaam"}:\n\nChakula na vinywaji: ~**${fmt(foodAlloc)}** (~**${fmt(perGuest)}/mgeni**).\n\n💡 ${perGuest < 5000 ? "Kwa kiwango hiki, tunashauri menyu ya sahani moja ya pilau/biryani na mpishi binafsi." : "Kiasi hiki kinatosha menyu nzuri ya nyama na kuku pamoja na vinywaji baridi."}`
        : `For ${guests} guests with ${fmt(budget)} in ${currentState.location || "Dar es Salaam"}:\n\nFood & drinks: ~**${fmt(foodAlloc)}** (~**${fmt(perGuest)}/guest**).\n\n💡 ${perGuest < 5000 ? "At this tight per-guest amount, go for a hearty single-course buffet (pilau/biryani) with an independent caterer." : "This covers a solid 2-meat buffet with sides and soft drinks."}`;
    } else if (cat === "photography") {
      const photoAlloc = calculation ? calculation.allocation?.photography : Math.round(budget * 0.10);
      const canAfford = (photoAlloc || 0) >= 150000;
      message = isSwahili
        ? `Kwa picha na video: ~**${fmt(photoAlloc)}** kimetengwa.\n\n💡 ${canAfford ? "Kiasi hiki kinatosha mpiga picha mmoja wa kitaalamu Tanzania (TSh 150k–350k/siku)." : "Kiasi ni kidogo — punguza mapambo ili kuongeza picha, au tumia mpiga picha wa freelance."}`
        : `For photography: ~**${fmt(photoAlloc)}** allocated.\n\n💡 ${canAfford ? "Enough for a solid solo professional photographer in Tanzania (TSh 150k–350k/day)." : "Tight — consider reducing decor to fund photography, or go freelance."}`;
    } else if (cat === "decor") {
      const decorAlloc = calculation ? calculation.allocation?.decor : Math.round(budget * 0.14);
      message = isSwahili
        ? `Kwa mapambo: ~**${fmt(decorAlloc)}** kimetengwa.\n\n💡 Kwa wageni ${guests}, kiasi hiki kinafaa vitambaa safi vya meza, urembo wa meza kuu na taa za msingi.`
        : `For decoration: ~**${fmt(decorAlloc)}** allocated.\n\n💡 For ${guests} guests, this covers elegant table dressings, head table backdrop, and neat lighting.`;
    } else if (cat === "venue") {
      const venueAlloc = calculation ? calculation.allocation?.venue : Math.round(budget * 0.26);
      message = isSwahili
        ? `Kwa ukumbi huko ${currentState.location || "Dar es Salaam"}: ~**${fmt(venueAlloc)}** kimetengwa.\n\n💡 ${(venueAlloc || 0) < 300000 ? "Kwa kiasi hiki, tumia kumbi za kijamii au bustani ya wazi." : "Inatosha ukumbi mzuri wenye viyoyozi, viti, meza na jenereta."}`
        : `For venue in ${currentState.location || "Dar es Salaam"}: ~**${fmt(venueAlloc)}** allocated.\n\n💡 ${(venueAlloc || 0) < 300000 ? "At this level, go for a community hall or open garden." : "This covers a comfortable air-conditioned hall with parking and a generator."}`;
    } else {
      const entAlloc = calculation ? calculation.allocation?.entertainment : Math.round(budget * 0.08);
      message = isSwahili
        ? `Kwa MC na burudani: ~**${fmt(entAlloc)}** kimetengwa kwa ajili ya MC mahiri na mfumo mzuri wa sauti.`
        : `For MC & entertainment: ~**${fmt(entAlloc)}** allocated for a bilingual MC and sound setup.`;
    }
    return { message, actions };
  }

  // ────────────────────────────────────────────────────────────────────────
  // 15. VENDOR SEARCH
  // ────────────────────────────────────────────────────────────────────────
  if (intent === "vendor_search") {
    const cat = meta.category || "photography";
    if (vendorMatches && vendorMatches.categories && vendorMatches.categories.length > 0) {
      const matchCat = vendorMatches.categories.find(c => c.category === cat || (cat === "photography" && c.category === "photography"));
      if (matchCat && matchCat.matches.length > 0) {
        let vendorText = "";
        matchCat.matches.slice(0, 2).forEach(v => {
          vendorText += `\n• **${v.name}** (${v.provider.location}) — ${v.provider.rating}★\n  ${fmt(v.price)}`;
        });
        message = isSwahili
          ? `Hawa hapa watoa huduma halisi kutoka sokoni:${vendorText}\n\nUnaweza kuona wasifu wao au kuweka nafasi kupitia kadi upande wa kulia!`
          : `Here are real verified providers from our marketplace:${vendorText}\n\nCheck their profile or book from the card on the right!`;
        return { message, actions };
      }
    }
    message = isSwahili
      ? `Nimetafuta watoa huduma wa ${cat}. Angalia kadi ya watoa huduma upande wa kulia!`
      : `Checked for available ${cat} providers. See the Vendor Matches card on the right!`;
    return { message, actions };
  }

  // ────────────────────────────────────────────────────────────────────────
  // 16. CONFIRMATION (generic "ndio" with no pending action)
  // ────────────────────────────────────────────────────────────────────────
  if (intent === "confirmation") {
    if (curiosity && curiosity.hasMissingInfo) {
      message = isSwahili ? curiosity.promptSw : curiosity.promptEn;
    } else {
      message = isSwahili
        ? "Safi! Mpango wako upo upande wa kulia. Niambie kama unataka kubadilisha kategoria yoyote au kuangalia watoa huduma."
        : "Perfect! Your plan is live on the right. Let me know if you want to adjust any category or explore providers.";
    }
    return { message, actions };
  }

  // ────────────────────────────────────────────────────────────────────────
  // 17. REJECTION
  // ────────────────────────────────────────────────────────────────────────
  if (intent === "rejection") {
    message = isSwahili
      ? "Pia sawa 👍 Ungependa kubadilisha kiasi gani — bajeti, idadi ya wageni, au huduma fulani?"
      : "Fair enough 👍 What would you like to adjust — the budget, guest count, or a specific service?";
    return { message, actions };
  }

  // ────────────────────────────────────────────────────────────────────────
  // 18. ASK STATUS
  // ────────────────────────────────────────────────────────────────────────
  if (intent === "ask_status") {
    if (currentState.budget && currentState.guestCount) {
      const planText = buildFullPlanText(currentState, calculation, isSwahili);
      message = planText;
    } else {
      message = isSwahili
        ? "Bado hatujapanga kitu. Niambie aina ya tukio, bajeti yako na idadi ya wageni."
        : "We haven't set up a plan yet. Tell me the event type, budget, and guest count to get started.";
    }
    return { message, actions };
  }

  // ────────────────────────────────────────────────────────────────────────
  // 19. NEW PLAN — broad intent with entities (e.g. "Harusi ya watu 50 Dar 500k")
  // ────────────────────────────────────────────────────────────────────────
  if (intent === "new_plan") {
    if (curiosity && curiosity.hasMissingInfo) {
      // Missing something critical — ask ONE question then offer to plan
      message = isSwahili ? curiosity.promptSw : curiosity.promptEn;
      lastAssistantQuestion = curiosity.questionKey;
    } else if (currentState.budget && currentState.guestCount && currentState.location) {
      // We have enough — generate a compact plan summary and offer full plan
      const planText = buildFullPlanText(currentState, calculation, isSwahili);
      message = isSwahili
        ? `${planText}\n\nNiandae mpango wako kamili pamoja na checklist? (Andika "ndio" au "nipangilie kila kitu")`
        : `${planText}\n\nShall I build your full plan with checklist? (Say "yes" or "plan everything for me")`;
      pendingAction = "generate_full_plan";
      lastAssistantQuestion = "ASK_FULL_PLAN";
      actions.push({ type: "VIEW_BUDGET", label: isSwahili ? "Angalia Mpango" : "View Plan" });
    } else if (calculation && calculation.shortfall > 0) {
      message = isSwahili
        ? `Kwa wageni ${currentState.guestCount} huko ${currentState.location || "Dar es Salaam"} na bajeti ya ${fmt(currentState.budget)} (~${fmt(calculation.costPerGuest)}/mgeni), mpango una upungufu wa ~${fmt(calculation.shortfall)}.`
        : `For ${currentState.guestCount} guests in ${currentState.location || "Dar es Salaam"} with ${fmt(currentState.budget)} (~${fmt(calculation.costPerGuest)}/guest), there's a ~${fmt(calculation.shortfall)} shortfall.`;
      if (curiosity && curiosity.hasMissingInfo) message += `\n\n${isSwahili ? curiosity.promptSw : curiosity.promptEn}`;
    } else {
      message = isSwahili ? (curiosity?.promptSw || "Unapanga tukio gani?") : (curiosity?.promptEn || "What event are we planning?");
    }
    return { message, actions, pendingAction, lastAssistantQuestion };
  }

  // ────────────────────────────────────────────────────────────────────────
  // 20. DEFAULT FALLBACK — reasoned general response
  // ────────────────────────────────────────────────────────────────────────
  if (currentState.budget && currentState.guestCount && currentState.location) {
    if (calculation && calculation.shortfall > 0) {
      message = isSwahili
        ? `Kwa wageni ${currentState.guestCount} na bajeti ya ${fmt(currentState.budget)} huko ${currentState.location} (~${fmt(calculation.costPerGuest)}/mgeni), mpango unahitaji umakini mkubwa. Je, ungependa kupunguza wageni au kubadili kategoria yoyote?`
        : `For ${currentState.guestCount} guests with ${fmt(currentState.budget)} in ${currentState.location} (~${fmt(calculation.costPerGuest)}/guest), the plan is very tight. Would you like to reduce guests or adjust any category?`;
    } else {
      message = isSwahili
        ? `Mpango wako wa ${eventLabel} (wageni ${currentState.guestCount} huko ${currentState.location}, ~${fmt(calculation ? calculation.costPerGuest : 0)}/mgeni) unaendelea vizuri na akiba ya ${fmt(calculation ? calculation.reserve : 0)}.\n\nJe, ungependa kuulizia kuhusu chakula, mapambo, au kupata mpiga picha?`
        : `Your ${eventLabel} plan (${currentState.guestCount} guests in ${currentState.location}, ~${fmt(calculation ? calculation.costPerGuest : 0)}/guest) looks solid with a ${fmt(calculation ? calculation.reserve : 0)} reserve.\n\nWould you like to ask about food, decor, or finding a photographer?`;
    }
  } else if (curiosity && curiosity.hasMissingInfo) {
    message = isSwahili ? curiosity.promptSw : curiosity.promptEn;
    lastAssistantQuestion = curiosity.questionKey;
  } else {
    message = isSwahili
      ? "Safi! Nipo hapa kukusaidia kupanga tukio lako. Niambie bajeti uliyonayo au idadi ya wageni."
      : "Sounds good! Ready to help plan your event. Tell me your budget or estimated guest count.";
  }

  return { message, actions, pendingAction, lastAssistantQuestion };
}

export default {
  composeResponse
};
