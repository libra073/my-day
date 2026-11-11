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

  // 1. DESKTOP 1600px
  console.log('--- 1. Desktop 1600px Capture ---');
  const contextDesktop = await browser.newContext({
    viewport: { width: 1600, height: 1000 },
    deviceScaleFactor: 2
  });
  const pageDesktop = await contextDesktop.newPage();

  // 1.1 Home page
  await pageDesktop.goto('http://localhost:5175/', { waitUntil: 'networkidle' });
  await pageDesktop.waitForTimeout(1000);
  const homePath = path.join(artifactDir, 'liquid_glass_desktop_1600_home.png');
  await pageDesktop.screenshot({ path: homePath });
  console.log('Saved 1600px Home:', homePath);

  // 1.2 Marketplace page
  await pageDesktop.goto('http://localhost:5175/marketplace', { waitUntil: 'networkidle' });
  await pageDesktop.waitForTimeout(1000);
  const marketPath = path.join(artifactDir, 'liquid_glass_desktop_1600_marketplace.png');
  await pageDesktop.screenshot({ path: marketPath });
  console.log('Saved 1600px Marketplace:', marketPath);

  // 1.3 AI Planner page
  await pageDesktop.goto('http://localhost:5175/planner', { waitUntil: 'networkidle' });
  await pageDesktop.waitForTimeout(1000);
  const plannerPath = path.join(artifactDir, 'liquid_glass_desktop_1600_planner.png');
  await pageDesktop.screenshot({ path: plannerPath });
  console.log('Saved 1600px Planner:', plannerPath);

  // 1.4 Booking Modal open on Home page
  await pageDesktop.goto('http://localhost:5175/', { waitUntil: 'networkidle' });
  await pageDesktop.waitForTimeout(600);
  const bookBtn = pageDesktop.locator('button:has-text("Book Now"), button:has-text("Weka Nafasi")').first();
  if (await bookBtn.count() > 0) {
    await bookBtn.click();
    await pageDesktop.waitForTimeout(800);
    const modalPath = path.join(artifactDir, 'liquid_glass_desktop_1600_modal.png');
    await pageDesktop.screenshot({ path: modalPath });
    console.log('Saved 1600px Modal:', modalPath);
  }

  await contextDesktop.close();

  // 2. TABLET 768px
  console.log('--- 2. Tablet 768px Capture ---');
  const contextTablet = await browser.newContext({
    viewport: { width: 768, height: 1024 },
    deviceScaleFactor: 2
  });
  const pageTablet = await contextTablet.newPage();
  await pageTablet.goto('http://localhost:5175/', { waitUntil: 'networkidle' });
  await pageTablet.waitForTimeout(1000);
  const tabletPath = path.join(artifactDir, 'liquid_glass_tablet_768_home.png');
  await pageTablet.screenshot({ path: tabletPath });
  console.log('Saved 768px Tablet:', tabletPath);
  await contextTablet.close();

  // 3. MOBILE 390px (iPhone 14 / 15 / 16 Viewport)
  console.log('--- 3. Mobile 390px Capture ---');
  const contextMobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3
  });
  const pageMobile = await contextMobile.newPage();
  await pageMobile.goto('http://localhost:5175/', { waitUntil: 'networkidle' });
  await pageMobile.waitForTimeout(1000);
  const mobilePath = path.join(artifactDir, 'liquid_glass_mobile_390_home.png');
  await pageMobile.screenshot({ path: mobilePath });
  console.log('Saved 390px Mobile Home:', mobilePath);

  // Open mobile menu to test mobile glass drawer
  const hamburger = pageMobile.locator('.lg-mobile-nav-toggle, button[aria-label*="menu"]').first();
  if (await hamburger.count() > 0 && await hamburger.isVisible()) {
    await hamburger.click();
    await pageMobile.waitForTimeout(600);
    const mobileDrawerPath = path.join(artifactDir, 'liquid_glass_mobile_390_drawer.png');
    await pageMobile.screenshot({ path: mobileDrawerPath });
    console.log('Saved 390px Mobile Drawer:', mobileDrawerPath);
  }

  await contextMobile.close();
  await browser.close();
  console.log('All mandatory multi-device captures completed successfully.');
}

capture().catch(err => {
  console.error('Capture failed:', err);
  process.exit(1);
});
