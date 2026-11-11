const { chromium } = require('@playwright/test');

async function audit() {
  const browser = await chromium.launch({
    executablePath: 'C:/Users/libra051099/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe',
    headless: true
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  await page.goto('http://localhost:5174', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const elements = [
    { name: 'body', selector: 'body' },
    { name: '#root', selector: '#root' },
    { name: '.site-header', selector: '.site-header' },
    { name: '.liquid-glass-master-slab', selector: '.liquid-glass-master-slab' },
    { name: '.hero-search', selector: '.hero-search' },
    { name: '.btn-primary', selector: '.btn-primary' },
    { name: '.glass-card', selector: '.glass-card' },
    { name: '.provider-card', selector: '.provider-card' }
  ];

  console.log('=== COMPUTED STYLES AUDIT ===');
  for (const el of elements) {
    const data = await page.evaluate((sel) => {
      const node = document.querySelector(sel);
      if (!node) return { exists: false };
      const comp = window.getComputedStyle(node);
      return {
        exists: true,
        className: node.className,
        background: comp.background || comp.backgroundColor,
        backgroundColor: comp.backgroundColor,
        backgroundImage: comp.backgroundImage,
        backdropFilter: comp.backdropFilter || comp.webkitBackdropFilter,
        boxShadow: comp.boxShadow,
        border: `${comp.borderWidth} ${comp.borderStyle} ${comp.borderColor}`,
        borderRadius: comp.borderRadius,
        color: comp.color,
        opacity: comp.opacity
      };
    }, el.selector);
    console.log(`\n[${el.name}]:`, JSON.stringify(data, null, 2));
  }

  // Also check if any parent or container has an opaque background
  const opaqueContainers = await page.evaluate(() => {
    const list = [];
    const all = document.querySelectorAll('*');
    for (const node of all) {
      if (node.offsetWidth > 500 && node.offsetHeight > 300) {
        const comp = window.getComputedStyle(node);
        const bg = comp.backgroundColor;
        if (bg && (bg.includes('rgb(255, 255, 255)') || bg === 'rgb(248, 249, 250)' || bg === 'white')) {
          list.push({ tag: node.tagName, class: node.className, id: node.id, bg: bg });
        }
      }
    }
    return list;
  });
  console.log('\n=== OPAQUE CONTAINERS (>500x300 with white/light solid bg) ===');
  console.log(JSON.stringify(opaqueContainers, null, 2));

  await browser.close();
}

audit().catch(console.error);
