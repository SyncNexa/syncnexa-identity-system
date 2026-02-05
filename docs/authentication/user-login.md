# User Login

Complete documentation for authenticating users and obtaining access credentials.

---

## Overview

The login endpoint authenticates users with email and password, returning JWT access tokens and refresh tokens. These credentials enable subsequent API requests and session management. SyncNexa uses a token-based authentication system with automatic expiration and renewal capabilities.

**Use Cases:**

- User login with email/password
- Mobile app authentication
- Web browser session establishment
- API access token generation
- Multi-device session management

**Authentication:** Not required - this endpoint is public

---

## Authenticate User

**Name:** User Login

**Description:** Authenticates a user with email and password credentials. Upon successful authentication, the system generates an access token (JWT with 15-minute expiration) and a refresh token (valid for 7 days). The access token is used for all subsequent API requests, while the refresh token enables token renewal without re-authentication.

**Route:** `POST /auth/login`

**Authentication Required:** No

### Request Payload

```json
{
  "email": "john.doe@example.com",
  "password": "SecureP@ss123"
}
```

### Field Requirements

| Field    | Type   | Required | Description                                      |
| -------- | ------ | -------- | ------------------------------------------------ |
| email    | string | Yes      | User's registered email address                  |
| password | string | Yes      | User's password (plain text, hashed server-side) |

### Request Example (JavaScript)

```javascript
async function loginUser(email, password) {
  try {
    const response = await fetch(
      "https://identity.syncnexa.com/api/v1/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      },
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("Login failed:", result.message);
      return null;
    }

    // Store tokens securely
    const { accessToken, refreshToken, sessionId, role } = result.data;

    // For web apps: store in httpOnly cookies
    // For mobile: use secure storage
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("sessionId", sessionId);
    localStorage.setItem("userRole", role);

    console.log("Login successful!");
    return result.data;
  } catch (error) {
    console.error("Network error:", error);
    return null;
  }
}

// Usage
const loginResult = await loginUser("john.doe@example.com", "SecureP@ss123");

if (loginResult) {
  console.log("Access token:", loginResult.accessToken);
  console.log("User role:", loginResult.role);
}
```

### Request Example (cURL)

```bash
curl -X POST https://identity.syncnexa.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecureP@ss123"
  }'
```

### Request Example (Python)

```python
import requests
import json
from datetime import datetime

class AuthenticationService:
    def __init__(self, base_url='https://identity.syncnexa.com/api/v1'):
        self.base_url = base_url
        self.headers = {'Content-Type': 'application/json'}
        self.tokens = {}

    def login(self, email, password):
        """Authenticate user and obtain tokens"""
        payload = {
            'email': email,
            'password': password
        }

        response = requests.post(
            f'{self.base_url}/auth/login',
            headers=self.headers,
            json=payload
        )

        if response.status_code != 200:
            print(f"Login failed: {response.json().get('message')}")
            return None

        data = response.json()['data']

        # Store tokens with metadata
        self.tokens = {
            'access_token': data['accessToken'],
            'refresh_token': data['refreshToken'],
            'session_id': data['sessionId'],
            'role': data['role'],
            'login_time': datetime.now(),
            'expires_in': 900  # 15 minutes
        }

        print(f"Login successful! Role: {data['role']}")
        return self.tokens

    def get_auth_header(self):
        """Get Authorization header with current access token"""
        if not self.tokens.get('access_token'):
            raise Exception("Not authenticated. Call login() first.")

        return {
            'Authorization': f"Bearer {self.tokens['access_token']}"
        }

    def is_token_expired(self):
        """Check if access token is close to expiration"""
        if not self.tokens.get('login_time'):
            return True

        elapsed = (datetime.now() - self.tokens['login_time']).total_seconds()
        return elapsed > self.tokens['expires_in'] - 60  # Refresh at 14 minutes

# Usage
auth = AuthenticationService()

# Login
tokens = auth.login('john.doe@example.com', 'SecureP@ss123')

if tokens:
    # Use tokens for subsequent requests
    headers = auth.get_auth_header()
    response = requests.get(
        'https://identity.syncnexa.com/api/v1/user/profile',
        headers=headers
    )

    print(response.json())
```

### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Login successful!",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwMCIsImVtYWlsIjoiam9obi5kb2VAZXhhbXBsZS5jb20iLCJyb2xlIjoidmlzaXRvciIsImlhdCI6MTY0MjAwMDAwMCwiZXhwIjoxNjQyMDA5MDAwfQ.signature_here",
    "refreshToken": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
    "role": "student",
    "sessionId": "session-550e8400-e29b-41d4-a716-446655440000"
  }
}
```

### Token Details

#### Access Token (JWT)

**Structure:** `header.payload.signature`

**Expiration:** 15 minutes (900 seconds)

**Payload Contains:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.doe@example.com",
  "role": "student",
  "iat": 1642000000,
  "exp": 1642009000
}
```

**Usage:** Include in Authorization header for all authenticated requests:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Renewal:** When expired, use the refresh token to obtain a new access token without re-authenticating.

