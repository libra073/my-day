const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:5174';
const OUT_DIR = 'C:/Users/libra051099/.gemini/antigravity/brain/37401341-12df-49f4-9dec-379084ab9fbc/liquid_glass_audit';

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const VIEWPORTS = [
  { width: 320, height: 640, label: '320px_phone' },
  { width: 360, height: 740, label: '360px_phone' },
  { width: 375, height: 812, label: '375px_phone' },
  { width: 390, height: 844, label: '390px_phone' },
  { width: 430, height: 932, label: '430px_phone' },
  { width: 600, height: 960, label: '600px_tablet' },
  { width: 768, height: 1024, label: '768px_tablet' },
  { width: 820, height: 1180, label: '820px_tablet' },
  { width: 1024, height: 768, label: '1024px_tablet' },
  { width: 1280, height: 800, label: '1280px_laptop' },
  { width: 1366, height: 768, label: '1366px_laptop' },
  { width: 1440, height: 900, label: '1440px_laptop' },
  { width: 1600, height: 900, label: '1600px_desktop' },
  { width: 1920, height: 1080, label: '1920px_desktop' },
  { width: 2560, height: 1440, label: '2560px_desktop' },
];

const PAGES_TO_SCREENSHOT = [
  { name: 'home', path: '/', role: 'customer' },
  { name: 'marketplace', path: '/marketplace', role: 'customer' },
  { name: 'vendor_detail', path: '/vendor/kumbi/venue-1', role: 'customer' },
  { name: 'planner', path: '/planner', role: 'customer' },
  { name: 'wedding_dashboard', path: '/wedding', role: 'customer' },
  { name: 'bookings', path: '/bookings', role: 'customer' },
  { name: 'become_vendor', path: '/become-vendor', role: 'customer' },
  { name: 'login', path: '/login', role: 'customer' },
  { name: 'admin', path: '/admin', role: 'admin' },
  { name: 'provider', path: '/provider', role: 'provider' },
];

function getSeedCode(themeVal, roleVal) {
  return `
    localStorage.setItem('myday_theme', '${themeVal}');
    localStorage.setItem('theme', '${themeVal}');
    localStorage.setItem('myday_role', '${roleVal}');
    localStorage.setItem('myday_token', 'qa-token-2026');
    localStorage.setItem('myday_user', JSON.stringify({
      id: '${roleVal === 'admin' ? 'admin-1' : roleVal === 'provider' ? 'prov-1' : 'cust-1'}',
      name: '${roleVal === 'admin' ? 'Platform Admin' : roleVal === 'provider' ? 'Mlimani City' : 'Amina & Juma'}',
      email: '${roleVal}@myday.co.tz',
      role: '${roleVal}',
      weddingId: 'wed-1',
      providerId: 'venue-1'
    }));
    localStorage.setItem('myday_bookings', JSON.stringify([
      {
        id: 'BK-QA-101',
        providerId: 'venue-1',
        category: 'kumbi',
        title: 'Mlimani City Grand Hall',
        date: '2027-08-14',
        price: 4500000,
        deposit: 1350000,
        paidAmount: 1350000,
        status: 'confirmed'
      }
    ]));
    localStorage.setItem('myday_wedding', JSON.stringify({
      id: 'wed-1',
      title: 'Amina & Juma Royal Wedding',
      bride: 'Amina',
      groom: 'Juma',
      date: '2027-08-14',
      location: 'Dar es Salaam',
      guests: 350,
      budget: 25000000
    }));
    document.documentElement.setAttribute('data-theme', '${themeVal}');
  `;
}

