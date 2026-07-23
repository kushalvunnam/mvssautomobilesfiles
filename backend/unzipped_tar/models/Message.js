const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  type: { type: String, default: 'inquiry' }, // 'inquiry', 'contact', 'booking'
  senderName: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  status: { type: String, enum: ['unread', 'read'], default: 'unread' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);
