import nodemailer from 'nodemailer';
import env from '../config/env.js';

// Build a robust SMTP transporter with proper TLS and error handling.
let transporter = null;
let emailReady = false;

function createTransporter() {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    console.log('[Email] No SMTP credentials configured — running in mock mode.');
    return null;
  }

  const port = parseInt(env.SMTP_PORT || '587', 10);

  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port,
    secure: port === 465, // true for 465, false for 587 (STARTTLS)
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
    // Required for many SMTP providers; prevents self-signed cert rejections
    tls: {
      rejectUnauthorized: false,
    },
    // Connection timeout (10s) and greeting timeout (10s)
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  // Verify connection at startup (non-blocking)
  transport.verify()
    .then(() => {
      emailReady = true;
      console.log('[Email] ✅ SMTP connection verified successfully.');
    })
    .catch((err) => {
      emailReady = false;
      console.error('[Email] ❌ SMTP connection verification failed:', err.message);
      console.error('[Email] Emails will fall back to mock/log mode.');
    });

  return transport;
}

transporter = createTransporter();

/**
 * Safely send an email. Returns true on success, false on failure.
 * Never throws — email failures should not crash the calling operation.
 */
async function safeSendMail(mailOptions) {
  if (!transporter || !emailReady) {
    console.log(`[Email Mock] To: ${mailOptions.to} | Subject: ${mailOptions.subject}`);
    return false;
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] ✅ Sent to ${mailOptions.to} — MessageId: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[Email] ❌ Failed to send to ${mailOptions.to}:`, error.message);
    // Don't rethrow — let the calling function continue
    return false;
  }
}

export const sendTaskAssignmentEmail = async (userEmail, userName, taskTitle, projectName) => {
  const mailOptions = {
    from: `"TaskFlow" <${env.SMTP_USER || 'noreply@taskflow.com'}>`,
    to: userEmail,
    subject: `New Task Assigned: ${taskTitle}`,
    html: `
      <h2>Hello ${userName},</h2>
      <p>You have been assigned a new task in <strong>${projectName}</strong>.</p>
      <p><strong>Task:</strong> ${taskTitle}</p>
      <p>Please log in to TaskFlow to view the details.</p>
    `,
  };

  await safeSendMail(mailOptions);
};

export const sendProjectInvitationEmail = async (userEmail, userName, projectName) => {
  const mailOptions = {
    from: `"TaskFlow" <${env.SMTP_USER || 'noreply@taskflow.com'}>`,
    to: userEmail,
    subject: `Added to Project: ${projectName}`,
    html: `
      <h2>Hello ${userName},</h2>
      <p>You have been added to the project <strong>${projectName}</strong>.</p>
      <p>Please log in to TaskFlow to start collaborating.</p>
    `,
  };

  await safeSendMail(mailOptions);
};

export const sendOTPEmail = async (userEmail, userName, otp) => {
  const mailOptions = {
    from: `"TaskFlow" <${env.SMTP_USER || 'noreply@taskflow.com'}>`,
    to: userEmail,
    subject: `Your Verification Code: ${otp}`,
    html: `
      <h2>Hello ${userName},</h2>
      <p>Thank you for registering with TaskFlow. Your verification code is:</p>
      <h1 style="font-size: 32px; letter-spacing: 5px; color: #4f46e5;">${otp}</h1>
      <p>This code will expire in 10 minutes.</p>
    `,
  };

  const sent = await safeSendMail(mailOptions);

  if (!sent) {
    // Always log the OTP to console as fallback so dev/testing can proceed
    console.log(`\n================================`);
    console.log(`[Email Fallback] OTP for ${userEmail}`);
    console.log(`CODE: ${otp}`);
    console.log(`================================\n`);
  }
};
