import { chromium } from '@playwright/test';

const VIEWPORTS = [
  // Mobile
  { name: 'iPhone SE', width: 320, height: 568 },
  { name: 'Android Compact', width: 360, height: 800 },
  { name: 'iPhone 13/14 Mini', width: 375, height: 812 },
  { name: 'iPhone 14/15', width: 390, height: 844 },
  { name: 'iPhone Pro Max', width: 430, height: 932 },
  // Tablet
  { name: 'iPad Portrait', width: 768, height: 1024 },
  { name: 'iPad Air', width: 820, height: 1180 },
  { name: 'iPad Landscape', width: 1024, height: 768 },
  // Desktop
  { name: 'HD Laptop', width: 1280, height: 720 },
  { name: 'Standard Laptop', width: 1366, height: 768 },
  { name: 'MacBook 15', width: 1440, height: 900 },
  { name: 'Full HD Desktop', width: 1920, height: 1080 }
];

const PAGES_TO_AUDIT = [
  { url: '/', name: 'Home Page' },
  { url: '/marketplace', name: 'Marketplace' },
  { url: '/vendor/kumbi/venue-1', name: 'Vendor Detail' },
  { url: '/planner', name: 'AI Planner' },
  { url: '/wedding', name: 'Wedding Profile' },
  { url: '/dashboard', name: 'Couple Dashboard' },
  { url: '/bookings', name: 'My Bookings' },
  { url: '/become-vendor', name: 'Become a Vendor' },
  { url: '/contact', name: 'Contact Us' },
  { url: '/provider', name: 'Provider Portal' },
  { url: '/admin', name: 'Admin Console' }
];

async function runAudit() {
  console.log('╔═══════════════════════════════════════════════════════════════════════╗');
  console.log('║       MY DAY — FULL UI, TYPOGRAPHY & CARD READABILITY AUDIT           ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════╝\n');

  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  } catch {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  }

  const context = await browser.newContext();

  // Set default auth tokens so all dashboards are accessible
  await context.addInitScript(() => {
    localStorage.setItem('myday_token', 'token-admin-session');
    localStorage.setItem('myday_user', JSON.stringify({
      id: 'admin-1',
      name: 'Sarah Kimaro (Bride)',
      email: 'sarah@myday.co.tz',
      role: 'admin'
    }));
  });

  const page = await context.newPage();

  let totalCardChecks = 0;
  let totalTextChecks = 0;
  const issues = [];

  for (const lang of ['en', 'sw']) {
    console.log(`\n======================================================`);
    console.log(`🌐 AUDITING LANGUAGE: ${lang.toUpperCase()}`);
    console.log(`======================================================`);

    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await page.evaluate((l) => {
      localStorage.setItem('myday_lang', l);
    }, lang);

    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      for (const p of PAGES_TO_AUDIT) {
        await page.goto(`http://localhost:5173${p.url}`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(400);

        const pageAudit = await page.evaluate((info) => {
          const report = {
            viewport: info.vpName,
            page: info.pageName,
            url: info.url,
            lang: info.lang,
            horizontalScroll: document.documentElement.scrollWidth > window.innerWidth,
            overflowDelta: document.documentElement.scrollWidth - window.innerWidth,
            badTextNodes: [],
            cardIssues: [],
            contrastOrSmallText: []
          };

          // 1. Text & Wording checks on all visible elements
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          let node;
          while ((node = walker.nextNode())) {
            const text = node.nodeValue.trim();
            if (!text || text.length < 3) continue;

            // Check for raw keyword glitches
            if (/\b(undefined|null|NaN|\[object Object\])\b/i.test(text)) {
              report.badTextNodes.push({ text: text.substring(0, 80), parent: node.parentElement?.tagName });
            }

            // Check for unrendered template tags like {{ or }}
            if (/\{\{.*?\}\}/.test(text)) {
              report.badTextNodes.push({ text: text.substring(0, 80), type: 'unrendered_template' });
            }
          }

          // 2. Card Readability & Boundary clipping
          const cards = document.querySelectorAll('.card, .dash-card, .ai-card, .glass-card, [style*="border-radius"]');
          cards.forEach((card, idx) => {
            if (card.closest('.mobile-nav-drawer')) return; // Ignore elements inside offscreen drawer
            const computedStyle = window.getComputedStyle(card);
            if (computedStyle.pointerEvents === 'none') return; // Ignore background glow orbs/decorations
            if (computedStyle.position === 'absolute' && card.parentElement && window.getComputedStyle(card.parentElement).overflow === 'hidden') return;
            const cardRect = card.getBoundingClientRect();
            if (cardRect.width < 50 || cardRect.height < 30) return; // ignore tiny chips

            // Check if card itself overflows viewport
            if (cardRect.right > window.innerWidth + 4 && window.innerWidth >= 320) {
              report.cardIssues.push({
                type: 'card_viewport_overflow',
                cardIdx: idx,
                cardClass: card.className,
                right: cardRect.right,
                winW: window.innerWidth
              });
            }

            // Check buttons inside card
            const btns = card.querySelectorAll('button, a.button, .btn-pill-amber, .btn-pill-mocha');
            btns.forEach(btn => {
              const btnRect = btn.getBoundingClientRect();
              if (btnRect.width > 0 && btnRect.right > cardRect.right + 6) {
                report.cardIssues.push({
                  type: 'button_exceeds_card',
                  btnText: btn.innerText?.trim().substring(0, 30),
                  delta: Math.round(btnRect.right - cardRect.right)
                });
              }
            });
          });

          return report;
        }, { vpName: vp.name, pageName: p.name, url: p.url, lang });

        totalTextChecks++;
        if (pageAudit.horizontalScroll) {
          issues.push(`[${lang.toUpperCase()}] [${vp.name}] Horizontal Overflow on ${p.name}: +${pageAudit.overflowDelta}px`);
        }
        if (pageAudit.badTextNodes.length > 0) {
          pageAudit.badTextNodes.forEach(b => {
            issues.push(`[${lang.toUpperCase()}] Raw text glitch on ${p.name}: "${b.text}"`);
          });
        }
        if (pageAudit.cardIssues.length > 0) {
          pageAudit.cardIssues.forEach(c => {
            issues.push(`[${lang.toUpperCase()}] [${vp.name}] Card Issue on ${p.name}: ${JSON.stringify(c)}`);
          });
        }
      }
      console.log(`  ✓ ${vp.name} (${vp.width}x${vp.height}): 11 pages checked`);
    }
  }

  console.log('\n======================================================');
  console.log('📊 AUDIT SUMMARY RESULTS:');
  console.log(`Total Viewport & Page Audits: ${totalTextChecks}`);
  console.log(`Total Issues Found: ${issues.length}`);
  if (issues.length > 0) {
    console.log('\nIssues Detail:');
    issues.forEach(i => console.log('  ⚠️ ' + i));
  } else {
    console.log('🎉 PERFECT SCORE: Zero horizontal overflow, zero broken cards, zero text glitches across all 12 viewports & 11 pages in EN & SW!');
  }
  console.log('======================================================\n');

  await browser.close();
}

runAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
