# Authentication Flow

Complete documentation for user authentication, registration, and session management.

---

## 1. User Registration

**Name:** Create New User Account

**Description:** Registers a new user in the SyncNexa Identity platform. This endpoint validates user information, hashes the password securely, creates a user account, and initializes the user's profile progress tracking. Upon successful registration, the user receives their account details (excluding sensitive information like password hash).

**Route:** `POST /auth/register`

**Authentication Required:** No

### Request Payload

#### Basic Registration (Visitor/Staff/Developer)

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecureP@ss123",
  "role": "staff",
  "country": "Nigeria",
  "state": "Lagos",
  "address": "123 Main Street, Ikeja",
  "gender": "male",
  "phone": "+2348012345678"
}
```

#### Student Registration

```json
{
  "firstName": "Ada",
  "lastName": "Obi",
  "email": "ada.obi@example.com",
  "password": "SecureP@ss123",
  "role": "student",
  "country": "Nigeria",
  "state": "Imo",
  "address": "FUTO Campus Road",
  "gender": "female",
  "phone": "+2348012345678",
  "academic_info": {
    "institution": "FUTO_NG",
    "matric_number": "20201230342",
    "program": "B.Tech",
    "department": "Information Technology",
    "faculty": "SICT",
    "admission_year": 2021,
    "student_level": "300",
    "graduation_year": 2025
  }
}
```

### Payload Field Requirements

| Field     | Type   | Required | Validation Rules                                                     |
| --------- | ------ | -------- | -------------------------------------------------------------------- |
| firstName | string | Yes      | Minimum 2 characters                                                 |
| lastName  | string | Yes      | Minimum 2 characters                                                 |
| email     | string | Yes      | Valid email format                                                   |
| password  | string | Yes      | Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character |
| role      | string | Yes      | Enum: "student", "staff", "developer"                                |
| country   | string | Yes      | 2-56 characters, letters and spaces only                             |
| state     | string | Yes      | 2-50 characters, letters, spaces, or hyphens                         |
| address   | string | Yes      | 5-100 characters, alphanumeric and .,#-/ allowed                     |
| gender    | string | Yes      | Enum: "male", "female", "non-binary", "other"                        |
| phone     | string | Yes      | E.164 format (e.g., +2348012345678), 8-15 digits                     |

### Student-Specific Required Fields (inside academic_info)

| Field                         | Type   | Required for Students | Validation Rules                                |
| ----------------------------- | ------ | --------------------- | ----------------------------------------------- |
| academic_info.institution     | string | Yes                   | Valid institution code (e.g., FUTO_NG, IMSU_NG) |
| academic_info.matric_number   | string | Yes                   | Minimum 2 characters                            |
| academic_info.program         | string | Yes                   | Degree type (e.g., B.Tech, B.Sc, B.Eng, MBA)    |
| academic_info.department      | string | No                    | Minimum 2 characters                            |
| academic_info.faculty         | string | No                    | Valid faculty code for the institution          |
| academic_info.admission_year  | number | Yes                   | Integer between 1900 and current year           |
| academic_info.student_level   | string | No                    | Student's current level (e.g., 100, 200, 300)   |
| academic_info.graduation_year | number | Yes                   | Integer between 1900 and current year + 10      |

### Success Response (201 Created)

#### Non-Student Registration Response

```json
{
  "status": "success",
  "statusCode": 201,
  "message": "User created successfully!",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.doe@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "user_country": "Nigeria",
    "user_state": "Lagos",
    "user_address": "123 Main Street, Ikeja",
    "gender": "male",
    "phone": "+2348012345678",
    "user_role": "staff",
    "is_verified": false,
    "account_status": "active"
  }
}
```

#### Student Registration Response

```json
{
  "status": "success",
  "statusCode": 201,
  "message": "User created successfully!",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.doe@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "user_country": "Nigeria",
    "user_state": "Lagos",
    "user_address": "123 Main Street, Ikeja",
    "gender": "male",
    "phone": "+2348012345678",
    "user_role": "student",
    "is_verified": false,
    "account_status": "active",
    "institution": "Federal University of Technology, Owerri",
    "institution_code": "FUTO_NG",
    "faculty": "School of Information and Communication Technology",
    "faculty_code": "SICT"
  }
}
```

**Note:** For student registrations, the response is enriched with full institution and faculty names derived from the provided codes.

### Error Responses

#### 400 Bad Request - Missing Required Field

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

**What Happens:** The request is rejected before reaching the database. No user account is created. The response includes all validation errors found in the payload.

**Common Validation Errors:**

- **firstName/lastName too short:** "First name must be at least 2 characters long"
- **Invalid email:** "Invalid email address"
- **Weak password:**
  - "Password must be at least 8 characters long"
  - "Password must contain at least one uppercase letter"
  - "Password must contain at least one lowercase letter"
  - "Password must contain at least one number"
  - "Password must contain at least one special character"
- **Invalid role:** 'Invalid role. Supported roles are: "student", "staff", or "developer"'
- **Invalid country:** "Country must contain only letters and spaces"
- **Invalid state:** "State must contain only letters, spaces, or hyphens"
- **Invalid address:** "Address contains invalid characters"
- **Invalid phone:** "Invalid phone number format (use E.164, e.g. +2348012345678)"
- **Invalid gender:** "Invalid enum value. Expected 'male' | 'female' | 'non-binary' | 'other'"
- **Missing student fields:** "Institution and matric_number are required in academic_info for student registration"
- **Missing program:** "Program (degree) is required in academic_info for student registration"
- **Invalid program:** "Program is not in the allowed list of degree types"
- **Invalid institution:** "Invalid institution code. Please use institution codes like FUTO_NG, IMSU_NG, etc."
- **Invalid faculty:** "Faculty code is not valid for the selected institution"

#### 409 Conflict - Email Already Exists

```json
{
  "status": "error",
  "statusCode": 409,
  "message": "Email address is already registered. Please use a different email or login instead."
}
```

**What Happens:** The email is already registered in the system. No duplicate account is created. The existing account remains unchanged. User should try logging in instead or use a different email address.

#### 409 Conflict - Matric Number Already Exists (Students Only)

```json
{
  "status": "error",
  "statusCode": 409,
  "message": "This matric number is already registered. Each student can only have one account."
}
```

**What Happens:** The matric number is already registered in the system. This security measure prevents students from creating multiple accounts with different email addresses. Each student is limited to one account per matric number. The user should use their existing account or contact support if they believe this is an error.

#### 500 Internal Server Error

```json
{
  "status": "error",
  "statusCode": 500,
  "message": "Could not create account, please try again."
}
```

**What Happens:** An unexpected error occurred during account creation (database connection issue, server error, etc.). No user account is created. User should retry the request after a brief delay.

---

## 2. User Login

**Name:** Authenticate User

**Description:** Authenticates a user with email and password credentials. Upon successful authentication, the system generates an access token (JWT with 15-minute expiration) and a refresh token (valid for 7 days). The access token is used for subsequent API requests, while the refresh token is used to obtain new access tokens without re-authenticating.

**Route:** `POST /auth/login`

**Authentication Required:** No

### Request Payload

```json
{
  "email": "john.doe@example.com",
  "password": "SecureP@ss123"
}
```

### Payload Field Requirements

| Field    | Type   | Required | Description                                              |
| -------- | ------ | -------- | -------------------------------------------------------- |
| email    | string | Yes      | User's registered email address                          |
| password | string | Yes      | User's password (plain text, will be hashed server-side) |

### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Login successful!",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwMCIsImVtYWlsIjoiam9obi5kb2VAZXhhbXBsZS5jb20iLCJyb2xlIjoidmlzaXRvciIsImlhdCI6MTY0MjAwMDAwMCwiZXhwIjoxNjQyMDA5MDAwfQ.signature",
    "refreshToken": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
    "role": "visitor"
  }
}
```

