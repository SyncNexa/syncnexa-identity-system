# Document Management

Complete documentation for managing student identity documents, including uploading, updating, and requesting verification.

---

## Overview

The Document Management feature allows students to upload and manage identity documents (national IDs, passports, driver's licenses, birth certificates, etc.). Documents can be submitted for verification and tracked through the verification process.

**Use Cases:**

- Upload identity documents for account verification
- Update document information or re-upload clearer versions
- Submit documents for admin verification
- Check verification status of uploaded documents

**Authentication:** All endpoints require authentication via Bearer token in the Authorization header.

**Related Documentation:**

- [Verification](/docs/verification) - Learn about the verification process
- [Profile Management](/docs/student/profile) - Manage your student profile

---

## Table of Contents

1. [Upload Document](#1-upload-document)
2. [Update Document](#2-update-document)
3. [Request Document Verification](#3-request-document-verification)
4. [Get Document Verification Status](#4-get-document-verification-status)
5. [Delete Document](#5-delete-document)
6. [Examples](#examples)

---

## 1. Upload Document

**Name:** Upload Identity Document

**Description:** Uploads a student's identity document to their profile. The document is stored in the system and can be submitted for verification. Documents can be uploaded using multipart/form-data, and optional metadata can be attached in JSON format.

**Route:** `POST /user/documents`

**Authentication Required:** Yes (Bearer token)

**Rate Limit:** 10 requests per minute per user

### Request Headers

```
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
```

### Request Payload (multipart/form-data)

| Field    | Type   | Required | Description                                                                               |
| -------- | ------ | -------- | ----------------------------------------------------------------------------------------- |
| file     | file   | Yes      | The document file to upload (JPEG, PNG, PDF - max 10MB)                                   |
| doc_type | string | Yes      | Type of document: "national_id", "passport", "drivers_license", "birth_certificate", etc. |
| meta     | JSON   | No       | Additional metadata about the document (stringified JSON)                                 |

### Document Types

| Type                | Typical Usage               | Max File Size |
| ------------------- | --------------------------- | ------------- |
| `national_id`       | National identification     | 10MB          |
| `passport`          | Passport/travel document    | 10MB          |
| `drivers_license`   | Driver's license            | 10MB          |
| `birth_certificate` | Birth certificate           | 10MB          |
| `student_id`        | Student identification card | 10MB          |
| `other`             | Other identity documents    | 10MB          |

### Request Example (cURL)

```bash
curl -X POST https://identity.syncnexa.com/api/v1/user/documents \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "file=@national_id.jpg" \
  -F "doc_type=national_id" \
  -F "meta={\"document_number\": \"A12345678\", \"issue_date\": \"2020-01-15\"}"
```

### Request Example (JavaScript/Node.js)

```javascript
const FormData = require("form-data");
const fs = require("fs");
const axios = require("axios");

async function uploadDocument() {
  const formData = new FormData();
  formData.append("file", fs.createReadStream("national_id.jpg"));
  formData.append("doc_type", "national_id");
  formData.append(
    "meta",
    JSON.stringify({
      document_number: "A12345678",
      issue_date: "2020-01-15",
      expiry_date: "2030-01-15",
    }),
  );

  try {
    const response = await axios.post(
      "https://identity.syncnexa.com/api/v1/user/documents",
      formData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          ...formData.getHeaders(),
        },
      },
    );
    console.log("Document uploaded:", response.data.data);
  } catch (error) {
    console.error("Upload failed:", error.response.data);
  }
}
```

### Request Example (Python)

```python
import requests

def upload_document(access_token):
    url = 'https://identity.syncnexa.com/api/v1/user/documents'
    headers = {'Authorization': f'Bearer {access_token}'}

    with open('national_id.jpg', 'rb') as f:
        files = {
            'file': f,
            'doc_type': (None, 'national_id'),
            'meta': (None, '{"document_number": "A12345678", "issue_date": "2020-01-15"}')
        }

        response = requests.post(url, headers=headers, files=files)
        print(response.json())
```

### Success Response (201 Created)

```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Document uploaded",
  "data": {
    "id": "doc-550e8400-e29b-41d4-a716-446655440000",
    "user_id": "user-123e4567-e89b-12d3-a456-426614174000",
    "doc_type": "national_id",
    "filename": "national_id_1673348400.jpg",
    "filepath": "/uploads/documents/doc-550e8400-e29b-41d4-a716-446655440000.jpg",
    "mime_type": "image/jpeg",
    "file_size": 2048576,
    "is_verified": 0,
    "meta": {
      "document_number": "A12345678",
      "issue_date": "2020-01-15",
      "expiry_date": "2030-01-15"
    },
    "uploaded_at": "2026-01-11T10:30:00.000Z"
  }
}
```

### Error Responses

#### 400 Bad Request - Missing doc_type

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "doc_type",
      "message": "doc_type is required"
    }
  ]
}
```

**What Happens:** The request is missing the required `doc_type` field. No document is saved. Specify the document type and retry.

#### 400 Bad Request - Missing Authentication

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "user_id required"
}
```

**What Happens:** The authentication token is missing or invalid. No document is saved. Provide a valid Bearer token in the Authorization header.

#### 400 Bad Request - Invalid File Format

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "file",
      "message": "File must be JPEG, PNG, or PDF format"
    }
  ]
}
```

**What Happens:** The uploaded file is in an unsupported format. Allowed formats are JPEG, PNG, and PDF.

#### 413 Payload Too Large

```json
{
  "status": "error",
  "statusCode": 413,
  "message": "File size exceeds 10MB limit"
}
```

**What Happens:** The uploaded file is larger than 10MB. Compress the file or use a smaller file.

#### 429 Too Many Requests

```json
{
  "status": "error",
  "statusCode": 429,
  "message": "Rate limit exceeded. Maximum 10 uploads per minute"
}
```

**What Happens:** You've exceeded the rate limit of 10 document uploads per minute. Wait before uploading another document.

#### 500 Internal Server Error

```json
{
  "status": "error",
  "statusCode": 500,
  "message": "Failed to save document"
}
```

**What Happens:** An unexpected server error occurred (database error, file system error, etc.). Retry after a brief delay.

### Edge Cases

| Scenario                             | Behavior                                                          |
| ------------------------------------ | ----------------------------------------------------------------- |
| Upload same document type twice      | Both documents are stored separately with different IDs           |
| Upload with empty metadata           | Document is saved without metadata; can be added later via update |
| File with special characters in name | Filename is sanitized; original name not preserved                |
| Network interruption mid-upload      | Request fails; document not saved; retry required                 |
| Very large file                      | Upload may take time; use chunked upload for files >5MB           |

---

## 2. Update Document

**Name:** Update Document Details

**Description:** Updates metadata or file information for an existing document. Use this to correct information, add additional metadata, or re-upload a clearer version of the same document.

**Route:** `PATCH /user/documents/:id`

**Authentication Required:** Yes

### Request Headers

```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

### Path Parameters

| Parameter | Type   | Required | Description               |
| --------- | ------ | -------- | ------------------------- |
| id        | string | Yes      | The document ID to update |

### Request Payload

```json
{
  "meta": {
    "document_number": "A12345678",
    "issue_date": "2020-01-15",
    "expiry_date": "2030-01-15",
    "notes": "Updated with clearer image"
  }
}
```

### Field Requirements

| Field | Type   | Required | Description                                   |
| ----- | ------ | -------- | --------------------------------------------- |
| meta  | object | No       | Updated or additional metadata (replaces old) |

### Request Example (JavaScript)

```javascript
async function updateDocument(documentId, metadata) {
  const response = await fetch(
    `https://identity.syncnexa.com/api/v1/user/documents/${documentId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ meta: metadata }),
    },
  );

  const result = await response.json();
  if (response.ok) {
    console.log("Document updated:", result.data);
  } else {
    console.error("Update failed:", result.message);
  }
}

