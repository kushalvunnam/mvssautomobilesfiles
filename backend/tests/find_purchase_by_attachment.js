const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const findPurchase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const Purchase = require('../models/Purchase');
    
    console.log('Searching for purchase with attachment containing 6a92afd592cce9f0daff558...');
    const p1 = await Purchase.findOne({
      $or: [
        { attachmentUrl: { $regex: '6a92afd592cce9f0daff558' } },
        { 'attachments.key': '6a92afd592cce9f0daff558' }
      ]
    });
    
    if (p1) {
      console.log('Found purchase:', p1.purchaseNo);
      console.log('attachmentUrl:', p1.attachmentUrl);
      console.log('attachments:', p1.attachments);
    } else {
      console.log('No exact match found. Searching for similar patterns...');
      const all = await Purchase.find({
        $or: [
          { attachmentUrl: { $ne: '' } },
          { attachments: { $ne: [] } }
        ]
      });
      for (const p of all) {
        if (p.attachmentUrl.includes('6a92') || p.attachments.some(a => a.key.includes('6a92'))) {
          console.log(`Match: ${p.purchaseNo}`);
          console.log(`- attachmentUrl: ${p.attachmentUrl}`);
          console.log(`- attachments:`, p.attachments);
        }
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

findPurchase();
