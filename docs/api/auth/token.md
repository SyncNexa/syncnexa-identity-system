# API Reference — Token Exchange (SAuth 1.0)

## Endpoint

```
POST /api/v1/sauth/token
```

Exchanges an SAuth 1.0 authorization code for an access token.

## Request

```http
POST /api/v1/sauth/token
Content-Type: application/json

{
  "grant_type": "authorization_code",
  "code": "AUTH_CODE",
  "client_id": "your_client_id",
  "client_secret": "your_client_secret",
  "app_id": "your_app_id"
}
```

### Parameters

| Parameter       | Type   | Required | Description                              |
| --------------- | ------ | -------- | ---------------------------------------- |
| `grant_type`    | string | Yes      | Must be `authorization_code`             |
| `code`          | string | Yes      | Authorization code from `/authorize`     |
| `client_id`     | string | Yes      | Your OAuth client ID                     |
| `client_secret` | string | Yes      | Your OAuth client secret (keep private!) |
| `app_id`        | string | Yes      | Your registered application ID           |

## Response

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "profile student:profile"
}
```

### Response Fields

| Field          | Description                               |
| -------------- | ----------------------------------------- |
| `access_token` | JWT token for API requests                |
| `token_type`   | Token type (always `Bearer`)              |
| `expires_in`   | Token lifetime in seconds                 |
| `scope`        | Approved scopes as space-separated string |

## Error Responses

```json
{
  "error": "invalid_grant",
  "error_description": "Authorization code has expired or is invalid"
}
```

### Error Codes

| Error             | Description                            |
| ----------------- | -------------------------------------- |
| `invalid_request` | Missing or malformed parameters        |
| `invalid_client`  | Client authentication failed           |
| `invalid_grant`   | Code invalid, expired, or already used |
| `invalid_scope`   | Scope mismatch                         |
| `server_error`    | Internal server error                  |

## Security Notes

- Call this endpoint from your backend only
- Never expose `client_secret` to clients
- Authorization codes expire after 10 minutes
- Codes can only be used once
- Use HTTPS in production

## Example (Node.js)

```javascript
const response = await fetch("http://localhost:3000/api/v1/sauth/token", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    grant_type: "authorization_code",
    code: authCode,
    client_id: process.env.SAUTH_CLIENT_ID,
    client_secret: process.env.SAUTH_CLIENT_SECRET,
    app_id: process.env.SAUTH_APP_ID,
  }),
});

const { access_token, expires_in } = await response.json();
```

## Next Steps

→ [User Profile](./user-profile) — Fetch user data with access token  
→ [OAuth Flow](../auth/oauth-flow) — Full authorization flow
