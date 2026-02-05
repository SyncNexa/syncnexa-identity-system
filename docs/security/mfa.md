# Multi-Factor Authentication (MFA)

Complete MFA implementation using Time-based One-Time Password (TOTP) for enhanced account security.

---

## Overview

Multi-Factor Authentication (MFA) adds an extra layer of security to user accounts by requiring a second form of authentication beyond just a password. SyncNexa supports TOTP-based MFA, compatible with popular authenticator apps like Google Authenticator, Microsoft Authenticator, and Authy.

**Key Features:**

- TOTP (Time-based One-Time Password) support
- QR code generation for easy setup
- Manual secret key entry option
- Backup codes for account recovery
- Enable/disable MFA functionality
- Compatible with standard authenticator apps

---

## Use Cases

| Use Case                | Description                                       |
| ----------------------- | ------------------------------------------------- |
| Enhanced Security       | Add second factor to prevent unauthorized access  |
| Compliance Requirements | Meet security standards requiring 2FA             |
| High-Value Accounts     | Protect accounts with sensitive information       |
| Suspicious Activity     | Enable after detecting suspicious login attempts  |
| Shared Devices          | Additional protection when using public computers |

---

## MFA Management Endpoints

### Setup TOTP

**Endpoint:** `POST /user/mfa/totp/setup`

**Description:** Initializes TOTP MFA for the authenticated user. Generates a secret key and QR code that can be scanned by authenticator apps. The MFA is not yet enabled until verified in the next step.

**Authentication:** Required (Student, Developer, Staff roles)

**Success Response:**

```json
{
  "status": "success",
  "statusCode": 201,
  "message": "TOTP setup",
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "record": {
      "id": "a1b2c3d4-e5f6-4g7h-8i9j-k0l1m2n3o4p5",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "mfa_type": "totp",
      "is_enabled": false,
      "created_at": "2026-02-05T10:30:00.000Z"
    }
  }
}
```

**Response Fields:**

| Field             | Type    | Description                                |
| ----------------- | ------- | ------------------------------------------ |
| secret            | string  | Base32-encoded secret key for manual entry |
| qrCode            | string  | Base64-encoded QR code image (data URI)    |
| record.id         | string  | MFA settings record ID                     |
| record.user_id    | string  | User ID                                    |
| record.mfa_type   | string  | Type of MFA (totp, sms, email)             |
| record.is_enabled | boolean | Whether MFA is currently enabled           |

**Error Responses:**

| Status Code | Error                | What Happens                    |
| ----------- | -------------------- | ------------------------------- |
| 400         | User ID required     | User not authenticated          |
| 401         | Unauthorized         | Invalid or expired access token |
| 409         | MFA already setup    | User already has MFA configured |
| 500         | Failed to setup TOTP | Internal error during setup     |

**Example Request (JavaScript):**

```javascript
const response = await fetch(
  "https://identity.syncnexa.com/api/v1/user/mfa/totp/setup",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  },
);

const result = await response.json();

// Display QR code for user to scan
const qrImage = document.getElementById("qr-code");
qrImage.src = result.data.qrCode;

// Also display secret key for manual entry
console.log("Secret Key:", result.data.secret);
console.log("Scan QR code with your authenticator app");
```

**Example Request (cURL):**

```bash
curl -X POST 'https://identity.syncnexa.com/api/v1/user/mfa/totp/setup' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: application/json'
```

**Example Request (Python):**

```python
import requests
import base64

response = requests.post(
    'https://identity.syncnexa.com/api/v1/user/mfa/totp/setup',
    headers={
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
)

result = response.json()

# Save QR code as image file
qr_data = result['data']['qrCode'].split(',')[1]  # Remove data:image/png;base64,
qr_bytes = base64.b64decode(qr_data)
with open('mfa_qr_code.png', 'wb') as f:
    f.write(qr_bytes)

print(f"Secret Key: {result['data']['secret']}")
print("QR code saved as mfa_qr_code.png")
```

---

### Enable TOTP

**Endpoint:** `POST /user/mfa/totp/enable`

**Description:** Enables TOTP MFA for the user after verifying a token from their authenticator app. This confirms the user has successfully configured their authenticator app. Backup codes are generated and returned for account recovery.

**Authentication:** Required (Student, Developer, Staff roles)

**Request Body:**

```json
{
  "token": "123456"
}
```

**Request Fields:**

| Field | Type   | Required | Description                              |
| ----- | ------ | -------- | ---------------------------------------- |
| token | string | Yes      | 6-digit TOTP code from authenticator app |

