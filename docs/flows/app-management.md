# App Management Flow

Complete documentation for registering, managing, and administering OAuth applications in the SyncNexa Identity platform.

---

## Overview

The App Management flow allows developers to register and manage OAuth 2.0 applications that integrate with the SyncNexa Identity platform. Applications can request access to user data through OAuth 2.0 authorization flows with defined scopes.

**Authentication:** All endpoints in this flow require authentication via Bearer token in the Authorization header.

---

## Table of Contents

1. [Register Application](#1-register-application)
2. [Get My Applications](#2-get-my-applications)
3. [Get Available Applications](#3-get-available-applications)
4. [Get Application by ID](#4-get-application-by-id)
5. [Update Application](#5-update-application)
6. [Rotate Client Secret](#6-rotate-client-secret)
7. [Delete Application](#7-delete-application)

---

## 1. Register Application

**Name:** Register OAuth Application

**Description:** Registers a new OAuth 2.0 application with the SyncNexa Identity platform. Upon registration, the system generates a unique `client_id` and `client_secret` that are used for OAuth authentication flows. The application is initially created with "active" status and can request user authorization based on defined scopes.

**Route:** `POST /apps/register`

**Authentication Required:** Yes (Bearer token)

### Request Payload

```json
{
  "name": "Student Portal by TechCorp",
  "description": "A comprehensive student management portal that helps students track their academic progress and manage documents",
  "website_url": "https://studentportal.techcorp.com",
  "callback_url": "https://studentportal.techcorp.com/auth/callback",
  "scopes": ["profile", "student:profile", "student:documents"]
}
```

### Payload Field Requirements

| Field        | Type   | Required | Validation Rules                                                  |
| ------------ | ------ | -------- | ----------------------------------------------------------------- |
| name         | string | Yes      | 3-100 characters                                                  |
| description  | string | No       | Maximum 500 characters                                            |
| website_url  | string | No       | Valid URL format                                                  |
| callback_url | string | Yes      | Valid URL format (where users are redirected after authorization) |
| scopes       | array  | No       | Array of valid scope strings. Default: ["profile"]                |

### Available Scopes

| Scope             | Description                                         | Access Level |
| ----------------- | --------------------------------------------------- | ------------ |
| profile           | Basic profile information (name, email)             | Read         |
| student:profile   | Full student profile including personal details     | Read         |
| student:documents | Access to student documents and verification status | Read         |
| student:academic  | Academic records and transcripts                    | Read         |
| student:portfolio | Projects and certificates                           | Read         |

### Success Response (201 Created)

```json
{
  "status": "success",
  "statusCode": 201,
  "message": "App registered successfully.",
  "data": {
    "id": "app-550e8400-e29b-41d4-a716-446655440000",
    "client_id": "client-650e8400-e29b-41d4-a716-446655440001",
    "client_secret": "secret_abc123xyz789SECURE_RANDOM_STRING_do_not_share",
    "owner_id": "user-123e4567-e89b-12d3-a456-426614174000",
    "name": "Student Portal by TechCorp",
    "description": "A comprehensive student management portal that helps students track their academic progress and manage documents",
    "website_url": "https://studentportal.techcorp.com",
    "callback_url": "https://studentportal.techcorp.com/auth/callback",
    "scopes": ["profile", "student:profile", "student:documents"],
    "status": "active",
    "created_at": "2026-01-11T10:00:00.000Z",
    "updated_at": "2026-01-11T10:00:00.000Z"
  }
}
```

### Important Security Notes

**⚠️ CRITICAL: Store the `client_secret` securely!**

- The `client_secret` is only returned once during registration
- Never expose the `client_secret` in client-side code or public repositories
- Store it in environment variables or secure secret management systems
- If compromised, immediately rotate the secret using the rotate endpoint

### Error Responses

#### 400 Bad Request - Validation Error

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "App name must be at least 3 characters"
    },
    {
      "field": "callback_url",
      "message": "Invalid callback URL"
    }
  ]
}
```

**What Happens:** The request fails validation. No application is created. Common validation errors include:

- **Name too short:** "App name must be at least 3 characters"
- **Name too long:** "App name must not exceed 100 characters"
- **Description too long:** "Description must not exceed 500 characters"
- **Invalid website URL:** "Invalid website URL"
- **Invalid callback URL:** "Invalid callback URL" (this is required and must be a valid URL)
- **Invalid scopes:** Unknown scope values are rejected

**Fix:** Correct the validation errors and resubmit the request.

#### 401 Unauthorized

```json
{
  "status": "error",
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**What Happens:** The authentication token is missing, invalid, or expired. No application is created. User must authenticate with a valid access token.

#### 500 Internal Server Error

```json
{
  "status": "error",
  "statusCode": 500,
  "message": "Failed to register application"
}
```

**What Happens:** An unexpected server error occurred during registration (database error, UUID generation failure, etc.). No application is created. User should retry after a brief delay.

---

## 2. Get My Applications

**Name:** List My OAuth Applications

**Description:** Retrieves all OAuth applications owned by the authenticated user. This includes all applications the user has registered, regardless of their status (active, inactive, or suspended).

**Route:** `GET /apps/my-apps`

**Authentication Required:** Yes

### Request

No request body required. Authentication is determined from the Bearer token.

### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Apps retrieved successfully",
  "data": [
    {
      "id": "app-550e8400-e29b-41d4-a716-446655440000",
      "client_id": "client-650e8400-e29b-41d4-a716-446655440001",
      "owner_id": "user-123e4567-e89b-12d3-a456-426614174000",
      "name": "Student Portal by TechCorp",
      "description": "A comprehensive student management portal",
      "website_url": "https://studentportal.techcorp.com",
      "callback_url": "https://studentportal.techcorp.com/auth/callback",
      "scopes": ["profile", "student:profile", "student:documents"],
      "status": "active",
      "created_at": "2026-01-11T10:00:00.000Z",
      "updated_at": "2026-01-11T10:00:00.000Z"
    },
    {
      "id": "app-750e8400-e29b-41d4-a716-446655440002",
      "client_id": "client-850e8400-e29b-41d4-a716-446655440003",
      "owner_id": "user-123e4567-e89b-12d3-a456-426614174000",
      "name": "Academic Tracker",
      "description": "Track student academic performance",
      "website_url": "https://academictracker.com",
      "callback_url": "https://academictracker.com/callback",
      "scopes": ["profile", "student:academic"],
      "status": "inactive",
      "created_at": "2026-01-05T08:30:00.000Z",
      "updated_at": "2026-01-08T14:20:00.000Z"
    }
  ]
}
```

### Response Details

**Note:** The `client_secret` is **NOT** included in the response for security reasons. It's only provided during initial registration or when explicitly rotated.

**Status Values:**

- `active`: Application is operational and can request user authorizations
- `inactive`: Application is temporarily disabled
- `suspended`: Application has been suspended by administrators

### Error Responses

#### 401 Unauthorized

```json
{
  "status": "error",
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**What Happens:** Authentication token is missing or invalid. User must provide a valid Bearer token.

---

## 3. Get Available Applications

**Name:** List Available Applications for Discovery

**Description:** Retrieves a list of all active applications registered on the platform. This is a discovery endpoint that allows users to see what applications are available for integration. Only applications with "active" status are returned.

**Route:** `GET /apps/available`

**Authentication Required:** Yes

### Request

No request body or query parameters required.

### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Available apps retrieved successfully",
  "data": [
    {
      "id": "app-550e8400-e29b-41d4-a716-446655440000",
      "client_id": "client-650e8400-e29b-41d4-a716-446655440001",
      "name": "Student Portal by TechCorp",
      "description": "A comprehensive student management portal",
      "website_url": "https://studentportal.techcorp.com",
      "scopes": ["profile", "student:profile", "student:documents"],
      "status": "active",
      "created_at": "2026-01-11T10:00:00.000Z"
    },
    {
      "id": "app-950e8400-e29b-41d4-a716-446655440004",
      "client_id": "client-a50e8400-e29b-41d4-a716-446655440005",
      "name": "CV Builder Pro",
      "description": "Professional CV and resume builder using student data",
      "website_url": "https://cvbuilderpro.com",
      "scopes": ["profile", "student:academic", "student:portfolio"],
      "status": "active",
      "created_at": "2025-12-15T09:00:00.000Z"
    }
  ]
}
```

### Response Details

**Note:** This endpoint returns applications from all users but excludes:

- The `client_secret` (never exposed in list endpoints)
- The `owner_id` (privacy consideration)
- The `callback_url` (security consideration)
- Applications with `inactive` or `suspended` status

This allows users to discover applications they might want to authorize without exposing sensitive configuration details.

### Use Case

This endpoint is typically used for:

- Displaying an "App Store" or marketplace of available integrations
- Allowing users to browse and authorize third-party applications
- Showing users what applications they can connect to their account

---

## 4. Get Application by ID

**Name:** Get Application Details

**Description:** Retrieves detailed information about a specific application. Users can only access applications they own. The response includes all application details including the callback URL, but excludes the client secret for security reasons.

**Route:** `GET /apps/:id`

**Authentication Required:** Yes

### Path Parameters

| Parameter | Type   | Required | Description        |
| --------- | ------ | -------- | ------------------ |
| id        | string | Yes      | The application ID |

### Request Example

```
GET /apps/app-550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "App retrieved successfully",
  "data": {
    "id": "app-550e8400-e29b-41d4-a716-446655440000",
    "client_id": "client-650e8400-e29b-41d4-a716-446655440001",
    "owner_id": "user-123e4567-e89b-12d3-a456-426614174000",
    "name": "Student Portal by TechCorp",
    "description": "A comprehensive student management portal that helps students track their academic progress and manage documents",
    "website_url": "https://studentportal.techcorp.com",
    "callback_url": "https://studentportal.techcorp.com/auth/callback",
    "scopes": ["profile", "student:profile", "student:documents"],
    "status": "active",
    "created_at": "2026-01-11T10:00:00.000Z",
    "updated_at": "2026-01-11T10:00:00.000Z"
  }
}
```

### Error Responses

#### 400 Bad Request - App Not Found or No Access

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "App not found or you don't have access"
}
```

**What Happens:** Either the application ID doesn't exist, or the authenticated user is not the owner of the application. No data is returned. This combined message prevents information disclosure about which applications exist.

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

## 5. Update Application

**Name:** Update Application Details

**Description:** Updates configuration details for an existing application. Only the application owner can update their applications. The client_id and client_secret cannot be modified through this endpoint (use the rotate secret endpoint for client_secret changes).

**Route:** `PATCH /apps/:id`

**Authentication Required:** Yes

### Path Parameters

| Parameter | Type   | Required | Description                  |
| --------- | ------ | -------- | ---------------------------- |
| id        | string | Yes      | The application ID to update |

### Request Payload

You can update any combination of the following fields:

```json
{
  "name": "Student Portal Pro by TechCorp",
  "description": "An enhanced student management portal with advanced analytics and reporting features",
  "website_url": "https://studentportalpro.techcorp.com",
  "callback_url": "https://studentportalpro.techcorp.com/auth/callback",
  "status": "active"
}
```

### Field Requirements

| Field        | Type   | Required | Validation Rules                        |
| ------------ | ------ | -------- | --------------------------------------- |
| name         | string | No       | 3-100 characters                        |
| description  | string | No       | Maximum 500 characters                  |
| website_url  | string | No       | Valid URL format                        |
| callback_url | string | No       | Valid URL format                        |
| status       | string | No       | Enum: "active", "inactive", "suspended" |

**Note:** All fields are optional. Include only the fields you want to update.

### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "App updated successfully.",
  "data": {
    "id": "app-550e8400-e29b-41d4-a716-446655440000",
    "client_id": "client-650e8400-e29b-41d4-a716-446655440001",
    "owner_id": "user-123e4567-e89b-12d3-a456-426614174000",
    "name": "Student Portal Pro by TechCorp",
    "description": "An enhanced student management portal with advanced analytics and reporting features",
    "website_url": "https://studentportalpro.techcorp.com",
    "callback_url": "https://studentportalpro.techcorp.com/auth/callback",
    "scopes": ["profile", "student:profile", "student:documents"],
    "status": "active",
    "created_at": "2026-01-11T10:00:00.000Z",
    "updated_at": "2026-01-11T14:30:00.000Z"
  }
}
```

### Error Responses

#### 400 Bad Request - Missing App ID

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Missing app id"
}
```

**What Happens:** The app ID parameter is missing from the URL path. No update is performed.

#### 400 Bad Request - Validation Error

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "App name must be at least 3 characters"
    },
    {
      "field": "status",
      "message": "Invalid enum value. Expected 'active' | 'inactive' | 'suspended'"
    }
  ]
}
```

**What Happens:** One or more fields failed validation. No update is performed. Fix the validation errors and resubmit.

#### 401 Unauthorized

```json
{
  "status": "error",
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**What Happens:** Authentication token is missing or invalid. No update is performed.

#### 403 Forbidden

```json
{
  "status": "error",
  "statusCode": 403,
  "message": "You don't have permission to update this app"
}
```

**What Happens:** The authenticated user is not the owner of the application. Only application owners can update their apps. No update is performed.

#### 404 Not Found

```json
{
  "status": "error",
  "statusCode": 404,
  "message": "App not found"
}
```

**What Happens:** The application with the specified ID doesn't exist. No update is performed.

### Status Management

**Status Field Usage:**

- Set to `"inactive"` to temporarily disable an application without deleting it
- Set to `"active"` to re-enable an inactive application
- `"suspended"` status is typically set by system administrators for policy violations

**Impact of Status Changes:**

- **inactive**: Prevents new OAuth authorization requests; existing tokens remain valid
- **suspended**: Revokes all existing tokens and prevents new authorization requests
- **active**: Allows normal OAuth operations

---

## 6. Rotate Client Secret

**Name:** Rotate Application Client Secret

**Description:** Generates a new `client_secret` for an application while invalidating the old one. This is a critical security operation that should be performed if:

- The current client secret has been compromised or exposed
- Regular security rotation policy (recommended every 90-180 days)
- Before removing team members who had access to the secret
- After detecting suspicious activity

**Route:** `POST /apps/rotate-secret`

**Authentication Required:** Yes

### Request Payload

```json
{
  "app_id": "app-550e8400-e29b-41d4-a716-446655440000"
}
```

### Field Requirements

| Field  | Type   | Required | Description                                       |
| ------ | ------ | -------- | ------------------------------------------------- |
| app_id | string | Yes      | The application ID for which to rotate the secret |

### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Client secret rotated successfully.",
  "data": {
    "app_id": "app-550e8400-e29b-41d4-a716-446655440000",
    "client_id": "client-650e8400-e29b-41d4-a716-446655440001",
    "client_secret": "secret_NEW_xyz789abc123SECURE_RANDOM_STRING_do_not_share",
    "rotated_at": "2026-01-11T15:00:00.000Z"
  }
}
```

### Important Notes

**⚠️ CRITICAL WARNINGS:**

1. **One-Time Display:** The new `client_secret` is only shown once. Store it securely immediately.

2. **Old Secret Invalidated:** The previous client secret becomes invalid immediately. Update all systems using the old secret to prevent authentication failures.

3. **Breaking Change:** This is a breaking change that will cause authentication failures for any code still using the old secret.

4. **Update Checklist:**
   - [ ] Store new client secret securely
   - [ ] Update production environment variables
   - [ ] Update staging/development environments
   - [ ] Update CI/CD pipelines
   - [ ] Notify team members of the change
   - [ ] Test OAuth flows with new secret
   - [ ] Monitor for authentication errors

### Error Responses

#### 400 Bad Request - Missing App ID

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "App ID is required"
}
```

