# User Logout

Complete documentation for ending user sessions and invalidating authentication tokens.

---

## Overview

The logout endpoint invalidates the user's refresh token and optionally revokes their session, effectively logging them out. Once logged out, the user cannot generate new access tokens and must re-authenticate to access protected resources. The logout process includes security audit logging and session cleanup.

**Use Cases:**

- User-initiated logout
- Session expiration cleanup
- Multi-device logout (single device or all devices)
- Account security after password change
- Suspicious activity response

**Authentication:** Yes - requires valid access token

---

## End User Session

**Name:** Logout User

**Description:** Invalidates the user's refresh token and optionally revokes their session. The access token remains valid until its natural expiration (15 minutes), but no new access tokens can be generated with the invalidated refresh token. The client must discard all tokens locally to complete logout. This endpoint logs all logout activities for security audit purposes.

**Route:** `POST /auth/logout`

**Authentication Required:** Yes (Bearer token)

### Request Payload

```json
{
  "refreshToken": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
  "sessionId": "session-uuid-123",
  "logoutAllDevices": false
}
```

### Field Requirements

| Field            | Type    | Required | Description                                       |
| ---------------- | ------- | -------- | ------------------------------------------------- |
| refreshToken     | string  | Yes      | The refresh token to invalidate                   |
| sessionId        | string  | No       | Session ID to revoke (single device logout)       |
| logoutAllDevices | boolean | No       | If true, logout from all devices (default: false) |

### Request Example (JavaScript)

```javascript
async function logoutUser(
  accessToken,
  refreshToken,
  sessionId,
  logoutAll = false,
) {
  try {
    const response = await fetch(
      "https://identity.syncnexa.com/api/v1/auth/logout",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken,
          sessionId,
          logoutAllDevices: logoutAll,
        }),
      },
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("Logout failed:", result.message);
      return false;
    }

    // Clear tokens from storage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("sessionId");
    sessionStorage.clear();

    console.log("Logout successful");
    return true;
  } catch (error) {
    console.error("Logout error:", error);
    return false;
  }
}

// Usage - Logout from current device only
const success = await logoutUser(
  localStorage.getItem("accessToken"),
  localStorage.getItem("refreshToken"),
  localStorage.getItem("sessionId"),
  false,
);

if (success) {
  window.location.href = "/login";
}

// Usage - Logout from all devices
const successAll = await logoutUser(
  localStorage.getItem("accessToken"),
  localStorage.getItem("refreshToken"),
  localStorage.getItem("sessionId"),
  true,
);

if (successAll) {
  console.log("You have been logged out from all devices");
  window.location.href = "/login";
}
```

### Request Example (cURL)

```bash
# Logout from current device
curl -X POST https://identity.syncnexa.com/api/v1/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
    "sessionId": "session-550e8400-e29b-41d4-a716-446655440000"
  }'

# Logout from all devices
curl -X POST https://identity.syncnexa.com/api/v1/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
    "logoutAllDevices": true
  }'
```

### Request Example (Python)

```python
import requests

class SessionService:
    def __init__(self, base_url='https://identity.syncnexa.com/api/v1'):
        self.base_url = base_url
        self.access_token = None
        self.refresh_token = None
        self.session_id = None

    def set_session(self, access_token, refresh_token, session_id):
        """Set current session tokens"""
        self.access_token = access_token
        self.refresh_token = refresh_token
        self.session_id = session_id

    def logout(self, logout_all_devices=False):
        """Logout from current device or all devices"""
        if not self.access_token or not self.refresh_token:
            raise Exception("Not authenticated")

        payload = {
            'refreshToken': self.refresh_token,
            'logoutAllDevices': logout_all_devices
        }

        if self.session_id and not logout_all_devices:
            payload['sessionId'] = self.session_id

        headers = {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json'
        }

        response = requests.post(
            f'{self.base_url}/auth/logout',
            headers=headers,
            json=payload
        )

        if response.status_code != 200:
            print(f"Logout failed: {response.json()['message']}")
            return False

        # Clear tokens
        self.access_token = None
        self.refresh_token = None
        self.session_id = None

        logout_type = "all devices" if logout_all_devices else "current device"
        print(f"Logged out from {logout_type}")
        return True

    def list_active_sessions(self):
        """List all active sessions for this user"""
        if not self.access_token:
            raise Exception("Not authenticated")

        headers = {
            'Authorization': f'Bearer {self.access_token}'
        }

        response = requests.get(
            f'{self.base_url}/user/sessions',
            headers=headers
        )

        if response.status_code != 200:
            return []

        return response.json()['data']

    def logout_other_devices(self):
        """Logout from all devices except current one"""
        sessions = self.list_active_sessions()

        for session in sessions:
            if session['id'] != self.session_id:
                # Call logout endpoint for other sessions
                # (implementation depends on API)
                print(f"Logging out device: {session['device_name']}")

# Usage
service = SessionService()

# After login, set session
service.set_session(
    access_token='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    refresh_token='a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    session_id='session-550e8400-e29b-41d4-a716-446655440000'
)

# Logout from current device
service.logout()

# Logout from all devices
# service.logout(logout_all_devices=True)
```

### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Logged out successfully",
  "data": null
}
```

**What Happens:**

1. Refresh token is deleted from database
2. Session (if provided) is marked as revoked
3. If `logoutAllDevices=true`, all sessions for the user are revoked
4. User activity is logged for security audit
5. All existing refresh tokens for the user become invalid
6. Access token remains valid until 15-minute expiration, but cannot be refreshed

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

**What Happens:** The request body doesn't contain a refresh token. No logout action is performed. User must provide the refresh token from their login response.

### 401 Unauthorized - Invalid Access Token

```json
{
  "status": "error",
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**What Happens:** The access token in the Authorization header is invalid, expired, or missing. No logout is performed. User must provide a valid access token or log in again.

### 404 Not Found - Session Not Found

```json
{
  "status": "error",
  "statusCode": 404,
  "message": "Session not found"
}
```

**What Happens:** The provided sessionId doesn't exist for this user. The refresh token is still invalidated but the specific session cannot be revoked. User is still logged out.

### 500 Internal Server Error

```json
{
  "status": "error",
  "statusCode": 500,
  "message": "Logout failed"
}
```

**What Happens:** An unexpected server error occurred during logout (database issue, etc.). The logout may be partially complete. User should retry or clear tokens locally.

---

## Important Notes

### Token Invalidation Details

- **Refresh Token:** Immediately deleted from database; cannot be used for new access tokens
- **Access Token:** Remains valid in JWT signature verification until expiration
- **Session ID:** Marked as revoked; logs show session end time

**Security Note:** The access token is still technically valid (JWT signature verifies) until expiration, but the database marks the session as revoked. Subsequent API requests should verify the session is still active.

### Multi-Device Logout

**Single Device (Default):**

- Only current session is invalidated
- Other devices remain logged in
- Refresh token for current device becomes invalid
- User remains logged in on other devices

**All Devices:**

- All refresh tokens are deleted
- All sessions are marked as revoked
- User is logged out everywhere
- Must log in again on every device

---

## Edge Cases

| Scenario                          | Behavior                                         |
| --------------------------------- | ------------------------------------------------ |
| **Logout without sessionId**      | Only refresh token is invalidated                |
| **Logout with invalid sessionId** | Refresh token still invalidated; returns 404     |
| **Logout all devices**            | All sessions revoked; all refresh tokens deleted |
| **Already logged out**            | Success response (200); idempotent operation     |
| **Logout during token refresh**   | May succeed or fail depending on timing          |
| **Expired access token**          | Returns 401; user needs to re-authenticate       |
| **Multiple logout requests**      | Both succeed; operation is idempotent            |

---

## Examples

### Complete Logout Flow

```javascript
class AuthManager {
  static async logout(rememberMe = false) {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
      const sessionId = localStorage.getItem("sessionId");

      if (!accessToken || !refreshToken) {
        // Already logged out locally
        this.clearTokens(rememberMe);
        return true;
      }

      // Call logout API
      const response = await fetch(
        "https://identity.syncnexa.com/api/v1/auth/logout",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refreshToken,
            sessionId,
            logoutAllDevices: false,
          }),
        },
      );

      if (!response.ok) {
        console.error("Server logout failed, clearing tokens locally");
      }

      // Clear tokens regardless of API response
      this.clearTokens(rememberMe);
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      // Clear tokens even if network error
      this.clearTokens(rememberMe);
      return true;
    }
  }

  static clearTokens(rememberMe = false) {
    // Always clear session storage
    sessionStorage.clear();

    // Clear persistent storage based on setting
    if (!rememberMe) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("sessionId");
    }
  }

  static async logoutAllDevices() {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      const response = await fetch(
        "https://identity.syncnexa.com/api/v1/auth/logout",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refreshToken,
            logoutAllDevices: true,
          }),
        },
      );

      // Clear all tokens
      this.clearTokens(false);
      localStorage.removeItem("loginExpiry");

      console.log("Logged out from all devices");
      return response.ok;
    } catch (error) {
      console.error("Logout all devices error:", error);
      return false;
    }
  }
}

// Usage
// Logout from current device
await AuthManager.logout();
window.location.href = "/login";

// Logout from all devices
await AuthManager.logoutAllDevices();
window.location.href = "/login";

// Logout but remember me for next login
await AuthManager.logout(true);
window.location.href = "/login";
```

### Python Session Cleanup

```python
import requests
from datetime import datetime

class LogoutManager:
    def __init__(self, base_url, access_token, refresh_token, session_id):
        self.base_url = base_url
        self.access_token = access_token
        self.refresh_token = refresh_token
        self.session_id = session_id

    def logout(self, all_devices=False):
        """Perform logout"""
        headers = {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json'
        }

        payload = {
            'refreshToken': self.refresh_token,
            'logoutAllDevices': all_devices
        }

        if self.session_id and not all_devices:
            payload['sessionId'] = self.session_id

        response = requests.post(
            f'{self.base_url}/auth/logout',
            headers=headers,
            json=payload
        )

        return response.status_code == 200

    def get_active_sessions(self):
        """List all active sessions"""
        headers = {
            'Authorization': f'Bearer {self.access_token}'
        }

        response = requests.get(
            f'{self.base_url}/user/sessions',
            headers=headers
        )

        if response.status_code != 200:
            return []

        return response.json()['data']

    def get_session_info(self, session_id):
        """Get detailed session information"""
        sessions = self.get_active_sessions()

        for session in sessions:
            if session['id'] == session_id:
                return {
                    'device': session.get('device_name', 'Unknown'),
                    'ip': session.get('ip_address'),
                    'location': session.get('location', 'Unknown'),
                    'last_active': session.get('last_activity'),
                    'created_at': session.get('created_at')
                }

        return None

    def log_logout(self):
        """Log logout event"""
        session_info = self.get_session_info(self.session_id)

        log_entry = {
            'event': 'user_logout',
            'timestamp': datetime.now().isoformat(),
            'session_id': self.session_id,
            'device': session_info.get('device') if session_info else 'Unknown'
        }

        print(f"[LOGOUT] {log_entry['timestamp']} - {log_entry['event']}")

        return log_entry

# Usage
manager = LogoutManager(
    'https://identity.syncnexa.com/api/v1',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'session-550e8400-e29b-41d4-a716-446655440000'
)

# Show active sessions before logout
sessions = manager.get_active_sessions()
print(f"Active sessions: {len(sessions)}")

# Log the logout event
manager.log_logout()

# Perform logout
if manager.logout():
    print("Successfully logged out from current device")
else:
    print("Logout failed")

# Or logout from all devices
# if manager.logout(all_devices=True):
#     print("Successfully logged out from all devices")
```

---

## Best Practices

### User Experience

- **Show confirmation:** Warn users about logout consequences
- **Provide redirect:** After logout, redirect to login or home page
- **Clear history:** Don't cache sensitive pages after logout
- **Confirm all devices:** Ask before logging out from all devices

### Security

- **Server-Side Validation:** Always verify access token on logout
- **Log Activities:** Record all logout events for audit trail
- **Revoke Sessions:** Mark sessions as revoked, don't just delete
- **Cascade Cleanup:** Clean up related data (socket connections, etc.)
- **Idempotent:** Logout should be safe to call multiple times

### Multi-Device Management

- **Show Active Sessions:** List all logged-in devices
- **Device Identification:** Show device name, location, last activity
- **Selective Logout:** Allow logging out individual devices
- **Suspicious Activity:** Alert on unusual login locations/times
- **Remote Logout:** Allow users to logout from the web dashboard

### Token Cleanup

- **Clear Everywhere:** Remove from localStorage, sessionStorage, cookies
- **Stop Refresh Loop:** Cancel any pending token refresh timers
- **Disconnect WebSockets:** Close any open socket connections
- **Update UI:** Immediately reflect logged-out state
- **Disable API:** Prevent further API calls with stale tokens

---

## Related Features

- **[User Login](/docs/authentication/user-login)** - Authenticate user
- **[Refresh Token](/docs/authentication/refresh-token)** - Renew access token
- **[Session Management](/docs/authentication/session-management)** - Manage user sessions
- **[Security](/docs/security/best-practices)** - Security best practices
