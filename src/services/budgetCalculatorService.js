// src/services/budgetCalculatorService.js
// Professional Tanzanian Event Budgeting & Feasibility Engine.
// Evaluates real practical costs, guest-dependent economics, regional pricing,
// minimum practical baselines, deficits/surpluses, and scope-based plans.

// ---------------------------------------------------------------------------
// 1. Regional Cost Multipliers across Tanzania
// ---------------------------------------------------------------------------
export const REGIONAL_MULTIPLIERS = {
  "dar es salaam": 1.15,
  "zanzibar": 1.20,
  "arusha": 1.10,
  "dodoma": 0.95,
  "mwanza": 0.95,
  "mbeya": 0.90,
  "morogoro": 0.90,
  "tanga": 0.90,
  "kilimanjaro": 1.00,
  "moshi": 1.00,
  "pwani": 0.95,
  "iringa": 0.90,
  "default": 1.00,
};

export function getRegionalMultiplier(location = "Dar es Salaam") {
  if (!location) return REGIONAL_MULTIPLIERS["default"];
  const loc = location.toLowerCase().trim();
  for (const [city, mult] of Object.entries(REGIONAL_MULTIPLIERS)) {
    if (loc.includes(city)) return mult;
  }
  return REGIONAL_MULTIPLIERS["default"];
}

// ---------------------------------------------------------------------------
// 2. Unit Costs (Per Guest) by Plan Tier in Tanzania (TZS)
// ---------------------------------------------------------------------------
export const UNIT_COSTS_PER_GUEST = {
  catering: {
    budget: 3500,     // Simple home-style/micro pilau buffet
    balanced: 10000,  // Standard 2-meat wedding buffet & sides
    premium: 28000,   // Multi-course gourmet/seafood banquet
  },
  drinks: {
    budget: 1200,     // Water & soda
    balanced: 2500,   // Juices, soda, bottled water
    premium: 6000,    // Signature mocktails, fresh juices, premium drinks
  },
  seating: {
    budget: 800,      // Dressed plastic chairs
    balanced: 2000,   // Chiavari chairs & round banquet tables
    premium: 4500,    // Luxury designer seating & premium table settings
  },
};

// ---------------------------------------------------------------------------
// 3. Category Minimum Practical Baselines (Fixed Costs in TZS)
// ---------------------------------------------------------------------------
export const CATEGORY_BASE_MINIMUMS = {
  venue: {
    budget: 150000,    // Community space, church grounds, or home garden
    balanced: 800000,  // Air-conditioned hall with parking & generator
    premium: 2200000,  // Luxury hotel ballroom / resort hall
  },
  decor: {
    budget: 50000,     // Simple table runners, minimal backdrop, centerpieces
    balanced: 450000,  // Stage backdrop, entrance arch, floral table styling
    premium: 1800000,  // Full hall transformation, fresh florals, mood lighting
  },
  photography: {
    budget: 150000,    // Single pro digital photographer
    balanced: 500000,  // Full day photography & highlights video
    premium: 1400000,  // Photo team, cinematic 4K video & drone
  },
  entertainment: {
    budget: 60000,     // Basic sound system / DJ
    balanced: 350000,  // Professional bilingual MC & DJ setup
    premium: 900000,   // Celebrity MC, pro DJ, live sax / performance
  },
  transport: {
    budget: 0,         // Family vehicle
    balanced: 200000,  // Decorated bridal sedan
    premium: 700000,   // Luxury Mercedes / Range Rover convoy
  },
};

