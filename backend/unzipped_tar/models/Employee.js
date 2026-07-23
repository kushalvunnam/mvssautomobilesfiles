const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  status: { type: String, enum: ['Present', 'Absent', 'Half Day', 'Leave'], required: true }
});

const salarySchema = new mongoose.Schema({
  monthYear: { type: String, required: true }, // 'YYYY-MM'
  basicSalary: { type: Number, required: true },
  leaves: { type: Number, default: 0 },
  advances: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  deductionsDescription: { type: String, default: '' },
  specialAllowance: { type: Number, default: 0 },
  otherAllowance: { type: Number, default: 0 },
  otherAllowanceDescription: { type: String, default: '' },
  netSalary: { type: Number, required: true },
  generatedAt: { type: Date, default: Date.now }
});

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  employeeId: { type: String, unique: true },
  department: { type: String, enum: ['Service', 'Spares', 'Accounts', 'Body Shop', 'Administration'], default: 'Service' },
  role: { type: String, default: '' },
  address: { type: String, default: '' },
  panNumber: { type: String, default: '', trim: true, uppercase: true },
  dateOfBirth: { type: Date },
  designation: { type: String, default: '', trim: true },
  aadharDocUrl: { type: String, default: '' },
  photoUrl: { type: String, default: '' },
  phone: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[6-9]\d{9}$/.test(v);
      },
      message: props => `${props.value} is not a valid 10-digit Indian mobile number!`
    }
  },
  dateOfJoining: { type: Date, required: true },
  basicDetails: { type: String, default: '' },
  aadharNumber: { type: String, required: true },
  resumeUrl: { type: String, default: '' }, // Path to uploaded file
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  attendance: [attendanceSchema],
  salaries: [salarySchema]
}, { timestamps: true });

// Sequential employeeId auto-generation
employeeSchema.pre('save', async function(next) {
  if (this.isNew && !this.employeeId) {
    try {
      const lastEmp = await this.constructor.findOne(
        { employeeId: { $regex: '^EMP-\\d+$' } },
        { employeeId: 1 },
        { sort: { createdAt: -1 } }
      );
      let nextNum = 1001;
      if (lastEmp && lastEmp.employeeId) {
        const match = lastEmp.employeeId.match(/EMP-(\d+)/);
        if (match) {
          nextNum = parseInt(match[1], 10) + 1;
        }
      }
      
      // Defensive check to guarantee absolute uniqueness
      let isUnique = false;
      while (!isUnique) {
        const existing = await this.constructor.findOne({ employeeId: `EMP-${nextNum}` });
        if (!existing) {
          isUnique = true;
        } else {
          nextNum++;
        }
      }

      this.employeeId = `EMP-${nextNum}`;
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('Employee', employeeSchema);
