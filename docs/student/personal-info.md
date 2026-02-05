# Personal Information

Retrieve personal information for the authenticated student including contact details and basic profile data.

---

## Overview

The Personal Information endpoint allows students to retrieve their core personal details including full name, email, phone number, address, and gender. This information is pulled directly from the user's account profile.

**Key Features:**

- Retrieve personal contact information
- Get formatted full name
- Access address and contact details
- View gender information

---

## Use Cases

| Use Case                | Description                                         |
| ----------------------- | --------------------------------------------------- |
| Profile Display         | Show user's personal information in profile pages   |
| Contact Forms           | Pre-fill contact forms with user data               |
| Account Settings        | Display current information for editing             |
| Identity Verification   | Provide personal details for verification processes |
| Third-Party Integration | Share basic profile data with authorized apps       |

---

## Get Personal Information

**Endpoint:** `GET /user/personal-info`

**Description:** Retrieves the personal information for the currently authenticated student. Returns formatted contact details and basic profile information.

**Authentication:** Required (Student role)

**Success Response:**

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Personal information retrieved",
  "data": {
    "fullName": "John Doe",
    "email": "john.doe@university.edu",
    "emailStatus": "verified",
    "phoneNumber": "+2348012345678",
    "phoneStatus": "pending",
    "address": "123 University Road, Lagos, Nigeria",
    "gender": "male",
    "linkedId": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
  }
}
```

**Response Fields:**

| Field       | Type           | Description                                                                   |
| ----------- | -------------- | ----------------------------------------------------------------------------- |
| fullName    | string         | Concatenated first name and last name                                         |
| email       | string         | User's email address                                                          |
| emailStatus | string         | Email verification status: "pending", "verified", or "failed"                 |
| phoneNumber | string         | User's phone number                                                           |
| phoneStatus | string         | Phone verification status: "pending", "verified", or "failed"                 |
| address     | string         | User's physical address                                                       |
| gender      | string         | User's gender (male, female, or other)                                        |
| linkedId    | string \| null | Unique UUID reference to user's uploaded resources (profile image, documents) |

**Error Responses:**

| Status Code | Error                                | What Happens                    |
| ----------- | ------------------------------------ | ------------------------------- |
| 400         | User ID required                     | User not authenticated          |
| 401         | Unauthorized                         | Invalid or expired access token |
| 404         | Personal information not found       | User doesn't exist in database  |
| 500         | Could not fetch personal information | Internal server error           |

**Example Request (JavaScript):**

```javascript
const response = await fetch(
  "https://identity.syncnexa.com/api/v1/user/personal-info",
  {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  },
);

const result = await response.json();
console.log("Full Name:", result.data.fullName);
console.log("Email:", result.data.email);
console.log("Email Status:", result.data.emailStatus);
console.log("Phone:", result.data.phoneNumber);
console.log("Phone Status:", result.data.phoneStatus);
console.log("Address:", result.data.address);
console.log("Gender:", result.data.gender);
console.log("Linked ID:", result.data.linkedId);
```

**Example Request (cURL):**

```bash
curl -X GET 'https://identity.syncnexa.com/api/v1/user/personal-info' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: application/json'
```

**Example Request (Python):**

```python
import requests

