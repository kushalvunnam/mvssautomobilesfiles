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

  console.log('[EMAIL SERVICE] Calling Resend...');
  console.log(`[EMAIL SERVICE] Recipient email: ${recipientEmail}`);
  console.log(`[EMAIL SERVICE] Sender email: ${senderEmail}`);

  if (!apiKey) {
    const errorMsg = 'RESEND_API_KEY environment variable is not defined in backend runtime environment.';
    console.error(`[EMAIL SERVICE ERROR] Error message if sending fails: ${errorMsg}`);
    return { 
      success: false, 
      error: { statusCode: 400, name: 'missing_api_key', message: errorMsg } 
    };
  }

  try {
    const resend = new Resend(apiKey);

    let response = await resend.emails.send({
      from: senderEmail,
      to: recipientEmail,
      subject,
      html
    });

    console.log('[EMAIL SERVICE] Full Resend response:', JSON.stringify(response, null, 2));

    if (response.error) {
      console.error('[EMAIL SERVICE ERROR] Error message if sending fails:', response.error);

      // Fallback if custom sender domain is unverified
      const errMsg = (response.error.message || '').toLowerCase();
      if ((errMsg.includes('domain') || errMsg.includes('not verified') || errMsg.includes('validation')) && !senderEmail.includes('onboarding@resend.dev')) {
        console.warn('[EMAIL SERVICE WARN] Custom sender domain unverified. Retrying with onboarding@resend.dev...');
        
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
      console.error('[EMAIL SERVICE ERROR] Error message if sending fails:', response.error);
      return { success: false, error: response.error };
    }
  } catch (err) {
    console.error('[EMAIL SERVICE EXCEPTION] Error message if sending fails:', err);
    return { 
      success: false, 
      error: { statusCode: 500, name: 'exception', message: err.message || String(err) } 
    };
  }
}

module.exports = {
  sendEmail
};
