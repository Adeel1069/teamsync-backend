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

/**
 * Send notification welcome email after user registration
 */
export const sendWelcomeEmail = async (email, firstName) => {
  try {
    const subject = "Welcome to TeamSync!";

    const text = `
Hello ${firstName},

Welcome to TeamSync! We're excited to have you on board.

Your account has been successfully created. You can now start collaborating with your team, manage projects, and boost productivity.

Getting started:
- Create your first workspace
- Invite your team members
- Start managing tasks

If you have any questions, feel free to reach out to our support team.

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
    <h2 style="color: #333; margin-top: 0;">Welcome to TeamSync!</h2>
    <p>Hello <strong>${firstName}</strong>,</p>
    <p>We're excited to have you on board. Your account has been successfully created.</p>
    <p>You can now start collaborating with your team, manage projects, and boost productivity.</p>
    <div style="background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0 0 10px 0; font-weight: bold;">Getting started:</p>
      <ul style="margin: 0; padding-left: 20px;">
        <li>Create your first workspace</li>
        <li>Invite your team members</li>
        <li>Start managing tasks</li>
      </ul>
    </div>
    <p style="color: #666; font-size: 14px;">If you have any questions, feel free to reach out to our support team.</p>
    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
    <p style="color: #999; font-size: 12px; text-align: center;">
      This is an automated email from TeamSync. Please do not reply to this email.
    </p>
  </div>
</body>
</html>
  `.trim();

    await sendEmail({ to: email, subject, text, html });
  } catch (error) {
    logger.error("EMAIL", "Failed to send welcome email", error);
  }
};

/**
 * Send notification email after password change
 */
export const sendPasswordChangedEmail = async (email, firstName) => {
  try {
    const subject = "Password Changed - TeamSync";

    const text = `
Hello ${firstName},

Your password has been successfully changed.

If you made this change, you can safely ignore this email.

If you did not change your password, please contact our support team immediately as your account may be compromised.

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
    <h2 style="color: #333; margin-top: 0;">Password Changed</h2>
    <p>Hello <strong>${firstName}</strong>,</p>
    <p>Your password has been successfully changed.</p>
    <p>If you made this change, you can safely ignore this email.</p>
    <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
      <p style="margin: 0; color: #856404;">
        <strong>Didn't make this change?</strong><br>
        If you did not change your password, please contact our support team immediately as your account may be compromised.
      </p>
    </div>
    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
    <p style="color: #999; font-size: 12px; text-align: center;">
      This is an automated email from TeamSync. Please do not reply to this email.
    </p>
  </div>
</body>
</html>
  `.trim();

    await sendEmail({ to: email, subject, text, html });
  } catch (error) {
    logger.error("EMAIL", "Failed to send password change email", error);
  }
};

/**
 * Send notification email when first workspace is created
 */
export const sendWorkspaceCreatedEmail = async (
  email,
  firstName,
  workspaceName,
) => {
  try {
    const subject = "Workspace Created - TeamSync";

    const text = `
Hello ${firstName},

Congratulations! Your workspace "${workspaceName}" has been successfully created.

You're now ready to:
- Invite team members to collaborate
- Create projects and tasks
- Start tracking progress

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
    <h2 style="color: #333; margin-top: 0;">Workspace Created!</h2>
    <p>Hello <strong>${firstName}</strong>,</p>
    <p>Congratulations! Your workspace has been successfully created.</p>
    <div style="background: #667eea; color: white; font-size: 18px; font-weight: bold; text-align: center; padding: 15px; border-radius: 8px; margin: 20px 0;">
      ${workspaceName}
    </div>
    <p>You're now ready to:</p>
    <ul style="padding-left: 20px;">
      <li>Invite team members to collaborate</li>
      <li>Create projects and tasks</li>
      <li>Start tracking progress</li>
    </ul>
    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
    <p style="color: #999; font-size: 12px; text-align: center;">
      This is an automated email from TeamSync. Please do not reply to this email.
    </p>
  </div>
</body>
</html>
  `.trim();

    await sendEmail({ to: email, subject, text, html });
  } catch (error) {
    logger.error(
      "EMAIL",
      "Failed to send first workspace created email",
      error,
    );
  }
};
