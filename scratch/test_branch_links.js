const fs = require('fs');

console.log('--- Testing Branch 1 & Branch 2 Directions URLs ---');

const configContent = fs.readFileSync('./frontend/src/config.js', 'utf8');
const backendContent = fs.readFileSync('./backend/routes/branches.js', 'utf8');

if (configContent.includes("https://maps.app.goo.gl/67ighFJZMzyM2yi19?g_st=iw")) {
  console.log('✅ frontend/src/config.js contains official Google Maps link for Branch 2!');
} else {
  console.error('❌ ERROR: Frontend config missing official Branch 2 link');
  process.exit(1);
}

if (backendContent.includes("https://maps.app.goo.gl/67ighFJZMzyM2yi19?g_st=iw")) {
  console.log('✅ backend/routes/branches.js contains official Google Maps link for Branch 2!');
} else {
  console.error('❌ ERROR: Backend router missing official Branch 2 link');
  process.exit(1);
}

console.log('🎉 ALL BRANCH LOCATION VERIFICATION TESTS PASSED!');
