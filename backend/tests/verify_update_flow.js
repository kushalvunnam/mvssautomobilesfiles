const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const testUpdate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const Purchase = require('../models/Purchase');
    
    // Find an old purchase record
    const p = await Purchase.findOne({ purchaseNo: 'MVSS/PUR/26-27/064' });
    if (!p) {
      console.log('Test purchase not found.');
      return;
    }
    
    console.log('Found Purchase:', p.purchaseNo);
    console.log('Original Attachments:', p.attachments);
    console.log('Original attachmentUrl:', p.attachmentUrl);
    
    // Simulate updating the purchase with a new GridFS file ID key
    const mockFileKey = '6a9288ef709b2c90eae0067c'; // Existing file in bucket
    const updatedPayload = {
      attachments: [{
        key: mockFileKey,
        originalName: 'lns_auto_28aug.jpeg',
        mimeType: 'image/jpeg',
        size: 191665
      }]
    };
    
    // Perform update logic
    p.attachments = updatedPayload.attachments;
    p.attachmentUrl = `/api/purchases/attachment/${mockFileKey}`;
    p.attachmentName = 'lns_auto_28aug.jpeg';
    p.attachmentType = 'image/jpeg';
    
    await p.save();
    console.log('Purchase saved successfully!');
    
    // Retrieve again to verify
    const updatedP = await Purchase.findOne({ purchaseNo: 'MVSS/PUR/26-27/064' });
    console.log('Verified attachments after save:', updatedP.attachments);
    console.log('Verified attachmentUrl after save:', updatedP.attachmentUrl);
    
  } catch (err) {
    console.error('Update test failed:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

testUpdate();
