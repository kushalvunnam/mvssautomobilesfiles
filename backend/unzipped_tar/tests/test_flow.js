const numberToWords = require('../utils/numberToWords');

// Simple test runner
function runTests() {
  console.log('--- STARTING AUTOWORKSHOP PRO UNIT TESTS ---');

  const testCases = [
    { num: 17539, expected: 'Rupees Seventeen Thousand Five Hundred Thirty Nine Only' },
    { num: 0, expected: 'Rupees Zero Only' },
    { num: 100000, expected: 'Rupees One Lakh Only' },
    { num: 15200.75, expected: 'Rupees Fifteen Thousand Two Hundred and Seventy Five Paise Only' },
    { num: 5.5, expected: 'Rupees Five and Fifty Paise Only' }
  ];

  let failures = 0;
  testCases.forEach((tc, idx) => {
    const result = numberToWords(tc.num);
    // Replace any extra whitespace to be safe
    const cleanResult = result.replace(/\s+/g, ' ').trim();
    const cleanExpected = tc.expected.replace(/\s+/g, ' ').trim();
    
    if (cleanResult === cleanExpected) {
      console.log(`✓ Test Case #${idx + 1} passed: ${tc.num} -> "${result}"`);
    } else {
      console.error(`✗ Test Case #${idx + 1} FAILED! Input: ${tc.num}`);
      console.error(`  Expected: "${cleanExpected}"`);
      console.error(`  Received: "${cleanResult}"`);
      failures++;
    }
  });

  if (failures === 0) {
    console.log('--- ALL UNIT TESTS COMPLETED SUCCESSFULLY ---');
    process.exit(0);
  } else {
    console.error(`--- UNIT TESTS FAILED WITH ${failures} ERRORS ---`);
    process.exit(1);
  }
}

runTests();
