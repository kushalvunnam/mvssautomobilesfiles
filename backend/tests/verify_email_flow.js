const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });

const { sendEmail } = require('../services/emailService');

async function testEmail() {
  console.log('--- Resend API End-to-End Debugger ---');
  console.log('ENV path checked:', envPath);
  
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error('❌ RESEND_API_KEY is not defined in the loaded env vars!');
    process.exit(1);
  }
  
  console.log(`Using API Key: ${key.slice(0, 5)}xxxxxxxx`);
  console.log('From Email:', process.env.RESEND_FROM_EMAIL);
  console.log('Admin Email:', process.env.ADMIN_EMAIL);
  
  console.log('\nSending test email...');
  const result = await sendEmail({
    to: process.env.ADMIN_EMAIL || 'accounts@auto4m.in',
    subject: 'Test Email - MVSS Automobiles Diagnostic Flow',
    html: `
      <h3>Resend Diagnostic Integration Test</h3>
      <p>This is an automated diagnostic test to verify that the Resend API key and sender domain are configured correctly.</p>
      <p>Timestamp: ${new Date().toISOString()}</p>
    `
  });
  
  console.log('\n--- Result ---');
  console.log('Success:', result.success);
  console.log('Response Details:', JSON.stringify(result, null, 2));
}

testEmail();
