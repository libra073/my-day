const { chromium } = require('@playwright/test');
const path = require('path');

async function testScroll2() {
  const browser = await chromium.launch({
    executablePath: 'C:/Users/libra051099/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe',
    headless: true
  });
  const outDir = 'C:/Users/libra051099/.gemini/antigravity/brain/37401341-12df-49f4-9dec-379084ab9fbc';
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 2 });
  await page.goto('http://localhost:5174', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Position: Vendors Grid
  await page.evaluate(() => window.scrollTo(0, 1950));
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, 'scroll_vendors_grid.png') });

  // Position: Trust Section
  await page.evaluate(() => window.scrollTo(0, 3100));
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, 'scroll_trust_guarantee.png') });

  // Position: Office Contact & Footer
  await page.evaluate(() => window.scrollTo(0, 4200));
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, 'scroll_office_contact.png') });

  // Click on "Book Now" / "Weka Nafasi" button
  const bookBtn = await page.locator('button:has-text("Book Now"), button:has-text("Weka Nafasi")').first();
  if (await bookBtn.isVisible()) {
    await bookBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(outDir, 'booking_modal_open.png') });
  }

  await browser.close();
  console.log('Scroll 2 screenshots saved!');
}

testScroll2().catch(console.error);
