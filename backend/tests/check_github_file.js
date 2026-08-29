const https = require('https');

const checkFile = () => {
  const options = {
    hostname: 'api.github.com',
    path: '/repos/kushalvunnam/mvssautomobilesfiles/contents/backend/routes/purchases.js?ref=main',
    headers: {
      'User-Agent': 'NodeJS-Script',
      'Accept': 'application/vnd.github.v3.raw'
    }
  };

  https.get(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log('Downloaded purchases.js from GitHub ref=main.');
      const lines = data.split('\n');
      console.log(`Total lines: ${lines.length}`);
      lines.forEach((line, idx) => {
        if (line.includes('isValid')) {
          console.log(`Line ${idx + 1}: ${line.trim()}`);
        }
      });
      process.exit(0);
    });
  }).on('error', (err) => {
    console.error(err);
    process.exit(1);
  });
};

checkFile();
