# Email Configuration Guide

This guide explains how to configure email sending for the SyncNexa Identity System.

## Environment Variables

Add the following environment variables to your `.env.development` or `.env.production` file:

### Basic Configuration

```env
# Email provider: 'smtp', 'gmail', 'sendgrid', 'mailgun', or 'mock'
EMAIL_PROVIDER=smtp

# From email address
EMAIL_FROM=noreply@syncnexa.io

# Application URL (used in password reset links)
APP_URL=http://localhost:3000
```

## Provider Setup

### 1. Generic SMTP (Default)

If using a standard SMTP server:

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
EMAIL_FROM=noreply@syncnexa.io
```

**Common SMTP Providers:**

- **Gmail**: `smtp.gmail.com` (port 587)
- **Outlook**: `smtp-mail.outlook.com` (port 587)
- **SendGrid**: `smtp.sendgrid.net` (port 587)
- **Mailgun**: `smtp.mailgun.org` (port 587)
- **AWS SES**: `email-smtp.region.amazonaws.com` (port 587)

### 2. Gmail

For Gmail, you need to use an [App Password](https://support.google.com/accounts/answer/185833):

```env
EMAIL_PROVIDER=gmail
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
EMAIL_FROM=your-email@gmail.com
```

**Steps to create an App Password:**

1. Enable 2-Step Verification on your Google Account
2. Go to [Google Account Security](https://myaccount.google.com/security)
3. Find "App passwords" in the left sidebar
4. Select "Mail" and "Windows Computer"
5. Google will provide a 16-character password

### 3. SendGrid

```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.your-sendgrid-api-key
EMAIL_FROM=noreply@syncnexa.io
```

**Get your API Key:**

1. Create a SendGrid account at [sendgrid.com](https://sendgrid.com)
2. Go to Settings → API Keys
3. Create a new API key with "Mail Send" permission

### 4. Mailgun

```env
EMAIL_PROVIDER=mailgun
MAILGUN_SMTP_HOST=smtp.mailgun.org
MAILGUN_SMTP_USER=postmaster@your-domain.mailgun.org
MAILGUN_SMTP_PASSWORD=your-mailgun-password
EMAIL_FROM=noreply@your-domain
```

### 5. Development/Testing (Mock)

For development without actually sending emails:

```env
EMAIL_PROVIDER=mock
EMAIL_FROM=noreply@syncnexa.io
```

Emails will be logged to the console instead of being sent.

## Email Features

### 1. Email Verification OTP

When users request email verification:

- A 6-digit OTP is generated
- OTP expires in 15 minutes
- HTML-formatted email is sent with the OTP
- In development, OTP is also returned in the API response

**Endpoint:** `POST /auth/verify-email/request`

### 2. Password Reset

When users request a password reset:

- A reset token is generated
- Link expires in 60 minutes
- HTML-formatted email is sent with reset link

**Setup Required:**

- Set `APP_URL` to your application's URL for password reset links

### 3. Welcome Email

Send a welcome email when a user registers:

- Personalized greeting
- Account confirmation message
- Professional HTML template

## Environment Files

Create the following files in the project root:

### `.env.development`

```env
NODE_ENV=development
EMAIL_PROVIDER=smtp
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false
EMAIL_FROM=noreply@syncnexa.dev
APP_URL=http://localhost:3000
```

### `.env.production`

```env
NODE_ENV=production
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.your-api-key
EMAIL_FROM=noreply@syncnexa.io
APP_URL=https://syncnexa.io
```

## Testing Email Configuration

### 1. Using MailHog (Recommended for Development)

MailHog is a local SMTP server for testing:

```bash
# Install MailHog
# Download from: https://github.com/mailhog/MailHog

# Run MailHog
./mailhog

# It starts SMTP server on localhost:1025
# UI available at http://localhost:8025
```

Then use this `.env.development`:

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false
EMAIL_FROM=test@example.com
```

### 2. Using Ethereal Email (Temporary Test Account)

```bash
# Create a free temporary Ethereal account
# https://ethereal.email

# Use the provided SMTP credentials in your .env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-ethereal-user@ethereal.email
SMTP_PASSWORD=your-ethereal-password
EMAIL_FROM=test@example.com
```

### 3. Using Development Mode

For development without any email setup:

```env
EMAIL_PROVIDER=mock
```

Emails will only be logged to console.

## Troubleshooting

### "Could not verify email transporter connection"

This warning appears when the email transporter can't connect. Common causes:

1. **Wrong credentials**: Verify SMTP username/password
2. **Port blocked**: Check if the SMTP port is accessible
3. **TLS/SSL issues**: Try toggling `SMTP_SECURE` (true for 465, false for 587)
4. **Network issues**: Ensure outbound connection to SMTP server is allowed

### Emails not being sent

Check:

1. Application logs for email errors
2. Firewall/network blocking SMTP port
3. SMTP server authentication credentials
4. Sender email address is valid
5. Recipient email address is valid

### Gmail App Password Issues

If "App Password" doesn't work:

1. Ensure 2-Step Verification is enabled
2. Re-create the app password
3. Use the exact 16 characters (spaces are ignored)
4. Verify Gmail account is not using security key

## Production Recommendations

1. **Use a professional email service** (SendGrid, Mailgun, AWS SES)
2. **Implement email templates** for consistent branding
3. **Add email logging** for audit trails
4. **Set up bounce handling** to manage invalid addresses
5. **Monitor email deliverability** with service provider
6. **Implement rate limiting** on email requests
7. **Use reply-to address** for support emails
8. **Add unsubscribe links** for marketing emails
9. **Test email deliverability** regularly
10. **Monitor DKIM/SPF/DMARC** records for domain

## Code Usage Examples

### Send Email Verification OTP

```typescript
import { sendEmailVerificationOTP } from "../utils/email.js";

// In your controller/service
await sendEmailVerificationOTP("user@example.com", "123456", 15);
```

### Send Password Reset Email

```typescript
import { sendPasswordResetEmail } from "../utils/email.js";

await sendPasswordResetEmail("user@example.com", "reset-token-here", 60);
```

### Send Welcome Email

```typescript
import { sendWelcomeEmail } from "../utils/email.js";

await sendWelcomeEmail("user@example.com", "John");
```

### Send Custom Email

```typescript
import { sendEmail } from "../utils/email.js";

await sendEmail({
  to: "user@example.com",
  subject: "Custom Subject",
  html: "<h1>Hello</h1>",
  text: "Hello",
});
```

## Security Notes

1. **Never commit `.env` files** to version control
2. **Use environment-specific secrets** (never hardcode credentials)
3. **Rotate API keys** periodically
4. **Use SMTP_SECURE=true** for production (port 465)
5. **Validate email addresses** before sending
6. **Rate limit email requests** to prevent abuse
7. **Log email failures** for debugging and monitoring
8. **Use TLS** for SMTP connections in production

## Related Files

- [src/config/email.ts](../src/config/email.ts) - Email transporter configuration
- [src/utils/email.ts](../src/utils/email.ts) - Email sending utilities
- [src/services/emailVerification.service.ts](../src/services/emailVerification.service.ts) - Email verification logic
- [src/controllers/emailVerification.controller.ts](../src/controllers/emailVerification.controller.ts) - Email verification API endpoints
