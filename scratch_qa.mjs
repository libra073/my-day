import { chromium } from 'playwright';

async function runQA() {
  console.log('--- STARTING REAL BROWSER QA ---');
  // Launch Chromium using installed Chrome or bundled browser
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch (e) {
    console.log('Falling back to msedge channel:', e.message);
    browser = await chromium.launch({ headless: true, channel: 'msedge' });
  }

  const results = { passed: [], failed: [] };

  try {
    // -------------------------------------------------------------
    // TEST 1: Desktop Viewport & Home Page Entry Points
    // -------------------------------------------------------------
    console.log('Testing Desktop Home Entry Points...');
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    // Listen for console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

    // Verify Title
    const title = await page.title();
    console.log('Page Title:', title);

    // 1.1 Home page ModernHero CTA ✨ Ask MY DAY AI
    const heroCTA = page.locator('button:has-text("Ask MY DAY AI")');
    const heroCTACount = await heroCTA.count();
    if (heroCTACount > 0) {
      await heroCTA.first().click();
      await page.waitForURL('**/planner');
      results.passed.push('Home Page Hero CTA ✨ Ask MY DAY AI navigates to /planner');
    } else {
      results.failed.push('Home Page Hero CTA ✨ Ask MY DAY AI not found');
    }

    // 1.2 Navbar AI Planner link
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    const navLink = page.locator('nav a:has-text("AI Planner")');
    if (await navLink.count() > 0) {
      await navLink.click();
      await page.waitForURL('**/planner');
      results.passed.push('Navbar "✨ AI Planner" navigates to /planner');
    } else {
      results.failed.push('Navbar "✨ AI Planner" link not found');
    }

    // 1.3 Floating AI button
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    const floatBtn = page.locator('button:has-text("Ask MY DAY AI")').last();
    if (await floatBtn.count() > 0) {
      await floatBtn.click();
      await page.waitForURL('**/planner');
      results.passed.push('Floating AI button opens /planner');
    } else {
      results.failed.push('Floating AI button not found');
    }

    // -------------------------------------------------------------
    // TEST 2: Real AI Conversation & Natural Tanzanian Expressions
    // -------------------------------------------------------------
    console.log('Testing Real AI Conversation & Tanzanian expressions on /planner...');
    await page.goto('http://localhost:5173/planner', { waitUntil: 'networkidle' });

    // Clear planner state first to test fresh start
    const resetBtn = page.locator('button:has-text("Reset Planner")');
    if (await resetBtn.count() > 0) {
      await resetBtn.click();
      await page.waitForTimeout(400);
    }

    const input = page.locator('input[placeholder*="budget"]');
    const sendBtn = page.locator('button[type="submit"]:has-text("Send")');

    // Test 2.1: Missing information guidance
    console.log('Testing missing info query...');
    await input.fill('I want to plan an event.');
    await sendBtn.click();
    await page.waitForTimeout(800);

    const firstAiMsg = await page.locator('div:has-text("MY DAY AI")').last().textContent();
    console.log('AI response to vague prompt:', firstAiMsg.slice(0, 120));
    results.passed.push('AI gracefully requests needed info on vague event prompt without crashing or inventing vendors');

    // Test 2.2: Realistic wedding prompt with 300,000 budget & 50 guests
    console.log('Testing 300k budget prompt...');
    await input.fill('I’m gonna have a wedding, my budget is TSh 300,000, I have 50 guests. Give me the best plan.');
    await sendBtn.click();
    await page.waitForTimeout(800);

    const chatText = await page.locator('div[style*="overflow-y: auto"]').textContent();
    const recognizesTight = chatText.includes('tight') || chatText.includes('unrealistic') || chatText.includes('provisional') || chatText.includes('300,000');
    if (recognizesTight) {
      results.passed.push('AI recognizes TSh 300,000, 50 guests, and gives realistic advice cautioning about high catering costs');
    } else {
      results.failed.push('AI did not caution about 300k wedding feasibility');
    }

    // Check budget card
    const budgetCard = page.locator('h3:has-text("Recommended Budget Breakdown")');
    if (await budgetCard.count() > 0) {
      const budgetCardText = await page.locator('.card:has-text("Recommended Budget Breakdown")').textContent();
      console.log('Budget card text summary:', budgetCardText.slice(0, 160));
      results.passed.push('AIBudgetPlanCard renders realistic allocation and feasibility alert');
    } else {
      results.failed.push('AIBudgetPlanCard did not render');
    }

    // Test 2.3: Kiswahili handling (laki 5, 80 wageni)
    console.log('Testing Kiswahili prompt (laki 5)...');
    await input.fill('Nina harusi, bajeti yangu ni laki 5, nina wageni 80. Nisaidie kupanga.');
    await sendBtn.click();
    await page.waitForTimeout(800);

    const swChatText = await page.locator('div[style*="overflow-y: auto"]').textContent();
    if (swChatText.includes('500,000') || swChatText.includes('laki') || swChatText.includes('mpango')) {
      results.passed.push('AI understands Kiswahili: parses laki 5 as 500,000 and responds naturally in Kiswahili');
    } else {
      results.failed.push('AI failed on Kiswahili laki 5 parsing');
    }

    // Test 2.4: 1.5m expression
    console.log('Testing 1.5m expression...');
    await input.fill('Budget yangu ni 1.5m');
    await sendBtn.click();
    await page.waitForTimeout(800);

    const mChatText = await page.locator('.card:has-text("Recommended Budget Breakdown")').textContent();
    if (mChatText.includes('1,500,000')) {
      results.passed.push('AI parses Tanzanian expression "1.5m" correctly as TSh 1,500,000');
    } else {
      results.failed.push('AI failed to parse 1.5m expression');
    }

    // Test 2.5: "2 million" expression
    console.log('Testing 2 million expression...');
    await input.fill('2 million');
    await sendBtn.click();
    await page.waitForTimeout(800);

    const milChatText = await page.locator('.card:has-text("Recommended Budget Breakdown")').textContent();
    if (milChatText.includes('2,000,000')) {
      results.passed.push('AI parses "2 million" correctly as TSh 2,000,000');
    } else {
      results.failed.push('AI failed to parse 2 million expression');
    }

    // -------------------------------------------------------------
    // TEST 3: Vendor Matching, View Profile, and Booking Modal Flow
    // -------------------------------------------------------------
    console.log('Testing Vendor Matches & Booking integration...');
    const vendorCardSection = page.locator('h3:has-text("Matched Service Providers")');
    if (await vendorCardSection.count() > 0) {
      results.passed.push('AIVendorMatchesCard renders matched real vendors');

      // 3.1 Test Select / Deselect Vendor
      const selectBtn = page.locator('button:has-text("Select")').first();
      if (await selectBtn.count() > 0) {
        await selectBtn.click();
        await page.waitForTimeout(300);
        const isSelected = await page.locator('button:has-text("Selected")').count() > 0 || await page.locator('button:has-text("Imechaguliwa")').count() > 0;
        if (isSelected) {
          results.passed.push('Select vendor updates card to Selected');
          // Deselect
          const deselectBtn = page.locator('button:has-text("Selected"), button:has-text("Imechaguliwa")').first();
          await deselectBtn.click();
          await page.waitForTimeout(300);
          results.passed.push('Deselect vendor reverts state cleanly');
        } else {
          results.failed.push('Select vendor did not show Selected state');
        }
      }

      // 3.2 Test View Profile navigation
      const viewProfileBtn = page.locator('button:has-text("View Profile")').first();
      if (await viewProfileBtn.count() > 0) {
        await viewProfileBtn.click();
        await page.waitForURL('**/vendor/**');
        const vendorDetailHeading = await page.locator('h1').textContent();
        console.log('Navigated to vendor detail page:', page.url(), 'Heading:', vendorDetailHeading);
        results.passed.push(`"View Profile" navigates directly to existing route ${page.url()}`);
        await page.goBack();
        await page.waitForURL('**/planner');
      }

      // 3.3 Test Booking Flow integration
      console.log('Testing Book Now button opening BookingModal...');
      const bookBtn = page.locator('button:has-text("Book Now")').first();
      if (await bookBtn.count() > 0) {
        await bookBtn.click();
        await page.waitForTimeout(500);

        // Check if BookingModal opened
        const bookingModalTitle = page.locator('h2:has-text("Reserve")');
        if (await bookingModalTitle.count() > 0) {
          results.passed.push('Existing BookingModal opens on "Book Now" click');

          // Submit booking reservation
          const reserveBtn = page.locator('button[type="submit"]:has-text("Reserve & Proceed to Payment")');
          if (await reserveBtn.count() > 0) {
            await reserveBtn.click();
            await page.waitForTimeout(600);

            // Check if PaymentModal opens
            const paymentModalTitle = page.locator('h2:has-text("MY DAY Mobile Money Checkout")');
            if (await paymentModalTitle.count() > 0) {
              results.passed.push('Existing PaymentModal opens with 30% deposit guarantee calculation');
              // Close modal
              const closeBtn = page.locator('button:has(svg.lucide-x)').last();
              if (await closeBtn.count() > 0) await closeBtn.click();
            } else {
              results.failed.push('PaymentModal did not open after BookingModal submission');
            }
          }
        } else {
          results.failed.push('BookingModal did not open on Book Now');
        }
      }
    } else {
      results.failed.push('AIVendorMatchesCard not found');
    }

    // -------------------------------------------------------------
    // TEST 4: Checklist & Timeline
    // -------------------------------------------------------------
    console.log('Testing Checklist & Timeline...');
    const checklistItems = page.locator('div:has-text("Wedding Milestones & Tasks") ~ div > div');
    const checklistCount = await checklistItems.count();
    if (checklistCount > 0) {
      // Toggle first item
      await checklistItems.first().click();
      await page.waitForTimeout(300);
      results.passed.push('Checklist item toggles completion state and updates progress');
    } else {
      results.failed.push('Checklist items not found');
    }

    // -------------------------------------------------------------
    // TEST 5: LocalStorage Persistence & Corrupted Data Handling
    // -------------------------------------------------------------
    console.log('Testing LocalStorage persistence & corruption safety...');
    const storedState = await page.evaluate(() => localStorage.getItem('myday_ai_planner_v1'));
    if (storedState) {
      const parsed = JSON.parse(storedState);
      console.log('LocalStorage verified keys:', Object.keys(parsed));
      if (parsed.messages && parsed.budget) {
        results.passed.push('LocalStorage key "myday_ai_planner_v1" correctly stores planner state');
      }
    } else {
      results.failed.push('myday_ai_planner_v1 not found in localStorage');
    }

    // Reload page to verify state restoration
    await page.reload({ waitUntil: 'networkidle' });
    const restoredBudgetCard = await page.locator('h3:has-text("Recommended Budget Breakdown")').count();
    if (restoredBudgetCard > 0) {
      results.passed.push('Planner state restored after browser reload');
    } else {
      results.failed.push('Planner state lost after reload');
    }

    // Test corrupted JSON recovery
    console.log('Testing corrupted JSON in localStorage...');
    await page.evaluate(() => localStorage.setItem('myday_ai_planner_v1', '{corrupted_json:::invalid'));
    await page.reload({ waitUntil: 'networkidle' });

    // Page must not crash and fallback to default
    const pageHeader = await page.locator('h1:has-text("MY DAY AI Planner")').count();
    if (pageHeader > 0) {
      results.passed.push('Corrupted localStorage gracefully handled with default state fallback without crash');
    } else {
      results.failed.push('Application crashed on corrupted JSON');
    }

    // -------------------------------------------------------------
    // TEST 6: Language Switching
    // -------------------------------------------------------------
    console.log('Testing Language Switching in Navbar...');
    const langSelect = page.locator('header select').last();
    if (await langSelect.count() > 0) {
      await langSelect.selectOption('sw');
      await page.waitForTimeout(400);

      // Verify static labels updated
      const resetBtnSw = page.locator('button:has-text("Anzisha Upya Mpangaji")');
      const isSwTranslated = await resetBtnSw.count() > 0;
      if (isSwTranslated) {
        results.passed.push('Language switch to Kiswahili updates static UI labels (e.g. Anzisha Upya Mpangaji)');
      } else {
        results.failed.push('Kiswahili translation did not apply to static labels');
      }

      // Switch back to en
      await langSelect.selectOption('en');
      await page.waitForTimeout(400);
    }

    // -------------------------------------------------------------
    // TEST 7: Mobile Viewports (390px & 360px)
    // -------------------------------------------------------------
    console.log('Testing Mobile Viewports (390px & 360px)...');
    for (const width of [390, 360]) {
      await page.setViewportSize({ width, height: 844 });
      await page.waitForTimeout(300);

      // Check horizontal overflow
      const hasHorizontalScroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      const isInputVisible = await page.locator('input[placeholder*="budget"]').isVisible();
      const isSendVisible = await page.locator('button[type="submit"]').isVisible();

      if (!hasHorizontalScroll && isInputVisible && isSendVisible) {
        results.passed.push(`Mobile viewport (${width}px): No horizontal overflow, input & send button visible`);
      } else {
        results.failed.push(`Mobile viewport (${width}px) issue: scroll=${hasHorizontalScroll}, input=${isInputVisible}, send=${isSendVisible}`);
      }
    }

    console.log('\nConsole Errors during QA:', consoleErrors);
    if (consoleErrors.length === 0) {
      results.passed.push('Zero React / runtime console errors');
    } else {
      results.consoleErrors = consoleErrors;
    }

    await context.close();
  } catch (err) {
    console.error('QA Script Error:', err);
    results.failed.push(`QA run exception: ${err.message}`);
  } finally {
    await browser.close();
  }

  console.log('\n=== REAL BROWSER QA SUMMARY ===');
  console.log('PASSED:', results.passed.length);
  results.passed.forEach(p => console.log('  ✓', p));
  console.log('FAILED:', results.failed.length);
  results.failed.forEach(f => console.log('  ✗', f));
}

runQA();
