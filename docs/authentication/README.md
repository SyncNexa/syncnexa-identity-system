# Authentication

Complete documentation for user authentication, registration, and token management in SyncNexa Identity.

---

## Overview

The Authentication section covers the complete user lifecycle: account creation, login, session management, and logout. SyncNexa implements JWT-based token authentication with refresh tokens, session tracking, and comprehensive security measures.

**Key Features:**

- Role-based user registration
- Secure password hashing (bcrypt)
- JWT access tokens (15-minute expiration)
- Refresh tokens (7-day expiration)
- Multi-device session tracking
- Email verification
- Account security measures

---

## Authentication Features

### Core Features

1. **[User Registration](/docs/authentication/user-registration)** - Create new user accounts
   - Support for multiple user roles (Student, Staff, Developer, Visitor)
   - Student-specific academic information collection
   - Email uniqueness enforcement
   - Matric number deduplication for students
   - Secure password requirements

2. **[User Login](/docs/authentication/user-login)** - Authenticate with credentials
   - Email and password authentication
   - Access token generation (JWT, 15 min)
   - Refresh token generation (7 days)
   - Session creation and tracking
   - Multi-device support

3. **[Refresh Token](/docs/authentication/refresh-token)** - Renew access tokens
   - Generate new access tokens without re-authentication
   - Automatic token expiration handling
   - Token lifecycle management (15-min access, 7-day refresh)
   - Proactive token refresh capabilities

4. **[User Logout](/docs/authentication/user-logout)** - End user sessions
   - Single device logout
   - Multi-device logout (all at once)
   - Session revocation and cleanup
   - Security audit logging

5. **[Email Verification](/docs/authentication/email-verification)** - Verify email addresses
   - OTP-based verification
   - Email confirmation workflow
   - Verified account privileges

---

## Quick Navigation

| Feature            | Purpose              | Documentation                                          |
| ------------------ | -------------------- | ------------------------------------------------------ |
| Registration       | Create new account   | [Get Started](/docs/authentication/user-registration)  |
| Login              | Authenticate user    | [Get Started](/docs/authentication/user-login)         |
| Token Refresh      | Renew access token   | [Get Started](/docs/authentication/refresh-token)      |
| Logout             | End session          | [Get Started](/docs/authentication/user-logout)        |
| Email Verification | Verify email address | [Get Started](/docs/authentication/email-verification) |

---

## Common Patterns

### Authentication Flow

```
User → Register → Verify Email → Login → Receive Tokens → Use API → Logout
         ↓
     Email confirmed
         ↓
   Student features unlocked
```

### Token Usage

All authenticated endpoints require a Bearer token in the Authorization header:

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

### Token Structure

**Access Token (JWT):**

- Format: `header.payload.signature`
- Expiration: 15 minutes
- Purpose: Authenticate API requests
- Storage: Send in every request header

**Refresh Token (UUID):**

- Format: UUID string
- Expiration: 7 days
- Purpose: Obtain new access tokens
- Storage: Secure storage (httpOnly cookie, device keystore)

---

## Authentication Workflow Diagrams

### User Registration & Login

```
┌─────────────────┐
│  New User       │
│  (Anonymous)    │
└────────┬────────┘
         │
         ├─ POST /auth/register
         │  (email, password, role, etc.)
         ▼
┌─────────────────┐
│ Validation      │
│ - Email unique  │
│ - Password OK   │
│ - Role valid    │
└────────┬────────┘
         │ ✓ Valid
         ▼
┌─────────────────┐
│ Account Created │
│ is_verified:    │
│   false         │
└────────┬────────┘
         │
         ├─ POST /auth/verify-email/request
         │  (sends OTP to email)
         ▼
┌─────────────────┐
│ OTP Sent        │
│ (15 min expiry) │
└────────┬────────┘
         │
         ├─ POST /auth/verify-email
         │  (email, otp)
         ▼
┌─────────────────┐
│ Email Verified  │
│ is_verified:    │
│   true          │
└────────┬────────┘
         │
         ├─ POST /auth/login
         │  (email, password)
         ▼
┌──────────────────────┐
│ Authenticated        │
│ Access Token: valid  │
│ Refresh Token: valid │
│ Session: created     │
└──────────────────────┘
```

