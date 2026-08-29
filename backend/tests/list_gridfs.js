const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const checkFiles = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'fs' });
    
    console.log('Fetching files from GridFS...');
    const files = await db.collection('fs.files').find({}).toArray();
    console.log(`Found ${files.length} files in GridFS:`);
    for (const f of files) {
      console.log(`- FileID: ${f._id}`);
      console.log(`  Filename: ${f.filename}`);
      console.log(`  Length: ${f.length} bytes`);
      console.log(`  ContentType: ${f.contentType}`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

checkFiles();
