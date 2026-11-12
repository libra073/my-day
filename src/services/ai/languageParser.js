// src/services/ai/languageParser.js
// Robust Deterministic Tanzanian Natural Language & Entity Extraction Parser.

import { identifyEventType } from "./eventKnowledge.js";

// ---------------------------------------------------------------------------
// 1. Language Detection (English, Kiswahili, Mixed Sheng)
// ---------------------------------------------------------------------------
const SWAHILI_TOKENS = new Set([
  "habari", "mambo", "kwema", "poa", "salama", "shikamoo", "jambo", "vipi", "niaje",
  "harusi", "ndoa", "kuoa", "kuolewa", "sherehe", "wageni", "mgeni", "watu",
  "bajeti", "laki", "milioni", "elfu", "nusu", "robo", "pesa", "shilingi", "bei", "gharama",
  "ukumbi", "kumbi", "chakula", "mapambo", "wapambaji", "muziki", "picha", "mpiga", "usafiri",
  "sawa", "ndio", "hapana", "punguza", "ongeza", "ondoa", "peleka", "weka", "nipatie",
  "kubwa", "ndogo", "ghali", "nafuu", "kifahari", "asante", "shukrani", "ahsante", "kwaheri",
  "mwezi", "mwaka", "kesho", "tuanze", "endelea", "nina", "tuna", "nahitaji", "nataka",
  "je", "na", "au", "kwa", "kuhusu", "gani", "nani", "wapi", "lini", "hivi", "yangu", "yako",
  "kikubwa", "kidogo", "tu", "bila", "kufanya", "mkoa", "mji", "hapa", "pale", "inatosha",
  "upungufu", "akiba", "wastani", "zaidi", "makadirio", "tayari", "ipo", "sitaki", "lazima",
  "muhimu", "kikao", "mahari", "sendoff", "uchumba",
  "nipangilie", "nipangie", "niandalie", "andaa", "pangilia", "tengeneza", "nipange",
  "orodha", "mpango", "mrejesho", "nipe", "niambie", "nionyeshe", "fanya", "basi",
  "huko", "uko", "niko", "upo", "naomba", "tafadhali", "sana", "kabisa",
  "priority", "muhimu", "kwanza", "kwanza", "kipaumbele",
  // common verbs / function words so code-switched sentences stay Kiswahili
  "naweza", "kumudu", "unaweza", "ninaweza", "tunaweza", "ningependa", "ungependa",
  "tungependa", "nitapenda", "napenda", "nitumie", "nilitumie", "nieleze", "nishauri",
  "nijibu", "tafuta", "nitafuta", "itakuwa", "itafanyika", "itafanya", "tarehe",
  "sasa", "tena", "karibu", "samahani", "pongezi", "hakika", "kabisa", "ndiyo",
  "si", "ya", "yake", "yetu", "wangu", "wako", "lake", "letu", "kwenye", "katika",
  "hadi", "kuanzia", "takriban", "karibuni", "mnamo", "wenye", "wana", "una", "ina"
]);

const ENGLISH_TOKENS = new Set([
  "hey", "hello", "hi", "wedding", "married", "marriage", "guests", "people",
  "food", "catering", "decor", "decoration", "photos", "photography", "photographer",
  "cheap", "cheaper", "expensive", "remove", "give", "move", "find", "thanks", "thank",
  "around", "what", "how", "much", "spend", "about", "nice", "great", "sure", "okay", "yeah",
  "for", "the", "my", "our", "in", "is", "it", "with", "from", "to", "enough", "realistically",
  "plan", "balanced", "premium", "budget", "reduce", "increase", "needed", "already", "sorted",
  "venue", "hall", "entertainment", "transport", "reserve", "contingency", "shortfall",
  "priority", "first", "important", "list", "everything", "show", "give", "make"
]);

export function detectLanguage(text = "", prevLang = "en") {
  if (!text || typeof text !== "string") return prevLang || "en";
  const words = text.toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/).filter(Boolean);
  if (words.length === 0) return prevLang || "en";

  let swahiliCount = 0;
  let englishCount = 0;

  for (const w of words) {
    if (SWAHILI_TOKENS.has(w)) swahiliCount++;
    if (ENGLISH_TOKENS.has(w)) englishCount++;
  }

  if (swahiliCount > englishCount) return "sw";
  if (englishCount > swahiliCount) return "en";
  if (swahiliCount > 0) return "sw";
  return prevLang || "en";
}

