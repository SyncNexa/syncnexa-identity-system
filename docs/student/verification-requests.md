# Verification Requests

Complete documentation for requesting institution verification of your credentials.

---

## Overview

The Verification Requests feature allows you to request that your educational institutions or employers verify your credentials, academic records, or employment history. Institutions can approve, reject, or request additional information.

**Use Cases:**

- Request your university to verify your degree
- Ask former employers to verify employment history
- Get credentials verified for job applications
- Build trust through institution verification
- Create verifiable credentials for sharing

**Authentication:** All endpoints require authentication via Bearer token.

---

## 1. Create Verification Request

**Name:** Create Institution Verification Request

**Description:** Submits a request for an institution to verify your credentials or academic records.

**Route:** `POST /user/verification-requests`

**Authentication Required:** Yes

### Request Payload

```json
{
  "institution_name": "University of Lagos",
  "institution_email": "registrar@unilag.edu.ng",
  "request_type": "academic",
  "details": {
    "degree": "Bachelor of Science in Computer Science",
    "graduation_year": "2022",
    "student_id": "UL/18/CS/1234"
  },
  "message": "Please verify my academic credentials for employment purposes."
}
```

### Field Requirements

| Field             | Type   | Required | Description                                       |
| ----------------- | ------ | -------- | ------------------------------------------------- |
| institution_name  | string | Yes      | Name of the institution                           |
| institution_email | string | Yes      | Contact email for the institution                 |
| request_type      | string | Yes      | "academic", "employment", or "professional"       |
| details           | object | No       | Specific details to be verified                   |
| message           | string | No       | Custom message to the institution (max 500 chars) |

### Request Example (JavaScript)

```javascript
async function createVerificationRequest(accessToken, requestData) {
  const response = await fetch(
    "https://identity.syncnexa.com/api/v1/user/verification-requests",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    },
  );

  return await response.json();
}

// Usage
const request = await createVerificationRequest(accessToken, {
  institution_name: "University of Lagos",
  institution_email: "registrar@unilag.edu.ng",
  request_type: "academic",
  details: {
    degree: "Bachelor of Science in Computer Science",
    graduation_year: "2022",
  },
  message: "Please verify my degree for a job application.",
});
```

### Success Response (201 Created)

```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Verification request created",
  "data": {
    "id": "inst-ver-950e8400-e29b-41d4-a716-446655440005",
    "user_id": "user-123e4567-e89b-12d3-a456-426614174000",
    "institution_name": "University of Lagos",
    "institution_email": "registrar@unilag.edu.ng",
    "request_type": "academic",
    "request_status": "pending",
    "details": {
      "degree": "Bachelor of Science in Computer Science",
      "graduation_year": "2022",
      "student_id": "UL/18/CS/1234"
    },
    "message": "Please verify my academic credentials for employment purposes.",
    "requested_at": "2026-01-11T14:00:00.000Z",
    "expires_at": "2026-02-10T14:00:00.000Z"
  }
}
```

### Error Responses

#### 400 Bad Request - Invalid Request Type

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "request_type",
      "message": "Must be academic, employment, or professional"
    }
  ]
}
```

#### 409 Conflict - Duplicate Request

```json
{
  "status": "error",
  "statusCode": 409,
  "message": "A verification request for this institution already exists"
}
```

---

## 2. Retrieve Verification Requests

**Name:** Get My Verification Requests

**Description:** Lists all verification requests you've made.

**Route:** `GET /user/verification-requests`

**Authentication Required:** Yes

### Query Parameters

| Parameter | Type   | Required | Description                                         |
| --------- | ------ | -------- | --------------------------------------------------- |
| status    | string | No       | Filter by status: "pending", "approved", "rejected" |
| skip      | number | No       | Pagination: skip N items                            |
| limit     | number | No       | Pagination: return max N items                      |

### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Verification requests",
  "data": [
    {
      "id": "inst-ver-950e8400-e29b-41d4-a716-446655440005",
      "institution_name": "University of Lagos",
      "request_type": "academic",
      "request_status": "approved",
      "requested_at": "2026-01-11T14:00:00.000Z",
      "verified_at": "2026-01-15T10:30:00.000Z"
    },
    {
      "id": "inst-ver-950e8400-e29b-41d4-a716-446655440006",
      "institution_name": "Tech Corporation",
      "request_type": "employment",
      "request_status": "pending",
      "requested_at": "2026-01-20T09:15:00.000Z"
    }
  ]
}
```

---

## 3. Get Request Status

**Name:** Get Verification Request Status

**Description:** Checks the status of a specific verification request.

**Route:** `GET /user/verification-requests/:id`

**Authentication Required:** Yes

### Path Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| id        | string | Yes      | Request ID  |

### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Verification request",
  "data": {
    "id": "inst-ver-950e8400-e29b-41d4-a716-446655440005",
    "institution_name": "University of Lagos",
    "request_type": "academic",
    "request_status": "approved",
    "details": {
      "degree": "Bachelor of Science in Computer Science",
      "graduation_year": "2022"
    },
    "requested_at": "2026-01-11T14:00:00.000Z",
    "verified_at": "2026-01-15T10:30:00.000Z",
    "expires_at": "2027-01-15T10:30:00.000Z"
  }
}
```

### Request Status Values

| Status      | Meaning                                    |
| ----------- | ------------------------------------------ |
| `pending`   | Waiting for institution response           |
| `approved`  | Institution verified your credentials      |
| `rejected`  | Institution rejected the verification      |
| `expired`   | Request expired (30 days without response) |
| `cancelled` | You cancelled the request                  |

---

## 4. Cancel Verification Request

**Name:** Cancel Verification Request

**Description:** Cancels a pending verification request.

**Route:** `DELETE /user/verification-requests/:id`

**Authentication Required:** Yes

### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Verification request cancelled"
}
```

### Error Responses

#### 400 Bad Request - Already Completed

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Cannot cancel a completed verification"
}
```

#### 404 Not Found

```json
{
  "status": "error",
  "statusCode": 404,
  "message": "Verification request not found"
}
```

---

## Examples

### Complete Verification Flow

```javascript
// 1. Create a verification request
const verifyResponse = await fetch(
  "https://identity.syncnexa.com/api/v1/user/verification-requests",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      institution_name: "University of Lagos",
      institution_email: "registrar@unilag.edu.ng",
      request_type: "academic",
      details: {
        degree: "Bachelor of Science in Computer Science",
        graduation_year: "2022",
        student_id: "UL/18/CS/1234",
      },
      message: "Kindly verify my degree for employment.",
    }),
  },
);

const requestData = await verifyResponse.json();
const requestId = requestData.data.id;
console.log("Request created:", requestId);

// 2. Check status after some time
setTimeout(async () => {
  const statusResponse = await fetch(
    `https://identity.syncnexa.com/api/v1/user/verification-requests/${requestId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  const statusData = await statusResponse.json();
  console.log("Request status:", statusData.data.request_status);

  if (statusData.data.request_status === "approved") {
    console.log("✓ Verification approved!");
    console.log("Verified at:", statusData.data.verified_at);
  }
}, 5000); // Check after 5 seconds
```

### Python Example: Batch Verification Requests

```python
import requests
from datetime import datetime

class VerificationManager:
    def __init__(self, access_token):
        self.base_url = 'https://identity.syncnexa.com/api/v1'
        self.headers = {'Authorization': f'Bearer {access_token}'}

    def request_batch_verification(self, institutions):
        """Request verification from multiple institutions"""
        results = []

        for inst in institutions:
            response = requests.post(
                f'{self.base_url}/user/verification-requests',
                headers=self.headers,
                json={
                    'institution_name': inst['name'],
                    'institution_email': inst['email'],
                    'request_type': inst.get('type', 'academic'),
                    'details': inst.get('details', {})
                }
            )

            if response.status_code == 201:
                results.append({
                    'institution': inst['name'],
                    'status': 'requested',
                    'id': response.json()['data']['id']
                })
            else:
                results.append({
                    'institution': inst['name'],
                    'status': 'failed',
                    'error': response.json()['message']
                })

        return results

    def check_all_requests(self):
        """Get status of all pending requests"""
        response = requests.get(
            f'{self.base_url}/user/verification-requests?status=pending',
            headers=self.headers
        )

        return response.json()['data']

# Usage
manager = VerificationManager(access_token)

institutions = [
    {
        'name': 'University of Lagos',
        'email': 'registrar@unilag.edu.ng',
        'type': 'academic'
    },
    {
        'name': 'Tech Corporation',
        'email': 'hr@techcorp.ng',
        'type': 'employment'
    }
]

results = manager.request_batch_verification(institutions)
for result in results:
    print(f"{result['institution']}: {result['status']}")

# Check pending requests
pending = manager.check_all_requests()
print(f"Pending verifications: {len(pending)}")
```

---

## Best Practices

### Before Requesting

- Ensure your information is complete and accurate
- Have the correct institution email address
- Check that the institution has a verification process
- Prepare any supporting documents

### Request Management

- Keep track of request IDs
- Follow up if no response within 2 weeks
- Cancel duplicates to avoid confusion
- Save verification certificates when approved

### Institution Communication

- Be specific in your message
- Include student/employee ID
- Mention the purpose (job application, further study, etc.)
- Be polite and professional

---

## Related Features

- **[Student Card](/docs/student/student-card)** - Digital student identity
- **[Verification Tokens](/docs/student/verification-tokens)** - Shareable verification
- **[Documents](/docs/student/documents)** - Upload supporting documents
