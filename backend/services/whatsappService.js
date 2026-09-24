const axios = require('axios');
const WhatsAppLog = require('../models/WhatsAppLog');

/**
 * Utility to normalize Indian phone numbers to E.164 format (without the +) -> 91XXXXXXXXXX
 */
const normalizePhoneNumber = (phone) => {
    if (!phone) return null;
    let cleaned = phone.replace(/\D/g, '');
    
    // If it's a 10-digit number, prepend 91 (India)
    if (cleaned.length === 10) {
        return `91${cleaned}`;
    }
    // If it starts with 0 and is 11 digits
    if (cleaned.length === 11 && cleaned.startsWith('0')) {
        return `91${cleaned.substring(1)}`;
    }
    // If it already starts with 91 and is 12 digits
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
        return cleaned;
    }
    return cleaned; // Fallback
};

/**
 * Send a template message via Meta WhatsApp Cloud API
 */
const sendTemplateMessage = async ({
    to,
    templateName,
    languageCode = 'en_US',
    components = [],
    recipientName = 'Unknown',
    relatedEntity,
    onModel,
    idempotencyKey
}) => {
    try {
        const token = process.env.META_WA_ACCESS_TOKEN;
        const phoneNumberId = process.env.META_WA_PHONE_NUMBER_ID;

        if (!token || !phoneNumberId) {
            console.warn('[WhatsApp] API credentials missing, skipping message.');
            return { success: false, error: 'Missing Credentials' };
        }

        const normalizedPhone = normalizePhoneNumber(to);
        if (!normalizedPhone || normalizedPhone.length < 10) {
            console.warn(`[WhatsApp] Invalid phone number: ${to}`);
            return { success: false, error: 'Invalid Phone Number' };
        }

        // Idempotency Check: Prevent duplicate messages for the same event
        if (idempotencyKey) {
            const existingLog = await WhatsAppLog.findOne({ idempotencyKey });
            if (existingLog) {
                console.log(`[WhatsApp] Duplicate skipped for key: ${idempotencyKey}`);
                return { success: true, messageId: existingLog.messageId, status: 'duplicate_skipped' };
            }
        }

        // Create pending log entry
        const logEntry = new WhatsAppLog({
            recipientName,
            recipientPhone: normalizedPhone,
            templateName,
            messageType: 'template',
            status: 'pending',
            relatedEntity,
            onModel,
            idempotencyKey
        });
        await logEntry.save();

        // Construct Meta API Payload
        const payload = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: normalizedPhone,
            type: 'template',
            template: {
                name: templateName,
                language: {
                    code: languageCode
                },
                components: components
            }
        };

        const url = `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`;

        const response = await axios.post(url, payload, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const messageId = response.data.messages?.[0]?.id;
        
        // Update Log entry with sent status and message ID
        logEntry.messageId = messageId;
        logEntry.status = 'sent';
        await logEntry.save();

        console.log(`[WhatsApp] Successfully sent template '${templateName}' to ${normalizedPhone}`);
        return { success: true, messageId, data: response.data };

    } catch (error) {
        console.error('[WhatsApp] API Error:', error.response?.data || error.message);
        
        // Mark log as failed if we can
        if (idempotencyKey) {
            await WhatsAppLog.findOneAndUpdate(
                { idempotencyKey }, 
                { status: 'failed', errorMessage: error.response?.data?.error?.message || error.message }
            );
        }
        
        return { success: false, error: error.response?.data || error.message };
    }
};

module.exports = {
    sendTemplateMessage,
    normalizePhoneNumber
};
