# Session Management

Comprehensive session tracking and management for monitoring active user sessions across devices and locations.

---

## Overview

The Session Management feature provides users with complete visibility and control over their active sessions across all devices. Each session tracks device information, location, IP address, and activity timestamps, enabling users to monitor and revoke access from any device at any time.

**Key Features:**

- Create and track user sessions
- View all active sessions
- Device and browser detection
- Location tracking by IP
- Individual session revocation
- Bulk session revocation
- 7-day default session lifetime
- Automatic expiration handling

---

## Use Cases

| Use Case            | Description                                    |
| ------------------- | ---------------------------------------------- |
| Security Monitoring | View all devices with access to your account   |
| Suspicious Activity | Revoke access from unrecognized devices        |
| Device Cleanup      | Remove old or unused sessions                  |
| Location Tracking   | Monitor where account is being accessed from   |
| Session Logout      | Log out from specific devices remotely         |
| Security Audit      | Review session history for security compliance |

---

## Session Management Endpoints

### Create Session

**Endpoint:** `POST /user/sessions`

**Description:** Creates a new session for the authenticated user. Sessions track device information, IP address, user agent, and location. Default session lifetime is 7 days but can be customized.

**Authentication:** Required (Student, Developer, Staff roles)

**Request Body:**

```json
{
  "ttl_seconds": 604800
}
```

**Request Fields:**

| Field       | Type   | Required | Description                                            |
| ----------- | ------ | -------- | ------------------------------------------------------ |
| ttl_seconds | number | No       | Session lifetime in seconds (default: 604800 = 7 days) |

**Success Response:**

```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Session created",
  "data": {
    "token": "sess_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    "record": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "a1b2c3d4-e5f6-4g7h-8i9j-k0l1m2n3o4p5",
      "session_token": "sess_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
      "ip_address": "192.168.1.100",
      "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "device_name": "Chrome on Windows",
      "browser": "Chrome",
      "device_type": "desktop",
      "location": "Lagos, Nigeria",
      "is_active": true,
      "last_activity": "2026-02-05T10:30:00.000Z",
      "expires_at": "2026-02-12T10:30:00.000Z",
      "created_at": "2026-02-05T10:30:00.000Z"
    }
  }
}
```

**Error Responses:**

| Status Code | Error                    | What Happens                    |
| ----------- | ------------------------ | ------------------------------- |
| 400         | User ID required         | User not authenticated          |
| 401         | Unauthorized             | Invalid or expired access token |
| 500         | Failed to create session | Internal error creating session |

**Example Request (JavaScript):**

```javascript
const response = await fetch(
  "https://identity.syncnexa.com/api/v1/user/sessions",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ttl_seconds: 604800, // 7 days
    }),
  },
);

const result = await response.json();
console.log("Session created:", result.data.record.id);
console.log("Device:", result.data.record.device_name);
console.log("Location:", result.data.record.location);
```

**Example Request (cURL):**

```bash
curl -X POST 'https://identity.syncnexa.com/api/v1/user/sessions' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "ttl_seconds": 604800
  }'
```

**Example Request (Python):**

```python
import requests

response = requests.post(
    'https://identity.syncnexa.com/api/v1/user/sessions',
    headers={
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    },
    json={'ttl_seconds': 604800}
)

result = response.json()
print(f"Session created: {result['data']['record']['id']}")
print(f"Device: {result['data']['record']['device_name']}")
print(f"Location: {result['data']['record']['location']}")
```

---

### List Active Sessions

**Endpoint:** `GET /user/sessions`

**Description:** Retrieves all active (non-expired, non-revoked) sessions for the authenticated user. Returns comprehensive information about each session including device details, location, and activity timestamps.

**Authentication:** Required (Student, Developer, Staff roles)

