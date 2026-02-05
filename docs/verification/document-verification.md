# Document Verification

Complete documentation for verifying identity and official documents.

---

## Overview

Document verification enables secure validation of identity documents (national ID, passport, driver's license) and official documents for Know Your Customer (KYC) compliance, account security, and credential verification. The system supports multiple document types, manual review, and automated verification workflows.

**Use Cases:**

- KYC (Know Your Customer) compliance
- Account security verification
- Identity confirmation
- Official document validation
- Credential verification for features
- Regulatory compliance

**Authentication:** Required - user must be authenticated

---

## Request Document Verification

**Name:** Submit Document for Verification

**Description:** Submits a user's document for verification by administrators or automated verification services. Creates a verification request that tracks the status, reviewer notes, and verification timeline. Documents can be verified multiple times or by different reviewers.

**Route:** `POST /user/documents/:id/verify`

**Authentication Required:** Yes

### Request Payload

```json
{
  "notes": "Please verify this national ID for KYC purposes",
  "metadata": {
    "urgency": "high",
    "purpose": "account_verification",
    "reason": "enabling_withdrawal_feature"
  }
}
```

### Path Parameters

| Parameter | Type   | Required | Description           |
| --------- | ------ | -------- | --------------------- |
| id        | string | Yes      | Document ID to verify |

### Field Requirements

| Field    | Type   | Required | Description                         |
| -------- | ------ | -------- | ----------------------------------- |
| notes    | string | No       | Additional context for the reviewer |
| metadata | object | No       | Verification context and metadata   |

### Request Example (JavaScript)

```javascript
async function requestDocumentVerification(accessToken, docId, notes = "") {
  try {
    const response = await fetch(
      `https://identity.syncnexa.com/api/v1/user/documents/${docId}/verify`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notes: notes,
          metadata: {
            urgency: "normal",
            purpose: "account_verification",
            requested_at: new Date().toISOString(),
          },
        }),
      },
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("Verification request failed:", result.message);
      return null;
    }

    console.log("Verification request submitted");
    return result.data;
  } catch (error) {
    console.error("Network error:", error);
    return null;
  }
}

// Usage
const verification = await requestDocumentVerification(
  accessToken,
  "doc-550e8400-e29b-41d4-a716-446655440000",
  "Please prioritize this verification for account upgrade",
);

if (verification) {
  console.log(`Status: ${verification.verification_status}`);
  console.log(`Verification ID: ${verification.id}`);
}
```

### Request Example (cURL)

```bash
curl -X POST https://identity.syncnexa.com/api/v1/user/documents/doc-550e8400-e29b-41d4-a716-446655440000/verify \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Please verify this national ID for KYC purposes",
    "metadata": {
      "urgency": "high",
      "purpose": "account_verification"
    }
  }'
```

### Request Example (Python)

```python
import requests
from datetime import datetime

class DocumentVerificationService:
    def __init__(self, base_url='https://identity.syncnexa.com/api/v1'):
        self.base_url = base_url
        self.access_token = None

    def set_access_token(self, token):
        """Set access token for verification operations"""
        self.access_token = token

    def request_verification(self, doc_id, notes='', urgency='normal', purpose='account_verification'):
        """Request document verification"""
        if not self.access_token:
            raise Exception("Not authenticated")

        headers = {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json'
        }

        payload = {
            'notes': notes,
            'metadata': {
                'urgency': urgency,
                'purpose': purpose,
                'requested_at': datetime.now().isoformat()
            }
        }

        response = requests.post(
            f'{self.base_url}/user/documents/{doc_id}/verify',
            headers=headers,
            json=payload
        )

        if response.status_code != 201:
            print(f"Request failed: {response.json()['message']}")
            return None

        data = response.json()['data']
        print(f"Verification request created: {data['id']}")
        return data

    def get_verification_status(self, verification_id):
        """Get verification request status"""
        if not self.access_token:
            raise Exception("Not authenticated")

        headers = {
            'Authorization': f'Bearer {self.access_token}'
        }

        response = requests.get(
            f'{self.base_url}/user/verifications/{verification_id}',
            headers=headers
        )

        if response.status_code != 200:
            return None

        return response.json()['data']

    def get_all_document_verifications(self):
        """Get all verification requests for user"""
        if not self.access_token:
            raise Exception("Not authenticated")

        headers = {
            'Authorization': f'Bearer {self.access_token}'
        }

        response = requests.get(
            f'{self.base_url}/user/verifications',
            headers=headers
        )

        if response.status_code != 200:
            return []

        return response.json()['data']

    def batch_request_verifications(self, doc_ids, purpose='account_verification'):
        """Request verification for multiple documents"""
        results = []

        for doc_id in doc_ids:
            result = self.request_verification(
                doc_id,
                purpose=purpose
            )

            results.append({
                'doc_id': doc_id,
                'verification_id': result['id'] if result else None,
                'status': 'pending' if result else 'failed'
            })

        return results

