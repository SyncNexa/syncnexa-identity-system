# Quick Start (SAuth 1.0)

Get up and running with SyncNexa SAuth 1.0 in 5 minutes.

## Overview of the SAuth Flow

1. User clicks "Sign in with SyncNexa"
2. Your app redirects to the SAuth authorization endpoint
3. User sees the SAuth consent screen
4. SyncNexa redirects back to your app with a code
5. Your backend exchanges the code for an access token
6. You can now fetch user data using the access token

## Basic Implementation

### Step 1: Redirect to Authorization

Create a "Login with SyncNexa" button that redirects to:

```javascript
const params = new URLSearchParams({
  app_id: process.env.SAUTH_APP_ID,
  client_id: process.env.SAUTH_CLIENT_ID,
  redirect_uri: process.env.SAUTH_REDIRECT_URI,
  scopes: "profile student:profile",
  state: generateRandomState(), // CSRF protection
});

window.location.href = `http://localhost:3000/api/v1/sauth/authorize?${params}`;
```

### Step 2: Handle the Callback

Your redirect URI will receive `code` and `state`:

```javascript
// GET /auth/callback?code=...&state=...
const { code, state } = req.query;

// Verify state matches what you sent
if (state !== savedState) throw new Error("State mismatch");

// Exchange code for token (backend)
const response = await fetch("http://localhost:3000/api/v1/sauth/token", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    grant_type: "authorization_code",
    code,
    client_id: process.env.SAUTH_CLIENT_ID,
    client_secret: process.env.SAUTH_CLIENT_SECRET,
    app_id: process.env.SAUTH_APP_ID,
  }),
});

const { access_token } = await response.json();
```

### Step 3: Fetch User Data

Use the access token to call protected endpoints:

```javascript
const user = await fetch("http://localhost:3000/api/v1/user/profile", {
  headers: { Authorization: `Bearer ${access_token}` },
});

const userData = await user.json();
console.log(userData);
```

## Next Steps

→ [OAuth Flow](../auth/oauth-flow) — Deep dive into the authorization process  
→ [API Reference](../api/authorize) — Explore all endpoints  
→ [Examples](../examples/nodejs) — Language-specific implementations
