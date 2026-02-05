# Verification Tokens

Complete documentation for issuing and managing verification tokens for controlled data access.

---

## Overview

Verification Tokens are time-limited, scoped tokens that allow you to securely share specific information with third parties without exposing your full profile. Each token defines exactly what data can be accessed and for how long.

**Use Cases:**

- Share verified credentials with employers
- Allow background verification services to verify data
- Provide temporary access to educational institutions
- Create verification URLs for applications
- Control data exposure with granular scopes

**Authentication:** Token creation requires authentication; token validation doesn't.

---

## 1. Issue Verification Token

**Name:** Issue Verification Token

**Description:** Creates a time-limited verification token with specified data scope and access permissions.

**Route:** `POST /user/verification-tokens`

**Authentication Required:** Yes

### Request Payload

```json
{
  "token_type": "identity_verification",
  "scope": {
    "data_types": ["identity", "academic_records"],
    "institution": "University of Lagos"
  },
  "expires_in": 3600,
  "max_uses": 5,
  "metadata": {
    "purpose": "job_application",
    "company": "TechCorp Nigeria"
  }
}
```

### Field Requirements

| Field      | Type   | Required | Description                                                                                    |
| ---------- | ------ | -------- | ---------------------------------------------------------------------------------------------- |
| token_type | string | Yes      | Type of verification: "identity_verification", "academic_verification", "general_verification" |
| scope      | object | No       | Data scope and restrictions                                                                    |
| expires_in | number | No       | Token lifetime in seconds (default: 3600, max: 2592000 - 30 days)                              |
| max_uses   | number | No       | Maximum number of times token can be used (default: unlimited)                                 |
| metadata   | object | No       | Custom metadata/context                                                                        |

### Scope Fields

| Field       | Type   | Description                                                                                   |
| ----------- | ------ | --------------------------------------------------------------------------------------------- |
| data_types  | array  | What data can be accessed: "identity", "academic_records", "portfolio", "certificates", "all" |
| institution | string | Restrict to specific institution                                                              |
| permissions | array  | Allowed actions: "read" (default), "verify"                                                   |

### Request Example (JavaScript)

```javascript
async function issueVerificationToken(accessToken, tokenData) {
  const response = await fetch(
    "https://identity.syncnexa.com/api/v1/user/verification-tokens",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tokenData),
    },
  );

  return await response.json();
}

// Usage - Create token for employer verification
const token = await issueVerificationToken(accessToken, {
  token_type: "identity_verification",
  scope: {
    data_types: ["identity", "academic_records"],
    permissions: ["read"],
  },
  expires_in: 86400, // 24 hours
  max_uses: 3,
  metadata: {
    purpose: "job_application",
    company: "TechCorp Nigeria",
  },
});

console.log("Token:", token.data.token);
console.log("Expires at:", token.data.expires_at);
```

### Request Example (cURL)

```bash
curl -X POST https://identity.syncnexa.com/api/v1/user/verification-tokens \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "token_type": "academic_verification",
    "scope": {
      "data_types": ["academic_records"],
      "institution": "University of Lagos"
    },
    "expires_in": 86400,
    "max_uses": 1
  }'
```

### Success Response (201 Created)

```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Verification token issued",
  "data": {
    "id": "vtoken-e50e8400-e29b-41d4-a716-446655440010",
    "user_id": "user-123e4567-e89b-12d3-a456-426614174000",
    "token": "VT_abc123xyz789secure_token_string",
    "token_type": "identity_verification",
    "scope": {
      "data_types": ["identity", "academic_records"],
      "institution": "University of Lagos",
      "permissions": ["read"]
    },
    "expires_at": "2026-01-11T17:00:00.000Z",
    "max_uses": 5,
    "uses_count": 0,
    "is_revoked": false,
    "created_at": "2026-01-11T16:00:00.000Z"
  }
}
```

### Error Responses

#### 400 Bad Request - Invalid Token Type

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [{ "field": "token_type", "message": "Invalid token type" }]
}
```

#### 400 Bad Request - Expiration Too Long

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    { "field": "expires_in", "message": "Maximum expiration is 30 days" }
  ]
}
```

---

## 2. Retrieve Verification Tokens

**Name:** List My Verification Tokens

**Description:** Lists all verification tokens you've created.

**Route:** `GET /user/verification-tokens`

**Authentication Required:** Yes

### Query Parameters

| Parameter | Type    | Required | Description                    |
| --------- | ------- | -------- | ------------------------------ |
| active    | boolean | No       | Filter by active status        |
| skip      | number  | No       | Pagination: skip N items       |
| limit     | number  | No       | Pagination: return max N items |

### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Verification tokens",
  "data": [
    {
      "id": "vtoken-e50e8400-e29b-41d4-a716-446655440010",
      "token": "VT_abc123xyz789secure_token_string",
      "token_type": "identity_verification",
      "expires_at": "2026-01-11T17:00:00.000Z",
      "is_revoked": false,
      "uses_count": 2,
      "max_uses": 5,
      "created_at": "2026-01-11T16:00:00.000Z"
    }
  ]
}
```

---

## 3. Get Token Details

**Name:** Get Verification Token Details

**Description:** Retrieves detailed information about a specific token.

**Route:** `GET /user/verification-tokens/:id`

**Authentication Required:** Yes

### Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Verification token",
  "data": {
    "id": "vtoken-e50e8400-e29b-41d4-a716-446655440010",
    "token": "VT_abc123xyz789secure_token_string",
    "token_type": "identity_verification",
    "scope": {
      "data_types": ["identity", "academic_records"],
      "permissions": ["read"]
    },
    "expires_at": "2026-01-11T17:00:00.000Z",
    "is_revoked": false,
    "uses_count": 2,
    "max_uses": 5,
    "last_used_at": "2026-01-11T16:45:00.000Z",
    "created_at": "2026-01-11T16:00:00.000Z"
  }
}
```

