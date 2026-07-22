const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load env vars
const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/autoworkshop';

const Backlog = require('../models/Backlog');
const Inventory = require('../models/Inventory');
const Vendor = require('../models/Vendor');
const Purchase = require('../models/Purchase');
const Notification = require('../models/Notification'); // Registers model for inventory hooks

async function runTest() {
  try {
    console.log('Connecting to database:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      family: 4
    });

    console.log('Cleaning up existing test data...');
    await Backlog.deleteMany({ vehicleNo: 'AP09XX1234' });
    await Inventory.deleteMany({ partNumber: 'TBP-TEST-BACKLOG' });
    await Vendor.deleteMany({ name: 'TEST BACKLOG VENDOR' });
    await Purchase.deleteMany({ invoiceNo: { $regex: /^RCV-BL-/ } });

    console.log('==================================================');
    console.log('TEST 1: Create Backlog Request');
    console.log('==================================================');
    
    // Generate backlogId using schema logic
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `BL-${year}${month}-`;
    const count = await Backlog.countDocuments({ backlogId: new RegExp('^' + prefix) });
    const sequence = String(count + 1).padStart(4, '0');
    const backlogId = `${prefix}${sequence}`;

    const backlog = new Backlog({
      backlogId,
      vehicleNo: 'AP09XX1234',
      vehicleModel: 'Hyundai i20',
      customerName: 'Kushal Vunnam',
      partNumber: 'TBP-TEST-BACKLOG',
      partName: 'Test Backlog Air Filter',
      brand: 'Hyundai Mobis',
      qty: 5,
      vendorName: 'TEST BACKLOG VENDOR',
      vendorContact: '9848022338',
      poNumber: 'PO-BL-9999',
      expectedDeliveryDate: new Date(Date.now() + 86400000 * 3), // 3 days in future
      priority: 'High',
      remarks: 'Test backlog entry remarks',
      createdBy: 'System Tester'
    });

    await backlog.save();
    console.log('✔ Backlog request saved successfully. ID:', backlog.backlogId);
    
    // Verify it is found
    const saved = await Backlog.findOne({ backlogId: backlog.backlogId });
    if (!saved) throw new Error('Failed to find saved backlog request');
    console.log('✔ Backlog document verification matches. Status:', saved.status);

    console.log('==================================================');
    console.log('TEST 2: Verify Service Advisor Permission Filters');
    console.log('==================================================');
    
    // Simulate Service Advisor filter
    const testAdvisorId = new mongoose.Types.ObjectId();
    const testAdvisorName = 'Advisor Rajesh';
    
    // Create another entry assigned to राजेश
    const secondId = `${prefix}${String(count + 2).padStart(4, '0')}`;
    const backlog2 = new Backlog({
      backlogId: secondId,
      vehicleNo: 'AP09XX1234',
      vehicleModel: 'Suzuki Swift',
      partNumber: 'TBP-TEST-BACKLOG',
      partName: 'Swift Brake Pads',
      qty: 2,
      vendorName: 'TEST BACKLOG VENDOR',
      expectedDeliveryDate: new Date(Date.now() + 86400000 * 3),
      serviceAdvisorId: testAdvisorId,
      serviceAdvisorName: testAdvisorName,
      createdBy: 'Advisor Rajesh'
    });
    await backlog2.save();
    console.log('✔ Saved second backlog for Advisor Rajesh.');

    // Fetch as Service Advisor Rajesh
    const advisorQueries = await Backlog.find({
      $or: [
        { serviceAdvisorId: testAdvisorId },
        { createdBy: testAdvisorName }
      ]
    });
    console.log(`✔ Query result for Advisor Rajesh returned ${advisorQueries.length} record(s).`);
    if (advisorQueries.length !== 1 || advisorQueries[0].backlogId !== secondId) {
      throw new Error(`Advisor filter failed: Expected 1 matching record, got ${advisorQueries.length}`);
    }
    console.log('✔ Role-based search filters are functional and secure.');

    console.log('==================================================');
    console.log('TEST 3: Simulate "Mark as Received" & Restock Trigger');
    console.log('==================================================');
    
    // Check initial stock (should be non-existent/0)
    let initialItem = await Inventory.findOne({ partNumber: 'TBP-TEST-BACKLOG' });
    console.log('Initial Inventory item stock for TBP-TEST-BACKLOG:', initialItem ? initialItem.stockQuantity : 'Item does not exist (0)');
    if (initialItem) throw new Error('Test part should not exist in Inventory before trigger');

    // A. Update backlog status
    saved.status = 'Received';
    saved.receivedDate = new Date();
    saved.lastUpdatedBy = 'System Tester';
    await saved.save();
    console.log('✔ Backlog status updated to Received.');

    // B. Integrate with Parts & Labour Master (Find or Create Inventory Item)
    let vendor = await Vendor.findOne({ name: { $regex: new RegExp('^' + saved.vendorName.trim() + '$', 'i') } });
    if (!vendor) {
      vendor = new Vendor({
        name: saved.vendorName.trim(),
        vendorCode: 'VND-BL-TEST',
        phone: saved.vendorContact || '0000000000',
        mobile: saved.vendorContact || '0000000000',
        address: 'Auto-created via Backlog test'
      });
      await vendor.save();
      console.log('✔ Auto-created Vendor registry code VND-BL-TEST.');
    }

    let inventoryItem = await Inventory.findOne({ partNumber: saved.partNumber.trim() });
    if (inventoryItem) {
      inventoryItem.stockQuantity += saved.qty;
      await inventoryItem.save();
    } else {
      inventoryItem = new Inventory({
        partName: saved.partName,
        partNumber: saved.partNumber,
        hsnCode: '8708',
        stockQuantity: saved.qty,
        purchasePrice: 0,
        sellingPrice: 0,
        mrp: 0,
        gstPercent: 18,
        brand: saved.brand || '',
        vendorId: vendor._id,
        vendorName: vendor.name,
        warehouse: 'Main Store'
      });
      await inventoryItem.save();
      console.log(`✔ Auto-created Parts Master item. Quantity restocked: ${inventoryItem.stockQuantity}`);
    }

    if (inventoryItem.stockQuantity !== saved.qty) {
      throw new Error(`Inventory stock quantity incorrect: expected ${saved.qty}, got ${inventoryItem.stockQuantity}`);
    }
    console.log('✔ Inventory restock successfully executed.');

    // C. Integrate with Purchases (Create history record of the procurement receipt)
    const countPurchases = await Purchase.countDocuments();
    const purchaseNo = `PUR-${year}${month}-${String(countPurchases + 1).padStart(4, '0')}`;
    
    const purchaseEntry = new Purchase({
      purchaseNo,
      vendorId: vendor._id,
      vendorName: vendor.name,
      date: new Date(),
      invoiceNo: `RCV-${saved.backlogId}`,
      invoiceDate: new Date(),
      items: [{
        partId: inventoryItem._id,
        partNumber: inventoryItem.partNumber,
        partName: inventoryItem.partName,
        hsnCode: inventoryItem.hsnCode || '8708',
        warehouse: inventoryItem.warehouse || 'Main Store',
        qty: saved.qty,
        purchasePrice: 0,
        sellingPrice: inventoryItem.sellingPrice,
        mrp: inventoryItem.mrp,
        gstPercent: 18,
        taxableAmount: 0,
        gstAmount: 0,
        total: 0
      }],
      totals: {
        totalQty: saved.qty,
        subtotal: 0,
        totalDiscount: 0,
        taxableAmount: 0,
        gstTotal: 0,
        grandTotal: 0
      },
      paymentStatus: 'Paid',
      amountPaid: 0,
      notes: `Received from Backlog Request ${saved.backlogId}`,
      createdBy: 'System Tester'
    });

    await purchaseEntry.save();
    console.log('✔ Logged Restock event in Purchases collection. Purchase No:', purchaseEntry.purchaseNo);

    // Verify purchase document is recorded
    const savedPurchase = await Purchase.findOne({ purchaseNo: purchaseEntry.purchaseNo });
    if (!savedPurchase) throw new Error('Purchase history registry missing');
    console.log('✔ Purchase History document verification matches.');

    console.log('==================================================');
    console.log('CLEANING UP TEST DATA...');
    console.log('==================================================');
    await Backlog.deleteMany({ vehicleNo: 'AP09XX1234' });
    await Inventory.deleteMany({ partNumber: 'TBP-TEST-BACKLOG' });
    await Vendor.deleteMany({ name: 'TEST BACKLOG VENDOR' });
    await Purchase.deleteMany({ invoiceNo: { $regex: /^RCV-BL-/ } });
    console.log('✔ Test data cleaned up successfully.');

    await mongoose.connection.close();
    console.log('✔ Database connection closed. Test completed with SUCCESS!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed with error:', err);
    try {
      await mongoose.connection.close();
    } catch (_) {}
    process.exit(1);
  }
}

runTest();
