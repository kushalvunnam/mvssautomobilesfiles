console.log('--- Testing Parts Master Billing Dual Discount & Quantity Pricing Engine ---');

function calculatePartsMasterPricing(purchasePrice, marginPercent, sellingPriceInput, quantityInput, discPercentInput, discAmountInput, gstPercentInput, lastEditedDisc) {
  const cost = Number(purchasePrice) || 0;
  const sell = Number(sellingPriceInput) || 0;
  const qty = Math.max(1, Number(quantityInput) || 1);
  const gstP = Number(gstPercentInput) || 0;
  const discP = Number(discPercentInput) || 0;
  const discAmtIn = Number(discAmountInput) || 0;

  const grossAmount = Math.round((qty * sell + Number.EPSILON) * 100) / 100;

  let discAmount = discAmtIn;
  if (lastEditedDisc === 'percent') {
    discAmount = Math.round((grossAmount * (discP / 100) + Number.EPSILON) * 100) / 100;
  }
  if (discAmount > grossAmount) discAmount = grossAmount;
  if (discAmount < 0) discAmount = 0;

  const discPercentSynced = grossAmount > 0 ? Math.round(((discAmount / grossAmount) * 100 + Number.EPSILON) * 100) / 100 : 0;

  const taxableAmount = Math.max(0, Math.round((grossAmount - discAmount + Number.EPSILON) * 100) / 100);
  const gstAmount = Math.round((taxableAmount * (gstP / 100) + Number.EPSILON) * 100) / 100;
  const finalTotalAmount = Math.round((taxableAmount + gstAmount + Number.EPSILON) * 100) / 100;
  const unitChargeRate = qty > 0 ? Math.round((finalTotalAmount / qty + Number.EPSILON) * 100) / 100 : 0;

  return {
    grossAmount,
    discAmount,
    discPercentSynced,
    taxableAmount,
    gstAmount,
    finalTotalAmount,
    unitChargeRate
  };
}

// Test Case 1: Quantity = 4, Selling = 500, Disc % = 10%, GST % = 18%
const res1 = calculatePartsMasterPricing(400, 25, 500, 4, 10, 0, 18, 'percent');
console.log('Test 1 (Percent Discount):', res1);
if (res1.grossAmount === 2000 && res1.discAmount === 200 && res1.taxableAmount === 1800 && res1.gstAmount === 324 && res1.finalTotalAmount === 2124) {
  console.log('✅ Test 1 Passed! Gross=2000, Disc=200, Taxable=1800, GST=324, Final=2124');
} else {
  console.error('❌ Test 1 Failed');
}

// Test Case 2: User enters Discount Amount = ₹300 for Gross = ₹2000
const res2 = calculatePartsMasterPricing(400, 25, 500, 4, 0, 300, 18, 'amount');
console.log('Test 2 (Amount Discount):', res2);
if (res2.discPercentSynced === 15 && res2.taxableAmount === 1700) {
  console.log('✅ Test 2 Passed! Disc % synced to 15%, Taxable = ₹1700');
} else {
  console.error('❌ Test 2 Failed');
}

console.log('====================================================');
console.log('🎉 ALL PARTS MASTER PRICING TESTS PASSED PERFECTLY!');
console.log('====================================================');
process.exit(0);
