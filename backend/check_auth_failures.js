const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://mvssadmin:MVSS2026@cluster0.8xri3nn.mongodb.net/autoworkshop?retryWrites=true&w=majority&appName=Cluster0';

async function checkAuthFailures() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      family: 4
    });
    console.log('Connected!');

    const db = mongoose.connection.db;
    const failures = await db.collection('auditlogs')
      .find({ action: 'AUTH_FAILED' })
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();

    console.log('Recent Auth Failures:');
    if (failures.length === 0) {
      console.log('(None found)');
    } else {
      failures.forEach(f => {
        console.log(`- Time: ${f.timestamp}, Details: ${f.details}`);
      });
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

checkAuthFailures();
