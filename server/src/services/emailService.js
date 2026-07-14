import nodemailer from 'nodemailer';
import { Resend } from 'resend';

// ─── Email Provider Strategy ───────────────────────────────────────
// Production (Render/Railway): Uses Resend HTTP API (not blocked by cloud platforms)
// Local Development: Uses SMTP (Gmail) or Ethereal for testing
// ────────────────────────────────────────────────────────────────────

let resendClient = null;
let transporter = null;

const useResend = () => !!process.env.RESEND_API_KEY;

// Initialize Resend (HTTP-based, works on all cloud platforms)
const initResend = () => {
  if (resendClient) return resendClient;
  console.log('[EmailService] ✅ Using Resend HTTP API (production-ready)');
  resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
};

// Initialize Nodemailer (SMTP-based, for local development)
const initTransporter = async () => {
  if (transporter) return transporter;

  if (!process.env.SMTP_HOST) {
    console.log('[EmailService] SMTP_HOST not set, generating Ethereal test account...');
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
  } else {
    console.log(`[EmailService] Using SMTP: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

// ─── Unified Send Function ─────────────────────────────────────────
const sendEmail = async ({ to, subject, html }) => {
  if (useResend()) {
    const resend = initResend();
    const fromAddress = process.env.RESEND_FROM || 'SmartHire <onboarding@resend.dev>';
    console.log(`[EmailService] Sending email via Resend to: ${to}`);
    
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('[EmailService] ❌ Resend error:', error);
      throw new Error(error.message);
    }
    console.log('[EmailService] ✅ Email sent via Resend:', data.id);
    return data;
  } else {
    // Fallback to SMTP (local development)
    const t = await initTransporter();
    const from = process.env.SMTP_FROM || '"SmartHire" <noreply@smarthire.com>';
    console.log(`[EmailService] Sending email via SMTP to: ${to}`);

    const info = await t.sendMail({ from, to, subject, html });
    console.log('[EmailService] ✅ Email sent via SMTP:', info.messageId);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('[EmailService] 📧 Preview URL:', previewUrl);
    }
    return info;
  }
};

// ─── Status Update Email ───────────────────────────────────────────
export const sendStatusUpdateEmail = async (candidateEmail, candidateName, jobTitle, companyName, newStatus) => {
  try {
    let subject = '';
    let html = '';

    switch (newStatus) {
      case 'Reviewed':
        subject = `Update on your application for ${jobTitle} at ${companyName}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #0ea5e9;">Application Update</h2>
            <p>Hi ${candidateName},</p>
            <p>Good news! Your application for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong> has been reviewed by the team.</p>
            <p>We will be in touch soon with the next steps.</p>
            <br/>
            <p>Best regards,<br/>The ${companyName} Team</p>
          </div>
        `;
        break;
      case 'Shortlisted':
        subject = `Congratulations! You've been shortlisted for ${jobTitle}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #0ea5e9;">You're Shortlisted! 🎉</h2>
            <p>Hi ${candidateName},</p>
            <p>Congratulations! Your application for the <strong>${jobTitle}</strong> position stood out to us, and you have been shortlisted for the next round.</p>
            <p>Our recruitment team will reach out to you shortly to schedule an interview.</p>
            <br/>
            <p>Best regards,<br/>The ${companyName} Team</p>
          </div>
        `;
        break;
      case 'Hired':
        subject = `Offer Extended: ${jobTitle} at ${companyName}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #10b981;">Welcome to the Team! 🥳</h2>
            <p>Hi ${candidateName},</p>
            <p>We are thrilled to let you know that we would like to offer you the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>.</p>
            <p>Please check your inbox for the official offer letter and next steps.</p>
            <br/>
            <p>Best regards,<br/>The ${companyName} Team</p>
          </div>
        `;
        break;
      case 'Rejected':
        subject = `Update regarding your application for ${jobTitle}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #64748b;">Application Update</h2>
            <p>Hi ${candidateName},</p>
            <p>Thank you for applying to the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong> and for taking the time to share your background with us.</p>
            <p>After careful consideration, we have decided to move forward with other candidates whose qualifications better match our current needs.</p>
            <p>We encourage you to apply for future openings and wish you the best in your job search.</p>
            <br/>
            <p>Best regards,<br/>The ${companyName} Team</p>
          </div>
        `;
        break;
      default:
        // Applied or other
        return; 
    }

    await sendEmail({ to: candidateEmail, subject, html });
  } catch (error) {
    console.error('[EmailService] Failed to send status update email:', error);
  }
};

// ─── Password Reset Email ──────────────────────────────────────────
export const sendPasswordResetEmail = async (email, name, resetUrl) => {
  try {
    const subject = 'Password Reset Request - SmartHire';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #0ea5e9;">Reset Your Password</h2>
        <p>Hi ${name},</p>
        <p>We received a request to reset the password for your SmartHire account. Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
        <p style="color: #64748b; font-size: 12px; margin-top: 40px;">This link will expire in 1 hour.</p>
      </div>
    `;

    await sendEmail({ to: email, subject, html });
  } catch (error) {
    console.error('[EmailService] Failed to send password reset email:', error);
  }
};
