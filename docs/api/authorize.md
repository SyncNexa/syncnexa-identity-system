# API Reference — Authorize (SAuth 1.0)

## Endpoint

```
GET /api/v1/sauth/authorize
```

Initiates the SAuth 1.0 authorization code flow by redirecting the user to the consent screen.

## Parameters

| Parameter      | Type   | Required | Description                              |
| -------------- | ------ | -------- | ---------------------------------------- |
| `app_id`       | string | Yes      | Your registered application ID           |
| `client_id`    | string | Yes      | OAuth client identifier                  |
| `redirect_uri` | string | Yes      | Registered callback URL (URL-encoded)    |
| `scopes`       | string | Yes      | Space-separated permissions              |
| `state`        | string | Yes      | Opaque random string for CSRF protection |

## Example Request

```
GET /api/v1/sauth/authorize?
  app_id=my-app&
  client_id=client_123&
  redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fcallback&
  scopes=profile+student:profile&
  state=xyz789
```

## Response

The user is redirected to one of:

**On authorization:**

```
http://your-redirect-uri?code=AUTH_CODE&state=xyz789
```

**On denial:**

```
http://your-redirect-uri?error=access_denied&error_description=User+cancelled+consent&state=xyz789
```

## Error Codes

| Error             | Description                    |
| ----------------- | ------------------------------ |
| `invalid_request` | Missing or invalid parameters  |
| `access_denied`   | User denied authorization      |
| `invalid_scope`   | One or more scopes are invalid |
| `server_error`    | Internal server error          |

## Security Notes

- Always verify the `state` parameter matches your request
- Validate the `redirect_uri` is registered
- Use HTTPS in production
- Never expose `client_secret` in client-side code

## Next Steps

→ [Token Exchange](./token) — Exchange code for access token  
→ [OAuth Flow](../auth/oauth-flow) — Full flow explanation
