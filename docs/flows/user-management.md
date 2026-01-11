# User Management Flow

Complete documentation for managing student profiles, documents, academic records, portfolios, and verification processes.

---

## Overview

The User Management flow encompasses all operations related to a student's profile data, including:

- Identity document management
- Academic records and transcripts
- Institution verification requests
- Student card generation
- Portfolio (projects and certificates)
- Verification tokens
- Shareable links

**Authentication:** All endpoints in this flow require authentication via Bearer token in the Authorization header.

---

## Table of Contents

1. [Document Management](#1-document-management)
2. [Academic Records](#2-academic-records)
3. [Institution Verification](#3-institution-verification)
4. [Student Cards](#4-student-cards)
5. [Portfolio Management](#5-portfolio-management)
6. [Verification Tokens](#6-verification-tokens)
7. [Shareable Links](#7-shareable-links)

---

## 1. Document Management

### 1.1 Upload Identity Document

**Name:** Upload Identity Document

**Description:** Uploads a student's identity document (e.g., national ID, passport, driver's license). The document is stored in the system and can be submitted for verification. Files can be uploaded using multipart/form-data, and metadata can be attached in JSON format.

**Route:** `POST /user/documents`

**Authentication Required:** Yes (Bearer token)

#### Request Payload (multipart/form-data)

```json
{
  "doc_type": "national_id",
  "filename": "national_id_front.jpg",
  "filepath": "/uploads/documents/abc123.jpg",
  "mime_type": "image/jpeg",
  "file_size": 2048576,
  "meta": {
    "document_number": "A12345678",
    "issue_date": "2020-01-15",
    "expiry_date": "2030-01-15"
  }
}
```

#### Field Requirements

| Field     | Type   | Required    | Description                                                                               |
| --------- | ------ | ----------- | ----------------------------------------------------------------------------------------- |
| doc_type  | string | Yes         | Type of document: "national_id", "passport", "drivers_license", "birth_certificate", etc. |
| filename  | string | Conditional | Required if no file uploaded via multer                                                   |
| filepath  | string | No          | Server path to the uploaded file                                                          |
| mime_type | string | No          | MIME type of the file (auto-detected if uploaded)                                         |
| file_size | number | No          | File size in bytes (auto-detected if uploaded)                                            |
| meta      | object | No          | Additional metadata about the document                                                    |

#### Success Response (201 Created)

```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Document uploaded",
  "data": {
    "id": "doc-550e8400-e29b-41d4-a716-446655440000",
    "user_id": "user-123e4567-e89b-12d3-a456-426614174000",
    "doc_type": "national_id",
    "filename": "national_id_front.jpg",
    "filepath": "/uploads/documents/abc123.jpg",
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

#### Error Responses

##### 400 Bad Request - Missing doc_type

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "doc_type required"
}
```

**What Happens:** The request is missing the required `doc_type` field. No document is saved. User must specify the document type.

##### 400 Bad Request - Missing user_id (Authentication Issue)

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "user_id required"
}
```

**What Happens:** The authentication token is missing or invalid. No document is saved. User must provide a valid Bearer token in the Authorization header.

##### 500 Internal Server Error

```json
{
  "status": "error",
  "statusCode": 500,
  "message": "Failed to save document"
}
```

**What Happens:** An unexpected error occurred during document upload (database error, file system error, etc.). No document is saved. User should retry the upload.

---

### 1.2 Update Document

**Name:** Update Document Details

**Description:** Updates metadata or file information for an existing document. This can be used to correct information, add metadata, or update the file path after re-uploading.

**Route:** `PATCH /user/documents/:id`

**Authentication Required:** Yes

#### Request Payload

```json
{
  "filename": "national_id_front_updated.jpg",
  "filepath": "/uploads/documents/xyz789.jpg",
  "meta": {
    "document_number": "A12345678",
    "issue_date": "2020-01-15",
    "expiry_date": "2030-01-15",
    "notes": "Updated with clearer image"
  }
}
```

#### Path Parameters

| Parameter | Type   | Required | Description               |
| --------- | ------ | -------- | ------------------------- |
| id        | string | Yes      | The document ID to update |

#### Field Requirements

| Field    | Type   | Required | Description                    |
| -------- | ------ | -------- | ------------------------------ |
| filename | string | No       | New filename                   |
| filepath | string | No       | New file path                  |
| meta     | object | No       | Updated or additional metadata |

#### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Document updated",
  "data": {
    "id": "doc-550e8400-e29b-41d4-a716-446655440000",
    "user_id": "user-123e4567-e89b-12d3-a456-426614174000",
    "doc_type": "national_id",
    "filename": "national_id_front_updated.jpg",
    "filepath": "/uploads/documents/xyz789.jpg",
    "mime_type": "image/jpeg",
    "file_size": 2048576,
    "is_verified": 0,
    "meta": {
      "document_number": "A12345678",
      "issue_date": "2020-01-15",
      "expiry_date": "2030-01-15",
      "notes": "Updated with clearer image"
    },
    "uploaded_at": "2026-01-11T10:30:00.000Z",
    "updated_at": "2026-01-11T11:15:00.000Z"
  }
}
```

#### Error Responses

##### 400 Bad Request - Missing ID

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "document id required"
}
```

##### 404 Not Found

```json
{
  "status": "error",
  "statusCode": 404,
  "message": "Document not found"
}
```

**What Happens:** The document with the specified ID doesn't exist or doesn't belong to the authenticated user. No update is performed.

---

### 1.3 Request Document Verification

**Name:** Request Document Verification

**Description:** Submits a document for verification by administrators or automated verification services. Creates a verification request that tracks the verification status and any reviewer notes.

**Route:** `POST /user/documents/:id/verify`

**Authentication Required:** Yes

#### Request Payload

```json
{
  "notes": "Please verify this national ID for KYC purposes",
  "metadata": {
    "urgency": "high",
    "purpose": "account_verification"
  }
}
```

#### Path Parameters

| Parameter | Type   | Required | Description               |
| --------- | ------ | -------- | ------------------------- |
| id        | string | Yes      | The document ID to verify |

#### Field Requirements

| Field    | Type   | Required | Description                                       |
| -------- | ------ | -------- | ------------------------------------------------- |
| notes    | string | No       | Additional notes for the reviewer                 |
| metadata | object | No       | Additional context about the verification request |

#### Success Response (201 Created)

```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Verification request created",
  "data": {
    "id": "ver-650e8400-e29b-41d4-a716-446655440001",
    "document_id": "doc-550e8400-e29b-41d4-a716-446655440000",
    "verification_status": "pending",
    "reviewer_id": null,
    "notes": "Please verify this national ID for KYC purposes",
    "metadata": {
      "urgency": "high",
      "purpose": "account_verification"
    },
    "requested_at": "2026-01-11T11:20:00.000Z"
  }
}
```

#### Error Responses

##### 400 Bad Request - Missing Document ID

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "document id required"
}
```

##### 500 Internal Server Error

```json
{
  "status": "error",
  "statusCode": 500,
  "message": "Failed to create verification"
}
```

---

### 1.4 Get Verification Status

**Name:** Get User Verification Status

**Description:** Retrieves the overall verification status for a user, including all documents and their verification states. This provides a comprehensive view of the user's verification progress.

**Route:** `GET /user/verification-status`

**Authentication Required:** Yes

#### Query Parameters

| Parameter | Type   | Required | Description                                       |
| --------- | ------ | -------- | ------------------------------------------------- |
| user_id   | string | No       | Specific user ID (defaults to authenticated user) |

#### Success Response (200 OK)

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

#### Error Responses

##### 400 Bad Request

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "user_id required"
}
```

---

## 2. Academic Records

### 2.1 Add Academic Record

**Name:** Add Academic Record

**Description:** Creates a new academic record for a student, including details about their educational institution, degree program, dates, and GPA. This record serves as the parent for transcripts and academic documents.

**Route:** `POST /user/academics`

**Authentication Required:** Yes

#### Request Payload

```json
{
  "institution": "University of Lagos",
  "degree": "Bachelor of Science",
  "field_of_study": "Computer Science",
  "start_date": "2018-09-01",
  "end_date": "2022-06-30",
  "gpa": "3.85",
  "gpa_scale": "4.0",
  "is_current": false,
  "metadata": {
    "honors": "First Class",
    "thesis_title": "Machine Learning Applications in Healthcare"
  }
}
```

#### Field Requirements

| Field          | Type    | Required | Description                                  |
| -------------- | ------- | -------- | -------------------------------------------- |
| institution    | string  | Yes      | Name of the educational institution          |
| degree         | string  | No       | Degree or qualification name                 |
| field_of_study | string  | No       | Major or field of study                      |
| start_date     | string  | No       | Start date (YYYY-MM-DD format)               |
| end_date       | string  | No       | End date or expected graduation (YYYY-MM-DD) |
| gpa            | string  | No       | Grade point average                          |
| gpa_scale      | string  | No       | GPA scale (e.g., "4.0", "5.0", "100")        |
| is_current     | boolean | No       | Whether this is current education            |
| metadata       | object  | No       | Additional academic information              |

#### Success Response (201 Created)

```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Academic record created",
  "data": {
    "id": "acad-750e8400-e29b-41d4-a716-446655440002",
    "user_id": "user-123e4567-e89b-12d3-a456-426614174000",
    "institution": "University of Lagos",
    "degree": "Bachelor of Science",
    "field_of_study": "Computer Science",
    "start_date": "2018-09-01",
    "end_date": "2022-06-30",
    "gpa": "3.85",
    "gpa_scale": "4.0",
    "is_current": false,
    "metadata": {
      "honors": "First Class",
      "thesis_title": "Machine Learning Applications in Healthcare"
    },
    "created_at": "2026-01-11T12:00:00.000Z"
  }
}
```

#### Error Responses

##### 400 Bad Request - Missing Institution

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "institution required"
}
```

**What Happens:** The request is missing the required `institution` field. No academic record is created.

---

### 2.2 Update Academic Record

**Name:** Update Academic Record

**Description:** Updates an existing academic record with new information. This can be used to correct details, add graduation information, or update GPA.

**Route:** `PATCH /user/academics/:id`

**Authentication Required:** Yes

#### Request Payload

```json
{
  "end_date": "2022-07-15",
  "gpa": "3.92",
  "is_current": false,
  "metadata": {
    "honors": "First Class with Distinction",
    "thesis_title": "Machine Learning Applications in Healthcare",
    "graduation_ceremony_date": "2022-07-15"
  }
}
```

#### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Academic record updated",
  "data": {
    "id": "acad-750e8400-e29b-41d4-a716-446655440002",
    "user_id": "user-123e4567-e89b-12d3-a456-426614174000",
    "institution": "University of Lagos",
    "degree": "Bachelor of Science",
    "field_of_study": "Computer Science",
    "start_date": "2018-09-01",
    "end_date": "2022-07-15",
    "gpa": "3.92",
    "gpa_scale": "4.0",
    "is_current": false,
    "metadata": {
      "honors": "First Class with Distinction",
      "thesis_title": "Machine Learning Applications in Healthcare",
      "graduation_ceremony_date": "2022-07-15"
    },
    "created_at": "2026-01-11T12:00:00.000Z",
    "updated_at": "2026-01-11T13:45:00.000Z"
  }
}
```

#### Error Responses

##### 404 Not Found

```json
{
  "status": "error",
  "statusCode": 404,
  "message": "Academic record not found"
}
```

---

### 2.3 List Academic Records

**Name:** List User's Academic Records

**Description:** Retrieves all academic records for the authenticated user, ordered by start date (most recent first).

**Route:** `GET /user/academics`

**Authentication Required:** Yes

#### Query Parameters

| Parameter | Type   | Required | Description                                       |
| --------- | ------ | -------- | ------------------------------------------------- |
| user_id   | string | No       | Specific user ID (defaults to authenticated user) |

#### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Academic records",
  "data": [
    {
      "id": "acad-750e8400-e29b-41d4-a716-446655440002",
      "user_id": "user-123e4567-e89b-12d3-a456-426614174000",
      "institution": "University of Lagos",
      "degree": "Bachelor of Science",
      "field_of_study": "Computer Science",
      "start_date": "2018-09-01",
      "end_date": "2022-07-15",
      "gpa": "3.92",
      "gpa_scale": "4.0",
      "is_current": false,
      "created_at": "2026-01-11T12:00:00.000Z"
    },
    {
      "id": "acad-750e8400-e29b-41d4-a716-446655440003",
      "user_id": "user-123e4567-e89b-12d3-a456-426614174000",
      "institution": "Kings College Lagos",
      "degree": "SSCE",
      "field_of_study": "Science",
      "start_date": "2012-09-01",
      "end_date": "2018-06-30",
      "is_current": false,
      "created_at": "2026-01-11T12:05:00.000Z"
    }
  ]
}
```

