import nodemailer from 'nodemailer';
import env from '../config/env.js';

// Setup transport. Using ethereal or mock if no real credentials are provided.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT || 587,
  auth: {
    user: process.env.SMTP_USER || 'mock_user',
    pass: process.env.SMTP_PASS || 'mock_pass',
  },
});

export const sendTaskAssignmentEmail = async (userEmail, userName, taskTitle, projectName) => {
  const mailOptions = {
    from: `"TaskFlow" <${process.env.SMTP_USER}>`,
    to: userEmail,
    subject: `New Task Assigned: ${taskTitle}`,
    html: `
      <h2>Hello ${userName},</h2>
      <p>You have been assigned a new task in <strong>${projectName}</strong>.</p>
      <p><strong>Task:</strong> ${taskTitle}</p>
      <p>Please log in to TaskFlow to view the details.</p>
    `,
  };

  try {
    if (process.env.SMTP_HOST) {
      await transporter.sendMail(mailOptions);
    } else {
      console.log(`[Email Mock] Sent assignment email to ${userEmail} for task "${taskTitle}"`);
    }
  } catch (error) {
    console.error('Failed to send email:', error);
  }
};

export const sendProjectInvitationEmail = async (userEmail, userName, projectName) => {
  const mailOptions = {
    from: `"TaskFlow" <${process.env.SMTP_USER}>`,
    to: userEmail,
    subject: `Added to Project: ${projectName}`,
    html: `
      <h2>Hello ${userName},</h2>
      <p>You have been added to the project <strong>${projectName}</strong>.</p>
      <p>Please log in to TaskFlow to start collaborating.</p>
    `,
  };

  try {
    if (process.env.SMTP_HOST) {
      await transporter.sendMail(mailOptions);
    } else {
      console.log(`[Email Mock] Sent invitation email to ${userEmail} for project "${projectName}"`);
    }
  } catch (error) {
    console.error('Failed to send email:', error);
  }
};

export const sendOTPEmail = async (userEmail, userName, otp) => {
  const mailOptions = {
    from: `"TaskFlow" <${process.env.SMTP_USER}>`,
    to: userEmail,
    subject: `Your Verification Code: ${otp}`,
    html: `
      <h2>Hello ${userName},</h2>
      <p>Thank you for registering with TaskFlow. Your verification code is:</p>
      <h1 style="font-size: 32px; letter-spacing: 5px; color: #4f46e5;">${otp}</h1>
      <p>This code will expire in 10 minutes.</p>
    `,
  };

  try {
    if (process.env.SMTP_HOST) {
      await transporter.sendMail(mailOptions);
    } else {
      console.log(`\n================================`);
      console.log(`[Email Mock] OTP for ${userEmail}`);
      console.log(`CODE: ${otp}`);
      console.log(`================================\n`);
    }
  } catch (error) {
    console.error('Failed to send OTP email:', error);
  }
};
