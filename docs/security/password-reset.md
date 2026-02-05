# Password Reset

Comprehensive password reset flow using One-Time Password (OTP) verification for secure account recovery.

---

## Overview

The password reset feature allows users to securely reset their account password when they've forgotten it or want to change it for security reasons. The system uses a 6-digit OTP sent via email, with a 15-minute expiration window to ensure security.

**Key Features:**

- Email-based OTP verification
- 6-digit one-time passwords
- 15-minute expiration window
- Email enumeration protection
- Password complexity requirements
- Automatic token revocation
- Development mode for testing

---

## Use Cases

| Use Case           | Description                                                      |
| ------------------ | ---------------------------------------------------------------- |
| Forgotten Password | User can't remember their password and needs to reset it         |
| Security Breach    | User suspects account compromise and wants to change password    |
| Scheduled Update   | User wants to update password as part of security best practices |
| First-Time Setup   | New user wants to set their own password after admin creation    |

---

## Password Reset Flow

### Step 1: Request Password Reset

**Endpoint:** `POST /auth/forgot-password`

**Description:** Initiates the password reset process by sending a 6-digit OTP to the user's email address. For security, the response doesn't reveal whether the email exists in the system (email enumeration protection).

**Request Body:**

```json
{
  "email": "student@university.edu"
}
```

**Request Fields:**

| Field | Type   | Required | Description                            |
| ----- | ------ | -------- | -------------------------------------- |
| email | string | Yes      | Valid email address (format validated) |

**Success Response (Production):**

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "OTP sent to your email",
  "data": {
    "expiresIn": "15 minutes",
    "message": "If an account exists with this email, you will receive a verification code"
  }
}
```

**Success Response (Development Mode):**

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "OTP sent to your email (check response in dev)",
  "data": {
    "otp": "123456",
    "expiresIn": "15 minutes",
    "tokenId": "a1b2c3d4-e5f6-4g7h-8i9j-k0l1m2n3o4p5"
  }
}
```

**Error Responses:**

| Status Code | Error                | What Happens                                  |
| ----------- | -------------------- | --------------------------------------------- |
| 400         | Invalid email format | Request rejected - email must be valid format |
| 429         | Too many requests    | Rate limit exceeded - wait before retrying    |
| 500         | Server error         | Internal error - contact support if persists  |

**Example Request (JavaScript):**

```javascript
const response = await fetch(
  "https://identity.syncnexa.com/api/v1/auth/forgot-password",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: "student@university.edu",
    }),
  },
);

const result = await response.json();
console.log("OTP sent:", result.data.expiresIn);

// In development mode only
if (result.data.otp) {
  console.log("Test OTP:", result.data.otp);
}
```

**Example Request (cURL):**

```bash
curl -X POST 'https://identity.syncnexa.com/api/v1/auth/forgot-password' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "student@university.edu"
  }'
```

**Example Request (Python):**

```python
import requests

response = requests.post(
    'https://identity.syncnexa.com/api/v1/auth/forgot-password',
    json={'email': 'student@university.edu'}
)

result = response.json()
print(f"OTP expires in: {result['data']['expiresIn']}")

# In development mode only
if 'otp' in result['data']:
    print(f"Test OTP: {result['data']['otp']}")
```

---

### Step 2: Verify Password Reset OTP (Optional)

**Endpoint:** `POST /auth/verify-password-reset-otp`

**Description:** Optional step to verify the OTP before actually resetting the password. Useful for providing immediate feedback to users about OTP validity before they enter their new password.

**Request Body:**

```json
{
  "email": "student@university.edu",
  "otp": "123456"
}
```

**Request Fields:**

| Field | Type   | Required | Description                                   |
| ----- | ------ | -------- | --------------------------------------------- |
| email | string | Yes      | Email address used in forgot password request |
| otp   | string | Yes      | 6-digit OTP received via email                |

**Success Response:**

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "OTP verified successfully",
  "data": {
    "verified": true,
    "message": "You can now reset your password",
    "userId": "a1b2c3d4-e5f6-4g7h-8i9j-k0l1m2n3o4p5"
  }
}
```

**Error Responses:**

| Status Code | Error                  | What Happens                                   |
| ----------- | ---------------------- | ---------------------------------------------- |
| 400         | Invalid OTP format     | OTP must be 6 digits                           |
| 401         | Invalid or expired OTP | OTP is incorrect or has expired (15 min limit) |
| 404         | User not found         | No account with this email exists              |
| 500         | Server error           | Internal error - contact support if persists   |

**Example Request (JavaScript):**

```javascript
const response = await fetch(
  "https://identity.syncnexa.com/api/v1/auth/verify-password-reset-otp",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: "student@university.edu",
      otp: "123456",
    }),
  },
);