---

### 2.4 Upload Transcript

**Name:** Upload Academic Transcript

**Description:** Uploads a transcript file for a specific academic record. Transcripts are official documents showing courses, grades, and academic performance. They are linked to an academic record and can be verified separately.

**Route:** `POST /user/academics/:academicId/transcripts`

**Authentication Required:** Yes

#### Request Payload (multipart/form-data)

```json
{
  "filename": "unilag_transcript_2022.pdf",
  "filepath": "/uploads/transcripts/transcript_abc123.pdf",
  "mime_type": "application/pdf",
  "file_size": 524288,
  "metadata": {
    "semester": "Final Year",
    "official": true,
    "transcript_type": "official"
  }
}
```

#### Path Parameters

| Parameter  | Type   | Required | Description                                       |
| ---------- | ------ | -------- | ------------------------------------------------- |
| academicId | string | Yes      | The academic record ID this transcript belongs to |

#### Success Response (201 Created)

```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Transcript uploaded",
  "data": {
    "id": "trans-850e8400-e29b-41d4-a716-446655440004",
    "academic_record_id": "acad-750e8400-e29b-41d4-a716-446655440002",
    "filename": "unilag_transcript_2022.pdf",
    "filepath": "/uploads/transcripts/transcript_abc123.pdf",
    "mime_type": "application/pdf",
    "file_size": 524288,
    "is_verified": 0,
    "metadata": {
      "semester": "Final Year",
      "official": true,
      "transcript_type": "official"
    },
    "uploaded_at": "2026-01-11T13:00:00.000Z"
  }
}
```

