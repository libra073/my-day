# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e_planner.spec.mjs >> MY DAY AI Planner End-to-End Real Browser QA >> 7. Mobile Viewports (390px and 360px)
- Location: e2e_planner.spec.mjs:190:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: false
Received: true
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e6]:
      - generic [ref=e7]: "Tanzania's #1 All-in-One Wedding Platform"
      - generic [ref=e12]:
        - generic [ref=e13]: "Demo Role Switcher:"
        - combobox [ref=e14] [cursor=pointer]:
          - option "💍 Couple (John & Sarah)" [selected]
          - option "🏰 Vendor (Grand Imperial)"
          - option "⚡ MY DAY Admin"
        - generic [ref=e15]: "|"
        - combobox [ref=e16] [cursor=pointer]:
          - option "🇬🇧 English" [selected]
          - option "🇹🇿 Kiswahili"
    - navigation [ref=e17]:
      - link "MY DAY Wedding Marketplace" [ref=e18] [cursor=pointer]:
        - /url: /
        - generic [ref=e22]:
          - text: MY DAY
          - generic [ref=e23]: Wedding Marketplace
      - generic [ref=e24]:
        - link "Home" [ref=e25] [cursor=pointer]:
          - /url: /
        - link "AI Planner" [ref=e26] [cursor=pointer]:
          - /url: /planner
        - link "Browse Services" [ref=e31] [cursor=pointer]:
          - /url: /marketplace
        - link "Wedding Profile" [ref=e32] [cursor=pointer]:
          - /url: /wedding
        - link "Event Dashboard" [ref=e33] [cursor=pointer]:
          - /url: /dashboard
        - link "My Bookings (0)" [ref=e34] [cursor=pointer]:
          - /url: /bookings
        - link "Become a Vendor" [ref=e37] [cursor=pointer]:
          - /url: /become-vendor
        - link "Contact Us" [ref=e38] [cursor=pointer]:
          - /url: /contact
        - generic [ref=e39]:
          - generic [ref=e43]: John & Sarah
          - button "Log Out" [ref=e44] [cursor=pointer]
  - main [ref=e48]:
    - generic [ref=e50]:
      - generic [ref=e51]:
        - generic [ref=e52]:
          - link "Home" [ref=e53] [cursor=pointer]:
            - /url: /
          - heading "MY DAY AI Planner" [level=1] [ref=e61]
        - button "Reset Planner" [ref=e62] [cursor=pointer]
      - generic [ref=e68]:
        - generic [ref=e69]:
          - generic [ref=e70]:
            - generic [ref=e71]: Tanzanian Event Planning Specialist
            - generic [ref=e76]: Live & Ready
          - generic [ref=e79]: Habari! Welcome to MY DAY AI Planner. I can help you plan your wedding or event in Tanzania. Tell me your budget (e.g. 500k, 5m, or TSh 15,000,000), guest count, or location to get a realistic budget plan and verified vendor matches!
          - generic [ref=e86]:
            - button "💡 I'm having a wedding in Dar es Salaam, budget 300k, 50 guests." [ref=e87] [cursor=pointer]
            - button "💡 Budget is 5 million TSh for 250 guests in Arusha. Show best plan." [ref=e88] [cursor=pointer]
            - button "💡 Show me cheaper budget options for decor and entertainment." [ref=e89] [cursor=pointer]
            - button "💡 We have 15m TSh for a luxury wedding in Zanzibar with 150 guests." [ref=e90] [cursor=pointer]
          - generic [ref=e91]:
            - textbox "Type your budget, guest count, or location..." [ref=e92]
            - button "Send" [ref=e93] [cursor=pointer]
        - generic [ref=e97]:
          - generic [ref=e99]:
            - text: Planner Status
            - generic [ref=e100]: Awaiting Budget
          - generic [ref=e101]:
            - generic [ref=e102]:
              - generic [ref=e103]:
                - generic [ref=e104]: Live Preparation Checklist
                - heading "Wedding Milestones & Tasks" [level=3] [ref=e109]
                - paragraph [ref=e110]: Stay organized with essential Tanzanian wedding milestones. Mark items complete as you progress.
              - generic [ref=e111]:
                - generic [ref=e112]: 0 / 8
                - generic [ref=e113]: 0% completed
            - generic [ref=e115]:
              - generic [ref=e116] [cursor=pointer]:
                - generic [ref=e120]: Choose wedding venue (Kumbi)
                - generic [ref=e121]: venue
              - generic [ref=e122] [cursor=pointer]:
                - generic [ref=e126]: Confirm estimated guest count
                - generic [ref=e127]: general
              - generic [ref=e128] [cursor=pointer]:
                - generic [ref=e132]: Select catering service and sample menu
                - generic [ref=e133]: catering
              - generic [ref=e134] [cursor=pointer]:
                - generic [ref=e138]: Select decoration & floral theme (Wapambaji)
                - generic [ref=e139]: decoration
              - generic [ref=e140] [cursor=pointer]:
                - generic [ref=e144]: Hire Master of Ceremonies (MC) & DJ
                - generic [ref=e145]: entertainment
              - generic [ref=e146] [cursor=pointer]:
                - generic [ref=e150]: Book professional wedding photographer & video
                - generic [ref=e151]: photography
              - generic [ref=e152] [cursor=pointer]:
                - generic [ref=e156]: Confirm bridal transport & convoy
                - generic [ref=e157]: transport
              - generic [ref=e158] [cursor=pointer]:
                - generic [ref=e162]: Confirm advance bookings (30% deposit guarantee)
                - generic [ref=e163]: general
          - generic [ref=e164]:
            - generic [ref=e165]:
              - generic [ref=e166]: Preparation Milestones
              - heading "Countdown Preparation Timeline" [level=3] [ref=e171]
              - paragraph [ref=e172]:
                - text: "Event Date:"
                - strong [ref=e173]: 2026-12-25
                - text: (wedding)
            - generic [ref=e174]:
              - generic [ref=e179]:
                - generic [ref=e180]: 6 Months Before • Jun 25, 2026
                - heading "Secure Venue (Kumbi) & Catering" [level=4] [ref=e182]
                - paragraph [ref=e183]: Pay initial 30% deposit to lock your high-demand date.
              - generic [ref=e188]:
                - generic [ref=e189]: 3 Months Before • Sep 25, 2026
                - heading "Confirm MC, Decorator & Photo/Video" [level=4] [ref=e191]
                - paragraph [ref=e192]: Align on event script with your MC and finalize decor concept.
              - generic [ref=e197]:
                - generic [ref=e198]: 1 Month Before • Nov 25, 2026
                - heading "Finalize Guest RSVPs & Bridal Convoy" [level=4] [ref=e200]
                - paragraph [ref=e201]: Lock catering guest count and test transport routes.
              - generic [ref=e206]:
                - generic [ref=e207]: 1 Week Before • Nov 25, 2026
                - heading "Bridal Beauty & Final Rehearsals" [level=4] [ref=e209]
                - paragraph [ref=e210]: Final fittings, henna sessions, and vendor schedule confirmations.
              - generic [ref=e214]:
                - generic [ref=e215]: Event Day • Dec 25, 2026
                - heading "Your Perfect Wedding Day!" [level=4] [ref=e217]
                - paragraph [ref=e218]: Relax and celebrate with your loved ones while MY DAY keeps everything organized.
  - generic [ref=e219]:
    - generic [ref=e220] [cursor=pointer]:
      - generic [ref=e221]: Wedding Budget Tracker
      - button [ref=e225]
    - generic [ref=e228]:
      - generic [ref=e229]:
        - generic [ref=e230]: "Target Budget:"
        - strong [ref=e231]: TSh 15,000,000
      - generic [ref=e232]:
        - generic [ref=e233]: "Committed Services:"
        - strong [ref=e234]: TSh 0
      - link "Open Event Dashboard" [ref=e236] [cursor=pointer]:
        - /url: /dashboard
  - button "✨ Ask MY DAY AI" [ref=e239] [cursor=pointer]
  - contentinfo [ref=e244]:
    - generic [ref=e245]:
      - generic [ref=e246]: © 2026 MY DAY. All Rights Reserved.
      - generic [ref=e247]:
        - link "Privacy Policy" [ref=e248] [cursor=pointer]:
          - /url: /contact
        - link "Terms & Conditions" [ref=e249] [cursor=pointer]:
          - /url: /contact
        - link "Help Center & FAQ" [ref=e250] [cursor=pointer]:
          - /url: /contact
        - link "Contact Us" [ref=e251] [cursor=pointer]:
          - /url: /contact
```

# Test source

```ts
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
  162 |     await expect(page.locator('h3:has-text("Recommended Budget Breakdown")')).toBeVisible();
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
> 197 |       expect(hasOverflow).toBe(false);
      |                           ^ Error: expect(received).toBe(expected) // Object.is equality
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