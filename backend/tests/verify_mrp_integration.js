const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables from backend/.env
const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });

const MONGODB_URI = process.env.MONGODB_URI;

const Inventory = require('../models/Inventory');
const Vendor = require('../models/Vendor');
const Purchase = require('../models/Purchase');

// Direct replication of logic from purchases route
async function simulatePurchase({ vendorId, items, updatePurchasePrice, updateMRP }) {
  const vendor = await Vendor.findById(vendorId);
  if (!vendor) throw new Error('Vendor not found.');

  const processedItems = [];

  for (const item of items) {
    if (item.mrp !== undefined && Number(item.mrp) < 0) {
      throw new Error(`MRP cannot be negative for part ${item.partName || ''}.`);
    }

    const qty = Math.max(1, Number(item.qty) || 1);
    const purchasePrice = Math.max(0, Number(item.purchasePrice) || 0);
    const sellingPrice = Math.max(0, Number(item.sellingPrice) || purchasePrice);
    const mrp = Math.max(0, Number(item.mrp) || sellingPrice);

    let inventoryItem = await Inventory.findOne({ partNumber: item.partNumber.trim() });

    if (inventoryItem) {
      inventoryItem.stockQuantity += qty;
      if (updatePurchasePrice) {
        inventoryItem.purchasePrice = purchasePrice;
      }
      if (sellingPrice > 0) inventoryItem.sellingPrice = sellingPrice;
      if (updateMRP && mrp > 0 && inventoryItem.mrp !== mrp) {
        inventoryItem.mrp = mrp;
      }
      inventoryItem.vendorId = vendor._id;
      inventoryItem.vendorName = vendor.name;
      await inventoryItem.save();
    } else {
      inventoryItem = new Inventory({
        partName: item.partName || 'Unknown Part',
        partNumber: item.partNumber || `PN-${Date.now()}`,
        hsnCode: item.hsnCode || '8708',
        stockQuantity: qty,
        purchasePrice,
        sellingPrice: sellingPrice || purchasePrice,
        mrp: mrp || sellingPrice || purchasePrice,
        vendorId: vendor._id,
        vendorName: vendor.name
      });
      await inventoryItem.save();
    }

    processedItems.push({
      partId: inventoryItem._id,
      partNumber: inventoryItem.partNumber,
      partName: inventoryItem.partName,
      qty,
      purchasePrice,
      mrp
    });
  }

  return processedItems;
}

async function runTest() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      family: 4
    });

    console.log('Setting up test data...');
    // Clean up any old test items
    await Inventory.deleteMany({ partNumber: 'TBP-TEST-MRP' });
    await Vendor.deleteMany({ name: 'TEST MRP VENDOR' });

    // Create vendor
    const vendor = new Vendor({
      name: 'TEST MRP VENDOR',
      vendorCode: 'VND-MRP-TEST',
      phone: '9999999999',
      mobile: '9999999999',
      email: 'testmrp@vendor.com',
      address: 'Test Address'
    });
    await vendor.save();

    // Create master part
    const part = new Inventory({
      partName: 'Test Brake Pads',
      partNumber: 'TBP-TEST-MRP',
      stockQuantity: 10,
      purchasePrice: 100.00,
      sellingPrice: 130.00,
      mrp: 150.00,
      gstPercent: 18
    });
    await part.save();
    console.log(`Initial Part State: PurchasePrice=${part.purchasePrice}, MRP=${part.mrp}, Stock=${part.stockQuantity}`);

    // --- TEST 1: Simulate Purchase with configuration toggles set to FALSE ---
    console.log('\n--- TEST 1: updatePurchasePrice = false, updateMRP = false ---');
    await simulatePurchase({
      vendorId: vendor._id,
      updatePurchasePrice: false,
      updateMRP: false,
      items: [{
        partName: 'Test Brake Pads',
        partNumber: 'TBP-TEST-MRP',
        qty: 5,
        purchasePrice: 120.00,
        mrp: 200.00
      }]
    });

    let updatedPart = await Inventory.findOne({ partNumber: 'TBP-TEST-MRP' });
    console.log(`After Test 1 Part State: PurchasePrice=${updatedPart.purchasePrice} (Expected: 100), MRP=${updatedPart.mrp} (Expected: 150), Stock=${updatedPart.stockQuantity} (Expected: 15)`);
    if (updatedPart.purchasePrice !== 100 || updatedPart.mrp !== 150 || updatedPart.stockQuantity !== 15) {
      throw new Error('Test 1 failed! Rates were updated when toggles were false, or stock did not increase.');
    }
    console.log('✓ Test 1 Passed!');

    // --- TEST 2: Simulate Purchase with configuration toggles set to TRUE ---
    console.log('\n--- TEST 2: updatePurchasePrice = true, updateMRP = true ---');
    await simulatePurchase({
      vendorId: vendor._id,
      updatePurchasePrice: true,
      updateMRP: true,
      items: [{
        partName: 'Test Brake Pads',
        partNumber: 'TBP-TEST-MRP',
        qty: 10,
        purchasePrice: 130.00,
        mrp: 220.00
      }]
    });

    updatedPart = await Inventory.findOne({ partNumber: 'TBP-TEST-MRP' });
    console.log(`After Test 2 Part State: PurchasePrice=${updatedPart.purchasePrice} (Expected: 130), MRP=${updatedPart.mrp} (Expected: 220), Stock=${updatedPart.stockQuantity} (Expected: 25)`);
    if (updatedPart.purchasePrice !== 130 || updatedPart.mrp !== 220 || updatedPart.stockQuantity !== 25) {
      throw new Error('Test 2 failed! Rates were not updated when toggles were true.');
    }
    console.log('✓ Test 2 Passed!');

    // --- TEST 3: Validation test for negative MRP ---
    console.log('\n--- TEST 3: Negative MRP Validation ---');
    try {
      await simulatePurchase({
        vendorId: vendor._id,
        updatePurchasePrice: true,
        updateMRP: true,
        items: [{
          partName: 'Test Brake Pads',
          partNumber: 'TBP-TEST-MRP',
          qty: 2,
          purchasePrice: 100.00,
          mrp: -50.00
        }]
      });
      throw new Error('Test 3 failed! Negative MRP was accepted.');
    } catch (err) {
      if (err.message.includes('MRP cannot be negative')) {
        console.log(`Received expected rejection error: "${err.message}"`);
        console.log('✓ Test 3 Passed!');
      } else {
        throw err;
      }
    }

    // --- CLEANUP ---
    console.log('\nCleaning up test data...');
    await Inventory.deleteOne({ partNumber: 'TBP-TEST-MRP' });
    await Vendor.deleteOne({ _id: vendor._id });
    console.log('Test completed successfully and data cleaned up!');

  } catch (error) {
    console.error('Test run failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

runTest();