#### Refresh Token

**Type:** UUID (Unique Identifier)

**Expiration:** 7 days (604,800 seconds)

**Usage:** Stored in database; used with `/auth/refresh-token` endpoint to obtain new access tokens

**Storage:**

- Web: httpOnly, secure, sameSite cookie
- Mobile: Secure device storage (Keychain/Keystore)
- Desktop: Encrypted local storage

#### Session ID

**Format:** `session-<uuid>`

**Expiration:** 7 days (same as refresh token)

**Usage:** Tracks user session across devices; used for logout and session management

**Metadata Tracked:**

- Device information
- IP address
- Browser/app version
- Last activity time

---

## Error Responses

### 400 Bad Request - Missing Credentials

```json
{
  "message": "Email and password required"
}
```

**What Happens:** The request doesn't include email or password fields. The request is rejected immediately without database queries. User must provide both credentials.

### 401 Unauthorized - Invalid Credentials

```json
{
  "message": "Invalid credentials"
}
```

**What Happens:** One of the following occurred:

- Email doesn't exist in the system
- Password doesn't match the stored hash
- Account has been deleted

This response is intentionally vague to prevent user enumeration attacks (attackers discovering which emails are registered). No tokens are generated. User should verify their email and password.

**Important:** The system uses bcrypt hashing with salt, making brute force attacks computationally expensive.

### 401 Unauthorized - Account Disabled

```json
{
  "status": "error",
  "statusCode": 401,
  "message": "Account is disabled or suspended"
}
```

**What Happens:** The account exists and credentials are correct, but the account status is not "active" (could be suspended, deleted, or pending). No tokens are generated. User should contact support.

### 500 Internal Server Error

```json
{
  "status": "error",
  "statusCode": 500,
  "message": "Login failed"
}
```

**What Happens:** An unexpected server error occurred during authentication (database connection issue, token generation failure, etc.). No tokens are generated. User should retry after a brief delay or contact support if the issue persists.

---

## Edge Cases

| Scenario                        | Behavior                                                                 |
| ------------------------------- | ------------------------------------------------------------------------ |
| **Email case variations**       | Standardized to lowercase (john.doe@example.com == JOHN.DOE@EXAMPLE.COM) |
| **Multiple failed attempts**    | Rate limited after 5 attempts per 15 minutes per IP                      |
| **Concurrent logins**           | Multiple sessions allowed; each creates new sessionId                    |
| **Very old refresh token**      | Accepted if not explicitly revoked and within 7 days                     |
| **Modified JWT in header**      | Rejected: signature verification fails                                   |
| **Missing password field**      | Returns 400 Bad Request                                                  |
| **SQL injection in email**      | Escaped and sanitized by ORM                                             |
| **Very long password**          | Processed normally (bcrypt handles variable lengths)                     |
| **Special characters in email** | Valid per RFC 5322; properly escaped                                     |

---

## Examples

### Complete Login Flow

```javascript
// 1. Create login form
const loginForm = `
  <form id="login-form">
    <input type="email" id="email" placeholder="Email" required />
    <input type="password" id="password" placeholder="Password" required />
    <button type="submit">Login</button>
    <a href="/forgot-password">Forgot Password?</a>
  </form>
`;

// 2. Handle form submission
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch(
      "https://identity.syncnexa.com/api/v1/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      },
    );

    const result = await response.json();

    if (result.status === "success") {
      // Store tokens
      const { accessToken, refreshToken, sessionId, role } = result.data;

      // Option 1: localStorage (less secure)
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      // Option 2: sessionStorage (cleared on tab close)
      sessionStorage.setItem("sessionId", sessionId);

      // Redirect to dashboard
      window.location.href = `/dashboard/${role}`;
    } else {
      alert("Login failed: " + result.message);
    }
  } catch (error) {
    alert("Network error: " + error.message);
  }
});

// 3. Automatically add token to subsequent requests
fetch.interceptor = function (url, options = {}) {
  const token = localStorage.getItem("accessToken");

  if (token) {
    options.headers = options.headers || {};
    options.headers["Authorization"] = `Bearer ${token}`;
  }

  return fetch(url, options);
};
```

### Python Login with Auto-Refresh

