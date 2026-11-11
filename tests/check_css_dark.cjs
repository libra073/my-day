const fs = require('fs');
const c = fs.readFileSync('src/styles/clay-theme.css', 'utf8');
const lines = c.split('\n');
lines.forEach((l, i) => {
  if (l.includes('data-theme="dark"') || l.includes("data-theme='dark'") || l.includes('data-theme=\\"dark\\"')) {
    console.log(`${i+1}: ${l}`);
  }
});

