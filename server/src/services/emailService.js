import nodemailer from 'nodemailer';

let transporter = null;
let transporterVerified = false;

// Initialize the Nodemailer transporter
const initTransporter = async () => {
  if (transporter && transporterVerified) return transporter;

  console.log('[EmailService] Initializing email transporter...');
  console.log('[EmailService] SMTP_HOST:', process.env.SMTP_HOST || '(not set)');
  console.log('[EmailService] SMTP_PORT:', process.env.SMTP_PORT || '(not set)');
  console.log('[EmailService] SMTP_SECURE:', process.env.SMTP_SECURE || '(not set)');
  console.log('[EmailService] SMTP_USER:', process.env.SMTP_USER || '(not set)');
  console.log('[EmailService] SMTP_PASS:', process.env.SMTP_PASS ? '****SET****' : '(not set)');
  console.log('[EmailService] SMTP_FROM:', process.env.SMTP_FROM || '(not set)');

  // Use Ethereal Email for testing if no SMTP is provided
  if (!process.env.SMTP_HOST) {
    console.log('[EmailService] SMTP_HOST not set, generating Ethereal test account...');
    const testAccount = await nodemailer.createTestAccount();
    
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } else {
    // Real SMTP configuration
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

  // Verify the SMTP connection
  try {
    await transporter.verify();
    console.log('[EmailService] ✅ SMTP connection verified successfully!');
    transporterVerified = true;
  } catch (verifyError) {
    console.error('[EmailService] ❌ SMTP connection verification FAILED:', verifyError.message);
    // Reset so it retries next time
    transporter = null;
    transporterVerified = false;
    throw verifyError;
  }

  return transporter;
};

// Helper to log and return message URL (for Ethereal)
const logEmailInfo = (info) => {
  console.log('[EmailService] Email sent:', info.messageId);
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log('[EmailService] 📧 Preview URL:', previewUrl);
  }
};

export const sendStatusUpdateEmail = async (candidateEmail, candidateName, jobTitle, companyName, newStatus) => {
  try {
    const t = await initTransporter();
    
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

    const info = await t.sendMail({
      from: process.env.SMTP_FROM || '"SmartHire" <noreply@smarthire.com>',
      to: candidateEmail,
      subject,
      html,
    });

    logEmailInfo(info);
  } catch (error) {
    console.error('[EmailService] Failed to send status update email:', error);
  }
};

export const sendPasswordResetEmail = async (email, name, resetUrl) => {
  try {
    const t = await initTransporter();

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

    const info = await t.sendMail({
      from: process.env.SMTP_FROM || '"SmartHire Support" <support@smarthire.com>',
      to: email,
      subject,
      html,
    });

    logEmailInfo(info);
  } catch (error) {
    console.error('[EmailService] Failed to send password reset email:', error);
  }
};
