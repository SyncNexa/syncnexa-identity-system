# School Verification Database Schema

**Version:** 1.0  
**Date:** February 2, 2026

---

## Overview

This document defines the database schema for SyncNexa's school API verification system. It supports the complete verification workflow from request initiation to canonical data storage and matching.

---

## Tables

### 1. `school_api_configs`

Stores school API endpoint credentials and configuration.

**Purpose:** Manage which schools can be verified against and their API details.

```sql
CREATE TABLE school_api_configs (
  id CHAR(36) PRIMARY KEY,
  institution_code VARCHAR(100) NOT NULL UNIQUE,
  institution_name VARCHAR(255) NOT NULL,
  api_endpoint VARCHAR(500) NOT NULL,
  api_token VARCHAR(255) NOT NULL,
  hmac_secret VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_tested_at TIMESTAMP NULL,
  test_status VARCHAR(50) NULL,
  test_message TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Columns:**

| Column                   | Type         | Description                                                 |
| ------------------------ | ------------ | ----------------------------------------------------------- |
| `id`                     | CHAR(36)     | UUID primary key                                            |
| `institution_code`       | VARCHAR(100) | School code (e.g., FUTO_NG) - unique identifier             |
| `institution_name`       | VARCHAR(255) | Full school name                                            |
| `api_endpoint`           | VARCHAR(500) | HTTPS URL to school's verification endpoint                 |
| `vault_secret_path`      | VARCHAR(255) | Path to secrets in Vault (e.g., `syncnexa/schools/FUTO_NG`) |
| `is_active`              | BOOLEAN      | Whether this school is currently available for verification |
| `last_tested_at`         | TIMESTAMP    | When the API was last tested                                |
| `test_status`            | VARCHAR(50)  | Result of last test: `success`, `failed`, `timeout`         |
| `test_message`           | TEXT         | Details of last test (error message if failed)              |
| `last_secret_rotated_at` | TIMESTAMP    | When API token was last rotated                             |
| `secret_rotation_status` | VARCHAR(50)  | `active`, `pending_activation`, `deactivated`               |
| `created_at`             | TIMESTAMP    | When config was created                                     |
| `updated_at`             | TIMESTAMP    | When config was last updated                                |

**Indexes:**

- `idx_institution_code` - for lookup by school code
- `idx_is_active` - for listing active schools

**Notes:**

- `vault_secret_path` references secrets stored in external Vault (AWS Secrets Manager, HashiCorp Vault, etc.)
- API token and HMAC secret are **never stored in the database**
- `is_active` allows disabling a school without deletion (audit trail preserved)
- `secret_rotation_status` tracks the state of credential rotation for compliance

---

### 2. `school_verification_requests`

Tracks individual verification requests sent to schools.

**Purpose:** Track the state of each student's verification request through the entire flow.

```sql
CREATE TABLE school_verification_requests (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  school_config_id CHAR(36) NOT NULL,
  request_id VARCHAR(50) NOT NULL UNIQUE,
  matric_number VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  status_message TEXT NULL,
  callback_url VARCHAR(500) NOT NULL,
  student_notified_at TIMESTAMP NULL,
  callback_received_at TIMESTAMP NULL,
  callback_signature_valid BOOLEAN NULL,
  verification_completed_at TIMESTAMP NULL,
  verification_outcome VARCHAR(50) NULL,
  expiration_time TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (school_config_id) REFERENCES school_api_configs (id)
);
```

**Columns:**

| Column                      | Type         | Description                                                                        |
| --------------------------- | ------------ | ---------------------------------------------------------------------------------- |
| `id`                        | CHAR(36)     | UUID primary key                                                                   |
| `user_id`                   | CHAR(36)     | Student making the verification request                                            |
| `school_config_id`          | CHAR(36)     | Reference to school being verified against                                         |
| `request_id`                | VARCHAR(50)  | Unique ID in format `sync-req-<12 char>` - sent to school                          |
| `matric_number`             | VARCHAR(100) | Student's matric number (from their profile)                                       |
| `status`                    | VARCHAR(50)  | Current status: `pending`, `approved`, `declined`, `failed`, `verified`, `expired` |
| `status_message`            | TEXT         | Human-readable status detail (e.g., "Signature validation failed")                 |
| `callback_url`              | VARCHAR(500) | HTTPS URL where school sends canonical data                                        |
| `student_notified_at`       | TIMESTAMP    | When school confirmed it sent approval link to student                             |
| `callback_received_at`      | TIMESTAMP    | When callback was received from school                                             |
| `callback_signature_valid`  | BOOLEAN      | Whether HMAC signature was valid                                                   |
| `verification_completed_at` | TIMESTAMP    | When matching/verification finished                                                |
| `verification_outcome`      | VARCHAR(50)  | `verified`, `action_required`, `failed`                                            |
| `canonical_data_json`       | LONGTEXT     | Full canonical data response from school (JSON)                                    |
| `canonical_data_hash`       | VARCHAR(64)  | SHA-256 hash of canonical data (tamper detection)                                  |
| `expiration_time`           | TIMESTAMP    | When this request expires (request_id no longer valid)                             |
| `created_at`                | TIMESTAMP    | When request was created                                                           |
| `updated_at`                | TIMESTAMP    | When request was last updated                                                      |

**Indexes:**

- `idx_user_id` - for finding requests by student
- `idx_request_id` - for matching callback with request
- `idx_status` - for querying requests by status
- `idx_school_config_id` - for school-specific reporting
- `idx_expiration_time` - for cleanup/expiry queries

**Status Lifecycle:**

```
pending → approved → verified (or action_required or failed)
         ↓
         declined
         ↓
         expired (if not responded within timeout)
