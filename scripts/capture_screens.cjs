const { chromium } = require('playwright');
const path = require('path');

const artifactDir = 'C:/Users/libra051099/.gemini/antigravity/brain/37401341-12df-49f4-9dec-379084ab9fbc';

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:/Users/libra051099/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe'
  });

  // 1. Desktop Light Mode Hero & Full Page
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  await page.screenshot({ path: path.join(artifactDir, 'home_light_hero.png'), fullPage: false });
  await page.screenshot({ path: path.join(artifactDir, 'home_light_full.png'), fullPage: true });

  // Scroll to AI Showcase
  const aiSection = await page.$('.ai-glass-showcase');
  if (aiSection) {
    await aiSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(artifactDir, 'home_light_ai_planner.png'), fullPage: false });
  }

  // 2. Desktop Dark Mode Hero & Full Page
  await page.click('.cl-theme-pill');
  await page.waitForTimeout(600);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);

  await page.screenshot({ path: path.join(artifactDir, 'home_dark_hero.png'), fullPage: false });
  await page.screenshot({ path: path.join(artifactDir, 'home_dark_full.png'), fullPage: true });

  // 3. Mobile Light Mode
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await mobilePage.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(600);
  await mobilePage.screenshot({ path: path.join(artifactDir, 'home_light_mobile.png'), fullPage: false });
  await mobilePage.screenshot({ path: path.join(artifactDir, 'home_light_mobile_full.png'), fullPage: true });

  // Test opening mobile drawer
  const burger = await mobilePage.$('.cl-burger');
  if (burger) {
    await burger.click();
    await mobilePage.waitForTimeout(400);
    await mobilePage.screenshot({ path: path.join(artifactDir, 'home_mobile_drawer.png'), fullPage: false });
  }

  // 4. Mobile Dark Mode
  const mobileDarkPage = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await mobileDarkPage.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
  await mobileDarkPage.waitForTimeout(500);
  await mobileDarkPage.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.setAttribute('data-theme', 'dark');
  });
  await mobileDarkPage.waitForTimeout(500);
  await mobileDarkPage.screenshot({ path: path.join(artifactDir, 'home_dark_mobile.png'), fullPage: false });
  await mobileDarkPage.screenshot({ path: path.join(artifactDir, 'home_dark_mobile_full.png'), fullPage: true });

  console.log('All screenshots captured successfully!');
  await browser.close();
})();
