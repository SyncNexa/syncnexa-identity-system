# Email Verification

Complete documentation for verifying user email addresses using OTP.

---

## Overview

Email verification is a multi-step process where users prove they own the email address they provided during registration. The system uses time-limited One-Time Passwords (OTPs) delivered via email. Email verification unlocks student and staff features and is required for full platform access.

**Use Cases:**

- Verify email after registration
- Resend OTP if expired or not received
- Check verification status
- Enable verified-only features

**Authentication:** Required - user must have access token

---

## Request Email Verification OTP

**Name:** Request Email Verification OTP

**Description:** Sends a 6-digit OTP to the user's registered email address. The OTP is valid for 15 minutes and can be used to complete email verification. If a previous OTP exists and hasn't expired, it's revoked and a new one is issued. This endpoint is rate-limited to prevent email flooding.

**Route:** `POST /auth/verify-email/request`

**Authentication Required:** Yes (Bearer token)

### Request Payload

```json
{
  "email": "john.doe@example.com"
}
```

### Field Requirements

| Field | Type   | Required | Description                                                      |
| ----- | ------ | -------- | ---------------------------------------------------------------- |
| email | string | No       | Email to verify (defaults to user's registered email if omitted) |

### Request Example (JavaScript)

```javascript
async function requestEmailOTP(accessToken, email = null) {
  try {
    const payload = {};
    if (email) {
      payload.email = email;
    }

    const response = await fetch(
      "https://identity.syncnexa.com/api/v1/auth/verify-email/request",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("OTP request failed:", result.message);
      return null;
    }

    console.log("OTP sent to email");
    return {
      email: result.data.email,
      expiresIn: result.data.expires_in, // seconds
    };
  } catch (error) {
    console.error("Network error:", error);
    return null;
  }
}

// Usage
const otpInfo = await requestEmailOTP(accessToken);

if (otpInfo) {
  console.log(`OTP sent to ${otpInfo.email}`);
  console.log(`Expires in ${otpInfo.expiresIn} seconds`);
}
```

### Request Example (cURL)

```bash
# Request OTP for registered email
curl -X POST https://identity.syncnexa.com/api/v1/auth/verify-email/request \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"

# Request OTP for different email
curl -X POST https://identity.syncnexa.com/api/v1/auth/verify-email/request \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newemail@example.com"
  }'
```

### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "OTP sent to your email",
  "data": {
    "email": "john.doe@example.com",
    "expires_in": 900
  }
}
```

### Error Responses

#### 400 Bad Request - Rate Limit Exceeded

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Too many OTP requests. Please try again after 5 minutes."
}
```

**What Happens:** User requested OTP too many times. Rate limiting protects against email flooding. User must wait before requesting again.

#### 401 Unauthorized - Not Authenticated

```json
{
  "status": "error",
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**What Happens:** Access token is invalid, expired, or missing. User must log in to verify email.

#### 404 Not Found - Email Not Found

```json
{
  "status": "error",
  "statusCode": 404,
  "message": "Email address not found"
}
```

**What Happens:** The provided email address is not registered. User should provide their registered email.

---

## Verify Email with OTP

**Name:** Complete Email Verification

**Description:** Verifies the user's email address using the OTP sent to their email. Upon successful verification, the user's `is_verified` flag is set to true, unlocking all verified-only features. If the OTP is incorrect or expired, the request fails with a specific error.

**Route:** `POST /auth/verify-email`

**Authentication Required:** Yes (Bearer token)

### Request Payload

```json
{
  "otp": "123456"
}
```

### Field Requirements

| Field | Type   | Required | Description            |
| ----- | ------ | -------- | ---------------------- |
| otp   | string | Yes      | 6-digit OTP from email |

### Request Example (JavaScript)

```javascript
async function verifyEmailWithOTP(accessToken, otp) {
  try {
    const response = await fetch(
      "https://identity.syncnexa.com/api/v1/auth/verify-email",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otp }),
      },
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("Email verification failed:", result.message);
      return false;
    }

    console.log("Email verified successfully!");
    localStorage.setItem("emailVerified", "true");
    return true;
  } catch (error) {
    console.error("Network error:", error);
    return false;
  }
}

