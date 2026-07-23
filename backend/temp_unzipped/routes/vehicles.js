const express = require('express');
const Vehicle = require('../models/Vehicle');
const Customer = require('../models/Customer');
const JobCard = require('../models/JobCard');
const { auth } = require('../middleware/auth');
const { logAction } = require('../utils/logger');
const router = express.Router();

// List all vehicles with search
router.get('/', auth, async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query.$or = [
        { vehicleNumber: { $regex: search, $options: 'i' } },
        { chassisNumber: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } }
      ];
    }
    const vehicles = await Vehicle.find(query).populate('customerId').sort({ createdAt: -1 });
    res.send(vehicles);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch vehicles.' });
  }
});

// Find vehicle by number
router.get('/number/:vehicleNumber', auth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ 
      vehicleNumber: req.params.vehicleNumber.toUpperCase().replace(/\s/g, '') 
    }).populate('customerId');
    
    if (!vehicle) {
      return res.status(404).send({ error: 'Vehicle not found.' });
    }
    res.send(vehicle);
  } catch (error) {
    res.status(500).send({ error: 'Failed to find vehicle.' });
  }
});

// Get vehicle details by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate('customerId');
    if (!vehicle) return res.status(404).send({ error: 'Vehicle not found.' });
    res.send(vehicle);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch vehicle.' });
  }
});

// Create vehicle
router.post('/', auth, async (req, res) => {
  try {
    const vehicleData = {
      ...req.body,
      vehicleNumber: req.body.vehicleNumber.toUpperCase().replace(/\s/g, '')
    };
    
    const existingVehicle = await Vehicle.findOne({ vehicleNumber: vehicleData.vehicleNumber });
    if (existingVehicle) {
      return res.status(400).send({ error: 'Vehicle with this registration number already exists.' });
    }

    const vehicle = new Vehicle(vehicleData);
    await vehicle.save();
    await logAction(req.user, 'VEHICLE_CREATE', `Created vehicle ${vehicle.vehicleNumber} (Make: ${vehicle.make} ${vehicle.model})`, req);
    res.status(201).send(vehicle);
  } catch (error) {
    res.status(400).send({ error: 'Failed to create vehicle.' });
  }
});

// Update vehicle
router.put('/:id', auth, async (req, res) => {
  try {
    const vehicleData = { ...req.body };
    if (vehicleData.vehicleNumber) {
      vehicleData.vehicleNumber = vehicleData.vehicleNumber.toUpperCase().replace(/\s/g, '');
    }
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, vehicleData, { new: true, runValidators: true });
    if (!vehicle) return res.status(404).send({ error: 'Vehicle not found.' });
    await logAction(req.user, 'VEHICLE_UPDATE', `Updated vehicle ${vehicle.vehicleNumber}`, req);
    res.send(vehicle);
  } catch (error) {
    res.status(400).send({ error: 'Failed to update vehicle.' });
  }
});

// Get Vehicle Service History
router.get('/:id/history', auth, async (req, res) => {
  try {
    const jobCards = await JobCard.find({ vehicleId: req.params.id })
      .populate('serviceAdvisorId', 'name')
      .sort({ date: -1 });
    res.send(jobCards);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch vehicle service history.' });
  }
});

// Get vehicles by customer ID
router.get('/customer/:customerId', auth, async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ customerId: req.params.customerId }).sort({ createdAt: -1 });
    res.send(vehicles);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch customer vehicles.' });
  }
});

// Delete Vehicle
router.delete('/:id', auth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).send({ error: 'Vehicle not found.' });
    await logAction(req.user, 'VEHICLE_DELETE', `Deleted vehicle ${vehicle.vehicleNumber}`, req);
    res.send({ message: 'Vehicle deleted successfully.' });
  } catch (error) {
    res.status(500).send({ error: 'Failed to delete vehicle.' });
  }
});

module.exports = router;
