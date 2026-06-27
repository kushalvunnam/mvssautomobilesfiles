const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  partName: {
    type: String,
    required: true,
    trim: true,
  },
  partNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
  hsnCode: {
    type: String,
    required: true,
    trim: true,
  },
  brand: {
    type: String,
    default: '',
    trim: true,
  },
  model: {
    type: String,
    default: '',
    trim: true,
  },
  variant: {
    type: String,
    default: '',
    trim: true,
  },
  stockQuantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  lowStockThreshold: {
    type: Number,
    required: true,
    min: 0,
    default: 5,
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
  gstPercent: {
    type: Number,
    required: true,
    default: 18,
  },
  category: {
    type: String,
    default: '',
    trim: true,
  },
  vehicleCompatibility: {
    type: String,
    default: '',
    trim: true,
  },
  supplier: {
    type: String,
    default: '',
    trim: true,
  },
  reorderLevel: {
    type: Number,
    min: 0,
    default: 0,
  },
  locationRack: {
    type: String,
    default: '',
    trim: true,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Inventory', inventorySchema);