# Usage
service = DocumentVerificationService()
service.set_access_token('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')

# Single verification
verification = service.request_verification(
    'doc-550e8400-e29b-41d4-a716-446655440000',
    notes='National ID for KYC',
    urgency='high'
)

# Batch verification
doc_ids = [
    'doc-550e8400-e29b-41d4-a716-446655440000',
    'doc-550e8400-e29b-41d4-a716-446655440001',
    'doc-550e8400-e29b-41d4-a716-446655440002'
]

batch_results = service.batch_request_verifications(doc_ids)
for result in batch_results:
    print(f"Document {result['doc_id']}: {result['status']}")
```

### Success Response (201 Created)

```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Verification request created",
  "data": {
    "id": "ver-650e8400-e29b-41d4-a716-446655440001",
    "document_id": "doc-550e8400-e29b-41d4-a716-446655440000",
    "user_id": "user-123e4567-e89b-12d3-a456-426614174000",
    "verification_status": "pending",
    "reviewer_id": null,
    "reviewer_notes": null,
    "notes": "Please verify this national ID for KYC purposes",
    "metadata": {
      "urgency": "high",
      "purpose": "account_verification"
    },
    "requested_at": "2026-02-05T11:20:00.000Z",
    "completed_at": null
  }
}
```

### Error Responses

#### 400 Bad Request - Missing Document ID

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "document id required"
}
```

**What Happens:** Path parameter `id` is missing. Request is rejected immediately.

#### 404 Not Found - Document Not Found

```json
{
  "status": "error",
  "statusCode": 404,
  "message": "Document not found"
}
```

**What Happens:** Document ID doesn't exist or belongs to different user. Verification request is not created.

#### 409 Conflict - Already Pending Verification

```json
{
  "status": "error",
  "statusCode": 409,
  "message": "This document has a pending verification request"
}
```

**What Happens:** A verification request for this document is already in progress. User must wait for completion or cancel existing request.

---

## Get Verification Status

**Name:** Get Document Verification Status

**Description:** Retrieves the current status of a document verification request, including reviewer notes, timestamps, and completion details.

**Route:** `GET /user/documents/:id/verification`

**Authentication Required:** Yes

### Path Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| id        | string | Yes      | Document ID |

### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Verification status",
  "data": {
    "id": "ver-650e8400-e29b-41d4-a716-446655440001",
    "document_id": "doc-550e8400-e29b-41d4-a716-446655440000",
    "verification_status": "approved",
    "reviewer_id": "reviewer-550e8400-e29b-41d4-a716-446655440010",
    "reviewer_notes": "Document is valid and legible",
    "requested_at": "2026-02-05T11:20:00.000Z",
    "verified_at": "2026-02-05T14:30:00.000Z",
    "completion_time_minutes": 190
  }
}
```

### Possible Statuses

| Status             | Description                           |
| ------------------ | ------------------------------------- |
| pending            | Awaiting reviewer action              |
| approved           | Document verified and approved        |
| rejected           | Document rejected; user must resubmit |
| review_in_progress | Reviewer is currently checking        |
| escalated          | Flagged for manual review             |

---

## Get Overall Verification Status

**Name:** Get User Verification Status

**Description:** Retrieves comprehensive verification status for the user, including all documents, their verification states, and overall verification progress.

**Route:** `GET /user/verification-status`

**Authentication Required:** Yes

### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Verification status",
  "data": {
    "user_id": "user-123e4567-e89b-12d3-a456-426614174000",
    "overall_status": "partially_verified",
    "verification_score": 65,
    "documents": [
      {
        "id": "doc-550e8400-e29b-41d4-a716-446655440000",
        "type": "national_id",
        "is_verified": true,
        "verified_at": "2026-02-05T14:30:00.000Z",
        "verification_id": "ver-650e8400-e29b-41d4-a716-446655440001"
      },
      {
        "id": "doc-550e8400-e29b-41d4-a716-446655440001",
        "type": "passport",
        "is_verified": false,
        "verification_status": "pending",
        "verification_id": "ver-650e8400-e29b-41d4-a716-446655440002"
      }
    ],
    "verification_requests": [
      {
        "id": "ver-650e8400-e29b-41d4-a716-446655440001",
        "document_id": "doc-550e8400-e29b-41d4-a716-446655440000",
        "verification_status": "approved",
        "requested_at": "2026-02-05T11:20:00.000Z",
        "verified_at": "2026-02-05T14:30:00.000Z"
      }
    ]
  }
}
```

---

## Edge Cases

| Scenario                                | Behavior                                        |
| --------------------------------------- | ----------------------------------------------- |
| **Multiple verification attempts**      | Each creates new request; latest status checked |
| **Reject then resubmit**                | Previous rejection cleared; new request created |
| **Withdraw verification request**       | Request can be cancelled if pending             |
| **Document updated after verification** | Must resubmit for re-verification               |
| **Expired document (ID expiration)**    | Flagged as expired; user must upload new one    |
| **Reviewer reassignment**               | Tracked; all notes preserved                    |

---

## Examples

### Complete Document Verification Flow

```javascript
async function completeDocumentVerification(accessToken, docId) {
  // 1. Upload document (see Documents page)
  const uploadResponse = await fetch(
    "https://identity.syncnexa.com/api/v1/user/documents",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData,
    },
  );

  const uploadData = await uploadResponse.json();
  const documentId = uploadData.data.id;
  console.log("Document uploaded:", documentId);

  // 2. Request verification
  const verifyRequest = await fetch(
    `https://identity.syncnexa.com/api/v1/user/documents/${documentId}/verify`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        notes: "Please verify this national ID for account security",
        metadata: {
          urgency: "high",
          purpose: "account_verification",
        },
      }),
    },
  );

  const verification = await verifyRequest.json();
  const verificationId = verification.data.id;
  console.log("Verification requested:", verificationId);

  // 3. Poll for status
  return new Promise((resolve) => {
    const pollInterval = setInterval(async () => {
      const statusResponse = await fetch(
        `https://identity.syncnexa.com/api/v1/user/documents/${documentId}/verification`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      const statusData = await statusResponse.json();
      const status = statusData.data.verification_status;

      console.log("Verification status:", status);

      if (status !== "pending" && status !== "review_in_progress") {
        clearInterval(pollInterval);
        resolve({
          verificationId,
          status,
          notes: statusData.data.reviewer_notes,
          verified: status === "approved",
        });
      }
    }, 5000); // Poll every 5 seconds
  });
}

// Usage
const result = await completeDocumentVerification(accessToken, docId);

if (result.verified) {
  console.log("✓ Document verified!");
  // Unlock verified features
} else {
  console.log("✗ Verification rejected:", result.notes);
  // Show error to user
}
```

### Python Verification Monitor

```python
import requests
import time
from datetime import datetime