**What Happens:** The request is missing the `app_id` field. No rotation is performed.

#### 401 Unauthorized

```json
{
  "status": "error",
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**What Happens:** Authentication token is missing or invalid. No rotation is performed.

#### 403 Forbidden

```json
{
  "status": "error",
  "statusCode": 403,
  "message": "You don't have permission to rotate this app's secret"
}
```

**What Happens:** The authenticated user is not the owner of the application. Only application owners can rotate secrets. No rotation is performed.

#### 404 Not Found

```json
{
  "status": "error",
  "statusCode": 404,
  "message": "App not found"
}
```

**What Happens:** The application with the specified ID doesn't exist. No rotation is performed.

### Best Practices for Secret Rotation

1. **Plan the Rotation:**

   - Schedule during low-traffic periods
   - Notify dependent services in advance
   - Prepare rollback plan

2. **Zero-Downtime Rotation Strategy:**

   - Keep old secret valid for a brief grace period (if implementing grace periods)
   - Update all services to use new secret
   - Monitor for any services still using old secret
   - Confirm all services updated before fully invalidating old secret

3. **Emergency Rotation:**

   - If compromised, rotate immediately without grace period
   - Revoke all active tokens
   - Audit access logs
   - Investigate the compromise

4. **Regular Rotation:**
   - Set calendar reminders for regular rotation (every 90 days recommended)
   - Document rotation procedures
   - Maintain rotation history

---

## 7. Delete Application

**Name:** Delete Application

**Description:** Permanently deletes an application and all associated data. This action is irreversible and will:

- Delete the application record
- Revoke all active authorization grants
- Invalidate all access tokens issued to this application
- Remove all OAuth authorization codes

**Route:** `DELETE /apps/:id`

**Authentication Required:** Yes

### Path Parameters

| Parameter | Type   | Required | Description                  |
| --------- | ------ | -------- | ---------------------------- |
| id        | string | Yes      | The application ID to delete |

### Request Example

```
DELETE /apps/app-550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "App deleted successfully.",
  "data": null
}
```

### Error Responses

#### 400 Bad Request - Missing App ID

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Missing app id"
}
```

