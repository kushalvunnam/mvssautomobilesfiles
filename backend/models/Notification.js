const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  type: { type: String, default: 'booking' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  customerName: { type: String },
  mobile: { type: String },
  vehicleNumber: { type: String },
  serviceType: { type: String },
  preferredDate: { type: String },
  status: { type: String, enum: ['unread', 'read'], default: 'unread' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);
