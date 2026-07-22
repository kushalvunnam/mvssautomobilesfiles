const { Resend } = require('resend');

/**
 * Sends an email notification using Resend API SDK
 * @param {Object} options
 * @param {string|string[]} options.to - Recipient email address(es)
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @param {string} [options.from] - Custom sender address
 * @returns {Promise<{ success: boolean, data?: any, error?: any }>}
 */
async function sendEmail({ to, subject, html, from }) {
  const apiKey = process.env.RESEND_API_KEY;

  const recipientEmail = 'accounts@auto4m.in';
  const senderEmail = from || process.env.RESEND_FROM_EMAIL || 'MVSS Automobiles <onboarding@resend.dev>';

  console.log('[EMAIL SERVICE] Preparing email dispatch...');
  console.log(`[EMAIL SERVICE] Recipient: ${recipientEmail}`);
  console.log(`[EMAIL SERVICE] Sender: ${senderEmail}`);

  if (!apiKey) {
    const errorMsg = 'RESEND_API_KEY environment variable is not defined in backend runtime environment.';
    console.error(`[EMAIL SERVICE ERROR] RESEND_API_KEY Loaded: NO. Error details: ${errorMsg}`);
    return { 
      success: false, 
      error: { statusCode: 400, name: 'missing_api_key', message: errorMsg } 
    };
  }

  console.log(`[EMAIL SERVICE] RESEND_API_KEY Loaded: YES. Using API Key: ${apiKey.slice(0, 5)}xxxxxxxxx`);

  try {
    const resend = new Resend(apiKey);

    console.log('[EMAIL SERVICE] Calling Resend emails.send API...');
    let response = await resend.emails.send({
      from: senderEmail,
      to: recipientEmail,
      subject,
      html
    });

    console.log('[EMAIL SERVICE] Full Resend response:', JSON.stringify(response, null, 2));

    if (response.error) {
      console.error('[EMAIL SERVICE ERROR] Email dispatch failed. Error details:', response.error);

      // Fallback if custom sender domain fails (unverified, validation, rate limits, etc.)
      if (!senderEmail.includes('onboarding@resend.dev')) {
        console.warn('[EMAIL SERVICE WARN] Primary sender failed. Retrying unconditionally with onboarding@resend.dev...');
        
        response = await resend.emails.send({
          from: 'MVSS Automobiles <onboarding@resend.dev>',
          to: recipientEmail,
          subject,
          html
        });
        
        console.log('[EMAIL SERVICE FALLBACK] Full Resend response:', JSON.stringify(response, null, 2));
      }
    }

    if (response.data && response.data.id) {
      console.log(`[EMAIL SERVICE SUCCESS] Email ID: ${response.data.id}`);
      return { success: true, data: response.data, emailId: response.data.id };
    } else {
      console.error('[EMAIL SERVICE ERROR] Final dispatch attempt failed. Resend Error:', response.error);
      return { success: false, error: response.error };
    }
  } catch (err) {
    console.error('[EMAIL SERVICE EXCEPTION] Exception during dispatch:', err);
    return { 
      success: false, 
      error: { statusCode: 500, name: 'exception', message: err.message || String(err) } 
    };
  }
}

module.exports = {
  sendEmail
};
