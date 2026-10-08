// src/services/ai/eventKnowledge.js
// Structured Tanzanian Event Domain Knowledge & Terminology System.

export const TANZANIAN_EVENT_TYPES = {
  wedding: {
    id: "wedding",
    name: "Wedding / Harusi",
    aliases: [
      "harusi", "ndoa", "kuoa", "kuolewa", "wedding", "marriage",
      "white wedding", "sherehe ya harusi", "arusi"
    ],
    essentialServices: ["venue", "catering"],
    recommendedServices: ["decor", "photography", "entertainment"],
    optionalServices: ["transport", "saloon", "misc"],
    typicalGuestRanges: { min: 50, standard: 150, large: 300, grand: 500 },
    budgetPriorities: [
      { category: "catering", weight: 0.36, description: "Buffet, drinks, seating & service staff" },
      { category: "venue", weight: 0.26, description: "Air-conditioned hall or open garden" },
      { category: "decor", weight: 0.14, description: "Stage backdrop, lighting & floral centerpieces" },
      { category: "photography", weight: 0.10, description: "Photo team & cinematic video" },
      { category: "entertainment", weight: 0.08, description: "Bilingual MC & sound setup" },
      { category: "transport", weight: 0.06, description: "Bridal convoy & sedan" },
    ],
    commonConstraints: [
      "Requires venue booking 2-6 months in advance",
      "Catering is strictly guest-dependent; scaling guests shifts total budget dramatically",
      "Sound restrictions may apply for residential garden venues after 11 PM"
    ],
    checklist: [
      { id: "chk-w1", task: "Book wedding hall/garden (Kumbi)", category: "venue" },
      { id: "chk-w2", task: "Confirm caterer and finalize sample menu", category: "catering" },
      { id: "chk-w3", task: "Hire professional Master of Ceremonies (MC) and DJ", category: "entertainment" },
      { id: "chk-w4", task: "Select decorator for hall styling and head table", category: "decor" },
      { id: "chk-w5", task: "Book photography and video coverage", category: "photography" },
      { id: "chk-w6", task: "Arrange bridal convoy transport", category: "transport" },
      { id: "chk-w7", task: "Confirm 30% deposit guarantee with all providers", category: "general" }
    ],
    timeline: [
      { timeframe: "3-6 Months Before", tasks: ["Budget approval", "Book venue", "Engage caterer"] },
      { timeframe: "1-2 Months Before", tasks: ["Book MC & DJ", "Finalize decor theme", "Book photographer"] },
      { timeframe: "2 Weeks Before", tasks: ["Final guest count confirmation", "Run of show briefing with MC"] },
      { timeframe: "Event Day", tasks: ["Hall setup inspection", "Reception & celebration"] }
    ]
  },

  sendoff: {
    id: "sendoff",
    name: "Send-off Party",
    aliases: [
      "send-off", "sendoff", "send off", "sherehe ya send off", "send-off party"
    ],
    essentialServices: ["venue", "catering"],
    recommendedServices: ["decor", "photography", "entertainment"],
    optionalServices: ["transport", "saloon", "misc"],
    typicalGuestRanges: { min: 40, standard: 120, large: 250, grand: 400 },
    budgetPriorities: [
      { category: "catering", weight: 0.38, description: "Food, drinks, desserts" },
      { category: "venue", weight: 0.25, description: "Reception venue / banquet hall" },
      { category: "decor", weight: 0.15, description: "Theme color styling & backdrop" },
      { category: "photography", weight: 0.10, description: "Full digital coverage & photo album" },
      { category: "entertainment", weight: 0.08, description: "MC & DJ setup" },
      { category: "transport", weight: 0.04, description: "Bride & entourage transport" }
    ],
    commonConstraints: [
      "Usually held 1-3 weeks prior to main wedding",
      "Family gifts presentation requires adequate stage room"
    ],
    checklist: [
      { id: "chk-so1", task: "Confirm send-off hall & lighting", category: "venue" },
      { id: "chk-so2", task: "Select catering & special drinks menu", category: "catering" },
      { id: "chk-so3", task: "Book MC specialized in send-off protocols", category: "entertainment" },
      { id: "chk-so4", task: "Coordinate decor theme with bridal outfit", category: "decor" },
      { id: "chk-so5", task: "Book photographer for family portraits", category: "photography" }
    ],
    timeline: [
      { timeframe: "2 Months Before", tasks: ["Reserve send-off hall", "Select caterer"] },
      { timeframe: "3 Weeks Before", tasks: ["Book MC and decorator"] },
      { timeframe: "1 Week Before", tasks: ["Finalize gift presentation program"] }
    ]
  },

  kitchen_party: {
    id: "kitchen_party",
    name: "Kitchen Party",
    aliases: [
      "kitchen party", "kitchenparty", "kp", "sherehe ya kitchen party"
    ],
    essentialServices: ["catering", "decor"],
    recommendedServices: ["venue", "photography", "entertainment"],
    optionalServices: ["transport", "misc"],
    typicalGuestRanges: { min: 30, standard: 80, large: 150, grand: 250 },
    budgetPriorities: [
      { category: "catering", weight: 0.40, description: "Buffet, snacks, high-tea & drinks" },
      { category: "decor", weight: 0.22, description: "Intimate themed decor & gift display area" },
      { category: "venue", weight: 0.20, description: "Intimate hall or private lounge" },
      { category: "entertainment", weight: 0.10, description: "Female MC / Matron & sound" },
      { category: "photography", weight: 0.08, description: "Portraits & gift presentation" }
    ],
    commonConstraints: [
      "Women-centered celebration focused on domestic coaching and gifts",
      "Requires designated secure area for gift storage"
    ],
    checklist: [
      { id: "chk-kp1", task: "Book venue or private lounge space", category: "venue" },
      { id: "chk-kp2", task: "Confirm menu & mocktails/drinks", category: "catering" },
      { id: "chk-kp3", task: "Hire MC / Matron experienced in kitchen party traditions", category: "entertainment" },
      { id: "chk-kp4", task: "Arrange kitchen party decor & gift table setup", category: "decor" }
    ],
    timeline: [
      { timeframe: "1 Month Before", tasks: ["Book venue and catering"] },
      { timeframe: "2 Weeks Before", tasks: ["Coordinate with Matron & committee"] }
    ]
  },

  engagement: {
    id: "engagement",
    name: "Engagement / Uchumba",
    aliases: [
      "engagement", "uchumba", "posa", "pete ya uchumba", "engagement party"
    ],
    essentialServices: ["venue", "catering"],
    recommendedServices: ["decor", "photography", "entertainment"],
    optionalServices: ["transport", "misc"],
    typicalGuestRanges: { min: 20, standard: 60, large: 120, grand: 200 },
    budgetPriorities: [
      { category: "catering", weight: 0.40, description: "Buffet & toast drinks" },
      { category: "venue", weight: 0.25, description: "Intimate garden, lounge or boutique hall" },
      { category: "decor", weight: 0.18, description: "Romantic floral styling & proposal backdrop" },
      { category: "photography", weight: 0.12, description: "Couple portraits & ceremony coverage" },
      { category: "entertainment", weight: 0.05, description: "Acoustic music / DJ" }
    ],
    commonConstraints: [
      "Intimate atmosphere prioritizing close family and friends",
      "Focus on proposal moment and family blessing"
    ],
    checklist: [
      { id: "chk-eng1", task: "Select romantic/intimate venue", category: "venue" },
      { id: "chk-eng2", task: "Order custom catering and celebratory drinks", category: "catering" },
      { id: "chk-eng3", task: "Arrange floral ring-exchange backdrop", category: "decor" },
      { id: "chk-eng4", task: "Book photographer for couple photoshoot", category: "photography" }
    ],
    timeline: [
      { timeframe: "1 Month Before", tasks: ["Select venue", "Plan catering"] },
      { timeframe: "1 Week Before", tasks: ["Confirm ring delivery and photographer"] }
    ]
  },

  birthday: {
    id: "birthday",
    name: "Birthday Party / Siku ya Kuzaliwa",
    aliases: [
      "birthday", "kuzaliwa", "siku ya kuzaliwa", "birthday party", "miaka", "bethidei"
    ],
    essentialServices: ["catering"],
    recommendedServices: ["entertainment", "photography", "decor"],
    optionalServices: ["venue", "transport", "misc"],
    typicalGuestRanges: { min: 15, standard: 40, large: 80, grand: 150 },
    budgetPriorities: [
      { category: "catering", weight: 0.45, description: "Food, custom birthday cake & beverages" },
      { category: "venue", weight: 0.20, description: "Home garden, restaurant lounge or pool area" },
      { category: "entertainment", weight: 0.15, description: "DJ, sound system or MC" },
      { category: "decor", weight: 0.12, description: "Balloons, neon lights & photobooth" },
      { category: "photography", weight: 0.08, description: "Party coverage & social reels" }
    ],
    commonConstraints: [
      "Can easily be hosted at home or open space to eliminate venue cost",
      "Cake and drinks are central to guest satisfaction"
    ],
    checklist: [
      { id: "chk-bd1", task: "Order custom birthday cake", category: "catering" },
      { id: "chk-bd2", task: "Organize party catering & barbecue/bites", category: "catering" },
      { id: "chk-bd3", task: "Book DJ / sound equipment", category: "entertainment" },
      { id: "chk-bd4", task: "Setup balloon backdrop and photo area", category: "decor" }
    ],
    timeline: [
      { timeframe: "3 Weeks Before", tasks: ["Guest list & invitations", "Order cake"] },
      { timeframe: "1 Week Before", tasks: ["Finalize menu and playlist"] }
    ]
  },

  graduation: {
    id: "graduation",
    name: "Graduation Party / Mahafali",
    aliases: [
      "graduation", "mahafali", "kuhitimu", "graduation party", "sherehe ya mahafali"
    ],
    essentialServices: ["catering", "venue"],
    recommendedServices: ["decor", "photography", "entertainment"],
    optionalServices: ["transport", "misc"],
    typicalGuestRanges: { min: 25, standard: 70, large: 150, grand: 250 },
    budgetPriorities: [
      { category: "catering", weight: 0.42, description: "Congratulatory dinner & drinks" },
      { category: "venue", weight: 0.25, description: "Community hall or restaurant terrace" },
      { category: "decor", weight: 0.13, description: "Academic theme styling & banner" },
      { category: "photography", weight: 0.12, description: "Graduate portraits with gown & family" },
      { category: "entertainment", weight: 0.08, description: "MC & sound system" }
    ],
    commonConstraints: [
      "Dates often coincide with national university graduation weeks (Nov-Dec in TZ)",
      "High demand for venues near university campuses"
    ],
    checklist: [
      { id: "chk-gr1", task: "Book reception hall or garden space", category: "venue" },
      { id: "chk-gr2", task: "Arrange celebratory buffet catering", category: "catering" },
      { id: "chk-gr3", task: "Book professional studio/event portrait photographer", category: "photography" }
    ],
    timeline: [
      { timeframe: "1 Month Before", tasks: ["Venue & catering reservation"] },
      { timeframe: "1 Week Before", tasks: ["Confirm guest RSVPs"] }
    ]
  },

  baby_shower: {
    id: "baby_shower",
    name: "Baby Shower",
    aliases: [
      "baby shower", "babyshower", "baby-shower", "sherehe ya mtoto"
    ],
    essentialServices: ["catering", "decor"],
    recommendedServices: ["photography", "venue"],
    optionalServices: ["entertainment", "transport", "misc"],
    typicalGuestRanges: { min: 15, standard: 35, large: 60, grand: 100 },
    budgetPriorities: [
      { category: "catering", weight: 0.45, description: "High-tea, mocktails, pastries & desserts" },
      { category: "decor", weight: 0.25, description: "Pastel theme, balloon arch & mom-to-be throne" },
      { category: "venue", weight: 0.15, description: "Garden cafe, private terrace or home" },
      { category: "photography", weight: 0.10, description: "Maternity & family memories" },
      { category: "entertainment", weight: 0.05, description: "Games host / gentle acoustic background" }
    ],
    commonConstraints: [
      "Daytime or afternoon celebration (typically 2 PM - 6 PM)",
      "Interactive games and comfortable seating are key priorities"
    ],
    checklist: [
      { id: "chk-bs1", task: "Select cozy venue or private garden", category: "venue" },
      { id: "chk-bs2", task: "Order theme cake, mocktails, and finger foods", category: "catering" },
      { id: "chk-bs3", task: "Setup baby shower balloon backdrop", category: "decor" },
      { id: "chk-bs4", task: "Organize games and gift registry", category: "general" }
    ],
    timeline: [
      { timeframe: "3 Weeks Before", tasks: ["Invitations and venue selection"] },
      { timeframe: "1 Week Before", tasks: ["Finalize decor & games program"] }
    ]
  },

  corporate: {
    id: "corporate",
    name: "Corporate Event / Gala / Conference",
    aliases: [
      "corporate", "kampuni", "mkutano", "gala", "dinner", "end year party", "seminar", "conference", "uzinduzi"
    ],
    essentialServices: ["venue", "catering"],
    recommendedServices: ["photography", "entertainment", "decor"],
    optionalServices: ["transport", "misc"],
    typicalGuestRanges: { min: 30, standard: 100, large: 250, grand: 600 },
    budgetPriorities: [
      { category: "venue", weight: 0.35, description: "Hotel conference facility with AV & projector" },
      { category: "catering", weight: 0.35, description: "Corporate 3-course dinner, cocktails & water" },
      { category: "photography", weight: 0.12, description: "Media coverage, live streaming & PR photos" },
      { category: "entertainment", weight: 0.10, description: "Corporate bilingual MC & PA system" },
      { category: "decor", weight: 0.08, description: "Branded stage backdrop & banners" }
    ],
    commonConstraints: [
      "Strict invoicing, VAT, and corporate payment turnaround times",
      "High reliability requirements for audio-visual (AV) and backup power"
    ],
    checklist: [
      { id: "chk-cp1", task: "Book conference hall with high-speed WiFi and AV", category: "venue" },
      { id: "chk-cp2", task: "Arrange corporate catering and refreshment breaks", category: "catering" },
      { id: "chk-cp3", task: "Hire professional corporate MC", category: "entertainment" },
      { id: "chk-cp4", task: "Order branded backdrops and roll-up banners", category: "decor" }
    ],
    timeline: [
      { timeframe: "2 Months Before", tasks: ["Venue contract & AV requirements"] },
      { timeframe: "2 Weeks Before", tasks: ["Speaker schedule & agenda distribution"] }
    ]
  },

  traditional: {
    id: "traditional",
    name: "Traditional Ceremony / Mahari / Kikao",
    aliases: [
      "mahari", "kikao", "kutoa mahari", "baraza", "ngano", "mila", "mila na desturi"
    ],
    essentialServices: ["catering"],
    recommendedServices: ["venue", "decor"],
    optionalServices: ["photography", "entertainment", "transport", "misc"],
    typicalGuestRanges: { min: 20, standard: 50, large: 100, grand: 200 },
    budgetPriorities: [
      { category: "catering", weight: 0.55, description: "Traditional banquet & refreshments for elders" },
      { category: "venue", weight: 0.20, description: "Family homestead or private meeting hall" },
      { category: "decor", weight: 0.12, description: "Cultural fabrics & seating arrangement" },
      { category: "photography", weight: 0.08, description: "Family archival documentation" },
      { category: "entertainment", weight: 0.05, description: "Traditional music or acoustic setup" }
    ],
    commonConstraints: [
      "Focus is on family elders, negotiations, and customary hospitality",
      "Strict adherence to cultural protocol"
    ],
    checklist: [
      { id: "chk-tr1", task: "Prepare family seating & banquet area", category: "venue" },
      { id: "chk-tr2", task: "Prepare traditional feast for in-laws & elders", category: "catering" },
      { id: "chk-tr3", task: "Confirm delegation leaders & spokespersons", category: "general" }
    ],
    timeline: [
      { timeframe: "3 Weeks Before", tasks: ["Elder consultation & menu planning"] },
      { timeframe: "Day of Event", tasks: ["Customary reception and negotiations"] }
    ]
  }
};

