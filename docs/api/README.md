# API Documentation

Welcome to the SyncNexa API documentation. The endpoints are organized by category for easy navigation.

## Categories

### [Auth](./auth/) - Authentication & Authorization
OAuth 2.0 based authentication, token management, and authorization flows.
- [Authorize](./auth/authorize.md) - Initiate authorization code flow
- [Token Exchange](./auth/token.md) - Exchange code for access token

### [User](./user/) - User & Profile Management
User account information and profile management.
- [Profile](./user/profile.md) - Retrieve authenticated user profile

### [Student](./student/) - Student Verification & Features
Student-specific endpoints for verification and profile completion.
- [Email Verification](./student/email-verification.md) - OTP-based email verification
- [Verification Center](./student/verification-center.md) - Multi-pillar verification system

### [School](./school/) - School Integration & Verification
For school administrators and integration partners managing school verification systems.
- [Verification API Spec](./school/verification-api-spec.md) - School API specification
- [Verification Schema](./school/schema.md) - Database schema for school verification
- [Configuration Management](./school/config-management.md) - Managing school API credentials

### [Resources](./resources/) - Public Reference Data
Public endpoints for discovering institutions and reference data.
- [Universities & Faculties](./resources/universities.md) - Institution lookup and faculty information

### [Security](./security.md) - Account Security
Security status, sessions, and password management.

---

## Quick Start

1. **Getting Started?** Start with [Authorize](./auth/authorize.md) to initiate an OAuth flow
2. **Building a Student App?** See [Email Verification](./student/email-verification.md) and [Verification Center](./student/verification-center.md)
3. **School Integration?** Review the [Verification API Spec](./school/verification-api-spec.md)
4. **Reference Data?** Check [Universities & Faculties](./resources/universities.md)

---

## Authentication

All endpoints (except public ones) require authentication via Bearer token:

```
Authorization: Bearer <ACCESS_TOKEN>
```

Obtain tokens through the [Auth flow](./auth/).

---

## Error Handling

All endpoints follow consistent error response format:

```json
{
  "status": "error",
  "message": "Human-readable error message",
  "statusCode": 400
}
```

Common status codes:
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Server Error

---

## Rate Limiting

API calls are rate-limited to prevent abuse. Check response headers for rate limit status:

- `X-RateLimit-Limit` - Maximum requests per window
- `X-RateLimit-Remaining` - Requests remaining in current window
- `X-RateLimit-Reset` - Unix timestamp when window resets
