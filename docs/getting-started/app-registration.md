# App Registration

To use SAuth 1.0, you need to register your application with SyncNexa. This guide walks you through the registration process.

## Overview

App registration provides you with credentials needed for SAuth 1.0 integration:

- **app_id** — Unique identifier for your application
- **client_id** — OAuth client identifier (UUID)
- **client_secret** — Secret for backend authentication (keep private!)
- **callback_url** — Where users return after authorization

## Prerequisites

Before registering, you need:

1. **SyncNexa Account** — Create a user account first
2. **Authentication Token** — Login to get a JWT token
3. **App Details** — Name, description, website URL, callback URL, scopes

> **Note**: A developer dashboard is planned for the future to simplify this process. Currently, registration is done via API.

## Step-by-Step Registration

### Step 1: Create Your SyncNexa Account

If you don't have an account yet:

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "developer@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "developer",
  "country": "Nigeria",
  "state": "Lagos",
  "address": "123 Developer Street",
  "gender": "male",
  "phone": "+2348012345678"
}
```

> **Note:** For student registration, you must include `academic_info` with `institution`, `matric_number`, and `program`. See [Authentication Flow](../flows/authentication.md) for details.

### Step 2: Login to Get Access Token

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "developer@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_abc123",
    "email": "developer@example.com"
  }
}
```

Save the `token` — you'll need it for the next step.

### Step 3: Register Your Application

Use the token to register your app:

```http
POST /api/v1/apps/register
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Student Portal",
  "description": "A comprehensive platform for students to manage coursework and documents",
  "website_url": "https://myapp.example.com",
  "callback_url": "https://myapp.example.com/auth/callback",
  "scopes": ["profile", "student:profile", "student:documents"]
}
```

**Request Fields:**

| Field          | Type   | Required | Description                                      |
| -------------- | ------ | -------- | ------------------------------------------------ |
| `name`         | string | Yes      | Your app's display name                          |
| `description`  | string | No       | Brief description of your app                    |
| `website_url`  | string | No       | Your app's homepage URL                          |
| `callback_url` | string | Yes      | OAuth redirect URI (must be HTTPS in production) |
| `scopes`       | array  | No       | Requested scopes (defaults to `["profile"]`)     |

**Response:**

```json
{
  "status": "success",
  "message": "App registered successfully.",
  "data": {
    "id": "app_abc123def456",
    "client_id": "550e8400-e29b-41d4-a716-446655440000",
    "client_secret": "a1b2c3d4e5f6...xyz",
    "name": "Student Portal",
    "description": "A comprehensive platform for students...",
    "website_url": "https://myapp.example.com",
    "callback_url": "https://myapp.example.com/auth/callback",
    "scopes": ["profile", "student:profile", "student:documents"],
    "owner_id": "user_abc123",
    "status": "active",
    "created_at": "2025-12-08T10:30:00Z"
  }
}
```

⚠️ **IMPORTANT**: The `client_secret` is only shown once during registration. Store it securely immediately — you cannot retrieve it later!

### Step 4: Understanding the Response

The **callback_url** is critical for security. It must:

- Be an **absolute HTTPS URL** (HTTP only allowed for localhost)
- Be **exact** — no extra query parameters
- Be **valid and accessible** from the user's browser

**Common callback URLs:**

- Web app: `https://myapp.com/auth/callback`
- Development: `http://localhost:3000/auth/callback`

### Step 5: Store Your Credentials Securely

Create a `.env` file in your project:

```env
SAUTH_APP_ID=app_abc123def456
SAUTH_CLIENT_ID=550e8400-e29b-41d4-a716-446655440000
SAUTH_CLIENT_SECRET=a1b2c3d4e5f6...xyz
SAUTH_CALLBACK_URL=https://myapp.example.com/auth/callback
SAUTH_BASE_URL=https://identity.syncnexa.com/api/v1
```

For development/local testing:

