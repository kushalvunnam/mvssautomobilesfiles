const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const JobCard = require('../models/JobCard');
const Customer = require('../models/Customer');
const Vehicle = require('../models/Vehicle');
const { auth, restrictTo } = require('../middleware/auth');
const { logAction } = require('../utils/logger');
const { generateJobCardPDF, generateGatePassPDF } = require('../utils/pdfGenerator');
const router = express.Router();

// Multer Local Storage Config
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Helper to auto-generate Job Card Number
const generateJobCardNo = async () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  
  // Find job cards created today
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));
  
  const count = await JobCard.countDocuments({
    createdAt: { $gte: startOfDay, $lte: endOfDay }
  });
  
  const sequence = String(count + 1).padStart(3, '0');
  return `JC-${dateStr}-${sequence}`;
};



// List all job cards with search & filters
router.get('/', auth, async (req, res) => {
  try {
    const { search, status, advisor } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    if (advisor) {
      query.serviceAdvisorId = advisor;
    }

    let customerIds = [];
    let vehicleIds = [];

    if (search) {
      // Find matching customers or vehicles
      const customers = await Customer.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { mobile: { $regex: search, $options: 'i' } }
        ]
      });
      customerIds = customers.map(c => c._id);

      const vehicles = await Vehicle.find({
        vehicleNumber: { $regex: search, $options: 'i' }
      });
      vehicleIds = vehicles.map(v => v._id);

      query.$or = [
        { jobCardNo: { $regex: search, $options: 'i' } },
        { customerId: { $in: customerIds } },
        { vehicleId: { $in: vehicleIds } }
      ];
    }

    const jobCards = await JobCard.find(query)
      .populate('customerId')
      .populate('vehicleId')
      .populate('serviceAdvisorId', 'name')
      .sort({ createdAt: -1 });

    res.send(jobCards);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch job cards.' });
  }
});

// Create digital job card
router.post('/', auth, restrictTo('Admin', 'Service', 'Accounts', 'Body Shop', 'Reception'), async (req, res) => {
  try {
    const jobCardNo = await generateJobCardNo();
    const today = new Date();
    const timeStr = today.toTimeString().split(' ')[0].slice(0, 5); // HH:MM

    const jobCardData = {
      ...req.body,
      jobCardNo,
      time: req.body.time || timeStr,
      serviceAdvisorId: req.user._id,
    };

    const jobCard = new JobCard(jobCardData);
    await jobCard.save();

    // Automatically create a notification
    try {
      const Customer = require('../models/Customer');
      const VehicleModel = require('../models/Vehicle');
      const Notification = require('../models/Notification');
      
      const customer = await Customer.findById(jobCard.customerId);
      const vehicle = await VehicleModel.findById(jobCard.vehicleId);

      const notification = new Notification({
        type: 'jobcard',
        title: 'Job Card Created',
        message: `Job card ${jobCard.jobCardNo} has been created for vehicle ${vehicle ? vehicle.vehicleNumber : 'N/A'}.`,
        vehicleNumber: vehicle ? vehicle.vehicleNumber : undefined,
        customerName: customer ? customer.name : undefined
      });
      await notification.save();
    } catch (notifErr) {
      console.error('Failed to create job card notification:', notifErr);
    }

    // Update odometer reading on the Vehicle model
    await Vehicle.findByIdAndUpdate(jobCard.vehicleId, { odometerReading: jobCard.odometerReading });

    await logAction(req.user, 'JOBCARD_CREATE', `Created Job Card ${jobCardNo} for vehicle ID ${jobCard.vehicleId}`, req);
    res.status(201).send(jobCard);
  } catch (error) {
    res.status(400).send({ error: 'Failed to create job card: ' + error.message });
  }
});

// Upload Photo
router.post('/:id/photo', auth, upload.single('photo'), async (req, res) => {
  try {
    const jobCard = await JobCard.findById(req.params.id);
    if (!jobCard) return res.status(404).send({ error: 'Job Card not found.' });

    const photoType = req.body.photoType || 'Vehicle';
    const fileUrl = `/uploads/${req.file.filename}`;

    jobCard.photos.push({
      url: fileUrl,
      photoType
    });
    
    await jobCard.save();
    res.send({ message: 'Photo uploaded successfully.', photos: jobCard.photos });
  } catch (error) {
    res.status(500).send({ error: 'Failed to upload photo.' });
  }
});