**Success Response:**

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Active sessions",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "device": {
        "name": "Chrome on Windows",
        "browser": "Chrome",
        "type": "desktop"
      },
      "ip_address": "192.168.1.100",
      "location": "Lagos, Nigeria",
      "last_activity": "2026-02-05T10:30:00.000Z",
      "created_at": "2026-02-05T09:00:00.000Z",
      "is_current": false
    },
    {
      "id": "660f9511-f3ac-52e5-b827-557766551111",
      "device": {
        "name": "Safari on iPhone",
        "browser": "Safari",
        "type": "mobile"
      },
      "ip_address": "192.168.1.105",
      "location": "Lagos, Nigeria",
      "last_activity": "2026-02-05T11:15:00.000Z",
      "created_at": "2026-02-04T14:30:00.000Z",
      "is_current": false
    }
  ]
}
```

**Response Fields:**

| Field          | Type    | Description                                    |
| -------------- | ------- | ---------------------------------------------- |
| id             | string  | Session unique identifier                      |
| device.name    | string  | Human-readable device name                     |
| device.browser | string  | Browser name                                   |
| device.type    | string  | Device type (desktop, mobile, tablet, unknown) |
| ip_address     | string  | IP address of the session                      |
| location       | string  | Geographical location (city, country)          |
| last_activity  | string  | ISO timestamp of last activity                 |
| created_at     | string  | ISO timestamp of session creation              |
| is_current     | boolean | Whether this is the current session            |

**Error Responses:**

| Status Code | Error                   | What Happens                       |
| ----------- | ----------------------- | ---------------------------------- |
| 400         | User ID required        | User not authenticated             |
| 401         | Unauthorized            | Invalid or expired access token    |
| 500         | Failed to list sessions | Internal error retrieving sessions |

**Example Request (JavaScript):**

```javascript
const response = await fetch(
  "https://identity.syncnexa.com/api/v1/user/sessions",
  {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  },
);

const result = await response.json();
console.log(`You have ${result.data.length} active sessions:`);
result.data.forEach((session) => {
  console.log(`- ${session.device.name} from ${session.location}`);
  console.log(
    `  Last active: ${new Date(session.last_activity).toLocaleString()}`,
  );
});
```

**Example Request (cURL):**

```bash
curl -X GET 'https://identity.syncnexa.com/api/v1/user/sessions' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: application/json'
```

**Example Request (Python):**

```python
import requests
from datetime import datetime

response = requests.get(
    'https://identity.syncnexa.com/api/v1/user/sessions',
    headers={
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
)

result = response.json()
print(f"You have {len(result['data'])} active sessions:")
for session in result['data']:
    print(f"- {session['device']['name']} from {session['location']}")
    last_active = datetime.fromisoformat(session['last_activity'].replace('Z', '+00:00'))
    print(f"  Last active: {last_active.strftime('%Y-%m-%d %H:%M:%S')}")
```

---

### Revoke Session

**Endpoint:** `PATCH /user/sessions/:id/revoke`

**Description:** Revokes (terminates) a specific session by ID. The session is marked as inactive and can no longer be used for authentication. Useful for logging out from a specific device remotely.

**Authentication:** Required (Student, Developer, Staff roles)

**URL Parameters:**

| Parameter | Type   | Required | Description          |
| --------- | ------ | -------- | -------------------- |
| id        | string | Yes      | Session ID to revoke |

**Success Response:**

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Session revoked",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "a1b2c3d4-e5f6-4g7h-8i9j-k0l1m2n3o4p5",
    "is_active": false,
    "revoked_at": "2026-02-05T12:00:00.000Z"
  }
}
```

**Error Responses:**

| Status Code | Error                    | What Happens                             |
| ----------- | ------------------------ | ---------------------------------------- |
| 400         | Session ID required      | No session ID provided in URL            |
| 401         | Unauthorized             | Invalid or expired access token          |
| 404         | Session not found        | Session doesn't exist or already revoked |
| 500         | Failed to revoke session | Internal error revoking session          |

**Example Request (JavaScript):**

```javascript
const sessionId = "550e8400-e29b-41d4-a716-446655440000";

const response = await fetch(
  `https://identity.syncnexa.com/api/v1/user/sessions/${sessionId}/revoke`,
  {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  },
);

const result = await response.json();
console.log("Session revoked successfully");
```

**Example Request (cURL):**

```bash
curl -X PATCH 'https://identity.syncnexa.com/api/v1/user/sessions/550e8400-e29b-41d4-a716-446655440000/revoke' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: application/json'
```

**Example Request (Python):**

```python
import requests

session_id = '550e8400-e29b-41d4-a716-446655440000'

