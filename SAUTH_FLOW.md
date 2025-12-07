# SyncNexa Student Authentication (SAuth) Flow

## Overview

SyncNexa implements a complete SAuth (Student Authentication) Authorization Code Flow for third-party apps to integrate with student identity data. This works similarly to Google Sign-In or GitHub OAuth.

## Architecture

### Components

1. **Apps** - Third-party applications that want to access student data
2. **Students** - Users who authenticate and grant permission
3. **Authorization Server** - SyncNexa Identity (this system)

### Tables

- `apps` - Registered applications with client_id and client_secret
- `authorization_codes` - Temporary authorization codes (10-minute TTL)
- `app_grants` - Persistent access grants for students

## SAuth Authorization Code Flow

### Step 1: Student Initiates Login

Student clicks "Sign in with SyncNexa" on a third-party app.

App redirects to:

```
GET /api/v1/sauth/authorize?
  app_id={APP_ID}&
  scopes=profile+student:profile+student:documents&
  redirect_uri={CALLBACK_URL}&
  state={RANDOM_STATE}
```

### Step 2: Authorization Page (Manual in Current Implementation)

User authenticates with their SyncNexa credentials.

Once authenticated, the authorization endpoint returns a temporary code:

```javascript
{
  code: "hex_string",
  redirect_uri: "https://app.example.com/callback",
  expires_in: 600
}
```

### Step 3: Authorization Server Redirects Back

User is redirected to the callback URL with the authorization code:

```
https://app.example.com/callback?code={CODE}&state={STATE}
```

### Step 4: App Backend Exchanges Code for Token

The app's backend server exchanges the authorization code for an access token:

```
POST /api/v1/sauth/token
Content-Type: application/json

{
  "grant_type": "authorization_code",
  "code": "{CODE}",
  "client_id": "{CLIENT_ID}",
  "client_secret": "{CLIENT_SECRET}",
  "app_id": "{APP_ID}"
}
```

Response:

```javascript
{
  "access_token": "jwt_token",
  "token_type": "Bearer",
  "expires_in": 604800,  // 7 days
  "scope": "profile student:profile student:documents"
}
```

### Step 5: App Uses Access Token to Fetch User Data

App uses the access token to call the userinfo endpoint:

```
GET /api/v1/sauth/userinfo
Authorization: Bearer {ACCESS_TOKEN}
```

Response (based on granted scopes):

```javascript
{
  "sub": "user_id",
  "email": "student@example.com",
  "name": "John Doe",
  "given_name": "John",
  "family_name": "Doe",
  "phone": "+1234567890",
  "institution": "University Name",
  "matric_number": "MAT001",
  "has_verified_documents": true
}
```

## Endpoints

### 1. Authorization Endpoint

**GET** `/api/v1/sauth/authorize`

**Query Parameters:**

- `app_id` (required) - UUID of the registered app
- `scopes` (required) - Space-separated list of requested scopes
- `redirect_uri` (required) - Callback URL (must match registered callback_url)
- `state` (recommended) - CSRF protection token

**Response:** Redirect to callback URL with `code` and `state`

**Available Scopes:**

- `profile` - Basic profile info (email, name, phone)
- `student:profile` - Student-specific data (institution, matric_number)
- `student:documents` - Access to verified documents
- `student:academics` - Academic records and transcripts
- `student:portfolio` - Projects and certificates

### 2. Token Endpoint

**POST** `/api/v1/sauth/token`

**Request Body:**

```json
{
  "grant_type": "authorization_code",
  "code": "string",
  "client_id": "string",
  "client_secret": "string",
  "app_id": "string"
}
```

**Response:**

```json
{
  "access_token": "jwt_token",
  "token_type": "Bearer",
  "expires_in": 604800,
  "scope": "profile student:profile"
}
```

### 3. User Info Endpoint

**GET** `/api/v1/sauth/userinfo`

**Headers:**

```
Authorization: Bearer {ACCESS_TOKEN}
```

**Response:** User data filtered by granted scopes

