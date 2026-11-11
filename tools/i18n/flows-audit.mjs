/**
 * Flow-level bilingual QA: authenticated dashboards, validation errors,
 * booking/payment modals and the AI planner.
 * Requires the dev server on http://localhost:5173.
 *
 * Run: node tools/i18n/flows-audit.mjs
 */
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.env.I18N_BASE || 'http://localhost:5173';
const SW = new Set(('na ya wa kwa ni la za katika kutoka weka chagua tafuta tazama ghairi hifadhi ongeza harusi '
  + 'sherehe mtoa huduma bei tarehe jina barua nenosiri akaunti ingia fungua wasiliana msaada malipo nafasi '
  + 'kumbi wapambaji chakula usafiri mwaliko mgeni bajeti orodha mipango ratiba taarifa thibitisha angalia rudi '
  + 'endelea tafadhali samahani karibu asante ndiyo hapana kila yote zote hii hiyo huo huu wako yako lako chako '
  + 'wetu yetu zako wake wao yeye mimi wewe sisi ninyi huyu huyo vile pia bado sasa leo kesha jana wiki mwezi '
  + 'mwaka siku saa dakika gharama punguzo kwanza mwisho mpya kubwa ndogo nzuri bora zaidi kidogo sana kama ili '
  + 'hata lakini au pamoja bila ndani juu chini mbele nyuma kati kote mahali hapa pale huko huku hivyo').split(/\s+/));
const EN = new Set(('the and or to of in on with for your our you we is are will can this that from by at as '
  + 'please enter book view save cancel search loading try again see details all categories select date time '
  + 'name email password phone price order payment deposit total amount add remove delete edit update confirm '
  + 'back next continue finish close open start end new more less show hide yes ok done error success required '
  + 'invalid message welcome sign login register account profile dashboard settings help support about contact '
  + 'us home browse vendors services wedding event guests budget task schedule notes review rating verified '
  + 'featured available booked pending approve reject couple bride groom planner right left').split(/\s+/));

const results = [];
const record = (name, pass, detail = '') => {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
};

