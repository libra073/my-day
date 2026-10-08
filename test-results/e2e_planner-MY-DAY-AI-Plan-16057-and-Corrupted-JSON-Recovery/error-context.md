# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e_planner.spec.mjs >> MY DAY AI Planner End-to-End Real Browser QA >> 5. LocalStorage State Persistence and Corrupted JSON Recovery
- Location: e2e_planner.spec.mjs:151:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('h3:has-text("Recommended Budget Breakdown")')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('h3:has-text("Recommended Budget Breakdown")') with timeout 5000ms
  - waiting for locator('h3:has-text("Recommended Budget Breakdown")')

```

```yaml
- banner:
  - text: "Tanzania's #1 All-in-One Wedding Platform Demo Role Switcher:"
  - combobox:
    - option "💍 Couple (John & Sarah)" [selected]
    - option "🏰 Vendor (Grand Imperial)"
    - option "⚡ MY DAY Admin"
  - text: "|"
  - combobox:
    - option "🇬🇧 English" [selected]
    - option "🇹🇿 Kiswahili"
  - navigation:
    - link "MY DAY Wedding Marketplace":
      - /url: /
    - link "Home":
      - /url: /
    - link "AI Planner":
      - /url: /planner
    - link "Browse Services":
      - /url: /marketplace
    - link "Wedding Profile":
      - /url: /wedding
    - link "Event Dashboard":
      - /url: /dashboard
    - link "My Bookings (0)":
      - /url: /bookings
    - link "Become a Vendor":
      - /url: /become-vendor
    - link "Contact Us":
      - /url: /contact
    - text: John & Sarah
    - button "Log Out"
- main:
  - link "Home":
    - /url: /
  - heading "MY DAY AI Planner" [level=1]
  - button "Reset Planner"
  - text: Tanzanian Event Planning Specialist Live & Ready Habari! Welcome to MY DAY AI Planner. I can help you plan your wedding or event in Tanzania. Tell me your budget (e.g. 500k, 5m, or TSh 15,000,000), guest count, or location to get a realistic budget plan and verified vendor matches!
  - button "💡 I'm having a wedding in Dar es Salaam, budget 300k, 50 guests."
  - button "💡 Budget is 5 million TSh for 250 guests in Arusha. Show best plan."
  - button "💡 Show me cheaper budget options for decor and entertainment."
  - button "💡 We have 15m TSh for a luxury wedding in Zanzibar with 150 guests."
  - textbox "Type your budget, guest count, or location..."
  - button "Send"
  - text: Planner Status Awaiting Budget Live Preparation Checklist
  - heading "Wedding Milestones & Tasks" [level=3]
  - paragraph: Stay organized with essential Tanzanian wedding milestones. Mark items complete as you progress.
  - text: 0 / 8 0% completed Choose wedding venue (Kumbi) venue Confirm estimated guest count general Select catering service and sample menu catering Select decoration & floral theme (Wapambaji) decoration Hire Master of Ceremonies (MC) & DJ entertainment Book professional wedding photographer & video photography Confirm bridal transport & convoy transport Confirm advance bookings (30% deposit guarantee) general Preparation Milestones
  - heading "Countdown Preparation Timeline" [level=3]
  - paragraph:
    - text: "Event Date:"
    - strong: 2026-12-25
    - text: (wedding)
  - text: 6 Months Before • Jun 25, 2026
  - heading "Secure Venue (Kumbi) & Catering" [level=4]
  - paragraph: Pay initial 30% deposit to lock your high-demand date.
  - text: 3 Months Before • Sep 25, 2026
  - heading "Confirm MC, Decorator & Photo/Video" [level=4]
  - paragraph: Align on event script with your MC and finalize decor concept.
  - text: 1 Month Before • Nov 25, 2026
  - heading "Finalize Guest RSVPs & Bridal Convoy" [level=4]
  - paragraph: Lock catering guest count and test transport routes.
  - text: 1 Week Before • Nov 25, 2026
  - heading "Bridal Beauty & Final Rehearsals" [level=4]
  - paragraph: Final fittings, henna sessions, and vendor schedule confirmations.
  - text: Event Day • Dec 25, 2026
  - heading "Your Perfect Wedding Day!" [level=4]
  - paragraph: Relax and celebrate with your loved ones while MY DAY keeps everything organized.
