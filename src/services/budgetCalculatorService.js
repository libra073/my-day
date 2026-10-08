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
  engagement: {
    essential: ["venue", "catering"],
    recommended: ["decor", "photography", "entertainment"],
    optional: ["transport", "misc"],
  },
};

// ---------------------------------------------------------------------------
// 5. Practical Minimum Cost Calculator
// ---------------------------------------------------------------------------
export function calculateEstimatedMinimumCost({
  eventType = "wedding",
  guestCount = 50,
  location = "Dar es Salaam",
  requirements = {},
}) {
  const mult = getRegionalMultiplier(location);
  const scope = EVENT_SERVICE_SCOPES[eventType] || EVENT_SERVICE_SCOPES["wedding"];

  // Essential food + drinks + seating for guests
  const foodMin = guestCount * UNIT_COSTS_PER_GUEST.catering.budget;
  const drinksMin = guestCount * UNIT_COSTS_PER_GUEST.drinks.budget;
  const seatingMin = guestCount * UNIT_COSTS_PER_GUEST.seating.budget;

  let totalMin = (foodMin + drinksMin + seatingMin);

  // Add venue minimum if essential or required
  if (scope.essential.includes("venue") || requirements.venue !== false) {
    totalMin += CATEGORY_BASE_MINIMUMS.venue.budget;
  }

  // Add minimum essential decor
  if (scope.essential.includes("decor") || (requirements.decor !== false && requirements.decoration !== false)) {
    totalMin += CATEGORY_BASE_MINIMUMS.decor.budget;
  }

  // Apply regional pricing multiplier
  return Math.round(totalMin * mult);
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
  const scope = EVENT_SERVICE_SCOPES[eventType] || EVENT_SERVICE_SCOPES["wedding"];

  // 1. Calculate Practical Minimum
  const estimatedMinimum = calculateEstimatedMinimumCost({
    eventType,
    guestCount: guests,
    location,
    requirements,
  });

  const costPerGuest = Math.round(budget / guests);
  const shortfall = Math.max(0, estimatedMinimum - budget);

  // 2. Feasibility Evaluation
  let feasibility = "balanced";
  let feasibilityReason = "";

  if (budget < estimatedMinimum) {
    const deficitRatio = shortfall / estimatedMinimum;
    if (deficitRatio >= 0.30 || costPerGuest <= 6000) {
      feasibility = "unrealistic";
      feasibilityReason = `Budget of TSh ${budget.toLocaleString()} gives only ~TSh ${costPerGuest.toLocaleString()}/guest total. The practical minimum to host ${guests} guests in ${location} is approximately TSh ${estimatedMinimum.toLocaleString()} (a shortfall of ~TSh ${shortfall.toLocaleString()}).`;
    } else {
      feasibility = "difficult";
      feasibilityReason = `Budget is ~TSh ${shortfall.toLocaleString()} below the minimum estimated cost (TSh ${estimatedMinimum.toLocaleString()}) for ${guests} guests in ${location}. Extreme cost-saving tradeoffs are required.`;
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
    tradeoffOptions.push(`Reduce guest count from ${guests} to ${Math.round((budget / (UNIT_COSTS_PER_GUEST.catering.budget * mult + 1500)))} guests`);
    tradeoffOptions.push("Choose an open garden or community space instead of a commercial banquet hall");
    tradeoffOptions.push("Simplify food to a self-catered single-course buffet");
    tradeoffOptions.push("Remove non-essential services (MC, transport convoy, video)");
    tradeoffOptions.push(`Increase total budget by ~TSh ${shortfall.toLocaleString()} to meet the practical minimum`);
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
  getRegionalMultiplier,
};
