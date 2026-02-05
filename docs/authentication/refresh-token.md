# Refresh Token

Complete documentation for renewing access tokens without re-authentication.

---

## Overview

The refresh token endpoint generates new access tokens using a valid refresh token. This allows users to maintain their sessions without requiring password re-entry. The refresh token mechanism implements a sliding token window for enhanced security while maintaining user convenience.

**Use Cases:**

- Extend user session without logout
- Automatic token renewal for long-running operations
- Mobile app session persistence
- Prevent session interruption during user activity
- Secure token rotation

**Authentication:** Not required - but requires valid refresh token

---

## Refresh Access Token

**Name:** Generate New Access Token

**Description:** Generates a new access token using a valid refresh token. This endpoint is called when the access token expires or is about to expire. The refresh token must be valid, not expired, and not revoked. This endpoint does not generate a new refresh token; the existing refresh token remains valid for its full 7-day expiration period.

**Route:** `POST /auth/refresh-token`

**Authentication Required:** No (but requires valid refresh token)

### Request Payload

```json
{
  "refreshToken": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"
}
```

### Field Requirements

| Field        | Type   | Required | Description                                        |
| ------------ | ------ | -------- | -------------------------------------------------- |
| refreshToken | string | Yes      | Valid refresh token from login or previous refresh |

### Request Example (JavaScript)

```javascript
async function refreshAccessToken(refreshToken) {
  try {
    const response = await fetch(
      "https://identity.syncnexa.com/api/v1/auth/refresh-token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      },
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("Token refresh failed:", result.message);
      // Refresh token is invalid or expired, require re-login
      return null;
    }

    const newAccessToken = result.data.accessToken;

    // Update stored token
    localStorage.setItem("accessToken", newAccessToken);

    console.log("Access token refreshed successfully");
    return newAccessToken;
  } catch (error) {
    console.error("Network error:", error);
    return null;
  }
}

// Automatic token refresh interceptor
const setupTokenRefresh = (refreshTokenValue) => {
  setInterval(
    async () => {
      console.log("Refreshing access token proactively...");
      const newToken = await refreshAccessToken(refreshTokenValue);

      if (!newToken) {
        console.log("Refresh failed, redirecting to login");
        window.location.href = "/login";
      }
    },
    14 * 60 * 1000,
  ); // Refresh every 14 minutes (before 15 min expiry)
};

// Usage
setupTokenRefresh(localStorage.getItem("refreshToken"));
```

### Request Example (cURL)

```bash
curl -X POST https://identity.syncnexa.com/api/v1/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"
  }'
```

### Request Example (Python)

