const mongoose = require('mongoose');

const purchaseItemSchema = new mongoose.Schema({
  partId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
  },
  partNumber: {
    type: String,
    required: true,
  },
  partName: {
    type: String,
    required: true,
  },
  qty: {
    type: Number,
    required: true,
    min: 1,
  },
  purchasePrice: {
    type: Number,
    required: true,
    min: 0,
  },
  sellingPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  mrp: {
    type: Number,
    default: 0,
  },
  hsnCode: {
    type: String,
    default: '8708',
  },
  warehouse: {
    type: String,
    default: 'Main Store',
  },
  gstPercent: {
    type: Number,
    default: 18,
  },
  taxableAmount: {
    type: Number,
    required: true,
  },
  gstAmount: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  }
});

const purchaseSchema = new mongoose.Schema({
  purchaseNo: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  vendorName: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  invoiceNo: {
    type: String,
    default: '',
  },
  invoiceDate: {
    type: Date,
  },
  items: [purchaseItemSchema],
  totals: {
    subtotal: { type: Number, required: true, default: 0 },
    taxableAmount: { type: Number, required: true, default: 0 },
    gstTotal: { type: Number, required: true, default: 0 },
    grandTotal: { type: Number, required: true, default: 0 },
  },
  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Partially Paid', 'Paid'],
    default: 'Unpaid',
  },
  amountPaid: {
    type: Number,
    default: 0,
  },
  notes: {
    type: String,
    default: '',
  },
  createdBy: {
    type: String,
    required: true,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Purchase', purchaseSchema);
