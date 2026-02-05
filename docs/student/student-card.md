# Student Card

Complete documentation for creating and managing your digital student card.

---

## Overview

The Student Card feature allows students to create a digital identity card that represents their student status. This card can be used for identification, shared as proof of enrollment, and used to generate verification tokens for various purposes.

**Use Cases:**

- Create official digital student identification
- Prove student status to third parties
- Generate time-limited verification tokens
- Use for discounts and access control
- Share with employers for verification

**Authentication:** All endpoints require authentication via Bearer token.

---

## 1. Create Student Card

**Name:** Create Digital Student Card

**Description:** Generates a digital student card tied to your student profile with verified information from your academic records.

**Route:** `POST /user/cards`

**Authentication Required:** Yes

### Request Payload

```json
{
  "institution": "University of Lagos",
  "student_id": "UL/18/CS/1234",
  "degree": "Computer Science",
  "year_of_study": "Final Year",
  "valid_from": "2024-09-01",
  "valid_until": "2025-08-31",
  "metadata": {
    "faculty": "Science",
    "department": "Computer Science",
    "matriculation_year": "2021"
  }
}
```

### Field Requirements

| Field         | Type   | Required | Description                       |
| ------------- | ------ | -------- | --------------------------------- |
| institution   | string | Yes      | Name of your institution          |
| student_id    | string | Yes      | Your official student ID          |
| degree        | string | Yes      | Your degree/program               |
| year_of_study | string | No       | Current year (e.g., "Final Year") |
| valid_from    | string | No       | Validity start date (YYYY-MM-DD)  |
| valid_until   | string | No       | Validity end date (YYYY-MM-DD)    |
| metadata      | object | No       | Additional information            |

### Request Example (JavaScript)

```javascript
async function createStudentCard(accessToken, cardData) {
  const response = await fetch(
    "https://identity.syncnexa.com/api/v1/user/cards",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cardData),
    },
  );

  return await response.json();
}

// Usage
const card = await createStudentCard(accessToken, {
  institution: "University of Lagos",
  student_id: "UL/18/CS/1234",
  degree: "Computer Science",
  valid_from: "2024-09-01",
  valid_until: "2025-08-31",
});
```

### Success Response (201 Created)

```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Student card created",
  "data": {
    "id": "card-a50e8400-e29b-41d4-a716-446655440006",
    "user_id": "user-123e4567-e89b-12d3-a456-426614174000",
    "card_number": "SC-UL-18-CS-1234-001",
    "institution": "University of Lagos",
    "student_id": "UL/18/CS/1234",
    "degree": "Computer Science",
    "year_of_study": "Final Year",
    "valid_from": "2024-09-01",
    "valid_until": "2025-08-31",
    "is_active": true,
    "metadata": {
      "faculty": "Science",
      "department": "Computer Science",
      "matriculation_year": "2021"
    },
    "created_at": "2026-01-11T14:30:00.000Z"
  }
}
```

### Error Responses

#### 400 Bad Request - Missing Required Field

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [{ "field": "institution", "message": "institution is required" }]
}
```

#### 409 Conflict - Card Already Exists

```json
{
  "status": "error",
  "statusCode": 409,
  "message": "A student card already exists for this user"
}
```

---

## 2. Retrieve Student Card

**Name:** Get My Student Card

**Description:** Retrieves your active student card information.

**Route:** `GET /user/cards`

**Authentication Required:** Yes

### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Student card",
  "data": {
    "id": "card-a50e8400-e29b-41d4-a716-446655440006",
    "card_number": "SC-UL-18-CS-1234-001",
    "institution": "University of Lagos",
    "student_id": "UL/18/CS/1234",
    "degree": "Computer Science",
    "valid_from": "2024-09-01",
    "valid_until": "2025-08-31",
    "is_active": true,
    "created_at": "2026-01-11T14:30:00.000Z"
  }
}
```

---

## 3. Update Student Card

**Name:** Update Student Card

**Description:** Updates information on your student card (e.g., when graduating to next year).

**Route:** `PATCH /user/cards`

**Authentication Required:** Yes

### Request Example

```javascript
const updated = await updateStudentCard(accessToken, {
  year_of_study: "Graduate",
  valid_until: "2026-08-31",
});
```

---

## 4. Generate Verification Token

**Name:** Generate Card Verification Token

**Description:** Generates a time-limited token that verifies your student status. This token can be shared with third parties for verification.

**Route:** `POST /user/cards/verification-token`

**Authentication Required:** Yes

### Request Payload

```json
{
  "expires_in": 3600,
  "purpose": "employer_verification"
}
```

### Field Requirements

| Field      | Type   | Required | Description                               |
| ---------- | ------ | -------- | ----------------------------------------- |
| expires_in | number | No       | Token lifetime in seconds (default: 3600) |
| purpose    | string | No       | Purpose of the token                      |

### Success Response (201 Created)

```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Verification token generated",
  "data": {
    "token": "SVT_abc123xyz789secure_token_string",
    "expires_at": "2026-01-11T17:00:00.000Z",
    "card_number": "SC-UL-18-CS-1234-001"
  }
}
```

---

## 5. Validate Card Token

**Name:** Validate Student Card Token

**Description:** Validates a student card verification token and returns the card information.

**Route:** `POST /user/cards/validate-token`

**Authentication Required:** No

### Request Payload

```json
{
  "token": "SVT_abc123xyz789secure_token_string"
}
```

### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Token valid",
  "data": {
    "institution": "University of Lagos",
    "degree": "Computer Science",
    "valid_until": "2025-08-31",
    "verified_at": "2026-01-11T16:30:00.000Z"
  }
}
```

### Error Response - Invalid Token

```json
{
  "status": "error",
  "statusCode": 401,
  "message": "Invalid or expired token"
}
```

---

## Examples

### Generate and Share Card Token

```javascript
// 1. Generate a verification token
const tokenResponse = await fetch(
  "https://identity.syncnexa.com/api/v1/user/cards/verification-token",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      expires_in: 86400, // 24 hours
      purpose: "employer_verification",
    }),
  },
);

const tokenData = await tokenResponse.json();
const verificationLink = `https://identity.syncnexa.com/verify/student?token=${tokenData.data.token}`;

// 2. Share this link with employer/institution
console.log("Share this link:", verificationLink);

// 3. Employer validates using the token
const validateResponse = await fetch(
  "https://identity.syncnexa.com/api/v1/user/cards/validate-token",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: tokenData.data.token }),
  },
);

const cardInfo = await validateResponse.json();
console.log("Verified student info:", cardInfo.data);
```

---

## Related Features

- **[Documents](/docs/student/documents)** - Identity verification
- **[Verification Tokens](/docs/student/verification-tokens)** - General token management
