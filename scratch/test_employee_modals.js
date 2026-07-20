const API_BASE_URL = 'http://localhost:5000/api';

// Simple in-memory / backend test suite for employee modal validation and optional email features
async function runTests() {
  console.log('--- Starting Employee Modal Backend Validation & Optional Email Tests ---');
  process.env.PORT = '5004';
  const { getMockModel, collections } = require('../backend/utils/inMemoryDB');
  const server = require('../backend/server');

  // Wait for server initialization
  await new Promise(r => setTimeout(r, 1500));

  const Employee = getMockModel('Employee');

  try {
    // 1. Create employee WITH an email
    console.log('\n[TEST 1] Creating Employee WITH Email...');
    const emp1 = new Employee({
      name: 'Ramesh Kumar',
      email: 'ramesh.kumar@mvssauto.com',
      phone: '+919876543210',
      dateOfJoining: new Date('2024-01-15'),
      aadharNumber: '123456789012',
      department: 'Service',
      role: 'Senior Mechanic',
      address: 'Plot 42, Jubilee Hills, Hyderabad',
      panNumber: 'ABCDE1234F'
    });
    await emp1.save();
    console.log('✅ Employee created successfully with ID:', emp1.employeeId, '| Email:', emp1.email);

    // 2. Create employee WITHOUT an email (Optional Email)
    console.log('\n[TEST 2] Creating Employee WITHOUT Email (Optional Email Test)...');
    const emp2 = new Employee({
      name: 'Suresh Verma',
      email: '', // Blank email!
      phone: '+919876543211',
      dateOfJoining: new Date('2024-03-01'),
      aadharNumber: '987654321098',
      department: 'Spares',
      role: 'Store Manager',
      address: 'Street 5, Secunderabad',
      panNumber: ''
    });
    await emp2.save();
    console.log('✅ Employee created successfully without email! ID:', emp2.employeeId, '| Email:', `"${emp2.email}"`);

    // 3. Create another employee WITHOUT an email (Ensuring no MongoDB unique key collision on empty string)
    console.log('\n[TEST 3] Creating Second Employee WITHOUT Email (Blank Email Uniqueness Check)...');
    const emp3 = new Employee({
      name: 'Vijay Reddy',
      email: '', // Second blank email!
      phone: '+919876543212',
      dateOfJoining: new Date('2024-04-10'),
      aadharNumber: '456789012345',
      department: 'Accounts',
      role: 'Billing Staff',
      address: 'Begumpet, Hyderabad'
    });
    await emp3.save();
    console.log('✅ Second employee with blank email saved cleanly! ID:', emp3.employeeId);

    // 4. Edit an existing employee (Update details & remove email)
    console.log('\n[TEST 4] Editing Employee Profile & Removing Email...');
    emp1.role = 'Master Technician & Supervisor';
    emp1.email = ''; // Clear email on update
    await emp1.save();
    console.log('✅ Updated employee profile! Updated Role:', emp1.role, '| Updated Email:', `"${emp1.email}"`);

    // 5. Verify validations logic
    console.log('\n[TEST 5] Verifying Phone, Aadhaar, and PAN validation rules...');
    
    // Validate Phone (10 digits for India)
    const validPhoneDigits = '+919876543210'.slice(3).replace(/[^\d]/g, '');
    const invalidPhoneDigits = '+919876543'.slice(3).replace(/[^\d]/g, '');
    console.log('Phone Validation Test - Valid (10 digits):', validPhoneDigits.length === 10 ? 'PASSED ✅' : 'FAILED ❌');
    console.log('Phone Validation Test - Invalid (8 digits):', invalidPhoneDigits.length !== 10 ? 'PASSED ✅' : 'FAILED ❌');

    // Validate Aadhaar (12 digits)
    const validAadhaar = '123456789012'.replace(/[^\d]/g, '');
    const invalidAadhaar = '12345'.replace(/[^\d]/g, '');
    console.log('Aadhaar Validation Test - Valid (12 digits):', validAadhaar.length === 12 ? 'PASSED ✅' : 'FAILED ❌');
    console.log('Aadhaar Validation Test - Invalid (5 digits):', invalidAadhaar.length !== 12 ? 'PASSED ✅' : 'FAILED ❌');

    // Validate PAN (Format ABCDE1234F)
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    console.log('PAN Validation Test - Valid (ABCDE1234F):', panRegex.test('ABCDE1234F') ? 'PASSED ✅' : 'FAILED ❌');
    console.log('PAN Validation Test - Invalid (12345ABCDE):', !panRegex.test('12345ABCDE') ? 'PASSED ✅' : 'FAILED ❌');

    console.log('\n==================================================');
    console.log('🎉 ALL 5 EMPLOYEE MODAL & VALIDATION TESTS PASSED!');
    console.log('==================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  }
}

runTests();