// Usage
updateDocument("doc-550e8400-e29b-41d4-a716-446655440000", {
  document_number: "A12345678",
  issue_date: "2020-01-15",
  expiry_date: "2030-01-15",
  notes: "Clearer front side image",
});
```

### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Document updated",
  "data": {
    "id": "doc-550e8400-e29b-41d4-a716-446655440000",
    "user_id": "user-123e4567-e89b-12d3-a456-426614174000",
    "doc_type": "national_id",
    "filename": "national_id_1673348400.jpg",
    "filepath": "/uploads/documents/doc-550e8400-e29b-41d4-a716-446655440000.jpg",
    "mime_type": "image/jpeg",
    "file_size": 2048576,
    "is_verified": 0,
    "meta": {
      "document_number": "A12345678",
      "issue_date": "2020-01-15",
      "expiry_date": "2030-01-15",
      "notes": "Clearer front side image"
    },
    "uploaded_at": "2026-01-11T10:30:00.000Z",
    "updated_at": "2026-01-11T11:15:00.000Z"
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

**What Happens:** The document ID is missing from the URL path. Provide a valid document ID.

#### 404 Not Found

```json
{
  "status": "error",
  "statusCode": 404,
  "message": "Document not found"
}
```

**What Happens:** The document with the specified ID doesn't exist or doesn't belong to the authenticated user. Verify the document ID is correct.

#### 401 Unauthorized

```json
{
  "status": "error",
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**What Happens:** Authentication token is missing or invalid.

---

## 3. Request Document Verification

**Name:** Request Document Verification

**Description:** Submits a document for verification by administrators or automated verification services. Creates a verification request that can be tracked through the verification process.

**Route:** `POST /user/documents/:id/verify`

**Authentication Required:** Yes

### Request Headers

```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

### Path Parameters

| Parameter | Type   | Required | Description               |
| --------- | ------ | -------- | ------------------------- |
| id        | string | Yes      | The document ID to verify |

### Request Payload

```json
{
  "notes": "Please verify this national ID for KYC purposes",
  "metadata": {
    "urgency": "high",
    "purpose": "account_verification"
  }
}
```

### Field Requirements

| Field    | Type   | Required | Description                                       |
| -------- | ------ | -------- | ------------------------------------------------- |
| notes    | string | No       | Additional notes for the reviewer (max 500 chars) |
| metadata | object | No       | Additional context about the verification request |

### Request Example (cURL)

```bash
curl -X POST https://identity.syncnexa.com/api/v1/user/documents/doc-550e8400-e29b-41d4-a716-446655440000/verify \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Please verify this national ID for account verification",
    "metadata": {
      "urgency": "high",
      "purpose": "kyc_verification"
    }
  }'
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
    "notes": "Please verify this national ID for account verification",
    "metadata": {
      "urgency": "high",
      "purpose": "kyc_verification"
    },
    "requested_at": "2026-01-11T11:20:00.000Z",
    "verified_at": null
  }
}
```

### Verification Status Values

| Status      | Description                                        |
| ----------- | -------------------------------------------------- |
| `pending`   | Verification request created; waiting for reviewer |
| `approved`  | Document has been verified and approved            |
| `rejected`  | Document was rejected; resubmit with clearer image |
| `expired`   | Verification request expired (30-day TTL)          |
| `cancelled` | Student cancelled the verification request         |

### Error Responses

#### 400 Bad Request - Document Already Verified

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Document is already verified"
}
```