const result = await response.json();
if (result.data.verified) {
  console.log("OTP is valid! Proceed to reset password.");
}
```

**Example Request (cURL):**

```bash
curl -X POST 'https://identity.syncnexa.com/api/v1/auth/verify-password-reset-otp' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "student@university.edu",
    "otp": "123456"
  }'
```

**Example Request (Python):**

```python
import requests

response = requests.post(
    'https://identity.syncnexa.com/api/v1/auth/verify-password-reset-otp',
    json={
        'email': 'student@university.edu',
        'otp': '123456'
    }
)

result = response.json()
if result['data']['verified']:
    print('OTP is valid! Proceed to reset password.')
```

---

### Step 3: Reset Password

**Endpoint:** `POST /auth/reset-password`

**Description:** Completes the password reset process by verifying the OTP and updating the user's password. All existing password reset tokens for the user are automatically revoked after a successful reset.

**Request Body:**

```json
{
  "email": "student@university.edu",
  "otp": "123456",
  "newPassword": "NewSecureP@ss123",
  "confirmPassword": "NewSecureP@ss123"
}
```

**Request Fields:**

| Field           | Type   | Required | Description                                      |
| --------------- | ------ | -------- | ------------------------------------------------ |
| email           | string | Yes      | Email address used in forgot password request    |
| otp             | string | Yes      | 6-digit OTP received via email                   |
| newPassword     | string | Yes      | New password (must meet complexity requirements) |
| confirmPassword | string | Yes      | Must match newPassword exactly                   |

**Password Requirements:**

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (!@#$%^&\*()\_+-=[]{}|;:,.<>?)

**Success Response:**

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Password reset successfully",
  "data": {
    "success": true,
    "message": "Your password has been reset. Please login with your new password"
  }
}
```

**Error Responses:**

| Status Code | Error                              | What Happens                                      |
| ----------- | ---------------------------------- | ------------------------------------------------- |
| 400         | Passwords don't match              | newPassword and confirmPassword must be identical |
| 400         | Password doesn't meet requirements | Password fails complexity validation              |
| 401         | Invalid or expired OTP             | OTP is incorrect or has expired                   |
| 404         | User not found                     | No account with this email exists                 |
| 500         | Server error                       | Internal error - contact support if persists      |

**Example Request (JavaScript):**

```javascript
const response = await fetch(
  "https://identity.syncnexa.com/api/v1/auth/reset-password",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: "student@university.edu",
      otp: "123456",
      newPassword: "NewSecureP@ss123",
      confirmPassword: "NewSecureP@ss123",
    }),
  },
);

const result = await response.json();
if (result.data.success) {
  console.log("Password reset successful! Please log in.");
  // Redirect to login page
  window.location.href = "/login";
}
```

**Example Request (cURL):**

```bash
curl -X POST 'https://identity.syncnexa.com/api/v1/auth/reset-password' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "student@university.edu",
    "otp": "123456",
    "newPassword": "NewSecureP@ss123",
    "confirmPassword": "NewSecureP@ss123"
  }'
```

**Example Request (Python):**

```python
import requests

response = requests.post(
    'https://identity.syncnexa.com/api/v1/auth/reset-password',
    json={
        'email': 'student@university.edu',
        'otp': '123456',
        'newPassword': 'NewSecureP@ss123',
        'confirmPassword': 'NewSecureP@ss123'
    }
)

result = response.json()
if result['data']['success']:
    print('Password reset successful! Please log in.')
```

---

## Complete Password Reset Workflow

### JavaScript Implementation

