import transporter from "../config/email.js";
import { environment } from "../config/env.js";

interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

/**
 * Send a generic email
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const fromEmail = process.env.EMAIL_FROM || "noreply@syncnexa.io";

    // In mock mode, log instead of sending
    // Allow real emails in development if EMAIL_SEND_REAL is true
    const shouldSendReal = process.env.EMAIL_SEND_REAL === "true";
    if (
      process.env.EMAIL_PROVIDER === "mock" ||
      (environment.isDevelopment && !shouldSendReal)
    ) {
      console.log(
        `[EMAIL - DEV MODE] To: ${options.to}, Subject: ${options.subject}`,
      );
      if (options.html) {
        console.log("[EMAIL - HTML]", options.html.substring(0, 200));
      }
      return true;
    }

    const result = await transporter.sendMail({
      from: fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    console.log("[EMAIL] Email sent successfully:", result.messageId);
    return true;
  } catch (err) {
    console.error("[EMAIL] Error sending email:", err);
    throw err;
  }
}

/**
 * Send email verification OTP
 */
export async function sendEmailVerificationOTP(
  email: string,
  otp: string,
  expiryMinutes: number = 15,
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f9fafb;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            padding: 40px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
          }
          .title {
            font-size: 28px;
            font-weight: 600;
            color: #1f2937;
            margin: 20px 0;
          }
          .message {
            font-size: 16px;
            color: #4b5563;
            line-height: 1.6;
            margin-bottom: 30px;
          }
          .otp-container {
            background-color: #f3f4f6;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 30px 0;
          }
          .otp-code {
            font-size: 32px;
            font-weight: bold;
            color: #1f2937;
            letter-spacing: 4px;
            font-family: 'Courier New', monospace;
          }
          .expiry {
            font-size: 14px;
            color: #6b7280;
            margin-top: 10px;
          }
          .warning {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            font-size: 14px;
            color: #92400e;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">SyncNexa</div>
            <h1 class="title">Verify Your Email</h1>
          </div>
          
          <p class="message">
            Thank you for signing up! To complete your email verification, please use the following one-time password (OTP):
          </p>
          
          <div class="otp-container">
            <div class="otp-code">${otp}</div>
            <div class="expiry">This code expires in ${expiryMinutes} minutes</div>
          </div>
          
          <div class="warning">
            <strong>⚠️ Security Notice:</strong> Never share this code with anyone. SyncNexa will never ask for this code via email or phone.
          </div>
          
          <p class="message">
            If you didn't request this verification code, you can safely ignore this email.
          </p>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} SyncNexa. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
SyncNexa - Email Verification

Verify Your Email

Thank you for signing up! To complete your email verification, please use this one-time password (OTP):

${otp}

This code expires in ${expiryMinutes} minutes.

Security Notice: Never share this code with anyone. SyncNexa will never ask for this code via email or phone.

If you didn't request this verification code, you can safely ignore this email.

© ${new Date().getFullYear()} SyncNexa. All rights reserved.
This is an automated message, please do not reply to this email.
  `;

  return sendEmail({
    to: email,
    subject: "Email Verification Code - SyncNexa",
    html,
    text,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  expiryMinutes: number = 60,
): Promise<boolean> {
  const resetLink = `${process.env.APP_URL}/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f9fafb;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            padding: 40px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
          }
          .title {
            font-size: 28px;
            font-weight: 600;
            color: #1f2937;
            margin: 20px 0;
          }
          .message {
            font-size: 16px;
            color: #4b5563;
            line-height: 1.6;
            margin-bottom: 30px;
          }
          .button-container {
            text-align: center;
            margin: 30px 0;
          }
          .button {
            background-color: #3b82f6;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            display: inline-block;
            font-weight: 600;
          }
          .button:hover {
            background-color: #2563eb;
          }
          .warning {
            background-color: #fee2e2;
            border-left: 4px solid #ef4444;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            font-size: 14px;
            color: #7f1d1d;
          }
          .expiry {
            font-size: 14px;
            color: #6b7280;
            text-align: center;
            margin-top: 20px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">SyncNexa</div>
            <h1 class="title">Reset Your Password</h1>
          </div>
          
          <p class="message">
            We received a request to reset your password. Click the button below to create a new password:
          </p>
          
          <div class="button-container">
            <a href="${resetLink}" class="button">Reset Password</a>
          </div>
          
          <p class="message">
            Or copy and paste this link in your browser: <br/>
            <code style="background-color: #f3f4f6; padding: 2px 6px; border-radius: 3px;">${resetLink}</code>
          </p>
          
          <div class="expiry">
            This link expires in ${expiryMinutes} minutes.
          </div>
          
          <div class="warning">
            <strong>🔒 Security Notice:</strong> If you didn't request a password reset, please ignore this email or contact support if you believe your account has been compromised.
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} SyncNexa. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
SyncNexa - Password Reset Request

Reset Your Password

We received a request to reset your password. Click the link below to create a new password:

${resetLink}

This link expires in ${expiryMinutes} minutes.

Security Notice: If you didn't request a password reset, please ignore this email or contact support if you believe your account has been compromised.

