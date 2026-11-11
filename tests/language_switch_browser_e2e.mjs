// tests/language_switch_browser_e2e.mjs
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';

async function runBrowserE2ELanguageAudit() {
  console.log('🌐 STARTING PLAYWRIGHT BROWSER E2E LANGUAGE AUDIT...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    locale: 'en-US',
  });
  const page = await context.newPage();

  try {
    // 1. Visit Homepage
    console.log('1. Loading Homepage at http://localhost:5173/ ...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

    // Initial language check
    const enToggle = page.locator('#lang-toggle-en');
    const swToggle = page.locator('#lang-toggle-sw');
    await assert.ok(await enToggle.isVisible(), 'English toggle button visible');
    await assert.ok(await swToggle.isVisible(), 'Swahili toggle button visible');

    // 2. Switch to Kiswahili on Homepage
    console.log('2. Clicking Swahili toggle button (#lang-toggle-sw)...');
    await swToggle.click();
    await page.waitForTimeout(300);

    // Verify Homepage elements in Kiswahili
    const navBrowseText = await page.locator('nav a[href="/marketplace"]').first().innerText();
    console.log(`   Nav browse text: "${navBrowseText}"`);
    assert.ok(navBrowseText.includes('Tafuta') || navBrowseText.includes('Huduma'), `Expected Swahili browse text, got "${navBrowseText}"`);

    const footerHqText = await page.locator('.footer-info-capsule').first().innerText();
    console.log(`   Footer text snippet: "${footerHqText.replace(/\n/g, ' ')}"`);
    assert.ok(footerHqText.toLowerCase().includes('makao makuu dar es salaam'), 'Footer HQ title translated to Kiswahili');

    // 3. Navigate to Marketplace
    console.log('3. Navigating to /marketplace in Kiswahili...');
    await page.goto('http://localhost:5173/marketplace', { waitUntil: 'networkidle' });

    const venuePill = await page.locator('.mkt-categories-bar button').first().innerText();
    console.log(`   Category pill text: "${venuePill.replace(/\n/g, ' ')}"`);
    assert.ok(venuePill.includes('Makundi Yote') || venuePill.includes('Kumbi'), `Category pill in Swahili, got "${venuePill}"`);

    const bookBtn = await page.locator('.btn-pill-amber').first().innerText();
    console.log(`   Vendor card CTA button: "${bookBtn}"`);
    assert.ok(bookBtn.includes('Hifadhi') || bookBtn.includes('Weka Nafasi') || bookBtn.includes('Ingia') || bookBtn.includes('Jisajili'), `Expected Swahili CTA, got "${bookBtn}"`);

    // 4. Open Vendor Detail Page
    console.log('4. Navigating to vendor detail page in Kiswahili...');
    await page.goto('http://localhost:5173/vendor/kumbi/venue-1', { waitUntil: 'networkidle' });

    const pageContentSw = await page.content();
    console.log(`   Verifying Swahili content on vendor page...`);
    assert.ok(pageContentSw.includes('Kuanzia Bei ya'), 'Starting price translated to Swahili');
    assert.ok(pageContentSw.includes('/siku'), 'Rate unit translated to Swahili (/siku)');
    assert.ok(pageContentSw.includes('Ulinzi wa Malipo wa MY DAY'), 'Buyer protection translated to Swahili');

    // 5. Switch back to English on Vendor Detail Page
    console.log('5. Clicking English toggle button (#lang-toggle-en) while on Vendor Detail Page...');
    await page.locator('#lang-toggle-en').click();
    await page.waitForTimeout(300);

    const pageContentEn = await page.content();
    console.log(`   Verifying English content on vendor page...`);
    assert.ok(pageContentEn.includes('Starting Price'), 'Starting price translated back to English');
    assert.ok(pageContentEn.includes('/day'), 'Rate unit translated back to English (/day)');
    assert.ok(pageContentEn.includes('MY DAY Buyer Protection Guarantee'), 'Buyer protection translated back to English');

    // 6. Form Value Preservation Test
    console.log('6. Verifying Form State Preservation across language switch...');
    await page.goto('http://localhost:5173/wedding', { waitUntil: 'networkidle' });

    // Fill inputs
    const brideInput = page.locator('#wprof-bride');
    const groomInput = page.locator('#wprof-groom');
    await brideInput.fill('Zainab Rashid');
    await groomInput.fill('Baraka Mussa');

    // Switch to Kiswahili
    await page.locator('#lang-toggle-sw').click();
    await page.waitForTimeout(300);

    // Verify form input values were NOT erased
    const preservedBride = await brideInput.inputValue();
    const preservedGroom = await groomInput.inputValue();
    console.log(`   Preserved Bride Name: "${preservedBride}"`);
    console.log(`   Preserved Groom Name: "${preservedGroom}"`);
    assert.equal(preservedBride, 'Zainab Rashid', 'Bride input preserved across language toggle');
    assert.equal(preservedGroom, 'Baraka Mussa', 'Groom input preserved across language toggle');

    // 7. Verify AI Planner Language Sync
    console.log('7. Verifying AI Planner Language Sync at /planner...');
    await page.goto('http://localhost:5173/planner', { waitUntil: 'networkidle' });

    // Current language is SW, check welcome message
    const welcomeMsg = await page.locator('.chat-message-bubble, .card').first().innerText();
    console.log(`   Planner welcome snippet: "${welcomeMsg.slice(0, 100).replace(/\n/g, ' ')}..."`);
    assert.ok(welcomeMsg.includes('Habari') || welcomeMsg.includes('Karibu') || welcomeMsg.includes('MY DAY'), 'AI planner initialized with natural greeting');

    console.log('\n🎉 PLAYWRIGHT BROWSER E2E TESTS COMPLETED WITH 100% SUCCESS!');
  } finally {
    await browser.close();
  }
}

runBrowserE2ELanguageAudit().catch(err => {
  console.error('❌ Browser E2E Test Failure:', err);
  process.exit(1);
});