```javascript
class PasswordResetFlow {
  constructor(apiBaseUrl) {
    this.apiBaseUrl = apiBaseUrl;
  }

  // Step 1: Request OTP
  async requestPasswordReset(email) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to request password reset");
      }

      console.log(`✅ OTP sent! Expires in: ${result.data.expiresIn}`);

      // In development, return OTP for testing
      if (result.data.otp) {
        console.log(`🔑 Test OTP: ${result.data.otp}`);
        return { success: true, otp: result.data.otp };
      }

      return { success: true };
    } catch (error) {
      console.error("❌ Request failed:", error.message);
      throw error;
    }
  }

  // Step 2: Verify OTP (optional but recommended)
  async verifyOTP(email, otp) {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/auth/verify-password-reset-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Invalid OTP");
      }

      console.log("✅ OTP verified successfully");
      return { verified: true, userId: result.data.userId };
    } catch (error) {
      console.error("❌ OTP verification failed:", error.message);
      throw error;
    }
  }

  // Step 3: Reset password
  async resetPassword(email, otp, newPassword, confirmPassword) {
    try {
      // Validate passwords match
      if (newPassword !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // Validate password complexity
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]).{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        throw new Error(
          "Password must be at least 8 characters and contain uppercase, lowercase, number, and special character",
        );
      }

      const response = await fetch(`${this.apiBaseUrl}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp,
          newPassword,
          confirmPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to reset password");
      }

      console.log("✅ Password reset successfully!");
      return { success: true };
    } catch (error) {
      console.error("❌ Password reset failed:", error.message);
      throw error;
    }
  }

  // Complete flow
  async completePasswordReset(email, otp, newPassword, confirmPassword) {
    console.log("Starting password reset flow...");

    // Step 1: Request OTP (if not already done)
    // This would typically be done separately by the user

    // Step 2: Verify OTP (optional but recommended for UX)
    await this.verifyOTP(email, otp);

    // Step 3: Reset password
    await this.resetPassword(email, otp, newPassword, confirmPassword);

    console.log("🎉 Password reset complete! You can now log in.");
    return { success: true };
  }
}

// Usage
const resetFlow = new PasswordResetFlow("https://identity.syncnexa.com/api/v1");

// User forgot password
await resetFlow.requestPasswordReset("student@university.edu");

// User receives OTP via email and enters it with new password
await resetFlow.completePasswordReset(
  "student@university.edu",
  "123456",
  "NewSecureP@ss123",
  "NewSecureP@ss123",
);
```

---

## Python Implementation

```python
import requests
import re
from typing import Dict, Optional

class PasswordResetFlow:
    def __init__(self, api_base_url: str):
        self.api_base_url = api_base_url

    def request_password_reset(self, email: str) -> Dict:
        """Step 1: Request OTP"""
        try:
            response = requests.post(
                f'{self.api_base_url}/auth/forgot-password',
                json={'email': email}
            )

            result = response.json()

            if not response.ok:
                raise Exception(result.get('message', 'Failed to request password reset'))

            print(f"✅ OTP sent! Expires in: {result['data']['expiresIn']}")

            # In development, return OTP for testing
            if 'otp' in result['data']:
                print(f"🔑 Test OTP: {result['data']['otp']}")
                return {'success': True, 'otp': result['data']['otp']}

            return {'success': True}
        except Exception as e:
            print(f"❌ Request failed: {e}")
            raise

    def verify_otp(self, email: str, otp: str) -> Dict:
        """Step 2: Verify OTP (optional)"""
        try:
            response = requests.post(
                f'{self.api_base_url}/auth/verify-password-reset-otp',
                json={'email': email, 'otp': otp}
            )

            result = response.json()

            if not response.ok:
                raise Exception(result.get('message', 'Invalid OTP'))

            print('✅ OTP verified successfully')
            return {'verified': True, 'userId': result['data']['userId']}
        except Exception as e:
            print(f"❌ OTP verification failed: {e}")
            raise

    def validate_password(self, password: str) -> bool:
        """Validate password complexity"""
        if len(password) < 8:
            return False

        # Must contain uppercase, lowercase, number, and special character
        has_upper = bool(re.search(r'[A-Z]', password))
        has_lower = bool(re.search(r'[a-z]', password))
        has_digit = bool(re.search(r'\d', password))
        has_special = bool(re.search(r'[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]', password))

        return has_upper and has_lower and has_digit and has_special

    def reset_password(self, email: str, otp: str,
                      new_password: str, confirm_password: str) -> Dict:
        """Step 3: Reset password"""
        try:
            # Validate passwords match
            if new_password != confirm_password:
                raise Exception('Passwords do not match')

            # Validate password complexity
            if not self.validate_password(new_password):
                raise Exception(
                    'Password must be at least 8 characters and contain '
                    'uppercase, lowercase, number, and special character'
                )

            response = requests.post(
                f'{self.api_base_url}/auth/reset-password',
                json={
                    'email': email,
                    'otp': otp,
                    'newPassword': new_password,
                    'confirmPassword': confirm_password
                }
            )

            result = response.json()

            if not response.ok:
                raise Exception(result.get('message', 'Failed to reset password'))

            print('✅ Password reset successfully!')
            return {'success': True}
        except Exception as e:
            print(f"❌ Password reset failed: {e}")
            raise

    def complete_password_reset(self, email: str, otp: str,
                               new_password: str, confirm_password: str) -> Dict:
        """Complete flow"""
        print('Starting password reset flow...')

        # Step 2: Verify OTP (optional but recommended for UX)
        self.verify_otp(email, otp)

        # Step 3: Reset password
        self.reset_password(email, otp, new_password, confirm_password)

        print('🎉 Password reset complete! You can now log in.')
        return {'success': True}


