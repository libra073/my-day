const { chromium } = require('@playwright/test');
const path = require('path');

async function main() {
  const browser = await chromium.launch({
    executablePath: 'C:/Users/libra051099/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe',
    headless: true
  });
  const outDir = 'C:/Users/libra051099/.gemini/antigravity/brain/37401341-12df-49f4-9dec-379084ab9fbc/dark_audit';
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://localhost:5174/vendor/kumbi/venue-1', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    const demoUser = {
      id: 'demo-couple-001',
      name: 'Amina & Baraka',
      email: 'amina@example.com',
      role: 'customer',
      token: 'mock-jwt-token-couple'
    };
    localStorage.setItem('myday_user', JSON.stringify(demoUser));
    localStorage.setItem('myday_token', 'mock-jwt-token-couple');
    localStorage.setItem('myday_role', 'customer');
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.setAttribute('data-theme', 'dark');
    localStorage.setItem('myday_theme', 'dark');
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);

  // Click Reserve Now
  const reserveBtn = page.locator('button:has-text("Reserve Now")');
  await reserveBtn.first().click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, 'real_booking_modal_dark.png') });

  // Trigger booking submit
  const submitBtn = page.locator('button[type="submit"]');
  if (await submitBtn.count() > 0) {
    await submitBtn.first().click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(outDir, 'real_payment_modal_dark.png') });
  }

  // Appointment Modal
  await page.goto('http://localhost:5174/vendor/kumbi/venue-1', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);
  const appointBtn = page.locator('button:has-text("Book Consultation")');
  if (await appointBtn.count() > 0) {
    await appointBtn.first().click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outDir, 'real_appointment_modal_dark.png') });
  }

  await browser.close();
  console.log('Modals captured successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

