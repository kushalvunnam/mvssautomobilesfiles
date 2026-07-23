const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const Message = require('../models/Message');
const { logAction } = require('../utils/logger');

// Create new booking (Public)
router.post('/', async (req, res) => {
  try {
    const { customerName, mobile, vehicleNumber, serviceType, bookingDate, bookingTime } = req.body;
    
    if (!customerName || !mobile || !vehicleNumber || !serviceType) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const bDate = bookingDate || new Date().toLocaleDateString('en-IN');
    const bTime = bookingTime || new Date().toLocaleTimeString('en-IN');

    // Save booking data normally
    const booking = new Booking({
      customerName,
      mobile,
      vehicleNumber,
      serviceType,
      bookingDate: bDate,
      bookingTime: bTime
    });
    await booking.save();

    // Automatically create a notification
    const notification = new Notification({
      type: 'booking',
      title: 'New Service Booking',
      message: `${customerName} has requested a service appointment.`,
      customerName,
      mobile,
      vehicleNumber,
      serviceType,
      status: 'unread'
    });
    await notification.save();

    // Automatically create a message inquiry
    const message = new Message({
      type: 'booking',
      senderName: customerName,
      phone: mobile,
      subject: 'Service Booking Message',
      body: `${customerName} has requested a service slot for vehicle ${vehicleNumber} (Type: ${serviceType}) on ${bDate} at ${bTime}.`,
      status: 'unread'
    });
    await message.save();

    // Log booking creation action
    const guestUser = {
      _id: new mongoose.Types.ObjectId(),
      name: customerName,
      role: 'Guest'
    };
    await logAction(guestUser, 'BOOKING_CREATE', `Customer ${customerName} requested service booking for ${vehicleNumber} (Type: ${serviceType})`, req);

    res.status(201).json({ message: 'Booking created successfully', booking });
  } catch (err) {
    console.error('Failed to create booking:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
