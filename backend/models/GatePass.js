const mongoose = require('mongoose');

const gatePassSchema = new mongoose.Schema({
  gatePassNo: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  jobCardNumber: {
    type: String,
    trim: true,
    default: '',
  },
  vehicleNumber: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
  },
  customerName: {
    type: String,
    required: true,
    trim: true,
  },
  customerMobile: {
    type: String,
    required: true,
    trim: true,
  },
  materialName: {
    type: String,
    required: true,
    trim: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
  unit: {
    type: String,
    required: true,
    default: 'Nos',
    trim: true,
  },
  reasonForIssue: {
    type: String,
    required: true,
    trim: true,
  },
  sentTo: {
    type: String,
    required: true,
    trim: true,
  },
  issuedBy: {
    type: String,
    required: true,
    trim: true,
  },
  authorizedBy: {
    type: String,
    default: '',
    trim: true,
  },
  receiverName: {
    type: String,
    required: true,
    trim: true,
  },
  receiverMobile: {
    type: String,
    required: true,
    trim: true,
  },
  receiverSignature: {
    type: String,
    default: '',
  },
  authorizedSignature: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['Issued', 'Returned', 'Pending'],
    default: 'Issued',
  },
  returnDate: {
    type: Date,
  },
  attachments: [{
    type: String,
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('GatePass', gatePassSchema);