// Usage in verification form
document.getElementById("verify-btn").addEventListener("click", async () => {
  const otp = document.getElementById("otp-input").value;

  if (otp.length !== 6 || !/^\d+$/.test(otp)) {
    alert("Please enter a valid 6-digit OTP");
    return;
  }

  const success = await verifyEmailWithOTP(accessToken, otp);

  if (success) {
    alert("Email verified! You can now access all features.");
    window.location.href = "/dashboard";
  } else {
    alert("Verification failed. Please check the OTP and try again.");
  }
});
```

### Request Example (cURL)

```bash
curl -X POST https://identity.syncnexa.com/api/v1/auth/verify-email \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "otp": "123456"
  }'
```

### Request Example (Python)

```python
import requests
import time

class EmailVerificationService:
    def __init__(self, base_url='https://identity.syncnexa.com/api/v1'):
        self.base_url = base_url
        self.access_token = None

    def set_access_token(self, token):
        """Set access token for verification"""
        self.access_token = token

    def request_otp(self, email=None):
        """Request OTP for email verification"""
        if not self.access_token:
            raise Exception("Not authenticated")

        headers = {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json'
        }

        payload = {}
        if email:
            payload['email'] = email

        response = requests.post(
            f'{self.base_url}/auth/verify-email/request',
            headers=headers,
            json=payload
        )

        if response.status_code != 200:
            print(f"OTP request failed: {response.json()['message']}")
            return None

        data = response.json()['data']
        print(f"OTP sent to {data['email']}")
        print(f"Expires in {data['expires_in']} seconds")

        return data

    def verify_email(self, otp):
        """Verify email with OTP"""
        if not self.access_token:
            raise Exception("Not authenticated")

        headers = {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json'
        }

        response = requests.post(
            f'{self.base_url}/auth/verify-email',
            headers=headers,
            json={'otp': otp}
        )

        if response.status_code != 200:
            error_data = response.json()
            print(f"Verification failed: {error_data['message']}")
            return False

        print("Email verified successfully!")
        return True

    def check_verification_status(self):
        """Check if email is verified"""
        if not self.access_token:
            raise Exception("Not authenticated")

        headers = {
            'Authorization': f'Bearer {self.access_token}'
        }

        response = requests.get(
            f'{self.base_url}/auth/verify-email/status',
            headers=headers
        )

        if response.status_code != 200:
            return None

        return response.json()['data']['is_verified']

    def resend_otp(self, email=None):
        """Resend OTP (invalidates previous OTP)"""
        if not self.access_token:
            raise Exception("Not authenticated")

        headers = {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json'
        }

        payload = {}
        if email:
            payload['email'] = email

        response = requests.post(
            f'{self.base_url}/auth/verify-email/resend',
            headers=headers,
            json=payload
        )

        if response.status_code != 200:
            print(f"Resend failed: {response.json()['message']}")
            return False

        print("New OTP sent to your email")
        return True

# Usage
service = EmailVerificationService()
service.set_access_token('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')

# Step 1: Request OTP
service.request_otp()

# Step 2: User receives email with OTP
print("Check your email for the OTP...")

# Step 3: Verify with OTP
otp = input("Enter OTP: ")
if service.verify_email(otp):
    print("✓ Email verified!")
else:
    print("✗ Verification failed, resending OTP...")
    service.resend_otp()
```

### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Email verified successfully",
  "data": {
    "is_verified": true,
    "verified_at": "2026-02-05T10:30:00.000Z"
  }
}
```

### Error Responses

