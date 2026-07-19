const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables from backend/.env
const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });

const MONGODB_URI = process.env.MONGODB_URI;

const Customer = require('../models/Customer');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const JobCard = require('../models/JobCard');
const Estimate = require('../models/Estimate');
const Invoice = require('../models/Invoice');
const GatePass = require('../models/GatePass');
const InsuranceClaim = require('../models/InsuranceClaim');
const Notification = require('../models/Notification');
const Message = require('../models/Message');
const AuditLog = require('../models/AuditLog');
const Inventory = require('../models/Inventory');
const User = require('../models/User');

async function verifyCounts() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      family: 4
    });
    console.log('--- DATABASE COUNT VERIFICATION ---');
    console.log('Customers:', await Customer.countDocuments());
    console.log('Vehicles:', await Vehicle.countDocuments());
    console.log('Bookings:', await Booking.countDocuments());
    console.log('Job Cards:', await JobCard.countDocuments());
    console.log('Estimates:', await Estimate.countDocuments());
    console.log('Invoices:', await Invoice.countDocuments());
    console.log('Gate Passes:', await GatePass.countDocuments());
    console.log('Insurance Claims:', await InsuranceClaim.countDocuments());
    console.log('Notifications:', await Notification.countDocuments());
    console.log('Messages:', await Message.countDocuments());
    console.log('Audit Logs (Total):', await AuditLog.countDocuments());
    console.log('Audit Logs (Operational):', await AuditLog.countDocuments({ action: { $nin: ['USER_LOGIN', 'USER_LOGOUT'] } }));
    console.log('Inventory Parts (Preserved):', await Inventory.countDocuments());
    console.log('User Accounts (Preserved):', await User.countDocuments());
    console.log('-----------------------------------');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Verification script failed:', err);
  }
}

verifyCounts();