```

**Notes:**

- `canonical_data_json` stores the entire response from school for audit trail
- `canonical_data_hash` allows detection of data tampering in transit
- One-to-one relationship with requests (no separate table needed)

---

### 3. `school_verification_matches`

Stores field-by-field comparison results.

**Purpose:** Track which fields matched between student claims and canonical data.

```sql
CREATE TABLE school_verification_matches (
  id CHAR(36) PRIMARY KEY,
  request_id VARCHAR(50) NOT NULL,
  field_name VARCHAR(100) NOT NULL,
  student_claimed VARCHAR(255),
  school_returned VARCHAR(255) NOT NULL,
  match_result VARCHAR(50) NOT NULL,
  match_score DECIMAL(3, 2) NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (request_id) REFERENCES school_verification_requests (request_id),
  UNIQUE KEY unique_request_field (request_id, field_name)
);
```

**Columns:**

| Column            | Type          | Description                                                   |
| ----------------- | ------------- | ------------------------------------------------------------- |
| `id`              | CHAR(36)      | UUID primary key                                              |
| `request_id`      | VARCHAR(50)   | References the verification request                           |
| `field_name`      | VARCHAR(100)  | Field being compared (e.g., `full_name`, `faculty`, `degree`) |
| `student_claimed` | VARCHAR(255)  | What student provided in their profile                        |
| `school_returned` | VARCHAR(255)  | What school returned in canonical data                        |
| `match_result`    | VARCHAR(50)   | `match`, `mismatch`, `fuzzy_match`, `pending_review`          |
| `match_score`     | DECIMAL(3, 2) | Confidence score (0.00 - 1.00) for fuzzy matches              |
| `notes`           | TEXT          | Details (e.g., "Name differs in spelling only")               |
| `created_at`      | TIMESTAMP     | When comparison was performed                                 |

**Match Results:**

- `match` - Exact match (case-insensitive, whitespace normalized)
- `fuzzy_match` - Close match (surname matches, minor spelling differences)
- `mismatch` - No match (fraud indicator)
- `pending_review` - Requires manual review

**Fields to Compare:**

- `full_name` (fuzzy)
- `matric_number` (exact)
- `faculty` (exact against school taxonomy)
- `department` (exact against school taxonomy)
- `degree` (exact against school program list)
- `level` (exact)
- `academic_session` (exact)
- `enrollment_status` (must be Active)

**Indexes:**

- `idx_request_id` - for retrieving all matches for a request
- `idx_field_name` - for analyzing specific field patterns
- `idx_match_result` - for finding mismatches/failures

---

### 4. `school_verification_audit_logs`

Complete audit trail of all actions.

**Purpose:** Security and compliance logging for verification activities.

```sql
CREATE TABLE school_verification_audit_logs (
  id CHAR(36) PRIMARY KEY,
  request_id VARCHAR(50),
  user_id CHAR(36),
  action VARCHAR(100) NOT NULL,
  action_details TEXT,
  http_status_code INT NULL,
  error_code VARCHAR(100) NULL,
  error_message TEXT NULL,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**

| Column             | Type         | Description                                                                                                                                    |
| ------------------ | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`               | CHAR(36)     | UUID primary key                                                                                                                               |
| `request_id`       | VARCHAR(50)  | Associated verification request (if applicable)                                                                                                |
| `user_id`          | CHAR(36)     | Student involved (if applicable)                                                                                                               |
| `action`           | VARCHAR(100) | What happened: `request_sent`, `callback_received`, `signature_invalid`, `match_completed`, `verification_passed`, `verification_failed`, etc. |
| `action_details`   | TEXT         | JSON with additional context                                                                                                                   |
| `http_status_code` | INT          | HTTP status if it was an API call                                                                                                              |
| `error_code`       | VARCHAR(100) | Error code (e.g., `INVALID_SIGNATURE`, `MATRIC_NOT_FOUND`)                                                                                     |
| `error_message`    | TEXT         | Human-readable error message                                                                                                                   |
| `ip_address`       | VARCHAR(45)  | IP address of requester (if applicable)                                                                                                        |
| `user_agent`       | TEXT         | User-Agent header (if applicable)                                                                                                              |
| `created_at`       | TIMESTAMP    | When action occurred                                                                                                                           |

**Audit Actions:**

- `verification_request_initiated`
- `api_request_sent`
- `api_request_failed`
- `callback_received`
- `signature_validated`
- `signature_invalid`
- `canonical_data_stored`
- `matching_started`
- `field_match_completed`
- `verification_approved`
- `verification_failed`
- `verification_declined_by_student`
- `request_expired`

**Indexes:**

- `idx_request_id` - for audit trail of specific request
- `idx_user_id` - for user activity history
- `idx_action` - for querying specific actions
- `idx_created_at` - for time-based queries

---

## Relationships

```
school_api_configs (1)
         ↓
school_verification_requests (many)
         ↓
   ┌────────────┬────────────┐
   ↓            ↓            ↓
 matches     audit_logs  (both many-to-1)
 (many)      (many)
```

**Note:** Canonical data is stored as JSON in `school_verification_requests.canonical_data_json` (no separate table)

---

## Data Retention & Cleanup

| Table                            | Retention  | Cleanup Policy                  |
| -------------------------------- | ---------- | ------------------------------- |
| `school_api_configs`             | Indefinite | Keep even if school is inactive |
| `school_verification_requests`   | 2 years    | Archive after 2 years           |
| `school_verification_matches`    | 2 years    | Same as requests                |
| `school_verification_audit_logs` | 3 years    | Compliance requirement          |

---

## Performance Considerations

### Indexes

- All foreign keys are indexed
- Status fields are indexed for filtering
- Request IDs are unique (natural lookup)
- Created/updated timestamps are indexed for time-range queries

### Query Patterns

1. **Find request by student:** `SELECT * FROM school_verification_requests WHERE user_id = ?`
2. **Find request by request_id:** `SELECT * FROM school_verification_requests WHERE request_id = ?`
3. **Get canonical data from request:** `SELECT JSON_UNQUOTE(canonical_data_json->'$.student') FROM school_verification_requests WHERE request_id = ?`
4. **Get all matches for request:** `SELECT * FROM school_verification_matches WHERE request_id = ?`
5. **Audit trail for request:** `SELECT * FROM school_verification_audit_logs WHERE request_id = ? ORDER BY created_at`

### Partitioning (Future)

Consider partitioning `school_verification_audit_logs` by year for very high volume:

```sql
PARTITION BY RANGE (YEAR(created_at)) (
  PARTITION p2024 VALUES LESS THAN (2025),
  PARTITION p2025 VALUES LESS THAN (2026),
  PARTITION p2026 VALUES LESS THAN (2027)
);
```

---

## Security

- `api_token` and `hmac_secret` should be encrypted at application level using a key management service
- Never log full tokens or secrets in audit logs
- Sensitive fields (`full_name`, `matric_number`) should be logged minimally
- Audit logs should be immutable once created (no UPDATE/DELETE)

---

**End of Schema Design**
