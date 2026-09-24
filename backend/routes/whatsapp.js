const express = require('express');
const router = express.Router();
const WhatsAppLog = require('../models/WhatsAppLog');
const { auth } = require('../middleware/auth');
const { sendTemplateMessage } = require('../services/whatsappService');

// =========================================================================
// PHASE 10: WEBHOOK VERIFICATION (GET)
// =========================================================================
router.get('/webhook', (req, res) => {
    const VERIFY_TOKEN = process.env.META_WA_VERIFY_TOKEN;

    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('[WhatsApp] Webhook verified successfully.');
            return res.status(200).send(challenge);
        } else {
            console.error('[WhatsApp] Webhook verification failed! Token mismatch.');
            return res.sendStatus(403);
        }
    }
    return res.status(400).send('Bad Request');
});

// =========================================================================
// PHASE 10 & 11: INCOMING WEBHOOK EVENTS (POST)
// =========================================================================
router.post('/webhook', async (req, res) => {
    try {
        const body = req.body;

        if (body.object === 'whatsapp_business_account') {
            for (const entry of body.entry || []) {
                for (const change of entry.changes || []) {
                    const value = change.value;

                    // 1. Handle Delivery Status Updates (sent, delivered, read, failed)
                    if (value.statuses && value.statuses.length > 0) {
                        for (const status of value.statuses) {
                            const messageId = status.id;
                            const statusString = status.status; // 'sent', 'delivered', 'read', 'failed'
                            
                            let updatePayload = { status: statusString };
                            if (statusString === 'failed' && status.errors) {
                                updatePayload.errorMessage = status.errors[0]?.message || 'Unknown Meta Error';
                            }

                            // Update our log asynchronously
                            await WhatsAppLog.findOneAndUpdate({ messageId }, updatePayload);
                            console.log(`[WhatsApp] Message ${messageId} status updated to: ${statusString}`);
                        }
                    }

                    // 2. Handle Incoming Messages (Customer replying to WABA)
                    if (value.messages && value.messages.length > 0) {
                        for (const message of value.messages) {
                            const fromPhone = message.from; // Customer's phone number
                            const messageId = message.id;
                            const messageType = message.type;
                            
                            console.log(`[WhatsApp] Inbound message received from ${fromPhone}`);

                            // Store inbound message in WhatsAppLog
                            const logEntry = new WhatsAppLog({
                                recipientName: 'Inbound Customer',
                                recipientPhone: fromPhone,
                                messageType: 'text',
                                status: 'delivered',
                                messageId: messageId,
                                errorMessage: messageType === 'text' ? message.text.body : `Received non-text message: ${messageType}`
                            });
                            await logEntry.save();
                        }
                    }
                }
            }
            return res.status(200).send('EVENT_RECEIVED');
        } else {
            return res.sendStatus(404);
        }
    } catch (error) {
        console.error('[WhatsApp] Webhook processing error:', error);
        // Do not break the webhook acknowledgment
        return res.status(500).send('ERROR');
    }
});

// =========================================================================
// PHASE 12: ADMIN TEST ENDPOINT
// =========================================================================
router.post('/test', auth, async (req, res) => {
    // Only allow admin roles to trigger tests
    if (!['Super Admin', 'Admin'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Unauthorized to use test endpoint.' });
    }

    try {
        const { phone, templateName, parameters } = req.body;
        
        if (!phone || !templateName) {
            return res.status(400).json({ error: 'phone and templateName are required.' });
        }

        // Convert simple string array to Meta components structure
        const components = parameters ? [
            {
                type: 'body',
                parameters: parameters.map(p => ({ type: 'text', text: String(p) }))
            }
        ] : [];

        const result = await sendTemplateMessage({
            to: phone,
            templateName,
            components,
            recipientName: 'Test Admin',
            idempotencyKey: `test_message_${Date.now()}`
        });

        if (result.success) {
            return res.json({ success: true, messageId: result.messageId, details: result.data });
        } else {
            return res.status(500).json({ success: false, error: result.error });
        }

    } catch (error) {
        console.error('[WhatsApp] Test endpoint error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
