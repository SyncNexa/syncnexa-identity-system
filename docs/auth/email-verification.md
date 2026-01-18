# Email Verification Flow

## Overview

The email verification system uses time-limited One-Time Passwords (OTP) to verify user email addresses. Once verified, the user's email is marked as verified in the system.

## Database Schema

### verification_tokens Table

- **id**: Unique token identifier
- **token**: The OTP code (6 digits)
- **scope**: "email_verification" for email verification tokens
- **issued_for**: User ID who the token is issued for
- **expires_at**: Token expiration time (15 minutes from creation)
- **revoked**: Flag indicating if token has been used/revoked
- **metadata**: JSON containing additional info (type: "email_otp", user_id)
- **created_at**: Token creation timestamp

### users Table

- **is_verified**: Boolean flag indicating if email is verified (default: FALSE)

## API Endpoints

### 1. Request Email Verification OTP

**Endpoint:** `POST /api/auth/verify-email/request`

**Authentication:** Required (Bearer token)

**Request Body:**

```json
{}
```

**Response (Success - 200):**

```json
{
  "status": "success",
  "message": "OTP sent to your email (check response in dev)",
  "data": {
    "otp": "123456", // Only in development mode
    "expiresIn": "15 minutes",
    "tokenId": "uuid-string"
  }
}
```

**Response (Success - Production):**

```json
{
  "status": "success",
  "message": "OTP sent to your email",
  "data": {
    "expiresIn": "15 minutes",
    "message": "Check your email for the verification code"
  }
}
```

**Error Responses:**

- `401 Unauthorized` - User not authenticated
- `500 Internal Server Error` - Server error

---

### 2. Verify Email with OTP

**Endpoint:** `POST /api/auth/verify-email`

**Authentication:** Required (Bearer token)

**Request Body:**

```json
{
  "otp": "123456"
}
```

**Response (Success - 200):**

```json
{
  "status": "success",
  "message": "Email verified successfully",
  "data": {
    "verified": true,
    "message": "Your email has been verified"
  }
}
```

**Error Responses:**

- `400 Bad Request` - Invalid or expired OTP
  ```json
  {
    "status": "failed",
    "message": "Invalid or expired OTP",
    "data": null
  }
  ```
- `400 Bad Request` - OTP format invalid (not 6 digits)
- `401 Unauthorized` - User not authenticated

---

### 3. Check Verification Status

**Endpoint:** `GET /api/auth/verify-email/status`

**Authentication:** Required (Bearer token)

**Request Body:** None

**Response:**

```json
{
  "status": "success",
  "message": "Verification status retrieved",
  "data": {
    "verified": true,
    "message": "Email is verified"
  }
}
```

Or if not verified:

```json
{
  "status": "success",
  "message": "Verification status retrieved",
  "data": {
    "verified": false,
    "message": "Email is not verified"
  }
}
```

---

### 4. Resend OTP

**Endpoint:** `POST /api/auth/verify-email/resend`

**Authentication:** Required (Bearer token)

**Request Body:**

```json
{}
```

**Response:** Same as Request Email Verification OTP endpoint

**Note:** Automatically revokes previous OTP tokens when a new one is requested.

---

## Flow Diagram

```
1. User registers
   └─> email: is_verified = FALSE

2. User requests email verification
   └─> POST /api/auth/verify-email/request
   └─> Server creates OTP (6 digits)
   └─> Server stores OTP in verification_tokens table
   └─> OTP expires in 15 minutes
   └─> Response returns OTP (dev mode only)

3. User receives OTP in email (production)
   └─> OTP valid for 15 minutes
   └─> User can request new OTP (revokes old ones)

4. User submits OTP
   └─> POST /api/auth/verify-email
   └─> Server validates OTP (exists, not expired, not revoked)
   └─> Server marks token as revoked
   └─> Server updates user: is_verified = TRUE
   └─> Response confirms verification

5. User checks verification status
   └─> GET /api/auth/verify-email/status
   └─> Response shows verified: true
```

## OTP Specifications

- **Length:** Exactly 6 digits
- **Format:** Numeric only (0-9)
- **Validity:** 15 minutes from creation
- **Generation:** Cryptographically random
- **One-time use:** Token is revoked after successful verification
- **Previous tokens:** Revoked when new OTP is requested

## Security Considerations

1. **OTP Expiration:** All OTPs expire after 15 minutes
2. **One-Time Use:** Token is revoked after successful verification
3. **Rate Limiting:** (Should be implemented) Limit OTP requests per user
4. **Email Sending:** (TODO) Implement actual email sending service
5. **Development Mode:** OTP is returned in response (dev only, remove in production)
6. **Token Storage:** OTPs are stored hashed in production (TODO)

## Implementation Notes

### Database Queries

**Create OTP Token:**

```sql
INSERT INTO verification_tokens (id, token, scope, issued_for, expires_at, metadata)
VALUES (?, ?, 'email_verification', ?, ?, ?)
```

**Verify OTP:**

```sql
SELECT * FROM verification_tokens
WHERE issued_for = ?
  AND scope = 'email_verification'
  AND token = ?
  AND revoked = 0
  AND expires_at > NOW()
LIMIT 1
```

**Mark Verified:**

```sql
UPDATE users SET is_verified = 1 WHERE id = ?
UPDATE verification_tokens SET revoked = 1 WHERE id = ?
```

### Service Functions

- `generateOTP()` - Generates 6-digit random OTP
- `createEmailVerificationToken(userId)` - Creates OTP token in database
- `verifyEmailOTP(userId, otp)` - Validates and processes OTP
- `revokeEmailVerificationTokens(userId)` - Revokes all pending tokens
- `isEmailVerified(userId)` - Checks email verification status
- `getPendingOTPToken(userId)` - Retrieves pending OTP (dev only)

## Future Enhancements

1. **Email Service Integration** - Send OTP via email/SMS
2. **Rate Limiting** - Limit OTP requests (e.g., 5 per hour)
3. **Token Hashing** - Hash OTP in database for security
4. **Audit Logging** - Log verification attempts
5. **Email Change Flow** - Allow users to change email with re-verification
6. **Multiple Verification Methods** - Add SMS, authenticator app options
7. **Biometric Verification** - Add fingerprint/face ID options
