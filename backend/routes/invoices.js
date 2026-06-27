const express = require('express');
const Invoice = require('../models/Invoice');
const JobCard = require('../models/JobCard');
const Estimate = require('../models/Estimate');
const Customer = require('../models/Customer');
const Vehicle = require('../models/Vehicle');
const Inventory = require('../models/Inventory');
const { auth, restrictTo } = require('../middleware/auth');
const { logAction } = require('../utils/logger');
const { generateInvoicePDF, generateGatePassPDF } = require('../utils/pdfGenerator');
const numberToWords = require('../utils/numberToWords');
const router = express.Router();

// Helper to auto-generate Invoice Number
const generateInvoiceNo = async () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));
  
  const count = await Invoice.countDocuments({
    createdAt: { $gte: startOfDay, $lte: endOfDay }
  });
  
  const sequence = String(count + 1).padStart(3, '0');
  return `INV-${dateStr}-${sequence}`;
};

// Recalculate Invoice totals with GST splits
const recalculateInvoice = (parts = [], labour = [], isInterstate = false) => {
  let partsTotal = 0;
  let labourTotal = 0;
  let cgstTotal = 0;
  let sgstTotal = 0;
  let igstTotal = 0;
  let gstTotal = 0;

  const processedParts = parts.map(part => {
    const qty = part.qty || 1;
    const rate = part.rate || 0;
    const gstPercent = (part.gstPercent !== undefined && part.gstPercent !== null && part.gstPercent !== '') ? Number(part.gstPercent) : 18;
    const amount = qty * rate;
    const gstAmount = amount * (gstPercent / 100);
    const total = amount + gstAmount;

    partsTotal += amount;
    gstTotal += gstAmount;

    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    if (isInterstate) {
      igstAmount = gstAmount;
      igstTotal += gstAmount;
    } else {
      cgstAmount = gstAmount / 2;
      sgstAmount = gstAmount / 2;
      cgstTotal += cgstAmount;
      sgstTotal += sgstAmount;
    }

    return {
      partId: part.partId,
      name: part.name,
      partNo: part.partNo,
      hsnCode: part.hsnCode,
      qty,
      rate,
      gstPercent,
      amount,
      gstAmount,
      cgstAmount,
      sgstAmount,
      igstAmount,
      total
    };
  });

  const processedLabour = labour.map(lab => {
    const rate = lab.rate || 0;
    const gstPercent = (lab.gstPercent !== undefined && lab.gstPercent !== null && lab.gstPercent !== '') ? Number(lab.gstPercent) : 18;
    const amount = rate;
    const gstAmount = amount * (gstPercent / 100);
    const total = amount + gstAmount;

    labourTotal += amount;
    gstTotal += gstAmount;

    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    if (isInterstate) {
      igstAmount = gstAmount;
      igstTotal += gstAmount;
    } else {
      cgstAmount = gstAmount / 2;
      sgstAmount = gstAmount / 2;
      cgstTotal += cgstAmount;
      sgstTotal += sgstAmount;
    }

    return {
      description: lab.description,
      rate,
      gstPercent,
      amount,
      gstAmount,
      cgstAmount,
      sgstAmount,
      igstAmount,
      total
    };
  });

  const grandTotal = Math.round((partsTotal + labourTotal + gstTotal) * 100) / 100;

  return {
    parts: processedParts,
    labour: processedLabour,
    totals: {
      partsTotal: Math.round(partsTotal * 100) / 100,
      labourTotal: Math.round(labourTotal * 100) / 100,
      cgstTotal: Math.round(cgstTotal * 100) / 100,
      sgstTotal: Math.round(sgstTotal * 100) / 100,
      igstTotal: Math.round(igstTotal * 100) / 100,
      gstTotal: Math.round(gstTotal * 100) / 100,
      grandTotal,
    },
    grandTotalWords: numberToWords(grandTotal)
  };
};

// List invoices
router.get('/', auth, async (req, res) => {
  try {
    const { status, paymentStatus } = req.query;
    let query = {};
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const invoices = await Invoice.find(query)
      .populate('customerId')
      .populate('vehicleId')
      .sort({ createdAt: -1 });

    res.send(invoices);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch invoices.' });
  }
});

// Get single invoice
router.get('/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customerId')
      .populate('vehicleId')
      .populate('jobCardId');
    if (!invoice) return res.status(404).send({ error: 'Invoice not found.' });
    res.send(invoice);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch invoice.' });
  }
});

