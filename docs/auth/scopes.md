# SAuth 1.0 Scopes

Scopes define what data your app can access in SAuth 1.0. Users approve scopes during the SAuth consent screen.

## Available Scopes

| Scope               | Description                      |
| ------------------- | -------------------------------- |
| `profile`           | Basic user profile (email, name) |
| `student:profile`   | Student-specific profile data    |
| `student:documents` | Access to student documents      |

## Requesting Scopes

Pass scope names as a space-separated string in the authorization request:

```
GET /api/v1/sauth/authorize?
  app_id={APP_ID}&
  ...
  scopes=profile+student:profile+student:documents&
  ...
```

Or URL-encoded:

```javascript
const scopes = ["profile", "student:profile", "student:documents"].join(" ");
const url = new URL("http://localhost:3000/api/v1/sauth/authorize");
url.searchParams.set("scopes", scopes);
```

## Scope Approval

The user's consent screen will show all requested scopes. The user can:

- **Approve all** — Grant all requested scopes
- **Deny** — Reject the entire authorization request
- (Future) **Selective approval** — Approve individual scopes

## Checking Approved Scopes

The token response includes the `scope` field with approved scopes:

```json
{
  "access_token": "...",
  "scope": "profile student:profile"
}
```

Always verify the user granted the scopes you need before calling protected endpoints.

## Next Steps

→ [OAuth Flow](./oauth-flow) — Full authorization flow details  
→ [API Reference](../api/authorize) — Authorize endpoint parameters
