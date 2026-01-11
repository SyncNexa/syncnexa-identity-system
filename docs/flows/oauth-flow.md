# OAuth 2.0 / SAuth Flow

Complete documentation for the SyncNexa Student Authentication (SAuth) OAuth 2.0 Authorization Code Flow, allowing third-party applications to integrate with student identity data.

---

## Overview

SyncNexa implements the OAuth 2.0 Authorization Code Flow for third-party applications to securely access student data with explicit user consent. This works similarly to "Sign in with Google" or GitHub OAuth.

**Key Features:**

- Secure authorization code exchange
- Scoped access permissions
- JWT-based access tokens
- Comprehensive consent interface
- Token revocation support

---

## Table of Contents

1. [Authorization Flow](#1-authorization-flow)
2. [Get Consent Page](#2-get-consent-page)
3. [Authorization Decision](#3-authorization-decision)
4. [Exchange Code for Token](#4-exchange-code-for-token)
5. [Get User Info](#5-get-user-info)
6. [Revoke Access](#6-revoke-access)
7. [Security Features](#security-features)
8. [Integration Guide](#integration-guide)

---

## OAuth 2.0 Flow Diagram

```
┌─────────────┐                                   ┌─────────────┐
│   Student   │                                   │  Third-Party│
│  (Resource  │                                   │     App     │
│   Owner)    │                                   │  (Client)   │
└──────┬──────┘                                   └──────┬──────┘
       │                                                 │
       │  1. Click "Sign in with SyncNexa"              │
       │◄───────────────────────────────────────────────┤
       │                                                 │
       │  2. Redirect to SyncNexa Authorization         │
       ├─────────────────────────────────────────────►  │
       │    GET /sauth/authorize                         │
       │    ?app_id={APP_ID}                            │
       │    &scopes=profile+student:profile             │
       │    &redirect_uri={CALLBACK_URL}                │
       │    &state={RANDOM_STATE}                       │
       │                                                 │
       ▼                                                 │
┌─────────────────────────────────────┐                │
│  SyncNexa Authorization Server      │                │
│  ┌───────────────────────────────┐  │                │
│  │ 3. Show Consent Page           │  │                │
│  │    - App details               │  │                │
│  │    - Requested permissions     │  │                │
│  │    - Approve/Deny buttons      │  │                │
│  └───────────────────────────────┘  │                │
└──────┬──────────────────────────────┘                │
       │                                                 │
       │  4. User approves/denies                        │
       │     POST /sauth/authorize                       │
       │     decision=approve                            │
       │                                                 │
       │  5. Generate authorization code                 │
       │     (10-minute TTL, single-use)                 │
       │                                                 │
       │  6. Redirect back to app with code              │
       ├─────────────────────────────────────────────►  │
       │    {CALLBACK_URL}?code={CODE}&state={STATE}     │
       │                                                 │
       │                                                 │
       │  7. App backend exchanges code for token   ┌────┴────┐
       │◄───────────────────────────────────────────┤  App    │
       │    POST /sauth/token                       │  Backend│
       │    {                                       └────┬────┘
       │      grant_type: "authorization_code",          │
       │      code: "{CODE}",                            │
       │      client_id: "{CLIENT_ID}",                  │
       │      client_secret: "{CLIENT_SECRET}",          │
       │      app_id: "{APP_ID}"                         │
       │    }                                            │
       │                                                 │
       │  8. Return access token (JWT, 7-day expiry)     │
       ├─────────────────────────────────────────────►  │
       │    {                                            │
       │      access_token: "jwt...",                    │
       │      token_type: "Bearer",                      │
       │      expires_in: 604800,                        │
       │      scope: "profile student:profile"           │
       │    }                                            │
       │                                                 │
       │  9. Use access token to fetch user data         │
       │◄───────────────────────────────────────────────┤
       │    GET /sauth/userinfo                          │
       │    Authorization: Bearer {ACCESS_TOKEN}         │
       │                                                 │
       │  10. Return scoped user data                    │
       ├─────────────────────────────────────────────►  │
       │    {                                            │
       │      sub: "user_id",                            │
       │      email: "student@example.com",              │
       │      name: "John Doe",                          │
       │      ...                                        │
       │    }                                            │
       │                                                 │
```

---

## Available Scopes

| Scope               | Description               | Data Access                                            |
| ------------------- | ------------------------- | ------------------------------------------------------ |
| `profile`           | Basic profile information | Name, email, phone                                     |
| `student:profile`   | Student-specific data     | Institution, matriculation number, verification status |
| `student:documents` | Document access           | Verified identity documents and verification status    |
| `student:academics` | Academic records          | Academic records, transcripts, GPA                     |
| `student:portfolio` | Portfolio data            | Projects, certificates, achievements                   |

---

## 1. Authorization Flow

### Step 1: Initiate Authorization

The third-party app redirects the student to the SyncNexa authorization endpoint.

**Redirect URL Construction:**

```javascript
const authUrl = new URL("https://identity.syncnexa.com/api/v1/sauth/authorize");
authUrl.searchParams.set("app_id", "app-550e8400-e29b-41d4-a716-446655440000");
authUrl.searchParams.set("scopes", "profile student:profile student:documents");
authUrl.searchParams.set("redirect_uri", "https://yourapp.com/auth/callback");
authUrl.searchParams.set("state", generateRandomState()); // CSRF protection

// Redirect user
window.location.href = authUrl.toString();
```

---

## 2. Get Consent Page

**Name:** Display Authorization Consent Page

**Description:** Shows a beautifully designed consent interface where students can review the application details, requested permissions, and choose to approve or deny access. The page includes app information, permission details, and clear explanations of what authorization means.

**Route:** `GET /sauth/authorize`

**Authentication Required:** Yes (Student must be logged in)

### Query Parameters

| Parameter    | Type   | Required    | Description                                                |
| ------------ | ------ | ----------- | ---------------------------------------------------------- |
| app_id       | string | Yes         | The registered application ID                              |
| scopes       | string | Yes         | Space-separated or plus-separated list of requested scopes |
| redirect_uri | string | Yes         | Callback URL (must match registered callback_url)          |
| state        | string | Recommended | CSRF protection token (returned unchanged)                 |

### Request Example

```
GET /api/v1/sauth/authorize?app_id=app-550e8400-e29b-41d4-a716-446655440000&scopes=profile+student:profile&redirect_uri=https://yourapp.com/auth/callback&state=abc123xyz789
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Success Response (200 OK)

Returns an HTML consent page with:

**Page Elements:**

- **App Information:**

  - App name, logo, and description
  - Owner/developer name
  - Links to privacy policy and terms

- **Permissions Breakdown:**

  - **Profile:** Name, email for identification
  - **Student Profile:** Verified student profile access
  - **Documents:** Verified documents when permitted
  - **Academic Records:** Academic history and transcripts
  - **Portfolio:** Projects and certificates

- **What the App Will Do:**

  - View your verified student profile
  - NOT update any data without your permission

- **By Authorizing:**

  - Sign in to this app using your student account
  - App can verify your academic identity instantly

- **By Denying:**

  - You will not be able to use this app with your student account

- **Action Buttons:**
  - **Cancel** - Deny authorization
  - **Authorize** - Grant access

### Consent Page Features

**Visual Design:**

- Modern, clean interface with Poppins font
- Two-column layout (app info | permissions)
- Responsive design for mobile devices
- Primary brand color: #04D69D
- Clear visual hierarchy with icons and spacing

**User Experience:**

- Clear permission explanations
- Transparent about data access
- Easy to understand consequences
- One-click approval or denial

### Error Responses

#### 400 Bad Request - Missing Parameters

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "app_id required"
}
```

**Other validation errors:**

- "scopes required"
- "redirect_uri required"

**What Happens:** The request is missing required parameters. No consent page is displayed. User should provide all required query parameters.

#### 401 Unauthorized - Not Logged In

```json
{
  "status": "error",
  "statusCode": 401,
  "message": "Login required to authorize apps"
}
```

**What Happens:** The user is not authenticated. They must log in first before accessing the consent page. Redirect to login page with return URL to authorization endpoint.

#### 404 Not Found - Invalid App

```json
{
  "status": "error",
  "statusCode": 404,
  "message": "App not found"
}
```

**What Happens:** The specified app_id doesn't exist in the system. No consent page is displayed.

---

## 3. Authorization Decision

**Name:** Process Authorization Decision

**Description:** Processes the user's decision to approve or deny the authorization request. If approved, generates a single-use authorization code valid for 10 minutes. If denied, redirects back to the app with an error.

**Route:** `POST /sauth/authorize`

**Authentication Required:** Yes

### Request Payload (Form Data)

```
decision=approve
app_id=app-550e8400-e29b-41d4-a716-446655440000
redirect_uri=https://yourapp.com/auth/callback
state=abc123xyz789
scopes=profile student:profile
```

### Field Requirements

| Field        | Type   | Required | Description            |
| ------------ | ------ | -------- | ---------------------- |
| decision     | string | Yes      | "approve" or "deny"    |
| app_id       | string | Yes      | The application ID     |
| redirect_uri | string | Yes      | Callback URL           |
| state        | string | No       | CSRF protection token  |
| scopes       | string | Yes      | Space-separated scopes |

### Success Response - Approved (302 Redirect)

```
HTTP/1.1 302 Found
Location: https://yourapp.com/auth/callback?code=a1b2c3d4e5f6g7h8i9j0&state=abc123xyz789
```

**Authorization Code Properties:**

- **Format:** Hexadecimal string (64 characters)
- **Validity:** 10 minutes
- **Usage:** Single-use only
- **Binding:** Tied to specific user, app, and scopes

### Success Response - Denied (302 Redirect)

```
HTTP/1.1 302 Found
Location: https://yourapp.com/auth/callback?error=access_denied&error_description=User+denied+authorization&state=abc123xyz789
```

**Error Codes:**

- `access_denied`: User clicked "Cancel" or denied authorization

**What Happens:** The authorization request is rejected. No authorization code or access token is generated. The user is redirected back to the app with an error parameter.

### Error Responses

#### 400 Bad Request - Missing Decision

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "decision required"
}
```

**What Happens:** The form submission is missing the decision field. No authorization code is generated.

#### 400 Bad Request - Invalid Redirect URI

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "redirect_uri mismatch"
}
```

**What Happens:** The redirect_uri doesn't match the registered callback URL for the application. This is a security measure to prevent authorization code theft. No code is generated.

#### 401 Unauthorized

```json
{
  "status": "error",
  "statusCode": 401,
  "message": "Login required"
}
```

**What Happens:** The user's session has expired or is invalid. They must re-authenticate.

---

## 4. Exchange Code for Token

**Name:** Exchange Authorization Code for Access Token

**Description:** Exchanges a single-use authorization code for a long-lived JWT access token. This endpoint is called by the app's backend server (never from client-side code) and requires client authentication via client_secret.

**Route:** `POST /sauth/token`

**Authentication Required:** No (uses client credentials)

### Request Payload

```json
{
  "grant_type": "authorization_code",
  "code": "a1b2c3d4e5f6g7h8i9j0",
  "client_id": "client-650e8400-e29b-41d4-a716-446655440001",
  "client_secret": "secret_abc123xyz789SECURE_RANDOM_STRING",
  "app_id": "app-550e8400-e29b-41d4-a716-446655440000"
}
```

### Field Requirements

| Field         | Type   | Required | Description                      |
| ------------- | ------ | -------- | -------------------------------- |
| grant_type    | string | Yes      | Must be "authorization_code"     |
| code          | string | Yes      | Authorization code from redirect |
| client_id     | string | Yes      | Application client ID            |
| client_secret | string | Yes      | Application client secret        |
| app_id        | string | Yes      | Application ID                   |

### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Token generated",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyM2U0NTY3LWU4OWItMTJkMy1hNDU2LTQyNjYxNDE3NDAwMCIsImFwcF9pZCI6ImFwcC01NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJzY29wZXMiOlsicHJvZmlsZSIsInN0dWRlbnQ6cHJvZmlsZSJdLCJpYXQiOjE2NDIwMDAwMDAsImV4cCI6MTY0MjYwNDgwMH0.signature",
    "token_type": "Bearer",
    "expires_in": 604800,
    "scope": "profile student:profile"
  }
}
```

### Token Details

**Access Token (JWT):**

- **Format:** JSON Web Token
- **Expiration:** 7 days (604800 seconds)
- **Algorithm:** HS256 (HMAC SHA256)
- **Payload Contains:**
  - `sub`: User ID
  - `app_id`: Application ID
  - `scopes`: Array of granted scopes
  - `iat`: Issued at timestamp
  - `exp`: Expiration timestamp

### Error Responses

#### 400 Bad Request - Invalid Grant Type

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Invalid grant_type"
}
```

**What Happens:** The grant_type is not "authorization_code". No token is generated.

#### 400 Bad Request - Invalid Code

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Invalid or expired authorization code"
}
```

**What Happens:** The authorization code is:

- Invalid (doesn't exist)
- Already used (codes are single-use)
- Expired (10-minute TTL exceeded)

No token is generated. The app must restart the authorization flow.

#### 401 Unauthorized - Invalid Client Credentials

```json
{
  "status": "error",
  "statusCode": 401,
  "message": "Invalid client credentials"
}
```

**What Happens:** The client_id or client_secret is incorrect. This prevents unauthorized applications from obtaining tokens. No token is generated. Verify your client credentials are correct and haven't been rotated.

#### 400 Bad Request - App Not Found

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "App not found"
}
```

**What Happens:** The app_id doesn't exist or has been deleted. No token is generated.

### Security Notes

**⚠️ CRITICAL:**

- **Never** expose client_secret in client-side code
- **Always** perform token exchange from a secure backend server
- **Store** access tokens securely (encrypted database or secure session)
- **Validate** the state parameter to prevent CSRF attacks
- **Use HTTPS** for all OAuth communications

---

## 5. Get User Info

**Name:** Get User Information

**Description:** Retrieves user information scoped to the permissions granted during authorization. The response is filtered based on the scopes in the access token.

**Route:** `GET /sauth/userinfo`

**Authentication Required:** Yes (Bearer token from token exchange)

### Request Headers

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Success Response (200 OK) - Basic Profile

**With scope: `profile`**

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "User info retrieved",
  "data": {
    "sub": "user-123e4567-e89b-12d3-a456-426614174000",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "given_name": "John",
    "family_name": "Doe",
    "phone": "+2348012345678"
  }
}
```

### Success Response - With Student Profile

**With scopes: `profile student:profile`**

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "User info retrieved",
  "data": {
    "sub": "user-123e4567-e89b-12d3-a456-426614174000",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "given_name": "John",
    "family_name": "Doe",
    "phone": "+2348012345678",
    "institution": "University of Lagos",
    "matric_number": "UL/18/CS/1234",
    "has_verified_documents": true,
    "is_verified": true,
    "student_status": "active"
  }
}
```

### Success Response - With Documents

**With scopes: `profile student:profile student:documents`**

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "User info retrieved",
  "data": {
    "sub": "user-123e4567-e89b-12d3-a456-426614174000",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "given_name": "John",
    "family_name": "Doe",
    "phone": "+2348012345678",
    "institution": "University of Lagos",
    "matric_number": "UL/18/CS/1234",
    "has_verified_documents": true,
    "is_verified": true,
    "verified_documents": [
      {
        "doc_type": "national_id",
        "is_verified": true,
        "verified_at": "2026-01-10T14:30:00.000Z"
      },
      {
        "doc_type": "student_id",
        "is_verified": true,
        "verified_at": "2026-01-09T10:15:00.000Z"
      }
    ]
  }
}
```

### Success Response - With Academic Records

**With scopes: `profile student:profile student:academics`**

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "User info retrieved",
  "data": {
    "sub": "user-123e4567-e89b-12d3-a456-426614174000",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "institution": "University of Lagos",
    "academic_records": [
      {
        "institution": "University of Lagos",
        "degree": "Bachelor of Science",
        "field_of_study": "Computer Science",
        "start_date": "2018-09-01",
        "end_date": "2022-07-15",
        "gpa": "3.92",
        "gpa_scale": "4.0"
      }
    ]
  }
}
```

### Success Response - With Portfolio

**With scopes: `profile student:portfolio`**

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "User info retrieved",
  "data": {
    "sub": "user-123e4567-e89b-12d3-a456-426614174000",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "projects": [
      {
        "title": "E-commerce Platform with AI Recommendations",
        "description": "Built a full-stack e-commerce platform...",
        "technologies": ["React", "Node.js", "Python", "TensorFlow"],
        "project_url": "https://github.com/johndoe/ecommerce-ai"
      }
    ],
    "certificates": [
      {
        "issuer": "Google Cloud",
        "title": "Google Cloud Professional Cloud Architect",
        "issue_date": "2023-06-15",
        "credential_id": "GC-PCA-2023-123456"
      }
    ]
  }
}
```

### Error Responses

#### 401 Unauthorized - Invalid Token

```json
{
  "status": "error",
  "statusCode": 401,
  "message": "Invalid or expired token"
}
```

**What Happens:** The access token is:

- Missing from Authorization header
- Invalid (malformed JWT)
- Expired (7-day TTL exceeded)
- Revoked by user

No user data is returned. App should refresh the token or re-initiate authorization flow.

#### 403 Forbidden - Insufficient Scope

```json
{
  "status": "error",
  "statusCode": 403,
  "message": "Insufficient scope for requested data"
}
```

**What Happens:** The access token doesn't have the required scope for the data being requested. For example, trying to access academic records without the `student:academics` scope. No unauthorized data is returned.

---

## 6. Revoke Access

**Name:** Revoke Application Access

**Description:** Allows students to revoke an application's access to their data. This invalidates all access tokens issued to the application for this user and removes the authorization grant.

**Route:** `POST /sauth/revoke`

**Authentication Required:** Yes (Student Bearer token)

### Request Payload

```json
{
  "app_id": "app-550e8400-e29b-41d4-a716-446655440000"
}
```

### Field Requirements

| Field  | Type   | Required | Description                             |
| ------ | ------ | -------- | --------------------------------------- |
| app_id | string | Yes      | The application ID to revoke access for |

### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "App access revoked",
  "data": null
}
```

**What Happens:**

- The app_grant record is marked as revoked
- All active access tokens for this app and user are invalidated
- Future API requests with these tokens will fail with 401 Unauthorized
- The application must request authorization again to regain access

### Error Responses

#### 400 Bad Request - Missing App ID

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "app_id required"
}
```

#### 401 Unauthorized

```json
{
  "status": "error",
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**What Happens:** The student is not authenticated. They must log in first.

#### 404 Not Found - No Active Grant

```json
{
  "status": "error",
  "statusCode": 404,
  "message": "No active authorization found for this app"
}
```

**What Happens:** The student never authorized this app, or the authorization was already revoked. No action is taken.

---

## Security Features

### 1. Authorization Codes

**Properties:**

- **Single-use:** Code is marked as used after token exchange
- **Short-lived:** 10-minute TTL
- **Binding:** Tied to specific user, app, redirect_uri, and scopes
- **Secure generation:** Cryptographically random hexadecimal string

**Attack Prevention:**

- **Authorization Code Injection:** State parameter validation
- **Code Reuse:** Single-use enforcement
- **Code Theft:** Short expiration window

### 2. Access Tokens (JWT)

**Properties:**

- **Signed:** HMAC SHA256 signature verification
- **Stateless:** Contains user ID, app ID, and scopes
- **Long-lived:** 7-day expiration for better UX
- **Revocable:** Can be invalidated by revoking grants

**Attack Prevention:**

- **Token Forgery:** Signature verification
- **Token Theft:** HTTPS only, secure storage
- **Scope Escalation:** Scope validation on every request

### 3. Client Authentication

**Properties:**

- **Client Secret:** BCrypt hashed in database
- **Server-side Only:** Never exposed to client-side code
- **Rotatable:** Can be changed via rotate secret endpoint

**Attack Prevention:**

- **Unauthorized Token Generation:** Client secret validation
- **Impersonation:** Client ID + Secret verification

### 4. Scope-Based Access Control

**Properties:**

- **Granular Permissions:** Different scopes for different data
- **Explicit Consent:** User sees exactly what data is requested
- **Runtime Enforcement:** Scope check on every API call

**Attack Prevention:**

- **Over-Privileged Access:** Minimum necessary scopes
- **Data Leakage:** Filtered responses based on scopes

### 5. CSRF Protection

**Properties:**

- **State Parameter:** Random token generated by client
- **Roundtrip Validation:** Returned unchanged in redirect
- **Client-side Check:** App verifies state matches

**Attack Prevention:**

- **Cross-Site Request Forgery:** State parameter validation
- **Session Hijacking:** Unique per-authorization state

---

## Integration Guide

### Full Integration Example

#### 1. Frontend: Initiate Authorization

```javascript
// Generate and store random state for CSRF protection
const state = generateRandomState();
localStorage.setItem("oauth_state", state);

// Build authorization URL
const authUrl = new URL("https://identity.syncnexa.com/api/v1/sauth/authorize");
authUrl.searchParams.set("app_id", "app-550e8400-e29b-41d4-a716-446655440000");
authUrl.searchParams.set("scopes", "profile student:profile student:documents");
authUrl.searchParams.set("redirect_uri", "https://yourapp.com/auth/callback");
authUrl.searchParams.set("state", state);

// Redirect user to consent page
window.location.href = authUrl.toString();
```

#### 2. Frontend: Handle Callback

```javascript
// Parse callback parameters
const params = new URLSearchParams(window.location.search);
const code = params.get("code");
const state = params.get("state");
const error = params.get("error");

// Check for authorization denial
if (error) {
  console.error("Authorization denied:", params.get("error_description"));
  // Handle denial (show message, redirect, etc.)
  return;
}

// Verify state to prevent CSRF
const storedState = localStorage.getItem("oauth_state");
if (state !== storedState) {
  console.error("State mismatch - possible CSRF attack");
  return;
}

// Clear stored state
localStorage.removeItem("oauth_state");

// Send code to backend for token exchange
const response = await fetch("/api/auth/callback", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ code }),
});

const { success, user } = await response.json();
if (success) {
  // User is now authenticated
  console.log("Logged in as:", user.name);
}
```

#### 3. Backend: Exchange Code for Token

```javascript
// Node.js/Express example
app.post("/api/auth/callback", async (req, res) => {
  const { code } = req.body;

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch(
      "https://identity.syncnexa.com/api/v1/sauth/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grant_type: "authorization_code",
          code,
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.CLIENT_SECRET,
          app_id: process.env.APP_ID,
        }),
      }
    );

    if (!tokenResponse.ok) {
      return res.status(400).json({ error: "Token exchange failed" });
    }

    const { data } = await tokenResponse.json();
    const { access_token } = data;

    // Fetch user info
    const userResponse = await fetch(
      "https://identity.syncnexa.com/api/v1/sauth/userinfo",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    const { data: user } = await userResponse.json();

    // Store access token securely (e.g., encrypted in session or database)
    req.session.access_token = access_token;
    req.session.user = user;

    res.json({ success: true, user });
  } catch (error) {
    console.error("OAuth error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
});
```

#### 4. Backend: Make API Requests

```javascript
// Use stored access token for subsequent API requests
app.get("/api/user/profile", async (req, res) => {
  const accessToken = req.session.access_token;

  if (!accessToken) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const response = await fetch(
      "https://identity.syncnexa.com/api/v1/sauth/userinfo",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) {
      // Token expired or revoked
      req.session.destroy();
      return res.status(401).json({ error: "Session expired" });
    }

    const { data: user } = await response.json();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});
```

### Helper Functions

```javascript
// Generate cryptographically secure random state
function generateRandomState() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

// Base64 URL encode (for PKCE if implementing)
function base64URLEncode(str) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(str)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

// SHA256 hash (for PKCE if implementing)
async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return await crypto.subtle.digest("SHA-256", data);
}
```

---

## Best Practices

### For Application Developers

1. **Security:**

   - Always use HTTPS for all OAuth endpoints
   - Store client_secret in environment variables, never in code
   - Implement state parameter validation
   - Use secure session storage for access tokens
   - Never expose access tokens in URLs or logs

2. **Token Management:**

   - Store tokens encrypted at rest
   - Implement token expiration handling
   - Refresh tokens when needed (when refresh token support is added)
   - Clear tokens on logout

3. **Scope Management:**

   - Request minimum necessary scopes
   - Clearly explain to users why each scope is needed
   - Handle insufficient scope errors gracefully

4. **Error Handling:**

   - Gracefully handle authorization denial
   - Implement retry logic for network errors
   - Provide clear error messages to users
   - Log errors for debugging (without exposing sensitive data)

5. **User Experience:**
   - Explain OAuth process to users
   - Remember user choice (logged in state)
   - Provide easy logout functionality
   - Allow users to revoke access in settings

### For Students

1. **Review Permissions:** Carefully review what data each app requests
2. **Trust Verification:** Only authorize trusted applications
3. **Revoke Access:** Regularly review and revoke unused authorizations
4. **Report Issues:** Report suspicious applications to administrators

---

## Troubleshooting

### Common Issues

**1. "Invalid or expired authorization code"**

- **Cause:** Code expired (>10 minutes) or already used
- **Solution:** Restart authorization flow from beginning

**2. "redirect_uri mismatch"**

- **Cause:** Callback URL doesn't match registered URL exactly
- **Solution:** Verify callback URL matches registration (including trailing slashes, protocol)

**3. "Invalid client credentials"**

- **Cause:** Wrong client_id or client_secret
- **Solution:** Verify credentials, check if secret was rotated

**4. "State mismatch"**

- **Cause:** State parameter doesn't match stored value
- **Solution:** Ensure state is stored before redirect and validated after

**5. "Insufficient scope"**

- **Cause:** Requesting data not covered by granted scopes
- **Solution:** Request appropriate scopes during authorization

---

## Future Enhancements

1. **Refresh Tokens:** Enable token refresh without re-authorization
2. **PKCE Flow:** Enhanced security for mobile and SPA applications
3. **OpenID Connect:** Standard identity layer on top of OAuth 2.0
4. **Token Introspection:** Endpoint to validate token status
5. **Dynamic Client Registration:** Programmatic app registration
6. **Consent Memory:** Remember user's previous consent choices

---

## Related Documentation

- [App Management Flow](./app-management.md)
- [Authentication Flow](./authentication.md)
- [User Management Flow](./user-management.md)
- [Scopes and Permissions](../auth/scopes.md)
- [Security Best Practices](../security/best-practices.md)
