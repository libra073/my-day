const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:5174';
const ARTIFACT_DIR = 'C:/Users/libra051099/.gemini/antigravity/brain/37401341-12df-49f4-9dec-379084ab9fbc/qa_responsive';

if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

const VIEWPORTS = [
  // Phone Mode
  { width: 320, height: 640, group: 'phone', dpr: 2 },
  { width: 360, height: 740, group: 'phone', dpr: 2 },
  { width: 375, height: 812, group: 'phone', dpr: 3 },
  { width: 390, height: 844, group: 'phone', dpr: 3 },
  { width: 430, height: 932, group: 'phone', dpr: 3 },
  // Tablet Mode
  { width: 600, height: 960, group: 'tablet', dpr: 2 },
  { width: 768, height: 1024, group: 'tablet', dpr: 2 },
  { width: 820, height: 1180, group: 'tablet', dpr: 2 },
  { width: 1024, height: 768, group: 'tablet', dpr: 2 },
  // Laptop Mode
  { width: 1280, height: 800, group: 'laptop', dpr: 1 },
  { width: 1366, height: 768, group: 'laptop', dpr: 1 },
  { width: 1440, height: 900, group: 'laptop', dpr: 2 },
  // Desktop Mode
  { width: 1600, height: 900, group: 'desktop', dpr: 1 },
  { width: 1920, height: 1080, group: 'desktop', dpr: 1 },
  { width: 2560, height: 1440, group: 'desktop', dpr: 2 },
];

const ROUTES = [
  { name: 'home', path: '/', role: 'customer' },
  { name: 'marketplace', path: '/marketplace', role: 'customer' },
  { name: 'vendor_detail', path: '/vendor/kumbi/venue-1', role: 'customer' },
  { name: 'planner', path: '/planner', role: 'customer' },
  { name: 'wedding', path: '/wedding', role: 'customer' },
  { name: 'bookings', path: '/bookings', role: 'customer' },
  { name: 'become_vendor', path: '/become-vendor', role: 'customer' },
  { name: 'contact', path: '/contact', role: 'customer' },
  { name: 'login', path: '/login', role: 'customer' },
  { name: 'register', path: '/register', role: 'customer' },
  { name: 'forgot_password', path: '/forgot-password', role: 'customer' },
  { name: 'dashboard', path: '/dashboard', role: 'customer' },
  { name: 'provider', path: '/provider', role: 'provider' },
  { name: 'admin', path: '/admin', role: 'admin' },
];

function setRoleSeed(role, theme) {
  return {
    role,
    theme,
    user:
      role === 'admin'
        ? { id: 'admin-1', name: 'Platform Admin', email: 'admin@myday.co.tz', role: 'admin' }
        : role === 'provider'
        ? { id: 'prov-1', name: 'Mlimani City Hall', email: 'vendor@myday.co.tz', role: 'provider', providerId: 'venue-1' }
        : { id: 'cust-1', name: 'Amina & Juma', email: 'amina@myday.co.tz', role: 'customer', weddingId: 'wed-1' },
  };
}