**What Happens:** The app ID parameter is missing from the URL path. No deletion is performed.

#### 401 Unauthorized

```json
{
  "status": "error",
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**What Happens:** Authentication token is missing or invalid. No deletion is performed.

#### 403 Forbidden

```json
{
  "status": "error",
  "statusCode": 403,
  "message": "You don't have permission to delete this app"
}
```

**What Happens:** The authenticated user is not the owner of the application. Only application owners can delete their apps. No deletion is performed.

#### 404 Not Found

```json
{
  "status": "error",
  "statusCode": 404,
  "message": "App not found"
}
```

**What Happens:** The application with the specified ID doesn't exist or has already been deleted. No deletion is performed.

### Important Warnings

**⚠️ THIS ACTION IS PERMANENT AND CANNOT BE UNDONE**

Before deleting an application:

1. **Backup Critical Data:**

   - Save client_id and client_secret records
   - Export authorization grant data if needed
   - Document active integrations

2. **Notify Users:**

   - Inform users who have authorized this application
   - Provide migration path if replacing with new application
   - Set up redirects for callback URLs if needed

3. **Update Documentation:**

   - Remove references to the application
   - Update API documentation
   - Archive integration guides

4. **Graceful Shutdown:**

   - Set status to "inactive" first (gives users time to migrate)
   - Wait 30+ days before permanent deletion
   - Monitor for any dependent services

5. **Consider Alternatives:**
   - **Inactivation:** Set status to "inactive" instead of deleting
   - **Suspension:** Use "suspended" status for temporary issues
   - **Transfer:** Transfer ownership to another user instead

### What Gets Deleted

When you delete an application:

✅ **Deleted:**

- Application record (name, description, URLs, etc.)
- All OAuth authorization grants
- All active access tokens
- All authorization codes
- Application statistics and logs

❌ **NOT Deleted:**

- User data that was accessed via the application
- Audit logs (retained for compliance)
- Historical analytics data (anonymized after 90 days)

---

## Application Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Lifecycle                     │
└─────────────────────────────────────────────────────────────┘

    ┌─────────────┐
    │   Register  │  POST /apps/register
    │     App     │  → Returns client_id & client_secret
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │   Active    │  Status: "active"
    │    State    │  → Can request user authorizations
    └──────┬──────┘
           │
           ├─────────────────────┐
           │                     │
           ▼                     ▼
    ┌─────────────┐      ┌─────────────┐
    │   Update    │      │   Rotate    │
    │    Config   │      │   Secret    │  Security operation
    │             │      │             │  → New client_secret
    └──────┬──────┘      └──────┬──────┘
           │                     │
           └──────────┬──────────┘
                      │
           ┌──────────┴───────────┐
           │                      │
           ▼                      ▼
    ┌─────────────┐      ┌─────────────┐
    │  Inactive   │      │  Suspended  │
    │   Status    │      │   Status    │  Admin action
    │             │      │             │  → Revokes tokens
    └──────┬──────┘      └──────┬──────┘
           │                     │
           │  (Can reactivate)   │  (May be permanent)
           │                     │
           └──────────┬──────────┘
                      │
                      ▼
              ┌─────────────┐
              │   Delete    │  DELETE /apps/:id
              │     App     │  → Permanent removal
              └─────────────┘
```

