# Academic Records Verification

Complete documentation for verifying academic credentials, transcripts, and educational qualifications.

---

## Overview

Academic records verification enables institutions, employers, and third parties to validate educational credentials, degrees, and academic achievements. The system supports direct institution verification requests, transcript validation, and academic record authentication.

**Use Cases:**

- Employment background checks
- Graduate school applications
- Professional licensing
- Scholarship verification
- Credential authentication
- Employer verification requests

**Authentication:** Required - user must be authenticated

---

## Create Institution Verification Request

**Name:** Request Academic Credential Verification

**Description:** Submits a verification request to an institution (university, college, employer) to validate academic credentials, employment history, or professional records. The institution receives the request via email and can approve or reject it through a secure verification link.

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
    "student_id": "UL/18/CS/1234",
    "gpa": "3.85"
  },
  "message": "Please verify my academic credentials for employment purposes with TechCorp Nigeria.",
  "metadata": {
    "requester": "TechCorp Nigeria HR",
    "verification_deadline": "2026-03-01"
  }
}
```

### Field Requirements

| Field             | Type   | Required | Description                                    |
| ----------------- | ------ | -------- | ---------------------------------------------- |
| institution_name  | string | Yes      | Name of the institution                        |
| institution_email | string | Yes      | Contact email for verification                 |
| request_type      | string | Yes      | Type: `academic`, `employment`, `professional` |
| details           | object | No       | Specific details to be verified                |
| message           | string | No       | Custom message to institution                  |
| metadata          | object | No       | Additional context                             |

### Request Types

| Type         | Description                          | Typical Use             |
| ------------ | ------------------------------------ | ----------------------- |
| academic     | Degree, GPA, graduation verification | Employment, grad school |
| employment   | Job title, dates, responsibilities   | Background checks       |
| professional | Certifications, licenses             | Professional licensing  |

### Request Example (JavaScript)

```javascript
async function requestInstitutionVerification(accessToken, requestData) {
  try {
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

    const result = await response.json();

    if (!response.ok) {
      console.error("Verification request failed:", result.message);
      return null;
    }

    console.log("Verification request submitted to institution");
    return result.data;
  } catch (error) {
    console.error("Network error:", error);
    return null;
  }
}

// Usage - Academic verification
const academicVerification = await requestInstitutionVerification(accessToken, {
  institution_name: "University of Lagos",
  institution_email: "registrar@unilag.edu.ng",
  request_type: "academic",
  details: {
    degree: "Bachelor of Science in Computer Science",
    graduation_year: "2022",
    student_id: "UL/18/CS/1234",
    gpa: "3.85",
    honors: "First Class",
  },
  message: "Please verify my academic credentials for employment purposes.",
});

if (academicVerification) {
  console.log(`Request ID: ${academicVerification.id}`);
  console.log(`Status: ${academicVerification.request_status}`);
}

// Usage - Employment verification
const employmentVerification = await requestInstitutionVerification(
  accessToken,
  {
    institution_name: "TechCorp Nigeria",
    institution_email: "hr@techcorp.ng",
    request_type: "employment",
    details: {
      job_title: "Software Engineer",
      start_date: "2022-08-01",
      end_date: "2025-12-31",
      department: "Engineering",
    },
    message: "Please confirm my employment details.",
  },
);
```

### Request Example (cURL)

```bash
curl -X POST https://identity.syncnexa.com/api/v1/user/verification-requests \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "institution_name": "University of Lagos",
    "institution_email": "registrar@unilag.edu.ng",
    "request_type": "academic",
    "details": {
      "degree": "Bachelor of Science in Computer Science",
      "graduation_year": "2022",
      "student_id": "UL/18/CS/1234"
    },
    "message": "Please verify my academic credentials for employment purposes."
  }'
```

### Request Example (Python)

```python
import requests
from datetime import datetime, timedelta

