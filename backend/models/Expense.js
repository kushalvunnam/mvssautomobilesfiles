const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  expenseId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  expenseType: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01,
  },
  paymentMode: {
    type: String,
    enum: ['Cash', 'Online', 'UPI', 'Bank Transfer', 'Card'],
    required: true,
    default: 'Cash',
  },
  paidTo: {
    type: String,
    default: '',
    trim: true,
  },
  referenceNo: {
    type: String,
    default: '',
    trim: true,
  },
  remarks: {
    type: String,
    default: '',
    trim: true,
  },
  enteredBy: {
    type: String,
    required: true,
    default: 'Staff',
  },
  status: {
    type: String,
    enum: ['Paid', 'Pending'],
    default: 'Paid',
  }
}, {
  timestamps: true,
});

expenseSchema.index({ date: -1 });
expenseSchema.index({ expenseType: 1 });
expenseSchema.index({ paymentMode: 1 });
expenseSchema.index({ status: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
