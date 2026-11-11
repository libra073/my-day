const { chromium } = require('@playwright/test');
const path = require('path');

async function main() {
  const browser = await chromium.launch({
    executablePath: 'C:/Users/libra051099/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe',
    headless: true
  });
  const outDir = 'C:/Users/libra051099/.gemini/antigravity/brain/37401341-12df-49f4-9dec-379084ab9fbc';

  const context = await browser.newContext({
    viewport: { width: 1440, height: 1800 },
    deviceScaleFactor: 2
  });
  const page = await context.newPage();

  // 1. Light Mode
  await page.goto('http://localhost:5174/become-vendor', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.setItem('myday_theme', 'light');
    document.documentElement.setAttribute('data-theme', 'light');
    document.body.setAttribute('data-theme', 'light');
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, 'bv_light_full.png'), fullPage: true });
  console.log('Captured bv_light_full.png');

  // 2. Dark Mode Desktop
  await page.evaluate(() => {
    localStorage.setItem('myday_theme', 'dark');
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.setAttribute('data-theme', 'dark');
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, 'bv_dark_full.png'), fullPage: true });
  console.log('Captured bv_dark_full.png');

  // 3. Dark Mode Mobile
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:5174/become-vendor', { waitUntil: 'networkidle' });
  await mobilePage.evaluate(() => {
    localStorage.setItem('myday_theme', 'dark');
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.setAttribute('data-theme', 'dark');
  });
  await mobilePage.reload({ waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(500);
  await mobilePage.screenshot({ path: path.join(outDir, 'bv_dark_mobile.png'), fullPage: true });
  console.log('Captured bv_dark_mobile.png');

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
