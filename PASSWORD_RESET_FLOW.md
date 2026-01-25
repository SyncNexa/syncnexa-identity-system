# Password Reset Flow Implementation

## Overview

Added a complete password reset flow using the existing OTP (One-Time Password) verification infrastructure. The flow leverages the `verification_tokens` table with a new `password_reset` scope.

## Components Created

### 1. **Validator** - [src/validators/passwordReset.validator.ts](src/validators/passwordReset.validator.ts)

- `requestPasswordResetSchema`: Validates email for forgot password request
- `verifyPasswordResetOTPSchema`: Validates email and OTP for verification
- `resetPasswordSchema`: Validates email, OTP, new password, and password confirmation

### 2. **Model** - [src/models/passwordReset.model.ts](src/models/passwordReset.model.ts)

- `createPasswordResetToken()`: Creates a 6-digit OTP token with 15-minute expiry
- `findPasswordResetToken()`: Finds a valid, non-revoked OTP for a user
- `revokePasswordResetToken()`: Revokes a single token
- `revokeAllPasswordResetTokens()`: Revokes all password reset tokens for a user
- `hasPendingPasswordResetToken()`: Checks if user has active reset tokens

**Database**: Reuses `verification_tokens` table with `scope='password_reset'`

### 3. **Service** - [src/services/passwordReset.service.ts](src/services/passwordReset.service.ts)

- `requestPasswordReset()`: Generates OTP and sends to email (production)
- `verifyPasswordResetOTP()`: Validates OTP and returns token ID
- `resetPassword()`: Updates password, verifies OTP, and revokes tokens
- `getPendingPasswordResetToken()`: For testing purposes only

**Security**: Uses bcrypt for password hashing with 10 salt rounds

### 4. **Controller** - [src/controllers/passwordReset.controller.ts](src/controllers/passwordReset.controller.ts)

- `requestPasswordReset()`: Public endpoint - request password reset
- `verifyPasswordResetOTP()`: Public endpoint - verify OTP validity
- `resetPassword()`: Public endpoint - reset password with OTP

**Features**:

- Email enumeration protection (always returns success even if email doesn't exist)
- Development mode: Returns OTP for testing
- Production mode: Confirms OTP was sent without revealing email existence

### 5. **Auth Service Update** - [src/services/auth.service.ts](src/services/auth.service.ts)

- Added `getUserByEmail()`: Helper to retrieve user by email

### 6. **User Model Update** - [src/models/user.model.ts](src/models/user.model.ts)

- Added `updateUserPassword()`: Updates user password hash with transaction support

### 7. **Routes** - [src/routes/auth.route.ts](src/routes/auth.route.ts)

Three new public endpoints:

- `POST /auth/forgot-password` - Request password reset OTP
- `POST /auth/verify-password-reset-otp` - Verify OTP validity
- `POST /auth/reset-password` - Reset password with OTP and new password

## API Usage

### Step 1: Request Password Reset

```bash
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response (Development)**:

```json
{
  "statusCode": 200,
  "message": "OTP sent to your email (check response in dev)",
  "data": {
    "otp": "123456",
    "expiresIn": "15 minutes",
    "tokenId": "uuid"
  }
}
```

**Response (Production)**:

```json
{
  "statusCode": 200,
  "message": "OTP sent to your email",
  "data": {
    "expiresIn": "15 minutes",
    "message": "If an account exists with this email, you will receive a verification code"
  }
}
```

### Step 2: Verify OTP (Optional - for UX feedback)

```bash
POST /auth/verify-password-reset-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response**:

```json
{
  "statusCode": 200,
  "message": "OTP verified successfully",
  "data": {
    "verified": true,
    "message": "You can now reset your password",
    "userId": "uuid"
  }
}
```

### Step 3: Reset Password

```bash
POST /auth/reset-password
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

**Response**:

```json
{
  "statusCode": 200,
  "message": "Password reset successfully",
  "data": {
    "success": true,
    "message": "Your password has been reset. Please login with your new password"
  }
}
```

## Features

✅ Uses existing OTP verification infrastructure  
✅ 6-digit OTP with 15-minute expiration  
✅ Email enumeration protection  
✅ Password complexity validation (8+ chars, uppercase, lowercase, number, special char)  
✅ Password confirmation matching  
✅ Secure password hashing with bcrypt  
✅ Automatic token revocation after successful reset  
✅ Development mode for testing  
✅ Transaction-based password updates

## Security Considerations

- OTP tokens are one-time use (revoked immediately after successful reset)
- All password reset tokens for a user are revoked after successful reset
- Passwords meet complexity requirements
- Email addresses are not revealed during password reset flow
- Database queries use parameterized statements to prevent SQL injection
- Password hashing uses bcrypt with 10 rounds
