const { chromium } = require('@playwright/test');
const path = require('path');

async function main() {
  const browser = await chromium.launch({
    executablePath: 'C:/Users/libra051099/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe',
    headless: true
  });
  const outDir = 'C:/Users/libra051099/.gemini/antigravity/brain/37401341-12df-49f4-9dec-379084ab9fbc';

  // Desktop Context (1440x960)
  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 2
  });
  const page = await context.newPage();

  // Set user login state
  await page.goto('http://localhost:5174', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.setItem('myday_token', 'token-groom-session');
    localStorage.setItem('myday_user', JSON.stringify({
      id: 'usr-groom',
      name: 'Salma & Juma',
      email: 'salma@myday.co.tz',
      role: 'customer'
    }));
    localStorage.setItem('myday_wedding', JSON.stringify({
      id: 'wed-1',
      title: 'Salma & Juma Royal Wedding',
      bride: 'Salma Rashid',
      groom: 'Juma Ali',
      date: '2026-12-15',
      location: 'Dar es Salaam',
      guests: 350,
      budget: 35000000
    }));
  });

  // 1. Dashboard Light Theme
  await page.evaluate(() => {
    localStorage.setItem('myday_theme', 'light');
    document.documentElement.setAttribute('data-theme', 'light');
    document.body.setAttribute('data-theme', 'light');
  });
  await page.goto('http://localhost:5174/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, 'theme_proof_dashboard_light.png') });
  console.log('Saved theme_proof_dashboard_light.png');

  // 2. Dashboard Dark Theme
  // Click theme switcher button
  const themeBtn = await page.$('.cl-theme-pill');
  if (themeBtn) {
    await themeBtn.click();
    await page.waitForTimeout(600);
  } else {
    await page.evaluate(() => {
      localStorage.setItem('myday_theme', 'dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.setAttribute('data-theme', 'dark');
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
  }
  await page.screenshot({ path: path.join(outDir, 'theme_proof_dashboard_dark.png') });
  console.log('Saved theme_proof_dashboard_dark.png');

  // 3. Login Dark Theme
  await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, 'theme_proof_login_dark.png') });
  console.log('Saved theme_proof_login_dark.png');

  // 4. Login Light Theme
  await page.evaluate(() => {
    localStorage.setItem('myday_theme', 'light');
    document.documentElement.setAttribute('data-theme', 'light');
    document.body.setAttribute('data-theme', 'light');
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, 'theme_proof_login_light.png') });
  console.log('Saved theme_proof_login_light.png');

  await browser.close();
  console.log('All theme proofs captured successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

