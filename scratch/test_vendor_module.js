const path = require('path');
module.paths.push(path.join(__dirname, '../backend/node_modules'));

const http = require('http');
const jwt = require('jsonwebtoken');

// Set environment for in-memory testing
process.env.JWT_SECRET = 'autoworkshop_secret_key_123';
process.env.MONGODB_URI = 'mongodb://localhost:27017/autoworkshop_test_vendor';
process.env.PORT = '5099';

const { JWT_SECRET } = require('../backend/middleware/auth');
const User = require('../backend/models/User');

console.log('--- Starting Vendor Management & API Error Handling Test Suite ---');

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
  const server = require('../backend/server');
  
  // Wait 1.5 sec for server startup
  await new Promise(r => setTimeout(r, 1500));

  const adminToken = jwt.sign({ _id: '507f1f77bcf86cd799439011', role: 'Admin' }, JWT_SECRET);

  // Mock User.findOne
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

  console.log('\n[TEST 1] GET /api/vendors - Fetch Vendor List');
  let res = await makeRequest({
    hostname: 'localhost',
    port: 5099,
    path: '/api/vendors',
    method: 'GET',
    headers: baseHeaders
  });

  console.log('Status:', res.status);
  console.log('Content-Type:', res.headers['content-type']);
  console.log('Response Body:', res.body);
  if (res.status === 200 && res.body.success === true && Array.isArray(res.body.vendors)) {
    console.log('✅ TEST 1 PASSED: GET /api/vendors returned valid JSON list & stats.');
  } else {
    console.error('❌ TEST 1 FAILED!');
    process.exit(1);
  }

  console.log('\n[TEST 2] POST /api/vendors - Create New Vendor');
  const newVendor = {
    name: 'Bosch Automotive Components',
    category: 'Spares',
    type: 'Authorized Distributor',
    mobile: '9876543210',
    email: 'contact@bosch-auto.in',
    gstNumber: '36AAACB1234A1Z5',
    address: 'Phase 2, HITEC City, Hyderabad',
    paymentTerms: 'Net 30'
  };

  res = await makeRequest({
    hostname: 'localhost',
    port: 5099,
    path: '/api/vendors',
    method: 'POST',
    headers: baseHeaders
  }, newVendor);

  console.log('Status:', res.status);
  console.log('Response Body:', res.body);
  if ((res.status === 201 || res.status === 200) && res.body.success === true && res.body.vendor) {
    console.log('✅ TEST 2 PASSED: Vendor created successfully with code:', res.body.vendor.vendorCode);
  } else {
    console.error('❌ TEST 2 FAILED!');
    process.exit(1);
  }

  const createdVendorId = res.body.vendor._id;

  console.log('\n[TEST 3] GET /api/vendors?search=Bosch - Search Vendor');
  res = await makeRequest({
    hostname: 'localhost',
    port: 5099,
    path: '/api/vendors?search=Bosch',
    method: 'GET',
    headers: baseHeaders
  });

  console.log('Search Results Count:', res.body.vendors ? res.body.vendors.length : 0);
  if (res.status === 200 && res.body.vendors && res.body.vendors.some(v => v.name.includes('Bosch'))) {
    console.log('✅ TEST 3 PASSED: Search returned created vendor.');
  } else {
    console.error('❌ TEST 3 FAILED!');
    process.exit(1);
  }

  console.log('\n[TEST 4] PUT /api/vendors/:id - Update Vendor');
  res = await makeRequest({
    hostname: 'localhost',
    port: 5099,
    path: `/api/vendors/${createdVendorId}`,
    method: 'PUT',
    headers: baseHeaders
  }, { name: 'Bosch Automotive Pvt Ltd', paymentTerms: 'Net 45' });

  console.log('Status:', res.status);
  console.log('Updated Name:', res.body.vendor ? res.body.vendor.name : null);
  if (res.status === 200 && res.body.success === true && res.body.vendor.name === 'Bosch Automotive Pvt Ltd') {
    console.log('✅ TEST 4 PASSED: Vendor updated successfully.');
  } else {
    console.error('❌ TEST 4 FAILED!');
    process.exit(1);
  }

  console.log('\n[TEST 5] DELETE /api/vendors/:id - Delete Vendor');
  res = await makeRequest({
    hostname: 'localhost',
    port: 5099,
    path: `/api/vendors/${createdVendorId}`,
    method: 'DELETE',
    headers: baseHeaders
  });

  console.log('Status:', res.status);
  console.log('Response Body:', res.body);
  if (res.status === 200 && res.body.success === true) {
    console.log('✅ TEST 5 PASSED: Vendor deleted successfully.');
  } else {
    console.error('❌ TEST 5 FAILED!');
    process.exit(1);
  }

  console.log('\n[TEST 6] GET /api/inventory?lowStock=true - Low Stock Inventory Endpoint');
  res = await makeRequest({
    hostname: 'localhost',
    port: 5099,
    path: '/api/inventory?lowStock=true',
    method: 'GET',
    headers: baseHeaders
  });

  console.log('Status:', res.status);
  console.log('Content-Type:', res.headers['content-type']);
  if (res.status === 200 && (Array.isArray(res.body) || res.body.success !== undefined)) {
    console.log('✅ TEST 6 PASSED: GET /api/inventory?lowStock=true returned valid JSON.');
  } else {
    console.error('❌ TEST 6 FAILED!');
    process.exit(1);
  }

  console.log('\n[TEST 7] POST /api/nonexistent-route - Verify JSON 404 Handling (No HTML!)');
  res = await makeRequest({
    hostname: 'localhost',
    port: 5099,
    path: '/api/nonexistent-route',
    method: 'POST',
    headers: baseHeaders
  }, { dummy: 1 });

  console.log('Status:', res.status);
  console.log('Content-Type:', res.headers['content-type']);
  console.log('Response Body:', res.body);
  if (res.status === 404 && res.headers['content-type'].includes('application/json') && res.body.success === false) {
    console.log('✅ TEST 7 PASSED: Non-existent API route returned 404 JSON, NOT HTML!');
  } else {
    console.error('❌ TEST 7 FAILED! Received HTML instead of JSON!');
    process.exit(1);
  }

  console.log('\n==================================================');
  console.log('🎉 ALL 7 VENDOR & API ROUTE TESTS PASSED SUCCESSFULLY!');
  console.log('==================================================');

  process.exit(0);
}

runTests().catch(err => {
  console.error('Test Suite Failed with Exception:', err);
  process.exit(1);
});