**What Happens:** The document is already verified. No new verification request is created.

#### 400 Bad Request - Pending Verification Exists

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "A verification request for this document is already pending"
}
```

**What Happens:** An active verification request already exists for this document. Wait for the current verification to complete or cancel it first.

#### 404 Not Found

```json
{
  "status": "error",
  "statusCode": 404,
  "message": "Document not found"
}
```

**What Happens:** The document with the specified ID doesn't exist.

#### 500 Internal Server Error

```json
{
  "status": "error",
  "statusCode": 500,
  "message": "Failed to create verification"
}
```

**What Happens:** An unexpected error occurred.

---

## 4. Get Document Verification Status

**Name:** Get User Document Verification Status

**Description:** Retrieves the overall verification status for all documents uploaded by the user, including individual document states and any active verification requests.

**Route:** `GET /user/verification-status`

**Authentication Required:** Yes

### Request Headers

```
Authorization: Bearer {accessToken}
```

### Query Parameters

| Parameter | Type   | Required | Description                                       |
| --------- | ------ | -------- | ------------------------------------------------- |
| user_id   | string | No       | Specific user ID (defaults to authenticated user) |

### Request Example

```bash
curl -X GET https://identity.syncnexa.com/api/v1/user/verification-status \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Verification status",
  "data": {
    "user_id": "user-123e4567-e89b-12d3-a456-426614174000",
    "overall_status": "partially_verified",
    "documents": [
      {
        "id": "doc-550e8400-e29b-41d4-a716-446655440000",
        "doc_type": "national_id",
        "is_verified": 1,
        "verified_at": "2026-01-10T14:30:00.000Z"
      },
      {
        "id": "doc-550e8400-e29b-41d4-a716-446655440001",
        "doc_type": "passport",
        "is_verified": 0,
        "verified_at": null
      }
    ],
    "verification_requests": [
      {
        "id": "ver-650e8400-e29b-41d4-a716-446655440001",
        "document_id": "doc-550e8400-e29b-41d4-a716-446655440001",
        "verification_status": "pending",
        "requested_at": "2026-01-11T11:20:00.000Z"
      }
    ]
  }
}
```

### Overall Status Values

| Status               | Condition                                               |
| -------------------- | ------------------------------------------------------- |
| `not_verified`       | No documents uploaded                                   |
| `pending`            | Documents uploaded; verification in progress            |
| `partially_verified` | Some documents verified, others pending or not verified |
| `fully_verified`     | All required documents verified                         |

### Error Responses

#### 401 Unauthorized

```json
{
  "status": "error",
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

## 5. Delete Document

**Name:** Delete Document

**Description:** Deletes a document from the system. Documents that are already verified cannot be deleted.

**Route:** `DELETE /user/documents/:id`

**Authentication Required:** Yes

### Path Parameters

| Parameter | Type   | Required | Description               |
| --------- | ------ | -------- | ------------------------- |
| id        | string | Yes      | The document ID to delete |

### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Document deleted"
}
```

### Error Responses

#### 403 Forbidden - Cannot Delete Verified Document

```json
{
  "status": "error",
  "statusCode": 403,
  "message": "Cannot delete a verified document"
}
```

**What Happens:** The document is already verified and cannot be deleted. Contact support if you need to remove a verified document.

#### 404 Not Found

```json
{
  "status": "error",
  "statusCode": 404,
  "message": "Document not found"
}
```

---

## Examples

### Complete Workflow: Upload and Verify a Document

This example shows the complete flow of uploading a document and requesting verification.

#### Step 1: Upload Document

```javascript
// 1. Upload the document
const formData = new FormData();
formData.append("file", documentFile); // File from input
formData.append("doc_type", "national_id");
formData.append(
  "meta",
  JSON.stringify({
    document_number: "A12345678",
    issue_date: "2020-01-15",
    expiry_date: "2030-01-15",
  }),
);

