const express = require('express');
const Purchase = require('../models/Purchase');
const Inventory = require('../models/Inventory');
const Vendor = require('../models/Vendor');
const { auth, restrictTo } = require('../middleware/auth');
const { logAction } = require('../utils/logger');
const router = express.Router();

// Auto-generate Purchase Entry Number
const generatePurchaseNo = async () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const dateStr = `${year}${month}`;
  
  const count = await Purchase.countDocuments();
  const sequence = String(count + 1).padStart(4, '0');
  return `PUR-${dateStr}-${sequence}`;
};

// List all purchases with search & vendor filter
router.get('/', auth, async (req, res) => {
  try {
    const { search, vendorId, paymentStatus } = req.query;
    let query = {};

    if (vendorId) query.vendorId = vendorId;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    if (search) {
      query.$or = [
        { purchaseNo: { $regex: search, $options: 'i' } },
        { invoiceNo: { $regex: search, $options: 'i' } },
        { vendorName: { $regex: search, $options: 'i' } }
      ];
    }

    const purchases = await Purchase.find(query)
      .populate('vendorId')
      .sort({ createdAt: -1 });

    res.send(purchases);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch purchases.' });
  }
});

// Create Purchase Entry (Restocks Inventory & Updates Vendor Balances)
router.post('/', auth, restrictTo('Admin', 'Accounts', 'Spares'), async (req, res) => {
  try {
    const { vendorId, invoiceNo, invoiceDate, items, paymentStatus, amountPaid, notes } = req.body;
    if (!vendorId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).send({ error: 'Vendor ID and at least one purchase item are required.' });
    }

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return res.status(404).send({ error: 'Vendor not found.' });

    const purchaseNo = await generatePurchaseNo();
    const roundToTwo = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

    let subtotal = 0;
    let taxableAmountSum = 0;
    let gstTotalSum = 0;
    let grandTotalSum = 0;

    const processedItems = [];

    for (const item of items) {
      const qty = Math.max(1, Number(item.qty) || 1);
      const purchasePrice = Math.max(0, Number(item.purchasePrice) || 0);
      const sellingPrice = Math.max(0, Number(item.sellingPrice) || purchasePrice);
      const mrp = Math.max(0, Number(item.mrp) || sellingPrice);
      const gstPercent = Number(item.gstPercent) || 18;

      const itemGross = roundToTwo(qty * purchasePrice);
      const itemTaxable = itemGross;
      const itemGst = roundToTwo(itemTaxable * (gstPercent / 100));
      const itemTotal = roundToTwo(itemTaxable + itemGst);

      subtotal += itemGross;
      taxableAmountSum += itemTaxable;
      gstTotalSum += itemGst;
      grandTotalSum += itemTotal;

      let partId = item.partId;

      // Restock existing part or create new inventory item
      let inventoryItem = null;
      if (partId) {
        inventoryItem = await Inventory.findById(partId);
      }
      if (!inventoryItem && item.partNumber) {
        inventoryItem = await Inventory.findOne({ partNumber: item.partNumber.trim() });
      }

      if (inventoryItem) {
        inventoryItem.stockQuantity += qty;
        inventoryItem.purchasePrice = purchasePrice;
        inventoryItem.sellingPrice = sellingPrice;
        inventoryItem.mrp = mrp;
        inventoryItem.vendorId = vendor._id;
        inventoryItem.vendorName = vendor.name;
        await inventoryItem.save();
        partId = inventoryItem._id;
      } else {
        // Create new item
        inventoryItem = new Inventory({
          partName: item.partName,
          partNumber: item.partNumber || `PN-${Date.now()}`,
          hsnCode: item.hsnCode || '8708',
          stockQuantity: qty,
          purchasePrice,
          sellingPrice,
          mrp,
          gstPercent,
          vendorId: vendor._id,
          vendorName: vendor.name
        });
        await inventoryItem.save();
        partId = inventoryItem._id;
      }

      processedItems.push({
        partId,
        partNumber: inventoryItem.partNumber,
        partName: inventoryItem.partName,
        qty,
        purchasePrice,
        sellingPrice,
        mrp,
        gstPercent,
        taxableAmount: itemTaxable,
        gstAmount: itemGst,
        total: itemTotal
      });
    }

    const paidAmt = Number(amountPaid) || 0;
    const finalPaymentStatus = paymentStatus || (paidAmt >= grandTotalSum ? 'Paid' : (paidAmt > 0 ? 'Partially Paid' : 'Unpaid'));

    const purchase = new Purchase({
      purchaseNo,
      vendorId: vendor._id,
      vendorName: vendor.name,
      date: new Date(),
      invoiceNo: invoiceNo || '',
      invoiceDate: invoiceDate ? new Date(invoiceDate) : new Date(),
      items: processedItems,
      totals: {
        subtotal: roundToTwo(subtotal),
        taxableAmount: roundToTwo(taxableAmountSum),
        gstTotal: roundToTwo(gstTotalSum),
        grandTotal: roundToTwo(grandTotalSum)
      },
      paymentStatus: finalPaymentStatus,
      amountPaid: paidAmt,
      notes: notes || '',
      createdBy: req.user ? req.user.name : 'Staff'
    });

    await purchase.save();

    // Update Vendor Purchase Statistics & Outstanding Balance
    vendor.totalPurchaseValue = roundToTwo((vendor.totalPurchaseValue || 0) + grandTotalSum);
    vendor.totalPaidAmount = roundToTwo((vendor.totalPaidAmount || 0) + paidAmt);
    vendor.outstandingBalance = Math.max(0, roundToTwo(vendor.totalPurchaseValue - vendor.totalPaidAmount));
    await vendor.save();

    await logAction(req.user, 'PURCHASE_CREATE', `Created purchase entry ${purchase.purchaseNo} from Vendor ${vendor.name}`, req);
    res.status(201).send(purchase);
  } catch (error) {
    res.status(400).send({ error: 'Failed to record purchase entry: ' + error.message });
  }
});

// Update Vendor Payment for Purchase Entry
router.put('/:id/payment', auth, restrictTo('Admin', 'Accounts'), async (req, res) => {
  try {
    const { amountPaid, paymentStatus } = req.body;
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) return res.status(404).send({ error: 'Purchase entry not found.' });

    const vendor = await Vendor.findById(purchase.vendorId);
    
    const newPaid = Number(amountPaid) || 0;
    const diff = newPaid - purchase.amountPaid;

    purchase.amountPaid = newPaid;
    purchase.paymentStatus = paymentStatus || (newPaid >= purchase.totals.grandTotal ? 'Paid' : (newPaid > 0 ? 'Partially Paid' : 'Unpaid'));
    await purchase.save();

    if (vendor) {
      vendor.totalPaidAmount = Math.max(0, (vendor.totalPaidAmount || 0) + diff);
      vendor.outstandingBalance = Math.max(0, vendor.totalPurchaseValue - vendor.totalPaidAmount);
      await vendor.save();
    }

    await logAction(req.user, 'PURCHASE_PAYMENT_UPDATE', `Updated payment for purchase ${purchase.purchaseNo}`, req);
    res.send(purchase);
  } catch (error) {
    res.status(400).send({ error: 'Failed to update purchase payment: ' + error.message });
  }
});

module.exports = router;
