const mongoose = require('mongoose');

const InsuranceClaimSchema = new mongoose.Schema({
  claimNo: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
  },
  jobCardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobCard',
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true,
  },
  insuranceCompany: {
    type: String,
    required: true,
    trim: true,
  },
  policyNumber: {
    type: String,
    default: '',
    trim: true,
  },
  surveyorName: {
    type: String,
    trim: true,
    default: '',
  },
  surveyorMobile: {
    type: String,
    trim: true,
    default: '',
  },
  surveyDate: {
    type: Date,
  },
  claimDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['Pending', 'Submitted', 'Approved', 'Rejected', 'Settled'],
    default: 'Pending',
  },
  approvalHistory: [{
    status: { type: String },
    updatedBy: { type: String },
    updatedAt: { type: Date, default: Date.now },
    remarks: { type: String, default: '' }
  }],
  documents: [{
    name: {
      type: String, // e.g. 'RC Copy', 'Driving License', 'Insurance Policy', 'Vehicle Photos'
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    }
  }],
  notes: {
    type: String,
    trim: true,
    default: '',
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('InsuranceClaim', InsuranceClaimSchema);
