const express = require('express');
const Inventory = require('../models/Inventory');
const { auth, restrictTo } = require('../middleware/auth');
const { logAction } = require('../utils/logger');
const router = express.Router();

const { checkLowStockAlerts } = require('../utils/alerts');

// Barcode Lookup Route
router.get('/barcode/:barcode', auth, async (req, res) => {
  try {
    const { barcode } = req.params;
    const item = await Inventory.findOne({ barcode: barcode.trim() });
    if (!item) {
      return res.status(404).send({ error: `No part found with barcode ${barcode}` });
    }
    res.send(item);
  } catch (error) {
    res.status(500).send({ error: 'Barcode lookup failed.' });
  }
});

// List spare parts & labour items with enhanced search, category, brand, type, and alerts
router.get('/', auth, async (req, res) => {
  try {
    await checkLowStockAlerts();
    const { search, lowStock, category, brand, type, warehouse } = req.query;
    let query = {};

    if (type) query.type = type;
    if (category) query.category = { $regex: category, $options: 'i' };
    if (brand) query.brand = { $regex: brand, $options: 'i' };
    if (warehouse) query.warehouse = warehouse;

    if (search) {
      query.$or = [
        { partName: { $regex: search, $options: 'i' } },
        { partNumber: { $regex: search, $options: 'i' } },
        { partCode: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
        { hsnCode: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { variant: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { vehicleCompatibility: { $regex: search, $options: 'i' } },
        { supplier: { $regex: search, $options: 'i' } },
        { locationRack: { $regex: search, $options: 'i' } }
      ];
    }

    let items = await Inventory.find(query).sort({ partName: 1 });

    if (lowStock === 'true') {
      items = items.filter(item => item.stockQuantity <= item.lowStockThreshold);
    }

    res.send(items);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch inventory.' });
  }
});

// Get single inventory item
router.get('/:id', auth, async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).send({ error: 'Part not found.' });
    res.send(item);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch inventory item.' });
  }
});

// Create new spare part / labour master
router.post('/', auth, restrictTo('Admin', 'Accounts', 'Spares'), async (req, res) => {
  try {
    const { partNumber, barcode, partCode } = req.body;
    if (partNumber) {
      const existing = await Inventory.findOne({ partNumber: partNumber.trim() });
      if (existing) {
        return res.status(400).send({ error: `Part number "${partNumber}" already exists.` });
      }
    }

    if (barcode && barcode.trim() !== '') {
      const existingBarcode = await Inventory.findOne({ barcode: barcode.trim() });
      if (existingBarcode) {
        return res.status(400).send({ error: `Barcode "${barcode}" is already assigned to ${existingBarcode.partName}.` });
      }
    }

    if (partCode && partCode.trim() !== '') {
      const existingCode = await Inventory.findOne({ partCode: partCode.trim() });
      if (existingCode) {
        return res.status(400).send({ error: `Part code "${partCode}" already exists.` });
      }
    }

    const item = new Inventory(req.body);
    await item.save();
    await logAction(req.user, 'INVENTORY_CREATE', `Added master entry ${item.partName} (${item.partNumber})`, req);
    res.status(201).send(item);
  } catch (error) {
    res.status(400).send({ error: 'Failed to create inventory item: ' + error.message });
  }
});

// Restock purchase entry (add quantity to existing stock)
router.post('/purchase', auth, restrictTo('Admin', 'Accounts', 'Spares'), async (req, res) => {
  try {
    const { partNumber, quantityToAdd, purchasePrice, sellingPrice, mrp } = req.body;
    const item = await Inventory.findOne({ partNumber: partNumber.trim() });
    if (!item) return res.status(404).send({ error: 'Part not found. Create it first.' });

    item.stockQuantity += Number(quantityToAdd);
    if (purchasePrice !== undefined) item.purchasePrice = Number(purchasePrice);
    if (sellingPrice !== undefined) item.sellingPrice = Number(sellingPrice);
    if (mrp !== undefined) item.mrp = Number(mrp);

    await item.save();
    await logAction(req.user, 'INVENTORY_RESTOCK', `Restocked ${quantityToAdd} units of ${item.partName}. Current stock: ${item.stockQuantity}`, req);
    res.send(item);
  } catch (error) {
    res.status(400).send({ error: 'Restock failed: ' + error.message });
  }
});

// Edit details of a part
router.put('/:id', auth, restrictTo('Admin', 'Accounts', 'Spares'), async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).send({ error: 'Part not found.' });
    await logAction(req.user, 'INVENTORY_UPDATE', `Updated details for ${item.partName}`, req);
    res.send(item);
  } catch (error) {
    res.status(400).send({ error: 'Failed to update part: ' + error.message });
  }
});

// Delete part / master entry
router.delete('/:id', auth, restrictTo('Admin'), async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).send({ error: 'Part not found.' });

    await Inventory.findByIdAndDelete(req.params.id);
    await logAction(req.user, 'INVENTORY_DELETE', `Deleted master entry ${item.partName} (${item.partNumber})`, req);
    res.send({ message: 'Item deleted successfully.' });
  } catch (error) {
    res.status(500).send({ error: 'Failed to delete part: ' + error.message });
  }
});

// Reduce stock manually
router.post('/reduce', auth, restrictTo('Admin', 'Accounts', 'Spares'), async (req, res) => {
  try {
    const { partNumber, quantityToReduce, reason } = req.body;
    const item = await Inventory.findOne({ partNumber: partNumber.trim() });
    if (!item) return res.status(404).send({ error: 'Part not found.' });
    
    if (item.stockQuantity < Number(quantityToReduce)) {
      return res.status(400).send({ error: 'Insufficient stock. Current stock is ' + item.stockQuantity });
    }
    
    item.stockQuantity -= Number(quantityToReduce);
    await item.save();
    await logAction(req.user, 'INVENTORY_REDUCE', `Reduced ${quantityToReduce} units of ${item.partName} (${item.partNumber}) due to: ${reason || 'unspecified'}. Current stock: ${item.stockQuantity}`, req);
    res.send(item);
  } catch (error) {
    res.status(400).send({ error: 'Reduce stock failed.' });
  }
});

// Get stock history (Audit logs for inventory actions)
router.get('/history/:partNumber?', auth, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const AuditLog = mongoose.model('AuditLog');
    let query = {
      action: { $in: ['INVENTORY_CREATE', 'INVENTORY_RESTOCK', 'INVENTORY_UPDATE', 'INVENTORY_REDUCE', 'STOCK_ADJUSTMENT', 'INVENTORY_DELETE'] }
    };
    if (req.params.partNumber) {
      query.description = { $regex: req.params.partNumber, $options: 'i' };
    }
    const logs = await AuditLog.find(query).sort({ createdAt: -1 }).limit(100);
    res.send(logs);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch stock history.' });
  }
});

module.exports = router;
