import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function capture() {
  const artifactDir = 'C:/Users/libra051099/.gemini/antigravity/brain/826a53e1-734d-4f8b-bd2a-9cd01606e0fc';
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch (e) {
    console.log('Falling back to msedge channel:', e.message);
    browser = await chromium.launch({ headless: true, channel: 'msedge' });
  }

  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 2 // HiDPI retina capture for glass specular fidelity
  });

  const page = await context.newPage();

  console.log('Navigating to http://localhost:5175/prototype ...');
  await page.goto('http://localhost:5175/prototype', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Capture Mode 1: Integrated Hero View
  const heroScreenshotPath = path.join(artifactDir, 'liquid_glass_integrated_hero.png');
  await page.screenshot({ path: heroScreenshotPath, fullPage: false });
  console.log('Saved integrated hero screenshot to:', heroScreenshotPath);

  // Switch to UI Kit Reference mode
  const kitTab = page.locator('button:has-text("Apple Glass UI Kit")');
  if (await kitTab.count() > 0) {
    await kitTab.click();
    await page.waitForTimeout(600);
    const kitScreenshotPath = path.join(artifactDir, 'liquid_glass_ui_kit_reference.png');
    await page.screenshot({ path: kitScreenshotPath, fullPage: false });
    console.log('Saved UI kit reference screenshot to:', kitScreenshotPath);
  }

  // Navigate to Homepage to verify the banner & navbar
  console.log('Navigating to http://localhost:5175/ ...');
  await page.goto('http://localhost:5175/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const homeScreenshotPath = path.join(artifactDir, 'liquid_glass_home_entry.png');
  await page.screenshot({ path: homeScreenshotPath, fullPage: false });
  console.log('Saved homepage screenshot to:', homeScreenshotPath);

  await browser.close();
  console.log('Finished capturing screenshots.');
}

capture().catch(err => {
  console.error('Capture failed:', err);
  process.exit(1);
});
