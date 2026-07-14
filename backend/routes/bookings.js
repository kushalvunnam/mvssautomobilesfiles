const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const https = require('https');
const router = express.Router();
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const Message = require('../models/Message');
const { logAction } = require('../utils/logger');

const BOOKING_WEBHOOK_URL = process.env.BOOKING_WEBHOOK_URL || 'https://srinidhibusiness.app.n8n.cloud/webhook/3f959cc4-2a46-4d25-b28f-cc2ca54d9e7b';

function postToBookingWebhook(payload) {
  return new Promise((resolve, reject) => {
    const url = new URL(BOOKING_WEBHOOK_URL);
    const transport = url.protocol === 'https:' ? https : http;
    const body = JSON.stringify(payload);

    const request = transport.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (response) => {
      let responseBody = '';
      response.on('data', (chunk) => {
        responseBody += chunk;
      });
      response.on('end', () => {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve({ statusCode: response.statusCode, body: responseBody });
        } else {
          reject(new Error(`Webhook responded with ${response.statusCode}: ${responseBody}`));
        }
      });
    });

    request.on('error', reject);
    request.write(body);
    request.end();
  });
}

// Create new booking (Public)
router.post('/', async (req, res) => {
  try {
    const { customerName, mobile, vehicleNumber, serviceType, bookingDate, bookingTime } = req.body;
    
    if (!customerName || !mobile || !vehicleNumber || !serviceType) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const bDate = bookingDate || new Date().toLocaleDateString('en-IN');
    const bTime = bookingTime || new Date().toLocaleTimeString('en-IN');

    const bookingPayload = {
      customerName,
      mobile,
      vehicleNumber,
      serviceType,
      bookingDate: bDate,
      bookingTime: bTime,
      source: 'backend_booking_route'
    };

    try {
      await postToBookingWebhook(bookingPayload);
    } catch (webhookErr) {
      console.warn('Booking webhook delivery failed:', webhookErr.message);
    }

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
