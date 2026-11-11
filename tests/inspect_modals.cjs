const fs = require('fs');

function inspect(file) {
  console.log(`\n=== ${file} ===`);
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((l, i) => {
    if (l.includes('modal-close') || l.includes('onClose') || l.includes('rgba(255, 255, 255') || l.includes('#ffffff') || l.includes('#fff')) {
      console.log(`${i+1}: ${l.trim()}`);
    }
  });
}

inspect('src/components/BookingModal.jsx');
inspect('src/components/PaymentModal.jsx');
inspect('src/components/AuthPromptModal.jsx');