const uploadResponse = await fetch(
  "https://identity.syncnexa.com/api/v1/user/documents",
  {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  },
);

const uploadedDoc = await uploadResponse.json();
const documentId = uploadedDoc.data.id;
console.log("Document uploaded with ID:", documentId);
```

#### Step 2: Request Verification

```javascript
// 2. Request verification for the document
const verifyResponse = await fetch(
  `https://identity.syncnexa.com/api/v1/user/documents/${documentId}/verify`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      notes: "National ID for account verification",
      metadata: { urgency: "high", purpose: "kyc_verification" },
    }),
  },
);

const verificationRequest = await verifyResponse.json();
console.log("Verification request created:", verificationRequest.data);
```

#### Step 3: Check Verification Status

```javascript
// 3. Check verification status
const statusResponse = await fetch(
  "https://identity.syncnexa.com/api/v1/user/verification-status",
  {
    headers: { Authorization: `Bearer ${accessToken}` },
  },
);

const status = await statusResponse.json();
console.log("Overall status:", status.data.overall_status);
console.log("Documents:", status.data.documents);
console.log("Requests:", status.data.verification_requests);
```

### Python Example: Batch Document Upload

```python
import requests
import json
from pathlib import Path

class DocumentManager:
    def __init__(self, access_token):
        self.base_url = 'https://identity.syncnexa.com/api/v1'
        self.headers = {'Authorization': f'Bearer {access_token}'}

    def upload_documents(self, documents_folder):
        """Upload all documents from a folder"""
        doc_types = {
            'national_id.jpg': 'national_id',
            'passport.pdf': 'passport',
            'drivers_license.jpg': 'drivers_license'
        }

        results = []
        for filename, doc_type in doc_types.items():
            filepath = Path(documents_folder) / filename
            if not filepath.exists():
                continue

            with open(filepath, 'rb') as f:
                files = {
                    'file': f,
                    'doc_type': (None, doc_type),
                    'meta': (None, json.dumps({'source': 'batch_upload'}))
                }

                response = requests.post(
                    f'{self.base_url}/user/documents',
                    headers=self.headers,
                    files=files
                )

                if response.status_code == 201:
                    results.append({
                        'filename': filename,
                        'doc_type': doc_type,
                        'id': response.json()['data']['id'],
                        'status': 'uploaded'
                    })
                else:
                    results.append({
                        'filename': filename,
                        'status': 'failed',
                        'error': response.json()['message']
                    })

        return results

# Usage
manager = DocumentManager(access_token)
results = manager.upload_documents('./documents')
for result in results:
    print(f"{result['filename']}: {result['status']}")
```

---

## Related Features

- **[Verification Center](/docs/student/verification-center)** - Track all verifications
- **[Email Verification](/docs/authentication/email-verification)** - Verify email address
- **[Profile Management](/docs/student/profile)** - Manage student profile information
