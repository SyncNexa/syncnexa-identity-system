# Installation

## Prerequisites

- Node.js 16+ or Python 3.8+
- npm, yarn, or pip
- Basic understanding of SAuth

### Email Delivery & Verification

- Configure an email provider to send OTPs:
  - SMTP (custom) or a service like SendGrid/Mailgun
  - Set environment variables for credentials
  - Ensure outbound email is allowed in your environment

- Redis is recommended for OTP TTL and rate limiting:
  - `REDIS_URL` — connection string
  - `REDIS_KEY_PREFIX` — optional namespacing
  - Used for: OTP expiry (15 minutes), request throttling

- Rate limiting:
  - Configure per-IP and per-user limits for `/auth/verify-email/*`
  - Return 429 when abused

## Setup Your App

### 1. Register Your Application

Contact SyncNexa to register your application. You'll receive:

- `APP_ID` — Unique identifier for your app
- `CLIENT_ID` — OAuth client identifier
- `CLIENT_SECRET` — OAuth client secret (keep this private!)
- `REDIRECT_URI` — Where users return after authorization

### 2. Store Credentials

Add your credentials to your `.env` file:

```env
SAUTH_APP_ID=your_app_id
SAUTH_CLIENT_ID=your_client_id
SAUTH_CLIENT_SECRET=your_client_secret
SAUTH_REDIRECT_URI=http://localhost:3000/auth/callback
SAUTH_BASE_URL=http://localhost:3000/api/v1
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=secret
REDIS_URL=redis://localhost:6379
REDIS_KEY_PREFIX=snx
```

### 3. Install SDK (Optional)

If available for your language:

```bash
# Node.js
npm install @syncnexa/sauth-sdk

# Python
pip install syncnexa-sauth
```

## Testing

Use `http://localhost:3000` for local development, then update to production URL when ready.

## Next Steps

→ [Quick Start](./quick-start) — Implement the OAuth flow
