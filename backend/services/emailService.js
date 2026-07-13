const { Resend } = require('resend');

// Initialize Resend with the environment variable
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

/**
 * Sends an email notification using Resend API
 * @param {Object} options
 * @param {string} options.to
 * @param {string} options.subject
 * @param {string} options.html
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
async function sendEmail({ to, subject, html }) {
  if (!resend) {
    console.error('[EMAIL SERVICE] Resend is not initialized. RESEND_API_KEY is missing.');
    return false;
  }

  try {
    console.log(`[EMAIL SERVICE] Sending email to ${to} with subject "${subject}"...`);
    const { data, error } = await resend.emails.send({
      from: 'MVSS Automobiles <bookings@mvssautomobiles.com>',
      to,
      subject,
      html
    });

    if (error) {
      console.error('[EMAIL SERVICE] Resend returned an error:', error);
      return false;
    }

    console.log('[EMAIL SERVICE] Email sent successfully. ID:', data ? data.id : 'N/A');
    return true;
  } catch (err) {
    console.error('[EMAIL SERVICE] Exception occurred during email send:', err);
    return false;
  }
}

module.exports = {
  sendEmail
};