### Token Details

**Access Token (JWT):**

- **Expiration:** 15 minutes
- **Usage:** Include in Authorization header as `Bearer <token>` for authenticated requests
- **Payload Contains:** User ID, email, and role

**Refresh Token:**

- **Expiration:** 7 days
- **Usage:** Use to obtain new access tokens via `/auth/refresh-token` endpoint
- **Storage:** Store securely (httpOnly cookie recommended for web apps)

### Error Responses

#### 400 Bad Request - Missing Credentials

```json
{
  "message": "Email and password required"
}
```

**What Happens:** The request is missing email or password fields. No authentication attempt is made. User must provide both credentials.

#### 401 Unauthorized - Invalid Credentials

```json
{
  "message": "Invalid credentials"
}
```

**What Happens:** The email doesn't exist in the system, or the password doesn't match the stored hash. This response is intentionally vague to prevent user enumeration attacks. No tokens are generated. User should verify their credentials and try again.

#### 500 Internal Server Error

```json
{
  "status": "error",
  "statusCode": 500,
  "message": "Login failed"
}
```

**What Happens:** An unexpected server error occurred during authentication (database connection issue, token generation failure, etc.). No tokens are generated. User should retry the request after a brief delay.

---

## 3. Refresh Access Token

**Name:** Refresh Access Token

