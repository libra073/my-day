const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const OUT_DIR = 'C:/Users/libra051099/.gemini/antigravity/brain/37401341-12df-49f4-9dec-379084ab9fbc';

async function run() {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 950 }
  });

  const page = await context.newPage();

  console.log('Navigating to http://localhost:5173/register ...');
  await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle' });

  // Fill in registration form
  const uniqueEmail = `neema.bride.${Date.now()}@example.co.tz`;
  console.log(`Registering account: ${uniqueEmail}`);

  await page.waitForSelector('#ax-name', { timeout: 10000 });
  await page.fill('#ax-name', 'Neema Bride');
  await page.fill('#ax-reg-email', uniqueEmail);
  await page.fill('#ax-phone', '777555444');
  await page.fill('#ax-reg-password', 'SecretPass2026!');
  await page.fill('#ax-confirm', 'SecretPass2026!');
  await page.click('.ax-terms input[type="checkbox"]');

  // Click create account
  console.log('Submitting registration...');
  await page.click('.ax-submit');

  // Wait for verify mode to appear
  console.log('Waiting for verification form...');
  await page.waitForSelector('.ax-form--verify', { timeout: 10000 });
  console.log('Verify screen rendered successfully!');

  // Capture screenshot of verify screen
  const verifyScreenPath = path.join(OUT_DIR, 'email_verification_screen.png');
  await page.screenshot({ path: verifyScreenPath });
  console.log(`Saved screenshot: ${verifyScreenPath}`);

  // Auto-fill demo code using the quick chip
  const demoCodeBtn = await page.waitForSelector('.ax-submit--soft', { timeout: 5000 });
  await demoCodeBtn.click();
  await page.waitForTimeout(400);

  // Capture screenshot with filled code
  const codeFilledPath = path.join(OUT_DIR, 'email_verification_code_filled.png');
  await page.screenshot({ path: codeFilledPath });
  console.log(`Saved screenshot: ${codeFilledPath}`);

  // Submit verification
  const submitBtn = await page.locator('.ax-form--verify button[type="submit"]');
  await submitBtn.click();

  // Wait for redirect to dashboard
  await page.waitForTimeout(2000);

  // Capture dashboard verified view
  const dashboardPath = path.join(OUT_DIR, 'dashboard_verified_user.png');
  await page.screenshot({ path: dashboardPath });
  console.log(`Saved screenshot: ${dashboardPath}`);

  await browser.close();
  console.log('Playwright run complete successfully!');
}

run().catch(err => {
  console.error('Playwright error:', err);
  process.exit(1);
});
