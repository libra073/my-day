// vendorMatcherService.js
// Service to match MY DAY providers to budget allocations.
// Uses existing mock provider data from initialData.js and never invents providers.

import { providers } from "../data/initialData.js";

// ----------------------- Configuration -----------------------
const DEFAULT_TOLERANCE = 0.10; // 10% over budget tolerance

// Category normalization map – maps various user inputs to provider category values.
const CATEGORY_MAP = {
  venue: "kumbi",
  kumbi: "kumbi",
  catering: "catering",
  food: "catering",
  caterer: "catering",
  decoration: "wapambaji",
  decor: "wapambaji",
  decorator: "wapambaji",
  photo: "photography",
  photography: "photography",
  photographer: "photography",
  video: "photography",
  videography: "photography",
  entertainment: "entertainment",
  mc: "entertainment",
  transport: "transport",
  salon: "saloon",
  saloon: "saloon",
};

// Event‑type → required categories (normalized to provider categories)
const EVENT_CATEGORY_REQUIREMENTS = {
  wedding: ["kumbi", "catering", "wapambaji", "photography", "entertainment", "transport", "saloon"],
  birthday: ["kumbi", "catering", "wapambaji", "photography", "entertainment"],
  graduation: ["kumbi", "catering", "photography", "wapambaji", "transport"],
  "baby shower": ["kumbi", "catering", "wapambaji", "photography"],
  engagement: ["kumbi", "catering", "wapambaji", "photography", "entertainment"],
};

/**
 * Normalise a category string supplied by the planner to the internal provider category.
 */
function normaliseCategory(cat) {
  const key = cat.toLowerCase().trim();
  return CATEGORY_MAP[key] || key; // fall back to original if not in map
}

/**
 * Estimate the cost of a provider for a given event.
 * Different provider structures store price information under different keys.
 */
function estimateProviderCost(provider, guestCount) {
  if (provider.pricePerDay) return provider.pricePerDay;
  if (provider.pricePerPerson) return provider.pricePerPerson * guestCount;
  if (provider.pricePerEvent) return provider.pricePerEvent;
  if (Array.isArray(provider.packages) && provider.packages.length) {
    const cheapest = provider.packages.reduce((a, b) => (a.price < b.price ? a : b));
    return cheapest.price;
  }
  return Infinity;
}

/**
 * Simple scoring function – higher is better.
 * Scores are weighted (out of 100).
 */
function computeScore({ provider, cost, allocatedBudget, location }) {
  const weights = {
    budgetFit: 30,
    location: 25,
    rating: 15,
    capacity: 15,
    availability: 5,
    categoryMatch: 10,
  };

  const budgetScore = Math.max(0, 1 - Math.abs(cost - allocatedBudget) / allocatedBudget) * 100;
  const budgetFit = Math.min(budgetScore, 100) * (weights.budgetFit / 100);

  const locationScore = provider.location && provider.location.toLowerCase().includes(location.toLowerCase()) ? 100 : 50;
  const locationPart = locationScore * (weights.location / 100);

  const ratingScore = (provider.rating || 0) / 5 * 100;
  const ratingPart = ratingScore * (weights.rating / 100);

  const capacityScore = provider.capacity ? Math.min(100, (provider.capacity / (guestCount || 1)) * 100) : 0;
  const capacityPart = capacityScore * (weights.capacity / 100);

  const availabilityScore = provider.unavailableDates && provider.unavailableDates.length ? 50 : 100;
  const availabilityPart = availabilityScore * (weights.availability / 100);

  const categoryPart = 100 * (weights.categoryMatch / 100);

  const total = budgetFit + locationPart + ratingPart + capacityPart + availabilityPart + categoryPart;
  return Math.round(total);
}

/**
 * Match providers to each requested category.
 */
export function matchVendors({
  eventType,
  budget,
  guestCount,
  location,
  eventDate = null,
  categories = [],
  budgetTolerance = DEFAULT_TOLERANCE,
}) {
  const normalizedCategories = categories.map((c) => ({
    category: normaliseCategory(c.category),
    allocatedBudget: c.allocatedBudget,
  }));

  const result = {
    success: true,
    eventType,
    location,
    guestCount,
    categories: [],
  };

  normalizedCategories.forEach(({ category, allocatedBudget }) => {
    const candidates = providers.filter((p) => p.category === category);
    const withinLocation = (prov) =>
      prov.location && prov.location.toLowerCase().includes(location.toLowerCase());

    const matches = [];
    const overBudget = [];

    candidates.forEach((provider) => {
      const cost = estimateProviderCost(provider, guestCount);
      const within = cost <= allocatedBudget;
      const withinTol = cost <= allocatedBudget * (1 + budgetTolerance);

      if (within || withinTol) {
        const score = computeScore({ provider, cost, allocatedBudget, location });
        const label = score >= 85 ? "Best Match" : score >= 70 ? "Great Match" : "Good Match";
        const reasons = [];
        if (within) reasons.push("Fits your budget");
        else reasons.push(`Within ${Math.round(((cost - allocatedBudget) / allocatedBudget) * 100)}% over budget`);
        if (withinLocation(provider)) reasons.push(`Located in ${location}`);
        if (provider.rating) reasons.push(`${provider.rating}★ rating`);
        if (provider.capacity) reasons.push(`Capacity ${provider.capacity}`);
        reasons.push("Matches required service category");

        const entry = {
          providerId: provider.id,
          name: provider.name,
          price: cost,
          matchScore: score,
          matchLabel: label,
          reasons,
          provider,
        };
        if (within) matches.push(entry);
        else overBudget.push({ ...entry, overBudgetAmount: cost - allocatedBudget });
      }
    });

    matches.sort((a, b) => b.matchScore - a.matchScore);
    overBudget.sort((a, b) => a.overBudgetAmount - b.overBudgetAmount);

    const categoryResult = {
      category,
      allocatedBudget,
      matches: matches.slice(0, 3),
      overBudget: overBudget.slice(0, 3),
      status: matches.length ? "match" : overBudget.length ? "over_budget" : "no_match",
    };
    if (categoryResult.status === "no_match") {
      categoryResult.message = `No ${category} providers were found within your budget and location.`;
    }
    result.categories.push(categoryResult);
  });

  return result;
}
