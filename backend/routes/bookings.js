const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { Resend } = require('resend');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const Message = require('../models/Message');
const { logAction } = require('../utils/logger');

// Create new booking (Public)
router.post('/', async (req, res) => {
  try {
    const { customerName, mobile, vehicleNumber, serviceType, bookingDate, bookingTime, remarks } = req.body;
    
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
      bookingTime: bTime,
      remarks: remarks || ''
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
      body: `${customerName} has requested a service slot for vehicle ${vehicleNumber} (Type: ${serviceType}) on ${bDate} at ${bTime}. Remarks: ${remarks || 'None'}`,
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

    // Send email notification in background using Resend SDK
    const htmlBody = `
      <h3>New Service Booking Received</h3>
      <p><strong>Customer Name:</strong> ${customerName}</p>
      <p><strong>Contact Number:</strong> ${mobile}</p>
      <p><strong>Vehicle Number:</strong> ${vehicleNumber}</p>
      <p><strong>Service Category:</strong> ${serviceType}</p>
      <p><strong>Booking Date:</strong> ${bDate} at ${bTime}</p>
      <p><strong>Remarks:</strong> ${remarks || 'None'}</p>
    `;

    const resendApiKey = process.env.RESEND_API_KEY || 're_mock_key';
    const resend = new Resend(resendApiKey);

    console.log('[EMAIL] Sending service booking notification email via Resend SDK to accounts@auto4m.in...');
    
    // Dispatched in background asynchronously (non-blocking)
    resend.emails.send({
      from: 'MVSS Automobiles <onboarding@resend.dev>',
      to: 'accounts@auto4m.in',
      subject: 'New Service Booking - MVSS Automobiles',
      html: htmlBody
    })
    .then((data) => {
      if (data.error) {
        console.error("[EMAIL] Resend SDK Error Details:", data.error);
      } else {
        console.log("[EMAIL] Email sent successfully via Resend SDK. ID:", data.data ? data.data.id : data.id);
      }
    })
    .catch((err) => {
      console.error("[EMAIL] Resend SDK Failed to send email:", err);
    });

    res.status(201).json({
      success: true,
      message: "Booking submitted successfully. Our team will contact you shortly."
    });
  } catch (err) {
    console.error('Failed to create booking:', err);
    res.status(500).json({
      success: false,
      message: "Failed to create booking"
    });
  }
});

module.exports = router;
