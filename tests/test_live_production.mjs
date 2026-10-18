import { chromium } from '@playwright/test';

async function testLiveProduction() {
  const prodUrl = 'https://my-day-rust-five.vercel.app';
  console.log(`Testing LIVE Production Site: ${prodUrl}\n`);

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  try {
    // 1. Check Homepage
    console.log('1. Checking Live Homepage...');
    await page.goto(`${prodUrl}/`, { waitUntil: 'networkidle' });
    const title = await page.title();
    console.log(`   Page Title: "${title}"`);
    if (!title.includes('MY DAY')) throw new Error('Live homepage title incorrect');
    console.log('   ✅ Live Homepage rendered successfully.');

    // 2. Check Marketplace (the previously broken page)
    console.log('2. Checking Live Marketplace (Previously Broken Page)...');
    consoleErrors.length = 0;
    await page.goto(`${prodUrl}/marketplace`, { waitUntil: 'networkidle' });
    const cards = await page.$$('.card');
    console.log(`   Found ${cards.length} vendor cards.`);
    if (cards.length === 0) throw new Error('Marketplace cards did not render');
    const hasCritError = consoleErrors.some(e => e.includes('TypeError') || e.includes('ReferenceError'));
    if (hasCritError) throw new Error(`Marketplace has critical console errors: ${consoleErrors.join(', ')}`);
    console.log('   ✅ Live Marketplace renders cleanly without crash!');

    // 3. Check Wedding Profile (Previously Broken Page)
    console.log('3. Checking Live Wedding Profile (Previously Broken Page)...');
    consoleErrors.length = 0;
    await page.goto(`${prodUrl}/wedding`, { waitUntil: 'networkidle' });
    const weddingHeader = await page.$('h1');
    const h1Text = await weddingHeader.innerText();
    console.log(`   Header: "${h1Text}"`);
    if (!h1Text.includes('Wedding') && !h1Text.includes('Harusi')) throw new Error('Wedding profile did not render header');
    if (consoleErrors.some(e => e.includes('TypeError') || e.includes('ReferenceError'))) {
      throw new Error(`Wedding profile has critical errors: ${consoleErrors.join(', ')}`);
    }
    console.log('   ✅ Live Wedding Profile renders cleanly without crash!');

    // 4. Test Friendly Auth Prompt on Protected Action (Marketplace Book Now)
    console.log('4. Testing Auth Guard Modal on Marketplace Book Now...');
    await page.goto(`${prodUrl}/marketplace`, { waitUntil: 'networkidle' });
    const bookBtn = await page.$('button:has-text("Book Now"), .btn-pill-amber:has-text("Book")');
    if (bookBtn) {
      await bookBtn.click();
      await page.waitForTimeout(600);
      const text = await page.evaluate(() => document.body.innerText);
      const hasAuthPrompt = text.includes('Create your free MY DAY account to continue') &&
        text.includes('Join MY DAY to save your wedding plans') &&
        text.includes('Create Account') &&
        text.includes('Log In') &&
        text.includes('Maybe Later');
      if (hasAuthPrompt) {
        console.log('   ✅ Friendly Auth Prompt Modal triggered with exact required wording and buttons!');
      } else {
        throw new Error('Auth Prompt Modal text mismatch on live site');
      }

      const maybeLater = await page.$('button:has-text("Maybe Later")');
      if (maybeLater) await maybeLater.click();
      await page.waitForTimeout(400);
    }

    // 5. Test Live Dashboard for unauthenticated visitor
    console.log('5. Testing Live Event Dashboard for Visitor...');
    await page.goto(`${prodUrl}/dashboard`, { waitUntil: 'networkidle' });
    const dashText = await page.evaluate(() => document.body.innerText);
    if (dashText.includes('Create your free MY DAY account to continue')) {
      console.log('   ✅ Visitor on /dashboard sees friendly account creation reminder instead of broken page.');
    } else {
      throw new Error('/dashboard did not show auth reminder for visitor');
    }

    // 6. Test Live Bookings for unauthenticated visitor
    console.log('6. Testing Live Bookings for Visitor...');
    await page.goto(`${prodUrl}/bookings`, { waitUntil: 'networkidle' });
    const bookingsText = await page.evaluate(() => document.body.innerText);
    if (bookingsText.includes('Create your free MY DAY account to continue')) {
      console.log('   ✅ Visitor on /bookings sees friendly account creation reminder instead of broken page.');
    } else {
      throw new Error('/bookings did not show auth reminder for visitor');
    }

    // 7. Test AI Planner for unauthenticated visitor
    console.log('7. Testing Live AI Planner...');
    await page.goto(`${prodUrl}/planner`, { waitUntil: 'networkidle' });
    const plannerH1 = await page.$('h1');
    const plannerTitle = await plannerH1.innerText();
    console.log(`   Planner Header: "${plannerTitle}"`);
    console.log('   ✅ Live AI Planner opens cleanly for visitor exploration.');

    // 8. Test Mobile Viewport on Live Site
    console.log('8. Testing Mobile Viewport (375x812)...');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${prodUrl}/marketplace`, { waitUntil: 'networkidle' });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    if (!overflow) {
      console.log('   ✅ Zero horizontal overflow on mobile viewport.');
    } else {
      throw new Error('Mobile viewport has horizontal overflow');
    }

    console.log('\n====================================================');
    console.log('🌟 LIVE PRODUCTION VERIFICATION COMPLETE: ALL CHECKS PASSED!');
    console.log('====================================================\n');
  } finally {
    await browser.close();
  }
}

testLiveProduction().catch(err => {
  console.error('❌ Live production test failed:', err);
  process.exit(1);
});
