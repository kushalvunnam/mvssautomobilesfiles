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
  currentStock: {
    type: Number,
    min: 0,
    default: 0,
  },
  lowStockThreshold: {
    type: Number,
    required: true,
    min: 0,
    default: 5,
  },
  minimumStock: {
    type: Number,
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

inventorySchema.pre('save', function(next) {
  if (this.isModified('stockQuantity') || this.isNew) {
    this.currentStock = this.stockQuantity;
  } else if (this.isModified('currentStock')) {
    this.stockQuantity = this.currentStock;
  }
  if (this.isModified('lowStockThreshold') || this.isNew) {
    this.minimumStock = this.lowStockThreshold;
  } else if (this.isModified('minimumStock')) {
    this.lowStockThreshold = this.minimumStock;
  }
  next();
});

inventorySchema.post('save', async function(doc) {
  try {
    const Notification = mongoose.model('Notification');
    const curStock = doc.currentStock !== undefined ? doc.currentStock : doc.stockQuantity;
    const minStock = doc.minimumStock !== undefined ? doc.minimumStock : doc.lowStockThreshold;

    if (curStock <= minStock) {
      const isOut = curStock === 0;
      const severity = isOut ? 'CRITICAL' : 'WARNING';
      const title = isOut ? 'OUT OF STOCK ALERT' : 'LOW STOCK ALERT';
      const alertMessage = `${doc.partName} (${doc.partNumber})\nCurrent Stock: ${curStock}\nMinimum Stock: ${minStock}\nSeverity Level: ${severity}`;

      const existing = await Notification.findOne({
        type: 'low_stock',
        title: title,
        customerName: doc.partName,
        status: 'unread'
      });

      if (!existing) {
        const notif = new Notification({
          type: 'low_stock',
          title: title,
          message: alertMessage,
          serviceType: severity,
          vehicleNumber: doc.partNumber,
          customerName: doc.partName,
          status: 'unread'
        });
        await notif.save();
      }
    }
  } catch (err) {
    console.error('Failed to trigger post-save stock alert:', err);
  }
});

module.exports = mongoose.model('Inventory', inventorySchema);
