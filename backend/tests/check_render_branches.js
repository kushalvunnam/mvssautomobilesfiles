const https = require('https');

const checkBranches = () => {
  const options = {
    hostname: 'api.github.com',
    path: '/repos/kushalvunnam/mvssautomobilesfiles/branches',
    headers: {
      'User-Agent': 'NodeJS-Script'
    }
  };

  https.get(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      try {
        const branches = JSON.parse(data);
        console.log('GitHub branches for mvss-erp-backend:');
        for (const b of branches) {
          console.log(`- ${b.name} (Commit SHA: ${b.commit.sha})`);
        }
      } catch (err) {
        console.error('Failed to parse response:', data);
      }
      process.exit(0);
    });
  }).on('error', (err) => {
    console.error(err);
    process.exit(1);
  });
};

checkBranches();
