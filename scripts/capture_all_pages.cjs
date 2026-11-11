const { chromium } = require('playwright');
const path = require('path');
const artifactDir = 'C:/Users/libra051099/.gemini/antigravity/brain/37401341-12df-49f4-9dec-379084ab9fbc';

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:/Users/libra051099/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe'
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // Set logged in state for customer
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.setItem('myday_user_role', 'customer');
    localStorage.setItem('myday_token', 'token-groom-session');
    localStorage.setItem('myday_user', JSON.stringify({
      id: 'usr-groom',
      name: 'Juma (Groom)',
      email: 'juma@example.com',
      role: 'customer'
    }));
    localStorage.setItem('myday_wedding', JSON.stringify({
      id: 'wed-1',
      title: 'Juma & Neema Royal Celebration',
      bride: 'Neema',
      groom: 'Juma',
      date: '2027-08-15',
      location: 'Dar es Salaam (Mbezi Beach)',
      budget: 25000000,
      guests: 350
    }));
  });

  const pagesToCapture = [
    { name: 'marketplace_light', url: 'http://localhost:5174/marketplace' },
    { name: 'vendor_detail_light', url: 'http://localhost:5174/vendor/kumbi/venue-1' },
    { name: 'planner_light', url: 'http://localhost:5174/planner' },
    { name: 'wedding_profile_light', url: 'http://localhost:5174/wedding' },
    { name: 'dashboard_light', url: 'http://localhost:5174/dashboard' },
    { name: 'bookings_light', url: 'http://localhost:5174/bookings' },
    { name: 'become_vendor_light', url: 'http://localhost:5174/become-vendor' },
  ];

  for (const p of pagesToCapture) {
    try {
      await page.goto(p.url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(artifactDir, `${p.name}.png`), fullPage: false });
      console.log(`Captured ${p.name}`);
    } catch (e) {
      console.log(`Error capturing ${p.name}:`, e.message);
    }
  }

  // Switch to Dark mode and capture key screens
  await page.evaluate(() => {
    localStorage.setItem('myday_theme', 'dark');
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.setAttribute('data-theme', 'dark');
  });

  const darkPagesToCapture = [
    { name: 'marketplace_dark', url: 'http://localhost:5174/marketplace' },
    { name: 'vendor_detail_dark', url: 'http://localhost:5174/vendor/kumbi/venue-1' },
    { name: 'planner_dark', url: 'http://localhost:5174/planner' },
    { name: 'dashboard_dark', url: 'http://localhost:5174/dashboard' },
    { name: 'wedding_profile_dark', url: 'http://localhost:5174/wedding' },
    { name: 'bookings_dark', url: 'http://localhost:5174/bookings' },
  ];

  for (const p of darkPagesToCapture) {
    try {
      await page.goto(p.url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(artifactDir, `${p.name}.png`), fullPage: false });
      console.log(`Captured ${p.name}`);
    } catch (e) {
      console.log(`Error capturing ${p.name}:`, e.message);
    }
  }

  // Switch to Provider and capture provider dashboard
  await page.evaluate(() => {
    localStorage.setItem('myday_theme', 'light');
    localStorage.setItem('myday_user_role', 'provider');
    localStorage.setItem('myday_user', JSON.stringify({
      id: 'prov-1',
      name: 'Serena Luxury Events',
      email: 'contact@serena.tz',
      role: 'provider'
    }));
  });
  await page.goto('http://localhost:5174/provider', { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(artifactDir, 'provider_dashboard_light.png'), fullPage: false });
  console.log('Captured provider_dashboard_light');

  // Switch to Admin and capture admin dashboard
  await page.evaluate(() => {
    localStorage.setItem('myday_user_role', 'admin');
    localStorage.setItem('myday_user', JSON.stringify({
      id: 'adm-1',
      name: 'Super Administrator',
      email: 'admin@myday.tz',
      role: 'admin'
    }));
  });
  await page.goto('http://localhost:5174/admin', { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(artifactDir, 'admin_dashboard_light.png'), fullPage: false });
  console.log('Captured admin_dashboard_light');

  await browser.close();
  console.log('Finished capturing all pages!');
})();
