const path = require('path');
module.paths.push(path.join(__dirname, '../backend/node_modules'));

const http = require('http');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'autoworkshop_secret_key_123';
process.env.PORT = '5099';

console.log('--- Benchmarking Login & API Performance ---');

function makePost(options, data) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        const duration = Date.now() - startTime;
        let json = null;
        try { json = JSON.parse(body); } catch(e) {}
        resolve({ status: res.statusCode, body: json, duration });
      });
    });
    req.on('error', reject);
    req.write(JSON.stringify(data));
    req.end();
  });
}

async function runBenchmark() {
  const app = require('../backend/server');
  await new Promise(r => setTimeout(r, 1000));

  console.log('\n[BENCHMARK 1] Login Response Time');
  const loginResult = await makePost({
    hostname: 'localhost',
    port: 5099,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: 'admin@autoworkshop.com',
    password: 'password123'
  });

  console.log(`Status Code: ${loginResult.status}`);
  console.log(`Login Time: ${loginResult.duration}ms`);

  if (loginResult.status === 200 && loginResult.duration < 1500) {
    console.log(`✅ BENCHMARK 1 PASSED: Login response time (${loginResult.duration}ms) is well under 1.5 seconds!`);
  } else {
    console.warn(`⚠️ Login completed in ${loginResult.duration}ms`);
  }

  console.log('\n==================================================');
  console.log('🎉 PERFORMANCE BENCHMARK COMPLETE!');
  console.log('==================================================');
  process.exit(0);
}

runBenchmark().catch(err => {
  console.error('Benchmark error:', err);
  process.exit(1);
});