```python
import requests
from datetime import datetime, timedelta

class TokenManager:
    def __init__(self, base_url='https://identity.syncnexa.com/api/v1'):
        self.base_url = base_url
        self.access_token = None
        self.refresh_token = None
        self.token_obtained_at = None

    def set_tokens(self, access_token, refresh_token):
        """Store tokens from login response"""
        self.access_token = access_token
        self.refresh_token = refresh_token
        self.token_obtained_at = datetime.now()

    def refresh_access_token(self):
        """Request new access token"""
        if not self.refresh_token:
            raise Exception("No refresh token available")

        response = requests.post(
            f'{self.base_url}/auth/refresh-token',
            json={'refreshToken': self.refresh_token}
        )

        if response.status_code != 200:
            print(f"Token refresh failed: {response.json()['message']}")
            return False

        self.access_token = response.json()['data']['accessToken']
        self.token_obtained_at = datetime.now()

        print("Access token refreshed successfully")
        return True

    def is_token_expired(self):
        """Check if access token has expired (15 minutes)"""
        if not self.token_obtained_at:
            return True

        elapsed = (datetime.now() - self.token_obtained_at).total_seconds()
        return elapsed > 900  # 15 minutes

    def should_refresh(self):
        """Check if token should be refreshed proactively"""
        if not self.token_obtained_at:
            return True

        elapsed = (datetime.now() - self.token_obtained_at).total_seconds()
        return elapsed > 840  # Refresh at 14 minutes

    def get_auth_header(self):
        """Get authorization header, refreshing if needed"""
        if self.should_refresh():
            if not self.refresh_access_token():
                raise Exception("Token refresh failed, re-login required")

        return {'Authorization': f'Bearer {self.access_token}'}

    def make_authenticated_request(self, method, endpoint, data=None):
        """Make API request with automatic token refresh"""
        url = f'{self.base_url}{endpoint}'
        headers = self.get_auth_header()

        if method == 'GET':
            return requests.get(url, headers=headers)
        elif method == 'POST':
            return requests.post(url, json=data, headers=headers)
        elif method == 'PATCH':
            return requests.patch(url, json=data, headers=headers)
        elif method == 'DELETE':
            return requests.delete(url, headers=headers)
        else:
            raise ValueError(f"Unsupported method: {method}")

# Usage
manager = TokenManager()

# After login, set tokens
manager.set_tokens(
    access_token='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    refresh_token='a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'
)

# Make requests - tokens are automatically refreshed
response = manager.make_authenticated_request('GET', '/user/profile')
print(response.json())

# After 14 minutes, token is automatically refreshed
import time
time.sleep(840)  # Wait 14 minutes
response = manager.make_authenticated_request('GET', '/user/documents')
print(response.json())
```

### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Access token refreshed!",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwMCIsImVtYWlsIjoiam9obi5kb2VAZXhhbXBsZS5jb20iLCJyb2xlIjoidmlzaXRvciIsImlhdCI6MTY0MjAwMTAwMCwiZXhwIjoxNjQyMDEwMDAwfQ.new_signature"
  }
}
```

### New Access Token Details

**Expiration:** 15 minutes from refresh time (not from original login)

**Payload Contains:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.doe@example.com",
  "role": "student",
  "iat": 1642001000,
  "exp": 1642010000
}
```

**Usage:** Include in Authorization header for all subsequent requests:

```
Authorization: Bearer <new_accessToken>
```

---

## Error Responses

### 400 Bad Request - Missing Refresh Token

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Refresh token required"
}
```

**What Happens:** The request body doesn't contain a refresh token. No new access token is generated. The client must provide the refresh token from their login response.

### 401 Unauthorized - Invalid Refresh Token

```json
{
  "status": "error",
  "statusCode": 401,
  "message": "Invalid or expired refresh token"
}
```

**What Happens:** One of the following occurred:

- Refresh token doesn't exist in the database
- Refresh token has expired (more than 7 days old)
- Refresh token has been explicitly revoked (via logout)
- Refresh token format is invalid

No new access token is generated. The user must log in again to obtain new tokens.

### 401 Unauthorized - User Not Found

```json
{
  "status": "error",
  "statusCode": 401,
  "message": "User not found"
}
```

**What Happens:** The refresh token is valid but the associated user account no longer exists (account was deleted). No new access token is generated. The user must create a new account or contact support.

### 401 Unauthorized - User Account Disabled

```json
{
  "status": "error",
  "statusCode": 401,
  "message": "User account is disabled"
}
```

**What Happens:** The refresh token is valid but the user's account status is not "active" (suspended, deleted pending, etc.). No new access token is generated. The user should contact support.

### 500 Internal Server Error

```json
{
  "status": "error",
  "statusCode": 500,
  "message": "Token refresh failed"
}
```

**What Happens:** An unexpected server error occurred during token refresh (database connection issue, token generation failure, etc.). No new access token is generated. The user should retry after a brief delay or log in again if the issue persists.

---

## Edge Cases

| Scenario                                    | Behavior                                                |
| ------------------------------------------- | ------------------------------------------------------- |
| **Refresh token within 1 minute of expiry** | Accepted; generates new token                           |
| **Refresh token exactly at 7-day expiry**   | Accepted; generates new token                           |
| **Refresh token after 7-day expiry**        | Rejected with 401 error                                 |
| **Refresh token after logout**              | Rejected with 401 error                                 |
| **Multiple simultaneous refresh requests**  | All processed independently; each generates valid token |
| **Refresh with old access token in header** | Ignored; only refresh token matters                     |
| **Malformed refresh token**                 | Rejected with 401 error                                 |
| **Empty refresh token**                     | Rejected with 400 error                                 |
| **Very old login (6+ days)**                | Still valid; token remains 7 days from login            |

---

## Token Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│ Token Lifecycle (15-minute Access Token, 7-day Refresh Token)   │
└─────────────────────────────────────────────────────────────────┘

Time 0: User logs in
├─ Obtain access token (exp: 15 min)
└─ Obtain refresh token (exp: 7 days)

Time 5 min: User makes API request
├─ Access token valid
└─ No refresh needed

Time 14 min: Proactive refresh (recommended)
├─ Call /auth/refresh-token with refresh token
├─ Obtain new access token (exp: 15 min from now)
└─ Refresh token unchanged (still 6 days 59 min remaining)

Time 15 min: Access token expires (if not refreshed)
├─ API requests return 401
└─ Client must call /auth/refresh-token or redirect to login

Time 3 days: Still valid
├─ Access token refreshed at 14-min interval
├─ Refresh token still valid (4 days remaining)
└─ User can maintain session indefinitely

Time 7 days: Refresh token expires
├─ Cannot generate new access token
├─ All API requests fail
└─ User must log in again

Time 7+ days: Session ended
├─ All tokens invalid
├─ User redirected to login
└─ Must re-authenticate with credentials
```

