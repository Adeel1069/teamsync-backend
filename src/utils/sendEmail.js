import transporter, { emailFrom } from "../config/emailConfig.js";

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain-text version of the content
 * @param {string} options.html - HTML version of the content
 */
const sendEmail = async ({ to, subject, text, html }) => {
  await transporter.sendMail({
    from: emailFrom,
    to,
    subject,
    text,
    html,
  });
};

/**
 * Send OTP email for password reset
 */
export const sendPasswordResetOtp = async (email, otp, firstName) => {
  const subject = "Password Reset OTP - TeamSync";

  const text = `
Hello ${firstName},

You requested to reset your password. Use the following OTP to reset your password:

${otp}

This OTP is valid for 15 minutes. If you didn't request this, please ignore this email.

Best regards,
TeamSync Team
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">TeamSync</h1>
  </div>
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #333; margin-top: 0;">Password Reset Request</h2>
    <p>Hello <strong>${firstName}</strong>,</p>
    <p>You requested to reset your password. Use the following OTP to reset your password:</p>
    <div style="background: #667eea; color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 20px; border-radius: 8px; margin: 20px 0;">
      ${otp}
    </div>
    <p style="color: #666; font-size: 14px;">This OTP is valid for <strong>15 minutes</strong>.</p>
    <p style="color: #666; font-size: 14px;">If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
    <p style="color: #999; font-size: 12px; text-align: center;">
      This is an automated email from TeamSync. Please do not reply to this email.
    </p>
  </div>
</body>
</html>
  `.trim();

  await sendEmail({ to: email, subject, text, html });
};
