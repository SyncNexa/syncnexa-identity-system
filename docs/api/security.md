# Security Endpoint

## Overview

The Security endpoint provides students with detailed information about their account security status. It returns password strength assessment, MFA configuration, and active sessions.

## Endpoints

### Get Security Information

Returns comprehensive security information for the authenticated student.

```
GET /api/v1/security
```

**Authentication:** Required (Student role)

**Response:**

```json
{
  "status": 200,
  "message": "Security information retrieved",
  "data": {
    "password_strength": {
      "score": 3,
      "label": "Good",
      "feedback": ["Password appears secure"]
    },
    "mfa_status": {
      "enabled": true,
      "type": "totp"
    },
    "sessions": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "device_name": "Chrome on Windows",
        "browser": "Chrome",
        "device_type": "desktop",
        "ip_address": "192.168.1.1",
        "location": "Lagos, Nigeria",
        "last_activity": "2026-01-30T14:32:45.000Z",
        "created_at": "2026-01-29T10:15:22.000Z",
        "expires_at": "2026-02-05T10:15:22.000Z"
      }
    ]
  }
}
```

## Response Fields

### password_strength

Object containing password strength assessment:

- `score` (number): 0-5 scale
  - 0: Very Weak
  - 1: Weak
  - 2: Fair
  - 3: Good
  - 4: Strong
  - 5: Very Strong
- `label` (string): Human-readable strength label
- `feedback` (array): Suggestions for improvement (empty if strong)

**Note:** The password itself is never returned, only the strength assessment.

### mfa_status

Object indicating MFA configuration:

- `enabled` (boolean): Whether MFA is activated
- `type` (string|null): MFA type if enabled - `"totp"`, `"sms"`, `"email"`, or `null`

### sessions

Array of active sessions with device and access information:

- `id` (string): Session identifier
- `device_name` (string|null): Device name (e.g., "Chrome on Windows")
- `browser` (string|null): Browser name
- `device_type` (string): Type of device - `"desktop"`, `"mobile"`, `"tablet"`, or `"unknown"`
- `ip_address` (string|null): IP address of the session
- `location` (string|null): Geographical location
- `last_activity` (string): ISO timestamp of last activity
- `created_at` (string): ISO timestamp when session was created
- `expires_at` (string): ISO timestamp when session expires

## Example Usage

### JavaScript/Node.js

```javascript
const response = await fetch("https://api.example.com/api/v1/security", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  },
});

const security = await response.json();
console.log("Password Strength:", security.data.password_strength.label);
console.log("MFA Enabled:", security.data.mfa_status.enabled);
console.log("Active Sessions:", security.data.sessions.length);
```

### Python

```python
import requests

headers = {
    'Authorization': f'Bearer {access_token}',
    'Content-Type': 'application/json'
}

response = requests.get(
    'https://api.example.com/api/v1/security',
    headers=headers
)

security = response.json()
print(f"Password Strength: {security['data']['password_strength']['label']}")
print(f"MFA Enabled: {security['data']['mfa_status']['enabled']}")
print(f"Active Sessions: {len(security['data']['sessions'])}")
```

### cURL

```bash
curl -X GET 'https://api.example.com/api/v1/security' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: application/json'
```

## Security Considerations

1. **Password Privacy:** The actual password is never transmitted in any response
2. **Session Management:** Sessions are automatically removed when they expire
3. **MFA Verification:** MFA status indicates whether additional authentication is enabled
4. **Device Tracking:** All active sessions are tracked with device and location information

## Error Responses

### 400 Bad Request

```json
{
  "status": 400,
  "message": "User ID required"
}
```

### 401 Unauthorized

```json
{
  "status": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden

```json
{
  "status": 403,
  "message": "Only students can access this endpoint"
}
```

### 404 Not Found

```json
{
  "status": 404,
  "message": "Security information not found"
}
```

### 500 Internal Server Error

```json
{
  "status": 500,
  "message": "Failed to retrieve security information"
}
```

## Related Endpoints

- [MFA Setup](/docs/api/mfa)
- [Session Management](/docs/api/sessions)
- [User Profile](/docs/api/user-profile)
- [Authentication](/docs/auth/token-management)