// Create Invoice (can link to estimate)
router.post('/', auth, restrictTo('Admin', 'Accounts'), async (req, res) => {
  try {
    const { jobCardId, estimateId, parts, labour, gstDetails, insuranceClaimDetails, invoiceType, poNumber, roNumber, preparedBy } = req.body;
    
    // Find customer & vehicle
    const jobCard = await JobCard.findById(jobCardId);
    if (!jobCard) return res.status(404).send({ error: 'Job Card not found.' });

    const customer = await Customer.findById(jobCard.customerId);
    const vehicle = await Vehicle.findById(jobCard.vehicleId);

    const invoiceNo = await generateInvoiceNo();
    
    // Check if interstate based on customer and shop state (we assume shop is in Telangana code 36)
    const isInterstate = gstDetails && gstDetails.customerGSTIN && !gstDetails.customerGSTIN.startsWith('36');

    const calculations = recalculateInvoice(parts, labour, isInterstate);

    const finalRoNumber = roNumber || jobCard.jobCardNo;
    const finalPreparedBy = preparedBy || (req.user && req.user.name) || 'Staff Incharge';

    const invoiceData = {
      invoiceNo,
      jobCardId,
      estimateId,
      customerId: customer._id,
      vehicleId: vehicle._id,
      poNumber: poNumber || '',
      roNumber: finalRoNumber,
      preparedBy: finalPreparedBy,
      gstDetails: {
        companyGSTIN: '36AAJCM4778P1ZI',
        customerGSTIN: gstDetails?.customerGSTIN || customer.gstNumber || '',
        isInterstate
      },
      parts: calculations.parts,
      labour: calculations.labour,
      totals: calculations.totals,
      grandTotalWords: calculations.grandTotalWords,
      insuranceClaimDetails: insuranceClaimDetails || { claimNo: '', insuranceCompany: '', surveyorName: '', approvedAmount: 0, customerPayableAmount: calculations.totals.grandTotal },
      invoiceType: invoiceType || 'Tax Invoice',
      status: 'Draft'
    };

    const invoice = new Invoice(invoiceData);
    await invoice.save();

    await logAction(req.user, 'INVOICE_CREATE', `Created Invoice ${invoiceNo} for Job Card ${jobCard.jobCardNo}`, req);
    res.status(201).send(invoice);
  } catch (error) {
    res.status(400).send({ error: 'Failed to create invoice: ' + error.message });
  }
});

// Update / Finalize Invoice (Triggers Inventory stock deduction)
router.put('/:id', auth, restrictTo('Admin', 'Accounts'), async (req, res) => {
  try {
    const { parts, labour, status, paymentStatus, paymentMethod, amountPaid, insuranceClaimDetails, invoiceType, poNumber, roNumber, preparedBy } = req.body;
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).send({ error: 'Invoice not found.' });

    const isFinalizing = status === 'Finalized' && invoice.status !== 'Finalized';

    if (parts || labour) {
      if (invoice.status === 'Finalized') {
        return res.status(400).send({ error: 'Cannot modify items on a finalized invoice.' });
      }
      const calculations = recalculateInvoice(
        parts || invoice.parts,
        labour || invoice.labour,
        invoice.gstDetails.isInterstate
      );
      invoice.parts = calculations.parts;
      invoice.labour = calculations.labour;
      invoice.totals = calculations.totals;
      invoice.grandTotalWords = calculations.grandTotalWords;
    }

    if (status) {
      invoice.status = status;
    }

    if (paymentStatus) {
      invoice.paymentStatus = paymentStatus;
      if (paymentStatus === 'Paid') {
        invoice.amountPaid = invoice.totals.grandTotal;
      }
    }

    if (amountPaid !== undefined) {
      invoice.amountPaid = amountPaid;
    }

    if (paymentMethod) {
      invoice.paymentMethod = paymentMethod;
    }

    if (insuranceClaimDetails) {
      invoice.insuranceClaimDetails = insuranceClaimDetails;
    }

    if (invoiceType) {
      invoice.invoiceType = invoiceType;
    }

    if (poNumber !== undefined) {
      invoice.poNumber = poNumber;
    }

    if (roNumber !== undefined) {
      invoice.roNumber = roNumber;
    }

    if (preparedBy !== undefined) {
      invoice.preparedBy = preparedBy;
    }

    await invoice.save();

    // Trigger stock deduction and job card updates upon finalization
    if (isFinalizing) {
      // Deduct from Inventory
      for (const part of invoice.parts) {
        if (part.partId) {
          const invItem = await Inventory.findById(part.partId);
          if (invItem) {
            invItem.stockQuantity = Math.max(0, invItem.stockQuantity - part.qty);
            await invItem.save();
          }
        }
      }

      // Mark Job Card as Delivered/Closed
      await JobCard.findByIdAndUpdate(invoice.jobCardId, { status: 'Delivered' });
      await logAction(req.user, 'INVOICE_FINALIZE', `Finalized Invoice ${invoice.invoiceNo} & deducted inventory items`, req);
    } else {
      await logAction(req.user, 'INVOICE_UPDATE', `Updated Invoice ${invoice.invoiceNo}`, req);
    }

    res.send(invoice);
  } catch (error) {
    res.status(400).send({ error: 'Failed to update invoice: ' + error.message });
  }
});

// Download Invoice PDF
router.get('/:id/pdf', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).send({ error: 'Invoice not found.' });

    const customer = await Customer.findById(invoice.customerId);
    const vehicle = await Vehicle.findById(invoice.vehicleId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=invoice-${invoice.invoiceNo}.pdf`);

    generateInvoicePDF(invoice, customer, vehicle, res);
  } catch (error) {
    res.status(500).send({ error: 'Failed to generate PDF: ' + error.message });
  }
});

// Download Gate Pass PDF from Invoice
router.get('/:id/gatepass/pdf', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).send({ error: 'Invoice not found.' });

    if (invoice.paymentStatus !== 'Paid') {
      return res.status(400).send({ error: 'Gate Pass can be generated only if Payment Status is Paid.' });
    }

    const customer = await Customer.findById(invoice.customerId);
    const vehicle = await Vehicle.findById(invoice.vehicleId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=gatepass-${invoice.invoiceNo}.pdf`);

    generateGatePassPDF(invoice, customer, vehicle, res);
  } catch (error) {
    res.status(500).send({ error: 'Failed to generate Gate Pass PDF: ' + error.message });
  }
});

module.exports = router;
