const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({
    executablePath: 'C:/Users/libra051099/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe'
  });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  await p.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
  const btn = p.locator('button[aria-label="Toggle menu"], .cl-burger');
  await btn.click();
  await p.waitForTimeout(300);
  await p.screenshot({ path: 'C:/Users/libra051099/.gemini/antigravity/brain/37401341-12df-49f4-9dec-379084ab9fbc/liquid_glass_audit/mobile_drawer_open.png' });
  await b.close();
  console.log('Done drawer snapshot');
})();