---

## Examples

### Automatic Token Refresh with Interceptor

```javascript
class APIClient {
  constructor(baseURL, refreshToken) {
    this.baseURL = baseURL;
    this.refreshToken = refreshToken;
    this.accessToken = null;
    this.tokenExpiresAt = null;
  }

  setTokens(accessToken) {
    this.accessToken = accessToken;
    this.tokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  }

  async refreshIfNeeded() {
    // Refresh if token will expire within 2 minutes
    if (
      this.tokenExpiresAt &&
      new Date() > new Date(this.tokenExpiresAt - 2 * 60 * 1000)
    ) {
      try {
        const response = await fetch(`${this.baseURL}/auth/refresh-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: this.refreshToken }),
        });

        if (response.ok) {
          const result = await response.json();
          this.setTokens(result.data.accessToken);
          localStorage.setItem("accessToken", this.accessToken);
          console.log("Token refreshed successfully");
          return true;
        } else {
          console.error("Token refresh failed");
          return false;
        }
      } catch (error) {
        console.error("Token refresh error:", error);
        return false;
      }
    }
    return true;
  }

  async request(endpoint, options = {}) {
    // Refresh token if needed
    if (!(await this.refreshIfNeeded())) {
      throw new Error("Session expired, please log in again");
    }

    // Make request with current access token
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    // Handle 401 - token might have been revoked
    if (response.status === 401) {
      throw new Error("Unauthorized - please log in again");
    }

    return response;
  }

  async get(endpoint) {
    return this.request(endpoint, { method: "GET" });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }
}

// Usage
const client = new APIClient(
  "https://identity.syncnexa.com/api/v1",
  localStorage.getItem("refreshToken"),
);

// Set initial tokens from login
client.setTokens(localStorage.getItem("accessToken"));

// All requests automatically refresh token if needed
const profile = await client.get("/user/profile");
const documents = await client.get("/user/documents");
const result = await client.post("/user/documents", {
  /* data */
});
```

### Python Token Rotation

```python
import requests
import threading
import time

