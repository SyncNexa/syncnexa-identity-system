# Token Management

## Access Tokens

Tokens returned by the `/api/v1/sauth/token` endpoint are JWT tokens that expire after a set duration.

### Token Structure

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "profile student:profile"
}
```

| Field          | Description                                         |
| -------------- | --------------------------------------------------- |
| `access_token` | JWT token for API requests                          |
| `token_type`   | Always `Bearer`                                     |
| `expires_in`   | Token lifetime in seconds (typically 3600 = 1 hour) |
| `scope`        | Approved scopes as a space-separated string         |

## Token Lifecycle

### Short-lived Access Tokens

Access tokens are short-lived (typically 1 hour) for security. Request a new SAuth authorization when the token expires.

### Expiration Handling

1. Store token and expiration time on your server
2. Before making API calls, check if token is expired
3. If expired, redirect user to authorization again
4. Cache tokens per-user for the session duration

### Example Implementation

```javascript
// Store in session or database
session.token = {
  access_token: "...",
  expiresAt: Date.now() + 3600 * 1000,
};

// Before API call
if (Date.now() > session.token.expiresAt) {
  // Redirect to /api/v1/sauth/authorize
  redirectToAuth();
} else {
  // Use token
  callAPI(session.token.access_token);
}
```

## Next Steps

→ [Scopes](./scopes) — Learn about permission levels  
→ [API Reference](../api/token) — Token endpoint details
