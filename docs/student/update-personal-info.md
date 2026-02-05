# Update Personal Information

Update the personal information of the authenticated student. You can update fields individually or in combination.

## Endpoint

```
PATCH /user/personal-info
```

## Authentication

Requires a valid Bearer token. Only accessible by users with the `student` role.

## Headers

| Header        | Type   | Required | Description                     |
| ------------- | ------ | -------- | ------------------------------- |
| Authorization | string | Yes      | Bearer token for authentication |
| Content-Type  | string | Yes      | Must be `application/json`      |

## Request Body

All fields are optional. Only provide the fields you want to update.

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+234812345678",
  "address": "123 Main Street, Lagos, Nigeria",
  "gender": "male"
}
```

### Field Specifications

| Field       | Type   | Length | Validations         | Description                          |
| ----------- | ------ | ------ | ------------------- | ------------------------------------ |
| firstName   | string | 1-100  | Optional            | Student's first name                 |
| lastName    | string | 1-100  | Optional            | Student's last name                  |
| email       | string | -      | Valid email format  | Valid email address                  |
| phoneNumber | string | 7-20   | Optional            | Phone number in international format |
| address     | string | 0-255  | Optional            | Physical address                     |
| gender      | enum   | -      | male, female, other | Gender identifier                    |

### Important Notes

- **Date of birth** is NOT included in update payload (as per requirements)
- **Email Status** and **Phone Status** are read-only (managed by verification system)
- **Linked ID** is read-only (generated UUID for uploaded resources)
- At least one field must be provided to update
- Empty fields are ignored (null/undefined values don't overwrite existing data)

## Response Format

### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Personal information updated",
  "data": {
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "emailStatus": "verified",
    "phoneNumber": "+234812345678",
    "phoneStatus": "pending",
    "address": "123 Main Street, Lagos, Nigeria",
    "gender": "male",
    "linkedId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

### Error Responses

#### 400 Bad Request

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Invalid email format",
  "errors": ["email must be a valid email"]
}
```

#### 401 Unauthorized

```json
{
  "status": "error",
  "statusCode": 401,
  "message": "Unauthorized access",
  "errors": []
}
```

#### 403 Forbidden

```json
{
  "status": "error",
  "statusCode": 403,
  "message": "Access forbidden",
  "errors": []
}
```

#### 404 Not Found

```json
{
  "status": "error",
  "statusCode": 404,
  "message": "Personal information not found",
  "errors": []
}
```

#### 500 Internal Server Error

```json
{
  "status": "error",
  "statusCode": 500,
  "message": "Could not update personal information",
  "errors": []
}
```

## Response Fields

| Field       | Type   | Description                                                   |
| ----------- | ------ | ------------------------------------------------------------- |
| fullName    | string | Combined first and last name (read from updated values)       |
| email       | string | Email address                                                 |
| emailStatus | string | Email verification status: `pending`, `verified`, or `failed` |
| phoneNumber | string | Phone number                                                  |
| phoneStatus | string | Phone verification status: `pending`, `verified`, or `failed` |
| address     | string | Physical address                                              |
| gender      | enum   | Gender: `male`, `female`, or `other`                          |
| linkedId    | string | UUID reference for uploaded resources (read-only)             |

## Validation Rules

### Email

- Must be a valid email format
- Must be unique across the system
- Example: `user@example.com`

### Phone Number

- Must be 7-20 characters long
- Should include country code for international numbers
- Examples: `+234812345678`, `08012345678`, `+1234567890`

### Name Fields

- First name and last name: 1-100 characters
- Cannot be empty strings (omit field if not updating)
- Supports Unicode characters

### Address

- Maximum 255 characters
- Can include street, city, state, country
- Example: `123 Main Street, Lagos, Nigeria`

### Gender

- Must be one of: `male`, `female`, `other`
- Case-sensitive lowercase values

## Example Requests

### JavaScript (Fetch API)

```javascript
const token = "your_access_token_here";

const updates = {
  firstName: "John",
  lastName: "Doe",
  phoneNumber: "+234812345678",
  address: "456 New Street, Abuja, Nigeria",
};

fetch("https://api.syncnexa.com/user/personal-info", {
  method: "PATCH",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(updates),
})
  .then((response) => response.json())
  .then((data) => {
    if (data.status === "success") {
      console.log("Updated Successfully:", data.data);
      console.log("New Name:", data.data.fullName);
      console.log("New Phone:", data.data.phoneNumber);
    } else {
      console.error("Update failed:", data.message);
    }
  })
  .catch((error) => {
    console.error("Error:", error);
  });
```

### JavaScript (Axios)

```javascript
const axios = require("axios");

const token = "your_access_token_here";

const updates = {
  email: "newemail@example.com",
  gender: "female",
};

axios
  .patch("https://api.syncnexa.com/user/personal-info", updates, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  .then((response) => {
    console.log("Updated Successfully:", response.data.data);
    console.log("Email:", response.data.data.email);
    console.log("Gender:", response.data.data.gender);
  })
  .catch((error) => {
    console.error("Error:", error.response?.data || error.message);
  });
```

### cURL

```bash
curl -X PATCH https://api.syncnexa.com/user/personal-info \
  -H "Authorization: Bearer your_access_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "address": "789 Park Avenue, Ibadan, Nigeria"
  }'
```

### Python (Requests)

