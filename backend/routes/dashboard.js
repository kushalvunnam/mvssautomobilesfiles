const express = require('express');
const Customer = require('../models/Customer');
const Vehicle = require('../models/Vehicle');
const JobCard = require('../models/JobCard');
const Invoice = require('../models/Invoice');
const InsuranceClaim = require('../models/InsuranceClaim');
const Inventory = require('../models/Inventory');
const AuditLog = require('../models/AuditLog');
const { auth, restrictTo } = require('../middleware/auth');
const router = express.Router();

// Get dashboard KPIs
router.get('/stats', auth, async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const totalVehicles = await Vehicle.countDocuments();
    
    const activeJobCards = await JobCard.countDocuments({
      status: { $ne: 'Delivered' }
    });
    const completedJobCards = await JobCard.countDocuments({ status: 'Delivered' });

    const pendingJobCards = await JobCard.countDocuments({
      status: { $in: ['Created', 'Inspect Stage', 'Estimation', 'Customer Approval'] }
    });

    // Revenue This Month: Invoices finalized in the current calendar month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);
    const monthlyInvoices = await Invoice.find({
      status: 'Finalized',
      date: { $gte: startOfMonth }
    });
    const revenueThisMonth = monthlyInvoices.reduce((sum, inv) => sum + inv.totals.grandTotal, 0);

    // Revenue This Year: Invoices finalized in the current calendar year
    const startOfYear = new Date();
    startOfYear.setMonth(0);
    startOfYear.setDate(1);
    startOfYear.setHours(0,0,0,0);
    const yearlyInvoices = await Invoice.find({
      status: 'Finalized',
      date: { $gte: startOfYear }
    });
    const revenueThisYear = yearlyInvoices.reduce((sum, inv) => sum + inv.totals.grandTotal, 0);

    // Pending Payments: Unpaid finalized invoices
    const unpaidInvoices = await Invoice.find({
      status: 'Finalized',
      paymentStatus: { $ne: 'Paid' }
    });
    const pendingPayments = unpaidInvoices.reduce((sum, inv) => sum + inv.totals.grandTotal, 0);

    // Inventory Value and Low Stock Items
    const allInventory = await Inventory.find({});
    const inventoryValue = allInventory.reduce((sum, item) => sum + ((item.stockQuantity || 0) * (item.purchasePrice || 0)), 0);
    const lowStockItems = allInventory.filter(item => (item.stockQuantity || 0) <= (item.lowStockThreshold || 5)).length;

    // Insurance Claims
    const insuranceClaims = await InsuranceClaim.countDocuments();

    // Body Shop Jobs
    const bodyShopJobs = await JobCard.countDocuments({
      $or: [
        { status: 'Body Shop' },
        { workCategory: 'B/P' }
      ]
    });

    res.send({
      totalCustomers,
      totalVehicles,
      activeJobCards,
      completedJobCards,
      pendingJobCards,
      revenueThisMonth: Math.round(revenueThisMonth * 100) / 100,
      revenueThisYear: Math.round(revenueThisYear * 100) / 100,
      pendingPayments: Math.round(pendingPayments * 100) / 100,
      inventoryValue: Math.round(inventoryValue * 100) / 100,
      lowStockItems,
      insuranceClaims,
      bodyShopJobs
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).send({ error: 'Failed to fetch dashboard stats.' });
  }
});

// Get chart data
router.get('/charts', auth, async (req, res) => {
  try {
    // 1. Revenue by Month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0,0,0,0);

    const invoices = await Invoice.find({
      status: 'Finalized',
      date: { $gte: sixMonthsAgo }
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueMap = {};

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      revenueMap[key] = 0;
    }

    invoices.forEach(inv => {
      const d = new Date(inv.date);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      if (revenueMap[key] !== undefined) {
        revenueMap[key] += inv.totals.grandTotal;
      }
    });

    const revenueChart = Object.entries(revenueMap).map(([month, amount]) => ({
      month,
      amount: Math.round(amount * 100) / 100
    }));

    // 2. Service Type Analytics (grouped by job cards)
    const serviceTypeAgg = await JobCard.aggregate([
      { $group: { _id: '$serviceType', count: { $sum: 1 } } }
    ]);
    const serviceTypeChart = serviceTypeAgg.map(item => ({
      name: item._id || 'General Servicing',
      value: item.count
    }));

    // 3. Top Used Spare Parts
    // Look at finalized invoices, list parts and aggregate quantities
    const partUsage = {};
    const finalizedInvsWithParts = await Invoice.find({ status: 'Finalized' });
    finalizedInvsWithParts.forEach(inv => {
      inv.parts.forEach(part => {
        if (partUsage[part.name]) {
          partUsage[part.name] += part.qty;
        } else {
          partUsage[part.name] = part.qty;
        }
      });
    });

    const topPartsChart = Object.entries(partUsage)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    // 4. Domain spent/billed breakdown (Spare parts vs. Labour vs. GST)
    let totalSpentParts = 0;
    let totalSpentLabour = 0;
    let totalSpentGst = 0;

    finalizedInvsWithParts.forEach(inv => {
      totalSpentParts += inv.totals.partsTotal || 0;
      totalSpentLabour += inv.totals.labourTotal || 0;
      totalSpentGst += inv.totals.gstTotal || 0;
    });

    const billingBreakdown = {
      spareParts: Math.round(totalSpentParts * 100) / 100,
      labour: Math.round(totalSpentLabour * 100) / 100,
      gst: Math.round(totalSpentGst * 100) / 100
    };

    res.send({
      revenueChart,
      serviceTypeChart,
      topPartsChart,
      billingBreakdown
    });
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch chart data.' });
  }
});

// Admin-only: Fetch Audit Logs
router.get('/auditlogs', auth, restrictTo('Admin'), async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
    res.send(logs);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch audit logs.' });
  }
});

module.exports = router;