#### Error Responses

##### 400 Bad Request - Missing Academic ID

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "academic id required"
}
```

##### 400 Bad Request - Missing Filename

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "filename required"
}
```

---

### 2.5 List Transcripts

**Name:** List Transcripts for Academic Record

**Description:** Retrieves all transcripts associated with a specific academic record.

**Route:** `GET /user/academics/:academicId/transcripts`

**Authentication Required:** Yes

#### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Transcripts",
  "data": [
    {
      "id": "trans-850e8400-e29b-41d4-a716-446655440004",
      "academic_record_id": "acad-750e8400-e29b-41d4-a716-446655440002",
      "filename": "unilag_transcript_2022.pdf",
      "filepath": "/uploads/transcripts/transcript_abc123.pdf",
      "mime_type": "application/pdf",
      "file_size": 524288,
      "is_verified": 1,
      "verified_at": "2026-01-10T16:00:00.000Z",
      "uploaded_at": "2026-01-11T13:00:00.000Z"
    }
  ]
}
```

---

## 3. Institution Verification

### 3.1 Create Verification Request

**Name:** Create Institution Verification Request

**Description:** Submits a request for an institution (employer, university, etc.) to verify a student's credentials, employment, or academic record. The institution receives the request and can approve or reject it.

**Route:** `POST /user/verification-requests`

**Authentication Required:** Yes

#### Request Payload

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

#### Field Requirements

| Field             | Type   | Required | Description                                    |
| ----------------- | ------ | -------- | ---------------------------------------------- |
| institution_name  | string | Yes      | Name of the institution                        |
| institution_email | string | Yes      | Contact email for the institution              |
| request_type      | string | Yes      | Type: "academic", "employment", "professional" |
| details           | object | No       | Specific details to be verified                |
| message           | string | No       | Custom message to the institution              |

#### Success Response (201 Created)

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
    "requested_at": "2026-01-11T14:00:00.000Z"
  }
}
```

