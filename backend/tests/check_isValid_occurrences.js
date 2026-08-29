const fs = require('fs');
const path = require('path');

const checkFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  console.log(`Checking file: ${filePath}`);
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('isValid')) {
      console.log(`Line ${idx + 1}: ${line.trim()}`);
    }
  });
};

const main = () => {
  const p1 = path.join(__dirname, '../routes/purchases.js');
  const p2 = path.join(__dirname, '../scratch/mvss-erp-backend-deploy/backend/routes/purchases.js');
  checkFile(p1);
  checkFile(p2);
};

main();
