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
const { auth } = require('../middleware/auth');

// n8n PRODUCTION webhook URL
const DEFAULT_BOOKING_WEBHOOK_URL = 'https://vamshiyadav406.app.n8n.cloud/webhook/5f347f8c-353b-4af8-ae83-3c26f152f11a';

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

      request.setTimeout(10000);
      request.on('timeout', () => {
        request.destroy(new Error('Webhook request timed out (10s)'));
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
    console.log('REQUEST BODY:', req.body);

    const {
      customerName,
      mobile,
      vehicleNumber,
      vehicleModel,
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


    const adminEmail = process.env.ADMIN_EMAIL || process.env.WORKSHOP_EMAIL || 'accounts@auto4m.in';
    const customerEmail = req.body.email ? String(req.body.email).trim() : '';

    // ==========================================
    // 1. PREPARE DATA FOR N8N WEBHOOK
    // ==========================================

    const bookingPayload = {
      customerName,
      mobile,
      email: customerEmail,
      customerEmail: customerEmail,
      adminEmail: adminEmail,
      workshopEmail: adminEmail,
      vehicleNumber,
      vehicleModel: vehicleModel || '',
      serviceType,
      preferredDate: preferredDate || '',
      bookingDate: bDate,
      bookingTime: bTime,
      remarks: remarks || '',
      source: 'backend_booking_route',
    };

    const BOOKING_WEBHOOK_URL = process.env.BOOKING_WEBHOOK_URL || DEFAULT_BOOKING_WEBHOOK_URL;
    console.log('[BOOKING ROUTE] N8N WEBHOOK URL:', BOOKING_WEBHOOK_URL);
    console.log('[BOOKING ROUTE] N8N WEBHOOK PAYLOAD:', bookingPayload);


    // ==========================================
    // 2. SEND DATA TO N8N WEBHOOK
    // ==========================================

    let webhookTriggered = false;
    let webhookError = null;

    try {
      console.log('CALLING WEBHOOK...');
      const webhookResult = await postToBookingWebhook(bookingPayload);

      webhookTriggered = true;

      console.log('WEBHOOK SUCCESS');
      console.log('Status:', webhookResult.statusCode);
      console.log('Response:', webhookResult.body);
    } catch (error) {
      webhookError = error.message;

      console.log('WEBHOOK FAILURE:', error);
    }


    // ==========================================
    // 3. SAVE BOOKING TO DATABASE
    // ==========================================

    const booking = new Booking({
      customerName,
      mobile,
      vehicleNumber,
      vehicleModel: vehicleModel || '',
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
    let emailError = null;
    let emailLogs = [];

    try {
      const adminEmail = process.env.ADMIN_EMAIL || process.env.WORKSHOP_EMAIL || 'accounts@auto4m.in';
      const customerEmail = req.body.email ? String(req.body.email).trim() : null;

      const htmlBodyAdmin = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #4f46e5; margin-top: 0;">New Service Booking Received</h2>
          <p>A new service appointment has been booked via the MVSS Automobiles portal.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
            <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; font-weight: bold;">Customer Name:</td><td>${customerName}</td></tr>
            <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; font-weight: bold;">Phone Number:</td><td>${mobile}</td></tr>
            ${customerEmail ? `<tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; font-weight: bold;">Customer Email:</td><td>${customerEmail}</td></tr>` : ''}
            <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; font-weight: bold;">Vehicle Number:</td><td>${vehicleNumber}</td></tr>
            <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; font-weight: bold;">Vehicle Model:</td><td>${vehicleModel || 'N/A'}</td></tr>
            <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; font-weight: bold;">Service Type:</td><td>${serviceType}</td></tr>
            <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; font-weight: bold;">Preferred Date:</td><td>${preferredDate || 'Not provided'}</td></tr>
            <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; font-weight: bold;">Remarks:</td><td>${remarks || 'None'}</td></tr>
          </table>
          <p style="font-size: 11px; color: #94a3b8;">Submitted on ${bDate} at ${bTime}</p>
        </div>
      `;

      // 1. Send Admin / Workshop Notification Email
      console.log(`[BOOKING ROUTE] Dispatching admin notification email to ${adminEmail}...`);
      const adminResult = await sendEmail({
        to: adminEmail,
        subject: `New Service Booking: ${customerName} (${vehicleNumber})`,
        html: htmlBodyAdmin,
      });

      if (adminResult.success) {
        emailSent = true;
        emailLogs.push(`Admin email sent successfully to ${adminEmail}`);
      } else {
        emailError = adminResult.error;
        emailLogs.push(`Admin email failed: ${typeof adminResult.error === 'object' ? JSON.stringify(adminResult.error) : adminResult.error}`);
        console.error('[BOOKING ROUTE] Admin notification email failed:', adminResult.error);
      }

      // 2. Send Customer Confirmation Email (if customer provided an email address)
      if (customerEmail && customerEmail.includes('@')) {
        const htmlBodyCustomer = `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #4f46e5; margin-top: 0;">Service Booking Confirmation - MVSS Automobiles</h2>
            <p>Dear <strong>${customerName}</strong>,</p>
            <p>Thank you for booking your vehicle service with <strong>MVSS Automobiles</strong>! We have received your booking request.</p>
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <p style="margin: 5px 0;"><strong>Vehicle Number:</strong> ${vehicleNumber}</p>
              <p style="margin: 5px 0;"><strong>Service Type:</strong> ${serviceType}</p>
              <p style="margin: 5px 0;"><strong>Preferred Date:</strong> ${preferredDate || 'As scheduled'}</p>
            </div>
            <p>Our service advisor will contact you at <strong>${mobile}</strong> shortly to confirm your appointment details.</p>
            <br>
            <p style="margin-bottom: 0;">Warm regards,<br><strong>MVSS Automobiles Team</strong></p>
          </div>
        `;

        console.log(`[BOOKING ROUTE] Dispatching customer confirmation email to ${customerEmail}...`);
        const custResult = await sendEmail({
          to: customerEmail,
          subject: 'Service Booking Confirmation - MVSS Automobiles',
          html: htmlBodyCustomer,
        });

        if (custResult.success) {
          emailSent = true;
          emailLogs.push(`Customer email sent successfully to ${customerEmail}`);
        } else {
          emailLogs.push(`Customer email failed: ${typeof custResult.error === 'object' ? JSON.stringify(custResult.error) : custResult.error}`);
          console.error('[BOOKING ROUTE] Customer confirmation email failed:', custResult.error);
        }
      }
    } catch (emailErr) {
      emailError = emailErr.message || emailErr;
      console.error('[BOOKING ROUTE] Exception in email notification dispatch:', emailErr);
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
      webhookUrl: BOOKING_WEBHOOK_URL,
      emailSent,
      emailError: emailError ? (typeof emailError === 'object' ? JSON.stringify(emailError) : emailError) : null,
      emailLogs,
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


// Get all bookings (Authenticated)
router.get('/', auth, async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    console.error('Failed to fetch bookings:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