---

## 4. Student Cards

### 4.1 Create Student Card

**Name:** Create Digital Student Card

**Description:** Generates a digital student card that can be used for identification and verification purposes. The card contains student information and can generate time-limited verification tokens.

**Route:** `POST /user/cards`

**Authentication Required:** Yes

#### Request Payload

```json
{
  "institution": "University of Lagos",
  "student_id": "UL/18/CS/1234",
  "program": "Computer Science",
  "year_of_study": "Graduate",
  "valid_from": "2022-09-01",
  "valid_until": "2026-08-31",
  "metadata": {
    "faculty": "Science",
    "department": "Computer Science",
    "matriculation_year": "2018"
  }
}
```

#### Success Response (201 Created)

```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Student card created",
  "data": {
    "id": "card-a50e8400-e29b-41d4-a716-446655440006",
    "user_id": "user-123e4567-e89b-12d3-a456-426614174000",
    "card_uuid": "card-uuid-b60e8400-e29b-41d4-a716-446655440007",
    "institution": "University of Lagos",
    "student_id": "UL/18/CS/1234",
    "program": "Computer Science",
    "year_of_study": "Graduate",
    "valid_from": "2022-09-01",
    "valid_until": "2026-08-31",
    "is_active": true,
    "metadata": {
      "faculty": "Science",
      "department": "Computer Science",
      "matriculation_year": "2018"
    },
    "created_at": "2026-01-11T14:30:00.000Z"
  }
}
```