---

## Security Best Practices

### For Application Owners

1. **Protect Client Secret:**

   - Never commit client secrets to version control
   - Use environment variables for secret storage
   - Implement secret rotation policies
   - Use secret management systems (AWS Secrets Manager, HashiCorp Vault)

2. **Callback URL Security:**

   - Use HTTPS for all callback URLs
   - Validate callback URLs strictly
   - Avoid wildcard or broad patterns
   - Implement PKCE for public clients

3. **Scope Management:**

   - Request minimum necessary scopes
   - Document why each scope is needed
   - Allow users to review and modify scopes

4. **Access Token Handling:**

   - Store access tokens securely
   - Implement token expiration handling
   - Never log or expose tokens
   - Use refresh token rotation

5. **Monitoring and Auditing:**
   - Monitor for unusual authorization patterns
   - Track failed authentication attempts
   - Audit scope usage
   - Set up alerts for suspicious activity

### For Platform Administrators

1. **Application Review:**

   - Review new application registrations
   - Verify callback URLs
   - Check scope requests
   - Monitor application behavior

2. **Rate Limiting:**

   - Implement rate limits on OAuth endpoints
   - Throttle failed authentication attempts
   - Limit token generation requests

3. **Compliance:**
   - Maintain audit logs
   - Implement data retention policies
   - Support user data deletion requests
   - Comply with privacy regulations

