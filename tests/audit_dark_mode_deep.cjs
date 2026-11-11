const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const outDir = 'C:/Users/libra051099/.gemini/antigravity/brain/37401341-12df-49f4-9dec-379084ab9fbc/dark_audit';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function auditPage(page, name, url, setupFn = null) {
  console.log(`\n========================================\nAuditing route: ${name} (${url})\n========================================`);
  
  if (setupFn) {
    await setupFn(page);
  }
  
  await page.goto(`http://localhost:5174${url}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(600);

  // 1. Light mode screenshot
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    document.body.setAttribute('data-theme', 'light');
    localStorage.setItem('myday_theme', 'light');
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outDir, `${name}_light.png`), fullPage: true });

  // 2. Switch to Dark Mode
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.setAttribute('data-theme', 'dark');
    localStorage.setItem('myday_theme', 'dark');
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, `${name}_dark.png`), fullPage: true });

  // 3. Inspect DOM in Dark Mode for white surfaces & unreadable text
  const defects = await page.evaluate(() => {
    const findings = [];
    const elements = document.querySelectorAll('*');

    function parseRgb(colorStr) {
      if (!colorStr) return null;
      const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (match) {
        return {
          r: parseInt(match[1]),
          g: parseInt(match[2]),
          b: parseInt(match[3]),
          a: match[4] !== undefined ? parseFloat(match[4]) : 1.0
        };
      }
      return null;
    }

    elements.forEach(el => {
      // Ignore scripts, styles, svgs internals
      if (['SCRIPT', 'STYLE', 'SVG', 'PATH', 'G', 'CIRCLE', 'HEAD', 'META'].includes(el.tagName)) return;

      const style = window.getComputedStyle(el);
      const bg = parseRgb(style.backgroundColor);
      const color = parseRgb(style.color);
      const rect = el.getBoundingClientRect();

      // Only check visible elements with actual dimensions
      if (rect.width > 20 && rect.height > 15) {
        // Bright/White background defect check in dark mode:
        // Must be non-transparent (alpha > 0.35) and high luminance (R, G, B > 220)
        if (bg && bg.a > 0.35 && bg.r > 220 && bg.g > 220 && bg.b > 220) {
          // If element has text or contains cards
          const text = (el.innerText || '').slice(0, 40).replace(/\n/g, ' ').trim();
          findings.push({
            type: 'WHITE_SURFACE_IN_DARK_MODE',
            tag: el.tagName,
            className: el.className,
            id: el.id,
            bg: style.backgroundColor,
            textSnippet: text,
            dims: `${Math.round(rect.width)}x${Math.round(rect.height)}`
          });
        }
      }

      // Check text contrast defects:
      // Dark text on dark background:
      // If element has direct text nodes
      let hasDirectText = false;
      for (let node of el.childNodes) {
        if (node.nodeType === 3 && node.nodeValue.trim().length > 0) {
          hasDirectText = true;
          break;
        }
      }

      if (hasDirectText && color) {
        // Extremely dark text in dark mode (r < 70, g < 70, b < 70)
        if (color.r < 70 && color.g < 70 && color.b < 70) {
          const text = el.innerText.slice(0, 40).replace(/\n/g, ' ').trim();
          findings.push({
            type: 'DARK_TEXT_ON_DARK_BG',
            tag: el.tagName,
            className: el.className,
            id: el.id,
            color: style.color,
            textSnippet: text
          });
        }
      }
    });

    return findings;
  });

  console.log(`Found ${defects.length} potential dark mode defects on ${name}`);
  return { route: name, url, defects };
}

async function main() {
  const browser = await chromium.launch({
    executablePath: 'C:/Users/libra051099/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe',
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5
  });
  const page = await context.newPage();

  const allReports = [];

  // Public Routes
  allReports.push(await auditPage(page, 'home', '/'));
  allReports.push(await auditPage(page, 'marketplace', '/marketplace'));
  allReports.push(await auditPage(page, 'vendor_detail', '/vendor/kumbi/venue-1'));
  allReports.push(await auditPage(page, 'planner', '/planner'));
  allReports.push(await auditPage(page, 'become_vendor', '/become-vendor'));
  allReports.push(await auditPage(page, 'contact', '/contact'));
  allReports.push(await auditPage(page, 'login', '/login'));
  allReports.push(await auditPage(page, 'wedding_profile', '/wedding'));

  // Authenticated Customer
  const setupCustomer = async (p) => {
    await p.evaluate(() => {
      const demoUser = {
        id: 'demo-couple-001',
        name: 'Amina & Baraka',
        email: 'amina@example.com',
        role: 'customer',
        token: 'mock-jwt-token-couple'
      };
      localStorage.setItem('myday_user', JSON.stringify(demoUser));
      localStorage.setItem('myday_token', 'mock-jwt-token-couple');
      localStorage.setItem('myday_role', 'customer');
    });
  };
  allReports.push(await auditPage(page, 'customer_dashboard', '/dashboard', setupCustomer));
  allReports.push(await auditPage(page, 'my_bookings', '/bookings', setupCustomer));

  // Authenticated Provider
  const setupProvider = async (p) => {
    await p.evaluate(() => {
      const demoProvider = {
        id: 'venue-1',
        name: 'Grand Imperial Hall & Gardens',
        email: 'info@grandimperial.co.tz',
        role: 'provider',
        token: 'mock-jwt-token-provider'
      };
      localStorage.setItem('myday_user', JSON.stringify(demoProvider));
      localStorage.setItem('myday_token', 'mock-jwt-token-provider');
      localStorage.setItem('myday_role', 'provider');
    });
  };
  allReports.push(await auditPage(page, 'provider_dashboard', '/provider', setupProvider));

  // Authenticated Admin
  const setupAdmin = async (p) => {
    await p.evaluate(() => {
      const demoAdmin = {
        id: 'admin-super-01',
        name: 'Platform Administrator',
        email: 'admin@myday.co.tz',
        role: 'admin',
        token: 'mock-jwt-token-admin'
      };
      localStorage.setItem('myday_user', JSON.stringify(demoAdmin));
      localStorage.setItem('myday_token', 'mock-jwt-token-admin');
      localStorage.setItem('myday_role', 'admin');
    });
  };
  allReports.push(await auditPage(page, 'admin_dashboard', '/admin', setupAdmin));

  // Check Modals: BookingModal & PaymentModal on vendor detail
  console.log(`\n========================================\nAuditing Modals\n========================================`);
  await setupCustomer(page);
  await page.goto('http://localhost:5174/vendor/kumbi/venue-1', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.setAttribute('data-theme', 'dark');
    localStorage.setItem('myday_theme', 'dark');
  });
  await page.waitForTimeout(500);

  // Trigger Booking Modal
  const reserveBtn = page.locator('button:has-text("Reserve Now")');
  if (await reserveBtn.count() > 0) {
    await reserveBtn.first().click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outDir, 'modal_booking_dark.png') });
    console.log('Captured modal_booking_dark.png');
  }

  // Trigger Appointment Modal
  await page.goto('http://localhost:5174/vendor/kumbi/venue-1', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.setAttribute('data-theme', 'dark');
    localStorage.setItem('myday_theme', 'dark');
  });
  await page.waitForTimeout(500);
  const appointBtn = page.locator('button:has-text("Book Consultation")');
  if (await appointBtn.count() > 0) {
    await appointBtn.first().click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outDir, 'modal_appointment_dark.png') });
    console.log('Captured modal_appointment_dark.png');
  }

  fs.writeFileSync(path.join(outDir, 'audit_report.json'), JSON.stringify(allReports, null, 2));
  console.log('\nAudit complete! Full report written to audit_report.json');

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

