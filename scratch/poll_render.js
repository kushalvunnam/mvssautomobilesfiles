const https = require('https');

console.log('--- Checking Render Production Deployment Status ---');

function checkRenderEndpoint() {
  return new Promise((resolve) => {
    https.get('https://mvssautomobilesfiles-rkp4.onrender.com/api/vendors', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch(e) {}
        resolve({
          status: res.statusCode,
          contentType: res.headers['content-type'],
          json,
          data
        });
      });
    }).on('error', (err) => {
      resolve({ error: err.message });
    });
  });
}

async function poll() {
  for (let i = 1; i <= 30; i++) {
    console.log(`[Attempt ${i}/30] Fetching https://mvssautomobilesfiles-rkp4.onrender.com/api/vendors ...`);
    const res = await checkRenderEndpoint();
    console.log(`Status Code: ${res.status} | Content-Type: ${res.contentType}`);
    if (res.json) {
      console.log('JSON Output:', res.json);
    } else {
      console.log('Raw Output:', res.data ? res.data.slice(0, 100) : res.error);
    }

    if (res.status === 401 || res.status === 200 || (res.json && res.json.error === 'Please authenticate.')) {
      console.log('\n🎉 Render Backend Deployment Complete! /api/vendors is LIVE and returning JSON!');
      process.exit(0);
    }

    await new Promise(r => setTimeout(r, 6000));
  }
  console.log('Polling timed out.');
  process.exit(1);
}

poll();