response = requests.get(
    'https://identity.syncnexa.com/api/v1/user/personal-info',
    headers={
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
)

result = response.json()
print(f"Full Name: {result['data']['fullName']}")
print(f"Email: {result['data']['email']}")
print(f"Email Status: {result['data']['emailStatus']}")
print(f"Phone: {result['data']['phoneNumber']}")
print(f"Phone Status: {result['data']['phoneStatus']}")
print(f"Address: {result['data']['address']}")
print(f"Gender: {result['data']['gender']}")
print(f"Linked ID: {result['data']['linkedId']}")
```

---

## Complete Usage Example

### JavaScript Implementation

```javascript
class PersonalInfoManager {
  constructor(apiBaseUrl, accessToken) {
    this.apiBaseUrl = apiBaseUrl;
    this.accessToken = accessToken;
  }

  async getPersonalInfo() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/user/personal-info`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch personal info");
      }

      console.log("\n👤 Personal Information");
      console.log("━".repeat(50));
      console.log(`Name:          ${result.data.fullName}`);
      console.log(`Email:         ${result.data.email}`);
      console.log(`Email Status:  ${result.data.emailStatus}`);
      console.log(`Phone:         ${result.data.phoneNumber}`);
      console.log(`Phone Status:  ${result.data.phoneStatus}`);
      console.log(`Address:       ${result.data.address}`);
      console.log(`Gender:        ${result.data.gender}`);
      console.log(`Linked ID:     ${result.data.linkedId}`);
      console.log("━".repeat(50));

      return result.data;
    } catch (error) {
      console.error("❌ Failed to fetch personal info:", error.message);
      throw error;
    }
  }

  async displayInProfile() {
    const info = await this.getPersonalInfo();

    // Display in UI
    document.getElementById("profile-name").textContent = info.fullName;
    document.getElementById("profile-email").textContent = info.email;
    document.getElementById("profile-phone").textContent = info.phoneNumber;
    document.getElementById("profile-address").textContent = info.address;
    document.getElementById("profile-gender").textContent = info.gender;
  }

  formatForDisplay(info) {
    return {
      display: [
        { label: "Full Name", value: info.fullName },
        { label: "Email Address", value: info.email },
        { label: "Phone Number", value: info.phoneNumber },
        { label: "Address", value: info.address },
        { label: "Gender", value: this.capitalizeGender(info.gender) },
      ],
    };
  }

  capitalizeGender(gender) {
    return gender.charAt(0).toUpperCase() + gender.slice(1);
  }
}

// Usage
const infoManager = new PersonalInfoManager(
  "https://identity.syncnexa.com/api/v1",
  "your-access-token",
);

// Fetch and display personal info
const personalInfo = await infoManager.getPersonalInfo();

// Format for display
const formatted = infoManager.formatForDisplay(personalInfo);
console.log(formatted);
```

---

## Python Implementation

```python
import requests
from typing import Dict, Optional

class PersonalInfoManager:
    def __init__(self, api_base_url: str, access_token: str):
        self.api_base_url = api_base_url
        self.access_token = access_token
        self.headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }

    def get_personal_info(self) -> Dict:
        """Fetch personal information"""
        try:
            response = requests.get(
                f'{self.api_base_url}/user/personal-info',
                headers=self.headers
            )

            result = response.json()

            if not response.ok:
                raise Exception(result.get('message', 'Failed to fetch personal info'))

            print('\n👤 Personal Information')
            print('━' * 50)
            print(f"Name:    {result['data']['fullName']}")
            print(f"Email:   {result['data']['email']}")
            print(f"Phone:   {result['data']['phoneNumber']}")
            print(f"Address: {result['data']['address']}")
            print(f"Gender:  {result['data']['gender']}")
            print('━' * 50)

            return result['data']
        except Exception as e:
            print(f'❌ Failed to fetch personal info: {e}')
            raise

    def format_for_display(self, info: Dict) -> Dict:
        """Format personal info for display"""
        return {
            'display': [
                {'label': 'Full Name', 'value': info['fullName']},
                {'label': 'Email Address', 'value': info['email']},
                {'label': 'Email Status', 'value': info['emailStatus']},
                {'label': 'Phone Number', 'value': info['phoneNumber']},
                {'label': 'Phone Status', 'value': info['phoneStatus']},
                {'label': 'Address', 'value': info['address']},
                {'label': 'Gender', 'value': info['gender'].capitalize()},
                {'label': 'Linked ID', 'value': info['linkedId'] or 'Not set'}
            ]
        }

    def validate_email(self, email: str) -> bool:
        """Validate email format"""
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))

    def validate_phone(self, phone: str) -> bool:
        """Validate phone number format"""
        import re
        # Basic phone validation (adjust pattern as needed)
        pattern = r'^\+?[1-9]\d{1,14}$'
        return bool(re.match(pattern, phone))


# Usage
info_manager = PersonalInfoManager(
    'https://identity.syncnexa.com/api/v1',
    'your-access-token'
)

# Fetch and display personal info
personal_info = info_manager.get_personal_info()

# Format for display
formatted = info_manager.format_for_display(personal_info)
print(formatted)
```

---

## Edge Cases

| Scenario                  | Behavior                                                |
| ------------------------- | ------------------------------------------------------- |
| Missing address           | Returns empty string for address field                  |
| User not found            | Returns 404 error                                       |
| Invalid token             | Returns 401 unauthorized error                          |
| Non-student role          | Returns 403 forbidden (endpoint restricted to students) |
| Database connection error | Returns 500 internal server error                       |

---

## Best Practices

### Data Usage

- **Cache Appropriately**: Cache personal info but refresh periodically
- **Validate Data**: Check for empty or null fields before display
- **Privacy Protection**: Only display necessary information
- **Secure Storage**: Don't store sensitive info in local storage
- **Update Promptly**: Refresh after profile updates

### Error Handling

- **Network Errors**: Implement retry logic with exponential backoff
- **Validation**: Validate data format before using
- **User Feedback**: Show clear error messages to users
- **Fallback Display**: Have default values for missing data
- **Logging**: Log errors for debugging without exposing user data

### UI/UX

- **Loading States**: Show loading indicator while fetching
- **Placeholder Text**: Use placeholders for missing data
- **Editable Fields**: Link to profile edit page
- **Format Consistently**: Use consistent formatting across app
- **Accessibility**: Ensure info is accessible to screen readers

---

## Integration Examples

### React Component

```javascript
import { useState, useEffect } from "react";

function PersonalInfoCard() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchInfo() {
      try {
        const response = await fetch("/api/v1/user/personal-info", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (response.ok) {
          setInfo(result.data);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError("Failed to load personal information");
      } finally {
        setLoading(false);
      }
    }

    fetchInfo();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!info) return null;

  return (
    <div className="personal-info-card">
      <h2>Personal Information</h2>
      <div className="info-row">
        <label>Name:</label>
        <span>{info.fullName}</span>
      </div>
      <div className="info-row">
        <label>Email:</label>
        <span>{info.email}</span>
        <span className="status">{info.emailStatus}</span>
      </div>
      <div className="info-row">
        <label>Phone:</label>
        <span>{info.phoneNumber}</span>
        <span className="status">{info.phoneStatus}</span>
      </div>
      <div className="info-row">
        <label>Address:</label>
        <span>{info.address || "Not provided"}</span>
      </div>
      <div className="info-row">
        <label>Gender:</label>
        <span>{info.gender}</span>
      </div>
    </div>
  );
}
```

---

## Verification Status

The personal info endpoint includes verification status for email and phone to indicate whether they have been verified by the user.

### Status Values

| Status   | Meaning                                                          | Action Needed                     |
| -------- | ---------------------------------------------------------------- | --------------------------------- |
| pending  | User has not initiated verification for this contact method      | User should initiate verification |
| verified | Contact method has been verified and confirmed by the user       | None required                     |
| failed   | Previous verification attempt failed or verification has expired | User should retry verification    |

### Email Status Examples

```javascript
// Check if email is verified
const isEmailVerified = personalInfo.emailStatus === "verified";

// Prompt user to verify email if pending
if (personalInfo.emailStatus === "pending") {
  showAlert("Please verify your email to unlock all features");
}

// Show error message if verification failed
if (personalInfo.emailStatus === "failed") {
  showAlert("Email verification failed. Please try again.");
}
```

### Phone Status Examples

```javascript
// Check if phone is verified
const isPhoneVerified = personalInfo.phoneStatus === "verified";

// Display verification requirement
if (personalInfo.phoneStatus !== "verified") {
  displayVerificationPrompt("phone", personalInfo.phoneStatus);
}

// Get verification status badge
function getStatusBadge(status) {
  const badges = {
    verified: { color: "green", icon: "✓", text: "Verified" },
    pending: { color: "yellow", icon: "○", text: "Pending" },
    failed: { color: "red", icon: "✗", text: "Failed" },
  };
  return badges[status] || badges.pending;
}
```

---

## Security Considerations

### Authentication

- **Token Required**: All requests must include valid Bearer token
- **Role Authorization**: Only students can access this endpoint
- **Token Expiry**: Tokens expire after configured time
- **Secure Transmission**: Always use HTTPS

### Privacy

- **Personal Data**: Information is sensitive and should be protected
- **Access Control**: Only user can access their own information
- **Data Minimization**: Only returns necessary fields
- **Audit Logging**: Access logged for security monitoring

---

## Linked ID - Resource Reference

The `linkedId` field is a unique UUID that serves as a reference to user's uploaded resources instead of using file paths. This approach decouples database records from the file system structure, making it safe to refactor folder structures without affecting database records.

### Purpose

- **Decouple Storage**: Separate database records from file paths
- **Flexibility**: Change folder structure without updating database
- **Security**: Hide actual file locations from database
- **Migration Safety**: Move resources without breaking references

### Resource Naming Convention

Resources are named using a prefix followed by the linked_id UUID:

| Resource Type | Naming Pattern            | Example Path                              |
| ------------- | ------------------------- | ----------------------------------------- |
| Profile Image | `profile_{linkedId}.ext`  | `/uploads/profiles/profile_f47ac10b.png`  |
| Document      | `doc_{linkedId}.ext`      | `/uploads/documents/doc_f47ac10b.pdf`     |
| Certificate   | `cert_{linkedId}.ext`     | `/uploads/certificates/cert_f47ac10b.pdf` |
| Academic      | `academic_{linkedId}.ext` | `/uploads/academic/academic_f47ac10b.pdf` |

### Using Linked ID

```javascript
// Get user's personal info
const response = await fetch("/user/personal-info", {
  headers: { Authorization: `Bearer ${token}` },
});

const { data } = await response.json();
const linkedId = data.linkedId;

// Construct resource path at runtime
function getProfileImageUrl(linkedId) {
  if (!linkedId) return "/images/default-avatar.png";
  return `/uploads/profiles/profile_${linkedId}.png`;
}

// Usage
const profileImageUrl = getProfileImageUrl(linkedId);
document.getElementById("avatar").src = profileImageUrl;
```

### Benefits

1. **Flexibility**: Move uploads directory without updating database
2. **Cleanliness**: No file paths stored in database
3. **Security**: Paths are constructed at runtime
4. **Scalability**: Add new resource types without schema changes
5. **Recovery**: Can rebuild paths if needed

---

## Related Documentation

- **[User Registration](/docs/authentication/user-registration)** - Register and set personal info
- **[User Login](/docs/authentication/user-login)** - Authenticate to access personal info
- **[Documents](/docs/student/documents)** - Manage identity documents
- **[Academic Records](/docs/student/academic-records)** - Educational information
