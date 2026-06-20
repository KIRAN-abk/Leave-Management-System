const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html, text }) => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || '"Leave Management System" <no-reply@leavemgmt.com>';

  // Log to console for debugging
  console.log('========================================================================');
  console.log(`[EMAIL SENDING] To: ${to}`);
  console.log(`[EMAIL SENDING] Subject: ${subject}`);
  console.log(`[EMAIL SENDING] Text Preview: ${text || 'HTML Content only'}`);
  console.log('========================================================================');

  // If no SMTP host is configured, we run in mock mode
  if (!host || !user || !pass) {
    console.log('[EMAIL MOCK] SMTP configuration not fully set. Email not sent via network.');
    return { mock: true, messageId: 'mock-id-' + Date.now() };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(port),
      secure: port == 465, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    });

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });

    console.log(`[EMAIL SENT] Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send email: ${error.message}`);
    // Do not crash the application if email sending fails
    return { error: true, message: error.message };
  }
};

module.exports = { sendEmail };
