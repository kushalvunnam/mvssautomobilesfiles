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

const TEMPLATE_CONFIG = {
    // English mapping based on WhatsApp Manager visibility
    'mvss_welcome_customer': { lang: 'en', paramCount: 2 },
    'mvss_job_card_created': { lang: 'en', paramCount: 4 },
    'mvss_estimate_created': { lang: 'en', paramCount: 5 },
    'mvss_estimate_approved': { lang: 'en', paramCount: 5 },
    'mvss_invoice_generated': { lang: 'en', paramCount: 5 },
    'mvss_payment_received': { lang: 'en', paramCount: 5 },
    'mvss_gate_pass_generated': { lang: 'en', paramCount: 4 },
    'mvss_insurance_claim_update': { lang: 'en', paramCount: 4 }
};

/**
 * Send a template message via Meta WhatsApp Cloud API
 */
const sendTemplateMessage = async ({
    to,
    templateName,
    languageCode,
    components = [],
    recipientName = 'Unknown',
    relatedEntity,
    onModel,
    idempotencyKey
}) => {
    // Basic masked phone for logging safely
    const maskedTo = to ? to.substring(0, 3) + '****' + to.slice(-3) : 'unknown';
    console.log(`[WhatsApp] Attempting send -> Event: ${onModel}, Template: ${templateName}, To: ${maskedTo}`);

    try {
        const token = process.env.META_WA_ACCESS_TOKEN;
        const phoneNumberId = process.env.META_WA_PHONE_NUMBER_ID;

        if (!token || !phoneNumberId) {
            const err = 'API credentials missing, skipping message.';
            console.warn(`[WhatsApp] ${err}`);
            throw new Error(err);
        }

        const normalizedPhone = normalizePhoneNumber(to);
        if (!normalizedPhone || normalizedPhone.length < 10) {
            const err = `Invalid phone number: ${to}`;
            console.warn(`[WhatsApp] ${err}`);
            throw new Error(err);
        }

        // Validate Template Name and Parameters
        const templateSpec = TEMPLATE_CONFIG[templateName];
        if (!templateSpec) {
            console.warn(`[WhatsApp] Template '${templateName}' is not defined in internal mapping.`);
        }

        // Use specifically mapped template language, or the one passed in, or default fallback
        let finalLanguageCode = languageCode || (templateSpec ? templateSpec.lang : 'en');

        // Validate Components
        if (components && components.length > 0) {
            for (let c of components) {
                if (c.type === 'body' && c.parameters) {
                    if (templateSpec && c.parameters.length !== templateSpec.paramCount) {
                        const err = `Invalid parameter count for ${templateName}. Expected ${templateSpec.paramCount}, got ${c.parameters.length}.`;
                        console.error(`[WhatsApp] ${err}`);
                        throw new Error(err);
                    }
                    for (let i = 0; i < c.parameters.length; i++) {
                        let param = c.parameters[i];
                        if (param.text === null || param.text === undefined) {
                            const err = `Parameter at index ${i} is null/undefined.`;
                            console.error(`[WhatsApp] ${err}`);
                            throw new Error(err);
                        }
                        c.parameters[i].text = String(param.text);
                    }
                }
            }
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
            direction: 'outbound',
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
                    code: finalLanguageCode
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
        const httpStatus = response.status;
        
        // Update Log entry with sent status and message ID
        logEntry.messageId = messageId;
        logEntry.status = 'sent';
        await logEntry.save();

        console.log(`[WhatsApp] Successfully sent template '${templateName}' to ${maskedTo} | HTTP: ${httpStatus} | wamid: ${messageId}`);
        return { success: true, messageId, data: response.data };

    } catch (error) {
        let errorMsg = error.message;
        let metaErrorCode = null;

        if (error.response?.data) {
            errorMsg = error.response.data?.error?.message || JSON.stringify(error.response.data);
            metaErrorCode = error.response.data?.error?.code;
            console.error(`[WhatsApp] Meta API Error: HTTP ${error.response.status} | Code: ${metaErrorCode} | Msg: ${errorMsg}`);
        } else {
            console.error(`[WhatsApp] Internal/Network Error: ${errorMsg}`);
        }
        
        // Mark log as failed if we can
        if (idempotencyKey) {
            try {
                // If logEntry was created, it can be updated. If not, create a failed log
                const existing = await WhatsAppLog.findOne({ idempotencyKey });
                if (existing) {
                    existing.status = 'failed';
                    existing.errorMessage = errorMsg;
                    await existing.save();
                } else {
                    await WhatsAppLog.create({
                        recipientName,
                        recipientPhone: to ? normalizePhoneNumber(to) || to : 'Unknown',
                        templateName,
                        messageType: 'template',
                        status: 'failed',
                        direction: 'outbound',
                        relatedEntity,
                        onModel,
                        idempotencyKey,
                        errorMessage: errorMsg
                    });
                }
            } catch (logErr) {
                console.error('[WhatsApp] Failed to save error log:', logErr.message);
            }
        }
        
        throw error;
    }
};

module.exports = {
    sendTemplateMessage,
    normalizePhoneNumber,
    TEMPLATE_CONFIG
};