### Token Lifecycle

```
┌──────────────────────────────────────────────┐
│ Token Lifecycle (Simplified)                 │
└──────────────────────────────────────────────┘

Time 0: User logs in
├─ Generate access token (expires: 15 min)
└─ Generate refresh token (expires: 7 days)

Time 5 min: Make API requests
├─ Include access token in header
└─ Request succeeds

Time 14 min: Token about to expire
├─ Call /auth/refresh-token
├─ Provide refresh token
└─ Get new access token

Time 15 min+: Old token expired
├─ New token now active (from refresh)
└─ Continue using new token

Time 7 days: Refresh token expires
├─ Cannot generate new access token
└─ User must log in again

Time 7+: Session ended
├─ All tokens invalid
└─ Redirect to login
```

---

## Security Features

### Password Security

- **Bcrypt Hashing:** Industry-standard password hashing with salt
- **Requirements:** Min 8 chars, uppercase, lowercase, number, special char
- **No Plaintext:** Passwords never stored or transmitted unencrypted
- **Secure Comparison:** Timing-attack resistant password verification

### Token Security

- **JWT Signing:** HMAC-SHA256 signature verification
- **Token Expiration:** Access tokens expire in 15 minutes
- **Refresh Rotation:** Tokens are never reused
- **Database Validation:** Session verified in database on logout
- **HTTPS Only:** All authentication traffic requires encryption

### Account Security

- **Email Verification:** Features locked until email verified
- **Rate Limiting:** Max 5 failed login attempts per 15 minutes per IP
- **Session Tracking:** Device info, IP, location recorded
- **Audit Logging:** All authentication events logged
- **Multi-Device Support:** Track active sessions per user

### Data Protection

- **Input Validation:** All inputs validated and sanitized
- **SQL Injection Prevention:** Parameterized queries via ORM
- **XSS Protection:** Output escaping on all responses
- **CORS Policy:** Strict origin validation
- **CSRF Protection:** Token-based CSRF prevention

---

## API Endpoints Reference

| Method | Endpoint                     | Purpose              | Auth |
| ------ | ---------------------------- | -------------------- | ---- |
| POST   | `/auth/register`             | Register new user    | No   |
| POST   | `/auth/login`                | Authenticate user    | No   |
| POST   | `/auth/refresh-token`        | Get new access token | No\* |
| POST   | `/auth/logout`               | End session          | Yes  |
| POST   | `/auth/verify-email/request` | Send OTP             | Yes  |
| POST   | `/auth/verify-email`         | Verify with OTP      | Yes  |
| POST   | `/auth/verify-email/resend`  | Resend OTP           | Yes  |
| GET    | `/auth/verify-email/status`  | Check verification   | Yes  |

\*Requires refresh token (but not access token)

---

## Common Workflows

### Complete Registration to Login

```javascript
// 1. Register
const registerRes = await fetch("/api/v1/auth/register", {
  method: "POST",
  body: JSON.stringify({
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    password: "SecurePass@123",
    role: "student",
    country: "Nigeria",
    state: "Lagos",
    address: "Street Address",
    gender: "male",
    phone: "+2348012345678",
  }),
});

// 2. Verify email
const otpRes = await fetch("/api/v1/auth/verify-email/request", {
  headers: { Authorization: `Bearer ${accessToken}` },
});
// User checks email for OTP

const verifyRes = await fetch("/api/v1/auth/verify-email", {
  method: "POST",
  headers: { Authorization: `Bearer ${accessToken}` },
  body: JSON.stringify({ otp: "123456" }),
});

// 3. Now login
const loginRes = await fetch("/api/v1/auth/login", {
  method: "POST",
  body: JSON.stringify({
    email: "john@example.com",
    password: "SecurePass@123",
  }),
});

const { accessToken, refreshToken } = loginRes.data;
```

