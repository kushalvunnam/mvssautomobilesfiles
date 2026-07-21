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

  if (!apiKey) {
    console.error('[EMAIL SERVICE ERROR] RESEND_API_KEY is missing from environment variables.');
    return { 
      success: false, 
      error: 'RESEND_API_KEY environment variable is not defined.' 
    };
  }

  const resend = new Resend(apiKey);

  const primaryFrom = from || process.env.RESEND_FROM_EMAIL || 'MVSS Automobiles <onboarding@resend.dev>';
  const fallbackFrom = 'MVSS Automobiles <onboarding@resend.dev>';

  // Format recipient list
  const recipientList = Array.isArray(to) ? to.filter(Boolean) : [to].filter(Boolean);
  
  if (recipientList.length === 0) {
    console.error('[EMAIL SERVICE ERROR] No valid recipient email address provided.');
    return { success: false, error: 'No recipient email address specified.' };
  }

  try {
    console.log(`[EMAIL SERVICE] Dispatching email to: ${recipientList.join(', ')} | Subject: "${subject}" | From: ${primaryFrom}`);

    let response = await resend.emails.send({
      from: primaryFrom,
      to: recipientList,
      subject,
      html
    });

    if (response.error) {
      console.error('[EMAIL SERVICE API ERROR] Resend returned error:', response.error);

      // Handle unverified domain error by retrying with onboarding@resend.dev
      const errMsg = (response.error.message || '').toLowerCase();
      const errName = (response.error.name || '').toLowerCase();

      if ((errMsg.includes('domain') || errMsg.includes('not verified') || errName.includes('validation')) && primaryFrom !== fallbackFrom) {
        console.warn(`[EMAIL SERVICE RETRY] SENDER "${primaryFrom}" failed domain verification. Retrying with verified sender "${fallbackFrom}"...`);
        
        response = await resend.emails.send({
          from: fallbackFrom,
          to: recipientList,
          subject,
          html
        });

        if (response.error) {
          console.error('[EMAIL SERVICE RETRY ERROR] Resend retry also failed:', response.error);
          return { success: false, error: response.error };
        }
      } else {
        return { success: false, error: response.error };
      }
    }

    console.log('[EMAIL SERVICE SUCCESS] Email delivered successfully. Resend ID:', response.data ? response.data.id : 'N/A');
    return { success: true, data: response.data };
  } catch (err) {
    console.error('[EMAIL SERVICE EXCEPTION] Failed to send email:', err);
    return { success: false, error: err.message || err };
  }
}

module.exports = {
  sendEmail
};