```python
import requests
from datetime import datetime, timedelta
import time

class SessionManager:
    def __init__(self, base_url='https://identity.syncnexa.com/api/v1'):
        self.base_url = base_url
        self.access_token = None
        self.refresh_token = None
        self.token_expiry = None

    def login(self, email, password):
        """Login and obtain tokens"""
        response = requests.post(
            f'{self.base_url}/auth/login',
            json={'email': email, 'password': password}
        )

        if response.status_code != 200:
            print(f"Login failed: {response.json()}")
            return False

        data = response.json()['data']
        self.access_token = data['accessToken']
        self.refresh_token = data['refreshToken']
        self.token_expiry = datetime.now() + timedelta(minutes=15)

        print(f"Login successful! Role: {data['role']}")
        return True

    def refresh_if_needed(self):
        """Refresh token if close to expiration"""
        if not self.token_expiry:
            return False

        # Refresh at 14 minutes to avoid expiration
        if datetime.now() > (self.token_expiry - timedelta(minutes=1)):
            print("Token expiring soon, refreshing...")

            response = requests.post(
                f'{self.base_url}/auth/refresh-token',
                json={'refreshToken': self.refresh_token}
            )

            if response.status_code == 200:
                self.access_token = response.json()['data']['accessToken']
                self.token_expiry = datetime.now() + timedelta(minutes=15)
                print("Token refreshed successfully")
                return True
            else:
                print("Token refresh failed, re-login required")
                return False

        return True

    def get_headers(self):
        """Get authorization headers"""
        self.refresh_if_needed()
        return {'Authorization': f'Bearer {self.access_token}'}

    def make_request(self, method, endpoint, data=None):
        """Make authenticated request"""
        url = f'{self.base_url}{endpoint}'
        headers = self.get_headers()

        if method == 'GET':
            return requests.get(url, headers=headers)
        elif method == 'POST':
            return requests.post(url, json=data, headers=headers)
        elif method == 'PATCH':
            return requests.patch(url, json=data, headers=headers)
        elif method == 'DELETE':
            return requests.delete(url, headers=headers)

# Usage
session = SessionManager()

# Login
if session.login('john.doe@example.com', 'SecureP@ss123'):
    # Make authenticated requests (tokens auto-refresh)
    response = session.make_request('GET', '/user/profile')
    print(response.json())

    # Token is automatically refreshed if needed
    time.sleep(900)  # Wait 15 minutes
    response = session.make_request('GET', '/user/documents')
    print(response.json())
```

### Login with Remember Me

```javascript
class LoginManager {
  static async login(email, password, rememberMe = false) {
    const response = await fetch(
      "https://identity.syncnexa.com/api/v1/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      },
    );

    if (!response.ok) {
      throw new Error("Login failed");
    }

    const result = await response.json();
    const { accessToken, refreshToken, sessionId } = result.data;

    // Store based on preference
    if (rememberMe) {
      // 30-day expiration
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("sessionId", sessionId);
      localStorage.setItem("email", email);
      localStorage.setItem(
        "loginExpiry",
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      );
    } else {
      // Session only (cleared on tab close)
      sessionStorage.setItem("accessToken", accessToken);
      sessionStorage.setItem("refreshToken", refreshToken);
    }

    return result.data;
  }

  static async restoreSession() {
    // Check for remembered login
    const loginExpiry = localStorage.getItem("loginExpiry");

    if (loginExpiry && new Date(loginExpiry) > new Date()) {
      const refreshToken = localStorage.getItem("refreshToken");

      // Refresh access token
      const response = await fetch(
        "https://identity.syncnexa.com/api/v1/auth/refresh-token",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        },
      );

      if (response.ok) {
        const result = await response.json();
        sessionStorage.setItem("accessToken", result.data.accessToken);
        return true;
      }
    }

    return false;
  }

  static logout(rememberMe = false) {
    if (rememberMe) {
      localStorage.clear();
    }
    sessionStorage.clear();
  }
}

// Usage
await LoginManager.login("john.doe@example.com", "SecureP@ss123", true);
// Later, automatic restore
await LoginManager.restoreSession();
```

---

## Best Practices

### Security

- **Use HTTPS Only:** Never transmit credentials over unencrypted connections
- **Implement Rate Limiting:** Max 5 failed attempts per 15 minutes per IP
- **Log Login Attempts:** Track for security audit and fraud detection
- **Monitor Concurrent Sessions:** Alert users of new logins from unusual locations
- **Force Password Change:** On first login, after security incident, or monthly

### Token Management

- **Never Log Tokens:** Don't log access/refresh tokens for debugging
- **Rotate Tokens:** Implement token rotation for high-security applications
- **Clear on Logout:** Remove tokens from memory, not just from database
- **Secure Storage:** Use httpOnly cookies or device secure storage
- **Monitor Expiration:** Refresh before expiration, not after

### User Experience

- **Show Clear Errors:** Tell users if email or password is wrong (without details)
- **Provide Recovery Options:** Forgot password, account recovery links
- **Support Remember Me:** For trusted devices (max 30 days)
- **Multiple Device Sessions:** Allow users to see and manage active sessions
- **Logout from All Devices:** Let users logout from all sessions at once

### Account Security

- **Require Strong Passwords:** Min 8 chars with uppercase, lowercase, number, special char
- **Implement Verify Email:** Lock features until email verified
- **Enforce 2FA:** For sensitive roles (admin, staff)
- **Track Failed Attempts:** Lock account after 5 failed attempts for 15 minutes
- **Monitor Location Changes:** Alert users of unusual login locations

---

## Related Features

- **[User Registration](/docs/authentication/user-registration)** - Create new account
- **[Refresh Token](/docs/authentication/refresh-token)** - Renew access token
- **[User Logout](/docs/authentication/user-logout)** - End user session
- **[Email Verification](/docs/authentication/email-verification)** - Verify email address
