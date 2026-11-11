const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:5174';
const OUT_DIR = 'C:/Users/libra051099/.gemini/antigravity/brain/37401341-12df-49f4-9dec-379084ab9fbc/liquid_glass_audit';

function getSeedCode(themeVal) {
  return `
    localStorage.setItem('myday_theme', '${themeVal}');
    localStorage.setItem('theme', '${themeVal}');
    localStorage.setItem('myday_role', 'customer');
    localStorage.setItem('myday_token', 'qa-token-2026');
    localStorage.setItem('myday_user', JSON.stringify({
      id: 'cust-1',
      name: 'Amina & Juma',
      email: 'amina@myday.co.tz',
      role: 'customer',
      weddingId: 'wed-1',
      providerId: 'venue-1'
    }));
    document.documentElement.setAttribute('data-theme', '${themeVal}');
  `;
}

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:/Users/libra051099/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe',
    headless: true,
  });

  for (const theme of ['light', 'dark']) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
    await ctx.addInitScript(getSeedCode(theme));
    const page = await ctx.newPage();

    await page.goto(`${BASE_URL}/vendor/kumbi/venue-1`, { waitUntil: 'networkidle' });
    const reserveBtn = page.locator('button:has-text("Reserve Now"), button:has-text("Weka Nafasi Sasa")');
    if (await reserveBtn.count() > 0) {
      await reserveBtn.first().click();
      await page.waitForTimeout(400);

      const dateInput = page.locator('input[type="date"]');
      if (await dateInput.count() > 0) {
        await dateInput.fill('2027-08-14');
      }

      const proceedBtn = page.locator('button:has-text("Reserve & Proceed to Payment"), button:has-text("Hifadhi na Ulipe")');
      if (await proceedBtn.count() > 0) {
        await proceedBtn.first().click();
        await page.waitForTimeout(700);
        await page.screenshot({
          path: path.join(OUT_DIR, `payment_modal_${theme}.png`),
        });
        console.log(`Saved payment_modal_${theme}.png`);
      }
    }
    await ctx.close();
  }

  await browser.close();
  console.log('Payment modal snapshots done.');
})();
