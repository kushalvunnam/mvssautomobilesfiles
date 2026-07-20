async function runBranchTests() {
  console.log('--- Starting Branch Navigation & Directions URL Verification ---');
  process.env.PORT = '5005';

  const branchesRouter = require('../backend/routes/branches');
  const server = require('../backend/server');

  await new Promise(r => setTimeout(r, 1200));

  try {
    const res = await fetch('http://localhost:5005/api/branches');
    const branches = await res.json();

    console.log(`\nRetrieved ${branches.length} branch locations:`);
    branches.forEach((b, i) => {
      console.log(`[Branch ${i + 1}] ${b.name}`);
      console.log(`  - Address: ${b.address}`);
      console.log(`  - Coordinates: Lat ${b.coordinates.latitude}, Lng ${b.coordinates.longitude}`);
      console.log(`  - Directions URL: ${b.directionsUrl}`);
    });

    const b1 = branches.find(b => b.id === 'branch-1');
    const b2 = branches.find(b => b.id === 'branch-2');

    if (!b1 || !b2) {
      throw new Error('Branch 1 or Branch 2 missing from response');
    }

    const expectedB1Url = 'https://www.google.com/maps/dir/?api=1&destination=17.5278,78.4852';
    const expectedB2Url = 'https://www.google.com/maps/dir/?api=1&destination=17.5764,78.4812';

    console.log('\n--- VERIFICATION CHECKS ---');
    console.log('1. Branch 1 Directions URL match:', b1.directionsUrl === expectedB1Url ? 'PASSED ✅' : 'FAILED ❌');
    console.log('2. Branch 2 Directions URL match:', b2.directionsUrl === expectedB2Url ? 'PASSED ✅' : 'FAILED ❌');
    console.log('3. Distinct URLs for both branches:', b1.directionsUrl !== b2.directionsUrl ? 'PASSED ✅' : 'FAILED ❌');
    console.log('4. GPS Coordinates available:', (b1.coordinates.latitude && b2.coordinates.latitude) ? 'PASSED ✅' : 'FAILED ❌');

    if (b1.directionsUrl === expectedB1Url && b2.directionsUrl === expectedB2Url && b1.directionsUrl !== b2.directionsUrl) {
      console.log('\n==================================================');
      console.log('🎉 ALL BRANCH LOCATION NAVIGATION TESTS PASSED!');
      console.log('==================================================\n');
      process.exit(0);
    } else {
      console.error('❌ Tests failed!');
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Branch test error:', err);
    process.exit(1);
  }
}

runBranchTests();
