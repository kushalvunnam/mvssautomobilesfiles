const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const restore = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const Purchase = require('../models/Purchase');
    const p = await Purchase.findOne({ purchaseNo: 'MVSS/PUR/26-27/064' });
    if (p) {
      p.attachments = [];
      p.attachmentUrl = "/uploads/purchase-1787646974827-31236631.jpeg";
      p.attachmentName = "JB AUTO PARTS";
      p.attachmentType = "image/jpeg";
      await p.save();
      console.log('Purchase MVSS/PUR/26-27/064 restored successfully.');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

restore();
