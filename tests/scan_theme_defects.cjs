const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.resolve(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.css')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk('./src');
const lightBgRegex = /(background|background-color):\s*['\"]?(#ffffff|#fff\b|white\b|rgb\(255,\s*255,\s*255\)|#f[0-9a-f]{5}\b|rgba\(255,\s*255,\s*255,\s*(0\.[789]\d*|1)\))/i;
const darkTextRegex = /(color):\s*['\"]?(#000\b|#000000\b|#0A0A0A\b|#0f172a\b|#1e293b\b|#334155\b|#1e1b4b\b|#2f2a3a\b|#475569\b|#64748b\b)/i;

const jsxBgFindings = [];
const jsxTextFindings = [];

files.forEach(f => {
  if (!f.endsWith('.jsx')) return;
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    // Ignore lines in comments
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) return;
    if (lightBgRegex.test(line)) {
      jsxBgFindings.push({ file: path.relative('.', f), line: idx + 1, text: line.trim() });
    }
    if (darkTextRegex.test(line)) {
      jsxTextFindings.push({ file: path.relative('.', f), line: idx + 1, text: line.trim() });
    }
  });
});

console.log('=== JSX HARDCODED LIGHT BACKGROUNDS === (Count: ' + jsxBgFindings.length + ')');
jsxBgFindings.forEach(item => {
  console.log(`${item.file}:${item.line} -> ${item.text}`);
});

console.log('\n=== JSX HARDCODED DARK TEXT COLORS === (Count: ' + jsxTextFindings.length + ')');
// Summarize by file
const textByFile = {};
jsxTextFindings.forEach(item => {
  textByFile[item.file] = (textByFile[item.file] || 0) + 1;
});
console.log(JSON.stringify(textByFile, null, 2));

