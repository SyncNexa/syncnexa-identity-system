# Security

Comprehensive security features for protecting user accounts, managing sessions, and implementing multi-factor authentication.

---

## Overview

The Security section covers all aspects of account security including password management, session tracking, and multi-factor authentication. SyncNexa provides robust security features to protect user accounts and give users complete control over their account access.

**Key Features:**

- Secure password reset with OTP verification
- Complete session management across devices
- Multi-factor authentication (TOTP)
- Device and location tracking
- Automatic session expiration
- Security status dashboard
- Comprehensive audit logging

---

## Security Features

### Core Features

1. **[Password Reset](/docs/security/password-reset)** - Secure account recovery with OTP
   - 6-digit OTP verification
   - 15-minute expiration window
   - Email enumeration protection
   - Password complexity requirements
   - Automatic token revocation

2. **[Session Management](/docs/security/session-management)** - Monitor and control active sessions
   - Create and track sessions
   - View all active sessions
   - Device and browser detection
   - Location tracking
   - Individual and bulk revocation
   - Automatic expiration handling

3. **[Multi-Factor Authentication (MFA)](/docs/security/mfa)** - Enable two-factor authentication
   - TOTP (Time-based One-Time Password)
   - QR code generation
   - Backup codes for recovery
   - Compatible with standard authenticator apps
   - Enable/disable functionality

---

## Quick Navigation

| Feature            | Purpose                     | Documentation                                    |
| ------------------ | --------------------------- | ------------------------------------------------ |
| Password Reset     | Recover forgotten passwords | [Get Started](/docs/security/password-reset)     |
| Session Management | Control device access       | [Get Started](/docs/security/session-management) |
| Multi-Factor Auth  | Enable 2FA protection       | [Get Started](/docs/security/mfa)                |

---

## Security Workflows

### Account Recovery Flow

```
┌─────────────────────┐
│  Forgot Password    │
└──────────┬──────────┘
           │
           ├─ POST /auth/forgot-password
           │  (email only)
           ▼
┌─────────────────────────┐
│ OTP sent to email       │
│ Valid for 15 minutes    │
└──────────┬──────────────┘
           │
           ├─ User receives OTP
           │  in email
           ▼
┌─────────────────────────┐
│ User enters OTP +       │
│ New Password            │
└──────────┬──────────────┘
           │
           ├─ POST /auth/reset-password
           │  (email, otp, newPassword)
           ▼
┌─────────────────────────┐
│ Password updated        │
│ All tokens revoked      │
│ User logged out         │
└─────────────────────────┘
```

### Session Security Flow

```
┌──────────────────┐
│  User login      │
└────────┬─────────┘
         │
         ├─ Session created
         │  Device info captured
         ▼
┌──────────────────────────┐
│ User can view all        │
│ active sessions          │
└────────┬─────────────────┘
         │
         ├─ Suspicious activity?
         │
         ├─ Yes ──► Revoke session
         │          Logout from device
         │
         └─ No ───► Session continues
                    Auto-expires in 7 days
```

### MFA Enablement Flow

```
┌────────────────────┐
│  User initiates    │
│  MFA setup         │
└────────┬───────────┘
         │
         ├─ POST /user/mfa/totp/setup
         │  (no parameters)
         ▼
┌────────────────────────────┐
│ Secret key generated       │
│ QR code provided           │
│ MFA not yet enabled        │
└────────┬───────────────────┘
         │
         ├─ User scans QR code
         │  with authenticator app
         ▼
┌────────────────────────────┐
│ User enters verification   │
│ code from authenticator    │
└────────┬───────────────────┘
         │
         ├─ POST /user/mfa/totp/enable
         │  (6-digit code)
         ▼
┌────────────────────────────┐
│ MFA enabled successfully   │
│ Backup codes provided      │
│ User protected with 2FA    │
└────────────────────────────┘
```

---

## Common Security Patterns

### Authentication

All security endpoints require authentication via Bearer token (except password reset endpoints which are public):

```bash
Authorization: Bearer {accessToken}
```

### Response Format

All endpoints follow a standard response format:

**Success Response:**

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Operation successful",
  "data": {
    /* endpoint-specific data */
  }
}
```

**Error Response:**

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Error description",
  "errors": [{ "field": "fieldName", "message": "Error detail" }]
}
```

---

## Security Best Practices

### Password Security