---

## 5. Portfolio Management

### 5.1 Create Project

**Name:** Add Project to Portfolio

**Description:** Adds a project to the student's portfolio. Projects showcase practical work, research, or personal initiatives.

**Route:** `POST /user/projects`

**Authentication Required:** Yes

#### Request Payload

```json
{
  "title": "E-commerce Platform with AI Recommendations",
  "description": "Built a full-stack e-commerce platform with machine learning-powered product recommendations",
  "technologies": ["React", "Node.js", "Python", "TensorFlow", "MongoDB"],
  "project_url": "https://github.com/johndoe/ecommerce-ai",
  "demo_url": "https://ecommerce-demo.johndoe.com",
  "start_date": "2021-06-01",
  "end_date": "2021-12-15",
  "role": "Full Stack Developer & ML Engineer",
  "is_featured": true,
  "metadata": {
    "team_size": 1,
    "category": "web_development",
    "achievements": [
      "Increased conversion rate by 25%",
      "Implemented A/B testing framework"
    ]
  }
}
```

#### Field Requirements

| Field        | Type    | Required | Description                          |
| ------------ | ------- | -------- | ------------------------------------ |
| title        | string  | Yes      | Project title                        |
| description  | string  | No       | Detailed project description         |
| technologies | array   | No       | Array of technologies used           |
| project_url  | string  | No       | Repository or project URL            |
| demo_url     | string  | No       | Live demo URL                        |
| start_date   | string  | No       | Project start date (YYYY-MM-DD)      |
| end_date     | string  | No       | Project completion date (YYYY-MM-DD) |
| role         | string  | No       | Your role in the project             |
| is_featured  | boolean | No       | Whether to feature this project      |
| metadata     | object  | No       | Additional project information       |

#### Success Response (201 Created)

```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Project created",
  "data": {
    "id": "proj-c50e8400-e29b-41d4-a716-446655440008",
    "user_id": "user-123e4567-e89b-12d3-a456-426614174000",
    "title": "E-commerce Platform with AI Recommendations",
    "description": "Built a full-stack e-commerce platform with machine learning-powered product recommendations",
    "technologies": ["React", "Node.js", "Python", "TensorFlow", "MongoDB"],
    "project_url": "https://github.com/johndoe/ecommerce-ai",
    "demo_url": "https://ecommerce-demo.johndoe.com",
    "start_date": "2021-06-01",
    "end_date": "2021-12-15",
    "role": "Full Stack Developer & ML Engineer",
    "is_featured": true,
    "metadata": {
      "team_size": 1,
      "category": "web_development",
      "achievements": [
        "Increased conversion rate by 25%",
        "Implemented A/B testing framework"
      ]
    },
    "created_at": "2026-01-11T15:00:00.000Z"
  }
}
```

#### Error Responses