// ---------------------------------------------------------------------------
// 4. Service Scope Classification by Event Type
// ---------------------------------------------------------------------------
export const EVENT_SERVICE_SCOPES = {
  wedding: {
    essential: ["venue", "catering"],
    recommended: ["decor", "photography", "entertainment"],
    optional: ["transport", "misc"],
  },
  sendoff: {
    essential: ["venue", "catering"],
    recommended: ["decor", "photography", "entertainment"],
    optional: ["transport", "misc"],
  },
  "send-off": {
    essential: ["venue", "catering"],
    recommended: ["decor", "photography", "entertainment"],
    optional: ["transport", "misc"],
  },
  kitchen_party: {
    essential: ["catering", "decor"],
    recommended: ["venue", "photography", "entertainment"],
    optional: ["transport", "misc"],
  },
  "kitchen party": {
    essential: ["catering", "decor"],
    recommended: ["venue", "photography", "entertainment"],
    optional: ["transport", "misc"],
  },
  birthday: {
    essential: ["catering"],
    recommended: ["entertainment", "photography", "decor"],
    optional: ["venue", "transport", "misc"],
  },
  corporate: {
    essential: ["venue", "catering"],
    recommended: ["photography", "entertainment", "decor"],
    optional: ["transport", "misc"],
  },
  graduation: {
    essential: ["catering", "venue"],
    recommended: ["decor", "photography", "entertainment"],
    optional: ["transport", "misc"],
  },
  "baby shower": {
    essential: ["catering", "decor"],
    recommended: ["photography"],
    optional: ["venue", "entertainment", "transport", "misc"],
  },
  babyshower: {
    essential: ["catering", "decor"],
    recommended: ["photography"],
    optional: ["venue", "entertainment", "transport", "misc"],
  },
  engagement: {
    essential: ["venue", "catering"],
    recommended: ["decor", "photography", "entertainment"],
    optional: ["transport", "misc"],
  },
};

// ---------------------------------------------------------------------------
// 5. Practical Minimum Cost Calculator & Transparent Breakdown
// ---------------------------------------------------------------------------

/**
 * Calculates a fully itemized, defensible minimum cost breakdown based on
 * transparent Tanzanian event market assumptions.
 */