class AcademicVerificationService:
    def __init__(self, base_url='https://identity.syncnexa.com/api/v1'):
        self.base_url = base_url
        self.access_token = None

    def set_access_token(self, token):
        """Set access token for verification operations"""
        self.access_token = token

    def request_academic_verification(self, institution_name, institution_email,
                                      degree, graduation_year, student_id,
                                      gpa=None, message=''):
        """Request academic credential verification"""
        if not self.access_token:
            raise Exception("Not authenticated")

        headers = {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json'
        }

        details = {
            'degree': degree,
            'graduation_year': graduation_year,
            'student_id': student_id
        }

        if gpa:
            details['gpa'] = gpa

        payload = {
            'institution_name': institution_name,
            'institution_email': institution_email,
            'request_type': 'academic',
            'details': details,
            'message': message or f'Please verify my academic credentials.',
            'metadata': {
                'requested_at': datetime.now().isoformat()
            }
        }

        response = requests.post(
            f'{self.base_url}/user/verification-requests',
            headers=headers,
            json=payload
        )

        if response.status_code != 201:
            print(f"Request failed: {response.json()['message']}")
            return None

        data = response.json()['data']
        print(f"Verification request created: {data['id']}")
        return data

    def request_employment_verification(self, company_name, hr_email,
                                       job_title, start_date, end_date=None):
        """Request employment verification"""
        if not self.access_token:
            raise Exception("Not authenticated")

        headers = {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json'
        }

        details = {
            'job_title': job_title,
            'start_date': start_date
        }

        if end_date:
            details['end_date'] = end_date

        payload = {
            'institution_name': company_name,
            'institution_email': hr_email,
            'request_type': 'employment',
            'details': details,
            'message': f'Please verify my employment history.'
        }

        response = requests.post(
            f'{self.base_url}/user/verification-requests',
            headers=headers,
            json=payload
        )

        if response.status_code != 201:
            print(f"Request failed: {response.json()['message']}")
            return None

        return response.json()['data']

    def get_verification_request(self, request_id):
        """Get verification request status"""
        if not self.access_token:
            raise Exception("Not authenticated")

        headers = {
            'Authorization': f'Bearer {self.access_token}'
        }

        response = requests.get(
            f'{self.base_url}/user/verification-requests/{request_id}',
            headers=headers
        )

        if response.status_code != 200:
            return None

        return response.json()['data']

    def list_all_verification_requests(self, status=None):
        """List all verification requests"""
        if not self.access_token:
            raise Exception("Not authenticated")

        headers = {
            'Authorization': f'Bearer {self.access_token}'
        }

        params = {}
        if status:
            params['status'] = status

        response = requests.get(
            f'{self.base_url}/user/verification-requests',
            headers=headers,
            params=params
        )

        if response.status_code != 200:
            return []

        return response.json()['data']

    def cancel_verification_request(self, request_id):
        """Cancel a pending verification request"""
        if not self.access_token:
            raise Exception("Not authenticated")

        headers = {
            'Authorization': f'Bearer {self.access_token}'
        }

        response = requests.delete(
            f'{self.base_url}/user/verification-requests/{request_id}',
            headers=headers
        )

        return response.status_code == 200

# Usage
service = AcademicVerificationService()
service.set_access_token('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')

# Request academic verification
academic_request = service.request_academic_verification(
    institution_name='University of Lagos',
    institution_email='registrar@unilag.edu.ng',
    degree='Bachelor of Science in Computer Science',
    graduation_year='2022',
    student_id='UL/18/CS/1234',
    gpa='3.85',
    message='Please verify for employment with TechCorp'
)

print(f"Request ID: {academic_request['id']}")
print(f"Status: {academic_request['request_status']}")

# Request employment verification
employment_request = service.request_employment_verification(
    company_name='TechCorp Nigeria',
    hr_email='hr@techcorp.ng',
    job_title='Software Engineer',
    start_date='2022-08-01',
    end_date='2025-12-31'
)

# Check status
status = service.get_verification_request(academic_request['id'])
print(f"Current status: {status['request_status']}")
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
      "student_id": "UL/18/CS/1234",
      "gpa": "3.85"
    },
    "message": "Please verify my academic credentials for employment purposes with TechCorp Nigeria.",
    "metadata": {
      "requester": "TechCorp Nigeria HR",
      "verification_deadline": "2026-03-01"
    },
    "requested_at": "2026-02-05T14:00:00.000Z",
    "completed_at": null,
    "verification_token": "vtoken-12345678-abcd-efgh-ijkl-1234567890ab"
  }
}
```

### Error Responses

#### 400 Bad Request - Missing Required Fields

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    { "field": "institution_email", "message": "Valid email required" },
    {
      "field": "request_type",
      "message": "Must be: academic, employment, or professional"
    }
  ]
}
```

#### 409 Conflict - Duplicate Request

```json
{
  "status": "error",
  "statusCode": 409,
  "message": "You already have a pending verification request with this institution"
}
```

**What Happens:** A verification request to this institution is already pending. User should wait for completion or cancel the existing request.

---

## Get Verification Request Status

**Name:** Get Verification Request Details

**Description:** Retrieves the current status and details of an institution verification request.

**Route:** `GET /user/verification-requests/:id`

**Authentication Required:** Yes

### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Verification request",
  "data": {
    "id": "inst-ver-950e8400-e29b-41d4-a716-446655440005",
    "request_status": "approved",
    "institution_response": {
      "verified_by": "Dr. Jane Adeyemi",
      "position": "Registrar",
      "verification_date": "2026-02-06T10:30:00.000Z",
      "notes": "All credentials verified. Student graduated with First Class honors.",
      "verified_details": {
        "degree": "Bachelor of Science in Computer Science",
        "graduation_year": "2022",
        "gpa": "3.85",
        "honors": "First Class",
        "confirmed": true
      }
    },
    "requested_at": "2026-02-05T14:00:00.000Z",
    "completed_at": "2026-02-06T10:30:00.000Z"
  }
}
```

### Request Statuses

| Status    | Description                                        |
| --------- | -------------------------------------------------- |
| pending   | Institution hasn't responded yet                   |
| approved  | Institution confirmed credentials                  |
| rejected  | Institution couldn't verify or found discrepancies |
| expired   | Verification token expired (30 days)               |
| cancelled | User cancelled the request                         |

---

## List Verification Requests

**Name:** List All Verification Requests

**Description:** Retrieves all verification requests created by the user, with optional filtering by status.

**Route:** `GET /user/verification-requests`

**Authentication Required:** Yes

### Query Parameters

| Parameter | Type   | Required | Description                                                      |
| --------- | ------ | -------- | ---------------------------------------------------------------- |
| status    | string | No       | Filter by status: `pending`, `approved`, `rejected`, `cancelled` |
| type      | string | No       | Filter by type: `academic`, `employment`, `professional`         |
| limit     | number | No       | Max results per page (default: 20)                               |
| skip      | number | No       | Pagination offset                                                |

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
      "requested_at": "2026-02-05T14:00:00.000Z",
      "completed_at": "2026-02-06T10:30:00.000Z"
    },
    {
      "id": "inst-ver-950e8400-e29b-41d4-a716-446655440006",
      "institution_name": "TechCorp Nigeria",
      "request_type": "employment",
      "request_status": "pending",
      "requested_at": "2026-02-05T15:30:00.000Z",
      "completed_at": null
    }
  ]
}
```

---

## Cancel Verification Request

**Name:** Cancel Verification Request

**Description:** Cancels a pending verification request. Only pending requests can be cancelled.

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

### Error Response - Cannot Cancel

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Cannot cancel verification request. Status must be pending."
}
```

---

## Edge Cases

| Scenario                                  | Behavior                                          |
| ----------------------------------------- | ------------------------------------------------- |
| **Institution email bounces**             | Marked as failed; user notified                   |
| **No response after 30 days**             | Request expires; user can resubmit                |
| **Multiple requests to same institution** | Blocked if pending; allowed if previous completed |
| **Invalid institution email**             | Rejected at validation                            |
| **User cancels then recreates**           | New request created with new ID                   |
| **Institution requests more info**        | Status remains pending; notes added               |

---

## Examples

### Complete Academic Verification Workflow

```javascript
class AcademicVerificationWorkflow {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseURL = "https://identity.syncnexa.com/api/v1";
  }

  async submitVerification(institutionData) {
    // 1. Create verification request
    const response = await fetch(`${this.baseURL}/user/verification-requests`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(institutionData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }

    const requestId = result.data.id;
    console.log(`✓ Verification request submitted: ${requestId}`);

    return requestId;
  }

  async monitorStatus(requestId, onUpdate) {
    // 2. Poll for status updates
    return new Promise((resolve) => {
      const pollInterval = setInterval(async () => {
        const response = await fetch(
          `${this.baseURL}/user/verification-requests/${requestId}`,
          {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
            },
          },
        );

        const result = await response.json();
        const status = result.data.request_status;

        onUpdate(status);

        if (status !== "pending") {
          clearInterval(pollInterval);
          resolve(result.data);
        }
      }, 10000); // Poll every 10 seconds
    });
  }

  async execute(institutionData) {
    try {
      // Submit request
      const requestId = await this.submitVerification(institutionData);

      // Monitor status
      console.log("Waiting for institution response...");
      const finalResult = await this.monitorStatus(requestId, (status) => {
        console.log(`Status update: ${status}`);
      });

      if (finalResult.request_status === "approved") {
        console.log("✓ Verification approved!");
        console.log("Response:", finalResult.institution_response.notes);
        return true;
      } else {
        console.log("✗ Verification rejected");
        return false;
      }
    } catch (error) {
      console.error("Verification workflow failed:", error.message);
      return false;
    }
  }
}

// Usage
const workflow = new AcademicVerificationWorkflow(accessToken);

const success = await workflow.execute({
  institution_name: "University of Lagos",
  institution_email: "registrar@unilag.edu.ng",
  request_type: "academic",
  details: {
    degree: "B.Sc Computer Science",
    graduation_year: "2022",
    student_id: "UL/18/CS/1234",
  },
  message: "Please verify for employment with TechCorp",
});

