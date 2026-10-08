import { test, expect } from '@playwright/test';

test.describe('MY DAY AI Planner End-to-End Real Browser QA', () => {

  test('1. Home Page Entry Points and Navigation to /planner', async ({ page }) => {
    await page.goto('http://localhost:5173/');

    // 1.1 ModernHero CTA
    const heroBtn = page.locator('button:has-text("Ask MY DAY AI")').first();
    await expect(heroBtn).toBeVisible();
    await heroBtn.click();
    await expect(page).toHaveURL(/.*\/planner/);

    // 1.2 Navbar Link
    await page.goto('http://localhost:5173/');
    const navLink = page.locator('nav a:has-text("AI Planner")');
    await expect(navLink).toBeVisible();
    await navLink.click();
    await expect(page).toHaveURL(/.*\/planner/);

    // 1.3 Floating Button
    await page.goto('http://localhost:5173/');
    const floatBtn = page.locator('button:has-text("Ask MY DAY AI")').last();
    await expect(floatBtn).toBeVisible();
    await floatBtn.click();
    await expect(page).toHaveURL(/.*\/planner/);
  });

  test('2. Real Conversational Planning and Natural Tanzanian Expressions', async ({ page }) => {
    await page.goto('http://localhost:5173/planner');

    // Reset planner first
    await page.locator('button:has-text("Reset Planner")').click();
    await page.waitForTimeout(300);

    const input = page.locator('input[placeholder*="budget"]');
    const sendBtn = page.locator('button[type="submit"]:has-text("Send")');

    // 2.1 Vague prompt - missing information guidance
    await input.fill('I want to plan an event.');
    await sendBtn.click();
    await page.waitForTimeout(600);
    const firstReply = await page.locator('div[style*="overflow-y: auto"]').textContent();
    expect(firstReply).toContain('MY DAY AI');

    // 2.2 300k budget prompt with 50 guests
    await input.fill('I’m gonna have a wedding, my budget is TSh 300,000, I have 50 guests. Give me the best plan.');
    await sendBtn.click();
    await page.waitForTimeout(600);

    const chatContent = await page.locator('div[style*="overflow-y: auto"]').textContent();
    expect(chatContent).toContain('300,000');
    // Realistic feasibility warning
    expect(chatContent.toLowerCase()).toMatch(/tight|unrealistic|provisional|difficult/);

    // Budget card visibility and breakdown
    const budgetCard = page.locator('h3:has-text("Recommended Budget Breakdown")');
    await expect(budgetCard).toBeVisible();

    // 2.3 Kiswahili prompt (laki 5, 80 wageni)
    await input.fill('Nina harusi, bajeti yangu ni laki 5, nina wageni 80. Nisaidie kupanga.');
    await sendBtn.click();
    await page.waitForTimeout(600);

    const swContent = await page.locator('div[style*="overflow-y: auto"]').textContent();
    expect(swContent).toMatch(/500,000|laki|mpango/i);

    // 2.4 1.5m Tanzanian expression
    await input.fill('Budget yangu ni 1.5m');
    await sendBtn.click();
    await page.waitForTimeout(600);

    const budgetCardText = await page.locator('.card:has-text("Recommended Budget Breakdown")').textContent();
    expect(budgetCardText).toContain('1,500,000');

    // 2.5 2 million expression
    await input.fill('2 million');
    await sendBtn.click();
    await page.waitForTimeout(600);

    const budgetCardText2 = await page.locator('.card:has-text("Recommended Budget Breakdown")').textContent();
    expect(budgetCardText2).toContain('2,000,000');
  });

  test('3. Real Vendor Matching, Select/Deselect, Profile Navigation, and Booking Flow', async ({ page }) => {
    await page.goto('http://localhost:5173/planner');

    const vendorCardHeader = page.locator('h3:has-text("Matched Service Providers")');
    await expect(vendorCardHeader).toBeVisible();

    // 3.1 Select and Deselect Vendor
    const selectBtn = page.locator('button:has-text("Select")').first();
    await expect(selectBtn).toBeVisible();
    await selectBtn.click();
    await page.waitForTimeout(200);

    const selectedBtn = page.locator('button:has-text("Selected")').first();
    await expect(selectedBtn).toBeVisible();

    // Deselect
    await selectedBtn.click();
    await page.waitForTimeout(200);
    await expect(page.locator('button:has-text("Select")').first()).toBeVisible();

    // 3.2 View Profile Navigation to /vendor/:category/:id
    const viewProfileBtn = page.locator('button:has-text("View Profile")').first();
    await viewProfileBtn.click();
    await expect(page).toHaveURL(/.*\/vendor\/.+\/.+/);
    await expect(page.locator('h1')).toBeVisible();

    // Return to planner
    await page.goBack();
    await expect(page).toHaveURL(/.*\/planner/);

    // 3.3 Book Now -> BookingModal -> PaymentModal Flow
    const bookNowBtn = page.locator('button:has-text("Book Now")').first();
    await bookNowBtn.click();

    // Verify BookingModal opened
    const bookingModal = page.locator('h2:has-text("Reserve")');
    await expect(bookingModal).toBeVisible();

    // Proceed to Payment
    const reserveBtn = page.locator('button[type="submit"]:has-text("Reserve & Proceed to Payment")');
    await reserveBtn.click();

    // Verify PaymentModal opened with 30% deposit guarantee
    const paymentModal = page.locator('h2:has-text("MY DAY Mobile Money Checkout")');
    await expect(paymentModal).toBeVisible();

    // Close modal
    const closeBtn = page.locator('button:has(svg.lucide-x)').last();
    await closeBtn.click();
  });

  test('4. Interactive Checklist and Milestone Progress Tracking', async ({ page }) => {
    await page.goto('http://localhost:5173/planner');

    const checklistSection = page.locator('h3:has-text("Wedding Milestones & Tasks")');
    await expect(checklistSection).toBeVisible();

    const firstCheckItem = page.locator('div:has-text("Wedding Milestones & Tasks") ~ div > div').first();
    await firstCheckItem.click();
    await page.waitForTimeout(200);

    // Verify progress updated
    const progressText = await page.locator('div:has-text("completed")').first().textContent();
    expect(progressText).toMatch(/\d+%/);
  });

  test('5. LocalStorage State Persistence and Corrupted JSON Recovery', async ({ page }) => {
    await page.goto('http://localhost:5173/planner');

    // Check localStorage key
    const storageValue = await page.evaluate(() => localStorage.getItem('myday_ai_planner_v1'));
    expect(storageValue).not.toBeNull();
    const parsed = JSON.parse(storageValue);
    expect(parsed.messages).toBeDefined();

    // Reload page to verify persistence
    await page.reload();
    await expect(page.locator('h3:has-text("Recommended Budget Breakdown")')).toBeVisible();

    // Inject corrupted JSON
    await page.evaluate(() => localStorage.setItem('myday_ai_planner_v1', '{corrupted_malformed_json'));
    await page.reload();

    // Verify application survives without crash and renders fresh state
    await expect(page.locator('h1:has-text("MY DAY AI Planner")')).toBeVisible();
  });

  test('6. Language Switching (English / Kiswahili)', async ({ page }) => {
    await page.goto('http://localhost:5173/planner');

    const langSelect = page.locator('header select').last();
    await langSelect.selectOption('sw');
    await page.waitForTimeout(300);

    // Check Kiswahili static labels
    const resetBtnSw = page.locator('button:has-text("Anzisha Upya Mpangaji")');
    await expect(resetBtnSw).toBeVisible();

    // Switch back to English
    await langSelect.selectOption('en');
    await page.waitForTimeout(300);
    const resetBtnEn = page.locator('button:has-text("Reset Planner")');
    await expect(resetBtnEn).toBeVisible();
  });

  test('7. Mobile Viewports (390px and 360px)', async ({ page }) => {
    for (const width of [390, 360]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('http://localhost:5173/planner');

      // Verify no horizontal overflow
      const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      expect(hasOverflow).toBe(false);

      // Verify chat input and send button are visible and operable
      await expect(page.locator('input[placeholder*="budget"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]:has-text("Send")')).toBeVisible();
    }
  });

});