**Success Response:**

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "TOTP enabled",
  "data": {
    "record": {
      "id": "a1b2c3d4-e5f6-4g7h-8i9j-k0l1m2n3o4p5",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "mfa_type": "totp",
      "is_enabled": true,
      "verified_at": "2026-02-05T10:35:00.000Z"
    },
    "backupCodes": [
      "ABCD-1234-EFGH-5678",
      "IJKL-9012-MNOP-3456",
      "QRST-7890-UVWX-1234",
      "YZAB-5678-CDEF-9012",
      "GHIJ-3456-KLMN-7890"
    ]
  }
}
```

**Response Fields:**

| Field              | Type    | Description                         |
| ------------------ | ------- | ----------------------------------- |
| record             | object  | Updated MFA settings record         |
| record.is_enabled  | boolean | Now true - MFA is active            |
| record.verified_at | string  | ISO timestamp of verification       |
| backupCodes        | array   | 5 backup codes for account recovery |

**Backup Codes:**

- Each code is 16 characters (4 groups of 4)
- Can be used once in place of TOTP code
- Store securely - won't be shown again
- Used for account recovery if authenticator lost

**Error Responses:**

| Status Code | Error                 | What Happens                     |
| ----------- | --------------------- | -------------------------------- |
| 400         | User ID required      | User not authenticated           |
| 400         | Token required        | No TOTP token provided           |
| 401         | Invalid TOTP token    | Token is incorrect or expired    |
| 401         | Unauthorized          | Invalid or expired access token  |
| 404         | TOTP not setup        | Must call setup endpoint first   |
| 500         | Failed to enable TOTP | Internal error during enablement |

**Example Request (JavaScript):**

```javascript
const totpCode = "123456"; // From authenticator app

const response = await fetch(
  "https://identity.syncnexa.com/api/v1/user/mfa/totp/enable",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token: totpCode,
    }),
  },
);

const result = await response.json();

if (result.data.record.is_enabled) {
  console.log("✅ MFA enabled successfully!");
  console.log("⚠️  Save these backup codes securely:");
  result.data.backupCodes.forEach((code, index) => {
    console.log(`${index + 1}. ${code}`);
  });
}
```

**Example Request (cURL):**

```bash
curl -X POST 'https://identity.syncnexa.com/api/v1/user/mfa/totp/enable' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "token": "123456"
  }'
```

**Example Request (Python):**

```python
import requests

totp_code = '123456'  # From authenticator app

response = requests.post(
    'https://identity.syncnexa.com/api/v1/user/mfa/totp/enable',
    headers={
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    },
    json={'token': totp_code}
)

result = response.json()

if result['data']['record']['is_enabled']:
    print('✅ MFA enabled successfully!')
    print('⚠️  Save these backup codes securely:')
    for idx, code in enumerate(result['data']['backupCodes'], 1):
        print(f"{idx}. {code}")
```

---

### Disable TOTP

**Endpoint:** `POST /user/mfa/totp/disable`

**Description:** Disables TOTP MFA for the authenticated user. After disabling, the user will no longer be required to provide TOTP codes during login. The MFA settings record is updated but not deleted, allowing re-enablement.

**Authentication:** Required (Student, Developer, Staff roles)

**Success Response:**

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "TOTP disabled",
  "data": {
    "id": "a1b2c3d4-e5f6-4g7h-8i9j-k0l1m2n3o4p5",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "mfa_type": "totp",
    "is_enabled": false,
    "disabled_at": "2026-02-05T11:00:00.000Z"
  }
}
```

**Error Responses:**

| Status Code | Error                  | What Happens                      |
| ----------- | ---------------------- | --------------------------------- |
| 400         | User ID required       | User not authenticated            |
| 401         | Unauthorized           | Invalid or expired access token   |
| 404         | TOTP not found         | User doesn't have MFA configured  |
| 500         | Failed to disable TOTP | Internal error during disablement |

**Example Request (JavaScript):**

```javascript
const response = await fetch(
  "https://identity.syncnexa.com/api/v1/user/mfa/totp/disable",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  },
);

const result = await response.json();
console.log("MFA disabled successfully");
```

**Example Request (cURL):**

```bash
curl -X POST 'https://identity.syncnexa.com/api/v1/user/mfa/totp/disable' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: application/json'
```

**Example Request (Python):**

```python
import requests

response = requests.post(
    'https://identity.syncnexa.com/api/v1/user/mfa/totp/disable',
    headers={
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
)

result = response.json()
print('MFA disabled successfully')
```

---

