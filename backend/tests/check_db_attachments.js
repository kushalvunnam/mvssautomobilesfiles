const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const check = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const Purchase = require('../models/Purchase');
    const purchases = await Purchase.find({
      $or: [
        { attachmentUrl: { $ne: '' } },
        { attachments: { $exists: true, $not: { $size: 0 } } }
      ]
    }).lean();

    console.log('Purchases with attachments:', purchases.length);
    for (const p of purchases) {
      console.log(`- Purchase No: ${p.purchaseNo}, Invoice No: ${p.invoiceNo}`);
      console.log(`  attachmentUrl: "${p.attachmentUrl}"`);
      console.log(`  attachments:`, p.attachments);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

check();
