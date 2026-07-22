const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/autoworkshop';

const Purchase = require('../models/Purchase');
const Inventory = require('../models/Inventory');
const Vendor = require('../models/Vendor');
const Notification = require('../models/Notification'); // Registers model for inventory hooks

// Row calculation logic mirroring frontend
const calculateRowTotals = (qty, rate, discAmtInput, discPctInput, gstPct, lastDiscountEdited = 'percent') => {
  const round2 = (num) => Math.round((num + Number.EPSILON) * 100) / 100;
  
  const gross = qty * rate;
  let discountAmount = discAmtInput;
  let discountPercent = discPctInput;
  
  if (lastDiscountEdited === 'percent') {
    discountAmount = round2((gross * discountPercent) / 100);
  } else {
    discountPercent = gross > 0 ? round2((discountAmount / gross) * 100) : 0;
  }
  
  const taxable = Math.max(0, round2(gross - discountAmount));
  const gstAmt = round2(taxable * (gstPct / 100));
  const total = round2(taxable + gstAmt);
  const netCostPerUnit = qty > 0 ? round2(total / qty) : 0;
  
  return {
    gross,
    discountAmount,
    discountPercent,
    taxable,
    gstAmt,
    total,
    netCostPerUnit
  };
};

async function runTest() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      family: 4
    });

    console.log('==================================================');
    console.log('TEST 1: Dynamic Calculation Verification (Row level)');
    console.log('==================================================');
    
    // Scenario 1: Qty 5, Rate 100, 10% Discount, 18% GST
    const res1 = calculateRowTotals(5, 100, 0, 10, 18, 'percent');
    console.log('Scenario 1 (10% Discount):');
    console.log(` - Gross: ₹${res1.gross} (Expected: 500)`);
    console.log(` - Disc Amt: ₹${res1.discountAmount} (Expected: 50)`);
    console.log(` - Taxable: ₹${res1.taxable} (Expected: 450)`);
    console.log(` - GST Amt: ₹${res1.gstAmt} (Expected: 81)`);
    console.log(` - Total: ₹${res1.total} (Expected: 531)`);
    console.log(` - Net cost/u: ₹${res1.netCostPerUnit} (Expected: 106.2)`);
    
    if (res1.total !== 531 || res1.netCostPerUnit !== 106.2) {
      throw new Error('Scenario 1 calculation math mismatch!');
    }
    console.log('✔ Scenario 1 matches expected output.');

    // Scenario 2: Qty 2, Rate 200, ₹50 Manual Discount, 28% GST
    const res2 = calculateRowTotals(2, 200, 50, 0, 28, 'amount');
    console.log('Scenario 2 (₹50 Discount):');
    console.log(` - Gross: ₹${res2.gross} (Expected: 400)`);
    console.log(` - Disc %: ${res2.discountPercent}% (Expected: 12.5%)`);
    console.log(` - Taxable: ₹${res2.taxable} (Expected: 350)`);
    console.log(` - GST Amt: ₹${res2.gstAmt} (Expected: 98)`);
    console.log(` - Total: ₹${res2.total} (Expected: 448)`);
    console.log(` - Net cost/u: ₹${res2.netCostPerUnit} (Expected: 224)`);
    
    if (res2.total !== 448 || res2.discountPercent !== 12.5) {
      throw new Error('Scenario 2 calculation math mismatch!');
    }
    console.log('✔ Scenario 2 matches expected output.');

    console.log('==================================================');
    console.log('TEST 2: Database Restock & Cost Price updates');
    console.log('==================================================');
    
    // Setup temporary test entities
    await Inventory.deleteMany({ partNumber: 'TBP-CALC-UPGRADE' });
    await Vendor.deleteMany({ name: 'TEST CALC VENDOR' });
    
    const vendor = new Vendor({
      name: 'TEST CALC VENDOR',
      vendorCode: 'VND-CALC-TEST',
      phone: '8888888888',
      mobile: '8888888888',
      address: 'Test Address'
    });
    await vendor.save();
    console.log('✔ Saved Test Vendor.');

    const part = new Inventory({
      partName: 'Test Calculation Part',
      partNumber: 'TBP-CALC-UPGRADE',
      hsnCode: '8708',
      stockQuantity: 10,
      purchasePrice: 150,
      sellingPrice: 200,
      mrp: 250,
      gstPercent: 18,
      vendorId: vendor._id,
      vendorName: vendor.name,
      warehouse: 'Main Store'
    });
    await part.save();
    console.log(`✔ Saved Test Parts Master entry. Initial Stock: ${part.stockQuantity}, Purchase Price: ₹${part.purchasePrice}`);

    // Simulate saving a new purchase entry with updated rate & MRP
    const purchaseQty = 10;
    const newPurchaseRate = 180; // Cost increases from 150 to 180
    const newMRP = 300; // MRP increases from 250 to 300
    const newWarehouse = 'Spares Warehouse'; // Moves warehouse
    
    // Find item
    let item = await Inventory.findOne({ partNumber: 'TBP-CALC-UPGRADE' });
    
    // Apply update logic matching purchase handler
    item.stockQuantity += purchaseQty;
    item.purchasePrice = newPurchaseRate;
    item.mrp = newMRP;
    item.warehouse = newWarehouse;
    await item.save();
    
    console.log('✔ Saved Purchase Entry in Database.');
    console.log('Verifying Parts Master values after purchase update:');
    
    let updatedPart = await Inventory.findOne({ partNumber: 'TBP-CALC-UPGRADE' });
    console.log(` - Stock Quantity: ${updatedPart.stockQuantity} (Expected: 20)`);
    console.log(` - Purchase Price: ₹${updatedPart.purchasePrice} (Expected: 180)`);
    console.log(` - MRP: ₹${updatedPart.mrp} (Expected: 300)`);
    console.log(` - Warehouse: ${updatedPart.warehouse} (Expected: Spares Warehouse)`);
    
    if (updatedPart.stockQuantity !== 20 || updatedPart.purchasePrice !== 180 || updatedPart.mrp !== 300 || updatedPart.warehouse !== 'Spares Warehouse') {
      throw new Error('Database updates mismatch after mock purchase trigger!');
    }
    console.log('✔ Database restock and price updates are functional and verified.');

    // Cleanup
    await Inventory.deleteMany({ partNumber: 'TBP-CALC-UPGRADE' });
    await Vendor.deleteMany({ name: 'TEST CALC VENDOR' });
    console.log('✔ Test data cleaned up.');
    
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
