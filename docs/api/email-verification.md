# Email Verification

Endpoints to manage OTP-based email verification. All routes require an authenticated user (`Authorization: Bearer <accessToken>`).

---

## Request Verification OTP

- **Route:** `POST /auth/verify-email/request`
- **Auth:** Required
- **Body:** none

Sends a 6-digit OTP to the user's registered email. OTP expires in 15 minutes.

### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "Verification OTP sent",
  "data": {
    "email": "jo***@example.com",
    "expires_in_minutes": 15
  }
}
```

### Error Responses

- 429 Too Many Requests (rate limited)
- 500 Internal Server Error

---

## Verify Email with OTP

- **Route:** `POST /auth/verify-email`
- **Auth:** Required

### Request Body

```json
{
  "otp": "123456"
}
```

### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "Email verified",
  "data": {
    "is_verified": true
  }
}
```

### Error Responses

- 400 Bad Request (invalid format)
- 401 Unauthorized (not logged in)
- 404 Not Found (no active OTP)
- 410 Gone (OTP expired)
- 422 Unprocessable Entity (incorrect OTP)
- 500 Internal Server Error

---

## Check Verification Status

- **Route:** `GET /auth/verify-email/status`
- **Auth:** Required
- **Body:** none

### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "Verification status",
  "data": {
    "is_verified": false
  }
}
```

---

## Resend Verification OTP

- **Route:** `POST /auth/verify-email/resend`
- **Auth:** Required
- **Body:** none

Revokes any existing OTP and sends a new one. Subject to rate limits.

### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "New OTP sent",
  "data": {
    "email": "jo***@example.com",
    "expires_in_minutes": 15
  }
}
```

---

## Notes

- OTP length: 6 digits
- OTP TTL: 15 minutes
- Single-use: Once verified, the OTP is revoked
- Multiple requests: Previous OTPs are revoked on resend
- Rate limiting: Excessive requests may be throttled
