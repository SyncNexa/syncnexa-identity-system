# Verification Center API

The Verification Center provides a comprehensive 4-pillar verification system where each pillar contributes 25% to the overall verification score. A student achieves 100% verification when all four pillars are verified.

## Pillars

1. **Personal Info** (25%) - Face match, contact verification, government ID
2. **Academic Info** (25%) - Program validation, enrollment logic check
3. **Documents** (25%) - Document upload, content matching, freshness validation
4. **School Verification** (25%) - Direct school verification, school email, admin attestation

## Automatic Initialization

The verification center is **automatically initialized** when a student account is created during signup. All 4 pillars are created with their respective verification steps immediately. If the student verifies their email during signup, the Contact Verification step is automatically marked as verified.

---

## User Endpoints

### Get Verification Center Overview

**GET** `/api/user/verification-center`

Retrieves the complete verification center overview including all pillars, steps, and overall progress.

**Authentication**: Required

**Response**:

```json
{
  "status": "success",
  "message": "Verification center",
  "data": {
    "overall_verification_percentage": 50,
    "is_fully_verified": false,
    "pillars": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "pillar_name": "personal_info",
        "weight_percentage": 25,
        "completion_percentage": 66,
        "status": "in_progress",
        "created_at": "2026-01-30T10:00:00Z",
        "updated_at": "2026-01-30T10:30:00Z",
        "steps": [
          {
            "id": "uuid",
            "user_id": "uuid",
            "pillar_id": "uuid",
            "step_name": "Contact Verification",
            "step_order": 2,
            "step_type": "automatic",
            "status": "verified",
            "status_message": "Email verified during signup",
            "requirement_checklist": [
              { "requirement": "Active email address", "met": true },
              { "requirement": "Active phone number", "met": false },
              { "requirement": "OTP confirmation for both", "met": false }
            ],
            "last_attempted_at": "2026-01-30T10:30:00Z",
            "verified_at": "2026-01-30T10:30:00Z",
            "retry_count": 0
          },
          {
            "id": "uuid",
            "user_id": "uuid",
            "pillar_id": "uuid",
            "step_name": "Government ID",
            "step_order": 3,
            "step_type": "manual",
            "status": "not_verified",
            "status_message": null,
            "requirement_checklist": [
              { "requirement": "Valid government-issued ID", "met": false },
              { "requirement": "Clear, readable image", "met": false },
              { "requirement": "Name must match profile", "met": false },
              { "requirement": "ID must not be expired", "met": false }
            ],
            "retry_count": 0
          }
        ]
      },
      {
        "id": "uuid",
        "user_id": "uuid",
        "pillar_name": "academic_info",
        "weight_percentage": 25,
        "completion_percentage": 0,
        "status": "not_started",
        "created_at": "2026-01-30T10:00:00Z",
        "updated_at": "2026-01-30T10:00:00Z",
        "steps": [
          {
            "id": "uuid",
            "step_name": "Program & Level Validation",
            "step_order": 1,
            "step_type": "automatic",
            "status": "not_verified",
            "requirement_checklist": [...],
            "retry_count": 0
          }
        ]
      }
    ]
  }
}
```

---

### Get Specific Pillar

**GET** `/api/user/verification-center/pillar/:pillar`

Retrieves details for a specific pillar with all its verification steps.

**Authentication**: Required

**Path Parameters**:

- `pillar` (required) - One of: `personal_info`, `academic_info`, `documents`, `school`

**Response**:

```json
{
  "status": "success",
  "message": "Pillar details",
  "data": {
    "pillar": {
      "id": "uuid",
      "pillar_name": "personal_info",
      "weight_percentage": 25,
      "completion_percentage": 66,
      "status": "in_progress"
    },
    "steps": [...]
  }
}
```

---

### Update Step Status

**PATCH** `/api/user/verification-center/step/:stepId/status`

Updates the status of a verification step (user-initiated).

**Authentication**: Required

**Path Parameters**:

- `stepId` (required) - The step ID

**Request Body**:

```json
{
  "status": "verified",
  "status_message": "Document uploaded successfully",
  "failure_reason": "Optional failure reason",
  "failure_suggestion": "Optional suggestion for user"
}
```

**Body Parameters**:

- `status` (required) - One of: `not_verified`, `pending`, `failed`, `verified`
- `status_message` (optional) - Status message to display to user
- `failure_reason` (optional) - Reason for failure
- `failure_suggestion` (optional) - Suggestion to fix the issue

**Response**:

```json
{
  "status": "success",
  "message": "Step updated",
  "data": {
    "id": "uuid",
    "status": "verified",
    "status_message": "Document uploaded successfully",
    "updated_at": "2026-01-30T10:35:00Z"
  }
}
```

---

### Retry Failed Step

**POST** `/api/user/verification-center/step/:stepId/retry`

Retries a failed verification step. Maximum 3 retry attempts allowed.

**Authentication**: Required

**Path Parameters**:

- `stepId` (required) - The step ID

**Response**:

```json
{
  "status": "success",
  "message": "Step retry initiated",
  "data": {
    "id": "uuid",
    "status": "pending",
    "retry_count": 1,
    "last_attempted_at": "2026-01-30T10:40:00Z"
  }
}
```

**Error Response** (Max retries reached):

