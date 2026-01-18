# FAQ — Common Questions (SAuth 1.0)

Frequently asked questions about SAuth 1.0 integration.

### Q: How do I register my application for SAuth 1.0?

Contact the SyncNexa team with your app name and redirect URI. We'll provide your `APP_ID`, `CLIENT_ID`, and `CLIENT_SECRET` for SAuth 1.0.

### Q: Why do I need to keep `client_secret` private?

The `client_secret` is used to verify your app's identity when exchanging authorization codes. If compromised, attackers could impersonate your app and steal user data.

### Q: What's the difference between `app_id` and `client_id`?

- **`app_id`**: Identifies your registered application
- **`client_id`**: OAuth 2.0 client identifier (may be the same as app_id)

### Q: Can I use the SAuth code multiple times?

No. SAuth codes expire after 10 minutes and can only be used once. If you need a new token, request a new authorization.

### Q: How long are access tokens valid?

Access tokens are valid for 1 hour by default. After expiration, request a new authorization.

## Scopes & Permissions

### Q: What scopes should I request?

Request only the scopes you need:

- `profile` — for email and name
- `student:profile` — for student-specific data
- `student:documents` — for document access

### Q: Can users approve partial scopes?

Currently, users must approve all requested scopes or deny entirely. Selective approval is planned for a future release.

### Q: What data can I access with each scope?

- **`profile`**: email, firstName, lastName, displayName
- **`student:profile`**: student ID, enrollment status, academic level
- **`student:documents`**: uploaded documents and submissions

## Integration

### Q: How do I handle token expiration?

Store the expiration time and check before making API calls. If expired, redirect the user to authorize again.

### Q: Should I store the access token in localStorage or sessionStorage?

For web apps, **sessionStorage** is more secure (cleared when tab closes). Only use localStorage if you need persistent login across sessions.

### Q: How do I revoke user access?

Clear the user's session on your end. SyncNexa will not revoke tokens server-side yet; this is planned for future releases.

## Security

### Q: Is HTTPS required?

Yes, always use HTTPS in production. HTTP is only for local development.

### Q: What should I do if my `client_secret` is leaked?

Contact the SyncNexa team immediately to request a new secret.

### Q: How do I prevent CSRF attacks with SAuth?

Always use the `state` parameter in the SAuth authorization request and verify it matches the callback. This is required.

## Troubleshooting

### Q: I'm getting "redirect_uri mismatch" error

The `redirect_uri` in your request must **exactly match** what you registered. Check for:

- Correct protocol (http vs https)
- Trailing slashes
- Query parameters
- Port numbers

### Q: SAuth code is invalid

- Code may have expired (10 minute limit)
- Code was already used
- Verify you're using the exact SAuth code from the callback

### Q: SAuth access denied unexpectedly

Check that you're verifying the `state` parameter. If state doesn't match, deny the SAuth request to prevent CSRF attacks.

## Still Have Questions?

Contact support at [support@syncnexa.com](mailto:support@syncnexa.com) or open an issue on GitHub.

## Next Steps

→ [Quick Start](../getting-started/quick-start) — Implementation guide  
→ [SAuth Flow](../auth/oauth-flow) — Deep dive into the flow  
→ [Email Verification](../api/email-verification) — Verify user email with OTP  
→ [Universities & Faculties](../api/universities) — Discover institutions and faculties