if (success) {
  // Proceed with job application
  console.log("Credentials verified! Proceeding with application...");
}
```

### Python Batch Verification Manager

```python
import requests
import time
from datetime import datetime

class BatchVerificationManager:
    def __init__(self, base_url, access_token):
        self.base_url = base_url
        self.access_token = access_token
        self.headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }

    def submit_batch_verifications(self, verifications):
        """Submit multiple verification requests"""
        results = []

        for verification in verifications:
            response = requests.post(
                f'{self.base_url}/user/verification-requests',
                headers=self.headers,
                json=verification
            )

            if response.status_code == 201:
                data = response.json()['data']
                results.append({
                    'institution': verification['institution_name'],
                    'request_id': data['id'],
                    'status': 'submitted',
                    'requested_at': data['requested_at']
                })
            else:
                results.append({
                    'institution': verification['institution_name'],
                    'status': 'failed',
                    'error': response.json()['message']
                })

            time.sleep(1)  # Rate limiting

        return results

    def check_all_statuses(self, request_ids):
        """Check status of multiple requests"""
        statuses = []

        for request_id in request_ids:
            response = requests.get(
                f'{self.base_url}/user/verification-requests/{request_id}',
                headers=self.headers
            )

            if response.status_code == 200:
                data = response.json()['data']
                statuses.append({
                    'id': request_id,
                    'institution': data['institution_name'],
                    'status': data['request_status'],
                    'completed': data['completed_at'] is not None
                })

        return statuses

    def generate_report(self, statuses):
        """Generate verification status report"""
        total = len(statuses)
        approved = sum(1 for s in statuses if s['status'] == 'approved')
        pending = sum(1 for s in statuses if s['status'] == 'pending')
        rejected = sum(1 for s in statuses if s['status'] == 'rejected')

        print("\n" + "="*60)
        print("VERIFICATION STATUS REPORT")
        print("="*60)
        print(f"Total Requests: {total}")
        print(f"Approved: {approved} ({approved/total*100:.1f}%)")
        print(f"Pending: {pending} ({pending/total*100:.1f}%)")
        print(f"Rejected: {rejected} ({rejected/total*100:.1f}%)")

        print("\nDetailed Status:")
        for status in statuses:
            icon = "✓" if status['status'] == 'approved' else "⏳" if status['status'] == 'pending' else "✗"
            print(f"  {icon} {status['institution']}: {status['status']}")

# Usage
manager = BatchVerificationManager(
    'https://identity.syncnexa.com/api/v1',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
)

# Submit multiple verifications
verifications = [
    {
        'institution_name': 'University of Lagos',
        'institution_email': 'registrar@unilag.edu.ng',
        'request_type': 'academic',
        'details': {'degree': 'B.Sc CS', 'graduation_year': '2022'}
    },
    {
        'institution_name': 'TechCorp Nigeria',
        'institution_email': 'hr@techcorp.ng',
        'request_type': 'employment',
        'details': {'job_title': 'Software Engineer', 'start_date': '2022-08-01'}
    }
]

results = manager.submit_batch_verifications(verifications)
request_ids = [r['request_id'] for r in results if 'request_id' in r]

# Check statuses
statuses = manager.check_all_statuses(request_ids)
manager.generate_report(statuses)
```

---

## Best Practices

### Verification Requests

- **Accurate Information:** Ensure all details are correct before submitting
- **Professional Message:** Write clear, professional messages to institutions
- **Contact Verification:** Verify institution email addresses are correct
- **Follow Timeline:** Note typical response times (5-10 business days)
- **Documentation Ready:** Have supporting documents ready if requested

### Institution Communication

- **Official Channels:** Use official institutional email addresses
- **Context:** Provide context about why verification is needed
- **Deadline:** Mention if there's a deadline for verification
- **Follow Up:** Check status periodically
- **Thank You:** Send thank you note after completion

### Status Monitoring

- **Regular Checks:** Check status every few days
- **Notifications:** Set up email/SMS alerts for status changes
- **Expiration Tracking:** Note 30-day expiration period
- **Resubmit if Needed:** Resubmit if expired or rejected
- **Keep Records:** Save all verification responses

### Error Handling

- **Validate Emails:** Check email format before submission
- **Handle Rejections:** Understand why and correct issues
- **Timeout Handling:** Handle expired requests gracefully
- **Retry Logic:** Implement exponential backoff
- **User Feedback:** Show clear status messages

---

## Related Features

- **[Document Verification](/docs/verification/document-verification)** - Verify identity documents
- **[Verification Tokens](/docs/student/verification-tokens)** - Share verified credentials
- **[Academic Records](/docs/student/academic-records)** - Manage academic history
