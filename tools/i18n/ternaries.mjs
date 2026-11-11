/**
 * Audit inline language ternaries in JSX/JS:
 *   isSw ? 'kiswahili' : 'english'
 *   language === 'sw' ? 'kiswahili' : 'english'
 *   isSwahili ? ... : ...
 *
 * Flags:
 *  - English words sitting in the Kiswahili branch
 *  - Kiswahili words sitting in the English branch
 *  - branches that are identical
 *
 * Run: node tools/i18n/ternaries.mjs [--verbose]
 */
import fs from 'node:fs';
import path from 'node:path';

const verbose = process.argv.includes('--verbose');

const SW_WORDS = new Set(('na ya wa kwa ni la za katika kutoka weka chagua tafuta tazama ghairi hifadhi ongeza '
  + 'harusi sherehe mtoa huduma bei tarehe jina barua nenosiri akaunti ingia fungua wasiliana msaada malipo '
  + 'nafasi kumbi wapambaji chakula usafiri mwaliko mgeni bajeti orodha mipango ratiba taarifa thibitisha '
  + 'angalia rudi endelea tafadhali samahani karibu asante ndiyo hapana kila yote zote hii hiyo huo huu wako '
  + 'yako lako chako wetu yetu zako wake wao yeye mimi wewe sisi ninyi huyu huyo hilo hilo vile pia bado '
  + 'sasa leo kesho jana wiki mwezi mwaka siku saa dakika bei gharama punguzo la kwanza mwisho mpya '
  + 'kubwa ndogo nzuri bora zaidi kidogo sana kama ili hata lakini au pamoja bila ndani juu chini mbele '
  + 'nyuma kati kote kila mahali hapa pale huko huku hivyo hilo hili huyo hao hizo hizo hizo').split(/\s+/));

const EN_WORDS = new Set(('the and or to of in on with for your our you we is are will can this that from by at as '
  + 'please enter book view save cancel search loading try again see details all categories select date time '
  + 'name email password phone price order payment deposit total amount add remove delete edit update confirm '
  + 'back next continue finish close open start end new old more less show hide yes no ok done error success '
  + 'required invalid message welcome sign login register account profile dashboard settings help support '
  + 'about contact us home browse vendors services wedding event guests budget task schedule notes review '
  + 'rating verified featured available booked pending approve reject vendor couple bride groom planner').split(/\s+/));

const files = [];
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (['node_modules', 'dist', '.git'].includes(e.name)) continue;
      walk(f);
    } else if (/\.(jsx?|tsx?)$/.test(e.name)) files.push(f);
  }
}
walk('src');

const TERNARY = /\b(?:isSw|isSwahili|isKiswahili)\s*\?\s*(['"`])((?:\\.|(?!\1).)*)\1\s*:\s*(['"`])((?:\\.|(?!\3).)*)\3/g;
const TERNARY_LANG = /\blanguage\s*===\s*['"]sw['"]\s*\?\s*(['"`])((?:\\.|(?!\1).)*)\1\s*:\s*(['"`])((?:\\.|(?!\3).)*)\3/g;

const strip = (s) => s
  .replace(/\$\{[^}]*\}/g, ' ')
  .replace(/[{}]/g, ' ')
  .replace(/\\n/g, ' ');

const classify = (text) => {
  const words = strip(text).toLowerCase().match(/[a-z']{2,}/g) || [];
  let sw = 0;
  let en = 0;
  for (const w of words) {
    if (SW_WORDS.has(w)) sw++;
    if (EN_WORDS.has(w)) en++;
  }
  return { words: words.length, sw, en };
};

const issues = [];
for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  for (const re of [TERNARY, TERNARY_LANG]) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(src))) {
      const swRaw = m[2];
      const enRaw = m[4];
      const line = src.slice(0, m.index).split('\n').length;
      const swStats = classify(swRaw);
      const enStats = classify(enRaw);

      const swLooksEnglish = swStats.words >= 2 && swStats.en >= 2 && swStats.en >= swStats.sw;
      const enLooksSwahili = enStats.words >= 2 && enStats.sw >= 2 && enStats.sw >= enStats.en;
      const identical = swRaw.trim() === enRaw.trim();

      if (swLooksEnglish || enLooksSwahili || identical) {
        issues.push({
          file, line,
          kinds: [swLooksEnglish && 'ENGLISH_IN_SW', enLooksSwahili && 'SWAHILI_IN_EN', identical && 'IDENTICAL'].filter(Boolean),
          sw: swRaw.slice(0, 90),
          en: enRaw.slice(0, 90),
        });
      }
    }
  }
}

const byFile = new Map();
for (const it of issues) {
  if (!byFile.has(it.file)) byFile.set(it.file, []);
  byFile.get(it.file).push(it);
}

const counts = { total: issues.length, files: byFile.size, ENGLISH_IN_SW: 0, SWAHILI_IN_EN: 0, IDENTICAL: 0 };
for (const it of issues) for (const k of it.kinds) counts[k]++;

console.log(JSON.stringify(counts, null, 2));
for (const [file, list] of [...byFile.entries()].sort((a, b) => b[1].length - a[1].length)) {
  console.log(`\n${file} (${list.length})`);
  for (const it of (verbose ? list : list.slice(0, 6))) {
    console.log(`  L${it.line} [${it.kinds.join('+')}] SW="${it.sw}" EN="${it.en}"`);
  }
}

if (counts.ENGLISH_IN_SW + counts.SWAHILI_IN_EN > 0) process.exitCode = 1;
