# Student Features

Complete documentation for all student profile management features. Each feature is documented as an isolated page with comprehensive examples and edge cases.

---

## Features Overview

The Student section contains all features related to student profile management and operations:

### Core Features

1. **[Current User Info](/docs/student/me)** - Get current user's minimal info
   - Full name
   - User role
   - Profile image
   - Email
   - Account status

2. **[Personal Information](/docs/student/personal-info)** - View personal profile data
   - Get full name
   - Access email and phone
   - View address and gender

3. **[Academic Details](/docs/student/academic-details)** - View academic enrollment info
   - Institution and department
   - Program type (undergraduate, postgraduate, etc.)
   - Student level
   - Matriculation number
   - Admission and graduation years

4. **[Documents](/docs/student/documents)** - Manage identity documents
   - Upload documents
   - Update document information
   - Request verification
   - Check verification status

5. **[Academic Records](/docs/student/academic-records)** - Manage educational history
   - Create academic records
   - Upload transcripts
   - Track educational institutions
   - Manage GPA and honors

6. **[Portfolio](/docs/student/portfolio)** - Showcase projects and certificates
   - Add projects
   - Add professional certificates
   - Feature portfolio items
   - Manage skills and achievements

7. **[Verification Requests](/docs/student/verification-requests)** - Request institution verification
   - Request credential verification from institutions
   - Track verification requests
   - View verification status

8. **[Student Card](/docs/student/student-card)** - Digital identity card
   - Create digital student card
   - Generate verification tokens
   - Manage card validity

9. **[Verification Tokens](/docs/student/verification-tokens)** - Controlled access tokens
   - Issue time-limited tokens
   - Scope token access
   - Validate and revoke tokens

10. **[Shareable Links](/docs/student/shareable-links)** - Public profile sharing

- Create shareable links
- Control access scope
- Revoke links

---

## Quick Navigation

| Feature          | Purpose                              | Quick Start                                        |
| ---------------- | ------------------------------------ | -------------------------------------------------- |
| Personal Info    | View personal profile data           | [Get Started](/docs/student/personal-info)         |
| Academic Details | View enrollment information          | [Get Started](/docs/student/academic-details)      |
| Documents        | Upload and manage identity documents | [Get Started](/docs/student/documents)             |
| Academic Records | Track educational history            | [Get Started](/docs/student/academic-records)      |
| Portfolio        | Showcase work and achievements       | [Get Started](/docs/student/portfolio)             |
| Verification     | Request institution verification     | [Get Started](/docs/student/verification-requests) |
| Student Card     | Create digital ID card               | [Get Started](/docs/student/student-card)          |
| Tokens           | Issue verification tokens            | [Get Started](/docs/student/verification-tokens)   |
| Share Links      | Share profile publicly               | [Get Started](/docs/student/shareable-links)       |

---

## Common Patterns

### Authentication

All student endpoints require authentication via Bearer token:

```bash
Authorization: Bearer {accessToken}
```

### Response Format

All endpoints follow a standard response format:

**Success Response:**

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Error description",
  "errors": [{ "field": "fieldName", "message": "Error detail" }]
}
```

### Rate Limiting

Students are subject to the following rate limits:

| Operation             | Limit         |
| --------------------- | ------------- |
| Document uploads      | 10 per minute |
| Academic records      | 50 total      |
| Portfolio items       | 100 total     |
| Verification requests | 5 per month   |
| Token creation        | 100 per day   |

---

## Workflow Examples

### Complete Account Setup

1. Upload identity documents → [Documents](/docs/student/documents)
2. Create academic records → [Academic Records](/docs/student/academic-records)
3. Add portfolio items → [Portfolio](/docs/student/portfolio)
4. Create student card → [Student Card](/docs/student/student-card)
5. Request verification → [Verification Requests](/docs/student/verification-requests)

### Sharing Your Profile

1. Create shareable link → [Shareable Links](/docs/student/shareable-links)
2. Share the link with recruiters/schools
3. Monitor link usage → [Link Analytics](/docs/student/shareable-links#analytics)
4. Revoke link when done → [Shareable Links](/docs/student/shareable-links#revoke)

### Verification Process

1. Upload required documents → [Documents](/docs/student/documents)
2. Request institution verification → [Verification Requests](/docs/student/verification-requests)
3. Issue verification token → [Verification Tokens](/docs/student/verification-tokens)
4. Share token with verifier → [Verification Tokens](/docs/student/verification-tokens#sharing)

---

## Best Practices

### Document Management

- Upload high-quality, clear images
- Keep metadata up-to-date
- Don't delete verified documents
- Update information if details change

### Academic Records

- Add records in chronological order (newest first)
- Include accurate GPA and dates
- Upload official transcripts
- Update status when graduated

### Portfolio

- Feature your best 3-5 projects
- Include live demo links
- Add verified certificates
- Keep skills current

### Verification

- Request verification early in the process
- Respond promptly to verification requests
- Keep documents updated
- Use specific token scopes

### Privacy & Security

- Limit shareable link scope
- Set appropriate token expiration
- Revoke unused tokens/links
- Use strong permissions (read-only by default)

---

## Related Sections

- **[Authentication](/docs/authentication)** - Learn how to authenticate
- **[Verification](/docs/verification)** - Details on verification process
- **[Dashboard](/docs/student/dashboard)** - View profile completion
- **[Security](/docs/security)** - Protect your account