© ${new Date().getFullYear()} SyncNexa. All rights reserved.
This is an automated message, please do not reply to this email.
  `;

  return sendEmail({
    to: email,
    subject: "Password Reset Request - SyncNexa",
    html,
    text,
  });
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(
  email: string,
  firstName: string,
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f9fafb;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            padding: 40px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
          }
          .title {
            font-size: 28px;
            font-weight: 600;
            color: #1f2937;
            margin: 20px 0;
          }
          .message {
            font-size: 16px;
            color: #4b5563;
            line-height: 1.6;
            margin-bottom: 30px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">SyncNexa</div>
            <h1 class="title">Welcome to SyncNexa!</h1>
          </div>
          
          <p class="message">
            Hi ${firstName},
          </p>
          
          <p class="message">
            Welcome to SyncNexa! We're excited to have you join our community. Your account has been successfully created.
          </p>
          
          <p class="message">
            You can now access all the features available to your account. If you have any questions or need assistance, feel free to reach out to our support team.
          </p>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} SyncNexa. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
SyncNexa - Welcome!

Welcome to SyncNexa!

Hi ${firstName},

Welcome to SyncNexa! We're excited to have you join our community. Your account has been successfully created.

You can now access all the features available to your account. If you have any questions or need assistance, feel free to reach out to our support team.

© ${new Date().getFullYear()} SyncNexa. All rights reserved.
This is an automated message, please do not reply to this email.
  `;

  return sendEmail({
    to: email,
    subject: "Welcome to SyncNexa!",
    html,
    text,
  });
}

/**
 * Send failed login attempt alert
 */
export async function sendFailedLoginAttemptEmail(
  email: string,
  ipAddress: string,
  userAgent: string,
  attemptsLeft: number,
): Promise<boolean> {
  const timestamp = new Date().toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f9fafb;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            padding: 40px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
          }
          .alert-icon {
            font-size: 48px;
            margin: 20px 0;
          }
          .title {
            font-size: 28px;
            font-weight: 600;
            color: #dc2626;
            margin: 20px 0;
          }
          .message {
            font-size: 16px;
            color: #4b5563;
            line-height: 1.6;
            margin-bottom: 20px;
          }
          .details-box {
            background-color: #f3f4f6;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .detail-label {
            font-weight: 600;
            color: #6b7280;
          }
          .detail-value {
            color: #1f2937;
            text-align: right;
            max-width: 60%;
            word-wrap: break-word;
          }
          .warning {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            font-size: 14px;
            color: #92400e;
          }
          .critical {
            background-color: #fee2e2;
            border-left: 4px solid #dc2626;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            font-size: 14px;
            color: #7f1d1d;
          }
          .attempts-left {
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            color: #dc2626;
            margin: 20px 0;
          }
          .action-list {
            background-color: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .action-list li {
            margin: 10px 0;
            color: #4b5563;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">SyncNexa</div>
            <div class="alert-icon">⚠️</div>
            <h1 class="title">Failed Login Attempt</h1>
          </div>
          
          <p class="message">
            We detected a failed login attempt on your SyncNexa account. If this was you, you can safely ignore this message.
          </p>
          
          <div class="attempts-left">
            ${attemptsLeft} attempt${attemptsLeft !== 1 ? "s" : ""} remaining before temporary ban
          </div>
          
          <div class="details-box">
            <div class="detail-row">
              <span class="detail-label">Time:</span>
              <span class="detail-value">${timestamp}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">IP Address:</span>
              <span class="detail-value">${ipAddress}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Device:</span>
              <span class="detail-value">${userAgent}</span>
            </div>
          </div>
          
          ${
            attemptsLeft <= 1
              ? `
          <div class="critical">
            <strong>⚠️ Critical Warning:</strong> Your account will be temporarily locked for 2 hours after one more failed attempt. Make sure you're using the correct password.
          </div>
          `
              : `
          <div class="warning">
            <strong>🔒 Security Notice:</strong> After ${attemptsLeft} more failed attempts, your account will be temporarily locked for 2 hours as a security measure.
          </div>
          `
          }
          
          <p class="message">
            <strong>If this wasn't you:</strong>
          </p>
          
          <div class="action-list">
            <ul>
              <li>Someone may be trying to access your account</li>
              <li>Consider changing your password immediately</li>
              <li>Enable two-factor authentication for added security</li>
              <li>Contact our support team if you need assistance</li>
            </ul>
          </div>
          
          <p class="message">
            <strong>If this was you:</strong>
          </p>
          
          <div class="action-list">
            <ul>
              <li>Double-check your password and try again</li>
              <li>Make sure Caps Lock is off</li>
              <li>Use the "Forgot Password" option if needed</li>
              <li>Clear your browser cache and cookies</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} SyncNexa. All rights reserved.</p>
            <p>This is an automated security alert. Please do not reply to this email.</p>
            <p>If you didn't attempt to log in, please secure your account immediately.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
SyncNexa - Failed Login Attempt Alert

⚠️ SECURITY ALERT

We detected a failed login attempt on your SyncNexa account.

ATTEMPTS REMAINING: ${attemptsLeft}

LOGIN ATTEMPT DETAILS:
- Time: ${timestamp}
- IP Address: ${ipAddress}
- Device: ${userAgent}

${attemptsLeft <= 1 ? "⚠️ CRITICAL WARNING: Your account will be temporarily locked for 2 hours after one more failed attempt." : `🔒 After ${attemptsLeft} more failed attempts, your account will be temporarily locked for 2 hours.`}

IF THIS WASN'T YOU:
- Someone may be trying to access your account
- Consider changing your password immediately
- Enable two-factor authentication
- Contact our support team if you need assistance

IF THIS WAS YOU:
- Double-check your password and try again
- Make sure Caps Lock is off
- Use the "Forgot Password" option if needed
- Clear your browser cache and cookies

© ${new Date().getFullYear()} SyncNexa. All rights reserved.
This is an automated security alert. Please do not reply to this email.
  `;

  return sendEmail({
    to: email,
    subject: `⚠️ Security Alert: Failed Login Attempt - ${attemptsLeft} Attempt${attemptsLeft !== 1 ? "s" : ""} Remaining`,
    html,
    text,
  });
}
