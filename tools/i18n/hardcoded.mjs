/**
 * Find user-facing strings that bypass the translation system:
 *   - JSX text nodes with sentences
 *   - literal placeholder / title / aria-label / alt attributes
 *   - literal toast/alert/confirm/setError/setNotice messages
 *
 * Run: node tools/i18n/hardcoded.mjs [--verbose]
 */
import fs from 'node:fs';
import path from 'node:path';

const verbose = process.argv.includes('--verbose');

const BRANDS = /\b(MY DAY|M-?Pesa|Tigo|Airtel|HaloPesa|Visa|WhatsApp|Tanzania|Dar es Salaam|Arusha|Mwanza|Zanzibar|Dodoma|Tanga|Bagamoyo|Kiswahili|English|Safari|Chrome|iPhone|Android)\b/i;
const IGNORE = /\b(class(Name)?|style|key|href|src|id|type|name|role|method|path|to|target|rel|htmlFor|d|viewBox|xmlns|width|height|fill|stroke)\b/;

const files = [];
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) walk(f);
    else if (/\.(jsx?|tsx?)$/.test(e.name)) files.push(f);
  }
}
walk('src');

const findings = [];
const push = (file, line, kind, text) => findings.push({ file, line, kind, text: text.trim().slice(0, 140) });

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  const lines = src.split('\n');
  lines.forEach((raw, idx) => {
    const line = raw.trim();
    if (!line || line.startsWith('//') || line.startsWith('*') || line.startsWith('/*')) return;
    if (IGNORE.test(line) && !/placeholder|aria-label|title=|alt=/.test(line)) return;

    // 1. JSX text nodes:  >Some human sentence<
    const textNodes = [...line.matchAll(/>\s*([A-Z][A-Za-z0-9 ,.'’!?&:;()\-–—/+%]+[a-z][A-Za-z0-9 ,.'’!?&:;()\-–—/+%]*)\s*</g)];
    for (const m of textNodes) {
      const text = m[1].trim();
      if (text.length < 4 || BRANDS.test(text) === false && !/[a-z]{3,}\s+[a-z]{2,}/i.test(text)) continue;
      if (BRANDS.test(text)) continue;
      push(file, idx + 1, 'jsx-text', text);
    }

    // 2. literal attribute copy
    const attrs = [...line.matchAll(/\b(placeholder|title|aria-label|alt)="([^"{}]{4,})"/g)];
    for (const m of attrs) {
      const text = m[2].trim();
      if (BRANDS.test(text)) continue;
      if (!/[a-z]{3,}/i.test(text)) continue;
      push(file, idx + 1, `attr:${m[1]}`, text);
    }

    // 3. literal user messages
    const calls = [...line.matchAll(/\b(toast|alert|confirm|setError|setNotice|setMessage|window\.alert|window\.confirm)\(\s*(['"`])((?:\\.|(?!\2).)+)\2/g)];
    for (const m of calls) {
      const text = m[3].trim();
      if (!text || text.length < 4 || BRANDS.test(text)) continue;
      push(file, idx + 1, `call:${m[1]}`, text);
    }
  });
}

const byFile = new Map();
for (const f of findings) {
  if (!byFile.has(f.file)) byFile.set(f.file, []);
  byFile.get(f.file).push(f);
}

console.log(`findings: ${findings.length} across ${byFile.size} files\n`);
for (const [file, list] of [...byFile.entries()].sort((a, b) => b[1].length - a[1].length)) {
  console.log(`${file} (${list.length})`);
  for (const f of (verbose ? list : list.slice(0, 8))) {
    console.log(`  L${f.line} [${f.kind}] ${f.text}`);
  }
}

fs.writeFileSync('scratch/i18n-hardcoded.json', JSON.stringify(findings, null, 2));
