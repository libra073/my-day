import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function captureClaymorphicAuth() {
  const artifactDir = 'C:/Users/libra051099/.gemini/antigravity/brain/826a53e1-734d-4f8b-bd2a-9cd01606e0fc';
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  let browser;
  try {
    browser = await chromium.launch({ headless: true, channel: 'msedge' });
  } catch (e) {
    console.log('Falling back to default chromium:', e.message);
    browser = await chromium.launch({ headless: true });
  }

  // 1. DESKTOP 1600px
  console.log('--- 1. Desktop 1600px Captures ---');
  const contextDesktop = await browser.newContext({
    viewport: { width: 1600, height: 1000 },
    deviceScaleFactor: 2
  });
  const pageDesktop = await contextDesktop.newPage();

  // 1.1 /login (Log In Page)
  await pageDesktop.goto('http://localhost:5175/login', { waitUntil: 'domcontentloaded' });
  await pageDesktop.waitForTimeout(1200);
  const loginPath = path.join(artifactDir, 'clay_3d_desktop_1600_login.png');
  await pageDesktop.screenshot({ path: loginPath });
  console.log('Saved 1600px Login:', loginPath);

  // 1.2 /register (Creating Account Page)
  await pageDesktop.goto('http://localhost:5175/register', { waitUntil: 'domcontentloaded' });
  await pageDesktop.waitForTimeout(1200);
  const registerPath = path.join(artifactDir, 'clay_3d_desktop_1600_register.png');
  await pageDesktop.screenshot({ path: registerPath });
  console.log('Saved 1600px Register:', registerPath);

  // 1.3 /forgot-password (Forget Password Page)
  await pageDesktop.goto('http://localhost:5175/forgot-password', { waitUntil: 'domcontentloaded' });
  await pageDesktop.waitForTimeout(1200);
  const forgotPath = path.join(artifactDir, 'clay_3d_desktop_1600_forgot_password.png');
  await pageDesktop.screenshot({ path: forgotPath });
  console.log('Saved 1600px Forgot Password:', forgotPath);

  // 1.4 Homepage to verify NO girl character on non-auth pages
  await pageDesktop.goto('http://localhost:5175/', { waitUntil: 'domcontentloaded' });
  await pageDesktop.waitForTimeout(1200);
  const girlOnHome = await pageDesktop.locator('.clay-ebony-character-img').count();
  console.log('Verification: Girl character count on Homepage =', girlOnHome, '(Must be 0)');
  const homeVerifyPath = path.join(artifactDir, 'clay_3d_desktop_1600_home_no_girl.png');
  await pageDesktop.screenshot({ path: homeVerifyPath });
  console.log('Saved 1600px Home (No girl character):', homeVerifyPath);

  await contextDesktop.close();

  // 2. TABLET 768px
  console.log('--- 2. Tablet 768px Capture ---');
  const contextTablet = await browser.newContext({
    viewport: { width: 768, height: 1024 },
    deviceScaleFactor: 2
  });
  const pageTablet = await contextTablet.newPage();
  await pageTablet.goto('http://localhost:5175/login', { waitUntil: 'domcontentloaded' });
  await pageTablet.waitForTimeout(1200);
  const tabletPath = path.join(artifactDir, 'clay_3d_tablet_768_login.png');
  await pageTablet.screenshot({ path: tabletPath });
  console.log('Saved 768px Tablet Login:', tabletPath);
  await contextTablet.close();

  // 3. MOBILE 390px (iPhone 14/15/16)
  console.log('--- 3. Mobile 390px Capture ---');
  const contextMobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3
  });
  const pageMobile = await contextMobile.newPage();
  await pageMobile.goto('http://localhost:5175/login', { waitUntil: 'domcontentloaded' });
  await pageMobile.waitForTimeout(1200);
  const mobilePath = path.join(artifactDir, 'clay_3d_mobile_390_login.png');
  await pageMobile.screenshot({ path: mobilePath });
  console.log('Saved 390px Mobile Login:', mobilePath);
  await contextMobile.close();

  await browser.close();
  console.log('All captures completed successfully.');
}

captureClaymorphicAuth().catch(err => {
  console.error('Capture failed:', err);
  process.exit(1);
});