#### 400 Bad Request - Invalid OTP Format

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [{ "field": "otp", "message": "OTP must be 6 digits" }]
}
```

**What Happens:** OTP format is invalid (not 6 digits). Request is rejected immediately.

#### 422 Unprocessable Entity - Incorrect OTP

```json
{
  "status": "error",
  "statusCode": 422,
  "message": "Incorrect OTP. Please check and try again."
}
```

**What Happens:** OTP doesn't match the stored OTP. User has more attempts. They should re-check the email and try again.

#### 410 Gone - OTP Expired

```json
{
  "status": "error",
  "statusCode": 410,
  "message": "OTP has expired. Please request a new one."
}
```

**What Happens:** OTP is older than 15 minutes. User must request a new OTP. Previous OTP is no longer valid.

#### 404 Not Found - No Active OTP

```json
{
  "status": "error",
  "statusCode": 404,
  "message": "No active OTP found. Please request a new one."
}
```

**What Happens:** No OTP has been requested or the previous one has been replaced. User should request OTP first.

---

## Check Verification Status

**Name:** Get Email Verification Status

**Description:** Returns whether the user's email is verified. Useful for checking before redirecting to features that require verification.

**Route:** `GET /auth/verify-email/status`

**Authentication Required:** Yes (Bearer token)

### Request Example (JavaScript)

```javascript
async function checkEmailVerification(accessToken) {
  const response = await fetch(
    "https://identity.syncnexa.com/api/v1/auth/verify-email/status",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const result = await response.json();
  return result.data.is_verified;
}

// Usage
const isVerified = await checkEmailVerification(accessToken);

if (!isVerified) {
  redirect("/verify-email");
}
```

### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Verification status",
  "data": {
    "is_verified": true,
    "verified_at": "2026-02-05T10:30:00.000Z"
  }
}
```

---

## Resend Email OTP

**Name:** Resend Email Verification OTP

**Description:** Requests a new OTP and sends it to the user's email. This invalidates any existing OTP. Useful when user didn't receive OTP or it expired.

**Route:** `POST /auth/verify-email/resend`

**Authentication Required:** Yes (Bearer token)

### Request Example (JavaScript)

```javascript
async function resendEmailOTP(accessToken) {
  const response = await fetch(
    "https://identity.syncnexa.com/api/v1/auth/verify-email/resend",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  );

  return response.ok;
}

// Usage - User clicks "Didn't receive OTP?" button
document
  .getElementById("resend-otp-btn")
  .addEventListener("click", async () => {
    const success = await resendEmailOTP(accessToken);

    if (success) {
      alert("New OTP sent to your email");
      startCountdown(300); // 5 minute countdown
    }
  });
```

### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "New OTP sent to your email",
  "data": {
    "email": "john.doe@example.com",
    "expires_in": 900
  }
}
```

---

## Edge Cases

| Scenario                          | Behavior                                    |
| --------------------------------- | ------------------------------------------- |
| **Multiple OTP requests**         | Rate limited after 5 attempts in 15 minutes |
| **Verify already verified email** | Returns 200 OK (idempotent)                 |
| **OTP exactly at 15-min expiry**  | Accepted if within grace period             |
| **OTP after 15-min expiry**       | Rejected with 410 Gone                      |
| **Case sensitivity in OTP**       | Digits only, no case sensitivity            |
| **OTP with leading zeros**        | Accepted (e.g., "006789")                   |
| **Very fast OTP submission**      | No minimum delay, instant verification      |

---

## Examples

### Complete Verification Flow

```javascript
class EmailVerificationFlow {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.otpExpiresAt = null;
  }

  async startVerification() {
    // Show verification form
    const form = this.createVerificationForm();
    document.body.appendChild(form);

    // Request OTP
    try {
      const response = await fetch(
        "https://identity.syncnexa.com/api/v1/auth/verify-email/request",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      const result = await response.json();

      if (response.ok) {
        this.otpExpiresAt = new Date(
          Date.now() + result.data.expires_in * 1000,
        );
        this.startCountdown();
        alert(`OTP sent to ${result.data.email}`);
      }
    } catch (error) {
      alert("Failed to send OTP: " + error.message);
    }
  }

  createVerificationForm() {
    const div = document.createElement("div");
    div.innerHTML = `
      <div class="verification-form">
        <h2>Verify Your Email</h2>
        <p>Enter the 6-digit code sent to your email</p>
        <input type="text" id="otp-input" maxlength="6" pattern="\d{6}" 
               placeholder="000000" />
        <button id="verify-btn">Verify</button>
        <button id="resend-btn">Resend OTP</button>
        <p id="countdown">Expires in: <span>15:00</span></p>
      </div>
    `;

    // Submit handler
    div.querySelector("#verify-btn").addEventListener("click", () => {
      this.submitOTP(div.querySelector("#otp-input").value);
    });

    // Resend handler
    div.querySelector("#resend-btn").addEventListener("click", () => {
      this.resendOTP();
    });

    return div;
  }

  async submitOTP(otp) {
    if (!/^\d{6}$/.test(otp)) {
      alert("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      const response = await fetch(
        "https://identity.syncnexa.com/api/v1/auth/verify-email",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ otp }),
        },
      );

      const result = await response.json();

      if (response.ok) {
        alert("Email verified successfully!");
        localStorage.setItem("emailVerified", "true");
        window.location.href = "/dashboard";
      } else if (response.status === 410) {
        alert("OTP expired. Requesting new one...");
        this.resendOTP();
      } else {
        alert("Incorrect OTP. Please try again.");
      }
    } catch (error) {
      alert("Verification failed: " + error.message);
    }
  }

  async resendOTP() {
    try {
      const response = await fetch(
        "https://identity.syncnexa.com/api/v1/auth/verify-email/resend",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const result = await response.json();
        this.otpExpiresAt = new Date(
          Date.now() + result.data.expires_in * 1000,
        );
        this.startCountdown();
        alert("New OTP sent to your email");
      }
    } catch (error) {
      alert("Resend failed: " + error.message);
    }
  }

  startCountdown() {
    const countdownEl = document.querySelector("#countdown span");

    const interval = setInterval(() => {
      const now = new Date();
      const remaining = Math.max(0, this.otpExpiresAt - now);
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);

      countdownEl.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;

      if (remaining <= 0) {
        clearInterval(interval);
        alert("OTP expired. Please request a new one.");
      }
    }, 1000);
  }
}