response = requests.patch(
    f'https://identity.syncnexa.com/api/v1/user/sessions/{session_id}/revoke',
    headers={
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
)

result = response.json()
print('Session revoked successfully')
```

---

### Revoke All Sessions

**Endpoint:** `POST /user/sessions/revoke-all`

**Description:** Revokes all active sessions for the authenticated user. Useful for security scenarios like suspected account compromise, password changes, or logout from all devices. The current session may also be revoked depending on implementation.

**Authentication:** Required (Student, Developer, Staff roles)

**Success Response:**

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "All sessions revoked",
  "data": null
}
```

**Error Responses:**

| Status Code | Error                     | What Happens                     |
| ----------- | ------------------------- | -------------------------------- |
| 400         | User ID required          | User not authenticated           |
| 401         | Unauthorized              | Invalid or expired access token  |
| 500         | Failed to revoke sessions | Internal error revoking sessions |

**Example Request (JavaScript):**

```javascript
const response = await fetch(
  "https://identity.syncnexa.com/api/v1/user/sessions/revoke-all",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  },
);

const result = await response.json();
console.log("All sessions revoked successfully");
// Note: You may need to re-authenticate after this
```

**Example Request (cURL):**

```bash
curl -X POST 'https://identity.syncnexa.com/api/v1/user/sessions/revoke-all' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: application/json'
```

**Example Request (Python):**

```python
import requests

response = requests.post(
    'https://identity.syncnexa.com/api/v1/user/sessions/revoke-all',
    headers={
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
)

result = response.json()
print('All sessions revoked successfully')
# Note: You may need to re-authenticate after this
```

---

## Complete Session Management Workflow

### JavaScript Implementation

```javascript
class SessionManager {
  constructor(apiBaseUrl, accessToken) {
    this.apiBaseUrl = apiBaseUrl;
    this.accessToken = accessToken;
  }

  async createSession(ttlSeconds = 604800) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/user/sessions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ttl_seconds: ttlSeconds }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create session");
      }

      console.log("✅ Session created successfully");
      console.log(`   Device: ${result.data.record.device_name}`);
      console.log(`   Location: ${result.data.record.location}`);
      console.log(
        `   Expires: ${new Date(result.data.record.expires_at).toLocaleString()}`,
      );

      return result.data;
    } catch (error) {
      console.error("❌ Create session failed:", error.message);
      throw error;
    }
  }

  async listActiveSessions() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/user/sessions`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to list sessions");
      }

      console.log(`\n📱 Active Sessions (${result.data.length}):`);
      result.data.forEach((session, index) => {
        console.log(`\n${index + 1}. ${session.device.name}`);
        console.log(`   Location: ${session.location}`);
        console.log(`   IP: ${session.ip_address}`);
        console.log(
          `   Last Active: ${new Date(session.last_activity).toLocaleString()}`,
        );
        console.log(
          `   Created: ${new Date(session.created_at).toLocaleString()}`,
        );
        console.log(`   ID: ${session.id}`);
      });

      return result.data;
    } catch (error) {
      console.error("❌ List sessions failed:", error.message);
      throw error;
    }
  }

  async revokeSession(sessionId) {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/user/sessions/${sessionId}/revoke`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to revoke session");
      }

      console.log(`✅ Session ${sessionId} revoked successfully`);
      return result.data;
    } catch (error) {
      console.error("❌ Revoke session failed:", error.message);
      throw error;
    }
  }

  async revokeAllSessions() {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/user/sessions/revoke-all`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to revoke all sessions");
      }

      console.log("✅ All sessions revoked successfully");
      console.log("⚠️  You may need to re-authenticate");
      return result.data;
    } catch (error) {
      console.error("❌ Revoke all sessions failed:", error.message);
      throw error;
    }
  }

  async findSuspiciousSessions() {
    try {
      const sessions = await this.listActiveSessions();
      const suspicious = [];

      // Example: Flag sessions from unknown locations or devices
      sessions.forEach((session) => {
        // Add your own logic to detect suspicious sessions
        if (session.device.type === "unknown") {
          suspicious.push({
            ...session,
            reason: "Unknown device type",
          });
        }
      });

      if (suspicious.length > 0) {
        console.log(`\n⚠️  Found ${suspicious.length} suspicious session(s):`);
        suspicious.forEach((session) => {
          console.log(`   - ${session.device.name} (${session.reason})`);
        });
      } else {
        console.log("\n✅ No suspicious sessions detected");
      }

      return suspicious;
    } catch (error) {
      console.error("❌ Find suspicious sessions failed:", error.message);
      throw error;
    }
  }

  async cleanupOldSessions(daysOld = 7) {
    try {
      const sessions = await this.listActiveSessions();
      const now = new Date();
      const cutoffDate = new Date(
        now.getTime() - daysOld * 24 * 60 * 60 * 1000,
      );

      const oldSessions = sessions.filter((session) => {
        const lastActivity = new Date(session.last_activity);
        return lastActivity < cutoffDate;
      });

      if (oldSessions.length === 0) {
        console.log("✅ No old sessions to clean up");
        return [];
      }

      console.log(`\n🧹 Cleaning up ${oldSessions.length} old session(s)...`);

      const revokePromises = oldSessions.map((session) =>
        this.revokeSession(session.id),
      );

      await Promise.all(revokePromises);

      console.log(`✅ Cleaned up ${oldSessions.length} old session(s)`);
      return oldSessions;
    } catch (error) {
      console.error("❌ Cleanup failed:", error.message);
      throw error;
    }
  }
}

