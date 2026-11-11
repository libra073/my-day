const fs = require('fs');
const path = require('path');

const COLOR_MAP = [
  // Old Coffee / Caramel / Brown -> Apple Liquid Glass
  [/#8D4E2A/gi, '#0071E3'],
  [/#A8653E/gi, '#0A84FF'],
  [/#C27E54/gi, '#00C7BE'],
  [/#2D190E/gi, '#0F172A'],
  [/#F5ECE1/gi, '#F1F5F9'],
  [/#FAF6F0/gi, '#F8FAFC'],
  [/#EDE0D0/gi, '#E2E8F0'],
  [/#5D3A24/gi, '#0056B3'],
  [/#6E381C/gi, '#004085'],
  [/#3E2314/gi, '#0B1320'],
  [/#54321D/gi, '#101B2E'],
  [/#6D4127/gi, '#1E293B'],
  [/#B89675/gi, '#94A3B8'],
  [/#CEB295/gi, '#CBD5E1'],
  [/#E0CCB6/gi, '#E2E8F0'],
  [/#140C07/gi, '#060A10'],
  [/#1B1009/gi, '#0B1320'],
  [/#22140B/gi, '#0B1320'],
  [/#2B1A0F/gi, '#101B2E'],
  [/#FAF5EE/gi, '#F8FAFC'],
  [/#E8DACB/gi, '#E2E8F0'],
  [/#D2BEAA/gi, '#94A3B8'],
  [/#B39B86/gi, '#64748B'],
  [/#947D68/gi, '#64748B'],
  [/#E0A370/gi, '#2997FF'],
  [/#C27A4B/gi, '#0A84FF'],
  [/#D48B55/gi, '#40A9FF'],
  [/#F7EFE5/gi, '#F4F7FB'],
  [/#F9F3EA/gi, '#F8FAFC'],
  [/#E7D4BF/gi, '#E2E8F0'],
  [/#110A05/gi, '#05080E'],
  [/#1A0F08/gi, '#0A0F18'],
  [/#25150C/gi, '#0F172A'],

  // Purple / Violet leftovers -> Apple Azure / Cyan
  [/#7c3aed/gi, '#0071E3'],
  [/#8b5cf6/gi, '#0A84FF'],
  [/#7B4CEB/gi, '#0A84FF'],
  [/#6366f1/gi, '#0071E3'],
  [/#a855f7/gi, '#0A84FF'],
  [/#9333ea/gi, '#0056B3'],
  [/#8E62F8/gi, '#0A84FF'],
  [/#6D28D9/gi, '#004085'],
  [/#5B21B6/gi, '#002B5C'],
  [/#4C1D95/gi, '#001A3D'],
  [/#4318FF/gi, '#0071E3'],
  [/#6C5CE7/gi, '#0071E3'],
  [/#6B38DC/gi, '#0071E3'],
  [/#5B2FC6/gi, '#0056B3'],
  [/#441DA3/gi, '#002B5C'],
];

function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== 'dist') {
        processDirectory(fullPath);
      }
    } else if (entry.isFile() && (entry.name.endsWith('.jsx') || entry.name.endsWith('.css') || entry.name.endsWith('.js'))) {
      // Don't touch archived unused kit files
      if (entry.name === 'warm-cafe-latte-kit.css' || entry.name === 'purple-3d-glass-kit.css') continue;

      let content = fs.readFileSync(fullPath, 'utf8');
      let replaced = 0;
      for (const [re, rep] of COLOR_MAP) {
        const matches = content.match(re);
        if (matches) {
          replaced += matches.length;
          content = content.replace(re, rep);
        }
      }
      if (replaced > 0) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}: replaced ${replaced} tokens.`);
      }
    }
  }
}

console.log('Migrating codebase to Apple Liquid Glass palette...');
processDirectory(path.join(__dirname, '../src'));
console.log('Migration complete.');

