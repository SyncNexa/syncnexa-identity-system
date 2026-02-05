import transporter from "../config/email.js";
import { environment } from "../config/env.js";
import fs from "fs";
import path from "path";

interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

const logoPaths = [
  path.resolve(process.cwd(), "src/public/logo.svg"),
  path.resolve(process.cwd(), "public/logo.svg"),
  path.resolve(process.cwd(), "dist/public/logo.svg"),
];

let cachedLogoHtml: string | null = null;
let cachedLogoAttachment: {
  filename: string;
  content: Buffer;
  cid: string;
  contentType: string;
} | null = null;

function getLogoAttachment() {
  if (cachedLogoAttachment) return cachedLogoAttachment;

  for (const logoPath of logoPaths) {
    if (fs.existsSync(logoPath)) {
      const svgBuffer = fs.readFileSync(logoPath);
      cachedLogoAttachment = {
        filename: "logo.svg",
        content: svgBuffer,
        cid: "syncnexa-logo",
        contentType: "image/svg+xml",
      };
      return cachedLogoAttachment;
    }
  }

  return null;
}

function getLogoHtml(): string {
  if (cachedLogoHtml) return cachedLogoHtml;

  const logoAttachment = getLogoAttachment();
  if (logoAttachment) {
    cachedLogoHtml = `<img src="cid:${logoAttachment.cid}" alt="SyncNexa" class="logo-img" />`;
    return cachedLogoHtml;
  }

  cachedLogoHtml = "SyncNexa";
  return cachedLogoHtml;
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

    const logoAttachment = getLogoAttachment();

    const result = await transporter.sendMail({
      from: fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      attachments: logoAttachment ? [logoAttachment] : undefined,
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
          .logo-img {
            height: 40px;
            max-width: 160px;
            display: inline-block;
          }
          .logo-img {
            height: 40px;
            max-width: 160px;
            display: inline-block;
          }
          .logo-img {
            height: 40px;
            max-width: 160px;
            display: inline-block;
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
            <div class="logo">${getLogoHtml()}</div>
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
            <div class="logo">${getLogoHtml()}</div>
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
            <div class="logo">${getLogoHtml()}</div>
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
 * Send successful login alert
 */
export async function sendSuccessfulLoginAttemptEmail(
  email: string,
  ipAddress: string,
  userAgent: string,
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
          .logo-img {
            height: 40px;
            max-width: 160px;
            display: inline-block;
          }
          .title {
            font-size: 28px;
            font-weight: 600;
            color: #16a34a;
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
            <div class="logo">${getLogoHtml()}</div>
            <h1 class="title">New Login Detected</h1>
          </div>

          <p class="message">
            We detected a successful login to your SyncNexa account. If this was you, no action is required.
          </p>

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

          <p class="message">
            <strong>If this wasn't you:</strong> Change your password immediately and contact support.
          </p>

          <div class="footer">
            <p>© ${new Date().getFullYear()} SyncNexa. All rights reserved.</p>
            <p>This is an automated security alert. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
SyncNexa - Successful Login Alert

We detected a successful login to your SyncNexa account.

LOGIN DETAILS:
- Time: ${timestamp}
- IP Address: ${ipAddress}
- Device: ${userAgent}

If this wasn't you: Change your password immediately and contact support.

© ${new Date().getFullYear()} SyncNexa. All rights reserved.
This is an automated security alert. Please do not reply to this email.
  `;

  return sendEmail({
    to: email,
    subject: "Security Alert: New Login Detected",
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
          .logo-img {
            height: 40px;
            max-width: 160px;
            display: inline-block;
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
            <div class="logo">${getLogoHtml()}</div>
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

/**
 * Send email change alert to old email
 */
export async function sendEmailChangeAlertEmail(
  oldEmail: string,
  newEmail: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<boolean> {
  const timestamp = new Date().toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });

  const logo = getLogoHtml();

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; }
          .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #e0e0e0; }
          .logo-img { max-width: 150px; margin-bottom: 10px; }
          .alert { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .content { background-color: white; padding: 20px; border-radius: 4px; margin-bottom: 20px; }
          .details { background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 15px 0; font-size: 14px; }
          .detail-row { margin: 8px 0; }
          .detail-label { font-weight: bold; color: #555; }
          .warning { color: #d32f2f; font-weight: bold; }
          .action-section { background-color: #e8f5e9; padding: 15px; border-radius: 4px; margin: 15px 0; border-left: 4px solid #4caf50; }
          .button { display: inline-block; background-color: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            ${logo}
            <h2>⚠️ EMAIL ADDRESS CHANGED</h2>
          </div>

          <div class="alert">
            <p><strong>IMPORTANT SECURITY ALERT</strong></p>
            <p>The email address associated with your SyncNexa account has been changed.</p>
          </div>

          <div class="content">
            <p>Hello,</p>
            <p>We're sending this alert to your old email address (${oldEmail}) to inform you that the email address on your SyncNexa account has been changed.</p>

            <p><strong>NEW EMAIL ADDRESS:</strong></p>
            <p style="font-size: 18px; color: #1976d2; font-weight: bold;">${newEmail}</p>

            <div class="details">
              <p style="margin-top: 0;"><strong>CHANGE DETAILS:</strong></p>
              <div class="detail-row">
                <span class="detail-label">Changed At:</span> ${timestamp}
              </div>
              ${ipAddress ? `<div class="detail-row"><span class="detail-label">IP Address:</span> ${ipAddress}</div>` : ""}
              ${userAgent ? `<div class="detail-row"><span class="detail-label">Device:</span> ${userAgent}</div>` : ""}
            </div>

            <div class="action-section">
              <p><strong>✓ IF THIS WAS YOU:</strong></p>
              <p>No action needed. Your email address has been successfully updated. An OTP verification link has been sent to your new email address (${newEmail}). Please verify it to complete the process.</p>
            </div>

            <div class="action-section" style="background-color: #ffebee; border-left-color: #d32f2f;">
              <p><strong class="warning">⚠️ IF THIS WASN'T YOU:</strong></p>
              <p>Your account may have been compromised. Take immediate action:</p>
              <ul>
                <li>Reset your password immediately</li>
                <li>Enable two-factor authentication (2FA)</li>
                <li>Review your account activity and connected devices</li>
                <li>Contact our security team for assistance</li>
              </ul>
              <a href="https://app.syncnexa.io/security" class="button" style="background-color: #d32f2f;">View Account Security</a>
            </div>

            <p><strong>IMPORTANT:</strong> All active sessions have been terminated as a security measure. You will need to log in again with your credentials.</p>
          </div>

          <div class="footer">
            <p>© ${new Date().getFullYear()} SyncNexa. All rights reserved.</p>
            <p>This is an automated security alert. Please do not reply to this email.</p>
            <p>If you did not request this change, please secure your account immediately by contacting our support team.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
SyncNexa - Email Address Changed Alert

⚠️ SECURITY ALERT

The email address associated with your SyncNexa account has been changed.

NEW EMAIL ADDRESS: ${newEmail}

CHANGE DETAILS:
- Changed At: ${timestamp}
${ipAddress ? `- IP Address: ${ipAddress}` : ""}
${userAgent ? `- Device: ${userAgent}` : ""}

IF THIS WAS YOU:
No action needed. Your email address has been successfully updated. An OTP verification link has been sent to your new email address. Please verify it to complete the process.

IF THIS WASN'T YOU:
Your account may have been compromised. Take immediate action:
- Reset your password immediately
- Enable two-factor authentication (2FA)
- Review your account activity
- Contact our support team

IMPORTANT: All active sessions have been terminated as a security measure. You will need to log in again.

© ${new Date().getFullYear()} SyncNexa. All rights reserved.
This is an automated security alert. Please do not reply to this email.
  `;

  return sendEmail({
    to: oldEmail,
    subject:
      "⚠️ Security Alert: Email Address Changed on Your SyncNexa Account",
    html,
    text,
  });
}