// Usage
const sessionManager = new SessionManager(
  "https://identity.syncnexa.com/api/v1",
  "your-access-token",
);

// Create a new session
await sessionManager.createSession(604800); // 7 days

// List all active sessions
await sessionManager.listActiveSessions();

// Revoke a specific session
await sessionManager.revokeSession("550e8400-e29b-41d4-a716-446655440000");

// Find suspicious sessions
await sessionManager.findSuspiciousSessions();

// Cleanup old sessions (inactive for >7 days)
await sessionManager.cleanupOldSessions(7);

// Revoke all sessions (logout from all devices)
await sessionManager.revokeAllSessions();
```

---

## Python Implementation

```python
import requests
from datetime import datetime, timedelta
from typing import List, Dict, Optional

class SessionManager:
    def __init__(self, api_base_url: str, access_token: str):
        self.api_base_url = api_base_url
        self.access_token = access_token
        self.headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }

    def create_session(self, ttl_seconds: int = 604800) -> Dict:
        """Create a new session"""
        try:
            response = requests.post(
                f'{self.api_base_url}/user/sessions',
                headers=self.headers,
                json={'ttl_seconds': ttl_seconds}
            )

            result = response.json()

            if not response.ok:
                raise Exception(result.get('message', 'Failed to create session'))

            print('✅ Session created successfully')
            print(f"   Device: {result['data']['record']['device_name']}")
            print(f"   Location: {result['data']['record']['location']}")
            expires = datetime.fromisoformat(result['data']['record']['expires_at'].replace('Z', '+00:00'))
            print(f"   Expires: {expires.strftime('%Y-%m-%d %H:%M:%S')}")

            return result['data']
        except Exception as e:
            print(f"❌ Create session failed: {e}")
            raise

    def list_active_sessions(self) -> List[Dict]:
        """List all active sessions"""
        try:
            response = requests.get(
                f'{self.api_base_url}/user/sessions',
                headers=self.headers
            )

            result = response.json()

            if not response.ok:
                raise Exception(result.get('message', 'Failed to list sessions'))

            print(f"\n📱 Active Sessions ({len(result['data'])}):")
            for idx, session in enumerate(result['data'], 1):
                print(f"\n{idx}. {session['device']['name']}")
                print(f"   Location: {session['location']}")
                print(f"   IP: {session['ip_address']}")
                last_active = datetime.fromisoformat(session['last_activity'].replace('Z', '+00:00'))
                print(f"   Last Active: {last_active.strftime('%Y-%m-%d %H:%M:%S')}")
                created = datetime.fromisoformat(session['created_at'].replace('Z', '+00:00'))
                print(f"   Created: {created.strftime('%Y-%m-%d %H:%M:%S')}")
                print(f"   ID: {session['id']}")

            return result['data']
        except Exception as e:
            print(f"❌ List sessions failed: {e}")
            raise

    def revoke_session(self, session_id: str) -> Dict:
        """Revoke a specific session"""
        try:
            response = requests.patch(
                f'{self.api_base_url}/user/sessions/{session_id}/revoke',
                headers=self.headers
            )

            result = response.json()

            if not response.ok:
                raise Exception(result.get('message', 'Failed to revoke session'))

            print(f"✅ Session {session_id} revoked successfully")
            return result['data']
        except Exception as e:
            print(f"❌ Revoke session failed: {e}")
            raise

    def revoke_all_sessions(self) -> None:
        """Revoke all active sessions"""
        try:
            response = requests.post(
                f'{self.api_base_url}/user/sessions/revoke-all',
                headers=self.headers
            )

            result = response.json()

            if not response.ok:
                raise Exception(result.get('message', 'Failed to revoke all sessions'))

            print('✅ All sessions revoked successfully')
            print('⚠️  You may need to re-authenticate')
        except Exception as e:
            print(f"❌ Revoke all sessions failed: {e}")
            raise

    def find_suspicious_sessions(self) -> List[Dict]:
        """Find potentially suspicious sessions"""
        try:
            sessions = self.list_active_sessions()
            suspicious = []

            # Example: Flag sessions from unknown devices
            for session in sessions:
                if session['device']['type'] == 'unknown':
                    suspicious.append({
                        **session,
                        'reason': 'Unknown device type'
                    })

            if suspicious:
                print(f"\n⚠️  Found {len(suspicious)} suspicious session(s):")
                for session in suspicious:
                    print(f"   - {session['device']['name']} ({session['reason']})")
            else:
                print('\n✅ No suspicious sessions detected')

            return suspicious
        except Exception as e:
            print(f"❌ Find suspicious sessions failed: {e}")
            raise

    def cleanup_old_sessions(self, days_old: int = 7) -> List[Dict]:
        """Cleanup sessions inactive for specified days"""
        try:
            sessions = self.list_active_sessions()
            now = datetime.now()
            cutoff_date = now - timedelta(days=days_old)

            old_sessions = []
            for session in sessions:
                last_activity = datetime.fromisoformat(
                    session['last_activity'].replace('Z', '+00:00')
                ).replace(tzinfo=None)

                if last_activity < cutoff_date:
                    old_sessions.append(session)

            if not old_sessions:
                print('✅ No old sessions to clean up')
                return []

            print(f"\n🧹 Cleaning up {len(old_sessions)} old session(s)...")

            for session in old_sessions:
                self.revoke_session(session['id'])

            print(f"✅ Cleaned up {len(old_sessions)} old session(s)")
            return old_sessions
        except Exception as e:
            print(f"❌ Cleanup failed: {e}")
            raise