class AutoRefreshTokenManager:
    def __init__(self, base_url, refresh_token, refresh_interval=840):
        """
        Auto-refresh token manager

        Args:
            base_url: API base URL
            refresh_token: Initial refresh token
            refresh_interval: Seconds between refresh attempts (default: 14 min)
        """
        self.base_url = base_url
        self.refresh_token = refresh_token
        self.access_token = None
        self.refresh_interval = refresh_interval
        self.running = False
        self.refresh_thread = None

    def start(self):
        """Start background token refresh"""
        self.running = True
        self.refresh_thread = threading.Thread(target=self._refresh_loop, daemon=True)
        self.refresh_thread.start()
        print("Token auto-refresh started")

    def stop(self):
        """Stop background token refresh"""
        self.running = False
        if self.refresh_thread:
            self.refresh_thread.join()
        print("Token auto-refresh stopped")

    def _refresh_loop(self):
        """Background thread that refreshes token periodically"""
        while self.running:
            try:
                time.sleep(self.refresh_interval)

                if self.running:  # Check again after sleep
                    response = requests.post(
                        f'{self.base_url}/auth/refresh-token',
                        json={'refreshToken': self.refresh_token}
                    )

                    if response.status_code == 200:
                        self.access_token = response.json()['data']['accessToken']
                        print(f"Token refreshed at {time.strftime('%H:%M:%S')}")
                    else:
                        print(f"Token refresh failed: {response.json()['message']}")
                        self.running = False

            except Exception as e:
                print(f"Token refresh error: {e}")
                self.running = False

    def get_headers(self):
        """Get authorization headers"""
        if not self.access_token:
            raise Exception("No access token available")

        return {'Authorization': f'Bearer {self.access_token}'}

    def request(self, method, endpoint, data=None):
        """Make authenticated request"""
        if not self.running:
            raise Exception("Token manager not running")

        url = f'{self.base_url}{endpoint}'
        headers = self.get_headers()

        if method == 'GET':
            return requests.get(url, headers=headers)
        elif method == 'POST':
            return requests.post(url, json=data, headers=headers)

# Usage
manager = AutoRefreshTokenManager(
    'https://identity.syncnexa.com/api/v1',
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'
)

# Set initial access token
manager.access_token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

# Start automatic refresh
manager.start()

try:
    # Make requests - token is automatically refreshed every 14 minutes
    for i in range(10):
        response = manager.request('GET', '/user/profile')
        print(f"Request {i+1}: {response.json()}")
        time.sleep(60)
finally:
    manager.stop()
```

---

## Best Practices

### Token Refresh Strategy

- **Proactive Refresh:** Refresh at 14 minutes before 15-minute expiry
- **Handle Failures Gracefully:** Catch refresh errors and redirect to login
- **Don't Refresh Too Often:** Avoid unnecessary requests (check 14-min threshold)
- **Store Safely:** Keep refresh token in secure storage (httpOnly cookies)
- **Validate Response:** Always update access token from response

### Error Handling

- **401 on Refresh:** User session expired, redirect to login
- **Network Errors:** Retry after delay or redirect to login
- **Server Errors:** Retry with exponential backoff or redirect to login
- **Missing Refresh Token:** Redirect to login immediately

### Monitoring & Logging

- **Log Token Refreshes:** Track for debugging but don't log token values
- **Monitor Failed Refreshes:** Alert on unusual patterns
- **Track Session Duration:** Understand user behavior
- **Detect Token Abuse:** Unusual refresh patterns may indicate attack

### Multi-Device Sessions

- **One Refresh Token Per Session:** Each device gets separate session
- **Allow Multiple Active Sessions:** User can be logged in from multiple devices
- **Logout from Other Devices:** Let user invalidate other sessions
- **Track Session Metadata:** Device info, IP, location

---

## Related Features

- **[User Login](/docs/authentication/user-login)** - Obtain initial tokens
- **[User Logout](/docs/authentication/user-logout)** - Invalidate refresh token
- **[Session Management](/docs/authentication/session-management)** - Manage user sessions