```env
SAUTH_APP_ID=app_abc123def456
SAUTH_CLIENT_ID=550e8400-e29b-41d4-a716-446655440000
SAUTH_CLIENT_SECRET=a1b2c3d4e5f6...xyz
SAUTH_CALLBACK_URL=http://localhost:3000/auth/callback
SAUTH_BASE_URL=http://localhost:3000/api/v1
```

**Never commit `.env` files to git!** Add `.env` to your `.gitignore`.

## Managing Your Apps

### View Your Registered Apps

```http
GET /api/v1/apps/my-apps
Authorization: Bearer {your_token}
```

Returns all apps you've registered (without secrets).

### Update App Details

```http
PATCH /api/v1/apps/:id
Authorization: Bearer {your_token}
Content-Type: application/json

{
  "name": "Updated App Name",
  "description": "Updated description",
  "callback_url": "https://new-callback.com/auth/callback"
}
```

### Rotate Client Secret

If your secret is compromised:

```http
POST /api/v1/apps/rotate-secret
Authorization: Bearer {your_token}
Content-Type: application/json

{
  "app_id": "app_abc123def456"
}
```

Returns a new `client_secret` (old one is invalidated immediately).

### Delete an App

```http
DELETE /api/v1/apps/:id
Authorization: Bearer {your_token}
```

Permanently deletes the app and revokes all user access.

## Multiple Environments

For development, staging, and production, register separate apps with different callback URLs:

| Environment | App Name           | Callback URL                                |
| ----------- | ------------------ | ------------------------------------------- |
| Development | `My App (Dev)`     | `http://localhost:3000/auth/callback`       |
| Staging     | `My App (Staging)` | `https://staging.example.com/auth/callback` |
| Production  | `My App`           | `https://app.example.com/auth/callback`     |

Use environment variables to switch between them:

```javascript
const appId =
  process.env.NODE_ENV === "production"
    ? process.env.SAUTH_APP_ID_PROD
    : process.env.SAUTH_APP_ID_DEV;
```

## Security Checklist

Before going live:

- ✅ **CLIENT_SECRET stored securely** — Only in environment variables, never in code
- ✅ **HTTPS only** — Production redirect URIs must use HTTPS
- ✅ **Redirect URI validated** — Matches exactly what's registered
- ✅ **State parameter implemented** — Prevents CSRF attacks
- ✅ **Tokens stored securely** — Use httpOnly cookies or secure storage
- ✅ **No sensitive data in logs** — Don't log tokens or secrets

## Troubleshooting

### "Invalid callback_url"

The callback URL in your SAuth request doesn't match what's registered. Check:

- Exact URL match (including protocol, domain, path)
- No trailing slashes (unless registered with one)
- No extra query parameters

### "Unauthorized" when registering

You need to be logged in. Ensure:

- You have a valid JWT token
- Token is in the `Authorization: Bearer {token}` header
- Token hasn't expired

### "Client Authentication Failed"

Your `client_secret` is wrong or missing when exchanging tokens. Ensure:

- `client_secret` is in your backend .env file
- It matches exactly what you received during registration
- You're passing it in the `/sauth/token` request body

### Lost Your Client Secret?

Client secrets cannot be retrieved. You must rotate to get a new one:

```http
POST /api/v1/apps/rotate-secret
Authorization: Bearer {your_token}
Content-Type: application/json

{
  "app_id": "your_app_id"
}
```

This invalidates the old secret and returns a new one.

## Coming Soon: Developer Dashboard

A web-based developer dashboard is planned to simplify app registration and management. It will include:

- Visual app registration form
- View and manage all your apps
- Monitor usage statistics
- Rotate secrets with one click
- Test authorization flows

Stay tuned for updates!

## Next Steps

→ [Installation](./installation) — Set up SAuth 1.0 in your project  
→ [Quick Start](./quick-start) — Implement the SAuth flow  
→ [API Reference](../api/authorize) — Explore endpoints
