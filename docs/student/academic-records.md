# Academic Records

Complete documentation for managing academic records and transcripts, including creating, updating, and uploading academic documents.

---

## Overview

The Academic Records feature allows students to document their educational history, including institutions attended, degrees earned, and academic performance. Each academic record can have associated transcripts and other academic documents for verification.

**Use Cases:**

- Add educational history (degrees, certifications)
- Upload official transcripts
- Document academic performance (GPA, honors)
- Track multiple educational institutions
- Submit for verification

**Authentication:** All endpoints require authentication via Bearer token in the Authorization header.

**Related Documentation:**

- [Documents](/docs/student/documents) - Manage identity documents
- [Verification](/docs/verification) - Verify academic records
- [Portfolio](/docs/student/portfolio) - Add projects and achievements

---

## Table of Contents

1. [Create Academic Record](#1-create-academic-record)
2. [Update Academic Record](#2-update-academic-record)
3. [Retrieve Academic Records](#3-retrieve-academic-records)
4. [Upload Transcript](#4-upload-transcript)
5. [Retrieve Transcripts](#5-retrieve-transcripts)
6. [Delete Transcript](#6-delete-transcript)
7. [Examples](#examples)

---

## 1. Create Academic Record

**Name:** Create Academic Record

**Description:** Creates a new academic record for a student, including details about their educational institution, degree program, dates, and GPA. This record serves as the parent for transcripts and academic documents.

**Route:** `POST /user/academics`

**Authentication Required:** Yes (Bearer token)

**Rate Limit:** 50 records per user

### Request Headers

```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

### Request Payload

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
    "thesis_title": "Machine Learning Applications in Healthcare",
    "honors_threshold": "3.75",
    "graduation_ceremony_date": "2022-07-15"
  }
}
```

### Field Requirements

| Field          | Type    | Required | Validation    | Description                                                |
| -------------- | ------- | -------- | ------------- | ---------------------------------------------------------- |
| institution    | string  | Yes      | 2-200 chars   | Name of the educational institution                        |
| degree         | string  | No       | Max 100 chars | Degree or qualification name (B.Sc, M.A, Ph.D, SSCE, etc.) |
| field_of_study | string  | No       | Max 100 chars | Major or field of study                                    |
| start_date     | string  | No       | YYYY-MM-DD    | Start date                                                 |
| end_date       | string  | No       | YYYY-MM-DD    | End date or expected graduation                            |
| gpa            | string  | No       | Numeric       | Grade point average (e.g., "3.85")                         |
| gpa_scale      | string  | No       | Numeric       | GPA scale (e.g., "4.0", "5.0", "100")                      |
| is_current     | boolean | No       | boolean       | Whether this is current education                          |
| metadata       | object  | No       | JSON          | Additional academic information                            |

### Request Example (cURL)

```bash
curl -X POST https://identity.syncnexa.com/api/v1/user/academics \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

### Request Example (JavaScript)

```javascript
async function createAcademicRecord(accessToken, recordData) {
  const response = await fetch(
    "https://identity.syncnexa.com/api/v1/user/academics",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(recordData),
    },
  );

  const result = await response.json();
  if (response.ok) {
    console.log("Academic record created:", result.data);
    return result.data;
  } else {
    console.error("Creation failed:", result.message);
    throw new Error(result.message);
  }
}

// Usage
const record = await createAcademicRecord(accessToken, {
  institution: "University of Lagos",
  degree: "Bachelor of Science",
  field_of_study: "Computer Science",
  start_date: "2018-09-01",
  end_date: "2022-06-30",
  gpa: "3.85",
  gpa_scale: "4.0",
});
```

### Request Example (Python)

```python
import requests

def create_academic_record(access_token, record_data):
    url = 'https://identity.syncnexa.com/api/v1/user/academics'
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }

    response = requests.post(url, headers=headers, json=record_data)

    if response.status_code == 201:
        return response.json()['data']
    else:
        raise Exception(f"Failed: {response.json()['message']}")

# Usage
record = create_academic_record(access_token, {
    'institution': 'University of Lagos',
    'degree': 'Bachelor of Science',
    'field_of_study': 'Computer Science',
    'start_date': '2018-09-01',
    'end_date': '2022-06-30',
    'gpa': '3.85',
    'gpa_scale': '4.0',
    'is_current': False
})
```

### Success Response (201 Created)

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

### Error Responses

#### 400 Bad Request - Missing Institution

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "institution",
      "message": "institution is required"
    }
  ]
}
```

**What Happens:** The request is missing the required `institution` field. No academic record is created.

#### 400 Bad Request - Invalid Date Format

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "start_date",
      "message": "start_date must be in YYYY-MM-DD format"
    }
  ]
}
```

**What Happens:** The date is in an invalid format. Use YYYY-MM-DD format.

#### 400 Bad Request - End Date Before Start Date

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "end_date",
      "message": "end_date must be after start_date"
    }
  ]
}
```

**What Happens:** The end date is before the start date. Correct the dates.

#### 401 Unauthorized

```json
{
  "status": "error",
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

## 2. Update Academic Record

**Name:** Update Academic Record

**Description:** Updates an existing academic record with new information. Use this to correct details, add graduation information, update GPA, or add metadata like honors.

**Route:** `PATCH /user/academics/:id`

**Authentication Required:** Yes

### Request Headers

```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

### Path Parameters

| Parameter | Type   | Required | Description                      |
| --------- | ------ | -------- | -------------------------------- |
| id        | string | Yes      | The academic record ID to update |

### Request Payload

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

### Updatable Fields

| Field          | Type    | Description                |
| -------------- | ------- | -------------------------- |
| degree         | string  | Degree name                |
| field_of_study | string  | Field of study             |
| start_date     | string  | Start date (YYYY-MM-DD)    |
| end_date       | string  | End date (YYYY-MM-DD)      |
| gpa            | string  | GPA                        |
| gpa_scale      | string  | GPA scale                  |
| is_current     | boolean | Whether currently studying |
| metadata       | object  | Additional information     |

### Request Example (JavaScript)

```javascript
async function updateAcademicRecord(academicId, accessToken, updates) {
  const response = await fetch(
    `https://identity.syncnexa.com/api/v1/user/academics/${academicId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    },
  );

  const result = await response.json();
  return result;
}

