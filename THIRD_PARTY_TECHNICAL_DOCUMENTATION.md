# SyncNexa Third-Party Integration: Comprehensive Technical Documentation

**Version:** 1.0  
**Date:** March 2026  
**Audience:** Developers, Platform Engineers, Integration Partners

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Data Models](#data-models)
4. [Authentication & Authorization](#authentication--authorization)
5. [API Endpoints](#api-endpoints)
6. [OAuth 2.0 Implementation (SAuth)](#oauth-20-implementation-sauth)
7. [School Verification Integration](#school-verification-integration)
8. [Security Specifications](#security-specifications)
9. [Error Handling](#error-handling)
10. [Rate Limiting & Quotas](#rate-limiting--quotas)
11. [Implementation Checklist](#implementation-checklist)
12. [Migration Path](#migration-path)

---

## Overview

SyncNexa's third-party integration platform enables external applications to access student profiles and credentials through:

- **SAuth (OAuth 2.0)** - Standard OAuth Authorization Code Flow for user-facing integrations
- **API Tokens** - Server-to-server authentication for programmatic access
- **School Verification APIs** - Integration with educational institutions for credential verification

### Use Cases

| Use Case                         | Authentication | Stakeholders                    |
| -------------------------------- | -------------- | ------------------------------- |
| Employer credential verification | SAuth OAuth    | Student, Employer App, SyncNexa |
| Real-time transcript sync        | API Token      | SyncNexa, Partner Institution   |
| Portfolio link sharing           | SAuth OAuth    | Student, Recruiter App          |
| Academic records API             | API Token      | Registrar Partner, SyncNexa     |

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    External Applications                        │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │ Employer Portal  │  │ Portfolio Site   │  │ Verification   │ │
│  │ (OAuth Client)   │  │ (OAuth Client)   │  │ System (Token) │ │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬───────┘ │
└─────────────────────────────────────────────────────────────────┘
                │                          │                  │
                │                          │                  │
┌───────────────┼──────────────────────────┼──────────────────┼──────────┐
│               │ HTTPS           │       │                  │          │
│         ┌─────▼─────────┬───────┴──────┬─┴──────────────────┼──┐      │
│         │               │              │                    │  │      │
│         │   SyncNexa    │              │   SyncNexa         │  │      │
│         │   Platform    │              │   Backend          │  │      │
│         │               │              │                    │  │      │
│         │ ┌────────────┐│ ┌──────────┐ │ ┌────────────────┐ │  │      │
│         │ │SAuth Flow  ││ │Grant     │ │ │School Verify   │ │  │      │
│         │ │Controller  ││ │Mgmt      │ │ │Integration     │ │  │      │
│         │ ├────────────┤│ ├──────────┤ │ └────────────────┘ │  │      │
│         │ │Auth Codes  ││ │App Grants│ │ ┌────────────────┐ │  │      │
│         │ │Tokens      ││ │Revocation│ │ │School API      │ │  │      │
│         │ └────────────┘│ └──────────┘ │ │Configs         │ │  │      │
│         │               │              │ └────────────────┘ │  │      │
│         └────────┬──────┴───────┬──────┤                    │  │      │
│                  │              │      │    ┌────────────┐  │  │      │
│         ┌────────▼──────┬───────▼────┐ │    │  Vault     │  │  │      │
│         │    PostgreSQL │ Database   │ │    │ (Secrets)  │  │  │      │
│         │                │           │ │    └────────────┘  │  │      │
│         │  ┌────────────┐│           │ │                    │  │      │
│         │  │apps table  ││           │ │                    │  │      │
│         │  │grants table││           │ │                    │  │      │
│         │  │codes table ││           │ │                    │  │      │
│         │  └────────────┘│           │ │                    │  │      │
│         └────────────────┴───────────┘ │                    │  │      │
│         School APIs                    │                    │  │      │
│         (External Partners)            │                    │  │      │
└───────────────────────────────────────────────────────────────────────┘
```

### Request Flow - OAuth Authorization

```
1. Student visits Employer Portal
   └─> Portal redirects: GET /api/v1/sauth/authorize?app_id=X&scopes=Y&redirect_uri=Z&state=S

2. SyncNexa validates session
   └─> If not logged in, redirect to login page

3. Show Consent Screen
   └─> Display requested scopes with descriptions
   └─> Student reviews & accepts/denies

4. Generate Authorization Code
   └─> Create code (10-min TTL, single-use)
   └─> Redirect back to Portal with code & state

5. Portal Backend Exchanges Code
   └─> POST /api/v1/sauth/token
   └─> Send: code, client_id, client_secret
   └─> Receive: JWT access_token (7-day TTL)

6. Portal Accesses User Data
   └─> GET /api/v1/sauth/userinfo (Authorization: Bearer token)
   └─> Filtered by scopes granted in step 3

7. Student Revocation (Optional)
   └─> POST /api/v1/sauth/revoke
   └─> Grant marked as revoked
   └─> Portal's tokens become invalid
```

---

## Data Models

### 1. **apps** Table

Stores third-party applications registered with SyncNexa.

```sql
CREATE TABLE apps (
  id VARCHAR(36) PRIMARY KEY,
  app_name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  website_url VARCHAR(255),
  callback_url VARCHAR(255) NOT NULL,
  logo_url VARCHAR(255),
  owner_id VARCHAR(36) NOT NULL,
  client_id VARCHAR(255) UNIQUE NOT NULL,
  client_secret VARCHAR(255) NOT NULL, -- bcrypt-hashed
  scopes JSON, -- ["profile", "student:profile", ...]
  is_verified BOOLEAN DEFAULT FALSE,
  app_status ENUM('active', 'inactive', 'suspended', 'revoked') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);
```

**Fields:**

- `id` - UUID v4 primary key
- `app_name` - Display name (3-100 chars)
- `slug` - URL-safe identifier (auto-generated from app_name)
- `client_id` - OAuth 2.0 client identifier (shown to app)
- `client_secret` - OAuth 2.0 secret (bcrypt-hashed, shown once at creation)
- `callback_url` - Authorized redirect URI for OAuth flow
- `scopes` - JSON array of requested OAuth scopes
- `app_status` - Lifecycle: active → suspended/inactive → revoked
- `is_verified` - Admin verification flag (future marketplace feature)

**Indexes:**

```sql
CREATE INDEX idx_apps_owner_id ON apps(owner_id);
CREATE INDEX idx_apps_client_id ON apps(client_id);
CREATE INDEX idx_apps_app_status ON apps(app_status);
```

### 2. **authorization_codes** Table

Temporary single-use codes for OAuth token exchange.

```sql
CREATE TABLE authorization_codes (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  app_id VARCHAR(36) NOT NULL,
  code VARCHAR(255) UNIQUE NOT NULL,
  scopes JSON NOT NULL,
  redirect_uri VARCHAR(255),
  is_used BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (app_id) REFERENCES apps(id) ON DELETE CASCADE
);
```

**Characteristics:**

- Expires in 10 minutes (configurable via `SAUTH_CODE_EXPIRY_MINUTES`)
- Single-use only (marked `is_used=1` after exchange)
- Tied to specific user + app + requested scopes
- Redirect URI must match app's callback_url

### 3. **app_grants** Table

Persistent record of student-to-app access authorization.

```sql
CREATE TABLE app_grants (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  app_id VARCHAR(36) NOT NULL,
  scopes JSON NOT NULL,
  access_token VARCHAR(512),
  refresh_token VARCHAR(512),
  token_expires_at TIMESTAMP,
  is_revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_app_grant (user_id, app_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (app_id) REFERENCES apps(id) ON DELETE CASCADE
);
```

**Characteristics:**

- One grant per user-app pair (upsert on authorize)
- Stores current access_token + refresh_token (if implemented)
- Token expiry tracked separately (JWT expiry may differ)
- Revocation flag for permanent access denial
- Supports grant expiry policy (future feature)

**Indexes:**

```sql
CREATE INDEX idx_app_grants_user_id ON app_grants(user_id);
CREATE INDEX idx_app_grants_app_id ON app_grants(app_id);
CREATE INDEX idx_app_grants_is_revoked ON app_grants(is_revoked);
```

### 4. **api_tokens** Table

Long-lived tokens for server-to-server authentication.

```sql
CREATE TABLE api_tokens (
  id VARCHAR(36) PRIMARY KEY,
  token_hash VARCHAR(255) UNIQUE NOT NULL,
  app_id VARCHAR(36) NOT NULL,
  name VARCHAR(255),
  description TEXT,
  scopes JSON,
  expires_at TIMESTAMP,
  last_used_at TIMESTAMP,
  is_revoked BOOLEAN DEFAULT FALSE,
  created_by VARCHAR(36), -- Admin or developer
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (app_id) REFERENCES apps(id) ON DELETE CASCADE
);
```

**Characteristics:**

- Token shown only at creation (stored as hash)
- Can be optionally renamed and described
- Tracks last usage for API health monitoring
- Admin can revoke any token

### 5. **school_api_configs** Table

Configuration for third-party school verification integrations.

```sql
CREATE TABLE school_api_configs (
  id VARCHAR(36) PRIMARY KEY,
  institution_id VARCHAR(36),
  institution_code VARCHAR(100) UNIQUE NOT NULL,
  api_endpoint VARCHAR(255) NOT NULL,
  vault_secret_path VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_test BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (institution_id) REFERENCES institutions(id)
);
```

**Characteristics:**

- API credentials stored in external Vault (not database)
- Contains HMAC secret + API token at `vault_secret_path`
- Support for test/production endpoints
- Configurable per institution

### 6. **school_verification_requests** Table

Track verification requests sent to school APIs.

```sql
CREATE TABLE school_verification_requests (
  id VARCHAR(36) PRIMARY KEY,
  verification_id VARCHAR(36),
  school_api_config_id VARCHAR(36),
  verification_code VARCHAR(255) UNIQUE,
  payload JSON,
  status ENUM('pending', 'success', 'failed', 'retry') DEFAULT 'pending',
  attempts INT DEFAULT 0,
  last_attempt_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (verification_id) REFERENCES verifications(id) ON DELETE CASCADE,
  FOREIGN KEY (school_api_config_id) REFERENCES school_api_configs(id)
);
```

**Request Lifetime:**

- Pending: Up to 10 minutes (configurable)
- Status: pending → success/failed/retry
- Attempts tracked for retry logic

### 7. **school_verification_matches** Table

Field-level matching results from school API responses.

```sql
CREATE TABLE school_verification_matches (
  id VARCHAR(36) PRIMARY KEY,
  request_id VARCHAR(36),
  field_name VARCHAR(100),
  expected_value TEXT,
  received_value TEXT,
  match_status ENUM('match', 'mismatch', 'missing') DEFAULT 'missing',
  confidence_score FLOAT(3,2), -- 0.00 to 1.00
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES school_verification_requests(id) ON DELETE CASCADE
);
```

### 8. **school_verification_audit_logs** Table

Complete audit trail for compliance and debugging.

```sql
CREATE TABLE school_verification_audit_logs (
  id VARCHAR(36) PRIMARY KEY,
  request_id VARCHAR(36),
  action VARCHAR(50),
  actor_type ENUM('system', 'admin', 'school_api'),
  actor_id VARCHAR(36),
  old_value JSON,
  new_value JSON,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES school_verification_requests(id) ON DELETE CASCADE
);
```

---

## Authentication & Authorization

### User Roles Hierarchy

```
┌────────────────────────────────────┐
│       Role-Based Access Control    │
├────────────────────────────────────┤
│ admin              - Full system    │
│ ├─ Can manage all apps             │
│ ├─ Can manage all students         │
│ ├─ Can manage school configs       │
│ └─ Full audit logs access          │
│                                    │
│ developer          - App owner     │
│ ├─ Can register apps               │
│ ├─ Can manage own apps             │
│ ├─ Can view own grants             │
│ └─ Can update app metadata         │
│                                    │
│ student            - User          │
│ ├─ Can authorize apps via OAuth    │
│ ├─ Can revoke app access           │
│ ├─ Can view authorized apps        │
│ └─ Can view grant audit            │
│                                    │
│ visitor            - Read-only     │
│ └─ Limited app discovery           │
└────────────────────────────────────┘
```

### OAuth Scopes

| Scope               | Fields Included                            | Use Case             |
| ------------------- | ------------------------------------------ | -------------------- |
| `profile`           | email, name, phone, avatar                 | Basic identity       |
| `student:profile`   | institution, matric_number, admission_year | Academic identity    |
| `student:documents` | verified_certificates, documents           | Credentials          |
| `student:academics` | GPA, degrees, transcript                   | Academic records     |
| `student:portfolio` | projects, certifications, publications     | Professional profile |

### Scope Resolution

When an app requests multiple scopes, the returned JWT contains all authorized scopes. The userinfo endpoint filters response fields based on intersection of:

1. Scopes requested at registration
2. Scopes granted by student in approval
3. Scopes present in OAuth code

---

## API Endpoints

### Developer Endpoints: `/api/v1/apps`

**Requires:** Developer role + Valid session/JWT

#### Register App

```
POST /api/v1/apps/register
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "name": "Employer Portal",
  "description": "Verification of student credentials for hiring",
  "website_url": "https://employer.example.com",
  "callback_url": "https://employer.example.com/oauth/callback",
  "scopes": ["profile", "student:profile", "student:documents"]
}
```

**Response (201):**

```json
{
  "id": "app_uuid",
  "app_name": "Employer Portal",
  "slug": "employer-portal",
  "client_id": "client_uuid",
  "client_secret": "secret_32bytes_base64", // Shown ONLY once
  "callback_url": "https://employer.example.com/oauth/callback",
  "scopes": ["profile", "student:profile", "student:documents"],
  "app_status": "active",
  "created_at": "2026-03-24T10:00:00Z"
}
```

**Validation:**

- Name: 3-100 alphanumeric + spaces
- callback_url: Valid HTTPS URL (prod) or HTTP localhost (dev)
- Scopes: Array of valid scope identifiers
- One app per developer per name

#### List Developer's Apps

```
GET /api/v1/apps/my-apps?page=1&limit=20&status=active
Authorization: Bearer {jwt_token}
```

**Response (200):**

```json
{
  "apps": [
    {
      "id": "app_uuid",
      "app_name": "Employer Portal",
      "slug": "employer-portal",
      "description": "...",
      "website_url": "https://employer.example.com",
      "callback_url": "https://employer.example.com/oauth/callback",
      "scopes": ["profile", "student:profile", "student:documents"],
      "app_status": "active",
      "student_grant_count": 145,
      "created_at": "2026-03-24T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 3,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

#### Get App Details

```
GET /api/v1/apps/{app_id}
Authorization: Bearer {jwt_token}
```

**Response (200):**

```json
{
  "id": "app_uuid",
  "app_name": "Employer Portal",
  "description": "...",
  "client_id": "client_uuid",
  "callback_url": "https://employer.example.com/oauth/callback",
  "scopes": ["profile", "student:profile", "student:documents"],
  "app_status": "active",
  "owner_id": "developer_user_id",
  "student_grants": [
    {
      "user_id": "student_uuid",
      "scopes": ["profile", "student:profile"],
      "granted_at": "2026-03-20T15:30:00Z",
      "is_revoked": false
    }
  ],
  "created_at": "2026-03-24T10:00:00Z"
}
```

#### Update App Metadata

```
PATCH /api/v1/apps/{app_id}
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "description": "Updated description",
  "website_url": "https://new-url.example.com",
  "scopes": ["profile", "student:profile"]
}
```

**Response (200):** Updated app object

**Restrictions:**

- Cannot change client_id
- Cannot change callback_url (use secret rotation instead)
- Can only update own apps

#### Rotate Client Secret

```
POST /api/v1/apps/{app_id}/rotate-secret
Authorization: Bearer {jwt_token}
```

**Response (200):**

```json
{
  "id": "app_uuid",
  "client_secret": "new_secret_32bytes_base64",
  "old_secret_invalidated": true,
  "warning": "Old applications using previous secret will need immediate update"
}
```

**Timeline:**

- New secret active immediately
- Old secret remains valid for 24 hours (grace period)
- After 24 hours, only new secret works

#### Delete App

```
DELETE /api/v1/apps/{app_id}
Authorization: Bearer {jwt_token}
```

**Response (204):** No content

**Cascade:**

- Delete all authorization codes
- Delete all app grants
- Revoke all access tokens
- Audit logged by admin

#### Revoke Student Grant

```
POST /api/v1/apps/{app_id}/grants/{grant_id}/revoke
Authorization: Bearer {jwt_token}
```

**Response (200):**

```json
{
  "grant_id": "grant_uuid",
  "is_revoked": true,
  "revoked_at": "2026-03-24T10:30:00Z",
  "student_notification": "Student will be notified of revocation"
}
```

---

### SAuth (OAuth) Endpoints: `/api/v1/sauth`

**Public endpoints** (within SyncNexa domain only via session/CORS)

#### Authorization Request

```
GET /api/v1/sauth/authorize?app_id={app_id}&scopes={scopes}&redirect_uri={uri}&state={state}

Parameters:
- app_id: UUID of registered app
- scopes: Space-separated or comma-separated scope names
- redirect_uri: Must exactly match app's callback_url
- state: CSRF protection token (generated by client)
```

**Flow:**

1. Validate app exists and has matching redirect_uri
2. Check user session (if not authenticated, redirect to login)
3. If user grants, generate authorization code
4. Redirect to: `{redirect_uri}?code={code}&state={state}`

**Response (302 Redirect):**

```
Location: https://employer.example.com/oauth/callback?code=auth_code&state=original_state
```

**Error Responses (302 Redirect with query params):**

```
Location: https://employer.example.com/oauth/callback?error=invalid_app&state=original_state
Location: https://employer.example.com/oauth/callback?error=invalid_scope&state=original_state
Location: https://employer.example.com/oauth/callback?error=denied&state=original_state
```

#### Token Exchange

```
POST /api/v1/sauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&code={code}&client_id={client_id}&client_secret={client_secret}&redirect_uri={redirect_uri}
```

**Parameters:**

- `grant_type`: Always "authorization_code"
- `code`: Authorization code from authorize endpoint (10-min valid, single-use)
- `client_id`: OAuth 2.0 client identifier
- `client_secret`: OAuth 2.0 secret (must match app's bcrypt hash)
- `redirect_uri`: Must match original authorization request

**Response (200):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 604800,
  "scope": "profile student:profile student:documents"
}
```

**Token Contents (JWT Claims):**

```json
{
  "sub": "student_user_id",
  "app_id": "app_uuid",
  "scopes": ["profile", "student:profile", "student:documents"],
  "iat": 1711272000,
  "exp": 1711876800,
  "iss": "https://syncnexa.example.com"
}
```

**Error Response (400):**

```json
{
  "error": "invalid_code|invalid_client|invalid_secret|expired_code",
  "error_description": "The authorization code has expired"
}
```

**Security:**

- Code must not be reused (mark as used immediately)
- Verify client_secret via bcrypt (not plain comparison)
- Reject if code expired or already used
- Log failed attempts for abuse detection

#### User Info

```
GET /api/v1/sauth/userinfo
Authorization: Bearer {access_token}
```

**Response (200):** Filtered by token's scopes

With scopes `["profile", "student:profile", "student:documents"]`:

```json
{
  "id": "user_uuid",
  "email": "student@university.edu",
  "name": "John Doe",
  "phone": "+1234567890",
  "avatar_url": "https://...",
  "institution": "University of Example",
  "matric_number": "STU-2022-001",
  "documents": [
    {
      "id": "doc_uuid",
      "name": "Bachelor of Science Certificate",
      "verified": true,
      "issued_at": "2023-06-15",
      "issuer": "University of Example"
    }
  ]
}
```

**Scope-Based Filtering:**

| Scope               | Fields Included                                            |
| ------------------- | ---------------------------------------------------------- |
| `profile`           | id, email, name, phone, avatar_url                         |
| `student:profile`   | institution, matric_number, admission_year, degree_program |
| `student:documents` | documents[] (name, verified, issued_at, issuer)            |
| `student:academics` | gpa, degrees[], transcript_url                             |
| `student:portfolio` | projects[], certifications[], publications[]               |

#### Grant Revocation

```
POST /api/v1/sauth/revoke
Authorization: Bearer {access_token}
Content-Type: application/x-www-form-urlencoded

token={access_token}
```

**Response (200):**

```json
{
  "revoked": true,
  "grant_id": "grant_uuid",
  "app_name": "Employer Portal",
  "revoked_at": "2026-03-24T10:45:00Z"
}
```

**Effect:**

- Mark app_grant as revoked
- Invalidate all tokens for this app
- Student cannot re-authorize until manual approval

---

### Admin Endpoints: `/admin/apps`

**Requires:** Admin role + Valid session/JWT  
**All requests:** Logged in admin audit table

#### List All Apps

```
GET /admin/apps?page=1&limit=50&status=active&search=employer&developer_id=uuid

Query Parameters:
- page: Pagination page (default 1)
- limit: Results per page (default 50, max 200)
- status: Filter by app_status (active|inactive|suspended|revoked)
- search: Search app_name + description
- developer_id: Filter by owner UUID
- sort_by: Field to sort (name|created_at|student_count)
- sort_order: asc|desc
```

**Response (200):**

```json
{
  "apps": [
    {
      "id": "app_uuid",
      "app_name": "Employer Portal",
      "developer": {
        "id": "dev_uuid",
        "email": "developer@example.com",
        "organization": "Example Company"
      },
      "scopes": ["profile", "student:profile", "student:documents"],
      "app_status": "active",
      "is_verified": false,
      "student_grant_count": 145,
      "last_used_at": "2026-03-24T09:30:00Z",
      "api_calls_today": 12450,
      "created_at": "2026-03-24T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 387,
    "page": 1,
    "limit": 50,
    "pages": 8
  }
}
```

#### Update App Status

```
PATCH /admin/apps/{app_id}/status
Content-Type: application/json

{
  "app_status": "suspended",
  "reason": "Violation of data access policy"
}
```

**Valid Transitions:**

```
- active → inactive (disable without data deletion)
- active → suspended (temporary block, flagged for investigation)
- active → revoked (permanent deletion with cascades)
- inactive → active (re-enable)
- suspended → active (lift suspension)
- suspended → revoked (permanent after investigation)
```

**Response (200):**

```json
{
  "id": "app_uuid",
  "app_status": "suspended",
  "previous_status": "active",
  "reason": "Violation of data access policy",
  "changed_by": "admin_user_id",
  "changed_at": "2026-03-24T10:50:00Z",
  "audit_id": "audit_uuid"
}
```

**Side Effects by Status:**

- **inactive**: Existing tokens still valid, new authorizations blocked
- **suspended**: All tokens invalidated, student grants frozen
- **revoked**: Complete cascade delete of all associated data

#### Delete App

```
DELETE /admin/apps/{app_id}
Content-Type: application/json

{
  "reason": "Company ceased operations",
  "notify_developer": true
}
```

**Response (204):** No content

**Cascade Operations:**

1. Mark app as revoked
2. Delete all authorization codes
3. Delete/revoke all app grants
4. Create audit log entry
5. (Optional) Email developer with deletion notice
6. Archive all related verification attempts

#### Regenerate App Secret (Admin Override)

```
POST /admin/apps/{app_id}/regenerate-secret
Content-Type: application/json

{
  "reason": "Security incident",
  "immediate": true
}
```

**Response (200):**

```json
{
  "id": "app_uuid",
  "new_client_secret": "secret_32bytes_base64",
  "old_secret_revoked_at": "2026-03-24T10:55:00Z",
  "grace_period_until": "2026-03-25T10:55:00Z",
  "developer_notified": true
}
```

---

### School Verification Webhooks: `/verify/callback`

**Public endpoint** with signature validation

#### School API Callback

```
POST /verify/callback/{request_id}
X-Webhook-Signature: sha256=hmac_hex_signature
Content-Type: application/json

{
  "request_id": "request_uuid",
  "status": "success",
  "timestamp": 1711272000,
  "matches": [
    {
      "field": "matric_number",
      "expected": "STU-2022-001",
      "received": "STU-2022-001",
      "match": true
    },
    {
      "field": "degree",
      "expected": "Bachelor of Science",
      "received": "B.Sc",
      "match": true,
      "confidence": 0.95
    }
  ],
  "overall_confidence": 0.98
}
```

**Signature Validation:**

```
HMAC-SHA256(request_body, hmac_secret) → hex string
Must match X-Webhook-Signature header value

Expected-Signature = "sha256=" + HMAC_SHA256(body, secret)
Incoming-Signature = "sha256=" + received_value
Constant-time comparison required
```

**Timestamp Validation:**

- Accept only if within ±5 minutes of server time
- Prevent replay attacks

**Response (200):**

```json
{
  "request_id": "request_uuid",
  "status": "processed",
  "received_at": "2026-03-24T11:00:00Z"
}
```

**Error Responses:**

```
(401) Invalid Signature:
{
  "error": "invalid_signature"
}

(410) Request Expired:
{
  "error": "request_expired",
  "expired_at": "2026-03-24T11:10:00Z"
}

(404) Request Not Found:
{
  "error": "request_not_found"
}
```

---

## OAuth 2.0 Implementation (SAuth)

### Authorization Code Flow (Standard)

```
┌────────────┐                                    ┌──────────────┐
│  Student   │                                    │ Employer App │
│  (Browser) │                                    │  (OAuth Clt) │
└─────┬──────┘                                    └──────┬───────┘
      │                                                   │
      │  1. Clicks "Login with SyncNexa"                    │
      │  ◄────────────────────────────────────────────────  │
      │                                                     │
      │  2. Browser redirects to SyncNexa  authorize        │
      ├──────────────────────────────────────────────────►  │
      │     /sauth/authorize?app_id=X&scope=Y&state=S      │
      │                                                     │
      ├─────────────────────────────────────────────────┐   │
      │  3. Session/Authentication Check                │   │
      │     (if logged in, proceed to step 4)          │   │
      │     (if not, redirect to /login)              │   │
      └─────────────────────────────────────────────────┘   │
      │                                                     │
      │  4. Consent Screen                                  │
      │     "Employer App requests: profile, documents"     │
      │     [Grant]  [Deny]                                 │
      │                                                     │
      │  5. Student approves scopes                         │
      │  ◄────────────────────────────────────────────────── │
      │                                                     │
      ├─────────────────────────────────────────────────┐   │
      │  6. Generate auth code (5 min, single-use)    │   │
      │     Store: user_id, app_id, scopes, code     │   │
      └─────────────────────────────────────────────────┘   │
      │                                                     │
      │  7. Redirect with code                              │
      │  ◄────────────────────────────────────────────────── │
      │     redirect_uri?code=ABC123&state=S               │
      │                                                     │
      │                                                    ┌─┴──┐
      │                                                    │    │ Backend
      │                                                    │    │ Obtains
      │                                                    │    │ Authority
      │                                                    └─┬──┘
      │                                                     │
      │   8. Backend → Backend Token Exchange              │
      │       POST /sauth/token                             │
      │       grant_type=authorization_code                │
      │       code=ABC123                                  │
      │       client_id=X                                  │
      │       client_secret=SECRET                        │
      │   ◄─────────────────────────────────────────────── │
      │                                                     │
      ├─────────────────────────────────────────────────┐   │
      │  9. Validate                                    │   │
      │     - Code exists and not used                  │   │
      │     - Code not expired                          │   │
      │     - client_id + secret match bcrypt          │   │
      │     - redirect_uri matches original            │   │
      │     - Mark code as used                        │   │
      └─────────────────────────────────────────────────┘   │
      │                                                     │
      │ 10. Return JWT access_token (7-day TTL)            │
      │     {token, expires_in, scope}                     │
      │   ◄─────────────────────────────────────────────── │
      │                                                     │
      │ 11. App makes authorized requests                  │
      │     GET /sauth/userinfo                             │
      │     Authorization: Bearer {token}                  │
      │                                                     │
      ├─────────────────────────────────────────────────┐   │
      │  12. Validate token                            │   │
      │      - JWT signature valid                     │   │
      │      - Token not expired                       │   │
      │      - Extract scopes from JWT claims      │   │
      │      - Load user data & filter by scopes      │   │
      └─────────────────────────────────────────────────┘   │
      │                                                     │
      │ 13. Return filtered user data                      │
      │     {email, name, documents, ...}                 │
      │   ◄─────────────────────────────────────────────── │
```

### Security Properties

**Authorization Code Flow is optimal for:**

- Web applications (server-to-server capability)
- Native/mobile apps (with PKCE)
- Long-lived access needed
- User logout not immediate

**Not suitable for:**

- Pure front-end SPAs without backend
- In-browser token storage
- High-frequency short-lived credentials

### Token Lifecycle

```
┌────────────────────────────────────────────────────────────┐
│  Token Lifecycle Management                                │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  1. ISSUED (Returned from /token)                          │
│     ├─ JWT payload: {sub, app_id, scopes, iat, exp}       │
│     ├─ Signed with JWT_SECRET                             │
│     └─ Cannot be revoked individually (JWT limitation)    │
│                                                             │
│  2. ACTIVE (Valid for 7 days from issue)                  │
│     ├─ App uses Bearer token in Authorization header       │
│     ├─ Each use: Validate signature & expiry              │
│     └─ No database lookup per request (stateless)          │
│                                                             │
│  3. EXPIRY (7-day window closed)                          │
│     ├─ Token still valid if student hasn't revoked grant  │
│     ├─ App must request new token or use refresh_token    │
│     └─ Refresh token implementation: pending              │
│                                                             │
│  4. REVOCATION (Student or App revokes grant)             │
│     ├─ Mark app_grant as is_revoked = 1                   │
│     ├─ Existing JWT tokens stay valid (can't revoke)      │
│     ├─ On userinfo request: Check grant.is_revoked        │
│     └─ Return 401 Unauthorized if revoked                 │
│                                                             │
│  5. BLACKLIST (Future: Token blacklist for immediate)      │
│     ├─ Store revoked tokens in Redis cache                │
│     ├─ Check blacklist on each request                    │
│     └─ Invalidate immediately upon revocation             │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### Scope Hierarchy & Override

```
┌─────────────────────────────────────────────────┐
│  Scope Resolution Logic                         │
├─────────────────────────────────────────────────┤
│                                                 │
│  App Registration Scopes (static)               │
│      │                                          │
│      ▼                                          │
│  Student Approval Scopes (authorized)           │
│      │                                          │
│      ▼                                          │
│  Authorization Code Scopes (may be subset)      │
│      │                                          │
│      ▼                                          │
│  Issued Token Scopes (final, in JWT claims)     │
│      │                                          │
│      ▼                                          │
│  Student Revocation (marks grant revoked)       │
│      │                                          │
│      ▼                                          │
│  Userinfo Endpoint (filter response by scopes)  │
│                                                 │
│  Example:                                       │
│  ─────────────────────────────────────────────  │
│  1. App requests: [profile, student:docs]       │
│  2. Student approves: [profile, student:docs]   │
│  3. Token issued with: [profile, student:docs]  │
│  4. Userinfo returns: email, name, documents    │
│  5. But if student revokes, next token = error  │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## School Verification Integration

### Verification Request Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  School Verification Flow                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Student uploads credential document                        │
│  (Certificate, Transcript, Diploma)                        │
│           │                                                 │
│           ▼                                                 │
│  ┌──────────────────────────┐                              │
│  │ Extraction OCR/ML Module │                              │
│  │ Parses fields from image │                              │
│  │ - Name, Degree, Date     │                              │
│  │ - Institution, GPA       │                              │
│  └──────────────────────────┘                              │
│           │                                                 │
│           ▼                                                 │
│  ┌──────────────────────────────────────────────┐         │
│  │ Match Against School API Config  │         │
│  │ - Find institution's API endpoint│         │
│  │ - Retrieve HMAC secret from Vault│         │
│  │ Create verification request      │         │
│  │ - Generate request_id            │         │
│  │ - Sign payload with HMAC-SHA256  │         │
│  │ Store in school_verification_req │         │
│  └──────────────────────────────────────────────┘         │
│           │                                                 │
│           ▼                                                 │
│  ┌──────────────────────────────────────────────┐         │
│  │ HTTPS POST to School API                     │         │
│  │ Signed request:                              │         │
│  │ - Body: {student_id, degree, institution}   │         │
│  │ - Header X-Signature: sha256=HMAC            │         │
│  └──────────────────────────────────────────────┘         │
│           │                                                 │
│           ▼                                                 │
│  ┌──────────────────────────────────────────────┐         │
│  │ School API Processing (async)                │         │
│  │ - Query their database                       │         │
│  │ - Extract student record                     │         │
│  │ - Compare fields                             │         │
│  │ - Generate confidence scores                 │         │
│  └──────────────────────────────────────────────┘         │
│           │                                                 │
│           ▼                                                 │
│  ┌──────────────────────────────────────────────┐         │
│  │ Webhook Callback to SyncNexa                 │         │
│  │ /verify/callback/{request_id}                │         │
│  │ - Signature still required                   │         │
│  │ - Timestamp within 5 min window              │         │
│  │ - Status: success|failed|partial             │         │
│  │ - Field matches with confidence scores       │         │
│  └──────────────────────────────────────────────┘         │
│           │                                                 │
│           ▼                                                 │
│  ┌──────────────────────────────────────────────┐         │
│  │ Update Verification Record                   │         │
│  │ - Store matches in school_verification_match │         │
│  │ - Audit log each field decision              │         │
│  │ - Aggregate confidence score                 │         │
│  │ - Mark document as verified (if threshold)   │         │
│  └──────────────────────────────────────────────┘         │
│           │                                                 │
│           ▼                                                 │
│  ┌──────────────────────────────────────────────┐         │
│  │ Notify Student                               │         │
│  │ - Email: "Your degree verified successfully" │         │
│  │ - Display: Green checkmark in profile        │         │
│  │ - Log for audit trail                        │         │
│  └──────────────────────────────────────────────┘         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### HMAC Signature Verification

**Sending Request to School:**

```typescript
// 1. Prepare JSON payload
const payload = {
  student_id: "STU-2022-001",
  institution: "University of Example",
  degree: "Bachelor of Science",
  graduation_date: "2023-06-15",
};

// 2. Get HMAC secret from Vault
const hmacSecret = await vaultService.getSecret(config.vault_secret_path);

// 3. Create signature
const payloadString = JSON.stringify(payload);
const signature = crypto
  .createHmac("sha256", Buffer.from(hmacSecret, "base64"))
  .update(payloadString)
  .digest("hex");

// 4. Send with header
const response = await fetch("https://school.api/verify", {
  method: "POST",
  headers: {
    "X-Webhook-Signature": `sha256=${signature}`,
    "X-Request-ID": requestId,
    "X-Timestamp": Math.floor(Date.now() / 1000),
  },
  body: payloadString,
});
```

**Receiving Webhook:**

```typescript
// 1. Extract signature from header
const incomingSignature = req.headers["x-webhook-signature"];

// 2. Validate timestamp (within 5 min)
const timestamp = parseInt(req.headers["x-timestamp"]);
if (Math.abs(Date.now() / 1000 - timestamp) > 300) {
  return res.status(410).json({ error: "request_expired" });
}

// 3. Get HMAC secret from Vault
const hmacSecret = await vaultService.getSecret(
  requestConfig.vault_secret_path,
);

// 4. Compute expected signature
const body = req.rawBody; // Don't parse JSON yet
const expectedSignature =
  "sha256=" +
  crypto
    .createHmac("sha256", Buffer.from(hmacSecret, "base64"))
    .update(body)
    .digest("hex");

// 5. Constant-time comparison (prevent timing attacks)
if (
  !crypto.timingSafeEqual(
    Buffer.from(incomingSignature),
    Buffer.from(expectedSignature),
  )
) {
  return res.status(401).json({ error: "invalid_signature" });
}

// 6. Process as trusted
const data = JSON.parse(body);
// ... update verification record
```

---

## Security Specifications

### Data Protection

| Data Level              | Protection                 | Storage              |
| ----------------------- | -------------------------- | -------------------- |
| **Client Secret**       | Bcrypt (rounds=10)         | Database (hashed)    |
| **Access Tokens**       | JWT-signed (HS256)         | Stateless (no DB)    |
| **School API Keys**     | AES-256 encrypted          | External Vault       |
| **Authorization Codes** | Random 32-byte + TTL       | Database (temp)      |
| **User Personal Data**  | HTTPS + encryption at rest | Encrypted DB columns |

### Cryptographic Standards

```
JWT Signing
├─ Algorithm: HS256 (HMAC with SHA-256)
├─ Secret: JWT_SECRET (min 32 bytes from env)
├─ Claims: {sub, app_id, scopes, iat, exp, iss}
└─ No algorithm downgrade allowed

Bcrypt Hashing (Client Secrets)
├─ Rounds: 10
├─ Time: ~100ms per hash
├─ Output: 60-char crypt format
└─ Never logs raw secrets

HMAC-SHA256 (School API Signing)
├─ Secret: Stored in Vault (not DB)
├─ Payload: JSON request body
├─ Comparison: crypto.timingSafeEqual()
└─ Timestamp check: ±5 minutes

Random Tokens
├─ Authorization codes: crypto.randomBytes(32).toString('base64')
├─ Client IDs: UUID v4
├─ API Tokens: crypto.randomBytes(32).toString('base64url')
└─ Entropy: >= 256 bits
```

### Transport Security

```
TLS Configuration (Production)
├─ Minimum TLS 1.3 (1.2 if unavoidable)
├─ Perfect Forward Secrecy: Enabled
├─ Cipher Suite: Modern ciphers only
│  ├─ TLS_CHACHA20_POLY1305_SHA256
│  ├─ TLS_AES_256_GCM_SHA384
│  └─ TLS_AES_128_GCM_SHA256
├─ HSTS: max-age=31536000; includeSubDomains
├─ Certificate: DigiCert or similar (2048+ RSA or EC P-256)
└─ Pinning: Optional for high-security integrations

CORS Policy
├─ Origin: Only registered callback_url domains
├─ Methods: GET, POST
├─ Credentials: Include (for session cookies)
├─ Headers: Authorization, Content-Type (allowlisted)
└─ Preflight cache: 10 minutes

Content Security Policy
├─ default-src: 'self'
├─ script-src: 'nonce-{random}' (no unsafe-inline)
├─ frame-ancestors: 'none' (prevents clickjacking)
└─ report-uri: /api/v1/security/csp-report
```

### Attack Prevention

| Attack Vector                       | Prevention                                                  |
| ----------------------------------- | ----------------------------------------------------------- |
| **CSRF**                            | state parameter in OAuth, SameSite cookies                  |
| **Clickjacking**                    | X-Frame-Options: DENY                                       |
| **XSS**                             | CSP nonce, output escaping, no inline scripts               |
| **SQL Injection**                   | Parameterized queries, ORM validation                       |
| **Authorization Code Interception** | HTTPS only, state validation, redirect_uri exact match      |
| **Secret Exposure**                 | Bcrypt hashing, single-show client secret, Vault encryption |
| **Token Misuse**                    | JWT expiry, scopes validation, revocation check             |
| **Replay**                          | Nonce/state in OAuth, timestamp ±5min for webhooks          |
| **Timing Attacks**                  | crypto.timingSafeEqual() for signature comparison           |
| **Brute Force**                     | Rate limiting, account lockout after N attempts             |
| **Denial of Service**               | Rate limits per IP/app, request size limits                 |

---

## Error Handling

### Standard Error Response Format

```json
{
  "error": "error_code",
  "error_description": "Human-readable description",
  "error_uri": "https://docs.syncnexa.com/errors/error_code",
  "request_id": "req_uuid_for_logging",
  "timestamp": "2026-03-24T11:00:00Z"
}
```

### HTTP Status Codes

| Status  | Scenario            | Treatment                                   |
| ------- | ------------------- | ------------------------------------------- |
| **200** | Request succeeded   | Return success payload                      |
| **201** | Resource created    | Return created resource + Location header   |
| **204** | Resource deleted    | No content body                             |
| **400** | Invalid request     | Invalid field, missing required parameter   |
| **401** | Unauthorized        | Missing/invalid JWT, invalid client secret  |
| **403** | Forbidden           | Insufficient permissions, app suspended     |
| **404** | Not found           | Resource doesn't exist                      |
| **409** | Conflict            | Duplicate app name, duplicate grant         |
| **410** | Gone                | Expired authorization code, expired request |
| **413** | Payload too large   | Request body > max size                     |
| **429** | Rate limited        | Too many requests per window                |
| **500** | Server error        | Database error, unexpected exception        |
| **503** | Service unavailable | Maintenance, downstream service down        |

### OAuth-Specific Error Codes

```
Authorization Endpoint (/authorize):
├─ invalid_client: App ID not found or mismatch
├─ redirect_uri_mismatch: Callback URL doesn't match app's
├─ invalid_scope: Requested scope not allowed for app
├─ access_denied: User denied consent (redirect with error)
├─ server_error: Internal error occurred
└─ temporarily_unavailable: Server maintenance

Token Endpoint (/token):
├─ invalid_request: Missing required parameter
├─ invalid_client: Client auth failed
├─ invalid_grant: Code expired, already used, or invalid
├─ unauthorized_client: Client type mismatch
├─ unsupported_grant_type: grant_type not "authorization_code"
└─ invalid_scope: Code granted different scopes

UserInfo Endpoint (/userinfo):
├─ invalid_token: Token missing or malformed
├─ insufficient_scope: Scopes don't cover requested fields
├─ expired_token: 7-day TTL exceeded
├─ revoked_token: Student or admin revoked grant
└─ server_error: Internal error

Revocation Endpoint (/revoke):
├─ unsupported_token_type: Token type not supported
└─ invalid_request: Token not found
```

---

## Rate Limiting & Quotas

### Per-App Limits

```
BY ENDPOINT:

Token Exchange (/token):
├─ Per client: 10 requests per minute
├─ Per IP: 100 requests per minute
├─ Backoff: Exponential after threshold
└─ Lockout: 15 minutes after 10 failed attempts

UserInfo (/userinfo):
├─ Authenticated apps: 1000 requests per hour
├─ Per user: 100 requests per hour (shared across apps)
└─ Burst: 10/second (sliding window)

Authorization (/authorize):
├─ Per user: 50 new grants per hour (prevent enumeration)
├─ Per app: Unlimited redirects
└─ Tracking: By session cookie

Revocation (/revoke):
├─ Per user: 100 requests per hour
└─ Per app: Unlimited revocations

Admin Endpoints (/admin/apps):
├─ List apps: 100 requests per minute
├─ Update status: 20 requests per minute
└─ Delete app: 5 requests per minute
```

### quota Management

```
API Tokens:
├─ Total per app: 50 active tokens
├─ Lifetime: Unlimited until revoked or expired
├─ Resets: Monthly quota counter
└─ Monitoring: Dashboard shows usage per token

School Verification:
├─ Requests per institution: 1000 per hour
├─ Retry attempts: 5 total (exponential backoff)
├─ Callback timeout: 30 seconds
└─ Storage retention: 12 months
```

### Rate Limit Headers

```
HTTP/1.1 200 OK
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1711358400
X-RateLimit-Used: 1

When limit exceeded (429):
HTTP/1.1 429 Too Many Requests
Retry-After: 60
X-RateLimit-Reset: 1711358400
Content-Type: application/json

{
  "error": "rate_limited",
  "error_description": "Too many requests. Retry after 60 seconds.",
  "x_ratelimit_reset": "2026-03-24T12:00:00Z"
}
```

---

## Implementation Checklist

### Phase 1: Core OAuth Implementation ✅

- [x] `apps` table with OAuth credentials
- [x] `authorization_codes` table with TTL
- [x] `app_grants` table with persistent access
- [x] SAuth flow: /authorize → /token → /userinfo
- [x] JWT token generation and validation
- [x] Scope-based response filtering
- [x] Client secret bcrypt hashing
- [x] Revocation endpoint

### Phase 2: Management APIs ✅

- [x] Developer app registration & CRUD
- [x] Admin app listing & filtering
- [x] Admin status management (suspend/revoke)
- [x] Admin cascade delete
- [x] Audit logging for all admin actions
- [x] Grant management endpoints
- [x] Secret rotation endpoints

### Phase 3: School Verification 🔄

- [ ] `school_api_configs` table
- [ ] HMAC signature generation & validation
- [ ] Retry logic with exponential backoff
- [ ] `school_verification_requests` tracking
- [ ] `school_verification_matches` field mapping
- [ ] `school_verification_audit_logs` complete trail
- [ ] Webhook callback endpoint
- [ ] Signature timestamp validation

### Phase 4: Advanced Features 📋

- [ ] **Refresh Tokens** - Implement refresh_token column logic
- [ ] **Token Blacklist** - Redis cache for immediate revocation
- [ ] **Usage Analytics** - Track API calls per app/user
- [ ] **Rate Limiting** - Implement per-app quotas
- [ ] **App Webhooks** - Generic app event notifications
- [ ] **Marketplace** - App categorization, discovery, ratings
- [ ] **Multi-Tenant Org Support** - Apps owned by organizations
- [ ] **Grant Expiry Policy** - Auto-expire old grants

### Phase 5: Security Hardening 🔒

- [ ] Penetration testing
- [ ] OWASP Top 10 audit
- [ ] Security headers validation
- [ ] Cryptographic review
- [ ] Vault integration testing
- [ ] Incident response procedures
- [ ] Data retention policies
- [ ] GDPR compliance audit

---

## Migration Path

### Session 1: Existing users with OAuth grants

**Scenario:** Existing students with apps already authorized

**Migration Steps:**

1. Verify `app_grants` table has data
2. Check that access_tokens are valid JWT format
3. Validate existing grants against new token structure
4. Test `/userinfo` endpoint with old tokens
5. No database migration required - backward compatible

### Session 2: Existing API tokens

**Scenario:** Existing apps using old non-JWT API token method

**Steps:**

1. Create `api_tokens` table
2. Assign existing app credentials to new table
3. Update token validation middleware
4. Maintain dual validation (old + new) for 30 days
5. Deprecation notice sent to developers
6. Final cutoff: 60 days

### Session 3: School verification rollout

**Scenario:** Adding/migrating school APIs

**Steps:**

1. Create school tables locally
2. Vault integration test
3. Test HMAC signing with sample schools
4. Webhook validation test
5. Canary rollout (5 schools first)
6. Monitor error rates and response times
7. Full rollout (gradual)

---

## Appendix: Quick Reference

### Key Environment Variables

```env
# JWT Configuration
JWT_SECRET=base64_encoded_256bit_secret

# OAuth Endpoints
APP_URL=https://syncnexa.example.com
SAUTH_CODE_EXPIRY_MINUTES=10
SAUTH_TOKEN_EXPIRY_SECONDS=604800

# School Verification
SCHOOL_VERIFICATION_CALLBACK_BASE_URL=https://syncnexa.example.com/verify
SCHOOL_VERIFICATION_REQUEST_TTL_SECONDS=600
SCHOOL_VERIFICATION_HMAC_ALGORITHM=sha256

# External Services
VAULT_ADDR=https://vault.example.com
VAULT_TOKEN=hvs.xxxxxx

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

### Common OAuth Scopes

```
Basic         = "profile" → {email, name, phone, avatar}
Student ID    = "student:profile" → {institution, matric, admission_year}
Credentials   = "student:documents" → {verified_certificates[]}
Academics     = "student:academics" → {gpa, degrees[], transcripts}
Portfolio     = "student:portfolio" → {projects[], certifications[]}
```

### Postman Collection (Template)

```json
{
  "info": {
    "name": "SyncNexa OAuth API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "1. Authorize",
      "request": {
        "method": "GET",
        "url": {
          "raw": "{{BASE_URL}}/api/v1/sauth/authorize?app_id={{APP_ID}}&scopes=profile student:profile&redirect_uri={{REDIRECT_URI}}&state={{STATE}}",
          "host": ["{{BASE_URL}}"]
        }
      }
    },
    {
      "name": "2. Exchange Code for Token",
      "request": {
        "method": "POST",
        "url": "{{BASE_URL}}/api/v1/sauth/token",
        "body": {
          "mode": "urlencoded",
          "urlencoded": [
            { "key": "grant_type", "value": "authorization_code" },
            { "key": "code", "value": "{{AUTH_CODE}}" },
            { "key": "client_id", "value": "{{CLIENT_ID}}" },
            { "key": "client_secret", "value": "{{CLIENT_SECRET}}" },
            { "key": "redirect_uri", "value": "{{REDIRECT_URI}}" }
          ]
        }
      }
    }
  ]
}
```

---

**End of Technical Documentation**

_For questions or updates to this documentation, contact: platform-engineering@syncnexa.example.com_
