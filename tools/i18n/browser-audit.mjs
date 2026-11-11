/**
 * Browser-driven bilingual audit.
 * Visits every route in English and Kiswahili, collects visible copy, and
 * flags:
 *   - English leaks in the Kiswahili UI (and vice versa)
 *   - mixed-language sentences
 *   - horizontal overflow at desktop + phone widths
 *
 * Requires the dev server on http://localhost:5173.
 * Run: node tools/i18n/browser-audit.mjs [--headful]
 */
import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = process.env.I18N_BASE || 'http://localhost:5173';
const headful = process.argv.includes('--headful');

const SW = new Set(('na ya wa kwa ni la za katika kutoka weka chagua tafuta tazama ghairi hifadhi ongeza harusi '
  + 'sherehe mtoa huduma bei tarehe jina barua nenosiri akaunti ingia fungua wasiliana msaada malipo nafasi '
  + 'kumbi wapambaji chakula usafiri mwaliko mgeni bajeti orodha mipango ratiba taarifa thibitisha angalia rudi '
  + 'endelea tafadhali samahani karibu asante ndiyo hapana kila yote zote hii hiyo huo huu wako yako lako chako '
  + 'wetu yetu zako wake wao yeye mimi wewe sisi ninyi huyu huyo vile pia bado sasa leo kesho jana wiki mwezi '
  + 'mwaka siku saa dakika gharama punguzo kwanza mwisho mpya kubwa ndogo nzuri bora zaidi kidogo sana kama ili '
  + 'hata lakini au pamoja bila ndani juu chini mbele nyuma kati kote mahali hapa pale huko huku hivyo').split(/\s+/));

const EN = new Set(('the and or to of in on with for your our you we is are will can this that from by at as '
  + 'please enter book view save cancel search loading try again see details all categories select date time '
  + 'name email password phone price order payment deposit total amount add remove delete edit update confirm '
  + 'back next continue finish close open start end new more less show hide yes ok done error success required '
  + 'invalid message welcome sign login register account profile dashboard settings help support about contact '
  + 'us home browse vendors services wedding event guests budget task schedule notes review rating verified '
  + 'featured available booked pending approve reject couple bride groom planner right left').split(/\s+/));

const ROUTES = [
  ['/', 'home'],
  ['/marketplace', 'marketplace'],
  ['/login', 'login'],
  ['/register', 'register'],
  ['/become-vendor', 'become-vendor'],
  ['/contact', 'contact'],
  ['/planner', 'planner'],
  ['/wedding', 'wedding'],
  ['/bookings', 'bookings'],
  ['/vendor/kumbi/venue-1', 'vendor-detail'],
];

const stats = (text) => {
  const words = (text.toLowerCase().match(/[a-z']{2,}/g) || []);
  let sw = 0;
  for (const w of words) if (SW.has(w)) sw++;
  let en = 0;
  for (const w of words) if (EN.has(w)) en++;
  return { words: words.length, sw, en };
};

const collect = () => {
  const out = [];
  const seen = new Set();
  const add = (text, where) => {
    const t = (text || '').replace(/\s+/g, ' ').trim();
    if (t.length < 3 || seen.has(t + where)) return;
    seen.add(t + where);
    out.push({ text: t, where });
  };
  document.querySelectorAll('h1,h2,h3,h4,h5,p,span,button,a,label,li,th,td,option,legend,summary').forEach((el) => {
    if (el.children.length > 0) return;
    // vendor-supplied descriptions are content, never auto-translated
    if (el.closest('.vd-main-card')) return;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    if (r.width === 0 || r.height === 0 || cs.visibility === 'hidden' || cs.display === 'none') return;
    add(el.textContent, el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(/\s+/)[0] : ''));
  });
  document.querySelectorAll('input,textarea,select').forEach((el) => {
    if (el.placeholder) add(el.placeholder, 'placeholder');
    if (el.getAttribute('aria-label')) add(el.getAttribute('aria-label'), 'aria-label');
    if (el.title) add(el.title, 'title');
  });
  return out;
};

const overflow = () => {
  const vw = window.innerWidth;
  const doc = document.documentElement;
  const clipped = [];
  const inScroller = (el) => {
    for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (/(auto|scroll)/.test(cs.overflowX)) return true;
    }
    return false;
  };
  document.querySelectorAll('button,a,[role="button"],h1,h2,h3')?.forEach?.((el) => {
    const r = el.getBoundingClientRect();
    if (inScroller(el)) return;
    if (r.width && r.height && (r.right > vw + 1 || r.left < -1)) {
      clipped.push({ text: (el.textContent || '').trim().slice(0, 40), right: Math.round(r.right), left: Math.round(r.left) });
    }
  });
  return { scrollWidth: doc.scrollWidth, vw, overflow: doc.scrollWidth > vw + 2, clipped: clipped.slice(0, 5) };
};

const browser = await chromium.launch({ channel: 'chrome', headless: !headful });
const leaks = [];
const overflowIssues = [];

async function setLang(page, lang) {
  if (page.url() === 'about:blank') {
    await page.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  }
  await page.evaluate((l) => localStorage.setItem('myday_lang', l), lang);
}

async function login(page, email) {
  await page.goto(BASE + '/login', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
  await page.fill('#ax-email', email);
  await page.fill('#ax-password', 'password123');
  await page.click('.ax-submit');
  for (let i = 0; i < 12; i++) {
    await page.waitForTimeout(2500);
    if (!page.url().endsWith('/login')) break;
  }
}

const viewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'phone', width: 402, height: 874, isMobile: true, hasTouch: true },
];

