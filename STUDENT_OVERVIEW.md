# Student Overview Endpoint

## Overview

Added a comprehensive student overview endpoint that provides a complete snapshot of a student's profile, including verification progress, academic information, document status, school verification status, and digital student ID information.

## Endpoint

`GET /user/overview` (Protected - Student Role Only)

## Response Structure

```json
{
  "userId": "uuid",
  "verificationProgress": {
    "personal_info": {
      "status": "completed|pending",
      "completion_percentage": 100,
      "details": {
        "firstName": "string",
        "lastName": "string",
        "email": "string",
        "phone": "string",
        "gender": "male|female|non-binary|other",
        "country": "string",
        "state": "string",
        "address": "string"
      }
    },
    "academic_info": {
      "status": "completed|in_progress|pending",
      "completion_percentage": 0-100,
      "details": {
        "institution": "string",
        "matricNumber": "string",
        "department": "string",
        "faculty": "string",
        "program": "string",
        "studentLevel": "string",
        "admissionYear": number,
        "graduationYear": number,
        "academicRecords": number,
        "transcripts": number
      }
    },
    "documents": {
      "status": "verified|pending|not_started",
      "completion_percentage": 0-100,
      "details": {
        "uploaded": number,
        "verified": number,
        "pending": number
      }
    },
    "school_verification": {
      "status": "verified|pending|not_started",
      "completion_percentage": 0-100,
      "details": {
        "requested": number,
        "approved": number,
        "pending": number
      }
    }
  },
  "digitalStudentID": {
    "id": "uuid",
    "cardUuid": "string",
    "status": "active|not_created",
    "createdAt": "ISO8601 timestamp",
    "expiresAt": "ISO8601 timestamp or null"
  },
  "profileCompletion": {
    "overall": 0-100,
    "details": {
      "profile_completion_percent": 0-100,
      "documents_count": number,
      "documents_verified": number,
      "academics_count": number,
      "transcripts_count": number,
      "institution_verifications_count": number,
      "institution_verified": number,
      "projects_count": number,
      "certificates_count": number,
      "certificates_verified": number,
      "has_student_card": boolean,
      "has_mfa_enabled": boolean
    }
  },
  "metrics": {
    "documents": number,
    "documentsVerified": number,
    "academicRecords": number,
    "transcripts": number,
    "projects": number,
    "certificates": number,
    "certificatesVerified": number,
    "institutionVerifications": number,
    "institutionVerified": number,
    "mfaEnabled": boolean
  }
}
```

## Example Response

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "verificationProgress": {
    "personal_info": {
      "status": "completed",
      "completion_percentage": 100,
      "details": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "+2348012345678",
        "gender": "male",
        "country": "Nigeria",
        "state": "Lagos",
        "address": "123 Main Street"
      }
    },
    "academic_info": {
      "status": "completed",
      "completion_percentage": 100,
      "details": {
        "institution": "FUTO_NG",
        "matricNumber": "FUT/2020/123456",
        "department": "Computer Science",
        "faculty": "SEET",
        "program": "Bachelor of Science",
        "studentLevel": "200",
        "admissionYear": 2020,
        "graduationYear": 2024,
        "academicRecords": 3,
        "transcripts": 1
      }
    },
    "documents": {
      "status": "verified",
      "completion_percentage": 100,
      "details": {
        "uploaded": 2,
        "verified": 2,
        "pending": 0
      }
    },
    "school_verification": {
      "status": "verified",
      "completion_percentage": 100,
      "details": {
        "requested": 1,
        "approved": 1,
        "pending": 0
      }
    }
  },
  "digitalStudentID": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "cardUuid": "card-1705942800000-123456789",
    "status": "active",
    "createdAt": "2024-01-22T10:00:00Z",
    "expiresAt": null
  },
  "profileCompletion": {
    "overall": 85,
    "details": {
      "profile_completion_percent": 85,
      "documents_count": 2,
      "documents_verified": 2,
      "academics_count": 3,
      "transcripts_count": 1,
      "institution_verifications_count": 1,
      "institution_verified": 1,
      "projects_count": 2,
      "certificates_count": 1,
      "certificates_verified": 1,
      "has_student_card": true,
      "has_mfa_enabled": true
    }
  },
  "metrics": {
    "documents": 2,
    "documentsVerified": 2,
    "academicRecords": 3,
    "transcripts": 1,
    "projects": 2,
    "certificates": 1,
    "certificatesVerified": 1,
    "institutionVerifications": 1,
    "institutionVerified": 1,
    "mfaEnabled": true
  }
}
```

## Components Modified/Created

### 1. **Dashboard Service** - [src/services/dashboard.service.ts](src/services/dashboard.service.ts)

- Added `getStudentOverview()` function that aggregates:
  - Personal information from users table
  - Academic information from students table
  - Verification metrics
  - Digital student ID status
  - Profile completion percentage

### 2. **Dashboard Controller** - [src/controllers/dashboard.controller.ts](src/controllers/dashboard.controller.ts)

- Added `getStudentOverview()` endpoint handler

### 3. **User Routes** - [src/routes/user.route.ts](src/routes/user.route.ts)

- Added `GET /overview` route with student authorization and validation

### 4. **Academic Model** - [src/models/academic.model.ts](src/models/academic.model.ts)

- Added `getStudentByUserId()` function to fetch student data from students table

## Verification Progress Status Values

Each verification section has a status field that indicates completion:

- **completed**: All required items are complete/verified
- **in_progress**: Some items uploaded/started but not verified
- **verified**: All items verified (for school verification and documents)
- **pending**: Items requested but awaiting approval
- **not_started**: No items uploaded/requested yet

## Completion Percentage Calculation

The overall profile completion is weighted as follows:

- Personal Info: ✓ (auto-complete from registration)
- Academic Info: 20% (20 points if records + transcripts present)
- Documents: 15% (15 points if at least 1 verified)
- School Verification: 15% (15 points if 1+ approved)
- Portfolio: 20% (20 points if 2+ projects AND 2+ verified certificates)
- Student Card: 10% (10 points if created)
- MFA: 10% (10 points if enabled)
- CV Potential: 10% (10 points if diverse data present)

**Maximum: 100%**

## Use Cases

1. **Student Dashboard**: Display complete overview of student's profile completion
2. **Profile Assessment**: Track verification progress across all components
3. **Quick Status Check**: Identify what documents/verifications are pending
4. **Digital ID Verification**: Check if student has created digital ID and its status
5. **Recommendations**: Use completion percentage to recommend next actions
