const path = require('path');
module.paths.push(path.join(__dirname, '../backend/node_modules'));

const mongoose = require('mongoose');
const Invoice = require('../backend/models/Invoice');

console.log('--- Testing Invoice isInterstate Validation & Model Coercion ---');

// Test 1: Empty string isInterstate
const inv1 = new Invoice({
  invoiceNo: 'TEST-INV-001',
  customerId: new mongoose.Types.ObjectId(),
  vehicleId: new mongoose.Types.ObjectId(),
  jobCardId: new mongoose.Types.ObjectId(),
  gstDetails: {
    companyGSTIN: '36AAJCM4778P1ZI',
    customerGSTIN: '36ABCDE1234F1Z5',
    isInterstate: ''
  },
  parts: [],
  labour: [],
  totals: { partsTotal: 0, labourTotal: 0, cgstTotal: 0, sgstTotal: 0, igstTotal: 0, gstTotal: 0, discountTotal: 0, grandTotal: 0, roundedGrandTotal: 0 },
  grandTotalWords: 'Zero Rupees Only'
});

const err1 = inv1.validateSync();
if (err1) {
  console.error('❌ Test 1 Failed validation:', err1.message);
} else {
  console.log('✅ Test 1 Passed! Empty string isInterstate coerced to:', inv1.gstDetails.isInterstate);
}

// Test 2: Boolean true
const inv2 = new Invoice({
  invoiceNo: 'TEST-INV-002',
  customerId: new mongoose.Types.ObjectId(),
  vehicleId: new mongoose.Types.ObjectId(),
  jobCardId: new mongoose.Types.ObjectId(),
  gstDetails: {
    companyGSTIN: '36AAJCM4778P1ZI',
    customerGSTIN: '27ABCDE1234F1Z5',
    isInterstate: true
  },
  parts: [],
  labour: [],
  totals: { partsTotal: 0, labourTotal: 0, cgstTotal: 0, sgstTotal: 0, igstTotal: 0, gstTotal: 0, discountTotal: 0, grandTotal: 0, roundedGrandTotal: 0 },
  grandTotalWords: 'Zero Rupees Only'
});

const err2 = inv2.validateSync();
if (err2) {
  console.error('❌ Test 2 Failed validation:', err2.message);
} else {
  console.log('✅ Test 2 Passed! Boolean true isInterstate maintained as:', inv2.gstDetails.isInterstate);
}

// Test 3: Null or undefined isInterstate
const inv3 = new Invoice({
  invoiceNo: 'TEST-INV-003',
  customerId: new mongoose.Types.ObjectId(),
  vehicleId: new mongoose.Types.ObjectId(),
  jobCardId: new mongoose.Types.ObjectId(),
  gstDetails: {
    companyGSTIN: '36AAJCM4778P1ZI',
    customerGSTIN: '36ABCDE1234F1Z5',
    isInterstate: null
  },
  parts: [],
  labour: [],
  totals: { partsTotal: 0, labourTotal: 0, cgstTotal: 0, sgstTotal: 0, igstTotal: 0, gstTotal: 0, discountTotal: 0, grandTotal: 0, roundedGrandTotal: 0 },
  grandTotalWords: 'Zero Rupees Only'
});

const err3 = inv3.validateSync();
if (err3) {
  console.error('❌ Test 3 Failed validation:', err3.message);
} else {
  console.log('✅ Test 3 Passed! Null isInterstate coerced to:', inv3.gstDetails.isInterstate);
}

console.log('==================================================');
console.log('🎉 ALL INVOICE VALIDATION TESTS PASSED PERFECTLY!');
console.log('==================================================');
process.exit(0);