for (const vp of viewports) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1, isMobile: vp.isMobile || false, hasTouch: vp.hasTouch || false });
  const page = await ctx.newPage();
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));

  if (vp.name === 'desktop') await login(page, 'john@myday.co.tz');

  for (const [route, name] of ROUTES) {
    for (const lang of ['en', 'sw']) {
      await setLang(page, lang);
      await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(1800);
      const nodes = await page.evaluate(collect);
      for (const node of nodes) {
        const s = stats(node.text);
        const isEnglishLeak = lang === 'sw' && s.en >= 2 && s.en > s.sw;
        const isSwahiliLeak = lang === 'en' && s.sw >= 2 && s.sw > s.en;
        const mixed = s.en >= 2 && s.sw >= 2 && Math.min(s.en, s.sw) / Math.max(s.en, s.sw) > 0.35;
        if (isEnglishLeak || isSwahiliLeak || mixed) {
          leaks.push({ viewport: vp.name, route, name, lang, kind: isEnglishLeak ? 'ENGLISH_IN_SW' : isSwahiliLeak ? 'SWAHILI_IN_EN' : 'MIXED', where: node.where, text: node.text.slice(0, 130) });
        }
      }
      const ov = await page.evaluate(overflow);
      if (ov.overflow || ov.clipped.length) {
        overflowIssues.push({ viewport: vp.name, route, name, lang, ...ov });
      }
    }
  }
  if (pageErrors.length) console.log(`page errors (${vp.name}):`, pageErrors.slice(0, 3));
  await ctx.close();
}

await browser.close();

const byKind = { ENGLISH_IN_SW: 0, SWAHILI_IN_EN: 0, MIXED: 0 };
for (const l of leaks) byKind[l.kind]++;

console.log(JSON.stringify({ leaks: leaks.length, byKind, overflowIssues: overflowIssues.length }, null, 2));

const group = new Map();
for (const l of leaks) {
  const key = `${l.name} [${l.viewport}/${l.lang}]`;
  if (!group.has(key)) group.set(key, []);
  group.get(key).push(l);
}
for (const [key, list] of group) {
  console.log(`\n### ${key} (${list.length})`);
  for (const l of list.slice(0, 12)) console.log(`  [${l.kind}] ${l.where}: ${l.text}`);
}
if (overflowIssues.length) {
  console.log('\n### OVERFLOW');
  for (const o of overflowIssues.slice(0, 12)) console.log(`  ${o.name} ${o.viewport}/${o.lang}: scrollW=${o.scrollWidth} vw=${o.vw} ${JSON.stringify(o.clipped)}`);
}

fs.writeFileSync('scratch/i18n-browser-audit.json', JSON.stringify({ leaks, overflowIssues }, null, 2));
if (leaks.some((l) => l.kind === 'ENGLISH_IN_SW' || l.kind === 'SWAHILI_IN_EN')) process.exitCode = 1;