// Usage
const updated = await updateAcademicRecord(
  "acad-750e8400-e29b-41d4-a716-446655440002",
  accessToken,
  {
    end_date: "2022-07-15",
    gpa: "3.92",
    metadata: { honors: "First Class with Distinction" },
  },
);
```

### Success Response (200 OK)

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

### Error Responses

#### 404 Not Found

```json
{
  "status": "error",
  "statusCode": 404,
  "message": "Academic record not found"
}
```

**What Happens:** The academic record doesn't exist or doesn't belong to the authenticated user.

#### 400 Bad Request - Invalid Update

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "end_date",
      "message": "end_date must be after start_date"
    }
  ]
}
```

---

## 3. Retrieve Academic Records

**Name:** Retrieve Academic Records

**Description:** Retrieves all academic records for the authenticated user, ordered by start date (most recent first).

**Route:** `GET /user/academics`

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
curl -X GET https://identity.syncnexa.com/api/v1/user/academics \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Success Response (200 OK)

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
      "metadata": {
        "honors": "First Class with Distinction"
      },
      "created_at": "2026-01-11T12:00:00.000Z",
      "updated_at": "2026-01-11T13:45:00.000Z"
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

### Empty Response

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Academic records",
  "data": []
}
```

**What Happens:** No academic records have been created yet.

---

## 4. Upload Transcript

**Name:** Upload Academic Transcript

**Description:** Uploads a transcript file for a specific academic record. Transcripts are official documents showing courses, grades, and academic performance. Multiple transcripts can be associated with a single academic record.

**Route:** `POST /user/academics/:academicId/transcripts`

**Authentication Required:** Yes

**Rate Limit:** 20 transcripts per record

### Request Headers

```
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
```

### Path Parameters

| Parameter  | Type   | Required | Description                                       |
| ---------- | ------ | -------- | ------------------------------------------------- |
| academicId | string | Yes      | The academic record ID this transcript belongs to |

### Request Payload (multipart/form-data)

| Field    | Type | Required | Description                                   |
| -------- | ---- | -------- | --------------------------------------------- |
| file     | file | Yes      | The transcript file (PDF, PNG, JPG - max 5MB) |
| metadata | JSON | No       | Additional metadata (stringified JSON)        |

### Request Example (cURL)

```bash
curl -X POST https://identity.syncnexa.com/api/v1/user/academics/acad-750e8400-e29b-41d4-a716-446655440002/transcripts \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "file=@transcript.pdf" \
  -F "metadata={\"semester\": \"Final Year\", \"official\": true}"
