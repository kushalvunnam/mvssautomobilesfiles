const express = require('express');
const Inventory = require('../models/Inventory');
const Vendor = require('../models/Vendor');
const Purchase = require('../models/Purchase');
const StockAdjustment = require('../models/StockAdjustment');
const Invoice = require('../models/Invoice');
const { auth } = require('../middleware/auth');
const router = express.Router();

// 1. Stock Valuation & Statement Report
router.get('/stock-statement', auth, async (req, res) => {
  try {
    const { warehouse, brand, category, movementSpeed, stockAlert, search } = req.query;
    let query = {};

    if (warehouse) query.warehouse = warehouse;
    if (brand) query.brand = brand;
    if (category) query.category = category;
    if (movementSpeed) query.movementSpeed = movementSpeed;

    if (search) {
      query.$or = [
        { partName: { $regex: search, $options: 'i' } },
        { partNumber: { $regex: search, $options: 'i' } },
        { partCode: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
        { hsnCode: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { locationRack: { $regex: search, $options: 'i' } },
        { warehouse: { $regex: search, $options: 'i' } }
      ];
    }

    let items = await Inventory.find(query).sort({ partName: 1 });

    if (stockAlert === 'low') {
      items = items.filter(i => i.stockQuantity <= i.lowStockThreshold && i.stockQuantity > 0);
    } else if (stockAlert === 'out') {
      items = items.filter(i => i.stockQuantity === 0);
    } else if (stockAlert === 'negative') {
      items = items.filter(i => i.stockQuantity < 0);
    }

    // Compute valuation statistics
    const roundToTwo = num => Math.round((num + Number.EPSILON) * 100) / 100;
    let totalItemsCount = items.length;
    let totalStockQty = 0;
    let totalPurchaseValuation = 0;
    let totalSellingValuation = 0;
    let totalMrpValuation = 0;

    const statementData = items.map(item => {
      const qty = item.stockQuantity || 0;
      const purchaseVal = roundToTwo(qty * (item.purchasePrice || 0));
      const sellingVal = roundToTwo(qty * (item.sellingPrice || 0));
      const mrpVal = roundToTwo(qty * (item.mrp || item.sellingPrice || 0));

      totalStockQty += qty;
      totalPurchaseValuation += purchaseVal;
      totalSellingValuation += sellingVal;
      totalMrpValuation += mrpVal;

      return {
        _id: item._id,
        partCode: item.partCode || item.partNumber,
        partNumber: item.partNumber,
        barcode: item.barcode || 'N/A',
        partName: item.partName,
        type: item.type || 'Part',
        brand: item.brand || 'N/A',
        category: item.category || 'General',
        hsnCode: item.hsnCode || '8708',
        gstPercent: item.gstPercent || 18,
        purchasePrice: item.purchasePrice || 0,
        sellingPrice: item.sellingPrice || 0,
        mrp: item.mrp || item.sellingPrice || 0,
        marginPercent: item.marginPercent || 0,
        warehouse: item.warehouse || 'Main Store',
        locationRack: item.locationRack || 'A1',
        currentStock: qty,
        reservedStock: item.reservedStock || 0,
        availableStock: Math.max(0, qty - (item.reservedStock || 0)),
        minimumStock: item.minimumStock || item.lowStockThreshold || 5,
        maximumStock: item.maxStock || 100,
        reorderLevel: item.reorderLevel || 5,
        unit: item.unit || 'Pcs',
        vendorName: item.vendorName || item.supplier || 'N/A',
        stockValue: purchaseVal,
        sellingValue: sellingVal,
        status: item.status || (qty === 0 ? 'Out of Stock' : 'Active')
      };
    });

    res.send({
      summary: {
        totalItemsCount,
        totalStockQty,
        totalPurchaseValuation: roundToTwo(totalPurchaseValuation),
        totalSellingValuation: roundToTwo(totalSellingValuation),
        totalMrpValuation: roundToTwo(totalMrpValuation)
      },
      items: statementData
    });
  } catch (error) {
    res.status(500).send({ error: 'Failed to generate stock statement report: ' + error.message });
  }
});

// 2. Vendor Summary & Ledger Report
router.get('/vendor-ledger', auth, async (req, res) => {
  try {
    const vendors = await Vendor.find().sort({ name: 1 });
    const purchases = await Purchase.find().sort({ createdAt: -1 });

    const vendorReport = vendors.map(v => {
      const vPurchases = purchases.filter(p => p.vendorId && p.vendorId.toString() === v._id.toString());
      return {
        _id: v._id,
        vendorCode: v.vendorCode,
        name: v.name,
        category: v.category,
        type: v.type,
        contactPerson: v.contactPerson,
        mobile: v.mobile,
        email: v.email,
        gstNumber: v.gstNumber,
        paymentTerms: v.paymentTerms,
        purchaseCount: vPurchases.length,
        totalPurchaseValue: v.totalPurchaseValue || 0,
        totalPaidAmount: v.totalPaidAmount || 0,
        outstandingBalance: v.outstandingBalance || 0,
        status: v.status
      };
    });

    res.send(vendorReport);
  } catch (error) {
    res.status(500).send({ error: 'Failed to generate vendor ledger report.' });
  }
});

// 3. Inventory Movement & Adjustment Report
router.get('/inventory-movement', auth, async (req, res) => {
  try {
    const adjustments = await StockAdjustment.find().sort({ createdAt: -1 }).limit(100);
    const invoices = await Invoice.find().sort({ createdAt: -1 }).limit(50);

    const movementLogs = [];

    adjustments.forEach(adj => {
      movementLogs.push({
        date: adj.createdAt || adj.date,
        type: 'ADJUSTMENT',
        reference: adj.adjustmentNo,
        partName: adj.partName,
        partNumber: adj.partNumber,
        qty: adj.type.includes('Increase') || adj.type.includes('Returned') ? `+${adj.qty}` : `-${adj.qty}`,
        reason: `${adj.type} (${adj.reason})`,
        createdBy: adj.createdBy,
        status: adj.status
      });
    });

    invoices.forEach(inv => {
      if (inv.parts && Array.isArray(inv.parts)) {
        inv.parts.forEach(p => {
          movementLogs.push({
            date: inv.createdAt || inv.date,
            type: 'SALE',
            reference: inv.invoiceNo,
            partName: p.name,
            partNumber: p.partNo || 'N/A',
            qty: `-${p.qty}`,
            reason: `Invoice Billed (${inv.paymentStatus})`,
            createdBy: inv.preparedBy || 'Billing',
            status: inv.status
          });
        });
      }
    });

    // Sort by date descending
    movementLogs.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.send(movementLogs.slice(0, 100));
  } catch (error) {
    res.status(500).send({ error: 'Failed to generate inventory movement report.' });
  }
});

// 4. Purchase History Report
router.get('/purchase-history', auth, async (req, res) => {
  try {
    const { fromDate, toDate, vendorId, partName, category, search } = req.query;
    let query = {};

    if (vendorId) {
      query.vendorId = vendorId;
    }

    if (fromDate || toDate) {
      query.date = {};
      if (fromDate) {
        const start = new Date(fromDate);
        start.setHours(0, 0, 0, 0);
        query.date.$gte = start;
      }
      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const purchases = await Purchase.find(query)
      .populate('items.partId')
      .sort({ date: -1, createdAt: -1 });

    const roundToTwo = num => Math.round(((num || 0) + Number.EPSILON) * 100) / 100;
    const itemsList = [];
    let totalPurchaseAmount = 0;
    let totalQuantityPurchased = 0;

    for (const p of purchases) {
      if (p.items && Array.isArray(p.items)) {
        for (const item of p.items) {
          const invItem = item.partId || {};
          const pName = item.partName || invItem.partName || '';
          const pNum = item.partNumber || invItem.partNumber || '';
          const pCat = invItem.category || 'General Spares';
          const pWarehouse = invItem.warehouse || 'Main Store';
          const pRack = invItem.locationRack || '';

          // Filter by partName if provided
          if (partName && !pName.toLowerCase().includes(partName.toLowerCase()) && !pNum.toLowerCase().includes(partName.toLowerCase())) {
            continue;
          }

          // Filter by category if provided
          if (category && pCat.toLowerCase() !== category.toLowerCase()) {
            continue;
          }

          // Filter by general search if provided
          if (search) {
            const sLower = search.toLowerCase();
            const matches = pName.toLowerCase().includes(sLower) ||
                            pNum.toLowerCase().includes(sLower) ||
                            (p.vendorName && p.vendorName.toLowerCase().includes(sLower)) ||
                            (p.invoiceNo && p.invoiceNo.toLowerCase().includes(sLower)) ||
                            (p.purchaseNo && p.purchaseNo.toLowerCase().includes(sLower));
            if (!matches) continue;
          }

          const qty = Number(item.qty) || 0;
          const purchasePrice = Number(item.purchasePrice) || 0;
          const gstAmount = Number(item.gstAmount) || 0;
          const total = Number(item.total) || roundToTwo(qty * purchasePrice + gstAmount);

          totalPurchaseAmount += total;
          totalQuantityPurchased += qty;

          itemsList.push({
            _id: `${p._id}_${item._id || item.partNumber}`,
            purchaseId: p._id,
            purchaseNo: p.purchaseNo,
            invoiceNo: p.invoiceNo || p.purchaseNo,
            purchaseDate: p.invoiceDate || p.date,
            createdAt: p.createdAt || p.date,
            vendorId: p.vendorId,
            vendorName: p.vendorName,
            partId: item.partId ? item.partId._id : null,
            partName: pName,
            partNumber: pNum,
            category: pCat,
            qty,
            purchasePrice,
            gstPercent: item.gstPercent || 18,
            gstAmount,
            total,
            warehouse: pWarehouse,
            locationRack: pRack,
            paymentStatus: p.paymentStatus,
            createdBy: p.createdBy
          });
        }
      }
    }

    res.send({
      summary: {
        totalPurchaseAmount: roundToTwo(totalPurchaseAmount),
        totalQuantityPurchased,
        transactionCount: purchases.length,
        itemsCount: itemsList.length
      },
      items: itemsList
    });
  } catch (error) {
    res.status(500).send({ error: 'Failed to generate purchase history report: ' + error.message });
  }
});

module.exports = router;
