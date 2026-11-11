const { chromium } = require('@playwright/test');
const path = require('path');

async function snapAll() {
  const browser = await chromium.launch({
    executablePath: 'C:/Users/libra051099/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe',
    headless: true
  });
  const outDir = 'C:/Users/libra051099/.gemini/antigravity/brain/37401341-12df-49f4-9dec-379084ab9fbc';

  // 1. Desktop Context
  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 2
  });
  const page = await context.newPage();
  console.log('Navigating to http://localhost:5174...');
  await page.goto('http://localhost:5174', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Desktop top hero screenshot
  await page.screenshot({ path: path.join(outDir, 'homepage_5174_refined.png'), fullPage: false });

  // Desktop full page screenshot
  await page.screenshot({ path: path.join(outDir, 'homepage_fullpage.png'), fullPage: true });

  // Open modal screenshot
  const bookBtn = await page.locator('button:has-text("Book Now"), button:has-text("Weka Nafasi")').first();
  if (await bookBtn.isVisible()) {
    await bookBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(outDir, 'booking_modal_rendered.png') });
  }

  // 2. Mobile Context (iPhone 14, 390x844)
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:5174', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({ path: path.join(outDir, 'homepage_5174_mobile_refined.png'), fullPage: false });
  await mobilePage.screenshot({ path: path.join(outDir, 'homepage_mobile_fullpage.png'), fullPage: true });

  await browser.close();
  console.log('All screenshots captured successfully!');
}

snapAll().catch(console.error);