- text: Wedding Budget Tracker
- button
- text: "Target Budget:"
- strong: TSh 15,000,000
- text: "Committed Services:"
- strong: TSh 0
- link "Open Event Dashboard":
  - /url: /dashboard
- button "✨ Ask MY DAY AI"
- contentinfo:
  - text: © 2026 MY DAY. All Rights Reserved.
  - link "Privacy Policy":
    - /url: /contact
  - link "Terms & Conditions":
    - /url: /contact
  - link "Help Center & FAQ":
    - /url: /contact
  - link "Contact Us":
    - /url: /contact
```

# Test source

```ts
  62  |     await sendBtn.click();
  63  |     await page.waitForTimeout(600);
  64  | 
  65  |     const swContent = await page.locator('div[style*="overflow-y: auto"]').textContent();
  66  |     expect(swContent).toMatch(/500,000|laki|mpango/i);
  67  | 
  68  |     // 2.4 1.5m Tanzanian expression
  69  |     await input.fill('Budget yangu ni 1.5m');
  70  |     await sendBtn.click();
  71  |     await page.waitForTimeout(600);
  72  | 
  73  |     const budgetCardText = await page.locator('.card:has-text("Recommended Budget Breakdown")').textContent();
  74  |     expect(budgetCardText).toContain('1,500,000');
  75  | 
  76  |     // 2.5 2 million expression
  77  |     await input.fill('2 million');
  78  |     await sendBtn.click();
  79  |     await page.waitForTimeout(600);
  80  | 
  81  |     const budgetCardText2 = await page.locator('.card:has-text("Recommended Budget Breakdown")').textContent();
  82  |     expect(budgetCardText2).toContain('2,000,000');
  83  |   });
  84  | 
  85  |   test('3. Real Vendor Matching, Select/Deselect, Profile Navigation, and Booking Flow', async ({ page }) => {
  86  |     await page.goto('http://localhost:5173/planner');
  87  | 
  88  |     const vendorCardHeader = page.locator('h3:has-text("Matched Service Providers")');
  89  |     await expect(vendorCardHeader).toBeVisible();
  90  | 
  91  |     // 3.1 Select and Deselect Vendor
  92  |     const selectBtn = page.locator('button:has-text("Select")').first();
  93  |     await expect(selectBtn).toBeVisible();
  94  |     await selectBtn.click();
  95  |     await page.waitForTimeout(200);
  96  | 
  97  |     const selectedBtn = page.locator('button:has-text("Selected")').first();
  98  |     await expect(selectedBtn).toBeVisible();
  99  | 
  100 |     // Deselect
  101 |     await selectedBtn.click();
  102 |     await page.waitForTimeout(200);
  103 |     await expect(page.locator('button:has-text("Select")').first()).toBeVisible();
  104 | 
  105 |     // 3.2 View Profile Navigation to /vendor/:category/:id
  106 |     const viewProfileBtn = page.locator('button:has-text("View Profile")').first();
  107 |     await viewProfileBtn.click();
  108 |     await expect(page).toHaveURL(/.*\/vendor\/.+\/.+/);
  109 |     await expect(page.locator('h1')).toBeVisible();
  110 | 
  111 |     // Return to planner
  112 |     await page.goBack();
  113 |     await expect(page).toHaveURL(/.*\/planner/);
  114 | 
  115 |     // 3.3 Book Now -> BookingModal -> PaymentModal Flow
  116 |     const bookNowBtn = page.locator('button:has-text("Book Now")').first();
  117 |     await bookNowBtn.click();
  118 | 
  119 |     // Verify BookingModal opened
  120 |     const bookingModal = page.locator('h2:has-text("Reserve")');
  121 |     await expect(bookingModal).toBeVisible();
  122 | 
  123 |     // Proceed to Payment
  124 |     const reserveBtn = page.locator('button[type="submit"]:has-text("Reserve & Proceed to Payment")');
  125 |     await reserveBtn.click();
  126 | 
  127 |     // Verify PaymentModal opened with 30% deposit guarantee
  128 |     const paymentModal = page.locator('h2:has-text("MY DAY Mobile Money Checkout")');
  129 |     await expect(paymentModal).toBeVisible();
  130 | 
  131 |     // Close modal
  132 |     const closeBtn = page.locator('button:has(svg.lucide-x)').last();
  133 |     await closeBtn.click();
  134 |   });
  135 | 
  136 |   test('4. Interactive Checklist and Milestone Progress Tracking', async ({ page }) => {
  137 |     await page.goto('http://localhost:5173/planner');
  138 | 
  139 |     const checklistSection = page.locator('h3:has-text("Wedding Milestones & Tasks")');
  140 |     await expect(checklistSection).toBeVisible();
  141 | 
  142 |     const firstCheckItem = page.locator('div:has-text("Wedding Milestones & Tasks") ~ div > div').first();
  143 |     await firstCheckItem.click();
  144 |     await page.waitForTimeout(200);
  145 | 
  146 |     // Verify progress updated
  147 |     const progressText = await page.locator('div:has-text("completed")').first().textContent();
  148 |     expect(progressText).toMatch(/\d+%/);
  149 |   });
  150 | 
  151 |   test('5. LocalStorage State Persistence and Corrupted JSON Recovery', async ({ page }) => {
  152 |     await page.goto('http://localhost:5173/planner');
  153 | 
  154 |     // Check localStorage key
  155 |     const storageValue = await page.evaluate(() => localStorage.getItem('myday_ai_planner_v1'));
  156 |     expect(storageValue).not.toBeNull();
  157 |     const parsed = JSON.parse(storageValue);
  158 |     expect(parsed.messages).toBeDefined();
  159 | 
  160 |     // Reload page to verify persistence
  161 |     await page.reload();
> 162 |     await expect(page.locator('h3:has-text("Recommended Budget Breakdown")')).toBeVisible();
      |                                                                               ^ Error: expect(locator).toBeVisible() failed
  163 | 
  164 |     // Inject corrupted JSON
  165 |     await page.evaluate(() => localStorage.setItem('myday_ai_planner_v1', '{corrupted_malformed_json'));
  166 |     await page.reload();
  167 | 
  168 |     // Verify application survives without crash and renders fresh state
  169 |     await expect(page.locator('h1:has-text("MY DAY AI Planner")')).toBeVisible();
  170 |   });
  171 | 
  172 |   test('6. Language Switching (English / Kiswahili)', async ({ page }) => {
  173 |     await page.goto('http://localhost:5173/planner');
  174 | 
  175 |     const langSelect = page.locator('header select').last();
  176 |     await langSelect.selectOption('sw');
  177 |     await page.waitForTimeout(300);
  178 | 
  179 |     // Check Kiswahili static labels
  180 |     const resetBtnSw = page.locator('button:has-text("Anzisha Upya Mpangaji")');
  181 |     await expect(resetBtnSw).toBeVisible();
  182 | 
  183 |     // Switch back to English
  184 |     await langSelect.selectOption('en');
  185 |     await page.waitForTimeout(300);
  186 |     const resetBtnEn = page.locator('button:has-text("Reset Planner")');
  187 |     await expect(resetBtnEn).toBeVisible();
  188 |   });
  189 | 
  190 |   test('7. Mobile Viewports (390px and 360px)', async ({ page }) => {
  191 |     for (const width of [390, 360]) {
  192 |       await page.setViewportSize({ width, height: 844 });
  193 |       await page.goto('http://localhost:5173/planner');
  194 | 
  195 |       // Verify no horizontal overflow
  196 |       const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  197 |       expect(hasOverflow).toBe(false);
  198 | 
  199 |       // Verify chat input and send button are visible and operable
  200 |       await expect(page.locator('input[placeholder*="budget"]')).toBeVisible();
  201 |       await expect(page.locator('button[type="submit"]:has-text("Send")')).toBeVisible();
  202 |     }
  203 |   });
  204 | 
  205 | });
  206 | 
```