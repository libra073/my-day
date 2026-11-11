const fs = require('fs');
const path = require('path');

function walk(dir) {
  let res = [];
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) res = res.concat(walk(p));
    else if (f.endsWith('.jsx') || f.endsWith('.js')) res.push(p);
  }
  return res;
}

const files = walk('src');
for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  if (content.includes('fill="#ffffff"') || content.includes("fill='#ffffff'")) {
    console.log('Found fill white in:', f);
  }
}

