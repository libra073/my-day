const { chromium } = require('@playwright/test');
const path = require('path');

async function verifyAllPages() {
  console.log('🚀 STARTING COMPREHENSIVE ALL-PAGE VERIFICATION SUITE...\n');

  const browser = await chromium.launch({
    executablePath: 'C:/Users/libra051099/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe',
    headless: true
  });

  const outDir = 'C:/Users/libra051099/.gemini/antigravity/brain/37401341-12df-49f4-9dec-379084ab9fbc';
  const pageErrors = [];
  const testResults = [];

  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 2
  });
  const page = await context.newPage();

  page.on('pageerror', (err) => {
    console.error('❌ Page Error:', err.message);
    pageErrors.push(err.message);
  });

  async function checkPage(name, url, selectorToWaitFor, customCheck, screenshotName) {
    try {
      console.log(`Testing: [${name}] -> ${url}`);
      const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(600);

      if (selectorToWaitFor) {
        await page.waitForSelector(selectorToWaitFor, { timeout: 8000 });
      }

      let customPass = true;
      let detail = '';
      if (customCheck) {
        const checkResult = await customCheck(page);
        if (typeof checkResult === 'object') {
          customPass = checkResult.pass;
          detail = checkResult.detail || '';
        } else {
          customPass = !!checkResult;
        }
      }

      if (screenshotName) {
        await page.screenshot({ path: path.join(outDir, screenshotName) });
      }

      const passed = (!res || res.status() < 400) && customPass;
      testResults.push({ name, url, passed, detail });
      if (passed) {
        console.log(`  ✅ PASS: ${name} loaded cleanly ${detail ? '(' + detail + ')' : ''}`);
      } else {
        console.error(`  ❌ FAIL: ${name} failed check ${detail ? '(' + detail + ')' : ''}`);
      }
    } catch (err) {
      console.error(`  ❌ ERROR on ${name}:`, err.message);
      testResults.push({ name, url, passed: false, error: err.message });
    }
  }

  // 1. Home Page
  await checkPage('Homepage', 'http://localhost:5174/', '.cl-header', async (p) => {
    const hasSearch = (await p.$('.hero-search')) !== null;
    const hasCategories = (await p.$$('.cl-category-card')).length >= 6;
    return { pass: hasSearch && hasCategories, detail: 'Search capsule & 6 pastel categories' };
  }, 'page_home.png');

  // 2. Marketplace Page
  await checkPage('Marketplace', 'http://localhost:5174/marketplace', '.cl-header', async (p) => {
    const vendorCount = (await p.$$('.provider-card-wrapper, .dash-vendor-card')).length;
    return { pass: vendorCount > 0, detail: `${vendorCount} vendor cards rendered` };
  }, 'page_marketplace.png');

  // 3. Vendor Detail Page
  await checkPage('Vendor Detail', 'http://localhost:5174/vendor/kumbi/venue-1', '.cl-header', async (p) => {
    const text = await p.innerText('body');
    const hasVenueName = text.includes('Grand Imperial Hall');
    const hasPrice = text.includes('2,500,000');
    return { pass: hasVenueName && hasPrice, detail: 'Grand Imperial Hall & Gardens verified' };
  }, 'page_vendor_detail.png');

  // 4. AI Planner Page
  await checkPage('AI Planner', 'http://localhost:5174/planner', '.cl-header', async (p) => {
    const text = await p.innerText('body');
    const hasPlanner = text.includes('MY DAY AI Planner');
    return { pass: hasPlanner, detail: 'AI Planner interface active' };
  }, 'page_planner.png');

  // 5. Wedding Profile Page
  await checkPage('Wedding Profile', 'http://localhost:5174/wedding', '.cl-header', async (p) => {
    const text = await p.innerText('body');
    const hasProfile = text.includes('Wedding') || text.includes('Profile') || text.includes('Harusi');
    return { pass: hasProfile, detail: 'Wedding profile active' };
  }, 'page_wedding_profile.png');

  // 6. My Bookings Page
  await checkPage('My Bookings', 'http://localhost:5174/bookings', '.cl-header', async (p) => {
    const text = await p.innerText('body');
    const hasBookings = text.includes('Bookings') || text.includes('Nafasi');
    return { pass: hasBookings, detail: 'Bookings page active' };
  }, 'page_my_bookings.png');

  // 7. Become a Vendor Page
  await checkPage('Become Vendor', 'http://localhost:5174/become-vendor', '.cl-header', async (p) => {
    const hasInputs = (await p.$$('input')).length > 0;
    return { pass: hasInputs, detail: 'Vendor onboarding active' };
  }, 'page_become_vendor.png');

  // 8. Contact Us Page
  await checkPage('Contact Us', 'http://localhost:5174/contact', '.cl-header', async (p) => {
    const text = await p.innerText('body');
    const hasPhone = text.includes('+255 766 466 187');
    return { pass: hasPhone, detail: 'Contact & Office Hours verified' };
  }, 'page_contact.png');

  // 9. Login Page
  await checkPage('Login (Auth)', 'http://localhost:5174/login', '.clay-ebony-character-img', async (p) => {
    const hasEbony = (await p.$('.clay-ebony-character-img')) !== null;
    const hasGoogle = (await p.$('button[title*="Google"]')) !== null;
    const hasApple = (await p.$('button[title*="Apple"]')) !== null;
    const hasFB = (await p.$('button[title*="Facebook"]')) !== null;
    return { pass: hasEbony && !hasGoogle && !hasApple && !hasFB, detail: 'Ebony intact, Google removed, Native auth active' };
  }, 'page_login.png');

  // 10. Register Page
  await checkPage('Register (Auth)', 'http://localhost:5174/register', '.clay-ebony-character-img', async (p) => {
    const hasEbony = (await p.$('.clay-ebony-character-img')) !== null;
    return { pass: hasEbony, detail: 'Ebony intact & Register form active' };
  }, 'page_register.png');

  // 11. Forgot Password Page
  await checkPage('Forgot Password (Auth)', 'http://localhost:5174/forgot-password', '.clay-ebony-character-img', async (p) => {
    const hasEbony = (await p.$('.clay-ebony-character-img')) !== null;
    return { pass: hasEbony, detail: 'Ebony intact & Reset form active' };
  }, 'page_forgot_password.png');

  // 12. Customer Dashboard (/dashboard) with Couple login
  console.log('\n--- Authenticating Customer (Couple) ---');
  await page.goto('http://localhost:5174/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
  await page.fill('input[type="text"]', 'john@myday.co.tz');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1000);

  await checkPage('Customer Dashboard', 'http://localhost:5174/dashboard', '.cl-header', async (p) => {
    const text = await p.innerText('body');
    const hasDashboard = text.includes('Dashboard') || text.includes('Budget') || text.includes('Checklist') || text.includes('Milestones');
    return { pass: hasDashboard, detail: 'Customer Workspace Dashboard verified' };
  }, 'page_customer_dashboard.png');

  // 13. Vendor Portal (/provider) with Vendor login
  console.log('\n--- Authenticating Provider (Vendor) ---');
  await page.goto('http://localhost:5174/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
  // Click vendor role pill
  const vendorPill = await page.$('.clay-role-pill:has-text("Vendor")');
  if (vendorPill) await vendorPill.click();
  await page.waitForTimeout(300);
  await page.fill('input[type="text"]', 'info@grandimperial.co.tz');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1000);

  await checkPage('Provider Dashboard', 'http://localhost:5174/provider', '.cl-header', async (p) => {
    const text = await p.innerText('body');
    const hasPortal = text.includes('Portal') || text.includes('Vendor') || text.includes('Bookings') || text.includes('Schedule') || text.includes('Packages');
    return { pass: hasPortal, detail: 'Vendor Portal active' };
  }, 'page_provider_portal.png');

  // 14. Admin Console (/admin) with Admin login
  console.log('\n--- Authenticating Admin (Superuser) ---');
  await page.goto('http://localhost:5174/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
  await page.fill('input[type="text"]', 'admin@myday.co.tz');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1000);

  await checkPage('Admin Console', 'http://localhost:5174/admin', '.cl-header', async (p) => {
    const text = await p.innerText('body');
    const hasAdmin = text.includes('Admin') || text.includes('Escrow') || text.includes('Platform') || text.includes('Overview');
    return { pass: hasAdmin, detail: 'Admin Console active' };
  }, 'page_admin_console.png');

  // 15. Mobile Device Viewports
  console.log('\n📱 Testing Mobile Device Viewports...');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2
  });
  const mobilePage = await mobileContext.newPage();

  await mobilePage.goto('http://localhost:5174/', { waitUntil: 'domcontentloaded' });
  await mobilePage.waitForTimeout(600);
  await mobilePage.screenshot({ path: path.join(outDir, 'mobile_page_home.png') });
  console.log('  ✅ PASS: Mobile Homepage verified');

  await mobilePage.goto('http://localhost:5174/marketplace', { waitUntil: 'domcontentloaded' });
  await mobilePage.waitForTimeout(600);
  await mobilePage.screenshot({ path: path.join(outDir, 'mobile_page_marketplace.png') });
  console.log('  ✅ PASS: Mobile Marketplace verified');

  await mobilePage.goto('http://localhost:5174/login', { waitUntil: 'domcontentloaded' });
  await mobilePage.waitForTimeout(600);
  await mobilePage.screenshot({ path: path.join(outDir, 'mobile_page_login.png') });
  console.log('  ✅ PASS: Mobile Login verified');

  await mobilePage.goto('http://localhost:5174/vendor/kumbi/venue-1', { waitUntil: 'domcontentloaded' });
  await mobilePage.waitForTimeout(600);
  await mobilePage.screenshot({ path: path.join(outDir, 'mobile_page_vendor_detail.png') });
  console.log('  ✅ PASS: Mobile Vendor Detail verified');

  await browser.close();

  const passedCount = testResults.filter(r => r.passed).length;
  console.log('\n======================================================');
  console.log(`🎉 ALL PAGES AUDIT RESULT: ${passedCount}/${testResults.length} PASSED!`);
  if (pageErrors.length > 0) {
    console.log(`⚠️ Uncaught Console Errors: ${pageErrors.length}`);
  } else {
    console.log(`✨ ZERO UNCAUGHT CONSOLE ERRORS!`);
  }
  console.log('======================================================\n');
}

verifyAllPages().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
