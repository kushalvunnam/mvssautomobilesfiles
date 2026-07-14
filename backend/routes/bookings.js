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

// n8n PRODUCTION webhook URL
const DEFAULT_BOOKING_WEBHOOK_URL = 'https://srinidhibusiness.app.n8n.cloud/webhook/58aaad25-0dfc-422a-88b9-d12c2d4a0b00';

/**
 * Send booking data to n8n webhook
 */
function postToBookingWebhook(payload) {
  return new Promise((resolve, reject) => {
    try {
      const webhookUrl = process.env.BOOKING_WEBHOOK_URL || DEFAULT_BOOKING_WEBHOOK_URL;
      const url = new URL(webhookUrl);
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
            if (
              response.statusCode >= 200 &&
              response.statusCode < 300
            ) {
              resolve({
                statusCode: response.statusCode,
                body: responseBody,
              });
            } else {
              reject(
                new Error(
                  `n8n webhook responded with status ${response.statusCode}: ${responseBody}`
                )
              );
            }
          });
        }
      );

      request.on('error', (error) => {
        reject(error);
      });

      request.write(body);
      request.end();
    } catch (error) {
      reject(error);
    }
  });
}


// Create new booking (Public)
router.post('/', async (req, res) => {
  try {
    console.log('BOOKING ROUTE HIT');
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

    // Validate required fields
    if (!customerName || !mobile || !vehicleNumber || !serviceType) {
      return res.status(400).json({
        success: false,
        error: 'Customer name, mobile, vehicle number and service type are required',
      });
    }

    const bDate =
      bookingDate || new Date().toLocaleDateString('en-IN');

    const bTime =
      bookingTime || new Date().toLocaleTimeString('en-IN');


    // ==========================================
    // 1. PREPARE DATA FOR N8N
    // ==========================================

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


    // ==========================================
    // 2. SEND DATA TO N8N WEBHOOK
    // ==========================================

    let webhookTriggered = false;
    let webhookError = null;

    try {
      console.log('Sending booking to n8n');
      const webhookResult = await postToBookingWebhook(bookingPayload);

      webhookTriggered = true;

      console.log('Webhook Success');
      console.log('Status:', webhookResult.statusCode);
      console.log('Response:', webhookResult.body);
    } catch (webhookErr) {
      webhookError = webhookErr.message;

      console.log('Webhook Failed');
      console.error('Error:', webhookErr.message);
    }


    // ==========================================
    // 3. SAVE BOOKING TO DATABASE
    // ==========================================

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


    // ==========================================
    // 4. CREATE NOTIFICATION
    // ==========================================

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


    // ==========================================
    // 5. CREATE MESSAGE INQUIRY
    // ==========================================

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


    // ==========================================
    // 6. LOG BOOKING ACTION
    // ==========================================

    try {
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
    } catch (logErr) {
      console.warn('Logging failed:', logErr.message);
    }


    // ==========================================
    // 7. SEND EMAIL NOTIFICATION
    // ==========================================

    let emailSent = false;

    try {
      const htmlBody = `
        <h3>New Service Booking Received</h3>
        <p><strong>Customer Name:</strong> ${customerName}</p>
        <p><strong>Phone Number:</strong> ${mobile}</p>
        <p><strong>Vehicle Number:</strong> ${vehicleNumber}</p>
        <p><strong>Service Category:</strong> ${serviceType}</p>
        <p><strong>Preferred Service Date:</strong> ${
          preferredDate || 'Not provided'
        }</p>
        <p><strong>Remarks:</strong> ${remarks || 'None'}</p>
        <p><small>Submitted on ${bDate} at ${bTime}</small></p>
      `;

      emailSent = await sendEmail({
        to: 'accounts@auto4m.in',
        subject: 'New Service Booking - MVSS Automobiles',
        html: htmlBody,
      });
    } catch (emailErr) {
      console.warn('Email notification failed:', emailErr.message);
    }


    // ==========================================
    // 8. RETURN SUCCESS RESPONSE
    // ==========================================

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      bookingSaved: true,
      webhookTriggered,
      webhookError,
      emailSent,
      booking,
    });

  } catch (err) {
    console.error('Failed to create booking:', err);

    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Failed to create booking',
      details: err.message,
    });
  }
});


module.exports = router;
