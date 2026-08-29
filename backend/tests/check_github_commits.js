const https = require('https');

const checkGitHub = () => {
  const options = {
    hostname: 'api.github.com',
    path: '/repos/kushalvunnam/mvss-erp-backend/commits/main',
    headers: {
      'User-Agent': 'NodeJS-Script'
    }
  };

  https.get(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      try {
        const commitInfo = JSON.parse(data);
        console.log('GitHub main branch status:');
        console.log(`- Commit SHA: ${commitInfo.sha}`);
        console.log(`- Author: ${commitInfo.commit.author.name}`);
        console.log(`- Message: ${commitInfo.commit.message}`);
        console.log(`- Date: ${commitInfo.commit.author.date}`);
      } catch (err) {
        console.error('Failed to parse GitHub response:', data.slice(0, 500));
      }
      process.exit(0);
    });
  }).on('error', (err) => {
    console.error(err);
    process.exit(1);
  });
};

checkGitHub();