**Description:** Generates a new access token using a valid refresh token. This allows users to maintain their session without re-entering credentials. The refresh token must be valid and not expired. This endpoint does not generate a new refresh token; the existing refresh token remains valid.

**Route:** `POST /auth/refresh-token`

**Authentication Required:** No (but requires valid refresh token)

### Request Payload

```json
{
  "refreshToken": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"
}
```

### Payload Field Requirements

| Field        | Type   | Required | Description                                                 |
| ------------ | ------ | -------- | ----------------------------------------------------------- |
| refreshToken | string | Yes      | Valid refresh token obtained from login or previous refresh |

### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Access token refreshed!",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwMCIsImVtYWlsIjoiam9obi5kb2VAZXhhbXBsZS5jb20iLCJyb2xlIjoidmlzaXRvciIsImlhdCI6MTY0MjAwMTAwMCwiZXhwIjoxNjQyMDEwMDAwfQ.new_signature"
  }
}
```

### Error Responses

#### 400 Bad Request - Missing Refresh Token

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Refresh token required"
}
```

**What Happens:** The request body doesn't contain a refresh token. No new access token is generated. User must provide the refresh token from their login response.

#### 401 Unauthorized - Invalid or Expired Token

```json
{
  "status": "error",
  "statusCode": 401,
  "message": "Invalid or expired refresh token"
}
```

**What Happens:** The refresh token is not found in the database, has expired, or has been revoked. No new access token is generated. User must log in again to obtain new tokens.

#### 401 Unauthorized - User Not Found

```json
{
  "status": "error",
  "statusCode": 401,
  "message": "User not found"
}
```

**What Happens:** The user associated with the refresh token no longer exists (account deleted). No new access token is generated. User must create a new account if needed.

#### 500 Internal Server Error

```json
{
  "status": "error",
  "statusCode": 500,
  "message": "Token refresh failed"
}
```

**What Happens:** An unexpected server error occurred during token refresh. No new access token is generated. User should retry or log in again if the issue persists.

---

## 4. User Logout

**Name:** Logout User

**Description:** Invalidates the user's refresh token, effectively logging them out. The access token remains valid until its expiration (15 minutes), but no new access tokens can be generated with the invalidated refresh token. For complete logout, the client should also discard the access token locally.

**Route:** `POST /auth/logout`

**Authentication Required:** No (but requires refresh token to revoke)

### Request Payload

```json
{
  "refreshToken": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"
}
```

### Payload Field Requirements

| Field        | Type   | Required | Description                     |
| ------------ | ------ | -------- | ------------------------------- |
| refreshToken | string | Yes      | The refresh token to invalidate |

### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Logged out successfully",
  "data": null
}
```

**What Happens:** The refresh token is deleted from the database. The user's access token remains valid until expiration but cannot be renewed. The client should discard both tokens locally.

### Error Responses

#### 400 Bad Request - Missing Refresh Token

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Refresh token required"
}
```

**What Happens:** The request body doesn't contain a refresh token. No logout action is performed. User should provide the refresh token.

**Note:** If an invalid or non-existent refresh token is provided, the endpoint still returns success (200) since the goal of logout is achieved (the token is not usable). This prevents information disclosure about token validity.

---

## 5. Email Verification

After registration, users should verify their email to unlock student and staff features. Verification is OTP-based and requires authentication.

### Steps

1. Request OTP: `POST /auth/verify-email/request`

- Sends a 6-digit OTP to the user's email
- OTP expires in 15 minutes

2. Verify OTP: `POST /auth/verify-email`

- Body: `{ "otp": "123456" }`
- Marks the account `is_verified = true` on success

3. Check Status: `GET /auth/verify-email/status`

- Returns `{ is_verified: boolean }`

4. Resend OTP: `POST /auth/verify-email/resend`

- Revokes any existing OTP and sends a new one

### Error Cases

- 404: No active OTP for user
- 410: OTP expired – request or resend a new OTP
- 422: Incorrect OTP – verify and try again
- 429: Too many requests – wait and retry

