# SAuth 1.0 Authorization Flow

## Authorization Code Flow

SyncNexa implements the **SAuth 1.0 Authorization Code Flow**, the most secure flow for web applications.

## Step-by-Step Breakdown

### 1. Authorization Request

User is redirected to SyncNexa's authorization endpoint:

```
GET /api/v1/sauth/authorize?
  app_id={APP_ID}&
  client_id={CLIENT_ID}&
  redirect_uri={REDIRECT_URI}&
  scopes={SCOPES}&
  state={STATE}
```

**Parameters:**

| Parameter      | Required | Description                                                              |
| -------------- | -------- | ------------------------------------------------------------------------ |
| `app_id`       | Yes      | Your registered application ID                                           |
| `client_id`    | Yes      | OAuth client identifier                                                  |
| `redirect_uri` | Yes      | Where to send the user back (must match registered URI)                  |
| `scopes`       | Yes      | Space-separated permissions: `profile student:profile student:documents` |
| `state`        | Yes      | Opaque string for CSRF protection (must be random)                       |

### 2. User Consent

The user sees a consent screen showing:

- Your app name and logo
- Requested permissions (scopes)
- Option to approve or deny

### 3. Authorization Response

SyncNexa redirects back to your `redirect_uri`:

**On approval:**

```
{redirect_uri}?code={AUTHORIZATION_CODE}&state={STATE}
```

**On denial:**

```
{redirect_uri}?error=access_denied&error_description=User+cancelled+consent&state={STATE}
```

**Always verify the `state` parameter matches your original request.**

### 4. Token Exchange

Your backend exchanges the authorization code for an access token:

```http
POST /api/v1/sauth/token
Content-Type: application/json

{
  "grant_type": "authorization_code",
  "code": "{AUTHORIZATION_CODE}",
  "client_id": "{CLIENT_ID}",
  "client_secret": "{CLIENT_SECRET}",
  "app_id": "{APP_ID}"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "profile student:profile"
}
```

### 5. API Access

Use the `access_token` to call protected endpoints:

```http
GET /api/v1/user/profile
Authorization: Bearer {ACCESS_TOKEN}
```

## Security Considerations

- ✅ Always verify the `state` parameter
- ✅ Keep `client_secret` secure (backend only)
- ✅ Use HTTPS in production
- ✅ Validate `redirect_uri` matches exactly
- ✅ Store tokens securely
- ✅ Implement token refresh if available

## Next Steps

→ [Token Management](./token-management) — Handle token expiration and refresh  
→ [Scopes](./scopes) — Understand available permissions
