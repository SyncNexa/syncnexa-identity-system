# Examples — Node.js (SAuth 1.0)

Complete example of integrating SAuth 1.0 in a Node.js + Express application.

## Setup

```bash
npm install express axios dotenv
```

## Environment Variables

```env
SAUTH_APP_ID=your_app_id
SAUTH_CLIENT_ID=your_client_id
SAUTH_CLIENT_SECRET=your_client_secret
SAUTH_REDIRECT_URI=http://localhost:3000/auth/callback
SAUTH_BASE_URL=http://localhost:3000/api/v1
SESSION_SECRET=random_secret_key
```

## Implementation

```javascript
import express from "express";
import axios from "axios";
import session from "express-session";
import crypto from "crypto";

const app = express();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

// Helper to generate random state
function generateState() {
  return crypto.randomBytes(16).toString("hex");
}

// Login route - redirect to SyncNexa SAuth
app.get("/login", (req, res) => {
  const state = generateState();
  req.session.sauthState = state;

  const params = new URLSearchParams({
    app_id: process.env.SAUTH_APP_ID,
    client_id: process.env.SAUTH_CLIENT_ID,
    redirect_uri: process.env.SAUTH_REDIRECT_URI,
    scopes: "profile student:profile",
    state,
  });

  res.redirect(`${process.env.SAUTH_BASE_URL}/sauth/authorize?${params}`);
});

// Callback route - exchange SAuth code for token
app.get("/auth/callback", async (req, res) => {
  const { code, state, error } = req.query;

  // Check for errors
  if (error) {
    return res.send(`Authorization denied: ${error}`);
  }

  // Verify state
  if (state !== req.session.sauthState) {
    return res.status(400).send("State mismatch");
  }

  try {
    // Exchange code for token
    const tokenResponse = await axios.post(
      `${process.env.SAUTH_BASE_URL}/sauth/token`,
      {
        grant_type: "authorization_code",
        code,
        client_id: process.env.SAUTH_CLIENT_ID,
        client_secret: process.env.SAUTH_CLIENT_SECRET,
        app_id: process.env.SAUTH_APP_ID,
      }
    );

    const { access_token, expires_in } = tokenResponse.data;

    // Store in session
    req.session.accessToken = access_token;
    req.session.tokenExpiry = Date.now() + expires_in * 1000;

    // Redirect to dashboard
    res.redirect("/dashboard");
  } catch (error) {
    console.error("Token exchange failed:", error.message);
    res.status(500).send("Authentication failed");
  }
});

// Protected route - fetch user profile
app.get("/dashboard", async (req, res) => {
  if (!req.session.accessToken) {
    return res.redirect("/login");
  }

  try {
    const userResponse = await axios.get(
      `${process.env.SAUTH_BASE_URL}/user/profile`,
      {
        headers: {
          Authorization: `Bearer ${req.session.accessToken}`,
        },
      }
    );

    const user = userResponse.data;
    res.send(`Welcome, ${user.displayName}!`);
  } catch (error) {
    console.error("Profile fetch failed:", error.message);
    res.redirect("/login");
  }
});

// Logout route
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.listen(3000);
```

## Testing

1. Start your server: `node app.js`
2. Visit `http://localhost:3000/login`
3. You'll be redirected to SyncNexa authorization
4. Approve access
5. You'll be redirected to `/dashboard` with your profile

## Next Steps

→ [React Example](./react) — Frontend implementation  
→ [Quick Start](../getting-started/quick-start) — Overview
