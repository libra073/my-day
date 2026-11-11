/**
 * Static audit of src/i18n/translations.js
 * - key parity between en/sw
 * - empty values
 * - interpolation placeholder mismatches
 * - identical en/sw values (possible untranslated copy)
 *
 * Run: node tools/i18n/keys.mjs
 */
import fs from 'node:fs';

const src = fs.readFileSync('src/i18n/translations.js', 'utf8');

function extractBlock(name) {
  const start = src.indexOf(`${name}: {`);
  if (start === -1) throw new Error(`block ${name} not found`);
  const open = src.indexOf('{', start);
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') {
      depth--;
      if (depth === 0) return src.slice(open + 1, i);
    }
  }
  throw new Error(`unbalanced block ${name}`);
}

const parseEntries = (block) => {
  const map = new Map();
  // key: "value"  |  key: 'value'  |  key: `value`  (single-line entries)
  const re = /^\s{4}([A-Za-z0-9_]+):\s*(["'`])((?:\\.|(?!\2).)*)\2,?\s*$/gm;
  for (const m of block.matchAll(re)) map.set(m[1], m[3]);
  return map;
};

const en = parseEntries(extractBlock('en'));
const sw = parseEntries(extractBlock('sw'));

const missingInSw = [...en.keys()].filter((k) => !sw.has(k));
const missingInEn = [...sw.keys()].filter((k) => !en.has(k));
const empty = [...en.entries()].filter(([, v]) => !v.trim()).map(([k]) => k)
  .concat([...sw.entries()].filter(([, v]) => !v.trim()).map(([k]) => `sw.${k}`));

const placeholders = (s) => [...s.matchAll(/\{([A-Za-z0-9_]+)\}/g)].map((m) => m[1]).sort().join(',');
const interpMismatch = [];
for (const [k, v] of en) {
  if (!sw.has(k)) continue;
  if (placeholders(v) !== placeholders(sw.get(k))) interpMismatch.push({ key: k, en: v, sw: sw.get(k) });
}

const identical = [...en.entries()]
  .filter(([k, v]) => sw.get(k) === v)
  .map(([k, v]) => ({ key: k, value: v }));

const report = {
  enKeys: en.size,
  swKeys: sw.size,
  missingInSw,
  missingInEn,
  empty,
  interpMismatch,
  identicalCount: identical.length,
  identicalSample: identical.slice(0, 40),
};

console.log(JSON.stringify(report, null, 2));

const fail = missingInSw.length + missingInEn.length + empty.length + interpMismatch.length;
if (fail > 0) {
  console.error(`\nFAIL: ${fail} blocking translation issues`);
  process.exitCode = 1;
} else {
  console.log('\nPASS: key parity, no empty values, interpolation consistent');
}