// Update digital job card
router.put('/:id', auth, async (req, res) => {
  try {
    const jobCard = await JobCard.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!jobCard) return res.status(404).send({ error: 'Job Card not found.' });

    if (req.body.status) {
      const { calculateBillingSummary } = require('../utils/billing');
      await calculateBillingSummary(jobCard._id);
    }

    if (req.body.odometerReading) {
      await Vehicle.findByIdAndUpdate(jobCard.vehicleId, { odometerReading: req.body.odometerReading });
    }

    await logAction(req.user, 'JOBCARD_UPDATE', `Updated Job Card ${jobCard.jobCardNo}. Status: ${jobCard.status}`, req);
    res.send(jobCard);
  } catch (error) {
    res.status(400).send({ error: 'Failed to update job card.' });
  }
});

// Get Single Job Card Details
router.get('/:id', auth, async (req, res) => {
  try {
    const jobCard = await JobCard.findById(req.params.id)
      .populate('customerId')
      .populate('vehicleId')
      .populate('serviceAdvisorId', 'name');

    if (!jobCard) return res.status(404).send({ error: 'Job Card not found.' });
    res.send(jobCard);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch job card details.' });
  }
});

// Download Job Card PDF
router.get('/:id/pdf', auth, async (req, res) => {
  try {
    const jobCard = await JobCard.findById(req.params.id);
    if (!jobCard) return res.status(404).send({ error: 'Job Card not found.' });

    const customer = (jobCard.customerId ? await Customer.findById(jobCard.customerId) : null) || { name: 'Walk-in Customer', mobile: 'N/A' };
    const vehicle = (jobCard.vehicleId ? await Vehicle.findById(jobCard.vehicleId) : null) || { vehicleNumber: 'N/A', make: 'N/A', model: 'N/A' };

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=jobcard-${jobCard.jobCardNo}.pdf`);

    await logAction(req.user, 'REPORT_EXPORTED', `Exported PDF for Job Card ${jobCard.jobCardNo}`, req);

    generateJobCardPDF(jobCard, customer, vehicle, res);
  } catch (error) {
    res.status(500).send({ error: 'Failed to generate PDF: ' + error.message });
  }
});

// Download Gate Pass PDF from Job Card
router.get('/:id/gatepass/pdf', auth, async (req, res) => {
  try {
    const jobCard = await JobCard.findById(req.params.id);
    if (!jobCard) return res.status(404).send({ error: 'Job Card not found.' });

    const customer = (jobCard.customerId ? await Customer.findById(jobCard.customerId) : null) || { name: 'Walk-in Customer', mobile: 'N/A' };
    const vehicle = (jobCard.vehicleId ? await Vehicle.findById(jobCard.vehicleId) : null) || { vehicleNumber: 'N/A', make: 'N/A', model: 'N/A' };

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=gatepass-${jobCard.jobCardNo}.pdf`);

    await logAction(req.user, 'REPORT_EXPORTED', `Exported Gate Pass PDF for Job Card ${jobCard.jobCardNo}`, req);

    generateGatePassPDF(jobCard, customer, vehicle, res);
  } catch (error) {
    res.status(500).send({ error: 'Failed to generate Gate Pass PDF: ' + error.message });
  }
});

// DELETE: Delete a Job Card (Admin only)
router.delete('/:id', auth, restrictTo('Admin'), async (req, res) => {
  try {
    const jobCard = await JobCard.findById(req.params.id);
    if (!jobCard) return res.status(404).send({ error: 'Job Card not found.' });

    await JobCard.findByIdAndDelete(req.params.id);

    // Create database notification trigger
    try {
      const Notification = require('../models/Notification');
      const Customer = require('../models/Customer');
      const VehicleModel = require('../models/Vehicle');
      const customer = await Customer.findById(jobCard.customerId);
      const vehicle = await VehicleModel.findById(jobCard.vehicleId);

      const notification = new Notification({
        type: 'jobcard',
        title: 'Job Card Deleted',
        message: `Job card ${jobCard.jobCardNo} has been deleted.`,
        vehicleNumber: vehicle ? vehicle.vehicleNumber : undefined,
        customerName: customer ? customer.name : undefined
      });
      await notification.save();
    } catch (notifErr) {
      console.error('Failed to create job card deletion notification:', notifErr);
    }

    await logAction(req.user, 'JOBCARD_DELETE', `Deleted Job Card ${jobCard.jobCardNo}`, req);
    res.send({ message: 'Job Card deleted successfully.' });
  } catch (error) {
    res.status(500).send({ error: 'Failed to delete job card: ' + error.message });
  }
});

module.exports = router;
