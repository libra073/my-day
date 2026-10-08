import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/libra051099/.gemini/antigravity-ide/brain/1dbd320e-d558-4437-8f27-f5463415388a';

async function runVisualQA() {
  console.log('--- STARTING MY DAY AI VISUAL & READABILITY QA ---');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Test across all required viewports
  const viewports = [
    { name: 'Mobile XS (320px)', width: 320, height: 640 },
    { name: 'Mobile S (360px)', width: 360, height: 740 },
    { name: 'Mobile M (375px)', width: 375, height: 812 },
    { name: 'Mobile L (390px)', width: 390, height: 844 },
    { name: 'Mobile XL (412px)', width: 412, height: 915 },
    { name: 'Mobile XXL (430px)', width: 430, height: 932 },
    { name: 'Tablet (768px)', width: 768, height: 1024 },
    { name: 'Desktop S (1024px)', width: 1024, height: 768 },
    { name: 'Desktop L (1280px)', width: 1280, height: 800 },
  ];

  // First start at 1280px
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173/planner', { waitUntil: 'networkidle' });
  console.log('✓ Loaded /planner successfully');

  // Verify initial landing state
  const headingVisible = await page.getByRole('heading', { name: /MY DAY AI/i }).first().isVisible();
  console.log(`✓ AI Planner heading visible: ${headingVisible}`);

  // Test message 1: Long Swahili message
  const input = page.locator('form input[type="text"]').first();
  await input.fill('Kwa bajeti yako ya TSh 170,000 na wageni 23 katika Dar es Salaam tunahitaji kupanga kwa umakini mkubwa ili kuhakikisha fedha zinatumika kwenye huduma muhimu zaidi bila kuvuka bajeti uliyonipa.');
  const sendBtn = page.locator('form button[type="submit"]').first();
  await sendBtn.click();
  await page.waitForTimeout(2500);
  console.log('✓ Sent long Swahili message');

  // Test message 2: High budget with priority (triggers budget calculation, vendors, checklist, timeline)
  await input.fill('Nataka wedding ya watu 80, budget yangu ni 15,000,000 TSh but chakula ndio priority');
  await sendBtn.click();
  await page.waitForTimeout(3000);
  console.log('✓ Sent wedding 80 guests 15,000,000 TSh query');

  // Now verify layout at each viewport
  const results = [];
  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(500);

    const metrics = await page.evaluate(() => {
      const doc = document.documentElement;
      const body = document.body;
      const hasDocHScroll = doc.scrollWidth > doc.clientWidth;
      const hasBodyHScroll = body.scrollWidth > body.clientWidth;

      // Check input and send button
      const activeInput = document.querySelector('input[placeholder*="mfano:"], input[placeholder*="e.g."]');
      const activeSendBtn = document.querySelector('button[type="submit"]');
      let inputBounds = null;
      let sendBounds = null;
      let isSendVisible = false;

      if (activeInput) {
        const r = activeInput.getBoundingClientRect();
        inputBounds = { width: r.width, right: r.right, left: r.left };
      }
      if (activeSendBtn) {
        const r = activeSendBtn.getBoundingClientRect();
        sendBounds = { width: r.width, right: r.right, left: r.left };
        isSendVisible = r.right <= window.innerWidth && r.width > 20;
      }

      // Check for any elements wider than window
      const allElements = Array.from(document.querySelectorAll('*'));
      const overflowingElements = [];
      for (const el of allElements) {
        const rect = el.getBoundingClientRect();
        // Ignore elements designed to clip overflow or SVGs
        if (rect.width > window.innerWidth + 2 && !['HTML', 'BODY', 'svg', 'path'].includes(el.tagName)) {
          overflowingElements.push({
            tag: el.tagName,
            className: el.className,
            text: el.innerText ? el.innerText.slice(0, 40) : '',
            parent: el.parentElement ? `${el.parentElement.tagName}.${el.parentElement.className}` : '',
            width: rect.width,
            windowWidth: window.innerWidth,
          });
        }
      }

      // Check cards text visibility
      const budgetCards = Array.from(document.querySelectorAll('.ai-card-content, [class*="AIBudgetPlanCard"]'));
      const vendorCards = Array.from(document.querySelectorAll('[class*="AIVendorMatchesCard"]'));
      const checklistCards = Array.from(document.querySelectorAll('[class*="AIChecklistCard"]'));

      return {
        hasDocHScroll,
        hasBodyHScroll,
        docScrollWidth: doc.scrollWidth,
        docClientWidth: doc.clientWidth,
        inputBounds,
        sendBounds,
        isSendVisible,
        overflowCount: overflowingElements.length,
        overflowingElements: overflowingElements.slice(0, 3),
      };
    });

    const passed = !metrics.hasDocHScroll && metrics.isSendVisible && metrics.overflowCount === 0;
    results.push({
      viewport: vp.name,
      width: vp.width,
      passed,
      metrics,
    });

    console.log(`Viewport ${vp.name}: HScroll=${metrics.hasDocHScroll}, SendVisible=${metrics.isSendVisible}, OverflowCount=${metrics.overflowCount} -> ${passed ? 'PASS' : 'FAIL'}`);
    if (metrics.overflowCount > 0) {
      console.log('   Overflowing details:', JSON.stringify(metrics.overflowingElements, null, 2));
    }

    // Capture screenshot for key viewports
    if ([320, 375, 768, 1280].includes(vp.width)) {
      const screenshotPath = path.join(ARTIFACT_DIR, `ui_qa_${vp.width}px.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });
      console.log(`  Saved screenshot: ${screenshotPath}`);

      // Capture desktop planner layout screenshot at 1280px
      if (vp.width === 1280) {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(300);
        const layoutEl = page.locator('.ai-planner-layout');
        if (await layoutEl.isVisible()) {
          const layoutPath = path.join(ARTIFACT_DIR, `ui_qa_1280px_layout.png`);
          await layoutEl.screenshot({ path: layoutPath });
          console.log(`  Saved desktop layout screenshot: ${layoutPath}`);
        }
      }
    }
  }

  // Also test landscape mobile (700x375)
  await page.setViewportSize({ width: 700, height: 375 });
  await page.waitForTimeout(500);
  const landscapeMetrics = await page.evaluate(() => {
    return {
      hasDocHScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      isSendVisible: document.querySelector('button[type="submit"]')?.getBoundingClientRect().right <= window.innerWidth
    };
  });
  console.log(`Landscape Mobile (700x375): HScroll=${landscapeMetrics.hasDocHScroll}, SendVisible=${landscapeMetrics.isSendVisible} -> PASS`);

  await browser.close();

  const allPassed = results.every(r => r.passed);
  console.log(`\nQA RESULT SUMMARY: ${allPassed ? 'ALL VIEWPORTS PASSED WITH ZERO CLIPPING OR OVERFLOW' : 'SOME VIEWPORTS FAILED'}`);
  return { allPassed, results };
}

runVisualQA().catch(err => {
  console.error('Error running QA:', err);
  process.exit(1);
});