- **Strong Passwords**: Use at least 8 characters with mixed case, numbers, and special characters
- **Unique Passwords**: Never reuse passwords across accounts
- **Secure Storage**: Never share or store passwords in plain text
- **Regular Updates**: Change passwords periodically (every 90 days recommended)
- **Compromised Credentials**: Change password immediately if credentials leaked

### Session Security

- **Regular Monitoring**: Check active sessions weekly
- **Revoke Unknown Sessions**: Immediately revoke unrecognized devices
- **Device Logout**: Use remote logout for lost or stolen devices
- **Session Timeout**: Sessions auto-expire after inactivity
- **Public Computers**: Always logout on public/shared computers

### MFA Security

- **Enable MFA**: Protect high-value accounts with 2FA
- **Backup Codes**: Store backup codes securely and separately
- **Authenticator App**: Use dedicated authenticator app (not SMS when possible)
- **Recovery Process**: Document recovery procedure for lost authenticator
- **Update Regularly**: Regenerate backup codes periodically

### Account Monitoring

- **Email Alerts**: Set up alerts for new sessions
- **Activity Logs**: Review account activity regularly
- **Suspicious Signs**: Watch for unauthorized location changes
- **Failed Logins**: Investigate multiple failed login attempts
- **Support Tickets**: Review support tickets for account changes

---

## Security Statuses

### Password Reset Status

| Status    | Description                        | Action                  |
| --------- | ---------------------------------- | ----------------------- |
| pending   | OTP sent, waiting for verification | Enter OTP code          |
| verified  | OTP verified, ready to reset       | Enter new password      |
| completed | Password reset successfully        | Login with new password |
| expired   | OTP expired (>15 minutes)          | Request new OTP         |
| invalid   | Wrong OTP or invalid format        | Request new OTP         |

### Session Status

| Status          | Description                     | Recommended Action            |
| --------------- | ------------------------------- | ----------------------------- |
| active          | Session is valid and usable     | Monitor for unauthorized use  |
| about_to_expire | Session expiring soon (< 1 day) | Extend or create new session  |
| expired         | Session has passed TTL          | Auto-revoked, logout required |
| revoked         | Manually revoked by user        | Cannot be reactivated         |

### MFA Status

| Status                 | Description                  | Next Step            |
| ---------------------- | ---------------------------- | -------------------- |
| not_configured         | MFA not setup                | Run setup endpoint   |
| configured_unverified  | Setup complete, not verified | Run enable with code |
| enabled                | MFA active and verified      | Use codes at login   |
| backup_codes_remaining | Codes available              | Track usage          |
| backup_codes_depleted  | All backup codes used        | Contact support      |

---

## API Endpoints Reference

### Password Reset (Public)

| Method | Endpoint                          | Purpose        |
| ------ | --------------------------------- | -------------- |
| POST   | `/auth/forgot-password`           | Request OTP    |
| POST   | `/auth/verify-password-reset-otp` | Verify OTP     |
| POST   | `/auth/reset-password`            | Reset password |

### Session Management (Authenticated)

| Method | Endpoint                    | Purpose              |
| ------ | --------------------------- | -------------------- |
| POST   | `/user/sessions`            | Create session       |
| GET    | `/user/sessions`            | List active sessions |
| PATCH  | `/user/sessions/:id/revoke` | Revoke session       |
| POST   | `/user/sessions/revoke-all` | Revoke all sessions  |

### MFA Management (Authenticated)

| Method | Endpoint                 | Purpose                       |
| ------ | ------------------------ | ----------------------------- |
| POST   | `/user/mfa/totp/setup`   | Setup TOTP                    |
| POST   | `/user/mfa/totp/enable`  | Enable TOTP with verification |
| POST   | `/user/mfa/totp/disable` | Disable TOTP                  |

### Security Dashboard (Authenticated)

| Method | Endpoint    | Purpose           |
| ------ | ----------- | ----------------- |
| GET    | `/security` | Get security info |

---

## Common Use Cases

### User Forgot Password

```javascript
// 1. Request password reset OTP
const forgotResponse = await fetch(
  "https://identity.syncnexa.com/api/v1/auth/forgot-password",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "user@example.com" }),
  },
);

// 2. User receives OTP via email

// 3. User enters OTP and new password
const resetResponse = await fetch(
  "https://identity.syncnexa.com/api/v1/auth/reset-password",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "user@example.com",
      otp: "123456",
      newPassword: "NewSecureP@ss123",
      confirmPassword: "NewSecureP@ss123",
    }),
  },
);

// 4. User can now login with new password
```