## Complete MFA Setup Workflow

### JavaScript Implementation

```javascript
class MFAManager {
  constructor(apiBaseUrl, accessToken) {
    this.apiBaseUrl = apiBaseUrl;
    this.accessToken = accessToken;
  }

  async setupTOTP() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/user/mfa/totp/setup`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to setup TOTP");
      }

      console.log("\n🔐 MFA Setup Initiated");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("\n📱 Scan this QR code with your authenticator app:");
      console.log(
        "   (Google Authenticator, Microsoft Authenticator, Authy, etc.)",
      );
      console.log("\n🔑 Or enter this secret key manually:");
      console.log(`   ${result.data.secret}`);
      console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

      return {
        secret: result.data.secret,
        qrCode: result.data.qrCode,
        record: result.data.record,
      };
    } catch (error) {
      console.error("❌ Setup failed:", error.message);
      throw error;
    }
  }

  async enableTOTP(token) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/user/mfa/totp/enable`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to enable TOTP");
      }

      console.log("\n✅ MFA Enabled Successfully!");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("\n⚠️  IMPORTANT: Save these backup codes securely!");
      console.log(
        "   You can use these to access your account if you lose your device.\n",
      );

      result.data.backupCodes.forEach((code, index) => {
        console.log(`   ${index + 1}. ${code}`);
      });

      console.log("\n   • Each code can only be used once");
      console.log("   • Store them in a secure location");
      console.log("   • You will not see these codes again\n");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

      return {
        record: result.data.record,
        backupCodes: result.data.backupCodes,
      };
    } catch (error) {
      console.error("❌ Enable failed:", error.message);
      throw error;
    }
  }

  async disableTOTP() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/user/mfa/totp/disable`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to disable TOTP");
      }

      console.log("✅ MFA disabled successfully");
      console.log("⚠️  Your account is now less secure without MFA");

      return result.data;
    } catch (error) {
      console.error("❌ Disable failed:", error.message);
      throw error;
    }
  }

  async completeMFASetup(verificationCode) {
    console.log("Starting MFA setup process...\n");

    // Step 1: Setup TOTP
    const setupData = await this.setupTOTP();

    // Step 2: User scans QR code and enters verification code
    // (In a real app, this would be user input)
    console.log("Waiting for user to scan QR code...");
    console.log(`Using verification code: ${verificationCode}\n`);

    // Step 3: Enable TOTP with verification code
    const enableData = await this.enableTOTP(verificationCode);

    console.log("🎉 MFA setup complete!");
    console.log(
      "   Your account is now protected with two-factor authentication.\n",
    );

    return {
      setup: setupData,
      enable: enableData,
    };
  }

  displayQRCode(qrCodeDataUri) {
    // In browser environment
    if (typeof document !== "undefined") {
      const img = document.createElement("img");
      img.src = qrCodeDataUri;
      img.alt = "MFA QR Code";
      document.body.appendChild(img);
    }
  }

  saveBackupCodes(backupCodes, filename = "mfa-backup-codes.txt") {
    // In Node.js environment
    if (typeof require !== "undefined") {
      const fs = require("fs");
      const content = [
        "MFA Backup Codes",
        "═════════════════",
        "",
        "⚠️  IMPORTANT: Keep these codes secure!",
        "",
        "These backup codes can be used to access your account",
        "if you lose access to your authenticator app.",
        "",
        "Backup Codes:",
        "─────────────",
        ...backupCodes.map((code, idx) => `${idx + 1}. ${code}`),
        "",
        `Generated: ${new Date().toISOString()}`,
        "",
        "Security Tips:",
        "• Store these codes in a secure location",
        "• Each code can only be used once",
        "• Generate new codes if these are compromised",
      ].join("\n");

      fs.writeFileSync(filename, content);
      console.log(`\n💾 Backup codes saved to: ${filename}`);
    }
  }
}

// Usage
const mfaManager = new MFAManager(
  "https://identity.syncnexa.com/api/v1",
  "your-access-token",
);

// Complete MFA setup flow
const verificationCode = "123456"; // User enters this from their authenticator app
const result = await mfaManager.completeMFASetup(verificationCode);

// Save backup codes securely
mfaManager.saveBackupCodes(result.enable.backupCodes);

// Later, if needed, disable MFA
// await mfaManager.disableTOTP();
```

---

## Python Implementation

```python
import requests
import base64
import qrcode
from io import BytesIO
from datetime import datetime
from typing import Dict, List

