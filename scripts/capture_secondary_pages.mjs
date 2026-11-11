import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function captureSecondary() {
  const artifactDir = 'C:/Users/libra051099/.gemini/antigravity/brain/826a53e1-734d-4f8b-bd2a-9cd01606e0fc';
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch (e) {
    console.log('Falling back to msedge channel:', e.message);
    browser = await chromium.launch({ headless: true, channel: 'msedge' });
  }

  const contextDesktop = await browser.newContext({
    viewport: { width: 1600, height: 1100 },
    deviceScaleFactor: 2
  });
  const page = await contextDesktop.newPage();

  // Set logged in state with customer role & rich wedding
  await page.goto('http://localhost:5175/', { waitUntil: 'networkidle' });
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

  // 1. Vendor Detail Page
  console.log('Capturing Vendor Detail...');
  await page.goto('http://localhost:5175/vendor/kumbi/venue-1', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const vendorPath = path.join(artifactDir, 'liquid_glass_desktop_1600_vendor_detail.png');
  await page.screenshot({ path: vendorPath });
  console.log('Saved Vendor Detail:', vendorPath);

  // 2. Become Vendor Page
  console.log('Capturing Become Vendor...');
  await page.goto('http://localhost:5175/become-vendor', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const becomeVendorPath = path.join(artifactDir, 'liquid_glass_desktop_1600_become_vendor.png');
  await page.screenshot({ path: becomeVendorPath });
  console.log('Saved Become Vendor:', becomeVendorPath);

  // 3. Wedding Dashboard Page (Active Wedding with Countdown & Financials)
  console.log('Capturing Dashboard...');
  await page.goto('http://localhost:5175/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const dashboardPath = path.join(artifactDir, 'liquid_glass_desktop_1600_dashboard.png');
  await page.screenshot({ path: dashboardPath });
  console.log('Saved Dashboard:', dashboardPath);

  // 4. Booking Modal -> Payment Modal
  console.log('Capturing Payment Modal...');
  await page.goto('http://localhost:5175/vendor/kumbi/venue-1', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const reserveBtn = page.locator('button:has-text("Reserve Now"), button:has-text("Weka Nafasi")').first();
  if (await reserveBtn.count() > 0) {
    await reserveBtn.click();
    await page.waitForTimeout(600);
    // Find the submit button inside modal
    const proceedBtn = page.locator('.btn-primary[type="submit"]').first();
    if (await proceedBtn.count() > 0) {
      await proceedBtn.click();
      await page.waitForTimeout(1000);
      const paymentModalPath = path.join(artifactDir, 'liquid_glass_desktop_1600_payment_modal.png');
      await page.screenshot({ path: paymentModalPath });
      console.log('Saved Payment Modal:', paymentModalPath);
    }
  }

  await contextDesktop.close();
  await browser.close();
}

captureSecondary().catch(err => {
  console.error('Capture failed:', err);
  process.exit(1);
});