const stats = (text) => {
  const words = (text.toLowerCase().match(/[a-z']{2,}/g) || []);
  let sw = 0;
  for (const w of words) if (SW.has(w)) sw++;
  let en = 0;
  for (const w of words) if (EN.has(w)) en++;
  return { words: words.length, sw, en };
};

const collectText = () => {
  const out = [];
  document.querySelectorAll('h1,h2,h3,h4,p,span,button,a,label,li,th,td,option,legend,summary').forEach((el) => {
    if (el.children.length > 0) return;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    if (r.width === 0 || r.height === 0 || cs.visibility === 'hidden') return;
    const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
    if (t.length >= 3 && t.length < 160) out.push(t);
  });
  return [...new Set(out)];
};

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await ctx.newPage();
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(e.message));

const setLang = async (lang) => {
  if (page.url() === 'about:blank') await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  await page.evaluate((l) => localStorage.setItem('myday_lang', l), lang);
};

const login = async (email, password = 'password123') => {
  await page.goto(BASE + '/login', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1400);
  await page.fill('#ax-email', email);
  await page.fill('#ax-password', password);
  await page.click('.ax-submit');
  for (let i = 0; i < 12; i++) {
    await page.waitForTimeout(2200);
    if (!page.url().endsWith('/login')) break;
  }
};

/** visible English leaks on an authenticated page in Kiswahili mode */
const pageLeaks = async (route, name) => {
  await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2200);
  const texts = await page.evaluate(collectText);
  const leaks = texts.filter((t) => {
    const s = stats(t);
    return s.en >= 2 && s.en > s.sw;
  });
  record(`SW page clean: ${name}`, leaks.length === 0, leaks.slice(0, 3).join(' | '));
  return leaks;
};

try {
  /* ---------------- live language switching ---------------- */
  await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1600);
  await page.evaluate(() => localStorage.setItem('myday_lang', 'en'));
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const navEn = await page.locator('.cl-lang button').first().innerText().catch(() => '');
  record('header language control shows English / Kiswahili', /english/i.test(navEn), navEn.trim());

  await page.locator('.cl-lang button').nth(1).click();
  await page.waitForTimeout(900);
  const afterSwitch = await page.evaluate(() => ({
    lang: localStorage.getItem('myday_lang'),
    nav: document.querySelector('.cl-links .cl-link span')?.textContent || '',
  }));
  record('switching to Kiswahili updates the UI without reload', afterSwitch.lang === 'sw' && /Mwanzo/.test(afterSwitch.nav), JSON.stringify(afterSwitch));

  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const persisted = await page.evaluate(() => document.querySelector('.cl-links .cl-link span')?.textContent || '');
  record('Kiswahili preference persists after reload', /Mwanzo/.test(persisted), persisted);

  await page.locator('.cl-lang button').first().click();
  await page.waitForTimeout(800);
  const backEn = await page.evaluate(() => document.querySelector('.cl-links .cl-link span')?.textContent || '');
  record('switching back to English works', /Home/.test(backEn), backEn);

  // form state must survive a language switch (use the hero search field)
  await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1600);
  const search = page.locator('.hero-glass-instrument input').first();
  await search.fill('kumbi');
  await page.locator('.cl-lang button').nth(1).click();
  await page.waitForTimeout(800);
  const kept = await search.inputValue();
  record('form state survives a language switch', kept === 'kumbi', kept);

  // auth screens have their own compact switch
  await page.goto(BASE + '/login', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
  await page.locator('.ax-lang button').nth(1).click();
  await page.waitForTimeout(700);
  const authTitle = await page.locator('.ax-title').innerText().catch(() => '');
  const authLang = await page.evaluate(() => localStorage.getItem('myday_lang'));
  record('auth screen language switch works', /Karibu/.test(authTitle) && authLang === 'sw', authTitle);
  await page.locator('.ax-lang button').first().click();
  await page.waitForTimeout(500);

  /* ---------------- Kiswahili validation + auth errors ---------------- */
  await setLang('sw');
  await page.goto(BASE + '/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.fill('#ax-email', 'john@myday.co.tz');
  await page.fill('#ax-password', 'wrongpassword');
  await page.click('.ax-submit');
  await page.waitForTimeout(3000);
  const loginErr = await page.locator('.ax-alert').innerText().catch(() => '');
  record('SW: wrong-password error is Kiswahili', /si sahihi|nenosiri/i.test(loginErr) && !/incorrect/i.test(loginErr), loginErr.replace(/\s+/g, ' ').slice(0, 80));

  await page.goto(BASE + '/register', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.click('.ax-submit');
  await page.waitForTimeout(1200);
  const regErr = await page.locator('.ax-alert').innerText().catch(() => '');
  record('SW: registration validation is Kiswahili', /weka|jina|barua|nenosiri|tafadhali/i.test(regErr) && !/please|enter/i.test(regErr), regErr.replace(/\s+/g, ' ').slice(0, 90));

  /* ---------------- customer pages ---------------- */
  await setLang('sw');
  await login('john@myday.co.tz');
  record('customer logged in', !page.url().endsWith('/login'), page.url().replace(BASE, ''));
  for (const [route, name] of [['/dashboard', 'dashboard'], ['/bookings', 'bookings'], ['/wedding', 'wedding profile'], ['/planner', 'AI planner']]) {
    await pageLeaks(route, name);
  }

  /* ---------------- AI planner answers in Kiswahili ---------------- */
  await page.goto(BASE + '/planner', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1800);
  const input = page.locator('input[placeholder], textarea').last();
  await input.fill('Nina bajeti ya milioni 15 na wageni 300 Dar es Salaam');
  await input.press('Enter');
  await page.waitForTimeout(6000);
  const chatText = await page.evaluate(() => [...document.querySelectorAll('[class*="chat"] p, [class*="message"] p, [class*="bubble"]')].map((e) => e.textContent).join(' '));
  const chatStats = stats(chatText);
  record('SW: AI planner replies in Kiswahili', chatStats.sw >= 3 && chatStats.sw > chatStats.en, `sw=${chatStats.sw} en=${chatStats.en}`);

  /* ---------------- vendor flow in Kiswahili ---------------- */
  await page.goto(BASE + '/vendor/kumbi/venue-1', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2200);
  const detailLeak = await page.evaluate(() => {
    const nodes = [...document.querySelectorAll('h1,h2,h3,button,label,th,span')].filter((el) => el.children.length === 0);
    return nodes.map((el) => el.textContent.trim()).filter((t) => t.length > 2 && t.length < 90);
  });
  const detailJunk = detailLeak.filter((t) => { const s = stats(t); return s.en >= 2 && s.en > s.sw; });
  record('SW: vendor detail interface labels', detailJunk.length === 0, detailJunk.slice(0, 3).join(' | '));

  /* ---------------- booking modal ---------------- */
  await page.locator('.cal-day:not(.is-booked):not(.is-past)').nth(12).click().catch(() => {});
  await page.waitForTimeout(500);
  await page.getByText(/Weka Nafasi|Book Now|Reserve Now/i).first().click().catch(() => {});
  await page.waitForTimeout(1800);
  const modalText = await page.locator('.modal-card').innerText().catch(() => '');
  const modalStats = stats(modalText);
  record('SW: booking modal copy is Kiswahili', modalStats.sw >= 3 && modalStats.sw > modalStats.en, `sw=${modalStats.sw} en=${modalStats.en} :: ${modalText.replace(/\s+/g, ' ').slice(0, 90)}`);

  /* ---------------- provider + admin ---------------- */
  await page.evaluate(() => localStorage.clear());
  await setLang('sw');
  await login('info@grandimperial.co.tz');
  await pageLeaks('/provider', 'provider portal');

  await page.evaluate(() => localStorage.clear());
  await setLang('sw');
  await login('admin@myday.co.tz');
  await pageLeaks('/admin', 'admin console');

  /* ---------------- English direction ---------------- */
  const pageLeaksEn = async (route, name) => {
    await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(2000);
    const texts = await page.evaluate(collectText);
    const leaks = texts.filter((t) => { const s = stats(t); return s.sw >= 2 && s.sw > s.en; });
    record(`EN page clean: ${name}`, leaks.length === 0, leaks.slice(0, 3).join(' | '));
  };
  await page.evaluate(() => localStorage.clear());
  await setLang('en');
  await login('john@myday.co.tz');
  await pageLeaksEn('/dashboard', 'dashboard (EN)');
  await pageLeaksEn('/bookings', 'bookings (EN)');
  await page.evaluate(() => localStorage.clear());
  await setLang('en');
  await login('info@grandimperial.co.tz');
  await pageLeaksEn('/provider', 'provider portal (EN)');
  await page.evaluate(() => localStorage.clear());
  await setLang('en');
  await login('admin@myday.co.tz');
  await pageLeaksEn('/admin', 'admin console (EN)');

  record('no runtime errors during bilingual flows', pageErrors.length === 0, pageErrors.slice(0, 2).join(' | '));
} catch (err) {
  record('flow audit completed', false, err.message.slice(0, 160));
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
fs.writeFileSync('scratch/i18n-flows-audit.json', JSON.stringify(results, null, 2));
if (failed.length) process.exitCode = 1;
