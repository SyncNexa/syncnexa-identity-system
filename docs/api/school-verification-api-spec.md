# SyncNexa School API Specification

**Version:** 1.0  
**Last Updated:** February 2, 2026  
**Status:** Final Specification for School Integration

---

## Table of Contents

1. [Overview](#overview)
2. [Objectives](#objectives)
3. [API Endpoints](#api-endpoints)
4. [Request/Response Schemas](#requestresponse-schemas)
5. [Security Requirements](#security-requirements)
6. [Error Handling](#error-handling)
7. [Webhook Callback Protocol](#webhook-callback-protocol)
8. [Implementation Checklist](#implementation-checklist)

---

## Overview

This specification defines the standardized API contract that all schools must implement to integrate with **SyncNexa's Student Verification System**.

The system allows students to **instantly verify their enrollment status and academic details** directly from the school's system, with explicit student consent, while remaining fully NDPR-compliant.

---

## Objectives

✓ Enable instant student verification without manual document upload  
✓ Provide school-authoritative canonical academic data  
✓ Maintain NDPR compliance through consent and data minimization  
✓ Support asynchronous verification via webhook callbacks  
✓ Ensure security via HMAC signing and request validation

---

## API Endpoints

Schools must implement **exactly two endpoints**:

### 1. Verification Request Endpoint

**Purpose:** Receive verification request from SyncNexa and trigger student approval workflow

**Endpoint:** `POST /api/v1/syncnexa/verify/request`

**Authentication:** Bearer Token (provided by school)

**Request Headers:**

```
Authorization: Bearer <SCHOOL_API_TOKEN>
Content-Type: application/json
X-Request-Signature: <HMAC-SHA256>
X-Request-Timestamp: <ISO8601>
```

**Request Body:**

```json
{
  "request_id": "sync-req-982373",
  "matric_number": "FUTO/CSC/2019/1234",
  "callback_url": "https://api.syncnexa.com/verify/callback/sync-req-982373"
}
```

**Parameters:**

| Field           | Type   | Required | Description                                                                                                         |
| --------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------- |
| `request_id`    | string | Yes      | Unique identifier for this verification request. Must be returned in callback. Format: `sync-req-<12 alphanumeric>` |
| `matric_number` | string | Yes      | Student's matric/enrollment number in school system                                                                 |
| `callback_url`  | string | Yes      | HTTPS URL where SyncNexa expects the canonical data. School must POST to this URL upon student approval.            |

**Expected Response (200 OK):**

```json
{
  "status": "accepted",
  "message": "Verification request received. Student approval link sent.",
  "request_id": "sync-req-982373",
  "student_notified_at": "2026-02-01T10:15:00Z"
}
```

**Expected Response (400 Bad Request):**

```json
{
  "status": "error",
  "message": "Matric number not found in system",
  "request_id": "sync-req-982373"
}
```

---

### 2. Verification Link Endpoint (Optional - School-Hosted UI)

**Purpose:** Allow student to approve verification request (if school provides custom UI)

**Important:** This endpoint is **hosted by the SCHOOL**, not by SyncNexa. The school defines its own endpoint structure.

**Example Endpoint (School Defines):**

```
GET https://student.school.edu/verify/syncnexa/<approval_token>
```

**Where:**

- `https://student.school.edu` = school's domain
- `/verify/syncnexa/<approval_token>` = school-defined path
- `<approval_token>` = single-use, time-bound token (expires in 5-10 minutes)

**Student Experience:**

1. School receives verification request from SyncNexa
2. School generates a unique approval token
3. School sends student an email/SMS with link: `https://student.school.edu/verify/syncnexa/abc123xyz789`
4. Student clicks link
5. Student authenticates to school system (if not already logged in)
6. Student sees approval prompt: "SyncNexa is requesting to verify your student status. Do you approve?"
7. Student clicks **Approve** or **Decline**
8. Upon approval/decline, school POSTs canonical data (or decline response) to `callback_url`

**Example Email Message:**

```
Subject: Verify Your Student Status on SyncNexa

Hi [Student Name],

SyncNexa is requesting verification of your student status at [School Name].

To approve or decline this request, click below:
https://student.school.edu/verify/syncnexa/abc123xyz789

This link expires in 10 minutes.

Best regards,
[School Name] Verification System
```

**Alternative Workflow:** School can skip custom UI entirely and:

- Send approval link via email
- Student clicks email link which auto-completes approval
- School immediately POSTs canonical data to `callback_url`
- No second approval page needed (student approval happens implicitly via email verification)

---

## Request/Response Schemas

### Verification Request Body (Sent to School)

```json
{
  "request_id": "sync-req-982373",
  "matric_number": "FUTO/CSC/2019/1234",
  "callback_url": "https://api.syncnexa.com/verify/callback/sync-req-982373"
}
```

---

### Canonical Data Response (School → SyncNexa Callback)

**Sent by school to `callback_url` upon student approval**

**Headers:**

```
Content-Type: application/json
X-Request-Signature: <HMAC-SHA256>
X-Request-Timestamp: <ISO8601>
```

**Body:**

```json
{
  "request_id": "sync-req-982373",
  "status": "approved",
  "student": {
    "full_name": "Okolie Amuche",
    "matric_number": "FUTO/CSC/2019/1234",
    "institution": "Federal University of Technology Owerri",
    "faculty": "School of Information and Communication Technology",
    "department": "Computer Science",
    "degree": "B.Sc Computer Science",
    "level": "300",
    "academic_session": "2024/2025",
    "enrollment_status": "Active"
  },
  "verified_at": "2026-02-01T10:32:00Z"
}
```

**Parameters:**

| Field                       | Type   | Required          | Description                                                                  |
| --------------------------- | ------ | ----------------- | ---------------------------------------------------------------------------- |
| `request_id`                | string | Yes               | Must match the original `request_id` from the verification request           |
| `status`                    | enum   | Yes               | `approved` or `declined`                                                     |
| `student.full_name`         | string | Yes (if approved) | Student's full legal name as on institution records                          |
| `student.matric_number`     | string | Yes (if approved) | Exact match to request matric number                                         |
| `student.institution`       | string | Yes (if approved) | Full institution name                                                        |
| `student.faculty`           | string | Yes (if approved) | Faculty/School name exactly as in institution taxonomy                       |
| `student.department`        | string | Yes (if approved) | Department name exactly as in institution taxonomy                           |
| `student.degree`            | string | Yes (if approved) | Degree name (e.g., "B.Sc Computer Science", "B.Tech Mechanical Engineering") |
| `student.level`             | string | Yes (if approved) | Current level (e.g., "100", "200", "300", "400")                             |
| `student.academic_session`  | string | Yes (if approved) | Current session (format: `YYYY/YYYY`, e.g., "2024/2025")                     |
| `student.enrollment_status` | enum   | Yes (if approved) | `Active`, `Suspended`, `On Leave`, or `Graduated`                            |
| `verified_at`               | string | Yes (if approved) | ISO 8601 timestamp of verification                                           |

**Declined Response:**

```json
{
  "request_id": "sync-req-982373",
  "status": "declined",
  "reason": "Student declined verification",
  "declined_at": "2026-02-01T10:32:00Z"
}
```

---

## Security Requirements

### 1. Authentication

**School → SyncNexa (Verification Request to School):**

- SyncNexa must authenticate to the school endpoint using a Bearer token
- **The SCHOOL issues this token to SyncNexa** during onboarding
- SyncNexa will include the token in the `Authorization` header

**SyncNexa ← School (Callback to SyncNexa):**

- School must sign callback with HMAC-SHA256
- SyncNexa will validate signature before processing
- **SyncNexa shares a HMAC secret with the school** during onboarding

### 2. HMAC Signature Validation

**For all requests and callbacks:**

**Algorithm:** HMAC-SHA256

**Signing Process:**

```
signature = HMAC-SHA256(
  key = <SHARED_SECRET>,
  message = <REQUEST_BODY_JSON_STRING> + <TIMESTAMP>
)
```

**Header Format:**

```
X-Request-Signature: <base64_encoded_signature>
X-Request-Timestamp: 2026-02-01T10:15:00Z
```

**Validation Rules:**

- Timestamp must be within 5 minutes of current time
- Signature must match recalculated HMAC
- Both headers must be present

**Example (Node.js):**

```javascript
const crypto = require("crypto");
const sharedSecret = "school_secret_key_from_syncnexa";
const timestamp = new Date().toISOString();
const body = JSON.stringify(studentData);
const message = body + timestamp;
const signature = crypto
  .createHmac("sha256", sharedSecret)
  .update(message)
  .digest("base64");
```

### 3. HTTPS Only

- All endpoints must use HTTPS (TLS 1.2 or higher)
- Invalid certificates will be rejected

### 4. Rate Limiting

- SyncNexa will respect school rate limits
- Recommended: 100 requests/minute per school

### 5. API Token Management

- **School generates and provides the API token to SyncNexa** during onboarding
- SyncNexa will use this token to authenticate all verification requests
- **School should rotate tokens every 90 days** for security
- Schools can request SyncNexa to use a new token anytime via the SyncNexa admin dashboard

---

## Error Handling

### HTTP Status Codes

| Code  | Meaning             | When to Use                                           |
| ----- | ------------------- | ----------------------------------------------------- |
| `200` | Success             | Verification request accepted or callback received    |
| `400` | Bad Request         | Invalid matric number, missing fields, malformed JSON |
| `401` | Unauthorized        | Invalid/missing Bearer token                          |
| `403` | Forbidden           | Token is valid but lacks permission                   |
| `404` | Not Found           | Student not found by matric number                    |
| `409` | Conflict            | Request ID already processed                          |
| `500` | Server Error        | School system error                                   |
| `503` | Service Unavailable | School system temporarily down                        |

### Error Response Format

```json
{
  "status": "error",
  "error_code": "MATRIC_NOT_FOUND",
  "message": "Student with matric number not found",
  "request_id": "sync-req-982373",
  "timestamp": "2026-02-01T10:15:00Z"
}
```

**Error Codes:**

| Code                  | Description                                             |
| --------------------- | ------------------------------------------------------- |
| `INVALID_TOKEN`       | Bearer token is invalid or expired                      |
| `INVALID_SIGNATURE`   | HMAC signature validation failed                        |
| `MATRIC_NOT_FOUND`    | Student matric number not in system                     |
| `DUPLICATE_REQUEST`   | Request ID already processed                            |
| `MALFORMED_REQUEST`   | Request body is invalid JSON or missing required fields |
| `SERVER_ERROR`        | Unexpected error on school side                         |
| `SERVICE_UNAVAILABLE` | School system is down or unreachable                    |

---

## Webhook Callback Protocol

### When School Should Callback

1. **Student Approves:** School POSTs canonical data immediately
2. **Student Declines:** School POSTs decline response within 30 seconds
3. **Approval Link Expires:** School POSTs expiration notice
4. **Request ID Not Found:** School POSTs error response immediately

### Callback Retry Policy

**School Requirements:**

- If SyncNexa callback endpoint returns non-2xx status:
  - Retry up to 3 times with exponential backoff (5s, 15s, 45s)
  - Log all attempts
  - If all retries fail, notify SyncNexa admin (we'll handle recovery)

**SyncNexa Requirements:**

- Callback endpoint will respond with `200 OK` if:
  - Request signature is valid
  - Request ID is valid and not expired
  - Canonical data is well-formed
- School can assume success if `200` is received

### Sample Callback Code (Node.js)

```javascript
const https = require("https");
const crypto = require("crypto");

async function sendCanonicalDataToSyncNexa(
  callbackUrl,
  canonicalData,
  sharedSecret,
) {
  const timestamp = new Date().toISOString();
  const body = JSON.stringify(canonicalData);
  const message = body + timestamp;
  const signature = crypto
    .createHmac("sha256", sharedSecret)
    .update(message)
    .digest("base64");

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Request-Signature": signature,
      "X-Request-Timestamp": timestamp,
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(callbackUrl, options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode === 200) {
          resolve({ success: true, response: data });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}
```

---

## Implementation Checklist

Schools should complete the following before going live:

### Phase 1: Planning & Setup

- [ ] Assign technical contact (email, phone)
- [ ] Review this specification
- [ ] Identify student matric number format in your system
- [ ] Identify where student approval mechanism should be (email link vs. portal)
- [ ] **Generate an API token securely and provide to SyncNexa** (this will be used by SyncNexa to authenticate requests to your endpoint)
- [ ] **Generate a HMAC shared secret and provide to SyncNexa** (this will be used for signing callbacks)

### Phase 2: Development

- [ ] Implement `POST /api/v1/syncnexa/verify/request` endpoint
- [ ] Implement student approval workflow (email or portal UI)
- [ ] Implement HMAC-SHA256 signing for callbacks
- [ ] Implement callback retry logic (3 attempts, exponential backoff)
- [ ] Create test cases for:
  - Valid verification request
  - Matric not found
  - Student approval flow
  - Student decline flow
  - Invalid HMAC signature
  - Expired request token

### Phase 3: Testing

- [ ] Test in SyncNexa sandbox environment
- [ ] Validate canonical data matches your institution taxonomy
- [ ] Test all error scenarios
- [ ] Load test: 100 requests/minute for 10 minutes
- [ ] Test HTTPS + TLS 1.2

### Phase 4: Launch

- [ ] Receive go-live confirmation from SyncNexa
- [ ] Deploy to production
- [ ] Monitor callback logs
- [ ] Respond to any SyncNexa support requests within 24 hours

---

## Support & Contact

**Technical Questions:**

- Email: integration@syncnexa.com
- Slack: #school-integration

**Sandbox API Base URL:**

- `https://sandbox-api.syncnexa.com`

**Production API Base URL:**

- `https://api.syncnexa.com`

---

## Appendix A: Sample Integration Flow

### School Side

```
1. Student initiates verification on SyncNexa
2. SyncNexa → School: POST /api/v1/syncnexa/verify/request
3. School validates request, finds student
4. School sends approval link to student email
5. Student clicks link, authenticates, approves
6. School → SyncNexa: POST <callback_url> (canonical data)
7. SyncNexa processes, updates verification status
8. Student sees "Verified" badge on SyncNexa profile
```

### Timeline

| Step                  | Actor    | Time      |
| --------------------- | -------- | --------- |
| Request received      | School   | T+0s      |
| Approval link sent    | School   | T+1s      |
| Student clicks link   | Student  | T+30-300s |
| Student approves      | Student  | T+45-320s |
| Callback sent         | School   | T+50-325s |
| Verification complete | SyncNexa | T+55-330s |

---

**End of Specification**
