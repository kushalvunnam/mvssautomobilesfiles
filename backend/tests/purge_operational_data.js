const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables from backend/.env
const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI not found in backend/.env');
  process.exit(1);
}

console.log('Connecting to database:', MONGODB_URI.split('@').pop());

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

async function purgeData() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      family: 4
    });
    console.log('Connected to MongoDB successfully.');

    // 1. Check inventory and user catalog counts before changes (for verification)
    const inventoryCountBefore = await Inventory.countDocuments();
    const userCountBefore = await User.countDocuments();
    console.log(`Inventory Parts preserved count: ${inventoryCountBefore}`);
    console.log(`User Accounts preserved count: ${userCountBefore}`);

    // 2. Perform deletions
    const delCustomer = await Customer.deleteMany({});
    const delVehicle = await Vehicle.deleteMany({});
    const delBooking = await Booking.deleteMany({});
    const delJobCard = await JobCard.deleteMany({});
    const delEstimate = await Estimate.deleteMany({});
    const delInvoice = await Invoice.deleteMany({});
    const delGatePass = await GatePass.deleteMany({});
    const delClaim = await InsuranceClaim.deleteMany({});
    const delNotification = await Notification.deleteMany({});
    const delMessage = await Message.deleteMany({});
    
    // Clear all test operational logs except authentication records
    const delLogs = await AuditLog.deleteMany({
      action: { $nin: ['USER_LOGIN', 'USER_LOGOUT'] }
    });

    console.log('\n=============================================');
    console.log('CLEANUP REPORT:');
    console.log('=============================================');
    console.log(`- Customers: Deleted ${delCustomer.deletedCount} records`);
    console.log(`- Vehicles: Deleted ${delVehicle.deletedCount} records`);
    console.log(`- Bookings: Deleted ${delBooking.deletedCount} records`);
    console.log(`- Job Cards: Deleted ${delJobCard.deletedCount} records`);
    console.log(`- Estimates: Deleted ${delEstimate.deletedCount} records`);
    console.log(`- Invoices: Deleted ${delInvoice.deletedCount} records`);
    console.log(`- Gate Passes: Deleted ${delGatePass.deletedCount} records`);
    console.log(`- Insurance Claims: Deleted ${delClaim.deletedCount} records`);
    console.log(`- Notifications: Deleted ${delNotification.deletedCount} records`);
    console.log(`- Messages: Deleted ${delMessage.deletedCount} records`);
    console.log(`- Audit Logs (test operational logs): Deleted ${delLogs.deletedCount} records`);
    console.log('=============================================');

    // 3. Re-verify preserved collections are unchanged
    const inventoryCountAfter = await Inventory.countDocuments();
    const userCountAfter = await User.countDocuments();
    console.log(`Verification: Inventory Parts count stays at: ${inventoryCountAfter}`);
    console.log(`Verification: User Accounts count stays at: ${userCountAfter}`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  } catch (err) {
    console.error('Purge script failed:', err);
    process.exit(1);
  }
}

purgeData();
