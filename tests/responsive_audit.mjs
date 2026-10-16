import { chromium } from '@playwright/test';

async function testAudit() {
  console.log('Testing Playwright Chromium launch using system Chrome...');
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  } catch (e) {
    console.log('Chrome channel failed, trying msedge...');
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  }
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await page.goto('http://localhost:5173/');
  const title = await page.title();
  const overflow = await page.evaluate(() => {
    return {
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      hasOverflow: document.documentElement.scrollWidth > window.innerWidth
    };
  });
  console.log('Page Title:', title);
  console.log('375px Viewport Audit:', overflow);
  await browser.close();
}

testAudit().catch(err => {
  console.error('Audit Error:', err);
  process.exit(1);
});