class MFAManager:
    def __init__(self, api_base_url: str, access_token: str):
        self.api_base_url = api_base_url
        self.access_token = access_token
        self.headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }

    def setup_totp(self) -> Dict:
        """Setup TOTP MFA"""
        try:
            response = requests.post(
                f'{self.api_base_url}/user/mfa/totp/setup',
                headers=self.headers
            )

            result = response.json()

            if not response.ok:
                raise Exception(result.get('message', 'Failed to setup TOTP'))

            print('\n🔐 MFA Setup Initiated')
            print('━' * 50)
            print('\n📱 Scan this QR code with your authenticator app:')
            print('   (Google Authenticator, Microsoft Authenticator, Authy, etc.)')
            print('\n🔑 Or enter this secret key manually:')
            print(f"   {result['data']['secret']}")
            print('\n' + '━' * 50 + '\n')

            return {
                'secret': result['data']['secret'],
                'qrCode': result['data']['qrCode'],
                'record': result['data']['record']
            }
        except Exception as e:
            print(f"❌ Setup failed: {e}")
            raise

    def enable_totp(self, token: str) -> Dict:
        """Enable TOTP MFA"""
        try:
            response = requests.post(
                f'{self.api_base_url}/user/mfa/totp/enable',
                headers=self.headers,
                json={'token': token}
            )

            result = response.json()

            if not response.ok:
                raise Exception(result.get('message', 'Failed to enable TOTP'))

            print('\n✅ MFA Enabled Successfully!')
            print('━' * 50)
            print('\n⚠️  IMPORTANT: Save these backup codes securely!')
            print('   You can use these to access your account if you lose your device.\n')

            for idx, code in enumerate(result['data']['backupCodes'], 1):
                print(f"   {idx}. {code}")

            print('\n   • Each code can only be used once')
            print('   • Store them in a secure location')
            print('   • You will not see these codes again\n')
            print('━' * 50 + '\n')

            return {
                'record': result['data']['record'],
                'backupCodes': result['data']['backupCodes']
            }
        except Exception as e:
            print(f"❌ Enable failed: {e}")
            raise

    def disable_totp(self) -> Dict:
        """Disable TOTP MFA"""
        try:
            response = requests.post(
                f'{self.api_base_url}/user/mfa/totp/disable',
                headers=self.headers
            )

            result = response.json()

            if not response.ok:
                raise Exception(result.get('message', 'Failed to disable TOTP'))

            print('✅ MFA disabled successfully')
            print('⚠️  Your account is now less secure without MFA')

            return result['data']
        except Exception as e:
            print(f"❌ Disable failed: {e}")
            raise

    def complete_mfa_setup(self, verification_code: str) -> Dict:
        """Complete MFA setup flow"""
        print('Starting MFA setup process...\n')

        # Step 1: Setup TOTP
        setup_data = self.setup_totp()

        # Step 2: User scans QR code and enters verification code
        print('Waiting for user to scan QR code...')
        print(f'Using verification code: {verification_code}\n')

        # Step 3: Enable TOTP with verification code
        enable_data = self.enable_totp(verification_code)

        print('🎉 MFA setup complete!')
        print('   Your account is now protected with two-factor authentication.\n')

        return {
            'setup': setup_data,
            'enable': enable_data
        }

    def save_qr_code(self, qr_data_uri: str, filename: str = 'mfa_qr_code.png'):
        """Save QR code as image file"""
        try:
            # Remove data:image/png;base64, prefix
            qr_data = qr_data_uri.split(',')[1]
            qr_bytes = base64.b64decode(qr_data)

            with open(filename, 'wb') as f:
                f.write(qr_bytes)

            print(f'💾 QR code saved to: {filename}')
        except Exception as e:
            print(f'❌ Failed to save QR code: {e}')

    def save_backup_codes(self, backup_codes: List[str],
                         filename: str = 'mfa-backup-codes.txt'):
        """Save backup codes to file"""
        try:
            content = [
                'MFA Backup Codes',
                '═' * 50,
                '',
                '⚠️  IMPORTANT: Keep these codes secure!',
                '',
                'These backup codes can be used to access your account',
                'if you lose access to your authenticator app.',
                '',
                'Backup Codes:',
                '─' * 50,
            ]

            for idx, code in enumerate(backup_codes, 1):
                content.append(f'{idx}. {code}')

            content.extend([
                '',
                f'Generated: {datetime.now().isoformat()}',
                '',
                'Security Tips:',
                '• Store these codes in a secure location',
                '• Each code can only be used once',
                '• Generate new codes if these are compromised',
            ])

            with open(filename, 'w') as f:
                f.write('\n'.join(content))

            print(f'\n💾 Backup codes saved to: {filename}')
        except Exception as e:
            print(f'❌ Failed to save backup codes: {e}')