// ---------------------------------------------------------------------------
// 2. Tanzanian Money Parsing
// ---------------------------------------------------------------------------
const SWAHILI_NUMBER_WORDS = {
  "nusu": 0.5,
  "moja": 1,
  "mbili": 2,
  "tatu": 3,
  "nne": 4,
  "tano": 5,
  "sita": 6,
  "saba": 7,
  "nane": 8,
  "tisa": 9,
  "kumi": 10,
  "kumi na tano": 15,
  "ishirini": 20,
  "thelathini": 30,
  "arobaini": 40,
  "hamsini": 50,
  "sitini": 60,
  "sabini": 70,
  "themanini": 80,
  "tisini": 90,
  "mia": 100,
  "mia moja": 100,
  "mia mbili": 200,
  "mia tatu": 300,
  "mia nne": 400,
  "mia tano": 500,
};

/**
 * Parse a small Swahili number phrase into its numeric value.
 * e.g. "moja" -> 1, "mbili" -> 2, "2" -> 2, "2.5" -> 2.5, "kumi na tano" -> 15, "sabini na tano" -> 75
 */
export function parseSmallNumber(str) {
  if (!str) return null;
  const s = str.trim().toLowerCase();
  if (/^\d+(?:\.\d+)?$/.test(s)) return parseFloat(s);
  if (SWAHILI_NUMBER_WORDS[s] !== undefined) return SWAHILI_NUMBER_WORDS[s];

  // Compound tens + units: e.g. "kumi na tano" -> 15, "sabini na tano" -> 75
  const mTens = s.match(/^(ishirini|thelathini|arobaini|hamsini|sitini|sabini|themanini|tisini|kumi)\s+na\s+(moja|mbili|tatu|nne|tano|sita|saba|nane|tisa|nusu)$/);
  if (mTens) {
    const tens = SWAHILI_NUMBER_WORDS[mTens[1]] || 0;
    const units = SWAHILI_NUMBER_WORDS[mTens[2]] || 0;
    return tens + units;
  }

  // Hundreds + rest: e.g. "mia mbili na hamsini" -> 250, "mia moja na sabini" -> 170
  const mHund = s.match(/^(mia(?:\s+(?:moja|mbili|tatu|nne|tano|sita|saba|nane|tisa))?)(?:\s+na\s+(.+))?$/);
  if (mHund) {
    const hundVal = SWAHILI_NUMBER_WORDS[mHund[1]] || 100;
    if (mHund[2]) {
      const restVal = parseSmallNumber(mHund[2]);
      if (restVal !== null) return hundVal + restVal;
    } else {
      return hundVal;
    }
  }

  return null;
}

// Token patterns for matching Swahili number sequences
const NUM_TOKEN = '(?:\\d+(?:\\.\\d+)?|moja|mbili|tatu|nne|tano|sita|saba|nane|tisa|kumi|ishirini|thelathini|arobaini|hamsini|sitini|sabini|themanini|tisini|mia|nusu|robo)';
const NUM_PHRASE = `(?:${NUM_TOKEN}(?:\\s+na\\s+|\\s+)?)+`;


