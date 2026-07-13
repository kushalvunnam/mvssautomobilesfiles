const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const nodemailer = require('nodemailer');
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

    // Send email notification to accounts@auto4m.in (Zoho SMTP Configuration) in background
    const htmlBody = `
      <h3>New Service Booking Received</h3>
      <p><strong>Customer Name:</strong> ${customerName}</p>
      <p><strong>Contact Number:</strong> ${mobile}</p>
      <p><strong>Vehicle Number:</strong> ${vehicleNumber}</p>
      <p><strong>Service Category:</strong> ${serviceType}</p>
      <p><strong>Booking Date:</strong> ${bDate} at ${bTime}</p>
      <p><strong>Remarks:</strong> ${remarks || 'None'}</p>
    `;

    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.zoho.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: process.env.EMAIL_USER || 'accounts@auto4m.in',
          pass: process.env.EMAIL_PASS || 'mockpass123'
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
        logger: true,
        debug: true
      });

      transporter.verify((error, success) => {
        if (error) {
          console.error("SMTP Verification Failed:", error);
        } else {
          console.log("SMTP Ready");
        }
      });

      const mailOptions = {
        from: process.env.EMAIL_USER || 'accounts@auto4m.in',
        to: 'accounts@auto4m.in',
        subject: 'New Service Booking - MVSS Automobiles',
        html: htmlBody
      };

      // Dispatched in background asynchronously (non-blocking)
      transporter.sendMail(mailOptions)
        .then((info) => {
          console.log("Email sent successfully via Zoho SMTP. Info: " + (info ? info.response : ''));
        })
        .catch(err => {
          console.error("Email failed via Zoho SMTP:", err);
        });
    } catch (err) {
      console.warn('Transporter setup failed in background:', err.message);
    }

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