---

## Authentication Flow Diagram

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ 1. POST /auth/register
       │    (firstName, lastName, email, password, etc.)
       ▼
┌─────────────────────────────────────┐
│  Validate Request                   │
│  - Check all required fields        │
│  - Validate email format            │
│  - Validate password strength       │
│  - Validate phone format (E.164)    │
└──────┬──────────────────────────────┘
       │
       │ 2. Check Email Uniqueness
       ▼
┌─────────────────────────────────────┐
│  Email exists? → 409 Conflict       │
│  Email unique? → Continue           │
└──────┬──────────────────────────────┘
       │
       │ 3. Hash Password & Create User
       ▼
┌─────────────────────────────────────┐
│  - Generate UUID for user           │
│  - Hash password (bcrypt)           │
│  - Insert user into database        │
│  - Initialize profile_progress      │
└──────┬──────────────────────────────┘
       │
       │ 4. Return User Data
       ▼
┌─────────────┐
│ 201 Created │
│ User Object │
└─────────────┘

       │
       │ 5. POST /auth/login
       │    (email, password)
       ▼
┌─────────────────────────────────────┐
│  Authenticate User                  │
│  - Find user by email               │
│  - Compare password hash            │
└──────┬──────────────────────────────┘
       │
       │ Invalid? → 401 Unauthorized
       │ Valid? → Continue
       ▼
┌─────────────────────────────────────┐
│  Generate Tokens                    │
│  - Access Token (JWT, 15min)        │
│  - Refresh Token (UUID, 7 days)     │
│  - Store refresh token in DB        │
└──────┬──────────────────────────────┘
       │
       │ 6. Return Tokens
       ▼
┌─────────────┐
│  200 OK     │
│  Tokens +   │
│  User Role  │
└─────────────┘

       │
       │ 7. Use Access Token for API Requests
       │    Authorization: Bearer <accessToken>
       ▼
┌─────────────────────────────────────┐
│  Protected Endpoint                 │
│  - Verify JWT signature             │
│  - Check expiration                 │
│  - Extract user info from token     │
└─────────────────────────────────────┘

       │
       │ 8. Access Token Expired?
       │    POST /auth/refresh-token
       │    (refreshToken)
       ▼
┌─────────────────────────────────────┐
│  Refresh Token Flow                 │
│  - Validate refresh token           │
│  - Check expiration (7 days)        │
│  - Generate new access token        │
└──────┬──────────────────────────────┘
       │
       │ 9. Return New Access Token
       ▼
┌─────────────┐
│  200 OK     │
│  New Access │
│  Token      │
└─────────────┘

       │
       │ 10. POST /auth/logout
       │     (refreshToken)
       ▼
┌─────────────────────────────────────┐
│  Logout                             │
│  - Delete refresh token from DB     │
│  - Client discards all tokens       │
└──────┬──────────────────────────────┘
       │
       │ 11. Session Ended
       ▼
┌─────────────┐
│  200 OK     │
│  Logged Out │
└─────────────┘
```

---

## Best Practices

### For Client Applications

1. **Store Tokens Securely:**
   - Use httpOnly cookies for web applications
   - Use secure storage (Keychain/Keystore) for mobile apps
   - Never store tokens in localStorage in web apps

2. **Token Refresh Strategy:**
   - Implement automatic token refresh when receiving 401 responses
   - Refresh tokens proactively before expiration (e.g., at 14 minutes)
   - Handle refresh token expiration gracefully by redirecting to login

3. **Error Handling:**
   - Display user-friendly error messages
   - Log detailed errors for debugging
   - Implement retry logic for network failures

4. **Password Requirements:**
   - Display password requirements clearly during registration
   - Implement client-side validation to provide immediate feedback
   - Use password strength indicators

### For Security

1. **Always use HTTPS** for all authentication requests
2. **Implement rate limiting** on login and registration endpoints
3. **Use CORS policies** to restrict API access
4. **Validate tokens** on every protected endpoint
5. **Rotate refresh tokens** periodically (future enhancement)
6. **Implement MFA** for sensitive operations (see Session Management docs)

---

## Related Documentation

- [Session Management Flow](./session-management.md)
- [OAuth 2.0 Flow](./oauth-flow.md)
- [User Management Flow](./user-management.md)
- [API Security Best Practices](../security/best-practices.md)