---

## 4. Revoke Verification Token

**Name:** Revoke Verification Token

**Description:** Immediately revokes a token, making it invalid for future use.

**Route:** `PATCH /user/verification-tokens/:id/revoke`

**Authentication Required:** Yes

### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Token revoked"
}
```

---

## 5. Validate Verification Token

**Name:** Validate Verification Token

**Description:** Validates a verification token and returns the accessible data. This endpoint is used by third parties to verify credentials.

**Route:** `POST /user/verification-tokens/validate`

**Authentication Required:** No (token-based)

### Request Payload

```json
{
  "token": "VT_abc123xyz789secure_token_string"
}
```

### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Token valid",
  "data": {
    "user_id": "user-123e4567-e89b-12d3-a456-426614174000",
    "token_type": "identity_verification",
    "scope": {
      "data_types": ["identity", "academic_records"]
    },
    "verified_data": {
      "identity": {
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com",
        "verified": true
      },
      "academic_records": [
        {
          "institution": "University of Lagos",
          "degree": "Bachelor of Science",
          "field_of_study": "Computer Science",
          "gpa": "3.85"
        }
      ]
    },
    "verified_at": "2026-01-11T16:30:00.000Z"
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

#### 410 Gone - Token Revoked

```json
{
  "status": "error",
  "statusCode": 410,
  "message": "Token has been revoked"
}
```

#### 429 Too Many Requests - Max Uses Exceeded

```json
{
  "status": "error",
  "statusCode": 429,
  "message": "Maximum uses for this token exceeded"
}
```

---

## Examples

### Complete Verification Token Workflow

```javascript
// 1. Create a verification token
const tokenResponse = await fetch(
  "https://identity.syncnexa.com/api/v1/user/verification-tokens",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token_type: "academic_verification",
      scope: {
        data_types: ["academic_records"],
        institution: "University of Lagos",
      },
      expires_in: 86400, // 24 hours
      max_uses: 1,
      metadata: {
        purpose: "employment_verification",
        company: "TechCorp",
      },
    }),
  },
);

const tokenData = await tokenResponse.json();
const token = tokenData.data.token;

// 2. Share the token with employer/verifier
const shareLink = `https://verify.example.com?token=${token}`;
console.log("Share this link:", shareLink);

// 3. Third party validates the token (no auth needed)
const validateResponse = await fetch(
  "https://identity.syncnexa.com/api/v1/user/verification-tokens/validate",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  },
);

const verifiedData = await validateResponse.json();
console.log("Verified academic records:", verifiedData.data.verified_data);

// 4. Later, revoke the token
await fetch(
  `https://identity.syncnexa.com/api/v1/user/verification-tokens/${tokenData.data.id}/revoke`,
  {
    method: "PATCH",
    headers: { Authorization: `Bearer ${accessToken}` },
  },
);
```

### Python Example: Token Management

```python
import requests
from datetime import datetime, timedelta

class TokenManager:
    def __init__(self, access_token):
        self.base_url = 'https://identity.syncnexa.com/api/v1'
        self.headers = {'Authorization': f'Bearer {access_token}'}

    def create_employment_token(self, company_name, valid_hours=24):
        """Create a token for employment verification"""
        response = requests.post(
            f'{self.base_url}/user/verification-tokens',
            headers=self.headers,
            json={
                'token_type': 'identity_verification',
                'scope': {
                    'data_types': ['identity', 'academic_records'],
                    'permissions': ['read']
                },
                'expires_in': valid_hours * 3600,
                'max_uses': 3,
                'metadata': {
                    'purpose': 'employment_verification',
                    'company': company_name
                }
            }
        )

        return response.json()['data'] if response.status_code == 201 else None

    def cleanup_expired_tokens(self):
        """Revoke all expired tokens"""
        response = requests.get(
            f'{self.base_url}/user/verification-tokens',
            headers=self.headers
        )

        tokens = response.json()['data']
        now = datetime.now()
        revoked = []

        for token in tokens:
            expires_at = datetime.fromisoformat(token['expires_at'].replace('Z', '+00:00'))
            if expires_at < now and not token['is_revoked']:
                revoke_response = requests.patch(
                    f'{self.base_url}/user/verification-tokens/{token["id"]}/revoke',
                    headers=self.headers
                )
                if revoke_response.status_code == 200:
                    revoked.append(token['id'])

        return revoked

# Usage
manager = TokenManager(access_token)

# Create a token for TechCorp
token_data = manager.create_employment_token('TechCorp Nigeria')
if token_data:
    print(f"Token created: {token_data['token']}")
    print(f"Expires: {token_data['expires_at']}")

# Clean up old tokens
revoked = manager.cleanup_expired_tokens()
print(f"Revoked {len(revoked)} expired tokens")
```

---

## Best Practices

### Token Creation

- Set appropriate expiration times
- Use narrow scopes (only expose needed data)
- Set max_uses to limit exposure
- Include metadata for tracking
- Create separate tokens for different purposes

### Token Management

- Revoke tokens when no longer needed
- Monitor token usage
- Keep a log of issued tokens
- Don't reuse tokens across different verifiers

### Security

- Never share tokens in plain text
- Use HTTPS for all token transmission
- Include context in metadata for auditing
- Regularly review and revoke unused tokens

### Scoping Data

- Only include necessary data types
- Restrict to specific institutions when possible
- Use read-only permissions by default
- Be specific about verification purpose

---

## Related Features

- **[Shareable Links](/docs/student/shareable-links)** - Public profile sharing
- **[Student Card](/docs/student/student-card)** - Digital identity card
- **[Verification Requests](/docs/student/verification-requests)** - Institutional verification