##### 400 Bad Request - Missing Title

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "title required"
}
```

---

### 5.2 Update Project

**Name:** Update Project Details

**Description:** Updates an existing project in the portfolio.

**Route:** `PATCH /user/projects/:id`

**Authentication Required:** Yes

#### Request Payload

```json
{
  "is_featured": false,
  "description": "Enhanced e-commerce platform with advanced AI recommendations and real-time analytics",
  "metadata": {
    "team_size": 1,
    "category": "web_development",
    "achievements": [
      "Increased conversion rate by 35%",
      "Implemented A/B testing framework",
      "Added real-time analytics dashboard"
    ]
  }
}
```

#### Success Response (200 OK)

Similar structure to creation response with updated fields.

---

### 5.3 List Projects

**Name:** List User's Projects

**Description:** Retrieves all projects in the user's portfolio.

**Route:** `GET /user/projects`

**Authentication Required:** Yes

#### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Projects",
  "data": [
    {
      "id": "proj-c50e8400-e29b-41d4-a716-446655440008",
      "title": "E-commerce Platform with AI Recommendations",
      "description": "Enhanced e-commerce platform...",
      "is_featured": false,
      "created_at": "2026-01-11T15:00:00.000Z"
    }
  ]
}
```

---

### 5.4 Create Certificate

**Name:** Add Certificate to Portfolio

**Description:** Adds a professional certificate or certification to the portfolio.

**Route:** `POST /user/certificates`

**Authentication Required:** Yes

#### Request Payload

```json
{
  "issuer": "Google Cloud",
  "title": "Google Cloud Professional Cloud Architect",
  "issue_date": "2023-06-15",
  "expiry_date": "2025-06-15",
  "credential_id": "GC-PCA-2023-123456",
  "credential_url": "https://www.credential.net/abc123",
  "description": "Certification demonstrating expertise in designing and managing Google Cloud infrastructure",
  "skills": ["Cloud Architecture", "GCP", "Infrastructure Design", "Security"],
  "metadata": {
    "certification_authority": "Google",
    "verification_status": "verified"
  }
}
```

#### Field Requirements

| Field          | Type   | Required | Description                      |
| -------------- | ------ | -------- | -------------------------------- |
| issuer         | string | Yes      | Certificate issuing organization |
| title          | string | Yes      | Certificate name                 |
| issue_date     | string | No       | Date issued (YYYY-MM-DD)         |
| expiry_date    | string | No       | Expiration date (YYYY-MM-DD)     |
| credential_id  | string | No       | Unique certificate identifier    |
| credential_url | string | No       | Verification URL                 |
| description    | string | No       | Certificate description          |
| skills         | array  | No       | Skills demonstrated              |
| metadata       | object | No       | Additional information           |

#### Success Response (201 Created)

```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Certificate created",
  "data": {
    "id": "cert-d50e8400-e29b-41d4-a716-446655440009",
    "user_id": "user-123e4567-e89b-12d3-a456-426614174000",
    "issuer": "Google Cloud",
    "title": "Google Cloud Professional Cloud Architect",
    "issue_date": "2023-06-15",
    "expiry_date": "2025-06-15",
    "credential_id": "GC-PCA-2023-123456",
    "credential_url": "https://www.credential.net/abc123",
    "is_verified": 0,
    "created_at": "2026-01-11T15:30:00.000Z"
  }
}
```

#### Error Responses