// ---------------------------------------------------------------------------
// Tanzanian Terminology & Slang Lexicon
// ---------------------------------------------------------------------------
export const TANZANIAN_LEXICON = {
  money: {
    "laki": 100000,
    "milioni": 1000000,
    "mchango": "contribution",
    "budget": "bajeti",
    "pesa": "money",
    "shilingi": "shillings",
    "akiba": "contingency reserve",
    "punguzo": "discount",
    "ghali": "expensive",
    "nafuu": "affordable / budget",
    "kima cha chini": "practical minimum baseline"
  },
  roles: {
    "bwana harusi": "groom",
    "bibi harusi": "bride",
    "maharusi": "bridal couple",
    "mpambe": "best man / bridesmaid",
    "matron": "matron of honor",
    "mpambaji": "decorator",
    "mpishi": "caterer",
    "mpiga picha": "photographer",
    "mc": "master of ceremonies",
    "mgeni": "guest",
    "wageni": "guests",
    "kamati": "planning committee"
  },
  categories: {
    "kumbi": "venue",
    "ukumbi": "venue",
    "chakula": "catering",
    "vinywaji": "drinks",
    "mapambo": "decor",
    "picha": "photography",
    "video": "videography",
    "muziki": "entertainment",
    "burudani": "entertainment",
    "usafiri": "transport",
    "saloon": "salon",
    "barbershop": "barbershop"
  }
};

/**
 * Match a raw user text against event knowledge.
 */
export function identifyEventType(text = "") {
  if (!text) return null;
  const lowered = text.toLowerCase().trim();

  for (const [, eventDef] of Object.entries(TANZANIAN_EVENT_TYPES)) {
    for (const alias of eventDef.aliases) {
      const regex = new RegExp(`\\b${alias.replace(/\s+/g, "\\s+")}\\b`, "i");
      if (regex.test(lowered)) {
        return eventDef;
      }
    }
  }

  return null;
}

export default {
  TANZANIAN_EVENT_TYPES,
  TANZANIAN_LEXICON,
  identifyEventType
};