```

### Request Example (JavaScript)

```javascript
async function uploadTranscript(academicId, accessToken, file, metadata) {
  const formData = new FormData();
  formData.append("file", file);
  if (metadata) {
    formData.append("metadata", JSON.stringify(metadata));
  }

  const response = await fetch(
    `https://identity.syncnexa.com/api/v1/user/academics/${academicId}/transcripts`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    },
  );

  return await response.json();
}

// Usage
const result = await uploadTranscript(
  "acad-750e8400-e29b-41d4-a716-446655440002",
  accessToken,
  fileInput.files[0],
  { semester: "Final Year", official: true },
);
```

### Request Example (Python)

```python
import requests

def upload_transcript(academic_id, access_token, file_path, metadata=None):
    url = f'https://identity.syncnexa.com/api/v1/user/academics/{academic_id}/transcripts'
    headers = {'Authorization': f'Bearer {access_token}'}

    with open(file_path, 'rb') as f:
        files = {'file': f}
        data = {}
        if metadata:
            data['metadata'] = json.dumps(metadata)

        response = requests.post(url, headers=headers, files=files, data=data)
        return response.json()

# Usage
result = upload_transcript(
    'acad-750e8400-e29b-41d4-a716-446655440002',
    access_token,
    'transcript.pdf',
    {'semester': 'Final Year', 'official': True}
)
```

### Success Response (201 Created)

```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Transcript uploaded",
  "data": {
    "id": "trans-850e8400-e29b-41d4-a716-446655440004",
    "academic_record_id": "acad-750e8400-e29b-41d4-a716-446655440002",
    "filename": "transcript_1673348400.pdf",
    "filepath": "/uploads/transcripts/trans-850e8400-e29b-41d4-a716-446655440004.pdf",
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

### Error Responses

#### 400 Bad Request - Academic Record Not Found

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "academic id required"
}
```

#### 400 Bad Request - Missing File

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "filename required"
}
```

#### 413 Payload Too Large

```json
{
  "status": "error",
  "statusCode": 413,
  "message": "File size exceeds 5MB limit"
}
```

#### 404 Not Found

```json
{
  "status": "error",
  "statusCode": 404,
  "message": "Academic record not found"
}
```

---

## 5. Retrieve Transcripts

**Name:** Retrieve Transcripts for Academic Record

**Description:** Retrieves all transcripts associated with a specific academic record.

**Route:** `GET /user/academics/:academicId/transcripts`

**Authentication Required:** Yes

### Request Headers

```
Authorization: Bearer {accessToken}
```

### Path Parameters

| Parameter  | Type   | Required | Description            |
| ---------- | ------ | -------- | ---------------------- |
| academicId | string | Yes      | The academic record ID |

### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Transcripts",
  "data": [
    {
      "id": "trans-850e8400-e29b-41d4-a716-446655440004",
      "academic_record_id": "acad-750e8400-e29b-41d4-a716-446655440002",
      "filename": "transcript_1673348400.pdf",
      "filepath": "/uploads/transcripts/trans-850e8400-e29b-41d4-a716-446655440004.pdf",
      "mime_type": "application/pdf",
      "file_size": 524288,
      "is_verified": 1,
      "verified_at": "2026-01-10T16:00:00.000Z",
      "metadata": {
        "semester": "Final Year",
        "official": true
      },
      "uploaded_at": "2026-01-11T13:00:00.000Z"
    }
  ]
}
```

---

## 6. Delete Transcript

**Name:** Delete Transcript

**Description:** Deletes a transcript file from the system. Verified transcripts cannot be deleted.

**Route:** `DELETE /user/academics/:academicId/transcripts/:transcriptId`

**Authentication Required:** Yes

### Path Parameters

| Parameter    | Type   | Required | Description                 |
| ------------ | ------ | -------- | --------------------------- |
| academicId   | string | Yes      | The academic record ID      |
| transcriptId | string | Yes      | The transcript ID to delete |

### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Transcript deleted"
}
```