# Usage
session_manager = SessionManager(
    'https://identity.syncnexa.com/api/v1',
    'your-access-token'
)

# Create a new session
session_manager.create_session(604800)  # 7 days

# List all active sessions
session_manager.list_active_sessions()

# Revoke a specific session
session_manager.revoke_session('550e8400-e29b-41d4-a716-446655440000')

# Find suspicious sessions
session_manager.find_suspicious_sessions()

# Cleanup old sessions (inactive for >7 days)
session_manager.cleanup_old_sessions(7)

# Revoke all sessions (logout from all devices)
session_manager.revoke_all_sessions()
```

---

## Edge Cases

| Scenario                      | Behavior                                            |
| ----------------------------- | --------------------------------------------------- |
| Session expired               | Automatically inactive, won't appear in active list |
| Revoke already revoked        | Returns 404 error                                   |
| Revoke non-existent session   | Returns 404 error                                   |
| Multiple sessions same device | Each tracked separately                             |
| No active sessions            | Returns empty array                                 |
| Revoke current session        | May logout user immediately                         |
| Create with invalid TTL       | Uses default 7-day TTL                              |
| Session token reuse           | Not allowed after revocation                        |

---

## Best Practices

### Security Monitoring

- **Regular Reviews**: Check active sessions weekly
- **Suspicious Activity**: Immediately revoke unknown sessions
- **Location Tracking**: Monitor for unexpected locations
- **Device Recognition**: Flag unfamiliar devices
- **Alert System**: Set up alerts for new sessions

### Session Hygiene

- **Cleanup Old Sessions**: Remove inactive sessions regularly
- **Limit Active Sessions**: Consider maximum active sessions per user
- **Session Lifetime**: Use appropriate TTL for security level
- **Revoke on Password Change**: Revoke all sessions after password reset
- **Logout All Devices**: Provide easy way to logout from all devices

### User Experience

- **Clear Identification**: Show recognizable device/browser names
- **Current Session Indicator**: Highlight current session
- **Confirmation Dialogs**: Confirm before revoking sessions
- **Activity Timestamps**: Show last activity time
- **Location Display**: Show user-friendly location names

---

## Security Considerations

### Session Security

- **Unique Tokens**: Each session has unique token
- **Secure Storage**: Session tokens hashed in database
- **Automatic Expiration**: Sessions expire after TTL
- **Revocation Support**: Sessions can be revoked anytime
- **Activity Tracking**: Last activity timestamp updated

### Privacy Protection

- **IP Anonymization**: Consider IP anonymization for privacy
- **Location Accuracy**: Location is approximate, not exact
- **User Control**: Users can revoke any session
- **Data Retention**: Revoked sessions eventually deleted
- **Audit Logging**: Session activities logged for security

---

## Related Documentation

- **[User Login](/docs/authentication/user-login)** - Create sessions during login
- **[User Logout](/docs/authentication/user-logout)** - Revoke sessions during logout
- **[MFA Setup](/docs/security/mfa)** - Additional session security
- **[Security Dashboard](/docs/security/README)** - View security overview