##### 400 Bad Request - Missing Required Fields

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "issuer and title required"
}
```

---

### 5.5 Update Certificate

**Name:** Update Certificate Details

**Description:** Updates an existing certificate in the portfolio.

**Route:** `PATCH /user/certificates/:id`

**Authentication Required:** Yes

---

### 5.6 List Certificates

**Name:** List User's Certificates

**Description:** Retrieves all certificates in the user's portfolio.

**Route:** `GET /user/certificates`

**Authentication Required:** Yes

---

## 6. Verification Tokens

### 6.1 Issue Verification Token

**Name:** Issue Verification Token

**Description:** Creates a time-limited verification token that third parties can use to verify a user's credentials or information. Tokens can be scoped to specific data and have configurable expiration times.

**Route:** `POST /user/verification-tokens`

**Authentication Required:** Yes

#### Request Payload

```json
{
  "token_type": "identity_verification",
  "scope": {
    "data_types": ["identity", "academic_records"],
    "institution": "University of Lagos"
  },
  "expires_in": 3600,
  "max_uses": 5,
  "metadata": {
    "purpose": "job_application",
    "company": "TechCorp Nigeria"
  }
}
```

#### Success Response (201 Created)

```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Verification token issued",
  "data": {
    "id": "vtoken-e50e8400-e29b-41d4-a716-446655440010",
    "user_id": "user-123e4567-e89b-12d3-a456-426614174000",
    "token": "VT_abc123xyz789secure_token_string",
    "token_type": "identity_verification",
    "scope": {
      "data_types": ["identity", "academic_records"],
      "institution": "University of Lagos"
    },
    "expires_at": "2026-01-11T17:00:00.000Z",
    "max_uses": 5,
    "uses_count": 0,
    "is_revoked": false,
    "created_at": "2026-01-11T16:00:00.000Z"
  }
}
```

---

### 6.2 Revoke Verification Token

**Name:** Revoke Verification Token

**Description:** Revokes a verification token, making it invalid for future use.

**Route:** `PATCH /user/verification-tokens/:id/revoke`

**Authentication Required:** Yes

---

### 6.3 Validate Verification Token

**Name:** Validate Verification Token

**Description:** Validates a verification token and returns the associated user data within the token's scope. This is typically used by third parties who received the token.

**Route:** `POST /user/verification-tokens/validate`

**Authentication Required:** No (token-based)

#### Request Payload

```json
{
  "token": "VT_abc123xyz789secure_token_string"
}
```

---

## 7. Shareable Links

### 7.1 Create Shareable Link

**Name:** Create Shareable Link

**Description:** Generates a shareable link that allows controlled access to specific profile information or resources without requiring authentication.

**Route:** `POST /user/shareable-links`

**Authentication Required:** Yes

#### Request Payload

```json
{
  "token": "custom-unique-token-or-auto-generated",
  "resource_type": "profile",
  "resource_id": null,
  "scope": {
    "sections": ["bio", "education", "projects"],
    "permissions": ["read"]
  },
  "expires_at": "2026-02-11T00:00:00.000Z",
  "max_uses": 100
}
```

#### Success Response (201 Created)

```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Shareable link created",
  "data": {
    "id": "link-f50e8400-e29b-41d4-a716-446655440011",
    "user_id": "user-123e4567-e89b-12d3-a456-426614174000",
    "token": "custom-unique-token-or-auto-generated",
    "resource_type": "profile",
    "resource_id": null,
    "scope": {
      "sections": ["bio", "education", "projects"],
      "permissions": ["read"]
    },
    "expires_at": "2026-02-11T00:00:00.000Z",
    "max_uses": 100,
    "uses_count": 0,
    "is_revoked": false,
    "public_url": "https://identity.syncnexa.com/shared/custom-unique-token-or-auto-generated",
    "created_at": "2026-01-11T16:30:00.000Z"
  }
}
```

---

### 7.2 Revoke Shareable Link

**Name:** Revoke Shareable Link

**Description:** Revokes a shareable link, making it inaccessible.

**Route:** `PATCH /user/shareable-links/:id/revoke`

**Authentication Required:** Yes

---

### 7.3 Validate Shareable Link

**Name:** Validate Shareable Link

**Description:** Validates a shareable link token and returns the accessible data within the defined scope.

**Route:** `POST /user/shareable-links/validate`

**Authentication Required:** No (token-based)

---

## Common Error Scenarios

### Authentication Errors

All authenticated endpoints return the following error if the Bearer token is missing or invalid:

```json
{
  "status": "error",
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**What Happens:** The request is rejected before processing. User must provide a valid access token obtained from the login endpoint.

### Authorization Errors

When trying to access or modify resources owned by other users:

```json
{
  "status": "error",
  "statusCode": 403,
  "message": "Forbidden"
}
```

**What Happens:** The user is authenticated but doesn't have permission to access the requested resource. Only resource owners can modify their own data.

---

## Best Practices

1. **File Uploads:** Use multipart/form-data for document and transcript uploads. Include metadata as JSON strings in form fields.

2. **Metadata:** Use the metadata fields to store additional context that doesn't fit the structured fields. This provides flexibility for future enhancements.

3. **Verification Workflow:**

   - Upload documents first
   - Request verification second
   - Monitor verification status regularly

4. **Portfolio Management:** Keep projects and certificates up-to-date. Feature your best work using the `is_featured` flag.

5. **Token Management:**

   - Set appropriate expiration times for verification tokens
   - Use narrow scopes to limit data exposure
   - Revoke tokens when no longer needed

6. **Shareable Links:** Use shareable links for public profiles while verification tokens are for specific verification requests.

---

## Related Documentation

- [Authentication Flow](./authentication.md)
- [Dashboard Flow](./dashboard.md)
- [Session Management](./session-management.md)