### Suspicious Activity - Revoke All Sessions

```javascript
// Immediately logout from all devices
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

// User must re-authenticate
```

### Enable Two-Factor Authentication

```javascript
// 1. Initiate MFA setup
const setupResponse = await fetch(
  "https://identity.syncnexa.com/api/v1/user/mfa/totp/setup",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  },
);

// 2. User scans QR code with authenticator app
// 3. User enters verification code

// 4. Enable MFA with verification code
const enableResponse = await fetch(
  "https://identity.syncnexa.com/api/v1/user/mfa/totp/enable",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token: "123456" }),
  },
);

// MFA is now enabled - codes required at login
```

---

## Error Handling

### Common Error Codes

| Code | Scenario                | Solution                                 |
| ---- | ----------------------- | ---------------------------------------- |
| 400  | Invalid input format    | Check request format and parameters      |
| 401  | Invalid OTP/Token/Auth  | Verify OTP code, refresh access token    |
| 404  | Resource not found      | Verify IDs and that resource exists      |
| 409  | Resource already exists | Don't duplicate, use update if available |
| 429  | Rate limit exceeded     | Wait before retrying                     |
| 500  | Server error            | Contact support if persists              |

### Retry Strategy

Implement exponential backoff for retries:

```javascript
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;

      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt - 1) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
```

---

## Security Compliance

### Standards Supported

- **OWASP Top 10**: Compliant with OWASP security guidelines
- **GDPR**: European data protection compliance
- **CCPA**: California privacy law compliance
- **ISO 27001**: Information security management

### Encryption

- **In Transit**: TLS 1.2+ for all communication
- **At Rest**: AES-256 for sensitive data
- **Passwords**: Bcrypt with 10 rounds
- **OTP Secrets**: Encrypted database storage

### Audit Logging

- **Login Attempts**: All login attempts logged
- **Password Changes**: Password reset attempts logged
- **MFA Changes**: MFA enable/disable logged
- **Session Activity**: Session creation/revocation logged
- **Retention**: Logs retained for 90 days

---

## Troubleshooting Guide

### Password Reset Issues

| Issue             | Cause                     | Solution                            |
| ----------------- | ------------------------- | ----------------------------------- |
| OTP not received  | Email in spam/junk        | Check spam folder, whitelist sender |
| OTP expired       | Took >15 minutes          | Request new OTP                     |
| Invalid OTP       | Wrong code entered        | Double-check and re-enter           |
| Password rejected | Doesn't meet requirements | Check password requirements         |

### Session Management Issues

| Issue                | Cause                   | Solution                        |
| -------------------- | ----------------------- | ------------------------------- |
| Can't see sessions   | Not authenticated       | Login first                     |
| Session revoke fails | Session already revoked | Refresh and try again           |
| Unknown device shown | VPN/proxy use           | Review and revoke if suspicious |

### MFA Setup Issues

| Issue              | Cause         | Solution                 |
| ------------------ | ------------- | ------------------------ |
| QR code won't scan | Image quality | Use manual secret entry  |
| Enable fails       | Wrong code    | Wait for new code        |
| Lost backup codes  | Not saved     | Disable and re-setup MFA |

---

## Security Metrics & Monitoring

### Key Metrics

| Metric                   | Description                     | Healthy Target |
| ------------------------ | ------------------------------- | -------------- |
| Avg Password Reset Time  | Time to complete reset          | < 5 minutes    |
| Session Creation Success | % of successful session creates | > 99%          |
| MFA Adoption Rate        | % users with MFA enabled        | > 50%          |
| Failed Login Attempts    | Failed logins per user/day      | < 3            |
| Session Revocation Rate  | % of sessions revoked by user   | < 1%           |

### Monitoring Recommendations

- **Daily**: Check failed login attempts
- **Weekly**: Review active sessions per user
- **Monthly**: Analyze security trends
- **Quarterly**: Audit security configuration
- **Annually**: Conduct security assessment

---

## Related Documentation

- **[User Registration](/docs/authentication/user-registration)** - Create accounts securely
- **[User Login](/docs/authentication/user-login)** - Secure authentication
- **[User Logout](/docs/authentication/user-logout)** - Session termination
- **[Email Verification](/docs/authentication/email-verification)** - Email security
- **[Developer Security](/docs/admin/security)** - Admin security features