// Usage
const verificationFlow = new EmailVerificationFlow(accessToken);
verificationFlow.startVerification();
```

### Python Verification Helper

```python
import requests
import time

class EmailVerificationHelper:
    def __init__(self, base_url, access_token):
        self.base_url = base_url
        self.access_token = access_token
        self.headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }

    def complete_verification(self, max_attempts=3):
        """Interactive email verification"""
        attempts = 0

        # Request OTP
        response = requests.post(
            f'{self.base_url}/auth/verify-email/request',
            headers=self.headers
        )

        if response.status_code != 200:
            print(f"Failed to request OTP: {response.json()['message']}")
            return False

        email = response.json()['data']['email']
        print(f"OTP sent to {email}")
        print("Check your email and enter the OTP")

        # Attempt verification
        while attempts < max_attempts:
            otp = input("Enter OTP (or 'resend' for new code): ").strip()

            if otp.lower() == 'resend':
                response = requests.post(
                    f'{self.base_url}/auth/verify-email/resend',
                    headers=self.headers
                )
                if response.status_code == 200:
                    print("New OTP sent")
                    continue

            if len(otp) != 6 or not otp.isdigit():
                print("Please enter a valid 6-digit OTP")
                continue

            response = requests.post(
                f'{self.base_url}/auth/verify-email',
                headers=self.headers,
                json={'otp': otp}
            )

            if response.status_code == 200:
                print("✓ Email verified successfully!")
                return True
            elif response.status_code == 410:
                print("✗ OTP expired. Requesting new one...")
                self.complete_verification(max_attempts - attempts)
                return False
            else:
                error = response.json()['message']
                attempts += 1
                print(f"✗ {error} ({max_attempts - attempts} attempts remaining)")

        print("✗ Verification failed after max attempts")
        return False

# Usage
helper = EmailVerificationHelper(
    'https://identity.syncnexa.com/api/v1',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
)

if helper.complete_verification():
    print("User is now fully verified!")
```

---

## Best Practices

### OTP Delivery

- **Check Spam:** Remind users to check spam/junk folder
- **Display Email:** Show which email OTP was sent to
- **Clear Expiration:** Tell user OTP expires in 15 minutes
- **Multiple Channels:** Consider SMS backup option

### Security

- **Rate Limiting:** Limit OTP requests to prevent email flooding
- **Brute Force Protection:** Limit verification attempts
- **Secure Generation:** Use cryptographically secure random numbers
- **No Reuse:** Generate new OTP each request (invalidate old one)
- **Audit Logging:** Log all verification attempts

### User Experience

- **Show Countdown:** Display remaining time for OTP
- **Easy Resend:** Provide obvious "Resend OTP" button
- **Input Format:** Auto-format input (accept spaces, dashes)
- **Success Feedback:** Show checkmark/confirmation message
- **Error Details:** Clear messages for each failure type

### Email Content

- **Professional Template:** Brand-consistent email design
- **Clear Instructions:** Step-by-step verification steps
- **Large Code:** Make OTP clearly visible
- **Expiration Warning:** Highlight 15-minute expiration
- **Support Link:** Provide help/support contact

---

## Related Features

- **[User Registration](/docs/authentication/user-registration)** - Create account
- **[User Login](/docs/authentication/user-login)** - Authenticate user
- **[Student Features](/docs/student)** - Verified-only features
