const { chromium } = require('@playwright/test');
const path = require('path');

async function main() {
  const browser = await chromium.launch({
    executablePath: 'C:/Users/libra051099/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe',
    headless: true
  });
  const outDir = 'C:/Users/libra051099/.gemini/antigravity/brain/37401341-12df-49f4-9dec-379084ab9fbc';

  // Desktop context
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5
  });
  const page = await context.newPage();

  const routes = [
    { name: 'home', path: '/' },
    { name: 'marketplace', path: '/marketplace' },
    { name: 'vendor_detail', path: '/vendor/kumbi/venue-1' },
    { name: 'planner', path: '/planner' },
    { name: 'become_vendor', path: '/become-vendor' },
    { name: 'login', path: '/login' },
    { name: 'wedding', path: '/wedding' },
  ];

  for (const route of routes) {
    console.log(`Capturing light desktop ${route.name}...`);
    await page.goto(`http://localhost:5174${route.path}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(outDir, `audit_${route.name}_desktop.png`), fullPage: false });
    await page.screenshot({ path: path.join(outDir, `audit_${route.name}_full.png`), fullPage: true });

    // Dark mode desktop
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.setAttribute('data-theme', 'dark');
      localStorage.setItem('myday_theme', 'dark');
    });
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(outDir, `audit_${route.name}_dark_desktop.png`), fullPage: false });
    await page.screenshot({ path: path.join(outDir, `audit_${route.name}_dark_full.png`), fullPage: true });

    // Reset back to light
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'light');
      document.body.setAttribute('data-theme', 'light');
      localStorage.setItem('myday_theme', 'light');
    });
  }

  // Dashboard desktop (both light & dark)
  await page.evaluate(() => {
    const demoUser = {
      id: 'demo-user-1',
      name: 'Salma & Juma',
      email: 'salma@example.com',
      role: 'customer',
      token: 'demo-token'
    };
    localStorage.setItem('myday_user', JSON.stringify(demoUser));
    localStorage.setItem('myday_token', 'demo-token');
    localStorage.setItem('myday_role', 'customer');
  });
  await page.goto('http://localhost:5174/dashboard', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, `audit_dashboard_desktop.png`), fullPage: false });
  await page.screenshot({ path: path.join(outDir, `audit_dashboard_full.png`), fullPage: true });

  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outDir, `audit_dashboard_dark_full.png`), fullPage: true });

  // Mobile check (390px)
  const mobContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2
  });
  const mobPage = await mobContext.newPage();
  
  const mobRoutes = ['/', '/marketplace', '/vendor/kumbi/venue-1', '/become-vendor'];
  for (const p of mobRoutes) {
    const safeName = p === '/' ? 'home' : p.replace(/\//g, '_').replace(/^_/, '');
    console.log(`Capturing mobile ${safeName}...`);
    await mobPage.goto(`http://localhost:5174${p}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await mobPage.waitForTimeout(600);
    await mobPage.screenshot({ path: path.join(outDir, `audit_${safeName}_mobile.png`), fullPage: true });
  }

  await browser.close();
  console.log('All audit screenshots captured successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
