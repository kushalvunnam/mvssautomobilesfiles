const express = require('express');
const Vendor = require('../models/Vendor');
const Purchase = require('../models/Purchase');
const { auth, restrictTo } = require('../middleware/auth');
const { logAction } = require('../utils/logger');
const router = express.Router();

// Helper to auto-generate Vendor Code
const generateVendorCode = async () => {
  const count = await Vendor.countDocuments();
  const sequence = String(count + 1).padStart(4, '0');
  return `VND-${sequence}`;
};

// List all vendors with search, category, type filter, and summary stats
router.get('/', auth, async (req, res) => {
  try {
    const { search, category, type, status } = req.query;
    let query = {};

    if (category) query.category = category;
    if (type) query.type = type;
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { vendorCode: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { gstNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const vendors = await Vendor.find(query).sort({ name: 1 });

    // Calculate overall stats
    const totalVendors = vendors.length;
    const totalPurchaseValue = vendors.reduce((acc, v) => acc + (v.totalPurchaseValue || 0), 0);
    const totalOutstanding = vendors.reduce((acc, v) => acc + (v.outstandingBalance || 0), 0);
    const totalPaid = vendors.reduce((acc, v) => acc + (v.totalPaidAmount || 0), 0);

    res.json({
      success: true,
      vendors,
      stats: {
        totalVendors,
        totalPurchaseValue,
        totalOutstanding,
        totalPaid
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch vendors: ' + error.message, message: error.message });
  }
});

// Get single vendor
router.get('/:id', auth, async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ success: false, error: 'Vendor not found.', message: 'Vendor not found.' });

    const purchases = await Purchase.find({ vendorId: vendor._id }).sort({ createdAt: -1 });
    res.json({ success: true, vendor, purchases });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch vendor details.', message: error.message });
  }
});

// Create Vendor
router.post('/', auth, restrictTo('Admin', 'Accounts', 'Spares'), async (req, res) => {
  try {
    const { name, mobile, vendorCode } = req.body;
    if (!name || !mobile) {
      return res.status(400).json({ success: false, error: 'Vendor Name and Mobile Number are required.', message: 'Vendor Name and Mobile Number are required.' });
    }

    const code = vendorCode ? vendorCode.trim() : await generateVendorCode();
    
    // Unique check
    const existingCode = await Vendor.findOne({ vendorCode: code });
    if (existingCode) {
      return res.status(400).json({ success: false, error: `Vendor code "${code}" already exists.`, message: `Vendor code "${code}" already exists.` });
    }

    const vendor = new Vendor({
      ...req.body,
      vendorCode: code
    });

    await vendor.save();
    await logAction(req.user, 'VENDOR_CREATE', `Created vendor ${vendor.name} (${vendor.vendorCode})`, req);
    res.status(201).json({ success: true, vendor });
  } catch (error) {
    res.status(400).json({ success: false, error: 'Failed to create vendor: ' + error.message, message: error.message });
  }
});

// Update Vendor
router.put('/:id', auth, restrictTo('Admin', 'Accounts', 'Spares'), async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!vendor) return res.status(404).json({ success: false, error: 'Vendor not found.', message: 'Vendor not found.' });

    await logAction(req.user, 'VENDOR_UPDATE', `Updated vendor ${vendor.name} (${vendor.vendorCode})`, req);
    res.json({ success: true, vendor });
  } catch (error) {
    res.status(400).json({ success: false, error: 'Failed to update vendor: ' + error.message, message: error.message });
  }
});

// Delete Vendor
router.delete('/:id', auth, restrictTo('Admin'), async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ success: false, error: 'Vendor not found.', message: 'Vendor not found.' });

    // Check if vendor has purchases
    const purchaseCount = await Purchase.countDocuments({ vendorId: vendor._id });
    if (purchaseCount > 0) {
      return res.status(400).json({ success: false, error: `Cannot delete vendor with ${purchaseCount} existing purchase transactions. Set status to Inactive instead.`, message: `Cannot delete vendor with ${purchaseCount} existing purchase transactions.` });
    }

    await Vendor.findByIdAndDelete(req.params.id);
    await logAction(req.user, 'VENDOR_DELETE', `Deleted vendor ${vendor.name} (${vendor.vendorCode})`, req);
    res.json({ success: true, message: 'Vendor deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete vendor: ' + error.message, message: error.message });
  }
});

module.exports = router;
