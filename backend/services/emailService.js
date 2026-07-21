const { Resend } = require('resend');

/**
 * Sends an email notification using Resend API
 * @param {Object} options
 * @param {string|string[]} options.to - Recipient email address(es)
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @param {string} [options.from] - Custom sender address (default: MVSS Automobiles <accounts@auto4m.in>)
 * @returns {Promise<{ success: boolean, data?: any, error?: any }>}
 */
async function sendEmail({ to, subject, html, from }) {
  const apiKey = process.env.RESEND_API_KEY;

  console.log('[EMAIL SERVICE] Attempting email send...');
  console.log(`[EMAIL SERVICE] RESEND_API_KEY present: ${Boolean(apiKey)}`);

  if (!apiKey) {
    const errorMsg = 'RESEND_API_KEY environment variable is not defined in backend runtime.';
    console.error(`[EMAIL SERVICE ERROR] ${errorMsg}`);
    return { 
      success: false, 
      error: errorMsg 
    };
  }

  const resend = new Resend(apiKey);

  // Default verified sender email requested by client: accounts@auto4m.in
  const senderAddress = from || process.env.RESEND_FROM_EMAIL || 'MVSS Automobiles <accounts@auto4m.in>';
  
  // Format recipient list
  const recipientList = Array.isArray(to) ? to.filter(Boolean) : [to].filter(Boolean);
  
  if (recipientList.length === 0) {
    const errorMsg = 'No valid recipient email address provided.';
    console.error(`[EMAIL SERVICE ERROR] ${errorMsg}`);
    return { success: false, error: errorMsg };
  }

  try {
    console.log(`[EMAIL SERVICE] Sending email...`);
    console.log(`[EMAIL SERVICE] From: ${senderAddress}`);
    console.log(`[EMAIL SERVICE] To: ${recipientList.join(', ')}`);
    console.log(`[EMAIL SERVICE] Subject: "${subject}"`);

    const response = await resend.emails.send({
      from: senderAddress,
      to: recipientList,
      subject,
      html
    });

    console.log('[EMAIL SERVICE] Resend API response:', JSON.stringify(response, null, 2));

    if (response.error) {
      console.error('[EMAIL SERVICE ERROR] Resend API returned an error:', response.error);

      // If custom domain verification fails on accounts@auto4m.in, try fallback sender if necessary
      const errMsg = (response.error.message || '').toLowerCase();
      if ((errMsg.includes('domain') || errMsg.includes('not verified') || errMsg.includes('validation')) && !senderAddress.includes('onboarding@resend.dev')) {
        console.warn('[EMAIL SERVICE WARN] Retrying with Resend onboarding sender...');
        const fallbackResponse = await resend.emails.send({
          from: 'MVSS Automobiles <onboarding@resend.dev>',
          to: recipientList,
          subject,
          html
        });
        console.log('[EMAIL SERVICE FALLBACK] Resend API fallback response:', JSON.stringify(fallbackResponse, null, 2));
        if (!fallbackResponse.error) {
          console.log('[EMAIL SERVICE SUCCESS] Fallback email sent successfully. ID:', fallbackResponse.data ? fallbackResponse.data.id : 'N/A');
          return { success: true, data: fallbackResponse.data };
        }
      }

      return { success: false, error: response.error };
    }

    console.log('[EMAIL SERVICE SUCCESS] Email sent successfully. ID:', response.data ? response.data.id : 'N/A');
    return { success: true, data: response.data };
  } catch (err) {
    console.error('[EMAIL SERVICE EXCEPTION] Full error message if sending fails:', err);
    return { success: false, error: err.message || err };
  }
}

module.exports = {
  sendEmail
};