async function auditDarkInteractionStates(page, cdp, routeName, width) {
  const issues = [];
  await cdp.send('DOM.enable');
  await cdp.send('CSS.enable');
  const doc = await cdp.send('DOM.getDocument', { depth: -1 });

  // Query interactive elements
  const { nodeIds } = await cdp.send('DOM.querySelectorAll', {
    nodeId: doc.root.nodeId,
    selector: 'button, a, input, select, textarea, [role="button"], .cl-link, .cl-icon-btn, .cl-burger, .cl-category-card, .mkt-cat-btn, .cal-day, .hero-cal-day, .hero-quick-chip, .hero-cat-item, .hero-region-item, .hero-field, .clay-input-pill, .home-contact-card, .card',
  });

  // Force hover + focus + active via CDP on each visible node and check computed background/color inside page
  for (const nodeId of nodeIds.slice(0, 60)) {
    try {
      for (const state of [['hover'], ['active'], ['focus', 'focus-visible']]) {
        await cdp.send('CSS.forcePseudoState', {
          nodeId,
          forcedPseudoClasses: state,
        });
      }
      // Check in page if this node flashed white
      const resolved = await cdp.send('DOM.resolveNode', { nodeId });
      if (resolved && resolved.object && resolved.object.objectId) {
        const res = await cdp.send('Runtime.callFunctionOn', {
          objectId: resolved.object.objectId,
          returnByValue: true,
          functionDeclaration: `function() {
            const el = this;
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) return null;
            const cs = window.getComputedStyle(el);
            if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) return null;
            const parse = (str) => {
              const m = (str || '').match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)(?:,\\s*([\\d.]+))?\\)/);
              if (!m) return null;
              return { r: +m[1], g: +m[2], b: +m[3], a: m[4] !== undefined ? +m[4] : 1 };
            };
            const lum = (c) => c ? 0.299 * c.r + 0.587 * c.g + 0.114 * c.b : 0;
            const bg = parse(cs.backgroundColor);
            const fg = parse(cs.color);
            const bgImg = cs.backgroundImage || '';
            const bgLum = (bg && bg.a > 0.25) ? lum(bg) : 0;
            const fgLum = fg ? lum(fg) : 255;
            // Check if background became bright white/pastel (> 195 luminance) without gradient
            if (bgLum > 195 && !bgImg.includes('gradient')) {
              return {
                cls: (el.className && typeof el.className === 'string') ? el.className.slice(0, 70) : el.tagName,
                text: (el.innerText || '').trim().slice(0, 30),
                bg: cs.backgroundColor,
                fg: cs.color,
                bgLum: Math.round(bgLum),
                fgLum: Math.round(fgLum),
              };
            }
            return null;
          }`,
        });
        if (res?.result?.value) {
          issues.push(res.result.value);
        }
      }
      await cdp.send('CSS.forcePseudoState', {
        nodeId,
        forcedPseudoClasses: [],
      });
    } catch (_) {
      // Ignore detached nodes
    }
  }
  return issues;
}

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:/Users/libra051099/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe',
    headless: true,
  });

  const layoutDefects = [];
  const darkFlashDefects = [];
  let totalChecks = 0;

  // 1. Test all 15 widths across key routes in both Light and Dark Mode, and all 14 routes across representative Phone (320, 375, 430), Tablet (768, 1024), Laptop (1366), Desktop (1920, 2560)
  for (const route of ROUTES) {
    for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({
        viewport: { width: 1366, height: 768 },
        deviceScaleFactor: 2,
      });
      const seed = setRoleSeed(route.role, theme);
      await context.addInitScript((s) => {
        localStorage.setItem('myday_theme', s.theme);
        localStorage.setItem('theme', s.theme);
        localStorage.setItem('myday_role', s.role);
        localStorage.setItem('myday_user', JSON.stringify(s.user));
        localStorage.setItem('myday_token', 'qa-mock-token');
        localStorage.setItem('myday_bookings', JSON.stringify([
          {
            id: 'BK-QA-1',
            providerId: 'venue-1',
            category: 'kumbi',
            date: '2027-08-14',
            price: 4500000,
            deposit: 1350000,
            paidAmount: 1350000,
            status: 'confirmed'
          }
        ]));
        localStorage.setItem('myday_wedding', JSON.stringify({
          id: 'wed-1',
          title: 'Amina & Juma Royal Wedding',
          bride: 'Amina',
          groom: 'Juma',
          date: '2027-08-14',
          location: 'Dar es Salaam',
          guests: 350,
          budget: 25000000
        }));
        document.documentElement.setAttribute('data-theme', s.theme);
      }, seed);

      const page = await context.newPage();
      await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle', timeout: 25000 });
      await page.evaluate((t) => {
        document.documentElement.setAttribute('data-theme', t);
      }, theme);
      await page.waitForTimeout(200);

      for (const vp of VIEWPORTS) {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.waitForTimeout(80);
        totalChecks++;

        // Responsive check at this viewport
        const check = await page.evaluate((vw) => {
          const docOverflow = document.documentElement.scrollWidth - window.innerWidth;
          const bodyOverflow = document.body.scrollWidth - window.innerWidth;
          const overflowingEls = [];

          // Check major cards/containers for horizontal overflow beyond viewport
          const selectors = '.cl-header, .hero-search, .cl-category-card, .provider-card-compact, .vreg-card, .wprof-card, .home-contact-box, .contact-info-card, .contact-form-card, .clay-phone-card, .vd-card, .utask-bars-card, .utask-profile-card';
          document.querySelectorAll(selectors).forEach((el) => {
            const r = el.getBoundingClientRect();
            if (r.width > 0 && r.height > 0) {
              if (r.right > vw + 4 || r.left < -4) {
                overflowingEls.push({
                  cls: (el.className || '').toString().slice(0, 50),
                  left: Math.round(r.left),
                  right: Math.round(r.right),
                  width: Math.round(r.width),
                });
              }
            }
          });

          // Check header items overlap
          let headerOverlap = false;
          const header = document.querySelector('.cl-header');
          if (header) {
            const brand = header.querySelector('.cl-brand');
            const actions = header.querySelector('.cl-actions');
            if (brand && actions) {
              const br = brand.getBoundingClientRect();
              const ar = actions.getBoundingClientRect();
              if (br.right > ar.left + 2) {
                headerOverlap = { brandRight: Math.round(br.right), actionsLeft: Math.round(ar.left) };
              }
            }
          }

          return {
            docOverflow,
            bodyOverflow,
            overflowingEls,
            headerOverlap,
          };
        }, vp.width);

        if (check.docOverflow > 2 || check.bodyOverflow > 2 || check.overflowingEls.length > 0 || check.headerOverlap) {
          layoutDefects.push({
            route: route.name,
            theme,
            width: vp.width,
            ...check,
          });
        }
      }

      // Run CDP interaction flash audit in Dark Mode at Mobile (375px) and Desktop (1440px)
      if (theme === 'dark') {
        const cdp = await context.newCDPSession(page);
        for (const testW of [375, 1440]) {
          await page.setViewportSize({ width: testW, height: 900 });
          await page.waitForTimeout(100);

          // If mobile, also test opening the mobile menu drawer (.cl-burger)
          if (testW === 375) {
            const burger = page.locator('.cl-burger');
            if ((await burger.count()) > 0 && (await burger.isVisible())) {
              await burger.click();
              await page.waitForTimeout(150);
              const drawerIssues = await auditDarkInteractionStates(page, cdp, `${route.name}_drawer`, testW);
              if (drawerIssues.length > 0) {
                darkFlashDefects.push({ route: `${route.name} (mobile drawer)`, width: testW, issues: drawerIssues });
              }
              const closeBtn = page.locator('.cl-drawer .cl-icon-btn');
              if ((await closeBtn.count()) > 0) {
                await closeBtn.click();
                await page.waitForTimeout(100);
              }
            }
          }

          // If home route, open Hero Date Picker & Category Popover in Dark Mode and audit them
          if (route.name === 'home' && testW === 1440) {
            for (const triggerId of ['#hero-category-trigger', '#hero-region-trigger', '#hero-date-trigger']) {
              const trig = page.locator(triggerId);
              if ((await trig.count()) > 0 && (await trig.isVisible())) {
                await trig.click();
                await page.waitForTimeout(150);
                const popIssues = await auditDarkInteractionStates(page, cdp, `home_${triggerId}`, testW);
                if (popIssues.length > 0) {
                  darkFlashDefects.push({ route: `home (${triggerId})`, width: testW, issues: popIssues });
                }
              }
            }
          }

          // If vendor_detail route, test opening BookingModal in Dark Mode and audit its interactions
          if (route.name === 'vendor_detail' && testW === 1440) {
            const reserveBtn = page.locator('button:has-text("Reserve Now"), button:has-text("Weka Nafasi")');
            if ((await reserveBtn.count()) > 0 && (await reserveBtn.first().isVisible())) {
              await reserveBtn.first().click();
              await page.waitForTimeout(200);
              const modalIssues = await auditDarkInteractionStates(page, cdp, 'vendor_detail (BookingModal)', testW);
              if (modalIssues.length > 0) {
                darkFlashDefects.push({ route: 'vendor_detail (BookingModal)', width: testW, issues: modalIssues });
              }
              const closeBtn = page.locator('.modal-card .modal-close-btn');
              if ((await closeBtn.count()) > 0) {
                await closeBtn.first().click();
                await page.waitForTimeout(100);
              }
            }
          }

          // If bookings route, test opening PaymentModal in Dark Mode and audit its interactions
          if (route.name === 'bookings' && testW === 1440) {
            const payBtn = page.locator('button:has-text("Pay Remaining"), button:has-text("Lipa")');
            if ((await payBtn.count()) > 0 && (await payBtn.first().isVisible())) {
              await payBtn.first().click();
              await page.waitForTimeout(200);
              const modalIssues = await auditDarkInteractionStates(page, cdp, 'bookings (PaymentModal)', testW);
              if (modalIssues.length > 0) {
                darkFlashDefects.push({ route: 'bookings (PaymentModal)', width: testW, issues: modalIssues });
              }
              const closeBtn = page.locator('.modal-card .modal-close-btn');
              if ((await closeBtn.count()) > 0) {
                await closeBtn.first().click();
                await page.waitForTimeout(100);
              }
            }
          }

          const pageIssues = await auditDarkInteractionStates(page, cdp, route.name, testW);
          if (pageIssues.length > 0) {
            darkFlashDefects.push({ route: route.name, width: testW, issues: pageIssues });
          }
        }
      }

      await context.close();
    }
  }

  await browser.close();

  console.log(`=== QA SUMMARY ===`);
  console.log(`Total route x theme x viewport checks: ${totalChecks}`);
  console.log(`Layout defects found: ${layoutDefects.length}`);
  if (layoutDefects.length > 0) {
    console.log(JSON.stringify(layoutDefects.slice(0, 25), null, 2));
  }
  console.log(`Dark Mode interaction flash defects found: ${darkFlashDefects.length}`);
  if (darkFlashDefects.length > 0) {
    console.log(JSON.stringify(darkFlashDefects, null, 2));
  }
})();

