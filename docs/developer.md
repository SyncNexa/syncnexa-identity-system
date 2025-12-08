# SyncNexa Identity — Developer Docs (SAuth 1.0)

> Developer-facing guide for integrating external apps with SyncNexa Identity (SAuth 1.0).

## Base URLs (SAuth 1.0)

- Production (planned): `https://identity.syncnexa.com/api/v1`
- Local dev: `http://localhost:3000/api/v1`

## Authentication Model

- **User login (first-party)**: Standard password/TOTP → yields session/JWT for student.
- **SAuth (third-party apps)**: SAuth Authorization Code Flow.
- **Tokens**: JWT bearer tokens signed with `JWT_SECRET`.

## SAuth Authorization Code Flow

1. Your app sends the user to SyncNexa:
   ```
   GET /api/v1/sauth/authorize?
     app_id={APP_ID}&
     scopes=profile+student:profile+student:documents&
     redirect_uri={CALLBACK_URL}&
     state={OPAQUE_STATE}
   ```
2. User sees the SyncNexa consent screen and approves/denies.
3. SyncNexa redirects back:
   - Success: `{redirect_uri}?code=...&state=...`
   - Deny: `{redirect_uri}?error=access_denied&error_description=User+cancelled+consent&state=...`
4. Your backend exchanges the code for an access token:

   ```http
   POST /api/v1/sauth/token
   Content-Type: application/json

   {
     "grant_type": "authorization_code",
     "code": "{CODE}",
     "client_id": "{CLIENT_ID}",
     "client_secret": "{CLIENT_SECRET}",
     "app_id": "{APP_ID}"
   }
   ```

   Response:

   ```json
   {
     "access_token": "<jwt>",
     "token_type": "Bearer",
     "expires_in": 604800,
     "scope": "profile student:profile student:documents"
   }
   ```

5. Use the access token to fetch the user profile:
   ```http
   GET /api/v1/sauth/userinfo
   Authorization: Bearer {ACCESS_TOKEN}
   ```

## Scopes

- `profile` — Basic profile (email, name, phone)
- `student:profile` — Institution + matric number (students only)
- `student:documents` — Verified documents (read)
- `student:academics` — Academic records/transcripts (read)
- `student:portfolio` — Projects/certificates (read)

## Errors

- `invalid_request` — Missing/invalid params.
- `invalid_grant` — Bad or expired code; app mismatch.
- `invalid_token` — Signature/format invalid.
- `token_revoked` / `token_expired` — Token no longer valid.
- `access_denied` — User denied consent.

## Security Notes

- Codes are single-use, 10-minute TTL.
- Access tokens: 7-day TTL; revocable via `/sauth/revoke`.
- `redirect_uri` must match the registered `callback_url` of the app.
- Only scopes allowed by the app’s registration are honored; others are dropped.

## Sample Integration (Backend)

```javascript
// Exchange code
async function exchangeCode(code) {
  const res = await fetch("https://identity.syncnexa.com/api/v1/sauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      code,
      client_id: process.env.SAUTH_CLIENT_ID,
      client_secret: process.env.SAUTH_CLIENT_SECRET,
      app_id: process.env.SAUTH_APP_ID,
    }),
  });
  if (!res.ok) throw new Error(`token exchange failed: ${res.status}`);
  return res.json();
}

// Fetch user info
async function getUserInfo(accessToken) {
  const res = await fetch(
    "https://identity.syncnexa.com/api/v1/sauth/userinfo",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  if (!res.ok) throw new Error(`userinfo failed: ${res.status}`);
  return res.json();
}
```

## Revoking Access

- Endpoint: `POST /api/v1/sauth/revoke`
- Body: `{ "app_id": "<APP_ID>" }`
- Auth: Student must be authenticated.

## Versioning & Availability

- Current API version: `v1`.
- Docs served locally at `/docs/` for development; plan to host at `https://docs.syncnexa.com`.

## Support

- Report issues: `support@syncnexa.com`
- Security: `security@syncnexa.com`