export function parseMoney(text = "") {
  if (!text || typeof text !== "string") return null;
  const lowered = text.toLowerCase().trim();

  // 1. East African Shilling Notation: "250,000/=", "250,000/-", "250000/="
  const slashEqualMatch = lowered.match(/(?:tsh|tzs|shilingi)?\s*([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{4,10})\s*(?:\/=|(?:\/-))\b/i);
  if (slashEqualMatch) {
    const val = Number(slashEqualMatch[1].replace(/,/g, ''));
    if (!isNaN(val)) return { value: val, currency: "TZS", confidence: 0.99, raw: slashEqualMatch[0].trim() };
  }

  // 2. Standard formatted comma numbers e.g. "TSh 250,000", "250,000", "15,000,000"
  const formattedMatch = lowered.match(/(?:tsh|tzs|shilingi)?\s*([0-9]{1,3}(?:,[0-9]{3})+)/i);
  if (formattedMatch) {
    const val = Number(formattedMatch[1].replace(/,/g, ''));
    if (!isNaN(val) && val >= 1000) {
      return { value: val, currency: "TZS", confidence: 0.99, raw: formattedMatch[0].trim() };
    }
  }

  // 3. Shorthand "X.Xm" / "Xm" / "X million"
  const mMatch = lowered.match(/(?:tsh|tzs)?\s*(\d+(?:\.\d+)?)\s*(?:m\b|million\b|milioni\b)/i);
  if (mMatch) {
    const num = Number(mMatch[1]);
    if (!isNaN(num)) return { value: Math.round(num * 1000000), currency: "TZS", confidence: 0.98, raw: mMatch[0].trim() };
  }

  // 4. Shorthand "Xk" / "X k"
  const kMatch = lowered.match(/(?:tsh|tzs)?\s*(\d+(?:\.\d+)?)\s*k\b/i);
  if (kMatch) {
    const num = Number(kMatch[1]);
    if (!isNaN(num)) return { value: Math.round(num * 1000), currency: "TZS", confidence: 0.98, raw: kMatch[0].trim() };
  }

  // 5. Special Compound: "laki X na nusu milioni" -> X*100,000 + 500,000 (e.g. "laki mbili na nusu milioni" = 700,000)
  const lakiNaMilioniMatch = lowered.match(new RegExp(`\\blaki\\s+(${NUM_TOKEN})\\s+na\\s+nusu\\s+milioni\\b`, 'i'));
  if (lakiNaMilioniMatch) {
    const lakiCount = parseSmallNumber(lakiNaMilioniMatch[1]) ?? 1;
    const total = Math.round(lakiCount * 100000 + 500000);
    return { value: total, currency: "TZS", confidence: 0.99, raw: lakiNaMilioniMatch[0].trim() };
  }

  // 6. Compound: "milioni X na laki Y" e.g. "milioni moja na laki tano" (1.5M), "milioni 2 na laki 3" (2.3M)
  const milLakiMatch = lowered.match(new RegExp(`\\bmilioni\\s+(${NUM_TOKEN})\\s+na\\s+laki\\s+(${NUM_TOKEN})\\b`, 'i'));
  if (milLakiMatch) {
    const milNum = parseSmallNumber(milLakiMatch[1]);
    const lakiNum = parseSmallNumber(milLakiMatch[2]);
    if (milNum !== null && lakiNum !== null) {
      return { value: Math.round(milNum * 1000000 + lakiNum * 100000), currency: "TZS", confidence: 0.99, raw: milLakiMatch[0].trim() };
    }
  }

  // 7. Compound: "milioni X na nusu" e.g. "milioni moja na nusu" (1.5M), "milioni mbili na nusu" (2.5M), "milioni 2 na nusu"
  const milNusuMatch = lowered.match(new RegExp(`\\bmilioni\\s+(${NUM_TOKEN})\\s+na\\s+nusu\\b`, 'i'));
  if (milNusuMatch) {
    const base = parseSmallNumber(milNusuMatch[1]) ?? 1;
    return { value: Math.round((base + 0.5) * 1000000), currency: "TZS", confidence: 0.99, raw: milNusuMatch[0].trim() };
  }

  // 8. Compound: "nusu milioni" (500,000)
  if (/\bnusu\s+milioni\b/i.test(lowered)) {
    return { value: 500000, currency: "TZS", confidence: 0.99, raw: "nusu milioni" };
  }

  // 9. Compound: "laki X na nusu" e.g. "laki mbili na nusu", "laki 2 na nusu", "laki moja na nusu"
  const lakiNusuMatch = lowered.match(new RegExp(`\\blaki\\s+(${NUM_TOKEN})\\s+na\\s+nusu\\b`, 'i'));
  if (lakiNusuMatch) {
    const base = parseSmallNumber(lakiNusuMatch[1]);
    if (base !== null) {
      return { value: Math.round((base + 0.5) * 100000), currency: "TZS", confidence: 0.99, raw: lakiNusuMatch[0].trim() };
    }
  }

  // 10. Compound: "nusu laki" (50,000)
  if (/\bnusu\s+laki\b/i.test(lowered)) {
    return { value: 50000, currency: "TZS", confidence: 0.99, raw: "nusu laki" };
  }

  // 11. Compound: "laki X na elfu Y" e.g. "laki mbili na elfu hamsini" (250,000), "laki moja na elfu sabini" (170,000)
  const lakiElfuMatch = lowered.match(new RegExp(`\\blaki\\s+(${NUM_TOKEN})\\s+na\\s+elfu\\s+(${NUM_PHRASE.trim()})`, 'i'));
  if (lakiElfuMatch) {
    const lakiBase = parseSmallNumber(lakiElfuMatch[1]);
    const elfuBase = parseSmallNumber(lakiElfuMatch[2].trim());
    if (lakiBase !== null && elfuBase !== null) {
      return { value: Math.round(lakiBase * 100000 + elfuBase * 1000), currency: "TZS", confidence: 0.99, raw: lakiElfuMatch[0].trim() };
    }
  }

  // 12. Compound: Colloquial "laki X [na] Y" where Y is tens (representing thousands without "elfu")
  // e.g. "laki moja na sabini" (170,000), "laki moja sabini" (170,000), "laki moja na sabini tu", "laki mbili na hamsini" (250,000)
  const colloquialLakiMatch = lowered.match(/laki\s+([a-z0-9]+)(?:\s+na)?\s+(hamsini|sitini|sabini|themanini|tisini|arobaini|thelathini|ishirini|kumi(?:\s+na\s+(?:tano|moja|mbili|tatu|nne|sita|saba|nane|tisa))?)(?:\s+(?:tu|hivi|kama|pekee|kamili)|\b|$)/i);
  if (colloquialLakiMatch) {
    const lakiBase = parseSmallNumber(colloquialLakiMatch[1]);
    const extraThousand = parseSmallNumber(colloquialLakiMatch[2]);
    if (lakiBase !== null && extraThousand !== null) {
      return { value: Math.round(lakiBase * 100000 + extraThousand * 1000), currency: "TZS", confidence: 0.99, raw: colloquialLakiMatch[0].trim() };
    }
  }

  // 13. Unit: Simple "milioni [word/number]" e.g. "milioni 2", "milioni moja", "milioni kumi na tano"
  const singleMilMatch = lowered.match(new RegExp(`\\bmilioni\\s+(${NUM_PHRASE.trim()})`, 'i'));
  if (singleMilMatch) {
    const num = parseSmallNumber(singleMilMatch[1].trim());
    if (num !== null) {
      return { value: Math.round(num * 1000000), currency: "TZS", confidence: 0.99, raw: singleMilMatch[0].trim() };
    }
  }

  // 14. Unit: Simple "laki [word/number]" or "[number] laki" e.g. "laki moja", "laki 2", "laki mbili", "laki tatu", "laki tano", "3 laki"
  const singleLakiMatch = lowered.match(new RegExp(`\\blaki\\s+(${NUM_TOKEN})\\b`, 'i')) ||
                          lowered.match(/(\d+(?:\.\d+)?)\s*laki\b/i);
  if (singleLakiMatch) {
    const num = parseSmallNumber(singleLakiMatch[1]);
    if (num !== null) {
      return { value: Math.round(num * 100000), currency: "TZS", confidence: 0.99, raw: singleLakiMatch[0].trim() };
    }
  }

  // 15. Unit: "elfu [word/number]" e.g. "elfu hamsini", "elfu sabini na tano", "elfu 50", "elfu mia mbili na hamsini"
  const singleElfuMatch = lowered.match(new RegExp(`\\belfu\\s+(${NUM_PHRASE.trim()})`, 'i'));
  if (singleElfuMatch) {
    const num = parseSmallNumber(singleElfuMatch[1].trim());
    if (num !== null) {
      return { value: Math.round(num * 1000), currency: "TZS", confidence: 0.99, raw: singleElfuMatch[0].trim() };
    }
  }

  // 16. Unit: Raw digits (5 to 10 digits) e.g. "250000", "nina 500000"
  const rawDigitMatch = lowered.match(/(?:budget|bajeti|tsh|tzs|shilingi|nina|tuna|ya)?\s*([0-9]{5,10})\b/i);
  if (rawDigitMatch && rawDigitMatch[1]) {
    const num = Number(rawDigitMatch[1]);
    if (!isNaN(num) && num >= 10000) {
      return { value: num, currency: "TZS", confidence: 0.92, raw: rawDigitMatch[0].trim() };
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// 3. Guest Count Parsing
// ---------------------------------------------------------------------------
export function parseGuests(text = "") {
  if (!text || typeof text !== "string") return null;
  const lowered = text.toLowerCase();

  // 0. Negation/correction pattern: "hapana X tu" / "si X" / "actually X" / "make it X" — treat as replacement
  //    These are handled by intent classifier later; we just extract the number here
  const hapanaMatch = lowered.match(/(?:hapana|si\s+(?:watu|wageni)?|actually|badala yake|make\s+it|let'?s\s+do|change\s+to|no[,\s]+(?:its?|it'?s?\s*)?)[\s,]*(?:watu|wageni)?\s*(\d{1,4})\s*(?:tu\b|only\b)?/);
  if (hapanaMatch) {
    const num = Number(hapanaMatch[1]);
    if (!isNaN(num) && num >= 1 && num <= 5000) {
      return { value: num, approximate: false, isDelta: false, deltaValue: 0, confidence: 0.98, raw: hapanaMatch[0] };
    }
  }

  // 1. Delta additions/subtractions: e.g. "+50 wageni", "add 100 more guests", "ongeza watu 50"
  const addMatch = lowered.match(/(?:\+|add|ongeza|ongeza\s*zaidi)\s*(\d+)\s*(?:more\s+)?(?:guests?|wageni|people|watu)?/);
  if (addMatch) {
    return {
      value: Number(addMatch[1]),
      approximate: false,
      isDelta: true,
      deltaValue: Number(addMatch[1]),
      confidence: 0.99,
      raw: addMatch[0]
    };
  }

  const subMatch = lowered.match(/(?:-|punguza|reduce|remove)\s*(\d+)\s*(?:guests?|wageni|people|watu)?/);
  if (subMatch && !lowered.includes("decoration") && !lowered.includes("mapambo") && !lowered.includes("mc")) {
    return {
      value: Number(subMatch[1]),
      approximate: false,
      isDelta: true,
      deltaValue: -Number(subMatch[1]),
      confidence: 0.95,
      raw: subMatch[0]
    };
  }

  // 2. Swahili word counts e.g. "watu mia moja" (100), "watu mia mbili" (200), "watu hamsini" (50)
  const swahiliWordCountMatch = lowered.match(/(?:watu|wageni|people|guests)\s*(mia\s*tano|mia\s*nne|mia\s*tatu|mia\s*mbili|mia\s*moja|hamsini|arobaini|thelathini|ishirini)/);
  if (swahiliWordCountMatch) {
    const word = swahiliWordCountMatch[1];
    const count = SWAHILI_NUMBER_WORDS[word] || 100;
    return {
      value: count,
      approximate: false,
      isDelta: false,
      deltaValue: 0,
      confidence: 0.98,
      raw: swahiliWordCountMatch[0]
    };
  }

  // 3. Approximate expressions: e.g. "watu kama 80 hivi", "around 100 people", "about 23", "roughly 150 guests", "150 hivi"
  const approxMatch = lowered.match(/(?:watu\s*kama|takriban|around|about|roughly|approximately|kama\s*watu|kama\s*wageni)\s*(\d+)\s*(?:guests?|wageni|people|watu|hivi)?/) ||
                      lowered.match(/(\d+)\s*(?:hivi|approx)/);
  if (approxMatch) {
    const num = Number(approxMatch[1]);
    if (!isNaN(num) && num >= 5 && num <= 5000) {
      return {
        value: num,
        approximate: true,
        isDelta: false,
        deltaValue: 0,
        confidence: 0.96,
        raw: approxMatch[0]
      };
    }
  }

  // 4. Standard explicit guest mentions: "80 guests", "watu 80", "wageni 100", "for 150 people"
  // Also handles "Wageni wanakuwa 150", "watu ni 120", "tutakuwa watu 200" Swahili correction forms
  // Also handles common typos: "wagen wapo 23" (wagen = wageni typo)
  const explicitMatch = lowered.match(/(\d+)\s*(?:guests?|wageni|people|watu)\b/) ||
                        lowered.match(/(?:for|kwa|watu|wageni|wagen)\s*(\d{1,4})\b/) ||
                        lowered.match(/(?:wageni|watu|wagen)\s+(?:wanakuwa|wapo|ni|watakuwa|tutakuwa|wakuwa|itakuwa)\s*(\d{1,4})\b/) ||
                        lowered.match(/(?:wanakuwa|tutakuwa|watakuwa|sasa\s+(?:watu|wageni))\s*(?:watu|wageni)?\s*(\d{1,4})\b/);
  if (explicitMatch) {
    const num = Number(explicitMatch[1]);
    if (!isNaN(num) && num >= 1 && num <= 5000) {
      return {
        value: num,
        approximate: false,
        isDelta: false,
        deltaValue: 0,
        confidence: 0.95,
        raw: explicitMatch[0]
      };
    }
  }

  // 5. Standalone clean integer between 1 and 3000 (context-dependent: only in guest-providing contexts)
  const standaloneMatch = lowered.match(/^\s*(\d{1,4})\s*$/);
  if (standaloneMatch) {
    const num = Number(standaloneMatch[1]);
    if (!isNaN(num) && num >= 1 && num <= 3000) {
      return {
        value: num,
        approximate: false,
        isDelta: false,
        deltaValue: 0,
        confidence: 0.85,
        raw: standaloneMatch[0]
      };
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// 4. Tanzanian Location Extraction
// ---------------------------------------------------------------------------
const TANZANIAN_LOCATIONS = [
  { name: "Dar es Salaam", aliases: ["dar es salaam", "dar", "dsm", "kinondoni", "ilala", "temeke", "ubungo", "kigamboni", "masaki", "mbezi", "mikocheni"] },
  { name: "Pwani", aliases: ["pwani", "coast", "kibaha", "bagamoyo", "chalinze", "kisarawe", "mkuranga", "rufiji"] },
  { name: "Arusha", aliases: ["arusha", "mto wa mbu", "karatu", "monduli", "tengeru", "usa river"] },
  { name: "Mwanza", aliases: ["mwanza", "rock city", "nyamagana", "ilemela", "magu", "sengerema"] },
  { name: "Dodoma", aliases: ["dodoma", "capital", "chamwino", "bahi"] },
  { name: "Zanzibar", aliases: ["zanzibar", "unguja", "pemba", "stone town", "fumba", "kendwa", "nungwi", "paje"] },
  { name: "Mbeya", aliases: ["mbeya", "tuyeni", "kyela", "ruangwa", "chunya"] },
  { name: "Morogoro", aliases: ["morogoro", "moro", "kilosa", "mvomero", "mikumi"] },
  { name: "Tanga", aliases: ["tanga", "lushoto", "muheza", "korogwe", "pangani"] },
  { name: "Kilimanjaro", aliases: ["kilimanjaro", "moshi", "hai", "marangu", "same", "mwanga"] },
  { name: "Iringa", aliases: ["iringa", "mafinga", "kilolo", "ruaha"] },
  { name: "Kigoma", aliases: ["kigoma", "ujiji", "kasulu"] },
  { name: "Tabora", aliases: ["tabora", "nzega", "igunga"] }
];

export function parseLocation(text = "") {
  if (!text || typeof text !== "string") return null;
  const lowered = text.toLowerCase();

  for (const loc of TANZANIAN_LOCATIONS) {
    for (const alias of loc.aliases) {
      const regex = new RegExp(`\\b${alias.replace(/\s+/g, "\\s+")}\\b`, "i");
      if (regex.test(lowered)) {
        return {
          value: loc.name,
          confidence: 0.98,
          raw: alias
        };
      }
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// 5. Date & Planning Timeline Extraction
// ---------------------------------------------------------------------------
const MONTHS_MAP = {
  january: "January", februari: "February", february: "February", machi: "March", march: "March",
  aprili: "April", april: "April", mei: "May", may: "May", juni: "June", june: "June",
  julai: "July", july: "July", agosti: "August", august: "August", septemba: "September", september: "September",
  oktoba: "October", october: "October", novemba: "November", november: "November", desemba: "December", december: "December"
};

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function parseDate(text = "") {
  if (!text || typeof text !== "string") return null;
  const lowered = text.toLowerCase();

  // Numeric formats: 20/12/2026, 20-12-2026, 20/12 (day-first, Tanzanian convention)
  const numeric = lowered.match(/\b([1-9]|[12]\d|3[01])[/\-]([1-9]|1[0-2])(?:[/\-](202[5-9]))?\b/);
  if (numeric) {
    const day = numeric[1];
    const monthName = MONTH_NAMES[Number(numeric[2]) - 1] || numeric[2];
    return {
      value: numeric[3] ? `${monthName} ${day}, ${numeric[3]}` : `${monthName} ${day}`,
      confidence: 0.95,
      raw: numeric[0]
    };
  }

  for (const [monthKey, monthName] of Object.entries(MONTHS_MAP)) {
    const regex = new RegExp(`\\b${monthKey}\\b`, "i");
    if (regex.test(lowered)) {
      const yearMatch = lowered.match(/\b(202[5-9])\b/);
      const dayMatch = lowered.match(/\b([1-9]|[12]\d|3[01])(?:st|nd|rd|th)?\b/);
      const val = yearMatch
        ? (dayMatch ? `${monthName} ${dayMatch[1]}, ${yearMatch[1]}` : `${monthName} ${yearMatch[1]}`)
        : (dayMatch ? `${monthName} ${dayMatch[1]}` : monthName);
      return { value: val, confidence: 0.95, raw: monthKey };
    }
  }

  if (/next\s*month|mwezi\s*ujao/i.test(lowered)) return { value: "Next Month", confidence: 0.9, raw: "next month" };
  if (/next\s*year|mwakani/i.test(lowered)) return { value: "Next Year", confidence: 0.9, raw: "next year" };

  return null;
}

// ---------------------------------------------------------------------------
// 6. Category & Requirement Parsing
// ---------------------------------------------------------------------------
export const CATEGORY_SYNONYMS = {
  catering: ["catering", "caterer", "chakula", "food", "menu", "vinywaji", "drinks", "kupika", "upishi", "bites"],
  venue: ["venue", "ukumbi", "kumbi", "hall", "garden", "bustani", "eneo", "hotel", "resort", "space"],
  decor: ["decor", "decoration", "mapambo", "wapambaji", "maua", "backdrop", "stage", "table dressing"],
  photography: ["photography", "photographer", "photo", "picha", "video", "videographer", "videography", "mpiga picha"],
  entertainment: ["entertainment", "mc", "dj", "muziki", "sound", "burudani", "emcee", "vipaza sauti"],
  transport: ["transport", "usafiri", "nauli", "magari", "gari", "convoy", "bridal car", "limo"],
  saloon: ["saloon", "salon", "barber", "barbershop", "makeup", "kupambwa", "nywele"]
};

export function parseCategory(text = "") {
  if (!text || typeof text !== "string") return null;
  const lowered = text.toLowerCase();

  for (const [cat, syns] of Object.entries(CATEGORY_SYNONYMS)) {
    for (const syn of syns) {
      const regex = new RegExp(`\\b${syn.replace(/\s+/g, "\\s+")}\\b`, "i");
      if (regex.test(lowered)) {
        return cat;
      }
    }
  }

  return null;
}

/**
 * Extract requirements, additions, or exclusions.
 * e.g. "sitaki DJ", "venue tayari ipo", "chakula lazima", "nataka mpiga picha", "nauli na chakula"
 */
export function parseRequirements(text = "") {
  if (!text || typeof text !== "string") return {};
  const lowered = text.toLowerCase();
  const reqs = {};

  // Negations / removals: "sitaki X", "bila X", "ondoa X", "no need for X", "X not needed", "X tayari ipo"
  const negationMatches = [
    { regex: /(?:sitaki|bila|ondoa|remove|no need for|cut|tayari\s*ipo|already\s*sorted|already\s*have)\s+(?:the\s+)?(mc|dj|entertainment|muziki|decor|decoration|mapambo|wapambaji|transport|usafiri|nauli|photography|photo|picha|venue|ukumbi|kumbi|catering|chakula)/gi, value: false },
    { regex: /(mc|dj|entertainment|muziki|decor|decoration|mapambo|wapambaji|transport|usafiri|nauli|photography|photo|picha|venue|ukumbi|kumbi|catering|chakula)\s+(?:tayari\s*ipo|already\s*sorted|already\s*have|sihitaji|sitaki)/gi, value: false }
  ];

  for (const neg of negationMatches) {
    let match;
    while ((match = neg.regex.exec(lowered)) !== null) {
      const cat = parseCategory(match[1]);
      if (cat) reqs[cat] = false;
    }
  }

  // Affirmations: "nataka X", "lazima X", "muhimu X", "weka X", "need X", "kwa ajili ya X"
  const affirmRegex = /(?:nataka|lazima|muhimu|weka|need|want|include|kwa\s+ajili\s+ya)\s+(?:the\s+)?(mc|dj|entertainment|muziki|decor|decoration|mapambo|wapambaji|transport|usafiri|nauli|photography|photo|picha|venue|ukumbi|kumbi|catering|chakula)/gi;
  let affMatch;
  while ((affMatch = affirmRegex.exec(lowered)) !== null) {
    const cat = parseCategory(affMatch[1]);
    if (cat && reqs[cat] === undefined) reqs[cat] = true;
  }

  // Category pairings / listings: e.g. "nauli na chakula", "chakula na mapambo"
  const listPairRegex = /\b(mc|dj|entertainment|muziki|decor|decoration|mapambo|wapambaji|transport|usafiri|nauli|photography|photo|picha|venue|ukumbi|kumbi|catering|chakula)\s+na\s+(mc|dj|entertainment|muziki|decor|decoration|mapambo|wapambaji|transport|usafiri|nauli|photography|photo|picha|venue|ukumbi|kumbi|catering|chakula)\b/gi;
  let pairMatch;
  while ((pairMatch = listPairRegex.exec(lowered)) !== null) {
    const c1 = parseCategory(pairMatch[1]);
    const c2 = parseCategory(pairMatch[2]);
    if (c1 && reqs[c1] === undefined) reqs[c1] = true;
    if (c2 && reqs[c2] === undefined) reqs[c2] = true;
  }

  return reqs;
}

// ---------------------------------------------------------------------------
// 7. Priority Parsing ("food ndio priority", "photography ni muhimu", "chakula kwanza")
// ---------------------------------------------------------------------------
const PRIORITY_PATTERNS = [
  // "X ndio priority", "X is priority", "X ni muhimu", "X kwanza"
  /(\w+)\s+(?:ndio\s+priority|is\s+(?:the\s+)?priority|ni\s+muhimu|kwanza|first|most\s+important)/i,
  // "priority ni X", "priority is X", "muhimu ni X"
  /(?:priority|kipaumbele|muhimu)\s+(?:ni|is|ya)\s+(\w+)/i,
  // "nataka X iwe nzuri", "I want good X"
  /(?:nataka|i\s+want)\s+(\w+)\s+(?:iwe\s+nzuri|to\s+be\s+good|iwe\s+bora|bora)/i,
  // "X but isiwe expensive" — implies priority BUT cost conscious
  /(\w+)\s+(?:but|lakini)\s+(?:isiwe|si|not)\s+(?:expensive|ghali|sana)/i,
];

export function parsePriorities(text = "") {
  if (!text || typeof text !== "string") return [];
  const lowered = text.toLowerCase();
  const found = new Set();

  for (const pattern of PRIORITY_PATTERNS) {
    const m = lowered.match(pattern);
    if (m) {
      const word = (m[1] || m[2] || "").toLowerCase().trim();
      const cat = parseCategory(word);
      if (cat) found.add(cat);
    }
  }

  // Also check: "make it classy" / "simple" / "premium" as plan-level priority signals
  // These are handled by intent classifier separately

  return [...found];
}

/**
 * Full Structured Natural Language Parsing Pipeline
 */
export function parseInput(text = "", prevContext = {}) {
  const language = detectLanguage(text, prevContext.language);
  const money = parseMoney(text);
  const guests = parseGuests(text);
  const location = parseLocation(text);
  const eventType = identifyEventType(text);
  const date = parseDate(text);
  const category = parseCategory(text);
  const requirements = parseRequirements(text);
  const priorities = parsePriorities(text);

  return {
    rawText: text,
    language,
    entities: {
      budget: money,
      guests: guests,
      location: location,
      eventType: eventType ? eventType.id : null,
      eventDef: eventType,
      date: date,
      category: category,
      requirements: requirements,
      priorities: priorities
    }
  };
}

export default {
  detectLanguage,
  parseMoney,
  parseGuests,
  parseLocation,
  parseDate,
  parseCategory,
  parseRequirements,
  parsePriorities,
  parseInput
};
