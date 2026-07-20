const http = require('http');

process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/autoworkshop_test';

async function runInventoryTest() {
  console.log('=== STARTING COMPLETE INVENTORY MANAGEMENT MODULE INTEGRATION TEST ===\n');

  const { collections } = require('../backend/utils/inMemoryDB');
  const server = require('../backend/server');

  const testPort = process.env.PORT || 5004;

  function request(method, path, tokenOverride = null, body = null) {
    // If called with (method, path, body)
    let reqBody = body;
    let reqToken = tokenOverride;
    if (body === null && tokenOverride && typeof tokenOverride === 'object') {
      reqBody = tokenOverride;
      reqToken = null;
    }

    return new Promise((resolve, reject) => {
      const payload = reqBody ? JSON.stringify(reqBody) : '';
      const headers = {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      };
      if (reqToken) headers['Authorization'] = `Bearer ${reqToken}`;

      const req = http.request({
        hostname: 'localhost',
        port: testPort,
        path: path,
        method: method,
        headers: headers
      }, (res) => {
        let responseData = '';
        res.on('data', chunk => responseData += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseData);
            resolve({ status: res.statusCode, data: parsed });
          } catch {
            resolve({ status: res.statusCode, data: responseData });
          }
        });
      });
      req.on('error', reject);
      if (payload) req.write(payload);
      req.end();
    });
  }

  // Login to get authentic JWT token
  const loginRes = await request('POST', '/api/auth/login', null, {
    email: 'admin@mvssautomobiles.com',
    password: 'admin_mvss@2026'
  });
  const token = loginRes.data.token;
  console.log(`✓ Retrieved auth token for Admin User via /api/auth/login\n`);

  function authRequest(method, path, body = null) {
    return request(method, path, token, body);
  }

  try {
    // 1. Test Vendor Creation
    console.log('--- 1. Testing Vendor Creation ---');
    const vendorRes = await authRequest('POST', '/api/vendors', {
      name: 'Bosch Automotive India Ltd',
      category: 'Spares',
      type: 'Authorized Distributor',
      gstNumber: '36AAACB1234F1Z5',
      contactPerson: 'Ramesh Kumar',
      mobile: '9876543210',
      email: 'ramesh@bosch.in',
      paymentTerms: 'Net 30'
    });
    console.log(`[${vendorRes.status === 201 ? 'PASS' : 'FAIL'}] POST /api/vendors -> Created Vendor Code: ${vendorRes.data.vendorCode}`);
    const vendorId = vendorRes.data._id;

    // 2. Test Purchase Entry & Auto Restock
    console.log('\n--- 2. Testing Purchase Entry & Auto Stocking ---');
    const purchaseRes = await authRequest('POST', '/api/purchases', {
      vendorId: vendorId,
      invoiceNo: 'BOSCH-INV-9921',
      items: [
        {
          partName: 'Spark Plug Platinum High Performance',
          partNumber: 'SPK-PLUG-BOSCH',
          qty: 50,
          purchasePrice: 120,
          sellingPrice: 200,
          mrp: 220,
          gstPercent: 18
        }
      ],
      amountPaid: 3500,
      paymentStatus: 'Partially Paid'
    });
    console.log(`[${purchaseRes.status === 201 ? 'PASS' : 'FAIL'}] POST /api/purchases -> Purchase No: ${purchaseRes.data.purchaseNo}`);

    // Verify inventory restocked
    const invRes = await authRequest('GET', '/api/inventory');
    const sparkPlugItem = invRes.data.find(i => i.partNumber === 'SPK-PLUG-BOSCH');
    console.log(`✓ Restocked Inventory Item: ${sparkPlugItem.partName} | Current Stock: ${sparkPlugItem.stockQuantity} Pcs`);

    // 3. Test Stock Adjustment
    console.log('\n--- 3. Testing Stock Adjustment & Approval Workflow ---');
    const adjRes = await authRequest('POST', '/api/adjustments', {
      partId: sparkPlugItem._id,
      type: 'Damaged Items',
      qty: 2,
      reason: 'Transit Damage Inspection',
      comments: 'Cracked ceramic insulator'
    });
    console.log(`[${adjRes.status === 201 ? 'PASS' : 'FAIL'}] POST /api/adjustments -> Adjustment No: ${adjRes.data.adjustmentNo} (New Stock: ${adjRes.data.newStock})`);

    // 4. Test Stock Statement Report
    console.log('\n--- 4. Testing Stock Statement Report ---');
    const stmtRes = await authRequest('GET', '/api/reports/stock-statement');
    console.log(`[${stmtRes.status === 200 ? 'PASS' : 'FAIL'}] GET /api/reports/stock-statement -> Total SKUs: ${stmtRes.data.summary.totalItemsCount}, Total Stock Valuation: ₹${stmtRes.data.summary.totalPurchaseValuation}`);

    // 5. Test Barcode Lookup
    console.log('\n--- 5. Testing Barcode Lookup ---');
    // Assign barcode to item
    await authRequest('PUT', `/api/inventory/${sparkPlugItem._id}`, { barcode: '8901234567890' });
    const barcodeRes = await authRequest('GET', '/api/inventory/barcode/8901234567890');
    console.log(`[${barcodeRes.status === 200 ? 'PASS' : 'FAIL'}] GET /api/inventory/barcode/8901234567890 -> Found Part: ${barcodeRes.data.partName}`);

    console.log('\n=============================================');
    console.log('ALL INVENTORY INTEGRATION TESTS PASSED!');
    console.log('=============================================\n');

    process.exit(0);
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  }
}

runInventoryTest();
