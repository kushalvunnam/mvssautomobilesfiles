import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../config';
import InternationalPhoneInput from '../components/InternationalPhoneInput';
import { Search, Plus, Calendar, Receipt, Download, FileText, CheckCircle2, XCircle, AlertCircle, Save, Edit2, Trash2, Eye, X, UserPlus } from 'lucide-react';

export default function Employees({ token, user }) {
  const [employees, setEmployees] = useState([]);
  const [activeTab, setActiveTab] = useState('registry'); // 'registry', 'attendance', 'salary'
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Active', 'Inactive'

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Forms
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfJoining: '',
    basicDetails: '',
    aadharNumber: '',
    status: 'Active',
    department: 'Service',
    role: '',
    address: '',
    panNumber: '',
    dateOfBirth: '',
    designation: '',
  });
  const [editForm, setEditForm] = useState({
    _id: '',
    employeeId: '',
    name: '',
    email: '',
    phone: '',
    dateOfJoining: '',
    basicDetails: '',
    aadharNumber: '',
    status: 'Active',
    department: 'Service',
    role: '',
    address: '',
    panNumber: '',
    dateOfBirth: '',
    designation: '',
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [editResumeFile, setEditResumeFile] = useState(null);
  const [aadharFile, setAadharFile] = useState(null);
  const [editAadharFile, setEditAadharFile] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [editPhotoFile, setEditPhotoFile] = useState(null);
  const [selectedProfileEmployee, setSelectedProfileEmployee] = useState(null);

  const addNameInputRef = useRef(null);
  const editNameInputRef = useRef(null);

  // Keyboard shortcut listener (ESC closes modals) & Body scroll lock
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showAddModal) setShowAddModal(false);
        if (showEditModal) setShowEditModal(false);
        if (selectedProfileEmployee) setSelectedProfileEmployee(null);
      }
    };
    if (showAddModal || showEditModal || selectedProfileEmployee) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showAddModal, showEditModal, selectedProfileEmployee]);

  // Auto-focus first input field when modal opens
  useEffect(() => {
    if (showAddModal) {
      setTimeout(() => addNameInputRef.current?.focus(), 100);
    }
  }, [showAddModal]);

  useEffect(() => {
    if (showEditModal) {
      setTimeout(() => editNameInputRef.current?.focus(), 100);
    }
  }, [showEditModal]);

  // Comprehensive Form Validation Helper
  const validateEmployeeForm = (form) => {
    // 1. Phone validation
    const rawPhone = form.phone || '';
    const digitsOnly = rawPhone.replace(/[^\d]/g, '');
    
    if (!rawPhone || digitsOnly.length === 0) {
      return 'Please enter a valid phone number.';
    }
    
    // For Indian numbers (+91 default or 10-digit number)
    const isIndian = rawPhone.startsWith('+91') || rawPhone.startsWith('91') || (digitsOnly.length <= 10 && !rawPhone.startsWith('+'));
    if (isIndian) {
      let nationalDigits = rawPhone;
      if (rawPhone.startsWith('+91')) {
        nationalDigits = rawPhone.slice(3).replace(/[^\d]/g, '');
      } else if (rawPhone.startsWith('91') && digitsOnly.length === 12) {
        nationalDigits = rawPhone.slice(2).replace(/[^\d]/g, '');
      } else {
        nationalDigits = digitsOnly;
      }
      
      if (nationalDigits.length !== 10) {
        return 'Mobile number must contain exactly 10 digits.';
      }
    } else if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      return 'Mobile number must contain valid digits.';
    }

    // 2. Email validation (OPTIONAL)
    if (form.email && form.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email.trim())) {
        return 'Invalid email address format.';
      }
    }

    // 3. Aadhaar validation (Exactly 12 numeric digits)
    const cleanAadhaar = (form.aadharNumber || '').replace(/[^\d]/g, '');
    if (!cleanAadhaar || cleanAadhaar.length !== 12) {
      return 'Aadhaar number must contain exactly 12 digits.';
    }

    // 4. PAN validation (Optional)
    if (form.panNumber && form.panNumber.trim() !== '') {
      const cleanPan = form.panNumber.trim().toUpperCase();
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(cleanPan)) {
        return 'Invalid PAN number format (e.g. ABCDE1234F).';
      }
    }

    // 5. Date validation
    if (form.dateOfBirth) {
      const dob = new Date(form.dateOfBirth);
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      if (dob > today) {
        return 'Date of Birth cannot be in the future.';
      }

      // Age >= 18 check
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }

      if (age < 18) {
        return 'Employee must be at least 18 years old.';
      }

      if (form.dateOfJoining) {
        const doj = new Date(form.dateOfJoining);
        if (doj < dob) {
          return 'Date of Joining cannot be earlier than Date of Birth.';
        }
      }
    }

    return null;
  };


  // Attendance states
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().substring(0, 10));
  const [attendanceMap, setAttendanceMap] = useState({}); // { employeeId: status }

  // Salary states
  const [salaryForm, setSalaryForm] = useState({
    employeeId: '',
    monthYear: new Date().toISOString().substring(0, 7), // YYYY-MM
    basicSalary: '',
    advances: '',
    deductions: '',
    deductionsDescription: '',
    epfPercent: '',
    specialAllowance: '',
    otherAllowance: '',
    otherAllowanceDescription: '',
    leavesCount: 0,
    calculatedNetSalary: 0,
  });
  const [selectedSalaryEmployee, setSelectedSalaryEmployee] = useState(null);

  const cleanNumberInput = (val, allowDecimal = true, maxVal = null) => {
    if (val === undefined || val === null) return '';
    let cleaned = val.toString().replace(/[^0-9.]/g, '');
    if (!allowDecimal) {
      cleaned = cleaned.replace(/\./g, '');
    }
    if (cleaned === '.') return '0.';
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('');
    }
    if (cleaned.startsWith('0') && cleaned.length > 1 && cleaned[1] !== '.') {
      cleaned = cleaned.replace(/^0+/, '');
      if (cleaned === '') cleaned = '';
    }
    if (maxVal !== null && cleaned !== '') {
      const num = parseFloat(cleaned);
      if (!isNaN(num) && num > maxVal) {
        cleaned = maxVal.toString();
      }
    }
    return cleaned;
  };

  const handlePhoneChange = (val, form, setter) => {
    setter({ ...form, phone: val });
  };

  const handleAadharChange = (e, form, setter) => {
    const input = e.target;
    const originalValue = input.value;
    let processedValue = originalValue.replace(/[^0-9]/g, '');
    if (processedValue.startsWith('0')) {
      processedValue = processedValue.replace(/^0+/, '');
    }
    processedValue = processedValue.slice(0, 12);
    
    const selectionStart = input.selectionStart;
    setter({ ...form, aadharNumber: processedValue });

    requestAnimationFrame(() => {
      if (input && input.setSelectionRange) {
        const beforeCursor = originalValue.slice(0, selectionStart);
        let cleanBeforeCursor = beforeCursor.replace(/[^0-9]/g, '');
        if (cleanBeforeCursor.startsWith('0')) {
          cleanBeforeCursor = cleanBeforeCursor.replace(/^0+/, '');
        }
        const newCursorPos = cleanBeforeCursor.length;
        input.setSelectionRange(newCursorPos, newCursorPos);
      }
    });
  };

  const handleSalaryNumericChange = (e, key, allowDecimal = true, maxVal = null) => {
    const input = e.target;
    const originalValue = input.value;
    const processedValue = cleanNumberInput(originalValue, allowDecimal, maxVal);
    
    const selectionStart = input.selectionStart;
    
    setSalaryForm(prev => {
      const updated = { ...prev, [key]: processedValue };
      if (key === 'basicSalary' || key === 'epfPercent') {
        const basicVal = parseFloat(updated.basicSalary) || 0;
        const percent = parseFloat(updated.epfPercent) || 0;
        const epfVal = Math.round(basicVal * (percent / 100));
        updated.deductions = percent > 0 ? epfVal.toString() : '';
        updated.deductionsDescription = percent > 0 ? `EPF (${percent}%)` : '';
      }
      return updated;
    });

    requestAnimationFrame(() => {
      if (input && input.setSelectionRange) {
        const beforeCursor = originalValue.slice(0, selectionStart);
        const cleanBeforeCursor = cleanNumberInput(beforeCursor, allowDecimal, maxVal);
        const newCursorPos = cleanBeforeCursor.length;
        input.setSelectionRange(newCursorPos, newCursorPos);
      }
    });
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [token]);

  useEffect(() => {
    const globalFilter = localStorage.getItem('global_search_filter');
    if (globalFilter) {
      setSearch(globalFilter);
      localStorage.removeItem('global_search_filter');
    }
  }, []);

  // Sync attendance map when date changes
  useEffect(() => {
    const map = {};
    employees.forEach(emp => {
      const record = emp.attendance?.find(a => {
        const d = new Date(a.date).toISOString().substring(0, 10);
        return d === attendanceDate;
      });
      map[emp._id] = record ? record.status : 'Present'; // Default to Present
    });
    setAttendanceMap(map);
  }, [attendanceDate, employees]);

  // Recalculate leaves and net salary when salary inputs change
  useEffect(() => {
    if (!salaryForm.employeeId) {
      setSelectedSalaryEmployee(null);
      setSalaryForm(prev => ({
        ...prev,
        leavesCount: 0,
        calculatedNetSalary: 0
      }));
      return;
    }

    const emp = employees.find(e => e._id === salaryForm.employeeId);
    setSelectedSalaryEmployee(emp);
    if (!emp) return;

    // Count leaves (Absent or Leave = 1, Half Day = 0.5) for specified monthYear
    let leaves = 0;
    emp.attendance?.forEach(a => {
      const dateStr = new Date(a.date).toISOString().substring(0, 7);
      if (dateStr === salaryForm.monthYear) {
        if (a.status === 'Absent' || a.status === 'Leave') {
          leaves += 1;
        } else if (a.status === 'Half Day') {
          leaves += 0.5;
        }
      }
    });

    const basic = Number(salaryForm.basicSalary) || 0;
    const adv = Number(salaryForm.advances) || 0;
    const extraDeduct = Number(salaryForm.deductions) || 0;
    const special = Number(salaryForm.specialAllowance) || 0;
    const other = Number(salaryForm.otherAllowance) || 0;
    
    // Per day leave deduction (assumes 30 days)
    const leaveDeduction = leaves > 0 ? (basic / 30) * leaves : 0;
    const net = Math.round(Math.max(0, basic + special + other - adv - extraDeduct - leaveDeduction));

    setSalaryForm(prev => ({
      ...prev,
      leavesCount: leaves,
      calculatedNetSalary: net
    }));
  }, [salaryForm.employeeId, salaryForm.monthYear, salaryForm.basicSalary, salaryForm.advances, salaryForm.deductions, salaryForm.specialAllowance, salaryForm.otherAllowance, employees]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const validationError = validateEmployeeForm(addForm);
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    const formData = new FormData();
    formData.append('name', addForm.name.trim());
    formData.append('email', addForm.email.trim());
    formData.append('phone', addForm.phone);
    formData.append('dateOfJoining', addForm.dateOfJoining);
    formData.append('basicDetails', addForm.basicDetails);
    formData.append('aadharNumber', addForm.aadharNumber);
    formData.append('status', addForm.status || 'Active');
    formData.append('department', addForm.department || 'Service');
    formData.append('role', addForm.role || '');
    formData.append('address', addForm.address || '');
    formData.append('panNumber', addForm.panNumber ? addForm.panNumber.toUpperCase().trim() : '');
    if (addForm.dateOfBirth) {
      formData.append('dateOfBirth', addForm.dateOfBirth);
    }
    formData.append('designation', addForm.designation || '');

    if (resumeFile) formData.append('resume', resumeFile);
    if (aadharFile) formData.append('aadharDoc', aadharFile);
    if (photoFile) formData.append('photoDoc', photoFile);

    try {
      const res = await fetch(`${API_BASE_URL}/employees`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('Employee registered successfully.');
        setShowAddModal(false);
        setAddForm({
          name: '',
          email: '',
          phone: '',
          dateOfJoining: '',
          basicDetails: '',
          aadharNumber: '',
          status: 'Active',
          department: 'Service',
          role: '',
          address: '',
          panNumber: '',
          dateOfBirth: '',
          designation: '',
        });
        setResumeFile(null);
        setAadharFile(null);
        setPhotoFile(null);
        fetchEmployees();
      } else {
        setErrorMsg(data.error || 'Failed to register employee.');
      }
    } catch (err) {
      setErrorMsg('Server connection failed.');
    }
  };


  const handleOpenEdit = (emp) => {
    setEditForm({
      _id: emp._id,
      employeeId: emp.employeeId || '',
      name: emp.name || '',
      email: emp.email || '',
      phone: emp.phone || '',
      dateOfJoining: emp.dateOfJoining ? emp.dateOfJoining.split('T')[0] : '',
      basicDetails: emp.basicDetails || '',
      aadharNumber: emp.aadharNumber || '',
      status: emp.status || 'Active',
      department: emp.department || 'Service',
      role: emp.role || '',
      address: emp.address || '',
      panNumber: emp.panNumber || '',
      dateOfBirth: emp.dateOfBirth ? emp.dateOfBirth.split('T')[0] : '',
      designation: emp.designation || '',
    });
    setErrorMsg('');
    setSuccessMsg('');
    setEditResumeFile(null);
    setEditAadharFile(null);
    setEditPhotoFile(null);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const validationError = validateEmployeeForm(editForm);
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    const formData = new FormData();
    formData.append('name', editForm.name.trim());
    formData.append('email', editForm.email.trim());
    formData.append('phone', editForm.phone);
    formData.append('dateOfJoining', editForm.dateOfJoining);
    formData.append('basicDetails', editForm.basicDetails);
    formData.append('aadharNumber', editForm.aadharNumber);
    formData.append('status', editForm.status);
    formData.append('department', editForm.department || 'Service');
    formData.append('role', editForm.role || '');
    formData.append('address', editForm.address || '');
    formData.append('panNumber', editForm.panNumber || '');
    formData.append('dateOfBirth', editForm.dateOfBirth || '');
    formData.append('designation', editForm.designation || '');

    if (editResumeFile) formData.append('resume', editResumeFile);
    if (editAadharFile) formData.append('aadharDoc', editAadharFile);
    if (editPhotoFile) formData.append('photoDoc', editPhotoFile);

    try {
      const res = await fetch(`${API_BASE_URL}/employees/${editForm._id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('Employee details updated successfully.');
        setShowEditModal(false);
        setEditResumeFile(null);
        setEditAadharFile(null);
        setEditPhotoFile(null);
        fetchEmployees();
      } else {
        setErrorMsg(data.error || 'Failed to update employee details.');
      }
    } catch (err) {
      setErrorMsg('Server connection failed.');
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!confirm('Are you sure you want to delete this employee? This action cannot be undone.')) return;
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch(`${API_BASE_URL}/employees/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('Employee deleted successfully.');
        fetchEmployees();
      } else {
        setErrorMsg(data.error || 'Failed to delete employee.');
      }
    } catch (err) {
      setErrorMsg('Server connection failed.');
    }
  };


  const handleToggleStatus = async (emp) => {
    const newStatus = emp.status === 'Inactive' ? 'Active' : 'Inactive';
    try {
      const res = await fetch(`${API_BASE_URL}/employees/${emp._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchEmployees();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveAttendance = async (empId) => {
    const status = attendanceMap[empId];
    try {
      const res = await fetch(`${API_BASE_URL}/employees/${empId}/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ date: attendanceDate, status })
      });
      if (res.ok) {
        fetchEmployees();
        alert('Attendance updated successfully for employee.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSalarySlip = async (e) => {
    e.preventDefault();
    if (!salaryForm.employeeId) return;

    try {
      const res = await fetch(`${API_BASE_URL}/employees/${salaryForm.employeeId}/salary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          monthYear: salaryForm.monthYear,
          basicSalary: Number(salaryForm.basicSalary) || 0,
          advances: Number(salaryForm.advances) || 0,
          deductions: Number(salaryForm.deductions) || 0,
          deductionsDescription: salaryForm.deductionsDescription,
          specialAllowance: Number(salaryForm.specialAllowance) || 0,
          otherAllowance: Number(salaryForm.otherAllowance) || 0,
          otherAllowanceDescription: salaryForm.otherAllowanceDescription
        })
      });
      if (res.ok) {
        fetchEmployees();
        alert('Salary statement saved successfully.');
        printSalarySlip();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const printSalarySlip = () => {
    if (!selectedSalaryEmployee) return;

    const printWindow = window.open('', '_blank');
    const [year, month] = salaryForm.monthYear.split('-');
    const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

    const leaveDeduct = (salaryForm.basicSalary / 30) * salaryForm.leavesCount;
    const special = Number(salaryForm.specialAllowance) || 0;
    const other = Number(salaryForm.otherAllowance) || 0;
    const otherDesc = salaryForm.otherAllowanceDescription || '';
    const deductionsDesc = salaryForm.deductionsDescription || '';

    printWindow.document.write(`
      <html>
        <head>
          <title>Salary Statement - ${selectedSalaryEmployee.name}</title>
          <style>
            body { font-family: sans-serif; color: #333; padding: 40px; line-height: 1.5; font-size: 13px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 15px; }
            .title { font-size: 20px; font-weight: bold; margin-bottom: 5px; }
            .subtitle { font-size: 12px; color: #666; font-weight: bold; letter-spacing: 1px; }
            .slip-title { text-align: center; font-size: 15px; font-weight: bold; margin: 20px 0; text-transform: uppercase; }
            .info-table, .statement-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .info-table td { padding: 6px; border: none; }
            .info-table td.label { font-weight: bold; width: 20%; }
            .statement-table th, .statement-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            .statement-table th { bg-color: #f5f5f5; font-weight: bold; }
            .right { text-align: right; }
            .total-row { font-weight: bold; font-size: 14px; background-color: #f9f9f9; }
            .footer { margin-top: 60px; display: flex; justify-content: space-between; }
            .sig-box { width: 200px; border-top: 1px solid #333; text-align: center; padding-top: 8px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">MVSS AUTOMOBILES PVT. LTD.</div>
            <div class="subtitle">AUTOMOBILE REPAIRS & SERVICES | SECUNDERABAD</div>
          </div>
          
          <div class="slip-title">Salary Slip for ${monthName} ${year}</div>

          <table class="info-table">
            <tr>
              <td class="label">Employee Name:</td><td>${selectedSalaryEmployee.name}</td>
              <td class="label">Date of Joining:</td><td>${new Date(selectedSalaryEmployee.dateOfJoining).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td class="label">Email:</td><td>${selectedSalaryEmployee.email}</td>
              <td class="label">Phone:</td><td>${selectedSalaryEmployee.phone}</td>
            </tr>
            <tr>
              <td class="label">Aadhar Number:</td><td>${selectedSalaryEmployee.aadharNumber}</td>
              <td class="label">Statement Date:</td><td>${new Date().toLocaleDateString()}</td>
            </tr>
          </table>

          <table class="statement-table">
            <thead>
              <tr>
                <th>Description</th>
                <th class="right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Basic Monthly Wage</td>
                <td class="right">₹${Number(salaryForm.basicSalary).toFixed(2)}</td>
              </tr>
              ${special > 0 ? `
              <tr>
                <td>Special Allowance</td>
                <td class="right">₹${special.toFixed(2)}</td>
              </tr>
              ` : ''}
              ${other > 0 ? `
              <tr>
                <td>Other Allowance ${otherDesc ? `(${otherDesc})` : ''}</td>
                <td class="right">₹${other.toFixed(2)}</td>
              </tr>
              ` : ''}
              <tr>
                <td>Leaves Taken (${salaryForm.leavesCount} days absent)</td>
                <td class="right">- ₹${leaveDeduct.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Advances Received</td>
                <td class="right">- ₹${Number(salaryForm.advances).toFixed(2)}</td>
              </tr>
              <tr>
                <td>Other Known Deductions ${deductionsDesc ? `(${deductionsDesc})` : ''}</td>
                <td class="right">- ₹${Number(salaryForm.deductions).toFixed(2)}</td>
              </tr>
              <tr class="total-row">
                <td>Net Payable Salary</td>
                <td class="right">₹${Number(salaryForm.calculatedNetSalary).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div style="margin-top: 30px; font-size: 11px; color: #555;">
            * This statement is generated electronically based on active attendance registers and logged salary statements.
          </div>

          <div class="footer">
            <div class="sig-box">Employee Signature</div>
            <div class="sig-box">Authorized Signatory</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handlePrintHistoricalSalarySlip = (emp, slip) => {
    const printWindow = window.open('', '_blank');
    const [year, month] = slip.monthYear.split('-');
    const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

    const leaveDeduct = (slip.basicSalary / 30) * slip.leaves;
    const special = Number(slip.specialAllowance) || 0;
    const other = Number(slip.otherAllowance) || 0;
    const otherDesc = slip.otherAllowanceDescription || '';
    const deductionsDesc = slip.deductionsDescription || '';

    printWindow.document.write(`
      <html>
        <head>
          <title>Salary Statement - ${emp.name}</title>
          <style>
            body { font-family: sans-serif; color: #333; padding: 40px; line-height: 1.5; font-size: 13px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 15px; }
            .title { font-size: 20px; font-weight: bold; margin-bottom: 5px; }
            .subtitle { font-size: 12px; color: #666; font-weight: bold; letter-spacing: 1px; }
            .slip-title { text-align: center; font-size: 15px; font-weight: bold; margin: 20px 0; text-transform: uppercase; }
            .info-table, .statement-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .info-table td { padding: 6px; border: none; }
            .info-table td.label { font-weight: bold; width: 20%; }
            .statement-table th, .statement-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            .statement-table th { bg-color: #f5f5f5; font-weight: bold; }
            .right { text-align: right; }
            .total-row { font-weight: bold; font-size: 14px; background-color: #f9f9f9; }
            .footer { margin-top: 60px; display: flex; justify-content: space-between; }
            .sig-box { width: 200px; border-top: 1px solid #333; text-align: center; padding-top: 8px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">MVSS AUTOMOBILES PVT. LTD.</div>
            <div class="subtitle">AUTOMOBILE REPAIRS & SERVICES | SECUNDERABAD</div>
          </div>
          
          <div class="slip-title">Salary Slip for ${monthName} ${year}</div>

          <table class="info-table">
            <tr>
              <td class="label">Employee Name:</td><td>${emp.name}</td>
              <td class="label">Date of Joining:</td><td>${new Date(emp.dateOfJoining).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td class="label">Email:</td><td>${emp.email}</td>
              <td class="label">Phone:</td><td>${emp.phone}</td>
            </tr>
            <tr>
              <td class="label">Aadhar Number:</td><td>${emp.aadharNumber}</td>
              <td class="label">Statement Date:</td><td>${new Date(slip.generatedAt || Date.now()).toLocaleDateString()}</td>
            </tr>
          </table>

          <table class="statement-table">
            <thead>
              <tr>
                <th>Description</th>
                <th class="right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Basic Monthly Wage</td>
                <td class="right">₹${Number(slip.basicSalary).toFixed(2)}</td>
              </tr>
              ${special > 0 ? `
              <tr>
                <td>Special Allowance</td>
                <td class="right">₹${special.toFixed(2)}</td>
              </tr>
              ` : ''}
              ${other > 0 ? `
              <tr>
                <td>Other Allowance ${otherDesc ? `(${otherDesc})` : ''}</td>
                <td class="right">₹${other.toFixed(2)}</td>
              </tr>
              ` : ''}
              <tr>
                <td>Leaves Taken (${slip.leaves} days absent)</td>
                <td class="right">- ₹${leaveDeduct.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Advances Received</td>
                <td class="right">- ₹${Number(slip.advances).toFixed(2)}</td>
              </tr>
              <tr>
                <td>Other Known Deductions ${deductionsDesc ? `(${deductionsDesc})` : ''}</td>
                <td class="right">- ₹${Number(slip.deductions).toFixed(2)}</td>
              </tr>
              <tr class="total-row">
                <td>Net Payable Salary</td>
                <td class="right">₹${Number(slip.netSalary).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div style="margin-top: 30px; font-size: 11px; color: #555;">
            * This statement is generated electronically based on active attendance registers and logged salary statements.
          </div>

          <div class="footer">
            <div class="sig-box">Employee Signature</div>
            <div class="sig-box">Authorized Signatory</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getResumeDownloadUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('blob:') || url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const hostname = window.location.hostname;
    const isCloud = hostname.includes('vercel.app') || 
                    hostname.includes('surge.sh') || 
                    hostname.includes('github.io') || 
                    hostname.includes('loca.lt') || 
                    hostname.includes('pinggy') || 
                    hostname.includes('lhr.life') || 
                    hostname.includes('ngrok');
    if (isCloud) {
      return `${API_BASE_URL.replace('/api', '')}${url}`;
    }
    return `${API_BASE_URL.replace('/api', '')}${url}`;
  };

  const handleDownloadResume = async (e, resumeUrl) => {
    e.preventDefault();
    if (!resumeUrl) return;
    const downloadUrl = getResumeDownloadUrl(resumeUrl);
    
    if (resumeUrl.startsWith('blob:') || resumeUrl.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = resumeUrl;
      link.target = '_blank';
      link.download = 'resume';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    try {
      const res = await fetch(downloadUrl);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const localUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = localUrl;
      const filename = resumeUrl.split('/').pop() || 'resume';
      link.download = filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(localUrl), 100);
    } catch (err) {
      console.error(err);
      window.open(downloadUrl, '_blank');
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(search.toLowerCase()) ||
                          emp.email.toLowerCase().includes(search.toLowerCase()) ||
                          emp.phone.includes(search) ||
                          (emp.employeeId && emp.employeeId.toLowerCase().includes(search.toLowerCase())) ||
                          (emp.department && emp.department.toLowerCase().includes(search.toLowerCase())) ||
                          (emp.role && emp.role.toLowerCase().includes(search.toLowerCase()));
    const empStatus = emp.status || 'Active';
    const matchesStatus = statusFilter === 'All' || empStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4 animate-fade-in p-1 select-none">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white">Employee Management</h2>
          <p className="text-xs text-slate-400 font-semibold dark:text-slate-500">Add staff records, track daily attendance, and calculate salary statement slips</p>
        </div>
        {activeTab === 'registry' && user?.role === 'Admin' && (
          <button
            onClick={() => {
              setErrorMsg('');
              setSuccessMsg('');
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10"
          >
            <Plus className="w-4 h-4" />
            Add Employee
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1.5 p-1 bg-slate-100/50 dark:bg-slate-900/50 rounded-xl max-w-md">
        <button
          onClick={() => setActiveTab('registry')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'registry' ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Staff Registry
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'attendance' ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          Attendance Tracker
        </button>
        <button
          onClick={() => setActiveTab('salary')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'salary' ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          Salary Generator
        </button>
      </div>

      {/* Registry Tab */}
      {activeTab === 'registry' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          {/* Search bar & Filters */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder="Search staff registry by name, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2 rounded-xl">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="All">All Staff</option>
                <option value="Active">Active Only</option>
                <option value="Inactive">Inactive Only</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4">Employee ID</th>
                  <th className="px-6 py-4">Employee Name</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4">Date of Joining</th>
                  <th className="px-6 py-4">Aadhar Number</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Details</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-350">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map(emp => (
                    <tr key={emp._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                      <td className="px-6 py-4 font-mono font-bold text-indigo-650 dark:text-indigo-400">
                        {emp.employeeId || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="block font-bold text-slate-800 dark:text-white">{emp.name}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{emp.department || 'Service'} • {emp.role || 'Staff'}</span>
                      </td>
                      <td className="px-6 py-4 font-mono">
                        <span className="block">{emp.email}</span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">{emp.phone}</span>
                      </td>
                      <td className="px-6 py-4">
                        {emp.dateOfJoining ? new Date(emp.dateOfJoining).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 font-mono">{emp.aadharNumber || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(emp)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border transition-all ${
                            emp.status === 'Inactive'
                              ? 'bg-red-50 dark:bg-red-950/20 text-red-600 border-red-200 dark:border-red-900/40 hover:bg-red-100/50'
                              : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-200 dark:border-emerald-900/40 hover:bg-emerald-100/50'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${emp.status === 'Inactive' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                          {emp.status || 'Active'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-slate-500 max-w-xs">
                        <div className="space-y-1">
                          {emp.address && (
                            <div className="flex items-start gap-1">
                              <span className="font-extrabold uppercase text-[8px] text-slate-400 mt-0.5 shrink-0">Address:</span>
                              <span className="truncate block max-w-[150px]">{emp.address}</span>
                            </div>
                          )}
                          {emp.basicDetails && (
                            <div className="flex items-start gap-1 text-[10px] text-slate-400 font-medium">
                              <span>{emp.basicDetails}</span>
                            </div>
                          )}
                          {!emp.address && !emp.basicDetails && <span>-</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => setSelectedProfileEmployee(emp)}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors"
                          title="View Profile & History"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {user?.role === 'Admin' && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(emp)}
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
                              title="Edit Employee"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteEmployee(emp._id)}
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-650 transition-colors"
                              title="Delete Employee"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        {emp.resumeUrl ? (
                          <button
                            onClick={(e) => handleDownloadResume(e, emp.resumeUrl)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 rounded-lg hover:underline text-[11px]"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download Resume
                          </button>
                        ) : (
                          <span className="text-slate-400 italic text-[11px] py-1 px-2">No File</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-slate-400 italic">
                      No employees registered in catalog yet.
                    </td>

                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Attendance Tracker Tab */}
      {activeTab === 'attendance' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wide">Daily Attendance Sheet</h3>
              <p className="text-[10px] text-slate-400 font-semibold">Select date to record or edit employee attendance records</p>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-3">
            {employees.length > 0 ? (
              employees.map(emp => {
                const currentStatus = attendanceMap[emp._id] || 'Present';
                return (
                  <div key={emp._id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-900">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-white block">{emp.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">{emp.email}</span>
                      <div className="flex flex-wrap gap-2 text-[9px] font-extrabold uppercase tracking-wider text-slate-500 mt-2 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 w-fit px-2.5 py-1 rounded-lg">
                        <span className="text-emerald-600 dark:text-emerald-400">Present: {emp.attendance?.filter(a => a.status === 'Present').length || 0}d</span>
                        <span className="text-red-500">Absent: {emp.attendance?.filter(a => a.status === 'Absent').length || 0}d</span>
                        <span className="text-amber-500">Half Day: {emp.attendance?.filter(a => a.status === 'Half Day').length || 0}d</span>
                        <span className="text-blue-500">Leave: {emp.attendance?.filter(a => a.status === 'Leave').length || 0}d</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <select
                        value={currentStatus}
                        onChange={(e) => setAttendanceMap({ ...attendanceMap, [emp._id]: e.target.value })}
                        className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold focus:outline-none"
                      >
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Half Day">Half Day</option>
                        <option value="Leave">Leave</option>
                      </select>

                      <button
                        onClick={() => handleSaveAttendance(emp._id)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100/50 rounded-lg text-xs font-bold transition-all"
                      >
                        <Save className="w-3.5 h-3.5" />
                        Save
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-slate-400 italic py-10">Add employees first to track attendance.</p>
            )}
          </div>
        </div>
      )}

      {/* Salary Slip Generator Tab */}
      {activeTab === 'salary' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inputs Column */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-6">
            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wide border-b border-slate-100 dark:border-slate-800 pb-4">Calculate Salary Statement</h3>
            
            <form onSubmit={handleSaveSalarySlip} className="space-y-6">
              {/* Section 1: General Details */}
              <div className="space-y-3">
                <span className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">1. Staff & Period</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Select Employee</label>
                    <select
                      required
                      value={salaryForm.employeeId}
                      onChange={(e) => setSalaryForm({ ...salaryForm, employeeId: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none"
                    >
                      <option value="">-- Select Staff Member --</option>
                      {employees.map(e => (
                        <option key={e._id} value={e._id}>{e.name} ({e.status || 'Active'})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Select Month & Year</label>
                    <input
                      type="month"
                      required
                      value={salaryForm.monthYear}
                      onChange={(e) => setSalaryForm({ ...salaryForm, monthYear: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Earnings & Allowances */}
              <div className="space-y-3 border-t border-slate-100 dark:border-slate-800/60 pt-4">
                <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">2. Earnings & Allowances</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Basic Monthly Salary (₹)</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      required
                      value={salaryForm.basicSalary}
                      onChange={(e) => handleSalaryNumericChange(e, 'basicSalary', true)}
                      placeholder="Enter amount"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Special Allowance (₹)</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={salaryForm.specialAllowance}
                      onChange={(e) => handleSalaryNumericChange(e, 'specialAllowance', true)}
                      placeholder="Enter amount"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Other Allowance (₹)</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={salaryForm.otherAllowance}
                      onChange={(e) => handleSalaryNumericChange(e, 'otherAllowance', true)}
                      placeholder="Enter amount"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Other Allowance Description</label>
                  <input
                    type="text"
                    value={salaryForm.otherAllowanceDescription}
                    onChange={(e) => setSalaryForm({ ...salaryForm, otherAllowanceDescription: e.target.value })}
                    placeholder="e.g. Festival Bonus, Petrol allowance, Travel reimbursement"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              {/* Section 3: Deductions */}
              <div className="space-y-3 border-t border-slate-100 dark:border-slate-800/60 pt-4">
                <span className="text-[11px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest block">3. Deductions</span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Advances Disbursed (₹)</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={salaryForm.advances}
                      onChange={(e) => handleSalaryNumericChange(e, 'advances', true)}
                      placeholder="Enter amount"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">EPF (%)</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={salaryForm.epfPercent}
                      onChange={(e) => handleSalaryNumericChange(e, 'epfPercent', true, 100)}
                      placeholder="Enter EPF %"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Other Deductions (₹)</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={salaryForm.deductions}
                      onChange={(e) => handleSalaryNumericChange(e, 'deductions', true)}
                      placeholder="Enter amount"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Deductions Description</label>
                    <input
                      type="text"
                      value={salaryForm.deductionsDescription}
                      onChange={(e) => setSalaryForm({ ...salaryForm, deductionsDescription: e.target.value })}
                      placeholder="e.g. EPF, Professional Tax, ESI"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-900 flex justify-between items-center text-xs">
                <div>
                  <span className="font-semibold text-slate-500 block">Leaves/Absents Count:</span>
                  <span className="font-bold text-slate-800 dark:text-white block mt-1">{salaryForm.leavesCount} days</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-slate-500 block">Auto Leave Deduction (per-day split):</span>
                  <span className="font-bold text-red-500 block mt-1">
                    - ₹{Math.round((salaryForm.basicSalary / 30) * salaryForm.leavesCount).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  disabled={!salaryForm.employeeId}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 disabled:opacity-50"
                >
                  Generate & Print Slip
                </button>
              </div>
            </form>
          </div>

          {/* Calculator Output View */}
          <div className="bg-slate-900 text-slate-100 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between h-full min-h-[450px]">
            <div className="space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Receipt className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Salary Preview Statement</h4>
              </div>
              
              {selectedSalaryEmployee ? (
                <div className="space-y-4">
                  {/* Staff Info block */}
                  <div className="bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-slate-400 block font-black uppercase tracking-wider">Employee Name</span>
                      <span className="text-sm font-black text-white">{selectedSalaryEmployee.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-slate-400 block font-black uppercase tracking-wider">Period</span>
                      <span className="text-[11px] font-mono text-indigo-300 font-bold uppercase">{
                        (() => {
                          const [year, month] = salaryForm.monthYear.split('-');
                          if (!year || !month) return salaryForm.monthYear;
                          return new Date(year, month - 1).toLocaleString('default', { month: 'short', year: 'numeric' });
                        })()
                      }</span>
                    </div>
                  </div>

                  {/* Earnings & Allowances */}
                  <div className="space-y-2.5 border-t border-dashed border-slate-800 pt-3">
                    <span className="text-[10px] text-slate-400 block font-extrabold uppercase tracking-wider">Earnings & Allowances</span>
                    
                    <div className="flex justify-between text-xs font-medium text-slate-300">
                      <span>Base Salary:</span>
                      <span className="font-mono text-white">₹{salaryForm.basicSalary.toLocaleString()}</span>
                    </div>

                    {Number(salaryForm.specialAllowance) > 0 && (
                      <div className="flex justify-between text-xs font-medium text-emerald-400">
                        <span>Special Allowance:</span>
                        <span className="font-mono">+ ₹{Number(salaryForm.specialAllowance).toLocaleString()}</span>
                      </div>
                    )}

                    {Number(salaryForm.otherAllowance) > 0 && (
                      <div className="flex justify-between text-xs font-medium text-emerald-400">
                        <span className="truncate max-w-[170px]">Other {salaryForm.otherAllowanceDescription ? `(${salaryForm.otherAllowanceDescription})` : ''}:</span>
                        <span className="font-mono">+ ₹{Number(salaryForm.otherAllowance).toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Deductions */}
                  <div className="space-y-2.5 border-t border-dashed border-slate-800 pt-3">
                    <span className="text-[10px] text-slate-400 block font-extrabold uppercase tracking-wider">Deductions & Offsets</span>

                    {Number(salaryForm.leavesCount) > 0 && (
                      <div className="flex justify-between text-xs font-medium text-rose-400">
                        <span>Absent Deductions ({salaryForm.leavesCount}d):</span>
                        <span className="font-mono">- ₹{Math.round((salaryForm.basicSalary / 30) * salaryForm.leavesCount).toLocaleString()}</span>
                      </div>
                    )}

                    {Number(salaryForm.advances) > 0 && (
                      <div className="flex justify-between text-xs font-medium text-rose-400">
                        <span>Advances Repayment:</span>
                        <span className="font-mono">- ₹{Number(salaryForm.advances).toLocaleString()}</span>
                      </div>
                    )}

                    {Number(salaryForm.deductions) > 0 && (
                      <div className="flex justify-between text-xs font-medium text-rose-400">
                        <span>Deduction {salaryForm.deductionsDescription ? `(${salaryForm.deductionsDescription})` : ''}:</span>
                        <span className="font-mono">- ₹{Number(salaryForm.deductions).toLocaleString()}</span>
                      </div>
                    )}

                    {Number(salaryForm.leavesCount) === 0 && Number(salaryForm.advances) === 0 && Number(salaryForm.deductions) === 0 && (
                      <div className="text-xs text-slate-500 italic py-0.5">No deductions applied for this period</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-slate-800/40 border border-slate-700/60 flex items-center justify-center animate-float">
                      <Receipt className="w-7 h-7 text-indigo-400" />
                    </div>
                    <div className="absolute inset-0 rounded-full bg-indigo-500/10 animate-ping opacity-25 animate-pulse-glow"></div>
                  </div>
                  <div className="space-y-1 max-w-[200px]">
                    <span className="text-xs font-black text-white block uppercase tracking-wider">Awaiting Staff Selection</span>
                    <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                      Select an employee and set period details on the left to calculate pay summary.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-800 pt-4 mt-6 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/40">
              <span className="text-[10px] text-slate-400 block font-black uppercase tracking-wider">Final Net Pay</span>
              <span className="text-3xl font-black text-indigo-400 block mt-1.5 font-mono">
                ₹{salaryForm.calculatedNetSalary.toLocaleString()}
              </span>
              {selectedSalaryEmployee && (
                <span className="text-[9px] text-slate-500 block mt-1">
                  * Rounded to nearest rupee. Subject to print generation logs.
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 z-50 animate-fade-in select-none overflow-hidden"
          onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false); }}
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-[1100px] h-[90vh] max-h-[90vh] flex flex-col relative overflow-hidden my-auto">
            {/* Header - Fixed Sticky */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/50 dark:border-indigo-800/40 flex items-center justify-center shrink-0">
                  <UserPlus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-800 dark:text-white uppercase tracking-wide">Register New Employee</h3>
                  <p className="text-[10px] sm:text-xs text-slate-400 font-semibold">Enter staff personal, contact, and employment details</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 flex items-center justify-center text-slate-400 transition-all duration-200 shadow-xs hover:scale-105 cursor-pointer shrink-0"
                title="Close Modal (ESC)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* Form Body - Scrollable Inside Modal Only */}
              <div className="p-5 sm:p-7 space-y-6 overflow-y-auto flex-1 min-h-0">
                {errorMsg && (
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-3.5 flex gap-2.5 text-xs text-red-650 dark:text-red-400">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="font-semibold leading-relaxed">{errorMsg}</span>
                  </div>
                )}

                {/* Section 1: Basic Information */}
                <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 border-b border-slate-200/60 dark:border-slate-800/60 pb-2.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 block" />
                    1. Personal & Contact Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name *</label>
                      <input
                        ref={addNameInputRef}
                        type="text"
                        required
                        value={addForm.name}
                        onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                        placeholder="e.g. John Doe"
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Phone Number *</label>
                      <InternationalPhoneInput
                        value={addForm.phone}
                        onChange={(val) => handlePhoneChange(val, addForm, setAddForm)}
                        country="IN"
                        variant="compact"
                        name="phone"
                        required={true}
                        ariaLabel="Phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address <span className="text-slate-400 font-normal lowercase">(optional)</span></label>
                      <input
                        type="email"
                        value={addForm.email}
                        onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                        placeholder="john@autoworkshop.com"
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Aadhaar Number (12 Digits) *</label>
                      <input
                        type="text"
                        required
                        value={addForm.aadharNumber}
                        onChange={(e) => handleAadharChange(e, addForm, setAddForm)}
                        placeholder="e.g. 1234 5678 9012"
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none font-mono focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">PAN Number <span className="text-slate-400 font-normal lowercase">(optional)</span></label>
                      <input
                        type="text"
                        value={addForm.panNumber}
                        onChange={(e) => setAddForm({ ...addForm, panNumber: e.target.value.toUpperCase().slice(0, 10) })}
                        placeholder="e.g. ABCDE1234F"
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none font-mono focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={addForm.dateOfBirth}
                        onChange={(e) => setAddForm({ ...addForm, dateOfBirth: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Employment Details */}
                <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 border-b border-slate-200/60 dark:border-slate-800/60 pb-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 block" />
                    2. Employment & Role Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Date of Joining *</label>
                      <input
                        type="date"
                        required
                        value={addForm.dateOfJoining}
                        onChange={(e) => setAddForm({ ...addForm, dateOfJoining: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Department *</label>
                      <select
                        value={addForm.department}
                        onChange={(e) => setAddForm({ ...addForm, department: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors"
                      >
                        <option value="Service">Service</option>
                        <option value="Spares">Spares</option>
                        <option value="Accounts">Accounts</option>
                        <option value="Body Shop">Body Shop</option>
                        <option value="Administration">Administration</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Role / Job Position *</label>
                      <input
                        type="text"
                        required
                        value={addForm.role}
                        onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                        placeholder="e.g. Advisor, Mechanic, Painter"
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Designation</label>
                      <input
                        type="text"
                        value={addForm.designation}
                        onChange={(e) => setAddForm({ ...addForm, designation: e.target.value })}
                        placeholder="e.g. Senior Technician"
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Employment Status</label>
                      <select
                        value={addForm.status}
                        onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 3: Address & Emergency Contacts */}
                <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5 border-b border-slate-200/60 dark:border-slate-800/60 pb-2.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 block" />
                    3. Address & Emergency Contacts
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Residential Address *</label>
                      <input
                        type="text"
                        required
                        value={addForm.address}
                        onChange={(e) => setAddForm({ ...addForm, address: e.target.value })}
                        placeholder="House No, Street, Landmark, City, Pincode"
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Notes / Emergency Contacts</label>
                      <input
                        type="text"
                        value={addForm.basicDetails}
                        onChange={(e) => setAddForm({ ...addForm, basicDetails: e.target.value })}
                        placeholder="Emergency contact info, references..."
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: Identity & Profile Documents */}
                <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5 border-b border-slate-200/60 dark:border-slate-800/60 pb-2.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500 block" />
                    4. Profile & Identity Documents
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Profile Photo (Image)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file && file.size > 1.5 * 1024 * 1024 && token === 'mock_jwt_token_for_offline_demo') {
                            alert('File size exceeds 1.5MB. Please choose a smaller photo file.');
                            e.target.value = null;
                            return;
                          }
                          setPhotoFile(file);
                        }}
                        className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-200 hover:file:bg-slate-200 transition-colors cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Aadhaar Doc (PDF/Img)</label>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file && file.size > 1.5 * 1024 * 1024 && token === 'mock_jwt_token_for_offline_demo') {
                            alert('File size exceeds 1.5MB. Please choose a smaller file.');
                            e.target.value = null;
                            return;
                          }
                          setAadharFile(file);
                        }}
                        className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-200 hover:file:bg-slate-200 transition-colors cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Resume Doc (PDF/Img)</label>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file && file.size > 1.5 * 1024 * 1024 && token === 'mock_jwt_token_for_offline_demo') {
                            alert('File size exceeds 1.5MB. Please choose a smaller resume file.');
                            e.target.value = null;
                            return;
                          }
                          setResumeFile(file);
                        }}
                        className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-200 hover:file:bg-slate-200 transition-colors cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sticky Footer - Always Fixed at Bottom */}
              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end items-center gap-3 shrink-0 rounded-b-3xl z-10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Employee Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && (
        <div 
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 z-50 animate-fade-in select-none overflow-hidden"
          onClick={(e) => { if (e.target === e.currentTarget) setShowEditModal(false); }}
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-[1100px] h-[90vh] max-h-[90vh] flex flex-col relative overflow-hidden my-auto">
            {/* Header - Fixed Sticky */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/50 dark:border-indigo-800/40 flex items-center justify-center shrink-0">
                  <Edit2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-800 dark:text-white uppercase tracking-wide flex items-center gap-2">
                    Edit Employee Profile
                    <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/50 text-indigo-650 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800/60">
                      {editForm.employeeId || 'N/A'}
                    </span>
                  </h3>
                  <p className="text-[10px] sm:text-xs text-slate-400 font-semibold">Update employee details, contact info, and documents</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 flex items-center justify-center text-slate-400 transition-all duration-200 shadow-xs hover:scale-105 cursor-pointer shrink-0"
                title="Close Modal (ESC)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* Form Body - Scrollable Inside Modal Only */}
              <div className="p-5 sm:p-7 space-y-6 overflow-y-auto flex-1 min-h-0">
                {errorMsg && (
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-3.5 flex gap-2.5 text-xs text-red-650 dark:text-red-400">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="font-semibold leading-relaxed">{errorMsg}</span>
                  </div>
                )}

                {/* Section 1: Personal Details */}
                <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 border-b border-slate-200/60 dark:border-slate-800/60 pb-2.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 block" />
                    1. Personal & Contact Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name *</label>
                      <input
                        ref={editNameInputRef}
                        type="text"
                        required
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Phone Number *</label>
                      <InternationalPhoneInput
                        value={editForm.phone}
                        onChange={(val) => handlePhoneChange(val, editForm, setEditForm)}
                        country="IN"
                        variant="compact"
                        name="phone"
                        required={true}
                        ariaLabel="Phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address <span className="text-slate-400 font-normal lowercase">(optional)</span></label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        placeholder="john@autoworkshop.com"
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Aadhaar Number (12 Digits) *</label>
                      <input
                        type="text"
                        required
                        value={editForm.aadharNumber}
                        onChange={(e) => handleAadharChange(e, editForm, setEditForm)}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none font-mono focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">PAN Number <span className="text-slate-400 font-normal lowercase">(optional)</span></label>
                      <input
                        type="text"
                        value={editForm.panNumber}
                        onChange={(e) => setEditForm({ ...editForm, panNumber: e.target.value.toUpperCase().slice(0, 10) })}
                        placeholder="e.g. ABCDE1234F"
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none font-mono focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={editForm.dateOfBirth}
                        onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Employment Details */}
                <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 border-b border-slate-200/60 dark:border-slate-800/60 pb-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 block" />
                    2. Employment & Role Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Date of Joining *</label>
                      <input
                        type="date"
                        required
                        value={editForm.dateOfJoining}
                        onChange={(e) => setEditForm({ ...editForm, dateOfJoining: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Department *</label>
                      <select
                        value={editForm.department}
                        onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors"
                      >
                        <option value="Service">Service</option>
                        <option value="Spares">Spares</option>
                        <option value="Accounts">Accounts</option>
                        <option value="Body Shop">Body Shop</option>
                        <option value="Administration">Administration</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Role / Job Position *</label>
                      <input
                        type="text"
                        required
                        value={editForm.role}
                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                        placeholder="e.g. Advisor, Mechanic, Painter"
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Designation</label>
                      <input
                        type="text"
                        value={editForm.designation}
                        onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                        placeholder="e.g. Senior Technician"
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Employment Status</label>
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 3: Address & Emergency Contacts */}
                <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5 border-b border-slate-200/60 dark:border-slate-800/60 pb-2.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 block" />
                    3. Address & Emergency Contacts
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Residential Address *</label>
                      <input
                        type="text"
                        required
                        value={editForm.address}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Notes / Emergency Contacts</label>
                      <input
                        type="text"
                        value={editForm.basicDetails}
                        onChange={(e) => setEditForm({ ...editForm, basicDetails: e.target.value })}
                        placeholder="Emergency contact info, references..."
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: Identity & Profile Documents */}
                <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5 border-b border-slate-200/60 dark:border-slate-800/60 pb-2.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500 block" />
                    4. Profile & Identity Documents
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Profile Photo (Image) <span className="text-slate-400 font-normal lowercase">(optional update)</span></label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file && file.size > 1.5 * 1024 * 1024 && token === 'mock_jwt_token_for_offline_demo') {
                            alert('File size exceeds 1.5MB. Please choose a smaller photo file.');
                            e.target.value = null;
                            return;
                          }
                          setEditPhotoFile(file);
                        }}
                        className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-200 hover:file:bg-slate-200 transition-colors cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Aadhaar Doc (PDF/Img) <span className="text-slate-400 font-normal lowercase">(optional update)</span></label>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file && file.size > 1.5 * 1024 * 1024 && token === 'mock_jwt_token_for_offline_demo') {
                            alert('File size exceeds 1.5MB. Please choose a smaller file.');
                            e.target.value = null;
                            return;
                          }
                          setEditAadharFile(file);
                        }}
                        className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-200 hover:file:bg-slate-200 transition-colors cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Resume Doc (PDF/Img) <span className="text-slate-400 font-normal lowercase">(optional update)</span></label>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file && file.size > 1.5 * 1024 * 1024 && token === 'mock_jwt_token_for_offline_demo') {
                            alert('File size exceeds 1.5MB. Please choose a smaller resume file.');
                            e.target.value = null;
                            return;
                          }
                          setEditResumeFile(file);
                        }}
                        className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-200 hover:file:bg-slate-200 transition-colors cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sticky Footer - Always Fixed at Bottom */}
              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end items-center gap-3 shrink-0 rounded-b-3xl z-10">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employee History & Profile Modal */}
      {selectedProfileEmployee && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in select-none">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wide">Employee History & Profile</h3>
              <button
                onClick={() => setSelectedProfileEmployee(null)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-650 transition-colors text-xs font-bold"
              >
                Close
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Header profile summary card */}
              <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                {selectedProfileEmployee.photoUrl ? (
                  <img
                    src={getResumeDownloadUrl(selectedProfileEmployee.photoUrl)}
                    alt={selectedProfileEmployee.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-indigo-500 shadow-sm shrink-0"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/150';
                    }}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-indigo-500 text-white flex items-center justify-center text-2xl font-black shrink-0 shadow-sm">
                    {selectedProfileEmployee.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                )}
                
                <div className="text-center sm:text-left space-y-1">
                  <h4 className="text-base font-black text-slate-800 dark:text-white">{selectedProfileEmployee.name}</h4>
                  <span className="text-xs font-mono font-bold text-indigo-650 dark:text-indigo-400 block">
                    {selectedProfileEmployee.employeeId || 'N/A'}
                  </span>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 mt-2">
                    <span className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400 rounded-full text-[10px] font-bold">
                      {selectedProfileEmployee.department || 'Service'}
                    </span>
                    <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-400 rounded-full text-[10px] font-bold">
                      {selectedProfileEmployee.designation || selectedProfileEmployee.role || 'Staff'}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedProfileEmployee.status === 'Inactive' 
                        ? 'bg-red-50 dark:bg-red-950/30 text-red-650 dark:text-red-400 border border-red-200' 
                        : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-605 dark:text-emerald-400 border border-emerald-200'
                    }`}>
                      {selectedProfileEmployee.status || 'Active'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <div className="space-y-3">
                <h5 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Personal & Professional Info</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-950/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Mobile Number</span>
                    <span className="font-mono text-slate-850 dark:text-slate-200">{selectedProfileEmployee.phone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Email Address</span>
                    <span className="text-slate-850 dark:text-slate-200 font-mono">{selectedProfileEmployee.email}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Date of Joining</span>
                    <span className="text-slate-850 dark:text-slate-200">
                      {selectedProfileEmployee.dateOfJoining ? new Date(selectedProfileEmployee.dateOfJoining).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Date of Birth</span>
                    <span className="text-slate-850 dark:text-slate-200">
                      {selectedProfileEmployee.dateOfBirth ? new Date(selectedProfileEmployee.dateOfBirth).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">PAN Number</span>
                    <span className="font-mono uppercase text-slate-850 dark:text-slate-200">{selectedProfileEmployee.panNumber || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Aadhaar Number</span>
                    <span className="font-mono text-slate-850 dark:text-slate-200">{selectedProfileEmployee.aadharNumber || 'N/A'}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[10px] text-slate-400 font-bold block">Address</span>
                    <span className="text-slate-850 dark:text-slate-200">{selectedProfileEmployee.address || 'N/A'}</span>
                  </div>
                  {selectedProfileEmployee.basicDetails && (
                    <div className="sm:col-span-2">
                      <span className="text-[10px] text-slate-400 font-bold block">Basic Details / References</span>
                      <span className="text-slate-800 dark:text-slate-300 whitespace-pre-line">{selectedProfileEmployee.basicDetails}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Document Downloads */}
              <div className="space-y-3">
                <h5 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Verification Documents</h5>
                <div className="flex flex-wrap gap-3">
                  {selectedProfileEmployee.resumeUrl ? (
                    <button
                      onClick={(e) => handleDownloadResume(e, selectedProfileEmployee.resumeUrl)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 rounded-xl hover:bg-indigo-100/50 text-xs font-bold"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Resume
                    </button>
                  ) : (
                    <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950 text-slate-400 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs font-semibold">
                      No Resume Uploaded
                    </div>
                  )}

                  {selectedProfileEmployee.aadharDocUrl ? (
                    <button
                      onClick={(e) => handleDownloadResume(e, selectedProfileEmployee.aadharDocUrl)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 rounded-xl hover:bg-indigo-100/50 text-xs font-bold"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Aadhaar Doc
                    </button>
                  ) : (
                    <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950 text-slate-400 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs font-semibold">
                      No Aadhaar Doc Uploaded
                    </div>
                  )}

                  {selectedProfileEmployee.photoUrl ? (
                    <button
                      onClick={(e) => handleDownloadResume(e, selectedProfileEmployee.photoUrl)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 rounded-xl hover:bg-indigo-100/50 text-xs font-bold"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Profile Photo
                    </button>
                  ) : null}
                </div>
              </div>

              {/* History & Logs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Attendance Summary */}
                <div className="space-y-3">
                  <h5 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Attendance Breakdown</h5>
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2 text-xs font-bold">
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Present Days</span>
                      <span>{selectedProfileEmployee.attendance?.filter(a => a.status === 'Present').length || 0} days</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> Absent Days</span>
                      <span>{selectedProfileEmployee.attendance?.filter(a => a.status === 'Absent').length || 0} days</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Half Days</span>
                      <span>{selectedProfileEmployee.attendance?.filter(a => a.status === 'Half Day').length || 0} days</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /> Leave Days</span>
                      <span>{selectedProfileEmployee.attendance?.filter(a => a.status === 'Leave').length || 0} days</span>
                    </div>
                  </div>
                </div>

                {/* Salary slip Timeline archives */}
                <div className="space-y-3">
                  <h5 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Salary Statement Logs</h5>
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2.5 max-h-[160px] overflow-y-auto text-xs font-semibold">
                    {selectedProfileEmployee.salaries && selectedProfileEmployee.salaries.length > 0 ? (
                      selectedProfileEmployee.salaries.slice().sort((a,b) => b.monthYear.localeCompare(a.monthYear)).map((slip, index) => {
                        const [year, month] = slip.monthYear.split('-');
                        const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'short', year: 'numeric' });
                        return (
                          <div key={index} className="flex justify-between items-center border-b border-slate-100 dark:border-slate-900 pb-2 last:border-b-0 last:pb-0">
                            <div>
                              <span className="block font-bold text-slate-850 dark:text-slate-200">{monthName}</span>
                              <span className="block text-[10px] text-emerald-600 font-bold">₹{slip.netSalary.toLocaleString()}</span>
                            </div>
                            <button
                              onClick={() => handlePrintHistoricalSalarySlip(selectedProfileEmployee, slip)}
                              className="px-2.5 py-1 bg-white dark:bg-slate-900 text-[10px] border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 font-bold dark:hover:bg-slate-800"
                            >
                              Print
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <span className="text-slate-400 italic block py-4 text-center">No statements generated.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