### 4. Revoke Access

**POST** `/api/v1/sauth/revoke`

**Request Body:**

```json
{
  "app_id": "string"
}
```

**Authentication:** Required (authenticated user)

**Response:**

```json
{
  "status": "success",
  "message": "App access revoked"
}
```

## Security Features

1. **Authorization Codes**

   - Single-use, 10-minute TTL
   - Bound to specific user and app
   - Marked as used after token exchange

2. **Access Tokens**

   - JWT format with signature verification
   - 7-day expiration
   - Can be revoked by setting `is_revoked` flag

3. **Client Authentication**

   - `client_secret` must be provided in token requests
   - Stored as bcrypt hash in database

4. **Scope-Based Access Control**

   - Tokens valid only for granted scopes
   - Userinfo endpoint filters data by scopes

5. **CSRF Protection**
   - `state` parameter recommended for frontend flows
   - Prevents authorization code injection attacks

## Database Schema

### app_grants

```sql
{
  id: BIGINT PRIMARY KEY,
  user_id: BIGINT FOREIGN KEY,
  app_id: BIGINT FOREIGN KEY,
  scopes: JSON,
  access_token: VARCHAR UNIQUE,
  refresh_token: VARCHAR UNIQUE,
  token_expires_at: DATETIME,
  is_revoked: TINYINT,
  created_at: DATETIME,
  updated_at: DATETIME
}
```

### authorization_codes

```sql
{
  id: BIGINT PRIMARY KEY,
  user_id: BIGINT FOREIGN KEY,
  app_id: BIGINT FOREIGN KEY,
  code: VARCHAR UNIQUE,
  scopes: JSON,
  redirect_uri: VARCHAR,
  is_used: TINYINT,
  expires_at: DATETIME,
  created_at: DATETIME
}
```

## Integration Example

### Frontend (App)

```javascript
// 1. Redirect to authorization endpoint
const authorizeUrl = new URL(
  "https://identity.syncnexa.com/api/v1/sauth/authorize"
);
authorizeUrl.searchParams.set("app_id", APP_ID);
authorizeUrl.searchParams.set("scopes", "profile student:profile");
authorizeUrl.searchParams.set(
  "redirect_uri",
  window.location.origin + "/callback"
);
authorizeUrl.searchParams.set("state", generateRandomState());

window.location.href = authorizeUrl.toString();
```

### Callback Handler

```javascript
// 2. Handle callback with authorization code
const params = new URLSearchParams(window.location.search);
const code = params.get("code");
const state = params.get("state");

// Verify state matches
if (state !== localStorage.getItem("sauth_state")) {
  throw new Error("State mismatch - possible CSRF attack");
}

// Send code to backend
await fetch("/api/callback", {
  method: "POST",
  body: JSON.stringify({ code }),
  headers: { "Content-Type": "application/json" },
});
```

### Backend (App)

```javascript
// 3. Exchange code for token
async function exchangeCode(code) {
  const response = await fetch(
    "https://identity.syncnexa.com/api/v1/sauth/token",
    {
      method: "POST",
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        app_id: APP_ID,
      }),
      headers: { "Content-Type": "application/json" },
    }
  );

  const { access_token } = await response.json();
  return access_token;
}

// 4. Fetch user info
async function getUserInfo(accessToken) {
  const response = await fetch(
    "https://identity.syncnexa.com/api/v1/sauth/userinfo",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  const user = await response.json();
  return user;
}
```

## Environment Variables

```env
JWT_SECRET=your-jwt-secret
```

Used for signing and verifying SAuth tokens.

## Future Enhancements

1. **Refresh Tokens** - Enable token refresh without user re-authentication
2. **PKCE Flow** - For mobile and SPA security
3. **Implicit Flow** - For legacy applications
4. **OpenID Connect** - Identity federation
5. **Consent Screen** - Visual permission confirmation UI
6. **Rate Limiting** - Prevent abuse of token endpoint
7. **Device Flow** - For headless applications