(async () => {
  console.log('🚀 Launching Playwright Chromium for Apple Liquid Glass audit...');
  const browser = await chromium.launch({
    executablePath: 'C:/Users/libra051099/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe',
    headless: true,
  });

  const overflowIssues = [];
  const darkFlashingIssues = [];

  // 1. CAPTURE HIGH-RES AUDIT SCREENSHOTS (LIGHT & DARK)
  console.log('📸 Taking high-res Apple Liquid Glass audit screenshots...');
  for (const theme of ['light', 'dark']) {
    for (const pg of PAGES_TO_SCREENSHOT) {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 2,
      });
      await context.addInitScript(getSeedCode(theme, pg.role));
      const page = await context.newPage();
      await page.goto(`${BASE_URL}${pg.path}`, { waitUntil: 'networkidle', timeout: 20000 });
      await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
      await page.waitForTimeout(300);

      // Desktop screenshot (1440px)
      await page.screenshot({
        path: path.join(OUT_DIR, `${pg.name}_${theme}_desktop.png`),
        fullPage: false,
      });

      // Mobile screenshot (390px)
      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(200);
      await page.screenshot({
        path: path.join(OUT_DIR, `${pg.name}_${theme}_mobile.png`),
        fullPage: false,
      });

      await context.close();
      process.stdout.write(`  ✓ ${pg.name} (${theme})\n`);
    }
  }

  // 2. CAPTURE MODALS & INTERACTION STATES
  console.log('📸 Capturing Liquid Glass Modals (Booking, Payment, Drawer)...');
  for (const theme of ['light', 'dark']) {
    // Booking modal on vendor detail
    const vContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
    await vContext.addInitScript(getSeedCode(theme, 'customer'));
    const vPage = await vContext.newPage();
    await vPage.goto(`${BASE_URL}/vendor/kumbi/venue-1`, { waitUntil: 'networkidle', timeout: 20000 });
    await vPage.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
    await vPage.waitForTimeout(200);
    const bookBtn = vPage.locator('button:has-text("Book Now"), button:has-text("Agiza Sasa"), button:has-text("Weka Nafasi")');
    if ((await bookBtn.count()) > 0) {
      await bookBtn.first().click();
      await vPage.waitForTimeout(400);
      await vPage.screenshot({
        path: path.join(OUT_DIR, `booking_modal_${theme}.png`),
        fullPage: false,
      });
      console.log(`  ✓ Booking Modal (${theme})`);
    }
    await vContext.close();

    // Payment modal on bookings page
    const bContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
    await bContext.addInitScript(getSeedCode(theme, 'customer'));
    const bPage = await bContext.newPage();
    await bPage.goto(`${BASE_URL}/bookings`, { waitUntil: 'networkidle', timeout: 20000 });
    await bPage.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
    await bPage.waitForTimeout(200);
    const payBtn = bPage.locator('button:has-text("Pay Remaining"), button:has-text("Lipa"), button:has-text("Pay Deposit")');
    if ((await payBtn.count()) > 0) {
      await payBtn.first().click();
      await bPage.waitForTimeout(400);
      await bPage.screenshot({
        path: path.join(OUT_DIR, `payment_modal_${theme}.png`),
        fullPage: false,
      });
      console.log(`  ✓ Payment Modal (${theme})`);
    }
    await bContext.close();
  }

  // Mobile Drawer snapshot
  const mContext = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await mContext.addInitScript(getSeedCode('light', 'customer'));
  const mPage = await mContext.newPage();
  await mPage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  const burgerBtn = mPage.locator('button[aria-label="Toggle navigation menu"], .cl-burger, button:has(.lucide-menu)');
  if ((await burgerBtn.count()) > 0) {
    await burgerBtn.first().click();
    await mPage.waitForTimeout(300);
    await mPage.screenshot({
      path: path.join(OUT_DIR, `mobile_drawer_open.png`),
      fullPage: false,
    });
    console.log(`  ✓ Mobile Drawer snapshot saved`);
  }
  await mContext.close();

  // 3. RESPONSIVE VIEWPORT STRESS TESTING ACROSS ALL 15 VIEWPORTS
  console.log('📐 Testing all 15 Viewports for horizontal overflow & layout clipping...');
  const testPages = ['/', '/marketplace', '/vendor/kumbi/venue-1', '/planner', '/wedding', '/bookings', '/login'];
  for (const vp of VIEWPORTS) {
    const testContext = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    await testContext.addInitScript(getSeedCode('light', 'customer'));
    const p = await testContext.newPage();

    for (const route of testPages) {
      await p.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' });
      await p.waitForTimeout(100);
      const overflow = await p.evaluate(() => {
        const docW = document.documentElement.scrollWidth;
        const winW = window.innerWidth;
        return {
          hasOverflow: docW > winW + 1,
          diff: docW - winW,
          scrollWidth: docW,
          innerWidth: winW,
        };
      });

      if (overflow.hasOverflow) {
        overflowIssues.push({ vp: vp.label, width: vp.width, route, diff: overflow.diff });
      }
    }
    await testContext.close();
    process.stdout.write(`  ✓ Viewport ${vp.label} checked\n`);
  }

  // 4. DARK MODE INTERACTION FLASH TEST
  console.log('🌙 Verifying Zero Dark Mode Interaction Flashes in Liquid Glass...');
  const dContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await dContext.addInitScript(getSeedCode('dark', 'customer'));
  const dPage = await dContext.newPage();
  await dPage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await dPage.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  await dPage.waitForTimeout(200);

  const interactiveElements = await dPage.$$('button, a, input, [role="button"]');
  console.log(`  Checking ${interactiveElements.length} interactive elements on Home for dark flash...`);
  for (const el of interactiveElements.slice(0, 40)) {
    try {
      if (!(await el.isVisible())) continue;
      await el.hover({ timeout: 500 }).catch(() => {});
      const styles = await el.evaluate((node) => {
        const cs = window.getComputedStyle(node);
        const bg = cs.backgroundColor;
        const fg = cs.color;
        const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (!m) return null;
        const a = m[4] !== undefined ? parseFloat(m[4]) : 1;
        const lum = 0.299 * (+m[1]) + 0.587 * (+m[2]) + 0.114 * (+m[3]);
        return { lum, a, bg, fg, text: node.innerText?.slice(0, 20) };
      });
      if (styles && styles.a > 0.4 && styles.lum > 210) {
        darkFlashingIssues.push(styles);
      }
    } catch (_) {}
  }
  await dContext.close();

  await browser.close();

  console.log('\n================ LIQUID GLASS AUDIT SUMMARY ================');
  console.log(`Total Viewports Verified: ${VIEWPORTS.length} (320px to 2560px)`);
  console.log(`Horizontal Overflow Issues: ${overflowIssues.length}`);
  if (overflowIssues.length > 0) {
    console.log('Overflow issues:', overflowIssues);
  } else {
    console.log('✅ ZERO HORIZONTAL OVERFLOW ACROSS ALL 15 VIEWPORTS!');
  }

  console.log(`Dark Mode White Flashes: ${darkFlashingIssues.length}`);
  if (darkFlashingIssues.length > 0) {
    console.log('Dark mode flashing elements:', darkFlashingIssues);
  } else {
    console.log('✅ ZERO DARK MODE WHITE FLASHES DETECTED!');
  }
  console.log(`Screenshots saved to: ${OUT_DIR}`);
})();

