const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const https = require('https');
const router = express.Router();

const { sendEmail } = require('../services/emailService');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const Message = require('../models/Message');
const { logAction } = require('../utils/logger');

const BOOKING_WEBHOOK_URL =
  process.env.BOOKING_WEBHOOK_URL ||
  'https://srinidhibusiness.app.n8n.cloud/webhook/3f959cc4-2a46-4d25-b28f-cc2ca54d9e7b';


function postToBookingWebhook(payload) {
  return new Promise((resolve, reject) => {
    const url = new URL(BOOKING_WEBHOOK_URL);
    const transport = url.protocol === 'https:' ? https : http;
    const body = JSON.stringify(payload);

    const request = transport.request(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (response) => {
        let responseBody = '';

        response.on('data', (chunk) => {
          responseBody += chunk;
        });

        response.on('end', () => {
          if (response.statusCode >= 200 && response.statusCode < 300) {
            resolve({
              statusCode: response.statusCode,
              body: responseBody,
            });
          } else {
            reject(
              new Error(
                `Webhook responded with ${response.statusCode}: ${responseBody}`
              )
            );
          }
        });
      }
    );

    request.on('error', reject);
    request.write(body);
    request.end();
  });
}


// Create new booking (Public)
router.post('/', async (req, res) => {
  try {
    const {
      customerName,
      mobile,
      vehicleNumber,
      serviceType,
      preferredDate,
      bookingDate,
      bookingTime,
      remarks,
    } = req.body;

    if (!customerName || !mobile || !vehicleNumber || !serviceType) {
      return res.status(400).json({
        error: 'All fields are required',
      });
    }

    const bDate =
      bookingDate || new Date().toLocaleDateString('en-IN');

    const bTime =
      bookingTime || new Date().toLocaleTimeString('en-IN');


    // Data that will be sent automatically to n8n
    const bookingPayload = {
      customerName,
      mobile,
      vehicleNumber,
      serviceType,
      preferredDate: preferredDate || '',
      bookingDate: bDate,
      bookingTime: bTime,
      remarks: remarks || '',
      source: 'backend_booking_route',
    };


    // Send booking data to n8n webhook
    try {
      const webhookResult = await postToBookingWebhook(bookingPayload);

      console.log(
        'Booking successfully sent to n8n:',
        webhookResult.statusCode
      );
    } catch (webhookErr) {
      console.warn(
        'Booking webhook delivery failed:',
        webhookErr.message
      );
    }


    // Save booking to database
    const booking = new Booking({
      customerName,
      mobile,
      vehicleNumber,
      serviceType,
      bookingDate: bDate,
      bookingTime: bTime,
      preferredDate: preferredDate || '',
      remarks: remarks || '',
    });

    await booking.save();


    // Create notification
    const notification = new Notification({
      type: 'booking',
      title: 'New Service Booking',
      message: preferredDate
        ? `${customerName} has requested a service appointment on ${preferredDate}.`
        : `${customerName} has requested a service appointment.`,
      customerName,
      mobile,
      vehicleNumber,
      serviceType,
      preferredDate: preferredDate || '',
      status: 'unread',
    });

    await notification.save();


    // Create message inquiry
    const message = new Message({
      type: 'booking',
      senderName: customerName,
      phone: mobile,
      subject: 'Service Booking Message',
      body: `${customerName} has requested a service slot for vehicle ${vehicleNumber} (Type: ${serviceType})${
        preferredDate ? ` on ${preferredDate}` : ''
      }. Submitted on ${bDate} at ${bTime}. Remarks: ${
        remarks || 'None'
      }`,
      status: 'unread',
    });

    await message.save();


    // Log booking creation
    const guestUser = {
      _id: new mongoose.Types.ObjectId(),
      name: customerName,
      role: 'Guest',
    };

    await logAction(
      guestUser,
      'BOOKING_CREATE',
      `Customer ${customerName} requested service booking for ${vehicleNumber} (Type: ${serviceType})`,
      req
    );


    // Send email notification
    let emailSent = false;

    try {
      const htmlBody = `
        <h3>New Service Booking Received</h3>
        <p><strong>Customer Name:</strong> ${customerName}</p>
        <p><strong>Phone Number:</strong> ${mobile}</p>
        <p><strong>Vehicle Number:</strong> ${vehicleNumber}</p>
        <p><strong>Service Category:</strong> ${serviceType}</p>
        <p><strong>Preferred Service Date:</strong> ${preferredDate || 'Not provided'}</p>
        <p><strong>Remarks:</strong> ${remarks || 'None'}</p>
        <p><small>Submitted on ${bDate} at ${bTime}</small></p>
      `;

      emailSent = await sendEmail({
        to: 'accounts@auto4m.in',
        subject: 'New Service Booking - MVSS Automobiles',
        html: htmlBody,
      });
    } catch (emailErr) {
      console.warn(
        'Email notification failed:',
        emailErr.message
      );
    }


    // Send only ONE response
    return res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      bookingSaved: true,
      webhookTriggered: true,
      emailSent,
      booking,
    });

  } catch (err) {
    console.error('Failed to create booking:', err);

    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Failed to create booking',
    });
  }
});


module.exports = router;