export function calculateMinimumCostBreakdown({
  eventType = "wedding",
  guestCount = 50,
  location = "Dar es Salaam",
  requirements = {},
}) {
  const guests = Math.max(1, Number(guestCount) || 50);
  const mult = getRegionalMultiplier(location);
  const normalizedType = (eventType || "wedding").toLowerCase().trim().replace(/[\s-]+/g, "_");
  const scope = EVENT_SERVICE_SCOPES[eventType] || EVENT_SERVICE_SCOPES[normalizedType] || EVENT_SERVICE_SCOPES["wedding"];

  // 1. Variable Per-Guest Costs
  // Catering, drinks, and guest seating scale strictly with guest count.
  const isCateringExcluded = requirements.catering === false || requirements.food === false;
  const isDrinksExcluded = requirements.drinks === false;
  const isSeatingExcluded = requirements.seating === false || requirements.chairs === false;

  const isLightCatering = requirements.cateringType === "bites" ||
    requirements.cateringType === "snacks" ||
    requirements.lightCatering === true;

  const perGuestFoodRate = isCateringExcluded
    ? 0
    : isLightCatering
      ? 2000
      : (UNIT_COSTS_PER_GUEST.catering?.budget ?? 3500);

  const perGuestDrinksRate = isDrinksExcluded ? 0 : (UNIT_COSTS_PER_GUEST.drinks?.budget ?? 1200);
  const perGuestSeatingRate = isSeatingExcluded ? 0 : (UNIT_COSTS_PER_GUEST.seating?.budget ?? 800);

  const totalPerGuestVariable = perGuestFoodRate + perGuestDrinksRate + perGuestSeatingRate;

  const foodMin = guests * perGuestFoodRate;
  const drinksMin = guests * perGuestDrinksRate;
  const seatingMin = guests * perGuestSeatingRate;
  const variableSubtotal = foodMin + drinksMin + seatingMin;

  // 2. Fixed Category Costs
  // Fixed costs (venue hall, decor setup, photo, DJ) are only included in the minimum baseline IF:
  // - The service is essential for the event type AND not explicitly declined (requirements[cat] !== false)
  // OR
  // - The user explicitly requested the service (requirements[cat] === true)
  const isVenueIncluded = (scope.essential.includes("venue") && requirements.venue !== false) ||
    requirements.venue === true;

  const isDecorIncluded = (scope.essential.includes("decor") && requirements.decor !== false && requirements.decoration !== false) ||
    requirements.decor === true ||
    requirements.decoration === true;

  const isPhotoIncluded = (scope.essential.includes("photography") && requirements.photography !== false && requirements.photo !== false) ||
    requirements.photography === true ||
    requirements.photo === true;

  const isEntertainmentIncluded = (scope.essential.includes("entertainment") && requirements.entertainment !== false) ||
    requirements.entertainment === true;

  const venueBase = isVenueIncluded ? (CATEGORY_BASE_MINIMUMS.venue?.budget ?? 150000) : 0;
  const decorBase = isDecorIncluded ? (CATEGORY_BASE_MINIMUMS.decor?.budget ?? 50000) : 0;
  const photoBase = isPhotoIncluded ? (CATEGORY_BASE_MINIMUMS.photography?.budget ?? 150000) : 0;
  const entertainmentBase = isEntertainmentIncluded ? (CATEGORY_BASE_MINIMUMS.entertainment?.budget ?? 60000) : 0;

  const fixedSubtotal = venueBase + decorBase + photoBase + entertainmentBase;

  // 3. Subtotal before regional adjustment
  const baseSubtotal = variableSubtotal + fixedSubtotal;

  // 4. Regional price adjustment
  const total = Math.round(baseSubtotal * mult);

  return {
    total,
    guests,
    location,
    regionalMultiplier: mult,
    variableCosts: {
      food: foodMin,
      foodPerGuest: perGuestFoodRate,
      drinks: drinksMin,
      drinksPerGuest: perGuestDrinksRate,
      seating: seatingMin,
      seatingPerGuest: perGuestSeatingRate,
      totalPerGuest: totalPerGuestVariable,
      subtotal: variableSubtotal,
    },
    fixedCosts: {
      venue: venueBase,
      decor: decorBase,
      photography: photoBase,
      entertainment: entertainmentBase,
      subtotal: fixedSubtotal,
    },
    includedServices: {
      catering: !isCateringExcluded,
      drinks: !isDrinksExcluded,
      seating: !isSeatingExcluded,
      venue: isVenueIncluded,
      decor: isDecorIncluded,
      photography: isPhotoIncluded,
      entertainment: isEntertainmentIncluded,
    },
    baseSubtotal,
    isEstimate: true,
    pricingType: "estimated_market_baseline",
    assumptionsDescription: `Baseline: ~TSh ${totalPerGuestVariable.toLocaleString()}/guest (Food: ${perGuestFoodRate.toLocaleString()}, Drinks: ${perGuestDrinksRate.toLocaleString()}, Seating: ${perGuestSeatingRate.toLocaleString()}) + Fixed: TSh ${fixedSubtotal.toLocaleString()} × Regional (${mult}) = TSh ${total.toLocaleString()}`,
  };
}

export function calculateEstimatedMinimumCost({
  eventType = "wedding",
  guestCount = 50,
  location = "Dar es Salaam",
  requirements = {},
}) {
  const breakdown = calculateMinimumCostBreakdown({
    eventType,
    guestCount,
    location,
    requirements,
  });
  return breakdown.total;
}