---

## Common Integration Patterns

### Server-Side Web Application

```javascript
// 1. Register your app and save credentials
const APP_CONFIG = {
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
  callback_url: "https://yourapp.com/auth/callback",
};

// 2. Redirect user to authorization endpoint
app.get("/login", (req, res) => {
  const authUrl =
    `https://identity.syncnexa.com/sauth/authorize?` +
    `client_id=${APP_CONFIG.client_id}&` +
    `redirect_uri=${encodeURIComponent(APP_CONFIG.callback_url)}&` +
    `response_type=code&` +
    `scope=profile student:profile`;

  res.redirect(authUrl);
});

// 3. Handle callback and exchange code for token
app.get("/auth/callback", async (req, res) => {
  const { code } = req.query;

  const tokenResponse = await fetch(
    "https://identity.syncnexa.com/sauth/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        client_id: APP_CONFIG.client_id,
        client_secret: APP_CONFIG.client_secret,
        redirect_uri: APP_CONFIG.callback_url,
      }),
    }
  );

  const { access_token } = await tokenResponse.json();
  // Store access_token securely and use for API requests
});
```

---

## Troubleshooting

### Common Issues

1. **"Invalid client credentials"**

   - Verify client_id and client_secret are correct
   - Check if secret was recently rotated
   - Ensure no extra whitespace in credentials

2. **"Callback URL mismatch"**

   - Callback URL in OAuth request must exactly match registered URL
   - Check for trailing slashes
   - Verify HTTPS vs HTTP

3. **"Application not found"**

   - Verify application ID is correct
   - Check if application was deleted
   - Ensure you're the application owner

4. **"Insufficient permissions"**
   - Only application owners can modify apps
   - Check authentication token is valid
   - Verify user owns the application

---

## Related Documentation

- [OAuth 2.0 Flow](./oauth-flow.md)
- [Authentication Flow](./authentication.md)
- [Scopes and Permissions](../auth/scopes.md)
- [Security Best Practices](../security/best-practices.md)
