const { Resend } = require('resend');

/**
 * Sends an email notification using Resend API SDK
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @param {string} [options.from] - Sender address
 * @returns {Promise<{ success: boolean, data?: any, error?: any }>}
 */
async function sendEmail({ to, subject, html, from }) {
  const apiKey = process.env.RESEND_API_KEY;
  const senderEmail = from || process.env.RESEND_FROM_EMAIL;
  const recipientEmail = to || process.env.ADMIN_EMAIL;

  // 1. Validate required environment variables before sending
  const missingEnvVars = [];
  if (!apiKey) missingEnvVars.push('RESEND_API_KEY');
  if (!senderEmail) missingEnvVars.push('RESEND_FROM_EMAIL');
  if (!recipientEmail) missingEnvVars.push('ADMIN_EMAIL');

  if (missingEnvVars.length > 0) {
    const errorMsg = `Required environment variable(s) missing: ${missingEnvVars.join(', ')}`;
    console.error(`[EMAIL SERVICE ERROR] ${errorMsg}`);
    return {
      success: false,
      error: { message: errorMsg, missingVariables: missingEnvVars }
    };
  }

  // 2. Logging details
  console.log('[EMAIL SERVICE] Email send started');
  console.log(`[EMAIL SERVICE] Sender address: ${senderEmail}`);
  console.log(`[EMAIL SERVICE] Recipient address: ${recipientEmail}`);
  console.log(`[EMAIL SERVICE] Subject: ${subject}`);

  try {
    const resend = new Resend(apiKey);

    const response = await resend.emails.send({
      from: senderEmail,
      to: recipientEmail,
      subject,
      html
    });

    // 3. Log full response
    console.log('[EMAIL SERVICE] Full Resend API response:', JSON.stringify(response, null, 2));

    // 4. Handle response errors
    if (response.error) {
      console.error('[EMAIL SERVICE ERROR] Complete error object on failure:', JSON.stringify(response.error, null, 2));
      return { success: false, error: response.error };
    }

    if (response.data && response.data.id) {
      console.log(`[EMAIL SERVICE SUCCESS] Email ID on success: ${response.data.id}`);
      return { success: true, data: response.data, emailId: response.data.id };
    } else {
      const err = { message: 'Unexpected API response structure (missing email ID).' };
      console.error('[EMAIL SERVICE ERROR] Complete error object on failure:', err);
      return { success: false, error: err };
    }
  } catch (err) {
    console.error('[EMAIL SERVICE EXCEPTION] Complete error object on failure:', err);
    return {
      success: false,
      error: { message: err.message || String(err) }
    };
  }
}

module.exports = {
  sendEmail
};