```json
{
  "status": "error",
  "message": "Maximum retry attempts reached. Please contact support.",
  "statusCode": 429
}
```

---

### Upload Step Evidence

**POST** `/api/user/verification-center/step/:stepId/evidence`

Uploads evidence for a verification step (e.g., documents, photos).

**Authentication**: Required

**Path Parameters**:

- `stepId` (required) - The step ID

**Request Body**:

```json
{
  "evidence_type": "government_id",
  "evidence_url": "https://storage.example.com/documents/id123.jpg",
  "evidence_metadata": {
    "filename": "drivers_license.jpg",
    "size": 1024000,
    "mime_type": "image/jpeg"
  }
}
```

**Body Parameters**:

- `evidence_type` (required) - Type of evidence being uploaded
- `evidence_url` (required) - URL where evidence is stored
- `evidence_metadata` (optional) - Additional metadata about the evidence

**Response**:

```json
{
  "status": "success",
  "message": "Evidence uploaded",
  "data": {
    "id": "uuid",
    "step_id": "uuid",
    "evidence_type": "government_id",
    "evidence_url": "https://storage.example.com/documents/id123.jpg",
    "uploaded_at": "2026-01-30T10:45:00Z"
  }
}
```

---

## Admin Endpoints

### Review and Approve/Reject Step

**POST** `/api/user/verification-center/admin/step/:stepId/review`

Admin reviews and approves or rejects a verification step.

**Authentication**: Required (Admin only)

**Path Parameters**:

- `stepId` (required) - The step ID

**Request Body**:

```json
{
  "status": "verified",
  "notes": "Government ID verified. All details match profile."
}
```

**Body Parameters**:

- `status` (required) - One of: `verified`, `failed`
- `notes` (required) - Admin review notes (minimum 5 characters)

**Response**:

```json
{
  "status": "success",
  "message": "Step reviewed",
  "data": {
    "id": "uuid",
    "status": "verified",
    "admin_reviewer_id": "admin_uuid",
    "admin_review_notes": "Government ID verified. All details match profile.",
    "status_message": "Verified by admin",
    "verified_at": "2026-01-30T11:00:00Z"
  }
}
```

---

### List Pending Verifications

**GET** `/api/admin/verification-center/pending`

Lists all users with pending verification steps. Supports filtering and pagination.

**Authentication**: Required (Admin only)

**Query Parameters**:

- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20)
- `pillar` (optional) - Filter by pillar: `personal_info`, `academic_info`, `documents`, `school`
- `step_name` (optional) - Filter by specific step name

**Example Request**:

```
GET /api/admin/verification-center/pending?page=1&limit=20&pillar=personal_info&step_name=Government%20ID
```

**Response**:

```json
{
  "status": "success",
  "message": "Pending verifications",
  "data": {
    "items": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "step_name": "Government ID",
        "status": "pending",
        "pillar_name": "personal_info",
        "user_email": "student@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "last_attempted_at": "2026-01-30T10:30:00Z",
        "created_at": "2026-01-30T09:00:00Z"
      }
    ],
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

---

### Get User Verification Status

**GET** `/api/admin/verification-center/user/:userId`

Retrieves the complete verification status for a specific user.

**Authentication**: Required (Admin only)

**Path Parameters**:

- `userId` (required) - The user ID

**Response**:

```json
{
  "status": "success",
  "message": "User verification status",
  "data": {
    "overall_verification_percentage": 75,
    "is_fully_verified": false,
    "pillars": [...],
    "steps": [...]
  }
}
```

---

### Get Step Details

**GET** `/api/admin/verification-center/step/:stepId`

Retrieves detailed information about a specific verification step including all evidence.

**Authentication**: Required (Admin only)

**Path Parameters**:

- `stepId` (required) - The step ID

**Response**:

```json
{
  "status": "success",
  "message": "Step details",
  "data": {
    "step": {
      "id": "uuid",
      "step_name": "Government ID",
      "status": "pending",
      "retry_count": 1,
      "requirement_checklist": [...]
    },
    "evidence": [
      {
        "id": "uuid",
        "evidence_type": "government_id",
        "evidence_url": "https://storage.example.com/documents/id123.jpg",
        "uploaded_at": "2026-01-30T10:45:00Z"
      }
    ]
  }
}
```

---

## Verification Status Flow

```
Not Verified
    ↓
Pending (automatic/manual processing)
    ↓
Verified or Failed
    ↓
(If Failed) Retry (up to 3 times)
    ↓
(After 3 retries) Admin Review Required
```

---

## Step Types

- **automatic** - System validates automatically
- **manual** - Requires admin review
- **external** - Requires external verification (e.g., institution API)

---

## Error Responses

### 400 Bad Request

```json
{
  "status": "error",
  "message": "Validation error message",
  "statusCode": 400
}
```

### 401 Unauthorized

```json
{
  "status": "error",
  "message": "Authentication required",
  "statusCode": 401
}
```

### 404 Not Found

```json
{
  "status": "error",
  "message": "Step not found",
  "statusCode": 404
}
```

### 429 Too Many Requests

```json
{
  "status": "error",
  "message": "Maximum retry attempts reached. Please contact support.",
  "statusCode": 429
}
```

### 500 Internal Server Error

```json
{
  "status": "error",
  "message": "Failed to process request",
  "statusCode": 500
}
```
