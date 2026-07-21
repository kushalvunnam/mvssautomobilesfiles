const { Resend } = require('resend');

/**
 * Sends an email notification using Resend API
 * @param {Object} options
 * @param {string|string[]} options.to - Recipient email address(es)
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @param {string} [options.from] - Custom sender address
 * @returns {Promise<{ success: boolean, data?: any, error?: any }>}
 */
async function sendEmail({ to, subject, html, from }) {
  const apiKey = process.env.RESEND_API_KEY;

  console.log('[EMAIL SERVICE] Dispatching email via Resend SDK...');
  console.log(`[EMAIL SERVICE] RESEND_API_KEY present: ${Boolean(apiKey)}`);

  if (!apiKey) {
    const errorMsg = 'RESEND_API_KEY environment variable is not defined in backend runtime environment.';
    console.error(`[EMAIL SERVICE ERROR] ${errorMsg}`);
    return { 
      success: false, 
      error: { statusCode: 400, name: 'missing_api_key', message: errorMsg } 
    };
  }

  const resend = new Resend(apiKey);

  // Sender email: Use RESEND_FROM_EMAIL or default to verified onboarding@resend.dev
  const senderAddress = from || process.env.RESEND_FROM_EMAIL || 'MVSS Automobiles <onboarding@resend.dev>';
  
  // Recipient email: Always accounts@auto4m.in
  const recipient = 'accounts@auto4m.in';

  try {
    console.log(`[EMAIL SERVICE] Sending email...`);
    console.log(`[EMAIL SERVICE] From: ${senderAddress}`);
    console.log(`[EMAIL SERVICE] To: ${recipient}`);
    console.log(`[EMAIL SERVICE] Subject: "${subject}"`);

    const response = await resend.emails.send({
      from: senderAddress,
      to: recipient,
      subject,
      html
    });

    console.log('[EMAIL SERVICE] Full Resend API Response:', JSON.stringify(response, null, 2));

    if (response.error) {
      console.error('[EMAIL SERVICE ERROR] Resend API Error Details:', {
        id: response.data ? response.data.id : null,
        statusCode: response.error.statusCode || response.error.status || 400,
        name: response.error.name,
        message: response.error.message,
        suppressionReason: response.error.message
      });

      // If custom domain fails, try with onboarding@resend.dev
      const errMsg = (response.error.message || '').toLowerCase();
      if ((errMsg.includes('domain') || errMsg.includes('not verified') || errMsg.includes('validation')) && !senderAddress.includes('onboarding@resend.dev')) {
        console.warn('[EMAIL SERVICE WARN] Retrying with verified sender MVSS Automobiles <onboarding@resend.dev>...');
        
        const fallbackResponse = await resend.emails.send({
          from: 'MVSS Automobiles <onboarding@resend.dev>',
          to: recipient,
          subject,
          html
        });
        
        console.log('[EMAIL SERVICE FALLBACK] Full Resend API Response:', JSON.stringify(fallbackResponse, null, 2));
        
        if (!fallbackResponse.error) {
          console.log('[EMAIL SERVICE SUCCESS] Email sent successfully via fallback sender. Email ID:', fallbackResponse.data ? fallbackResponse.data.id : 'N/A');
          return { success: true, data: fallbackResponse.data };
        } else {
          return { success: false, error: fallbackResponse.error };
        }
      }

      return { success: false, error: response.error };
    }

    console.log('[EMAIL SERVICE SUCCESS] Email sent successfully. Email ID:', response.data ? response.data.id : 'N/A');
    return { success: true, data: response.data };
  } catch (err) {
    console.error('[EMAIL SERVICE EXCEPTION] Full error message if sending fails:', err);
    return { 
      success: false, 
      error: { statusCode: 500, name: 'exception', message: err.message || String(err) } 
    };
  }
}

module.exports = {
  sendEmail
};