# Usage
mfa_manager = MFAManager(
    'https://identity.syncnexa.com/api/v1',
    'your-access-token'
)

# Complete MFA setup flow
verification_code = '123456'  # User enters this from their authenticator app
result = mfa_manager.complete_mfa_setup(verification_code)

# Save QR code and backup codes
mfa_manager.save_qr_code(result['setup']['qrCode'])
mfa_manager.save_backup_codes(result['enable']['backupCodes'])

# Later, if needed, disable MFA
# mfa_manager.disable_totp()
```

---

## Edge Cases

| Scenario                  | Behavior                                          |
| ------------------------- | ------------------------------------------------- |
| Setup called twice        | Returns 409 error - already setup                 |
| Enable without setup      | Returns 404 error - must setup first              |
| Invalid TOTP code         | Returns 401 error - verification failed           |
| Expired TOTP code         | Returns 401 error - codes expire after 30 seconds |
| Disable when not enabled  | Returns 404 error                                 |
| Lost authenticator device | Use backup codes to access account                |
| Backup code already used  | Code becomes invalid after first use              |
| All backup codes used     | Contact support to reset MFA                      |

---

## Best Practices

### Setup Process

- **Clear Instructions**: Provide step-by-step guidance
- **QR Code Display**: Make QR code large and scannable
- **Manual Entry Option**: Always provide secret key as alternative
- **Verification Step**: Require successful code verification before enabling
- **Backup Code Storage**: Emphasize importance of saving backup codes

### Security

- **Strong Secrets**: Use cryptographically secure secret generation
- **Time Sync**: Ensure server time is accurate (TOTP depends on time)
- **Rate Limiting**: Limit verification attempts to prevent brute force
- **Backup Codes**: Generate sufficient backup codes (5-10)
- **Code Expiry**: TOTP codes expire after 30 seconds

### User Experience

- **Compatible Apps**: List compatible authenticator apps
- **Testing**: Allow users to test before fully enabling
- **Recovery Process**: Clear process for lost device scenarios
- **Disable Option**: Allow users to disable MFA if needed
- **Support**: Provide help documentation and support contact

---

## Security Considerations

### TOTP Security

- **Time-Based**: Codes change every 30 seconds
- **Shared Secret**: Secret never transmitted after setup
- **Hash Algorithm**: Uses SHA-1 (standard for TOTP)
- **Code Length**: 6 digits (standard)
- **Window**: Accept codes within ±1 time window

### Backup Code Security

- **One-Time Use**: Each code valid only once
- **Secure Generation**: Cryptographically random
- **Hashed Storage**: Codes hashed in database
- **Limited Quantity**: 5-10 codes per user
- **Regeneration**: New codes invalidate old ones

### Implementation Security

- **Secret Storage**: Secrets encrypted at rest
- **QR Code**: QR code contains secret - transmit securely
- **Rate Limiting**: Prevent brute force attacks
- **Audit Logging**: Log all MFA setup/disable events
- **Two-Step Verification**: Require verification before enabling

---

## Troubleshooting

### Common Issues

| Issue                | Possible Cause     | Solution                     |
| -------------------- | ------------------ | ---------------------------- |
| Codes always invalid | Time sync issue    | Check device time settings   |
| QR code won't scan   | Image quality/size | Use manual secret entry      |
| Setup fails          | Already configured | Disable existing MFA first   |
| Enable fails         | Wrong code         | Wait for new code, try again |
| Lost backup codes    | Not saved properly | Disable and re-setup MFA     |

---

## Authenticator App Recommendations

### Popular Authenticator Apps

| App                     | Platform              | Features                     |
| ----------------------- | --------------------- | ---------------------------- |
| Google Authenticator    | iOS, Android          | Simple, reliable, offline    |
| Microsoft Authenticator | iOS, Android          | Cloud backup, multi-device   |
| Authy                   | iOS, Android, Desktop | Multi-device, cloud backup   |
| 1Password               | iOS, Android, Desktop | Password manager integration |
| Bitwarden               | iOS, Android, Desktop | Open source, free            |

---

## Related Documentation

- **[User Login](/docs/authentication/user-login)** - Login with MFA
- **[Session Management](/docs/security/session-management)** - Manage sessions after MFA
- **[Password Reset](/docs/security/password-reset)** - Reset password with MFA enabled
- **[Security Dashboard](/docs/security/README)** - View MFA status
