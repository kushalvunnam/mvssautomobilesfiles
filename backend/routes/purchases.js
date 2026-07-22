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
router.use(auth, restrictTo('Admin', 'Spares'));

// List all purchases with search & vendor filter
router.get('/', async (req, res) => {
  try {
    const { search, vendorId, paymentStatus } = req.query;
    let query = {};

    if (vendorId) query.vendorId = vendorId;
    if (paymentStatus) {
      if (paymentStatus === 'Unpaid') {
        query.paymentStatus = 'Credit';
      } else {
        query.paymentStatus = paymentStatus;
      }
    }

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
router.post('/', async (req, res) => {
  try {
    const { vendorId, invoiceNo, invoiceDate, items, paymentStatus, amountPaid, notes } = req.body;
    if (!vendorId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).send({ error: 'Vendor ID and at least one purchase item are required.' });
    }

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return res.status(404).send({ error: 'Vendor not found.' });

    const purchaseNo = await generatePurchaseNo();
    const roundToTwo = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

    let totalQtySum = 0;
    let subtotalSum = 0;
    let totalDiscountSum = 0;
    let taxableAmountSum = 0;
    let gstTotalSum = 0;
    let grandTotalSum = 0;

    const processedItems = [];

    for (const item of items) {
      const qty = Math.max(1, Number(item.qty) || 1);
      const purchasePrice = Math.max(0, Number(item.purchasePrice) || 0);
      const sellingPrice = Math.max(0, Number(item.sellingPrice) || purchasePrice);
      const mrp = Math.max(0, Number(item.mrp) || sellingPrice);
      
      const grossItemValue = roundToTwo(qty * purchasePrice);
      
      let discountPercent = Math.max(0, Math.min(100, Number(item.discountPercent) || 0));
      let discountAmount = Math.max(0, Number(item.discountAmount) || 0);

      if (item.discountAmount !== undefined && item.discountAmount !== '' && Number(item.discountAmount) > 0) {
        discountAmount = roundToTwo(Number(item.discountAmount));
        discountPercent = grossItemValue > 0 ? roundToTwo((discountAmount / grossItemValue) * 100) : 0;
      } else if (discountPercent > 0) {
        discountAmount = roundToTwo(grossItemValue * (discountPercent / 100));
      }

      const itemTaxable = Math.max(0, roundToTwo(grossItemValue - discountAmount));
      const gstPercent = Number(item.gstPercent) !== undefined ? Number(item.gstPercent) : 18;
      const itemGst = roundToTwo(itemTaxable * (gstPercent / 100));
      const itemTotal = roundToTwo(itemTaxable + itemGst);

      totalQtySum += qty;
      subtotalSum += grossItemValue;
      totalDiscountSum += discountAmount;
      taxableAmountSum += itemTaxable;
      gstTotalSum += itemGst;
      grandTotalSum += itemTotal;

      let partId = item.partId;
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
        if (sellingPrice > 0) inventoryItem.sellingPrice = sellingPrice;
        if (mrp > 0) inventoryItem.mrp = mrp;
        inventoryItem.vendorId = vendor._id;
        inventoryItem.vendorName = vendor.name;
        if (gstPercent !== undefined) inventoryItem.gstPercent = gstPercent;
        await inventoryItem.save();
        partId = inventoryItem._id;
      } else {
        inventoryItem = new Inventory({
          partName: item.partName || 'Unknown Part',
          partNumber: item.partNumber || `PN-${Date.now()}`,
          hsnCode: item.hsnCode || '8708',
          stockQuantity: qty,
          purchasePrice,
          sellingPrice: sellingPrice || purchasePrice,
          mrp: mrp || sellingPrice || purchasePrice,
          gstPercent,
          vendorId: vendor._id,
          vendorName: vendor.name,
          warehouse: item.warehouse || 'Main Store'
        });
        await inventoryItem.save();
        partId = inventoryItem._id;
      }

      processedItems.push({
        partId,
        partNumber: inventoryItem.partNumber,
        partName: inventoryItem.partName,
        hsnCode: item.hsnCode || inventoryItem.hsnCode || '8708',
        warehouse: item.warehouse || inventoryItem.warehouse || 'Main Store',
        qty,
        purchasePrice,
        sellingPrice,
        mrp,
        discountPercent,
        discountAmount,
        gstPercent,
        taxableAmount: itemTaxable,
        gstAmount: itemGst,
        total: itemTotal
      });
    }

    const paidAmt = Number(amountPaid) || 0;
    let rawStatus = paymentStatus || (paidAmt >= grandTotalSum ? 'Paid' : (paidAmt > 0 ? 'Partially Paid' : 'Credit'));
    if (rawStatus === 'Unpaid') rawStatus = 'Credit';

    const purchase = new Purchase({
      purchaseNo,
      vendorId: vendor._id,
      vendorName: vendor.name,
      date: new Date(),
      invoiceNo: invoiceNo || '',
      invoiceDate: invoiceDate ? new Date(invoiceDate) : new Date(),
      items: processedItems,
      totals: {
        totalQty: totalQtySum,
        subtotal: roundToTwo(subtotalSum),
        totalDiscount: roundToTwo(totalDiscountSum),
        taxableAmount: roundToTwo(taxableAmountSum),
        gstTotal: roundToTwo(gstTotalSum),
        grandTotal: roundToTwo(grandTotalSum)
      },
      paymentStatus: rawStatus,
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

    await logAction(req.user, 'PURCHASE_CREATE', `Created purchase entry ${purchase.purchaseNo} with ${processedItems.length} parts from Vendor ${vendor.name}`, req);
    res.status(201).send(purchase);
  } catch (error) {
    res.status(400).send({ error: 'Failed to record purchase entry: ' + error.message });
  }
});

// Update Vendor Payment for Purchase Entry
router.put('/:id/payment', async (req, res) => {
  try {
    let { amountPaid, paymentStatus } = req.body;
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) return res.status(404).send({ error: 'Purchase entry not found.' });

    const vendor = await Vendor.findById(purchase.vendorId);
    
    const newPaid = Number(amountPaid) || 0;
    const diff = newPaid - purchase.amountPaid;

    if (paymentStatus === 'Unpaid') paymentStatus = 'Credit';

    purchase.amountPaid = newPaid;
    purchase.paymentStatus = paymentStatus || (newPaid >= purchase.totals.grandTotal ? 'Paid' : (newPaid > 0 ? 'Partially Paid' : 'Credit'));
    await purchase.save();

    if (vendor) {
      vendor.totalPaidAmount = Math.max(0, (vendor.totalPaidAmount || 0) + diff);
      vendor.outstandingBalance = Math.max(0, vendor.totalPurchaseValue - vendor.totalPaidAmount);
      await vendor.save();
    }

    await logAction(req.user, 'PURCHASE_PAYMENT_UPDATE', `Updated payment for purchase entry ${purchase.purchaseNo}: Amount Paid ₹${newPaid}, Status: ${purchase.paymentStatus}`, req);
    res.send(purchase);
  } catch (error) {
    res.status(400).send({ error: 'Failed to update purchase payment: ' + error.message });
  }
});

module.exports = router;
