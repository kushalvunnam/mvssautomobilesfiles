const jwt = require('jsonwebtoken');
const https = require('https');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const testLivePurchases = async () => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'autoworkshop_secret_key_123';
    // Generate token for a mock admin user ID
    // Look up an actual admin user in your database first
    const mongoose = require('mongoose');
    await mongoose.connect(process.env.MONGODB_URI);
    const User = mongoose.model('User', new mongoose.Schema({ role: String, active: Boolean }));
    const adminUser = await User.findOne({ role: { $in: ['Admin', 'Super Admin'] }, active: true });
    
    if (!adminUser) {
      console.log('No active admin user found in database.');
      return;
    }
    
    const token = jwt.sign({ _id: adminUser._id }, JWT_SECRET);
    console.log(`Generated token for user ${adminUser._id} (${adminUser.role}): ${token}`);
    
    // Call the live Render endpoint
    const url = `https://mvss-erp-backend.onrender.com/api/purchases?token=${token}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const purchases = JSON.parse(data);
          console.log(`Retrieved ${purchases.length} purchases from live Render.`);
          const p = purchases.find(item => item.purchaseNo === 'MVSS/PUR/26-27/068');
          if (p) {
            console.log('Purchase MVSS/PUR/26-27/068 details:');
            console.log('- attachmentUrl:', p.attachmentUrl);
            console.log('- attachments:', p.attachments);
          } else {
            console.log('Purchase No 068 not found in returned list.');
          }
        } catch (err) {
          console.error('Failed to parse response:', data);
        }
        process.exit(0);
      });
    }).on('error', (err) => {
      console.error(err);
      process.exit(1);
    });
    
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

testLivePurchases();