### Error Responses

#### 403 Forbidden - Cannot Delete Verified Transcript

```json
{
  "status": "error",
  "statusCode": 403,
  "message": "Cannot delete a verified transcript"
}
```

#### 404 Not Found

```json
{
  "status": "error",
  "statusCode": 404,
  "message": "Transcript not found"
}
```

---

## Examples

### Complete Workflow: Add Academic Record with Transcript

This example shows creating an academic record and uploading a transcript for it.

#### Step 1: Create Academic Record

```javascript
// 1. Create the academic record
const recordResponse = await fetch(
  "https://identity.syncnexa.com/api/v1/user/academics",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      institution: "University of Lagos",
      degree: "Bachelor of Science",
      field_of_study: "Computer Science",
      start_date: "2018-09-01",
      end_date: "2022-06-30",
      gpa: "3.85",
      gpa_scale: "4.0",
      is_current: false,
      metadata: {
        honors: "First Class",
        thesis_title: "ML in Healthcare",
      },
    }),
  },
);

const recordData = await recordResponse.json();
const academicId = recordData.data.id;
console.log("Academic record created:", academicId);
```

#### Step 2: Upload Transcript

```javascript
// 2. Upload transcript for the record
const formData = new FormData();
formData.append("file", transcriptFile); // File from input
formData.append(
  "metadata",
  JSON.stringify({
    semester: "Final Year",
    official: true,
    transcript_type: "official",
  }),
);

const transcriptResponse = await fetch(
  `https://identity.syncnexa.com/api/v1/user/academics/${academicId}/transcripts`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  },
);

const transcriptData = await transcriptResponse.json();
console.log("Transcript uploaded:", transcriptData.data.id);
```

#### Step 3: Retrieve All Records

```javascript
// 3. Retrieve all academic records
const recordsResponse = await fetch(
  "https://identity.syncnexa.com/api/v1/user/academics",
  {
    headers: { Authorization: `Bearer ${accessToken}` },
  },
);

const records = await recordsResponse.json();
console.log("Total records:", records.data.length);
records.data.forEach((record) => {
  console.log(`- ${record.institution}: ${record.degree}`);
});
```

### Python Example: Batch Academic Record Creation

```python
import requests
import json
from datetime import datetime

class AcademicRecordManager:
    def __init__(self, access_token):
        self.base_url = 'https://identity.syncnexa.com/api/v1'
        self.headers = {'Authorization': f'Bearer {access_token}'}

    def add_education_history(self, education_data):
        """Add multiple academic records"""
        results = []

        for edu in education_data:
            response = requests.post(
                f'{self.base_url}/user/academics',
                headers=self.headers,
                json=edu
            )

            if response.status_code == 201:
                record = response.json()['data']
                results.append({
                    'institution': edu['institution'],
                    'id': record['id'],
                    'status': 'created'
                })
            else:
                results.append({
                    'institution': edu['institution'],
                    'status': 'failed',
                    'error': response.json()['message']
                })

        return results

# Usage
manager = AcademicRecordManager(access_token)

education_history = [
    {
        'institution': 'University of Lagos',
        'degree': 'Bachelor of Science',
        'field_of_study': 'Computer Science',
        'start_date': '2018-09-01',
        'end_date': '2022-06-30',
        'gpa': '3.85',
        'gpa_scale': '4.0'
    },
    {
        'institution': 'Kings College Lagos',
        'degree': 'SSCE',
        'field_of_study': 'Science',
        'start_date': '2012-09-01',
        'end_date': '2018-06-30'
    }
]

results = manager.add_education_history(education_history)
for result in results:
    print(f"{result['institution']}: {result['status']}")
```

---

## Related Features

- **[Documents](/docs/student/documents)** - Manage identity documents
- **[Portfolio](/docs/student/portfolio)** - Add projects and certificates
- **[Verification](/docs/verification)** - Submit for verification
