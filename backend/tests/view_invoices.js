const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const checkInvoices = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('No MONGODB_URI found in env!');
      process.exit(1);
    }
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);

    const Invoice = require('../models/Invoice');
    const invoices = await Invoice.find({}).sort({ createdAt: -1 }).limit(5).lean();

    console.log(`Fetched ${invoices.length} invoices:`);
    for (const inv of invoices) {
      console.log(`\n- Invoice ID: ${inv._id}`);
      console.log(`  Invoice No: ${inv.invoiceNo}`);
      console.log(`  Parts count: ${inv.parts?.length || 0}`);
      console.log(`  Labour count: ${inv.labour?.length || 0}`);
      console.log(`  Totals:`, inv.totals);
      if (inv.parts && inv.parts.length > 0) {
        console.log(`  First part:`, inv.parts[0]);
      }
      if (inv.labour && inv.labour.length > 0) {
        console.log(`  First labour:`, inv.labour[0]);
      }
    }

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

checkInvoices();
