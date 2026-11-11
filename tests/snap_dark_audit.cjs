const { chromium } = require('@playwright/test');
const path = require('path');

async function main() {
  const browser = await chromium.launch({
    executablePath: 'C:/Users/libra051099/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe',
    headless: true
  });
  const outDir = 'C:/Users/libra051099/.gemini/antigravity/brain/37401341-12df-49f4-9dec-379084ab9fbc';

  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 2
  });
  const page = await context.newPage();

  // Set dark theme and customer login session in localStorage
  await page.goto('http://localhost:5174/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('myday_theme', 'dark');
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.setAttribute('data-theme', 'dark');
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

  const routes = [
    { name: 'dark_home.png', url: 'http://localhost:5174/' },
    { name: 'dark_marketplace.png', url: 'http://localhost:5174/marketplace' },
    { name: 'dark_vendor_detail.png', url: 'http://localhost:5174/vendor/kumbi/venue-1' },
    { name: 'dark_planner.png', url: 'http://localhost:5174/planner' },
    { name: 'dark_wedding_profile.png', url: 'http://localhost:5174/wedding' },
    { name: 'dark_bookings.png', url: 'http://localhost:5174/bookings' },
    { name: 'dark_become_vendor.png', url: 'http://localhost:5174/become-vendor' },
    { name: 'dark_contact.png', url: 'http://localhost:5174/contact' },
    { name: 'dark_dashboard.png', url: 'http://localhost:5174/dashboard' },
  ];

  for (const r of routes) {
    await page.goto(r.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(outDir, r.name) });
    console.log(`Captured ${r.name}`);
  }

  // Open booking modal
  await page.goto('http://localhost:5174/vendor/kumbi/venue-1', { waitUntil: 'networkidle' });
  const bookBtn = await page.$('button:has-text("Reserve Now")');
  if (bookBtn) {
    await bookBtn.click();
    await page.waitForSelector('.modal-card', { timeout: 3000 });
    await page.waitForTimeout(400);
    const modal = await page.$('.modal-card');
    if (modal) {
      await modal.screenshot({ path: path.join(outDir, 'dark_modal_booking.png') });
    } else {
      await page.screenshot({ path: path.join(outDir, 'dark_modal_booking.png') });
    }
    console.log('Captured dark_modal_booking.png');
  }

  await browser.close();
  console.log('Finished dark audit capture.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