# Usage
reset_flow = PasswordResetFlow('https://identity.syncnexa.com/api/v1')

# User forgot password
reset_flow.request_password_reset('student@university.edu')

# User receives OTP via email and enters it with new password
reset_flow.complete_password_reset(
    'student@university.edu',
    '123456',
    'NewSecureP@ss123',
    'NewSecureP@ss123'
)
```

---

## Edge Cases

| Scenario                | Behavior                                             |
| ----------------------- | ---------------------------------------------------- |
| Email doesn't exist     | Returns success message (prevents email enumeration) |
| OTP expired (>15 min)   | Returns 401 error - user must request new OTP        |
| Invalid OTP format      | Returns 400 error - OTP must be 6 digits             |
| Password too weak       | Returns 400 error with specific requirements         |
| Passwords don't match   | Returns 400 error - must match exactly               |
| Multiple reset requests | Previous OTPs remain valid until expiration          |
| OTP used successfully   | All password reset tokens for user are revoked       |
| Request in progress     | Can request new OTP anytime (previous still valid)   |

---

## Best Practices

### Security

- **Never Store OTPs**: OTPs should never be stored in local storage or cookies
- **Use HTTPS**: Always use HTTPS to prevent OTP interception
- **Rate Limiting**: Implement rate limiting on reset requests
- **Email Enumeration Protection**: Don't reveal if email exists
- **Strong Passwords**: Enforce password complexity requirements
- **Token Revocation**: Revoke all tokens after successful reset

### User Experience

- **Clear Instructions**: Provide clear guidance on each step
- **Expiration Timer**: Show countdown of OTP expiration
- **Resend Option**: Allow users to request new OTP if expired
- **Password Requirements**: Display requirements before input
- **Validation Feedback**: Provide real-time password validation
- **Success Confirmation**: Clearly confirm successful reset

### Error Handling

- **Generic Messages**: Use generic error messages for security
- **Retry Logic**: Implement exponential backoff for retries
- **User Support**: Provide contact information for help
- **Logging**: Log all reset attempts for security monitoring
- **Rate Limits**: Handle rate limit errors gracefully

---

## Security Considerations

### OTP Security

- **6-digit codes**: Balance between security and usability
- **15-minute expiration**: Prevents long-term token abuse
- **One-time use**: Tokens revoked after successful use
- **Rate limiting**: Prevents brute force attacks
- **Secure generation**: Cryptographically secure random generation

### Password Security

- **Bcrypt hashing**: Industry-standard password hashing (10 rounds)
- **Complexity requirements**: Enforces strong passwords
- **No password reuse**: Can reuse old passwords (consider implementing history check)
- **Secure transmission**: Always use HTTPS
- **No logging**: Passwords never logged or stored in plain text

### Email Security

- **SPF/DKIM**: Configure proper email authentication
- **Secure links**: Use HTTPS for all links in emails
- **Brand consistency**: Use official branding to prevent phishing
- **Clear sender**: Use recognizable sender address
- **Expiration notice**: Clearly state OTP expiration time

---

## Troubleshooting

### Common Issues

| Issue             | Possible Cause            | Solution                                 |
| ----------------- | ------------------------- | ---------------------------------------- |
| OTP not received  | Email in spam/junk        | Check spam folder, whitelist sender      |
| OTP expired       | Took >15 minutes          | Request new OTP                          |
| Invalid OTP error | Wrong code entered        | Double-check code, request new if needed |
| Password rejected | Doesn't meet requirements | Check requirements and try again         |
| Rate limit error  | Too many requests         | Wait 5-10 minutes and try again          |

---

## Related Documentation

- **[User Login](/docs/authentication/user-login)** - Login with new password
- **[Session Management](/docs/security/session-management)** - Manage active sessions
- **[MFA Setup](/docs/security/mfa)** - Enable two-factor authentication
- **[Email Verification](/docs/authentication/email-verification)** - Verify email address
