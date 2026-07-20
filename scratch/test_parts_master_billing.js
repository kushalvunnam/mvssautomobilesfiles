const path = require('path');
module.paths.push(path.join(__dirname, '../backend/node_modules'));

const http = require('http');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'autoworkshop_secret_key_123';
process.env.PORT = '5099';

const { JWT_SECRET } = require('../backend/middleware/auth');
const User = require('../backend/models/User');

console.log('--- Starting Parts Master Billing Upgrade Test Suite ---');

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch(e) {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: json,
          text: data
        });
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  const app = require('../backend/server');
  await new Promise(r => setTimeout(r, 1500));

  const adminToken = jwt.sign({ _id: '507f1f77bcf86cd799439011', role: 'Admin' }, JWT_SECRET);

  User.findOne = async () => ({
    _id: '507f1f77bcf86cd799439011',
    name: 'Test Admin',
    role: 'Admin',
    active: true
  });

  const baseHeaders = {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  };

  console.log('\n[TEST 1] Create Spare Part with Billing Calculations');
  const sparePart = {
    type: 'Part',
    partName: 'Brake Pad Set - Swift DDiS Front',
    partNumber: 'SP-BRK-SWIFT-01',
    alias: 'OEM-55810-M74L00',
    hsnCode: '8708',
    category: 'Brakes',
    brand: 'TVS Girling',
    purchasePrice: 1000,
    marginPercent: 20,
    sellingPrice: 1200,
    gstPercent: 18,
    chargeAmount: 1416,
    mrp: 1500,
    stockQuantity: 25,
    lowStockThreshold: 5,
    unit: 'Set',
    warehouse: 'Main Store',
    locationRack: 'Rack B-2'
  };

  let res = await makeRequest({
    hostname: 'localhost',
    port: 5099,
    path: '/api/inventory',
    method: 'POST',
    headers: baseHeaders
  }, sparePart);

  console.log('Status:', res.status);
  console.log('Response:', res.body ? res.body.partName || res.body._id : res.text);
  if ((res.status === 201 || res.status === 200) && (res.body._id || res.body.partNumber)) {
    console.log('✅ TEST 1 PASSED: Spare Part created successfully with HSN & Billing values.');
  } else {
    console.error('❌ TEST 1 FAILED!');
    process.exit(1);
  }

  const createdPartId = res.body._id;

  console.log('\n[TEST 2] Create Labour Service Master Entry');
  const labourItem = {
    type: 'Labour',
    partName: 'Engine Overhaul Labour Service',
    partNumber: 'LBR-ENG-OVH-01',
    hsnCode: '9987',
    category: 'Labour Service',
    purchasePrice: 3000,
    marginPercent: 50,
    sellingPrice: 4500,
    gstPercent: 18,
    chargeAmount: 5310,
    mrp: 6000,
    stockQuantity: 999,
    lowStockThreshold: 1,
    unit: 'Job',
    warehouse: 'Main Store'
  };

  res = await makeRequest({
    hostname: 'localhost',
    port: 5099,
    path: '/api/inventory',
    method: 'POST',
    headers: baseHeaders
  }, labourItem);

  console.log('Status:', res.status);
  console.log('Response:', res.body ? res.body.partName : res.text);
  if ((res.status === 201 || res.status === 200) && (res.body._id || res.body.partNumber)) {
    console.log('✅ TEST 2 PASSED: Labour Service Master entry created successfully.');
  } else {
    console.error('❌ TEST 2 FAILED!');
    process.exit(1);
  }

  console.log('\n[TEST 3] Edit Spare Part Billing Details');
  res = await makeRequest({
    hostname: 'localhost',
    port: 5099,
    path: `/api/inventory/${createdPartId}`,
    method: 'PUT',
    headers: baseHeaders
  }, {
    sellingPrice: 1300,
    gstPercent: 18,
    chargeAmount: 1534
  });

  console.log('Status:', res.status);
  console.log('Updated Selling Price:', res.body ? res.body.sellingPrice : null);
  if (res.status === 200 && res.body && res.body.sellingPrice === 1300) {
    console.log('✅ TEST 3 PASSED: Spare Part billing details updated successfully.');
  } else {
    console.error('❌ TEST 3 FAILED!');
    process.exit(1);
  }

  console.log('\n==================================================');
  console.log('🎉 ALL PARTS MASTER BILLING TESTS PASSED!');
  console.log('==================================================');
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
