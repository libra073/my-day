const { chromium } = require('@playwright/test');
const path = require('path');

async function testScroll() {
  const browser = await chromium.launch({
    executablePath: 'C:/Users/libra051099/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe',
    headless: true
  });
  const outDir = 'C:/Users/libra051099/.gemini/antigravity/brain/37401341-12df-49f4-9dec-379084ab9fbc';
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 2 });
  await page.goto('http://localhost:5174', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Position 1: Top (Hero)
  await page.screenshot({ path: path.join(outDir, 'scroll_0_hero.png') });

  // Position 2: Categories & Feature Spotlight (scroll to 800px)
  await page.evaluate(() => window.scrollTo(0, 750));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, 'scroll_1_categories.png') });

  // Position 3: Featured Vendors (scroll to 1600px)
  await page.evaluate(() => window.scrollTo(0, 1600));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, 'scroll_2_vendors.png') });

  // Position 4: Trust & Office / Contact (scroll to 2500px)
  await page.evaluate(() => window.scrollTo(0, 2600));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, 'scroll_3_contact.png') });

  await browser.close();
  console.log('Scroll screenshots saved!');
}

testScroll().catch(console.error);