// ---------------------------------------------------------------------------
// 6. Comprehensive Budget Calculation & Feasibility Analysis
// ---------------------------------------------------------------------------
export function calculateBudget({
  eventType = "wedding",
  guestCount = 50,
  totalBudget = 500000,
  location = "Dar es Salaam",
  planType = "balanced",
  requirements = {},
}) {
  const guests = Math.max(1, Number(guestCount) || 50);
  const budget = Math.max(0, Number(totalBudget) || 0);
  const mult = getRegionalMultiplier(location);
  const normalizedType = (eventType || "wedding").toLowerCase().trim().replace(/[\s-]+/g, "_");
  const scope = EVENT_SERVICE_SCOPES[eventType] || EVENT_SERVICE_SCOPES[normalizedType] || EVENT_SERVICE_SCOPES["wedding"];

  // 1. Calculate Practical Minimum Breakdown
  const costBreakdown = calculateMinimumCostBreakdown({
    eventType,
    guestCount: guests,
    location,
    requirements,
  });
  const estimatedMinimum = costBreakdown.total;

  const costPerGuest = Math.round(budget / guests);
  const shortfall = Math.max(0, estimatedMinimum - budget);

  // 2. Feasibility Evaluation
  let feasibility = "balanced";
  let feasibilityReason = "";

  if (budget < estimatedMinimum) {
    const deficitRatio = shortfall / estimatedMinimum;
    const perGuestVar = costBreakdown.variableCosts.totalPerGuest;
    const regionalVar = Math.round(perGuestVar * mult);

    if (deficitRatio >= 0.30 || costPerGuest <= 6000) {
      feasibility = "unrealistic";
      feasibilityReason = `Budget of TSh ${budget.toLocaleString()} gives only ~TSh ${costPerGuest.toLocaleString()}/guest for ${guests} guests. Baseline costs (~TSh ${regionalVar.toLocaleString()}/guest for basic food, drinks & seating in ${location}${costBreakdown.fixedCosts.subtotal > 0 ? ` plus essential fixed expenses of ~TSh ${Math.round(costBreakdown.fixedCosts.subtotal * mult).toLocaleString()}` : ""}) require approximately TSh ${estimatedMinimum.toLocaleString()} total, leaving a shortfall of ~TSh ${shortfall.toLocaleString()}.`;
    } else {
      feasibility = "difficult";
      feasibilityReason = `Budget is ~TSh ${shortfall.toLocaleString()} below the minimum estimated cost (TSh ${estimatedMinimum.toLocaleString()}) for ${guests} guests in ${location}. Essential food, drinks, and seating alone absorb most of the funds; cost-saving tradeoffs are required.`;
    }
  } else if (budget < estimatedMinimum * 1.25) {
    feasibility = "tight";
    feasibilityReason = `Budget covers essential requirements for ${guests} guests (~TSh ${costPerGuest.toLocaleString()}/guest), but leaves little room for premium upgrades or unexpected expenses.`;
  } else if (budget > estimatedMinimum * 2.5) {
    feasibility = "surplus";
    feasibilityReason = `Generous budget of ~TSh ${costPerGuest.toLocaleString()}/guest in ${location}. Provides full luxury service coverage and a healthy emergency reserve.`;
  } else {
    feasibility = "balanced";
    feasibilityReason = `Healthy, practical budget of ~TSh ${costPerGuest.toLocaleString()}/guest for ${guests} guests in ${location}. Comfortably covers essential and recommended services.`;
  }

  // 3. Category Allocations based on Plan Tier & Scope
  const tier = planType === "premium" ? "premium" : planType === "budget" ? "budget" : "balanced";

  // Dynamic reserve rate (5-10% based on event complexity)
  let reserveRate = 0.07;
  if (eventType === "wedding") {
    reserveRate = guests > 150 ? 0.09 : 0.07;
  } else if (eventType === "birthday" || eventType === "baby shower") {
    reserveRate = 0.05;
  }

  let reserve = 0;
  let spendableBudget = budget;

  if (budget >= estimatedMinimum) {
    reserve = Math.round(budget * reserveRate);
    spendableBudget = budget - reserve;
  }

  // Base weighting per category by tier
  const weights = {
    budget: { catering: 0.50, venue: 0.28, decor: 0.10, photography: 0.07, entertainment: 0.05, transport: 0.00 },
    balanced: { catering: 0.36, venue: 0.26, decor: 0.14, photography: 0.10, entertainment: 0.08, transport: 0.06 },
    premium: { catering: 0.34, venue: 0.25, decor: 0.16, photography: 0.12, entertainment: 0.08, transport: 0.05 },
  }[tier];

  // Apply explicit exclusions to weights
  const activeWeights = { ...weights };
  if (requirements.entertainment === false) activeWeights.entertainment = 0;
  if (requirements.transport === false) activeWeights.transport = 0;
  if (requirements.photography === false || requirements.photo === false) activeWeights.photography = 0;
  if (requirements.decor === false || requirements.decoration === false) activeWeights.decor = 0;
  if (requirements.venue === false) activeWeights.venue = 0;

  const totalWeight = Object.values(activeWeights).reduce((sum, w) => sum + w, 0) || 1;

  // Calculate scaled category allocations
  let cateringAlloc = Math.round(spendableBudget * (activeWeights.catering / totalWeight));
  let venueAlloc = Math.round(spendableBudget * (activeWeights.venue / totalWeight));
  let decorAlloc = Math.round(spendableBudget * (activeWeights.decor / totalWeight));
  let photoAlloc = Math.round(spendableBudget * (activeWeights.photography / totalWeight));
  let entertainmentAlloc = Math.round(spendableBudget * (activeWeights.entertainment / totalWeight));
  let transportAlloc = Math.round(spendableBudget * (activeWeights.transport / totalWeight));

  // Ensure sum of allocations + reserve equals total budget exactly
  const allocatedSubtotal = cateringAlloc + venueAlloc + decorAlloc + photoAlloc + entertainmentAlloc + transportAlloc;
  const difference = budget - (allocatedSubtotal + reserve);
  if (difference !== 0 && cateringAlloc > 0) {
    cateringAlloc += difference; // absorb rounding delta in main catering
  }

  const allocatedTotal = cateringAlloc + venueAlloc + decorAlloc + photoAlloc + entertainmentAlloc + transportAlloc + reserve;
  const remaining = Math.max(0, budget - allocatedTotal);
  const cateringPerGuest = guests > 0 ? Math.round(cateringAlloc / guests) : 0;

  // Structured allocations mapping (compatible with frontend keys)
  const allocation = {
    venue: venueAlloc,
    catering: cateringAlloc,
    decor: decorAlloc,
    photography: photoAlloc,
    entertainment: entertainmentAlloc,
    transport: transportAlloc,
    misc: reserve,
  };

  // Build itemized category descriptors
  const categories = [
    {
      key: "catering",
      name: "Catering & Drinks",
      amount: cateringAlloc,
      perGuest: cateringPerGuest,
      isEssential: scope.essential.includes("catering"),
      isOptional: scope.optional.includes("catering"),
      isRemoved: cateringAlloc === 0,
      percentage: budget > 0 ? Math.round((cateringAlloc / budget) * 100) : 0,
    },
    {
      key: "venue",
      name: "Venue (Kumbi)",
      amount: venueAlloc,
      isEssential: scope.essential.includes("venue"),
      isOptional: scope.optional.includes("venue"),
      isRemoved: venueAlloc === 0,
      percentage: budget > 0 ? Math.round((venueAlloc / budget) * 100) : 0,
    },
    {
      key: "decor",
      name: "Decoration (Wapambaji)",
      amount: decorAlloc,
      isEssential: scope.essential.includes("decor"),
      isOptional: scope.optional.includes("decor"),
      isRemoved: decorAlloc === 0,
      percentage: budget > 0 ? Math.round((decorAlloc / budget) * 100) : 0,
    },
    {
      key: "photography",
      name: "Photo & Video",
      amount: photoAlloc,
      isEssential: scope.essential.includes("photography"),
      isOptional: scope.optional.includes("photography"),
      isRemoved: photoAlloc === 0,
      percentage: budget > 0 ? Math.round((photoAlloc / budget) * 100) : 0,
    },
    {
      key: "entertainment",
      name: "MC & DJ / Entertainment",
      amount: entertainmentAlloc,
      isEssential: scope.essential.includes("entertainment"),
      isOptional: scope.optional.includes("entertainment"),
      isRemoved: entertainmentAlloc === 0,
      percentage: budget > 0 ? Math.round((entertainmentAlloc / budget) * 100) : 0,
    },
    {
      key: "transport",
      name: "Bridal Transport",
      amount: transportAlloc,
      isEssential: scope.essential.includes("transport"),
      isOptional: scope.optional.includes("transport"),
      isRemoved: transportAlloc === 0,
      percentage: budget > 0 ? Math.round((transportAlloc / budget) * 100) : 0,
    },
  ];

  // Specific Actionable Tradeoff Options if in deficit
  const tradeoffOptions = [];
  if (shortfall > 0) {
    const varRatePerGuest = Math.max(1, Math.round((costBreakdown.variableCosts?.totalPerGuest || 5500) * mult));
    const realisticGuestsWithBudget = Math.max(1, Math.floor(budget / varRatePerGuest));

    if (realisticGuestsWithBudget < guests) {
      tradeoffOptions.push(`Punguza idadi ya wageni kutoka ${guests} hadi takriban ${realisticGuestsWithBudget} ili kuendana na bajeti ya chakula/vinywaji`);
    }

    if (guests >= 100) {
      const suggestedContribution = Math.round(estimatedMinimum / guests);
      tradeoffOptions.push(`Kwa wageni ${guests}, tumia mfumo wa mchango/kamati wa takriban TSh ${suggestedContribution.toLocaleString()} kwa kila mgeni`);
    }

    if (costBreakdown.fixedCosts?.venue > 0) {
      tradeoffOptions.push("Tumia eneo la wazi, bustani ya nyumbani au ukumbi wa kijamii badala ya ukumbi wa kukodi wa gharama kubwa");
    }

    tradeoffOptions.push("Andaa chakula rahisi cha menyu moja (mfano pilau/biryani au vitafunwa) badala ya buffet ya aina nyingi");
    tradeoffOptions.push("Ondoa huduma zisizo za lazima (msafara wa magari, MC wa bei kubwa, au video ya cinema)");
    tradeoffOptions.push(`Ongeza bajeti kwa takriban TSh ${shortfall.toLocaleString()} kufikia kima cha chini cha kiuhalisia`);
  }

  return {
    allocation,
    totalBudget: budget,
    estimatedMinimum,
    allocatedTotal,
    remaining: remaining >= 0 ? remaining : 0,
    shortfall,
    reserve,
    costPerGuest,
    cateringPerGuest,
    feasibility,
    status: feasibility,   // alias – callers may use either field name
    feasibilityReason,
    categories,
    tradeoffOptions,
    deficitRatio: estimatedMinimum > 0 ? shortfall / estimatedMinimum : 0,
    costBreakdown,
    pricingType: "estimated_market_baseline",
  };
}

// ---------------------------------------------------------------------------
// 7. Multi-Plan Generator (Budget, Balanced, Premium Scopes)
// ---------------------------------------------------------------------------
export function generatePlans(params) {
  const budgetResult = calculateBudget({ ...params, planType: "budget" });
  const balancedResult = calculateBudget({ ...params, planType: "balanced" });
  const premiumResult = calculateBudget({ ...params, planType: "premium" });

  return {
    budget: {
      ...budgetResult.allocation,
      _meta: budgetResult,
    },
    balanced: {
      ...balancedResult.allocation,
      _meta: balancedResult,
    },
    premium: {
      ...premiumResult.allocation,
      _meta: premiumResult,
    },
  };
}

export default {
  calculateBudget,
  generatePlans,
  calculateEstimatedMinimumCost,
  calculateMinimumCostBreakdown,
  getRegionalMultiplier,
  EVENT_SERVICE_SCOPES,
  UNIT_COSTS_PER_GUEST,
  CATEGORY_BASE_MINIMUMS,
};
