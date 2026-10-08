# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e_planner.spec.mjs >> MY DAY AI Planner End-to-End Real Browser QA >> 2. Real Conversational Planning and Natural Tanzanian Expressions
- Location: e2e_planner.spec.mjs:29:3

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected substring: "2,000,000"
Received string:    "Calculated AI Budget PlanRecommended Budget BreakdownTotal Event Budget: TSh 1,500,000 • 50 guestsBudgetBalancedPremiumThis allocation is balanced and realistically supports all essential categories.Venue (Kumbi)30% of total budgetTSh 450,000Catering (Food & Drinks)35% of total budgetTSh 525,000Decoration (Wapambaji)6% of total budgetTSh 90,000MC & Entertainment4% of total budgetTSh 60,000Photo & Video7% of total budgetTSh 105,000Bridal Transport5% of total budgetTSh 75,000Contingency & Misc5% of total budgetTSh 75,000Total Allocated: TSh 1,380,000Surplus Reserve: TSh 120,000"
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
          - generic [ref=e79]:
            - generic [ref=e80]: Planner reset successfully. How can I help you plan your next event in Tanzania? What is your target budget?
            - generic [ref=e86]: I want to plan an event.
            - generic [ref=e92]: Hello! I'm your MY DAY AI Wedding & Event Planner. I can craft a realistic budget allocation and match real verified Tanzanian vendors for you. To get started, what is your estimated budget (e.g. 500k, 5m, or TSh 15,000,000), guest count, and city?
            - generic [ref=e98]: I’m gonna have a wedding, my budget is TSh 300,000, I have 50 guests. Give me the best plan.
            - generic [ref=e109]:
              - text: With TSh 300,000 for 50 guests, a full traditional wedding with luxury venue, full catering, decoration, transport and entertainment would be very tight or unrealistic (averaging ~TSh 2,100/guest for catering alone). Instead, I've created a practical provisional plan focusing on essentials. What location in Tanzania are you planning for?
              - generic [ref=e110]:
                - button "Budget Plan" [ref=e111] [cursor=pointer]
                - button "Balanced Plan" [ref=e112] [cursor=pointer]
                - button "Premium Plan" [ref=e113] [cursor=pointer]
            - generic [ref=e114]: Nina harusi, bajeti yangu ni laki 5, nina wageni 80. Nisaidie kupanga.
            - generic [ref=e125]:
              - text: Ukiwa na bajeti ya TSh 500,000 kwa wageni 50, harusi kamili ya kitamaduni yenye ukumbi wa kifahari, mapambo, na chakula kikubwa itakuwa ngumu sana kiuhalisia (inaangukia wastani wa TSh 3,500/mgeni kwa chakula pekee). Nimekuandalia mpango wa kiuhalisia (micro-wedding/sherehe ndogo) uliolengwa kuokoa gharama. Je, unapenda tufanye Dar es Salaam au mkoa gani mwingine?
              - generic [ref=e126]:
                - button "Bajeti Nafuu" [ref=e127] [cursor=pointer]
                - button "Mpango Wastani" [ref=e128] [cursor=pointer]
                - button "Mpango wa Kifahari" [ref=e129] [cursor=pointer]
            - generic [ref=e130]: Budget yangu ni 1.5m
            - generic [ref=e141]:
              - text: Hongera! Hapa kuna mpango kamili wa budget kwa ajili ya wedding yako yenye bajeti ya TSh 1,500,000 (50 wageni huko Dar es Salaam). Nimekuwekea mgawanyo sahihi wa bajeti na watoa huduma halisi waliothibitishwa kutoka sokoni.
              - generic [ref=e142]:
                - button "Bajeti Nafuu" [ref=e143] [cursor=pointer]
                - button "Mpango Wastani" [ref=e144] [cursor=pointer]
                - button "Mpango wa Kifahari" [ref=e145] [cursor=pointer]
            - generic [ref=e146]: 2 million
            - generic [ref=e157]:
              - text: Hongera! Hapa kuna mpango kamili wa budget kwa ajili ya wedding yako yenye bajeti ya TSh 1,500,000 (50 wageni huko Dar es Salaam). Nimekuwekea mgawanyo sahihi wa bajeti na watoa huduma halisi waliothibitishwa kutoka sokoni.
              - generic [ref=e158]:
                - button "Bajeti Nafuu" [ref=e159] [cursor=pointer]
                - button "Mpango Wastani" [ref=e160] [cursor=pointer]
                - button "Mpango wa Kifahari" [ref=e161] [cursor=pointer]
          - generic [ref=e162]:
            - button "💡 I'm having a wedding in Dar es Salaam, budget 300k, 50 guests." [ref=e163] [cursor=pointer]
            - button "💡 Budget is 5 million TSh for 250 guests in Arusha. Show best plan." [ref=e164] [cursor=pointer]
            - button "💡 Show me cheaper budget options for decor and entertainment." [ref=e165] [cursor=pointer]
            - button "💡 We have 15m TSh for a luxury wedding in Zanzibar with 150 guests." [ref=e166] [cursor=pointer]
          - generic [ref=e167]:
            - textbox "Type your budget, guest count, or location..." [ref=e168]
            - button "Send" [active] [ref=e169] [cursor=pointer]
        - generic [ref=e174]:
          - generic [ref=e175]:
            - generic [ref=e176]:
              - text: Planner Status
              - generic [ref=e177]: Plan Active
            - generic [ref=e178]:
              - button "Budget" [ref=e179] [cursor=pointer]
              - button "Vendors" [ref=e180] [cursor=pointer]
          - generic [ref=e181]:
            - generic [ref=e182]:
              - generic [ref=e183]:
                - generic [ref=e184]: Calculated AI Budget Plan
                - heading "Recommended Budget Breakdown" [level=3] [ref=e189]
                - paragraph [ref=e190]:
                  - text: "Total Event Budget:"
                  - strong [ref=e191]: TSh 1,500,000
                  - text: • 50 guests
              - generic [ref=e192]:
                - button "Budget" [ref=e193] [cursor=pointer]
                - button "Balanced" [ref=e194] [cursor=pointer]
                - button "Premium" [ref=e195] [cursor=pointer]
            - generic [ref=e196]: This allocation is balanced and realistically supports all essential categories.
            - generic [ref=e201]:
              - generic [ref=e202]:
                - generic [ref=e203]:
                  - generic [ref=e204]: Venue (Kumbi)
                  - generic [ref=e205]: 30% of total budget
                - generic [ref=e206]: TSh 450,000
              - generic [ref=e208]:
                - generic [ref=e209]:
                  - generic [ref=e210]: Catering (Food & Drinks)
                  - generic [ref=e211]: 35% of total budget
                - generic [ref=e212]: TSh 525,000
              - generic [ref=e214]:
                - generic [ref=e215]:
                  - generic [ref=e216]: Decoration (Wapambaji)
                  - generic [ref=e217]: 6% of total budget
                - generic [ref=e218]: TSh 90,000
              - generic [ref=e220]:
                - generic [ref=e221]:
                  - generic [ref=e222]: MC & Entertainment
                  - generic [ref=e223]: 4% of total budget
                - generic [ref=e224]: TSh 60,000
              - generic [ref=e226]:
                - generic [ref=e227]:
                  - generic [ref=e228]: Photo & Video
                  - generic [ref=e229]: 7% of total budget
                - generic [ref=e230]: TSh 105,000
              - generic [ref=e232]:
                - generic [ref=e233]:
                  - generic [ref=e234]: Bridal Transport
                  - generic [ref=e235]: 5% of total budget
                - generic [ref=e236]: TSh 75,000
              - generic [ref=e238]:
                - generic [ref=e239]:
                  - generic [ref=e240]: Contingency & Misc
                  - generic [ref=e241]: 5% of total budget
                - generic [ref=e242]: TSh 75,000
            - generic [ref=e244]:
              - generic [ref=e248]:
                - text: "Total Allocated:"
                - strong [ref=e249]: TSh 1,380,000
              - generic [ref=e250]: "Surplus Reserve: TSh 120,000"
          - generic [ref=e251]:
            - generic [ref=e252]:
              - generic [ref=e253]: Verified Vendor Matches
              - heading "Matched Service Providers" [level=3] [ref=e258]
              - paragraph [ref=e259]: Real providers matching your category allocations and location from the MY DAY marketplace.
            - generic [ref=e260]:
              - generic [ref=e261]:
                - generic [ref=e263]:
                  - generic [ref=e264]: kumbi
                  - generic [ref=e265]: "Allocated: TSh 450,000"
                - generic [ref=e266]: No kumbi providers were found within your budget and location.
              - generic [ref=e267]:
                - generic [ref=e269]:
                  - generic [ref=e270]: catering
                  - generic [ref=e271]: "Allocated: TSh 525,000"
                - generic [ref=e272]: No catering providers were found within your budget and location.
              - generic [ref=e273]:
                - generic [ref=e275]:
                  - generic [ref=e276]: photography
                  - generic [ref=e277]: "Allocated: TSh 105,000"
                - generic [ref=e278]: No photography providers were found within your budget and location.
              - generic [ref=e279]:
                - generic [ref=e281]:
                  - generic [ref=e282]: entertainment
                  - generic [ref=e283]: "Allocated: TSh 60,000"
                - generic [ref=e284]: No entertainment providers were found within your budget and location.
              - generic [ref=e285]:
                - generic [ref=e287]:
                  - generic [ref=e288]: transport
                  - generic [ref=e289]: "Allocated: TSh 75,000"
                - generic [ref=e290]: No transport providers were found within your budget and location.
          - generic [ref=e291]:
            - generic [ref=e292]:
              - generic [ref=e293]:
                - generic [ref=e294]: Live Preparation Checklist
                - heading "Wedding Milestones & Tasks" [level=3] [ref=e299]
                - paragraph [ref=e300]: Stay organized with essential Tanzanian wedding milestones. Mark items complete as you progress.
              - generic [ref=e301]:
                - generic [ref=e302]: 0 / 8
                - generic [ref=e303]: 0% completed
            - generic [ref=e305]:
              - generic [ref=e306] [cursor=pointer]:
                - generic [ref=e310]: Choose wedding venue (Kumbi)
                - generic [ref=e311]: venue
              - generic [ref=e312] [cursor=pointer]:
                - generic [ref=e316]: Confirm estimated guest count
                - generic [ref=e317]: general
              - generic [ref=e318] [cursor=pointer]:
                - generic [ref=e322]: Select catering service and sample menu
                - generic [ref=e323]: catering
              - generic [ref=e324] [cursor=pointer]:
                - generic [ref=e328]: Select decoration & floral theme (Wapambaji)
                - generic [ref=e329]: decoration
              - generic [ref=e330] [cursor=pointer]:
                - generic [ref=e334]: Hire Master of Ceremonies (MC) & DJ
                - generic [ref=e335]: entertainment
              - generic [ref=e336] [cursor=pointer]:
                - generic [ref=e340]: Book professional wedding photographer & video
                - generic [ref=e341]: photography
              - generic [ref=e342] [cursor=pointer]:
                - generic [ref=e346]: Confirm bridal transport & convoy
                - generic [ref=e347]: transport
              - generic [ref=e348] [cursor=pointer]:
                - generic [ref=e352]: Confirm advance bookings (30% deposit guarantee)
                - generic [ref=e353]: general
          - generic [ref=e354]:
            - generic [ref=e355]:
              - generic [ref=e356]: Preparation Milestones
              - heading "Countdown Preparation Timeline" [level=3] [ref=e361]
              - paragraph [ref=e362]:
                - text: "Event Date:"
                - strong [ref=e363]: 2026-12-25
                - text: (wedding)
            - generic [ref=e364]:
              - generic [ref=e369]:
                - generic [ref=e370]: 6 Months Before • Jun 25, 2026
                - heading "Secure Venue (Kumbi) & Catering" [level=4] [ref=e372]
                - paragraph [ref=e373]: Pay initial 30% deposit to lock your high-demand date.
              - generic [ref=e378]:
                - generic [ref=e379]: 3 Months Before • Sep 25, 2026
                - heading "Confirm MC, Decorator & Photo/Video" [level=4] [ref=e381]
                - paragraph [ref=e382]: Align on event script with your MC and finalize decor concept.
              - generic [ref=e387]:
                - generic [ref=e388]: 1 Month Before • Nov 25, 2026
                - heading "Finalize Guest RSVPs & Bridal Convoy" [level=4] [ref=e390]
                - paragraph [ref=e391]: Lock catering guest count and test transport routes.
              - generic [ref=e396]:
                - generic [ref=e397]: 1 Week Before • Nov 25, 2026
                - heading "Bridal Beauty & Final Rehearsals" [level=4] [ref=e399]
                - paragraph [ref=e400]: Final fittings, henna sessions, and vendor schedule confirmations.
              - generic [ref=e404]:
                - generic [ref=e405]: Event Day • Dec 25, 2026
                - heading "Your Perfect Wedding Day!" [level=4] [ref=e407]
                - paragraph [ref=e408]: Relax and celebrate with your loved ones while MY DAY keeps everything organized.
  - generic [ref=e409]:
    - generic [ref=e410] [cursor=pointer]:
      - generic [ref=e411]: Wedding Budget Tracker
      - button [ref=e415]
    - generic [ref=e418]:
      - generic [ref=e419]:
        - generic [ref=e420]: "Target Budget:"
        - strong [ref=e421]: TSh 15,000,000
      - generic [ref=e422]:
        - generic [ref=e423]: "Committed Services:"
        - strong [ref=e424]: TSh 0
      - link "Open Event Dashboard" [ref=e426] [cursor=pointer]:
        - /url: /dashboard
  - button "✨ Ask MY DAY AI" [ref=e429] [cursor=pointer]
  - contentinfo [ref=e434]:
    - generic [ref=e435]:
      - generic [ref=e436]: © 2026 MY DAY. All Rights Reserved.
      - generic [ref=e437]:
        - link "Privacy Policy" [ref=e438] [cursor=pointer]:
          - /url: /contact
        - link "Terms & Conditions" [ref=e439] [cursor=pointer]:
          - /url: /contact
        - link "Help Center & FAQ" [ref=e440] [cursor=pointer]:
          - /url: /contact
        - link "Contact Us" [ref=e441] [cursor=pointer]:
          - /url: /contact
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('MY DAY AI Planner End-to-End Real Browser QA', () => {
  4   | 
  5   |   test('1. Home Page Entry Points and Navigation to /planner', async ({ page }) => {
  6   |     await page.goto('http://localhost:5173/');
  7   | 
  8   |     // 1.1 ModernHero CTA
  9   |     const heroBtn = page.locator('button:has-text("Ask MY DAY AI")').first();
  10  |     await expect(heroBtn).toBeVisible();
  11  |     await heroBtn.click();
  12  |     await expect(page).toHaveURL(/.*\/planner/);
  13  | 
  14  |     // 1.2 Navbar Link
  15  |     await page.goto('http://localhost:5173/');
  16  |     const navLink = page.locator('nav a:has-text("AI Planner")');
  17  |     await expect(navLink).toBeVisible();
  18  |     await navLink.click();
  19  |     await expect(page).toHaveURL(/.*\/planner/);
  20  | 
  21  |     // 1.3 Floating Button
  22  |     await page.goto('http://localhost:5173/');
  23  |     const floatBtn = page.locator('button:has-text("Ask MY DAY AI")').last();
  24  |     await expect(floatBtn).toBeVisible();
  25  |     await floatBtn.click();
  26  |     await expect(page).toHaveURL(/.*\/planner/);
  27  |   });
  28  | 
  29  |   test('2. Real Conversational Planning and Natural Tanzanian Expressions', async ({ page }) => {
  30  |     await page.goto('http://localhost:5173/planner');
  31  | 
  32  |     // Reset planner first
  33  |     await page.locator('button:has-text("Reset Planner")').click();
  34  |     await page.waitForTimeout(300);
  35  | 
  36  |     const input = page.locator('input[placeholder*="budget"]');
  37  |     const sendBtn = page.locator('button[type="submit"]:has-text("Send")');
  38  | 
  39  |     // 2.1 Vague prompt - missing information guidance
  40  |     await input.fill('I want to plan an event.');
  41  |     await sendBtn.click();
  42  |     await page.waitForTimeout(600);
  43  |     const firstReply = await page.locator('div[style*="overflow-y: auto"]').textContent();
  44  |     expect(firstReply).toContain('MY DAY AI');
  45  | 
  46  |     // 2.2 300k budget prompt with 50 guests
  47  |     await input.fill('I’m gonna have a wedding, my budget is TSh 300,000, I have 50 guests. Give me the best plan.');
  48  |     await sendBtn.click();
  49  |     await page.waitForTimeout(600);
  50  | 
  51  |     const chatContent = await page.locator('div[style*="overflow-y: auto"]').textContent();
  52  |     expect(chatContent).toContain('300,000');
  53  |     // Realistic feasibility warning
  54  |     expect(chatContent.toLowerCase()).toMatch(/tight|unrealistic|provisional|difficult/);
  55  | 
  56  |     // Budget card visibility and breakdown
  57  |     const budgetCard = page.locator('h3:has-text("Recommended Budget Breakdown")');
  58  |     await expect(budgetCard).toBeVisible();
  59  | 
  60  |     // 2.3 Kiswahili prompt (laki 5, 80 wageni)
  61  |     await input.fill('Nina harusi, bajeti yangu ni laki 5, nina wageni 80. Nisaidie kupanga.');
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
> 82  |     expect(budgetCardText2).toContain('2,000,000');
      |                             ^ Error: expect(received).toContain(expected) // indexOf
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
```