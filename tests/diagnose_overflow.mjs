import { chromium } from '@playwright/test';

const TARGET_VIEWPORTS = {
  smartphones: [
    { name: 'iPhone SE (320x568)', width: 320, height: 568 },
    { name: 'Android Compact (360x800)', width: 360, height: 800 },
    { name: 'iPhone 13/14 mini (375x812)', width: 375, height: 812 },
    { name: 'iPhone 14/15 (390x844)', width: 390, height: 844 },
    { name: 'iPhone Pro Max (430x932)', width: 430, height: 932 },
  ],
  tablets: [
    { name: 'iPad Portrait (768x1024)', width: 768, height: 1024 },
    { name: 'iPad Air (820x1180)', width: 820, height: 1180 },
    { name: 'iPad Landscape (1024x768)', width: 1024, height: 768 },
  ],
  desktops: [
    { name: 'HD Laptop (1280x720)', width: 1280, height: 720 },
    { name: 'Laptop Standard (1366x768)', width: 1366, height: 768 },
    { name: 'MacBook 15 (1440x900)', width: 1440, height: 900 },
    { name: 'Full HD Desktop (1920x1080)', width: 1920, height: 1080 },
  ],
};

const ROUTES = [
  '/',
  '/marketplace',
  '/vendor/kumbi/1',
  '/wedding',
  '/dashboard',
  '/bookings',
  '/become-vendor',
  '/contact',
  '/planner',
];

async function runDiagnosis() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });

  console.log('=== MY DAY COMPREHENSIVE RESPONSIVE AUDIT ===\n');

  // Let's test 375x812 first across all routes to identify where overflows exist
  console.log('--- Phase 1: Route-by-Route Mobile (375x812) Overflow Check ---');
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });

  for (const route of ROUTES) {
    await page.goto(`http://localhost:5173${route}`, { waitUntil: 'networkidle' });
    const overflowReport = await page.evaluate(() => {
      const docW = document.documentElement.scrollWidth;
      const winW = window.innerWidth;
      const hasOverflow = docW > winW;
      const overflowingElements = [];

      if (hasOverflow) {
        const allElements = document.querySelectorAll('*');
        allElements.forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.right > winW + 1) {
            overflowingElements.push({
              tag: el.tagName.toLowerCase(),
              className: el.className || '',
              id: el.id || '',
              rectRight: Math.round(rect.right),
              rectWidth: Math.round(rect.width),
              textSnippet: (el.innerText || '').slice(0, 40).replace(/\n/g, ' '),
            });
          }
        });
      }

      return {
        docW,
        winW,
        hasOverflow,
        delta: docW - winW,
        sampleOverflows: overflowingElements.slice(0, 5)
      };
    });

    if (overflowReport.hasOverflow) {
      console.log(`❌ [OVERFLOW] ${route}: scrollWidth=${overflowReport.docW}px (exceeds ${overflowReport.winW}px by ${overflowReport.delta}px)`);
      overflowReport.sampleOverflows.forEach(o => {
        console.log(`    -> <${o.tag} class="${o.className}" id="${o.id}"> right=${o.rectRight}px, width=${o.rectWidth}px ("${o.textSnippet}")`);
      });
    } else {
      console.log(`✅ [CLEAN] ${route}: scrollWidth=${overflowReport.docW}px`);
    }
  }

  // Let's also test the smallest requested mobile size: 320x568
  console.log('\n--- Phase 2: Route-by-Route Ultra-Compact Mobile (320x568) Check ---');
  await page.setViewportSize({ width: 320, height: 568 });
  for (const route of ['/', '/marketplace', '/dashboard', '/contact', '/become-vendor']) {
    await page.goto(`http://localhost:5173${route}`, { waitUntil: 'networkidle' });
    const report = await page.evaluate(() => {
      const docW = document.documentElement.scrollWidth;
      const winW = window.innerWidth;
      return { docW, winW, hasOverflow: docW > winW, delta: docW - winW };
    });
    console.log(`${report.hasOverflow ? '❌' : '✅'} 320px ${route}: scrollWidth=${report.docW}px (${report.hasOverflow ? `+${report.delta}px overflow` : 'clean'})`);
  }

  await browser.close();
}

runDiagnosis().catch(err => {
  console.error(err);
  process.exit(1);
});