### Maintain Session with Auto-Refresh

```javascript
class SessionManager {
  constructor(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.startAutoRefresh();
  }

  startAutoRefresh() {
    // Refresh every 14 minutes
    setInterval(() => this.refreshAccessToken(), 14 * 60 * 1000);
  }

  async refreshAccessToken() {
    const res = await fetch("/api/v1/auth/refresh-token", {
      method: "POST",
      body: JSON.stringify({ refreshToken: this.refreshToken }),
    });

    if (res.ok) {
      this.accessToken = res.data.accessToken;
    } else {
      // Refresh failed, redirect to login
      window.location.href = "/login";
    }
  }

  async makeRequest(endpoint, options = {}) {
    return fetch(endpoint, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${this.accessToken}`,
      },
    });
  }
}
```

### Secure Logout

```javascript
async function secureLogout() {
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");
  const sessionId = localStorage.getItem("sessionId");

  try {
    // Call logout API
    await fetch("/api/v1/auth/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ refreshToken, sessionId }),
    });
  } finally {
    // Clear tokens regardless of API response
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/login";
  }
}
```

---

## Best Practices

### For Client Applications

1. **Store Tokens Securely**
   - Web: httpOnly, secure, sameSite cookies
   - Mobile: Device secure storage (Keychain/Keystore)
   - Desktop: Encrypted local storage

2. **Handle Token Expiration**
   - Monitor expiration time
   - Refresh proactively (at 14 minutes)
   - Handle 401 responses by refreshing

3. **Implement Error Handling**
   - Display user-friendly messages
   - Log errors for debugging
   - Implement retry logic for failures

4. **Security Measures**
   - Always use HTTPS
   - Validate all inputs
   - Never log tokens
   - Clear tokens on logout

### For Security

1. **Rate Limiting:** Limit login/register attempts per IP
2. **HTTPS Only:** Never send credentials over HTTP
3. **CORS Configuration:** Strict origin validation
4. **Token Rotation:** Rotate tokens periodically
5. **Audit Logging:** Log all authentication events
6. **Multi-Factor Authentication:** Implement for sensitive roles

### For User Experience

1. **Remember Device:** Offer 30-day "remember me" option
2. **Session Management:** Show active devices/locations
3. **Logout All:** Allow logout from all devices at once
4. **Forgot Password:** Provide password recovery flow
5. **Account Recovery:** Support multiple recovery methods

---

## Troubleshooting

### Common Issues

| Issue                     | Cause                           | Solution                     |
| ------------------------- | ------------------------------- | ---------------------------- |
| 401 Invalid credentials   | Wrong email/password            | Verify credentials and retry |
| 409 Email already exists  | Email already registered        | Use different email or login |
| 401 Invalid refresh token | Expired or revoked token        | Log in again                 |
| Email verification stuck  | OTP expired                     | Request new OTP              |
| Token refresh failing     | Refresh token expired (7+ days) | Log in again                 |

### Debug Checklist

- [ ] Email is in correct format
- [ ] Password meets requirements
- [ ] Tokens stored in secure location
- [ ] HTTPS being used (not HTTP)
- [ ] Authorization header properly formatted
- [ ] Token not expired (check `exp` claim in JWT)
- [ ] Session still active in database
- [ ] No network connectivity issues

---

## Related Documentation

- **[Student Features](/docs/student)** - Student-specific endpoints
- **[Third Party Integration](/docs/third-party)** - OAuth and API access
- **[Security Best Practices](/docs/security/best-practices)** - Security guidelines
- **[API Reference](/docs/api)** - Complete API documentation
