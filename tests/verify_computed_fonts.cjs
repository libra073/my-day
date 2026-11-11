const { chromium } = require('playwright');

const BASE_URL = 'http://localhost:5174';

const ROUTES = [
  { name: 'Marketplace', path: '/marketplace', hSelector: 'h1', pSelector: 'p' },
  { name: 'Vendor Detail', path: '/vendor/kumbi/venue-1', hSelector: 'h1.vd-name, h1', pSelector: '.vd-about, p' },
  { name: 'AI Planner', path: '/planner', hSelector: 'h1, h2, h3', pSelector: 'p' },
  { name: 'Wedding Profile', path: '/wedding', hSelector: 'h1, h2', pSelector: 'p' },
  { name: 'Login Auth', path: '/login', hSelector: 'h2, h3', pSelector: 'p, label' },
];

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:/Users/libra051099/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe',
    headless: true,
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('=== MULTI-PAGE TYPOGRAPHY CONSISTENCY AUDIT ===');
  for (const r of ROUTES) {
    await page.goto(`${BASE_URL}${r.path}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(200);

    const data = await page.evaluate((cfg) => {
      const heading = document.querySelector(cfg.hSelector);
      const paragraph = document.querySelector(cfg.pSelector);
      const btn = document.querySelector('button');

      const csH = heading ? window.getComputedStyle(heading) : null;
      const csP = paragraph ? window.getComputedStyle(paragraph) : null;
      const csB = btn ? window.getComputedStyle(btn) : null;

      return {
        headingFont: csH?.fontFamily,
        headingWeight: csH?.fontWeight,
        paragraphFont: csP?.fontFamily,
        paragraphWeight: csP?.fontWeight,
        buttonFont: csB?.fontFamily,
        buttonWeight: csB?.fontWeight,
      };
    }, r);

    console.log(`✓ ${r.name}:`);
    console.log(`   Heading: ${data.headingFont?.slice(0, 35)}... (wt ${data.headingWeight})`);
    console.log(`   Body:    ${data.paragraphFont?.slice(0, 35)}... (wt ${data.paragraphWeight})`);
    console.log(`   Button:  ${data.buttonFont?.slice(0, 35)}... (wt ${data.buttonWeight})`);
  }

  await browser.close();
})();
