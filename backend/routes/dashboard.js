const express = require('express');
const Customer = require('../models/Customer');
const Vehicle = require('../models/Vehicle');
const JobCard = require('../models/JobCard');
const Invoice = require('../models/Invoice');
const InsuranceClaim = require('../models/InsuranceClaim');
const Inventory = require('../models/Inventory');
const AuditLog = require('../models/AuditLog');
const GatePass = require('../models/GatePass');
const { auth, restrictTo } = require('../middleware/auth');
const router = express.Router();

const { checkLowStockAlerts } = require('../utils/alerts');

// Get dashboard KPIs
router.get('/stats', auth, async (req, res) => {
  try {
    await checkLowStockAlerts();
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

    // Gate Passes stats calculations
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    
    const totalGatePasses = await GatePass.countDocuments();
    const issuedToday = await GatePass.countDocuments({
      createdAt: { $gte: startOfToday }
    });
    const pendingReturns = await GatePass.countDocuments({
      status: 'Pending'
    });
    const returnedMaterials = await GatePass.countDocuments({
      status: 'Returned'
    });

    // Fetch latest 10 audit logs
    const latestAuditLogs = await AuditLog.find({})
      .sort({ createdAt: -1 })
      .limit(10);

    // Fetch low stock items list
    const lowStockItemsList = allInventory
      .filter(item => (item.currentStock || item.stockQuantity || 0) <= (item.minimumStock || item.lowStockThreshold || 5))
      .map(item => ({
        partName: item.partName,
        partNumber: item.partNumber,
        currentStock: item.currentStock || item.stockQuantity || 0,
        minimumStock: item.minimumStock || item.lowStockThreshold || 5,
        severity: (item.currentStock || item.stockQuantity || 0) === 0 ? 'CRITICAL' : 'WARNING'
      }));

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
      lowStockItemsList,
      latestAuditLogs,
      insuranceClaims,
      bodyShopJobs,
      totalGatePasses,
      issuedToday,
      pendingReturns,
      returnedMaterials
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

// Admin-only: Fetch Audit Logs with Query Filters & Pagination & Search
router.get('/auditlogs', auth, restrictTo('Admin'), async (req, res) => {
  try {
    const { userName, role, moduleName, action, startDate, endDate, search, page, limit } = req.query;
    const query = {};

    if (userName) {
      query.userName = { $regex: userName, $options: 'i' };
    }
    if (role) {
      query.$or = [{ role: role }, { userRole: role }];
    }
    if (moduleName) {
      query.module = moduleName;
    }
    if (action) {
      query.action = { $regex: action, $options: 'i' };
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      query.$or = [
        { userName: searchRegex },
        { action: searchRegex },
        { module: searchRegex },
        { details: searchRegex },
        { ipAddress: searchRegex }
      ];
    }

    const p = parseInt(page, 10) || 1;
    const l = parseInt(limit, 10) || 25;
    const skip = (p - 1) * l;

    const totalCount = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(l);

    res.send({
      logs,
      totalPages: Math.ceil(totalCount / l),
      currentPage: p,
      totalCount
    });
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch audit logs: ' + error.message });
  }
});

// Authenticated: Log custom activity (e.g. report exported, client action)
router.post('/auditlogs', auth, async (req, res) => {
  try {
    const { action, details } = req.body;
    if (!action || !details) {
      return res.status(400).send({ error: 'Action and details are required.' });
    }
    const { logAction } = require('../utils/logger');
    await logAction(req.user, action, details, req);
    res.status(201).send({ message: 'Audit log created.' });
  } catch (error) {
    res.status(500).send({ error: 'Failed to create audit log: ' + error.message });
  }
});

// Admin-only: Reset database for real testing mode
router.post('/reset-database', auth, restrictTo('Admin'), async (req, res) => {
  try {
    const Customer = require('../models/Customer');
    const Vehicle = require('../models/Vehicle');
    const JobCard = require('../models/JobCard');
    const Booking = require('../models/Booking');
    const Estimate = require('../models/Estimate');
    const InsuranceClaim = require('../models/InsuranceClaim');
    const AuditLog = require('../models/AuditLog');
    const { logAction } = require('../utils/logger');

    const resCust = await Customer.deleteMany({});
    const resVeh = await Vehicle.deleteMany({});
    const resJc = await JobCard.deleteMany({});
    const resBook = await Booking.deleteMany({});
    const resEst = await Estimate.deleteMany({});
    const resClaim = await InsuranceClaim.deleteMany({});
    
    // Clear all audit logs except USER_LOGIN and USER_LOGOUT
    const resLogs = await AuditLog.deleteMany({ action: { $nin: ['USER_LOGIN', 'USER_LOGOUT'] } });

    // Log the reset action
    await logAction(req.user, 'SYSTEM_RESET', 'Purged customers, vehicles, job cards, bookings, estimates, claims, and logs for real testing mode.', req);

    res.send({
      message: 'Database reset successful.',
      counts: {
        customers: resCust.deletedCount,
        vehicles: resVeh.deletedCount,
        jobCards: resJc.deletedCount,
        bookings: resBook.deletedCount,
        estimates: resEst.deletedCount,
        claims: resClaim.deletedCount,
        logs: resLogs.deletedCount
      }
    });
  } catch (error) {
    res.status(500).send({ error: 'Failed to reset database: ' + error.message });
  }
});

// Authenticated: Global ERP search across modules
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.send([]);
    }

    const query = q.trim();
    const regex = { $regex: query, $options: 'i' };

    // Search Customers
    const customers = await Customer.find({
      $or: [
        { name: regex },
        { mobile: regex },
        { email: regex }
      ]
    }).limit(5);

    // Search Vehicles
    const vehicles = await Vehicle.find({
      $or: [
        { vehicleNumber: regex },
        { chassisNumber: regex },
        { make: regex },
        { model: regex }
      ]
    }).limit(5);

    // Search Job Cards
    const jobcards = await JobCard.find({
      jobCardNo: regex
    }).limit(5);

    // Search Invoices
    const invoices = await Invoice.find({
      invoiceNo: regex
    }).limit(5);

    // Search Inventory
    const inventory = await Inventory.find({
      $or: [
        { partName: regex },
        { partNumber: regex }
      ]
    }).limit(5);

    // Search Employees
    const Employee = require('../models/Employee');
    const employees = await Employee.find({
      $or: [
        { name: regex },
        { email: regex },
        { phone: regex }
      ]
    }).limit(5);

    // Search Insurance Claims
    const claims = await InsuranceClaim.find({
      $or: [
        { claimNo: regex },
        { insuranceCompany: regex }
      ]
    }).limit(5);

    // Format output
    const results = [];

    customers.forEach(c => {
      results.push({
        title: c.name,
        subtitle: `Customer • ${c.mobile}`,
        tabId: 'customers',
        filterVal: c.name,
        type: 'Customer'
      });
    });

    vehicles.forEach(v => {
      results.push({
        title: v.vehicleNumber,
        subtitle: `Vehicle • ${v.make} ${v.model}`,
        tabId: 'vehicles',
        filterVal: v.vehicleNumber,
        type: 'Vehicle'
      });
    });

    jobcards.forEach(jc => {
      results.push({
        title: jc.jobCardNo,
        subtitle: `Job Card • ${jc.status}`,
        tabId: 'jobcards',
        filterVal: jc.jobCardNo,
        type: 'JobCard',
        id: jc._id
      });
    });

    invoices.forEach(inv => {
      results.push({
        title: inv.invoiceNo,
        subtitle: `Invoice • ₹${inv.totals?.grandTotal?.toLocaleString('en-IN') || 0} (${inv.paymentStatus})`,
        tabId: 'invoices',
        filterVal: inv.invoiceNo,
        type: 'Invoice'
      });
    });

    inventory.forEach(item => {
      results.push({
        title: item.partName,
        subtitle: `Inventory • Stock: ${item.stockQuantity} (${item.partNumber})`,
        tabId: 'inventory',
        filterVal: item.partName,
        type: 'Inventory'
      });
    });

    employees.forEach(emp => {
      results.push({
        title: emp.name,
        subtitle: `Employee • ${emp.phone || emp.email || 'Staff'}`,
        tabId: 'employees',
        filterVal: emp.name,
        type: 'Employee'
      });
    });

    claims.forEach(cl => {
      results.push({
        title: cl.claimNo,
        subtitle: `Insurance Claim • ${cl.insuranceCompany} (${cl.status})`,
        tabId: 'claims',
        filterVal: cl.claimNo,
        type: 'Claim'
      });
    });

    res.send(results);
  } catch (error) {
    res.status(500).send({ error: 'Global search failed: ' + error.message });
  }
});

module.exports = router;
