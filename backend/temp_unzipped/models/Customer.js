const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  mobile: {
    type: String,
    required: true,
    trim: true,
    index: true,
    validate: {
      validator: function(v) {
        return /^[6-9]\d{9}$/.test(v);
      },
      message: props => `${props.value} is not a valid 10-digit Indian mobile number!`
    }
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  alternateNumber: {
    type: String,
    trim: true,
    default: '',
  },
  address: {
    type: String,
    trim: true,
  },
  gstNumber: {
    type: String,
    trim: true,
    default: '',
  },
  aadhaarPan: {
    type: String,
    trim: true,
    default: '',
  },
  type: {
    type: String,
    enum: ['Individual', 'Corporate', 'Insurance'],
    default: 'Individual',
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Customer', customerSchema);