class DocumentVerificationMonitor:
    def __init__(self, base_url, access_token):
        self.base_url = base_url
        self.access_token = access_token
        self.headers = {
            'Authorization': f'Bearer {access_token}'
        }

    def monitor_verification(self, doc_id, poll_interval=5, max_wait=3600):
        """Monitor verification status until completion or timeout"""
        start_time = time.time()

        while time.time() - start_time < max_wait:
            response = requests.get(
                f'{self.base_url}/user/documents/{doc_id}/verification',
                headers=self.headers
            )

            if response.status_code != 200:
                print(f"Error checking status: {response.json()['message']}")
                time.sleep(poll_interval)
                continue

            data = response.json()['data']
            status = data['verification_status']

            # Print status update
            elapsed = int(time.time() - start_time)
            print(f"[{elapsed}s] Status: {status}")

            if status in ['approved', 'rejected', 'escalated']:
                return {
                    'status': status,
                    'notes': data.get('reviewer_notes'),
                    'verified_at': data.get('verified_at'),
                    'completion_time': elapsed
                }

            time.sleep(poll_interval)

        return {
            'status': 'timeout',
            'message': f'Verification did not complete within {max_wait} seconds'
        }

    def get_verification_summary(self):
        """Get summary of all verifications"""
        response = requests.get(
            f'{self.base_url}/user/verification-status',
            headers=self.headers
        )

        if response.status_code != 200:
            return None

        data = response.json()['data']

        summary = {
            'overall_status': data['overall_status'],
            'verification_score': data.get('verification_score', 0),
            'total_documents': len(data['documents']),
            'verified_documents': sum(1 for d in data['documents'] if d['is_verified']),
            'pending_verifications': sum(1 for v in data['verification_requests']
                                        if v['verification_status'] == 'pending'),
            'documents': []
        }

        for doc in data['documents']:
            summary['documents'].append({
                'id': doc['id'],
                'type': doc['type'],
                'verified': doc['is_verified'],
                'verified_at': doc.get('verified_at')
            })

        return summary

    def print_summary(self):
        """Print verification summary"""
        summary = self.get_verification_summary()

        if not summary:
            print("Could not retrieve verification status")
            return

        print("\n" + "="*50)
        print("VERIFICATION SUMMARY")
        print("="*50)
        print(f"Overall Status: {summary['overall_status']}")
        print(f"Verification Score: {summary['verification_score']}/100")
        print(f"Documents: {summary['verified_documents']}/{summary['total_documents']} verified")
        print(f"Pending: {summary['pending_verifications']}")

        print("\nDocuments:")
        for doc in summary['documents']:
            status = "✓" if doc['verified'] else "✗"
            verified_date = f" ({doc['verified_at'][:10]})" if doc['verified_at'] else ""
            print(f"  {status} {doc['type'].upper()}{verified_date}")

# Usage
monitor = DocumentVerificationMonitor(
    'https://identity.syncnexa.com/api/v1',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
)

# Monitor a specific verification
result = monitor.monitor_verification('doc-550e8400-e29b-41d4-a716-446655440000')
print(f"Result: {result['status']}")

# Print overall summary
monitor.print_summary()
```

---

## Best Practices

### Verification Submission

- **Include Context:** Provide notes explaining verification purpose
- **Document Quality:** Ensure documents are clear and legible
- **Required Documents:** Check what documents are required first
- **Batch Verification:** Submit multiple documents at once when possible
- **Follow-up:** Monitor verification status regularly

### Document Management

- **Keep Originals:** Maintain high-quality scans of documents
- **Update Expired:** Replace documents before expiration
- **Organize Records:** Keep documents organized by type
- **Secure Storage:** Store documents securely on device
- **Multiple Copies:** Have backups of important documents

### Verification Monitoring

- **Check Status Regularly:** Poll status without overwhelming API
- **Set Up Alerts:** Implement webhooks for status changes
- **Track Timeline:** Monitor average verification times
- **Handle Rejections:** Quickly resubmit if rejected
- **Document Issues:** Note any recurring rejection reasons

### Error Handling

- **Retry Logic:** Implement exponential backoff for failures
- **User Feedback:** Show clear status messages
- **Handle Timeouts:** Set reasonable timeout limits
- **Network Errors:** Gracefully handle disconnections
- **Rate Limiting:** Respect API rate limits

---

## Related Features

- **[Documents](/docs/student/documents)** - Upload and manage documents
- **[Academic Records Verification](/docs/verification/academic-records)** - Verify academic credentials
- **[Verification Tokens](/docs/student/verification-tokens)** - Share verified credentials
