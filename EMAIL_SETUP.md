# Email Sending Setup - Quick Start

Email sending has been successfully wired into your SyncNexa identity system! Here's what was implemented:

## What's New

✅ **Nodemailer Integration** - Industry-standard Node.js email library  
✅ **Email Configuration** - Multi-provider support (SMTP, Gmail, SendGrid, Mailgun)  
✅ **Pre-built Email Templates** - Professional HTML emails  
✅ **OTP Verification Emails** - 6-digit code with 15-minute expiry  
✅ **Password Reset Emails** - Secure password reset links  
✅ **Welcome Emails** - Personalized user onboarding

## Quick Setup

### 1. Development Setup (Recommended)

**Option A: Use Mock Mode (No Email Server)**

Add to `.env.development`:

```env
EMAIL_PROVIDER=mock
EMAIL_FROM=noreply@syncnexa.dev
APP_URL=http://localhost:3000
```

Emails will be logged to console instead of sending.

**Option B: Use MailHog (Local Email Server)**

1. Download MailHog: https://github.com/mailhog/MailHog/releases
2. Run it: `./mailhog` (default: SMTP on localhost:1025, UI on localhost:8025)
3. Add to `.env.development`:

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false
EMAIL_FROM=test@example.com
APP_URL=http://localhost:3000
```

### 2. Production Setup

Choose one of these services:

**Gmail:**

```env
EMAIL_PROVIDER=gmail
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
EMAIL_FROM=your-email@gmail.com
APP_URL=https://yourdomain.com
```

**SendGrid:**

```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.your-api-key
EMAIL_FROM=noreply@yourdomain.com
APP_URL=https://yourdomain.com
```

**Mailgun:**

```env
EMAIL_PROVIDER=mailgun
MAILGUN_SMTP_HOST=smtp.mailgun.org
MAILGUN_SMTP_USER=postmaster@yourdomain.mailgun.org
MAILGUN_SMTP_PASSWORD=your-password
EMAIL_FROM=noreply@yourdomain.com
APP_URL=https://yourdomain.com
```

## Files Added/Modified

### New Files:

- **[src/config/email.ts](src/config/email.ts)** - Email provider configuration
- **[src/utils/email.ts](src/utils/email.ts)** - Email sending utilities with templates
- **[EMAIL_CONFIG.md](EMAIL_CONFIG.md)** - Detailed configuration guide

### Modified Files:

- **[src/services/emailVerification.service.ts](src/services/emailVerification.service.ts)** - Added email sending
- **[src/controllers/emailVerification.controller.ts](src/controllers/emailVerification.controller.ts)** - Integrated email sending

## API Endpoints Using Email

### Email Verification

```
POST /auth/verify-email/request
- Sends OTP to user's email
- Returns: { expiresIn, message, (otp in dev mode) }

POST /auth/verify-email
- Verifies email with OTP
- Body: { otp }
- Returns: { verified, message }

GET /auth/verify-email/status
- Check verification status
- Returns: { verified, message }
```

## Email Templates Included

1. **Email Verification OTP**
   - 6-digit code
   - 15-minute expiry
   - Security warning
   - Professional HTML design

2. **Password Reset**
   - Secure reset link
   - 60-minute expiry
   - Security notice
   - Copy-paste fallback

3. **Welcome Email**
   - Personalized greeting
   - Account confirmation
   - Support information

## Testing

### Development Mode

1. Start the server:

```bash
npm run dev
```

2. Register a user:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "Password123!",
    "country": "Nigeria",
    "state": "Lagos",
    "address": "123 Street",
    "gender": "male",
    "phone": "+2348012345678",
    "role": "student",
    "academic_info": {
      "institution": "University of Lagos",
      "matric_number": "18/12345"
    }
  }'
```

3. Request email verification:

```bash
curl -X POST http://localhost:3000/auth/verify-email/request \
  -H "Authorization: Bearer YOUR_TOKEN"
```

In development with `EMAIL_PROVIDER=mock`, check the console for the OTP.

4. Verify email:

```bash
curl -X POST http://localhost:3000/auth/verify-email \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "otp": "123456" }'
```

## Environment Variables Reference

```env
# Email Configuration
EMAIL_PROVIDER=smtp|gmail|sendgrid|mailgun|mock
EMAIL_FROM=noreply@syncnexa.io
APP_URL=http://localhost:3000

# SMTP (if using 'smtp' provider)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=user@example.com
SMTP_PASSWORD=password

# Gmail (if using 'gmail' provider)
GMAIL_USER=user@gmail.com
GMAIL_APP_PASSWORD=app-password

# SendGrid (if using 'sendgrid' provider)
SENDGRID_API_KEY=SG.xxxxx

# Mailgun (if using 'mailgun' provider)
MAILGUN_SMTP_HOST=smtp.mailgun.org
MAILGUN_SMTP_USER=postmaster@domain
MAILGUN_SMTP_PASSWORD=password
```

## Troubleshooting

**Emails not sending in production?**

1. Check EMAIL_PROVIDER is set correctly
2. Verify API keys/credentials are correct
3. Ensure firewall allows outbound SMTP connection
4. Check email provider logs for bounces
5. Verify sender address is authorized

**Emails going to spam?**

1. Set up SPF, DKIM, DMARC records
2. Use a professional email service
3. Include unsubscribe links
4. Use consistent branding

**Development emails not logging?**

1. Check NODE_ENV is 'development'
2. Use EMAIL_PROVIDER=mock
3. Check console for logs
4. Ensure code changes are reloaded

## Next Steps

1. **Configure your environment** - Choose a provider and set `.env` variables
2. **Test email sending** - Use the testing endpoints
3. **Review templates** - Customize email designs in [src/utils/email.ts](src/utils/email.ts)
4. **Add more templates** - Create custom emails as needed
5. **Monitor deliverability** - Set up logs and monitoring

## More Information

See [EMAIL_CONFIG.md](EMAIL_CONFIG.md) for:

- Detailed provider setup instructions
- Email authentication setup
- Production best practices
- Code usage examples
- Security recommendations

## Packages Installed

- `nodemailer` - Email sending library
- `@types/nodemailer` - TypeScript types

## Questions?

Refer to:

- [EMAIL_CONFIG.md](EMAIL_CONFIG.md) - Full documentation
- [Nodemailer Documentation](https://nodemailer.com/)
- [src/config/email.ts](src/config/email.ts) - Configuration code
- [src/utils/email.ts](src/utils/email.ts) - Email templates and utilities
