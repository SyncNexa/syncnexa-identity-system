# Examples — React (SAuth 1.0)

Complete example of integrating SAuth 1.0 in a React application.

## Setup

```bash
npx create-react-app my-app
cd my-app
npm install axios
```

## Environment Variables

```env
REACT_APP_SAUTH_APP_ID=your_app_id
REACT_APP_SAUTH_CLIENT_ID=your_client_id
REACT_APP_SAUTH_REDIRECT_URI=http://localhost:3000/auth/callback
REACT_APP_SAUTH_BASE_URL=http://localhost:3000/api/v1
```

## Implementation

### Login Component

```javascript
import { generateRandomState } from "./utils/crypto";

export function LoginButton() {
  const handleLogin = () => {
    const state = generateRandomState();
    localStorage.setItem("sauthState", state);

    const params = new URLSearchParams({
      app_id: process.env.REACT_APP_SAUTH_APP_ID,
      client_id: process.env.REACT_APP_SAUTH_CLIENT_ID,
      redirect_uri: process.env.REACT_APP_SAUTH_REDIRECT_URI,
      scopes: "profile student:profile",
      state,
    });

    window.location.href = `${process.env.REACT_APP_SAUTH_BASE_URL}/sauth/authorize?${params}`;
  };

  return <button onClick={handleLogin}>Login with SyncNexa</button>;
}
```

### Callback Component

```javascript
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

export function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      setError(`Authorization denied: ${error}`);
      return;
    }

    // Verify state
    const savedState = localStorage.getItem("sauthState");
    if (state !== savedState) {
      setError("State mismatch");
      return;
    }

    // Exchange code for token (call your backend)
    exchangeCode(code);
  }, [searchParams, navigate]);

  const exchangeCode = async (code) => {
    try {
      const response = await fetch("/api/auth/exchange-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const { accessToken } = await response.json();
      localStorage.setItem("accessToken", accessToken);
      navigate("/dashboard");
    } catch (err) {
      setError("Token exchange failed");
    }
  };

  if (error) return <div>{error}</div>;
  return <div>Authenticating...</div>;
}
```

### Dashboard Component

```javascript
import { useEffect, useState } from "react";
import axios from "axios";

export function Dashboard() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    axios
      .get(`${process.env.REACT_APP_SAUTH_BASE_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <h1>Welcome, {user.displayName}!</h1>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
    </div>
  );
}
```

### Crypto Utilities

```javascript
// utils/crypto.js
export function generateRandomState() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}
```

## Testing

1. Start your React app: `npm start`
2. Click "Login with SyncNexa"
3. Approve authorization
4. You'll be redirected to dashboard with your profile

## Next Steps

→ [Python Example](./python) — Backend implementation  
→ [Quick Start](../getting-started/quick-start) — Overview

## Email Verification (React)

Add a simple widget to request, verify, check status, and resend OTP.

```jsx
import { useState } from "react";

export function EmailVerificationWidget() {
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState(null);
  const token = localStorage.getItem("accessToken");

  async function requestOtp() {
    const res = await fetch(
      `${process.env.REACT_APP_SAUTH_BASE_URL}/auth/verify-email/request`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    setStatus(await res.json());
  }

  async function verifyOtp() {
    const res = await fetch(
      `${process.env.REACT_APP_SAUTH_BASE_URL}/auth/verify-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ otp }),
      },
    );
    setStatus(await res.json());
  }

  async function checkStatus() {
    const res = await fetch(
      `${process.env.REACT_APP_SAUTH_BASE_URL}/auth/verify-email/status`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    setStatus(await res.json());
  }

  async function resendOtp() {
    const res = await fetch(
      `${process.env.REACT_APP_SAUTH_BASE_URL}/auth/verify-email/resend`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    setStatus(await res.json());
  }

  return (
    <div>
      <h3>Email Verification</h3>
      <button onClick={requestOtp}>Request OTP</button>
      <input
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="Enter 6-digit OTP"
      />
      <button onClick={verifyOtp}>Verify</button>
      <button onClick={checkStatus}>Check Status</button>
      <button onClick={resendOtp}>Resend OTP</button>
      <pre>{status && JSON.stringify(status, null, 2)}</pre>
    </div>
  );
}
```

## Discover Universities & Faculties (React)

```jsx
export async function listUniversitiesNG() {
  const res = await fetch(
    `${process.env.REACT_APP_SAUTH_BASE_URL}/universities?countryCode=NG`,
  );
  return res.json();
}

export async function getFutoFaculties() {
  const res = await fetch(
    `${process.env.REACT_APP_SAUTH_BASE_URL}/institutions/FUTO_NG/faculties`,
  );
  return res.json();
}
```