```python
import requests
import json

token = 'your_access_token_here'
url = 'https://api.syncnexa.com/user/personal-info'

headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

payload = {
    'firstName': 'Michael',
    'lastName': 'Johnson',
    'phoneNumber': '+234902345678',
    'gender': 'male'
}

response = requests.patch(url, headers=headers, json=payload)
data = response.json()

if response.status_code == 200:
    updated_info = data['data']
    print(f"Update successful!")
    print(f"Full Name: {updated_info['fullName']}")
    print(f"Phone: {updated_info['phoneNumber']}")
    print(f"Address: {updated_info['address']}")
else:
    print(f"Error: {data['message']}")
    if 'errors' in data:
        print(f"Validation errors: {data['errors']}")
```

### Node.js (Native HTTPS)

```javascript
const https = require("https");

const token = "your_access_token_here";
const payload = JSON.stringify({
  address: "321 Oak Lane, Port Harcourt, Nigeria",
  phoneNumber: "+234813456789",
});

const options = {
  hostname: "api.syncnexa.com",
  path: "/user/personal-info",
  method: "PATCH",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "Content-Length": payload.length,
  },
};

const req = https.request(options, (res) => {
  let data = "";

  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    const response = JSON.parse(data);
    if (res.statusCode === 200) {
      console.log("Personal info updated successfully!");
      console.log(response.data);
    } else {
      console.error("Update failed:", response.message);
    }
  });
});

req.on("error", (error) => {
  console.error("Request Error:", error);
});

req.write(payload);
req.end();
```

## Partial Update Example

You can update individual fields:

```javascript
// Update only email
const emailUpdate = {
  email: "newemail@university.edu",
};

// Update only name
const nameUpdate = {
  firstName: "Sarah",
  lastName: "Williams",
};

// Update only address
const addressUpdate = {
  address: "Apartment 4B, 200 Lekki Road, Lagos, Nigeria",
};
```

## Update Patterns

### Scenario 1: Update Name and Gender

```json
{
  "firstName": "Chioma",
  "lastName": "Okonkwo",
  "gender": "female"
}
```

### Scenario 2: Update Contact Information

```json
{
  "email": "chioma.okonkwo@mail.com",
  "phoneNumber": "+234906789012"
}
```

### Scenario 3: Update Address Only

```json
{
  "address": "Flat 5, Villa complex, Ikoyi, Lagos"
}
```

## Important Behavior

### Field Handling

- **Provided Fields**: Updated in the database
- **Omitted Fields**: Remain unchanged
- **Null/Undefined Values**: Ignored (do not overwrite existing data)
- **Empty Strings**: May overwrite existing data (be careful!)

### Response Format

After successful update, the endpoint returns the complete updated personal info object, including:

- The updated fields you just modified
- Unchanged fields (verification status, linked ID, etc.)
- Read-only fields (maintained by system)

### Verification Status

- Email status and phone status are NOT affected by updates
- These are managed by the verification system independently
- They indicate the current verification state of those contact methods

## Use Cases

1. **Profile Completion**: Fill in missing personal information after registration
2. **Address Update**: Keep residential address current
3. **Contact Information**: Update phone number or email
4. **Demographic Information**: Update gender or other personal details
5. **Name Change**: Update name fields due to legal name change

## Data Validation Examples

### Valid Request

```json
{
  "firstName": "Ahmed",
  "email": "ahmed@example.com",
  "phoneNumber": "+234701234567"
}
```

### Invalid Request (Email Format)

```json
{
  "email": "invalid-email-format"
}
```

**Error**: Email must be in valid format

### Invalid Request (Phone Length)

```json
{
  "phoneNumber": "123"
}
```

**Error**: Phone number must be 7-20 characters

## Notes

- Updates are applied immediately to the database
- The response includes the updated data as it exists after the update
- Email uniqueness is validated - cannot update to an email already in use
- No date of birth field is supported in this endpoint
- Linked ID is generated on account creation and cannot be changed

## Related Endpoints

- [Get Personal Information](personal-info.md) - Retrieve your current personal information
- [Get Current User Info](me.md) - Get minimal user information
- [Get Academic Details](academic-details.md) - Retrieve academic enrollment details
- [Verification Requests](verification-requests.md) - Request institutional verification

## Security Considerations

- Only authenticated students can update their own information
- Email updates trigger re-verification (status resets to pending)
- Phone updates may trigger re-verification
- All updates are logged in activity records
- Personal information is treated as sensitive data

## Best Practices

1. **Validate Locally**: Validate email and phone format before sending
2. **Handle Partial Updates**: You don't need to send all fields
3. **Error Handling**: Always check response status before processing
4. **Confirmation**: Consider confirming significant changes with user
5. **Privacy**: Don't log or display sensitive updates unnecessarily
6. **Batch Updates**: Combine multiple field updates in one request

## Troubleshooting

### Email Already Exists

```
Error: Email already in use by another account
```

**Solution**: Choose a different email address or verify ownership

### Invalid Phone Format

```
Error: Phone number must be 7-20 characters
```

**Solution**: Use valid international format like +234812345678

### Validation Failed

```
Error: Invalid email format or Phone number too short
```

**Solution**: Check all field formats against validation rules

### Unauthorized (403)

```
Error: Access forbidden
```

**Solution**: Only students can update their personal info. Check your user role.

## Changelog

### Version 1.0.0 (February 2026)

- Initial release
- Support for updating all personal information fields except date of birth
- Includes comprehensive validation
- Returns full updated personal info object
