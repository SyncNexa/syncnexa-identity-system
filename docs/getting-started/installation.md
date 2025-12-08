# Installation

## Prerequisites

- Node.js 16+ or Python 3.8+
- npm, yarn, or pip
- Basic understanding of SAuth

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
