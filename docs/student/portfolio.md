# Portfolio Management

Complete documentation for managing your portfolio, including projects and professional certificates.

---

## Overview

The Portfolio feature allows students to showcase their practical work, projects, and professional achievements. A well-maintained portfolio demonstrates real-world experience and skills to employers and educational institutions.

**Use Cases:**

- Display completed projects with links and descriptions
- Add professional certifications and credentials
- Showcase technical skills and achievements
- Share your best work with potential employers
- Build credibility through verified certificates

**Authentication:** All endpoints require authentication via Bearer token.

**Related Documentation:**

- [Academic Records](/docs/student/academic-records) - Educational background
- [Documents](/docs/student/documents) - Identity verification
- [Shareable Links](/docs/student/shareable-links) - Share portfolio publicly

---

## Table of Contents

1. [Create Project](#1-create-project)
2. [Update Project](#2-update-project)
3. [Retrieve Projects](#3-retrieve-projects)
4. [Delete Project](#4-delete-project)
5. [Create Certificate](#5-create-certificate)
6. [Update Certificate](#6-update-certificate)
7. [Retrieve Certificates](#7-retrieve-certificates)
8. [Delete Certificate](#8-delete-certificate)
9. [Examples](#examples)

---

## 1. Create Project

**Name:** Add Project to Portfolio

**Description:** Adds a project to your portfolio showcasing practical work, research, or personal initiatives.

**Route:** `POST /user/projects`

**Authentication Required:** Yes

**Rate Limit:** 100 projects per user

### Request Headers

```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

### Request Payload

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

### Field Requirements

| Field        | Type    | Required | Validation     | Description                     |
| ------------ | ------- | -------- | -------------- | ------------------------------- |
| title        | string  | Yes      | 3-200 chars    | Project title                   |
| description  | string  | No       | Max 1000 chars | Detailed project description    |
| technologies | array   | No       | Max 20 items   | Array of technologies used      |
| project_url  | string  | No       | Valid URL      | Repository or project URL       |
| demo_url     | string  | No       | Valid URL      | Live demo URL                   |
| start_date   | string  | No       | YYYY-MM-DD     | Project start date              |
| end_date     | string  | No       | YYYY-MM-DD     | Project completion date         |
| role         | string  | No       | Max 100 chars  | Your role in the project        |
| is_featured  | boolean | No       | boolean        | Whether to feature this project |
| metadata     | object  | No       | JSON           | Additional project information  |

### Request Example (JavaScript)

```javascript
async function createProject(accessToken, projectData) {
  const response = await fetch(
    "https://identity.syncnexa.com/api/v1/user/projects",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(projectData),
    },
  );

  return await response.json();
}

// Usage
const project = await createProject(accessToken, {
  title: "E-commerce Platform with AI Recommendations",
  description: "Full-stack e-commerce with ML recommendations",
  technologies: ["React", "Node.js", "Python", "TensorFlow"],
  demo_url: "https://ecommerce-demo.johndoe.com",
  is_featured: true,
});
```

### Request Example (cURL)

```bash
curl -X POST https://identity.syncnexa.com/api/v1/user/projects \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "E-commerce Platform with AI Recommendations",
    "description": "Full-stack e-commerce with ML recommendations",
    "technologies": ["React", "Node.js", "Python", "TensorFlow"],
    "demo_url": "https://ecommerce-demo.johndoe.com",
    "is_featured": true
  }'
```

### Success Response (201 Created)

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

### Error Responses

#### 400 Bad Request - Missing Title

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [{ "field": "title", "message": "title is required" }]
}
```

#### 400 Bad Request - Invalid URL

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [{ "field": "demo_url", "message": "Invalid URL format" }]
}
```

---

## 2. Update Project

**Name:** Update Project Details

**Description:** Updates an existing project in your portfolio.

**Route:** `PATCH /user/projects/:id`

**Authentication Required:** Yes

### Path Parameters

| Parameter | Type   | Required | Description              |
| --------- | ------ | -------- | ------------------------ |
| id        | string | Yes      | The project ID to update |

### Request Example (JavaScript)

```javascript
async function updateProject(projectId, accessToken, updates) {
  const response = await fetch(
    `https://identity.syncnexa.com/api/v1/user/projects/${projectId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    },
  );

  return await response.json();
}

// Usage - Move project from featured to featured=false
const updated = await updateProject(
  "proj-c50e8400-e29b-41d4-a716-446655440008",
  accessToken,
  {
    is_featured: false,
    description: "Enhanced e-commerce platform with advanced features",
  },
);
```

### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Project updated",
  "data": {
    "id": "proj-c50e8400-e29b-41d4-a716-446655440008",
    "title": "E-commerce Platform with AI Recommendations",
    "is_featured": false,
    "updated_at": "2026-01-11T15:30:00.000Z"
  }
}
```

---

## 3. Retrieve Projects

**Name:** List Your Projects

**Description:** Retrieves all projects in your portfolio.

**Route:** `GET /user/projects`

**Authentication Required:** Yes

### Query Parameters

| Parameter | Type    | Required | Description                            |
| --------- | ------- | -------- | -------------------------------------- |
| featured  | boolean | No       | Filter by featured status (true/false) |
| skip      | number  | No       | Pagination: skip N items               |
| limit     | number  | No       | Pagination: return max N items         |

### Request Example

```bash
curl -X GET "https://identity.syncnexa.com/api/v1/user/projects?featured=true&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Projects",
  "data": [
    {
      "id": "proj-c50e8400-e29b-41d4-a716-446655440008",
      "title": "E-commerce Platform with AI Recommendations",
      "description": "Full-stack e-commerce platform...",
      "technologies": ["React", "Node.js", "Python"],
      "demo_url": "https://ecommerce-demo.johndoe.com",
      "is_featured": true,
      "created_at": "2026-01-11T15:00:00.000Z"
    }
  ]
}
```

---

## 4. Delete Project

**Name:** Delete Project

**Description:** Removes a project from your portfolio.

**Route:** `DELETE /user/projects/:id`

**Authentication Required:** Yes

### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Project deleted"
}
```

---

## 5. Create Certificate

**Name:** Add Certificate to Portfolio

**Description:** Adds a professional certificate or credential to your portfolio.

**Route:** `POST /user/certificates`

**Authentication Required:** Yes

**Rate Limit:** 100 certificates per user

### Request Payload

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

### Field Requirements

| Field          | Type   | Required | Validation    | Description                      |
| -------------- | ------ | -------- | ------------- | -------------------------------- |
| issuer         | string | Yes      | 2-100 chars   | Certificate issuing organization |
| title          | string | Yes      | 3-200 chars   | Certificate name                 |
| issue_date     | string | No       | YYYY-MM-DD    | Date issued                      |
| expiry_date    | string | No       | YYYY-MM-DD    | Expiration date                  |
| credential_id  | string | No       | Max 100 chars | Unique certificate identifier    |
| credential_url | string | No       | Valid URL     | Verification/credential URL      |
| description    | string | No       | Max 500 chars | Certificate description          |
| skills         | array  | No       | Max 20 items  | Skills demonstrated              |
| metadata       | object | No       | JSON          | Additional information           |

### Request Example (JavaScript)

```javascript
async function createCertificate(accessToken, certData) {
  const response = await fetch(
    "https://identity.syncnexa.com/api/v1/user/certificates",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(certData),
    },
  );

  return await response.json();
}

// Usage
const cert = await createCertificate(accessToken, {
  issuer: "Google Cloud",
  title: "Google Cloud Professional Cloud Architect",
  issue_date: "2023-06-15",
  skills: ["Cloud Architecture", "GCP", "Infrastructure Design"],
});
```

### Success Response (201 Created)

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
    "skills": [
      "Cloud Architecture",
      "GCP",
      "Infrastructure Design",
      "Security"
    ],
    "created_at": "2026-01-11T15:30:00.000Z"
  }
}
```

### Error Responses

#### 400 Bad Request - Missing Required Fields

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    { "field": "issuer", "message": "issuer is required" },
    { "field": "title", "message": "title is required" }
  ]
}
```

---

## 6. Update Certificate

**Name:** Update Certificate Details

**Description:** Updates an existing certificate in your portfolio.

**Route:** `PATCH /user/certificates/:id`

**Authentication Required:** Yes

### Request Example

```javascript
const updated = await updateCertificate(certId, accessToken, {
  skills: ["Cloud Architecture", "GCP", "Infrastructure Design", "Kubernetes"],
  description: "Advanced certification in GCP architecture",
});
```

---

## 7. Retrieve Certificates

**Name:** List Your Certificates

**Description:** Retrieves all certificates in your portfolio.

**Route:** `GET /user/certificates`

**Authentication Required:** Yes

### Query Parameters

| Parameter | Type   | Required | Description                    |
| --------- | ------ | -------- | ------------------------------ |
| skip      | number | No       | Pagination: skip N items       |
| limit     | number | No       | Pagination: return max N items |

### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Certificates",
  "data": [
    {
      "id": "cert-d50e8400-e29b-41d4-a716-446655440009",
      "issuer": "Google Cloud",
      "title": "Google Cloud Professional Cloud Architect",
      "issue_date": "2023-06-15",
      "expiry_date": "2025-06-15",
      "skills": ["Cloud Architecture", "GCP"],
      "is_verified": 1,
      "created_at": "2026-01-11T15:30:00.000Z"
    }
  ]
}
```

---

## 8. Delete Certificate

**Name:** Delete Certificate

**Description:** Removes a certificate from your portfolio. Verified certificates cannot be deleted.

**Route:** `DELETE /user/certificates/:id`

**Authentication Required:** Yes

### Error Response - Verified Certificate

```json
{
  "status": "error",
  "statusCode": 403,
  "message": "Cannot delete a verified certificate"
}
```

---

## Examples

### Complete Portfolio Setup

This example shows creating a complete portfolio with projects and certificates.

```javascript
// 1. Add featured projects
const projects = [
  {
    title: "E-commerce Platform",
    technologies: ["React", "Node.js"],
    demo_url: "https://ecommerce-demo.johndoe.com",
    is_featured: true,
  },
  {
    title: "Data Analytics Dashboard",
    technologies: ["Python", "Dash", "PostgreSQL"],
    demo_url: "https://analytics-demo.johndoe.com",
    is_featured: true,
  },
];

for (const proj of projects) {
  await createProject(accessToken, proj);
}

// 2. Add certifications
const certs = [
  {
    issuer: "Google Cloud",
    title: "Professional Cloud Architect",
    issue_date: "2023-06-15",
  },
  {
    issuer: "Coursera",
    title: "Advanced Data Science",
    issue_date: "2023-05-20",
  },
];

for (const cert of certs) {
  await createCertificate(accessToken, cert);
}

// 3. Retrieve all portfolio items
const [projectList, certList] = await Promise.all([
  fetch("https://identity.syncnexa.com/api/v1/user/projects", {
    headers: { Authorization: `Bearer ${accessToken}` },
  }).then((r) => r.json()),
  fetch("https://identity.syncnexa.com/api/v1/user/certificates", {
    headers: { Authorization: `Bearer ${accessToken}` },
  }).then((r) => r.json()),
]);

console.log(
  `Portfolio: ${projectList.data.length} projects, ${certList.data.length} certificates`,
);
```

### Python Example: Portfolio Summary

```python
import requests

class PortfolioManager:
    def __init__(self, access_token):
        self.base_url = 'https://identity.syncnexa.com/api/v1'
        self.headers = {'Authorization': f'Bearer {access_token}'}

    def get_portfolio_summary(self):
        """Get portfolio statistics"""
        projects = requests.get(
            f'{self.base_url}/user/projects',
            headers=self.headers
        ).json()['data']

        certs = requests.get(
            f'{self.base_url}/user/certificates',
            headers=self.headers
        ).json()['data']

        featured = len([p for p in projects if p.get('is_featured')])
        verified_certs = len([c for c in certs if c.get('is_verified')])

        return {
            'total_projects': len(projects),
            'featured_projects': featured,
            'total_certificates': len(certs),
            'verified_certificates': verified_certs,
            'technologies': list(set(
                tech for proj in projects
                for tech in proj.get('technologies', [])
            )),
            'skills': list(set(
                skill for cert in certs
                for skill in cert.get('skills', [])
            ))
        }

# Usage
manager = PortfolioManager(access_token)
summary = manager.get_portfolio_summary()
print(f"Portfolio Summary:")
print(f"  Projects: {summary['total_projects']} ({summary['featured_projects']} featured)")
print(f"  Certificates: {summary['total_certificates']} ({summary['verified_certificates']} verified)")
print(f"  Technologies: {', '.join(summary['technologies'][:5])}")
```

---

## Best Practices

### Project Management

- Feature only your best 3-5 projects
- Include working links (demo or repo)
- Write detailed descriptions
- List relevant technologies
- Update achievements regularly

### Certificate Management

- Keep certifications current
- Add expiration dates
- Include verification URLs
- List relevant skills
- Remove expired certificates

### Portfolio Quality

- Use professional language
- Proofread all descriptions
- Keep metadata organized
- Update regularly with new work

---

## Related Features

- **[Academic Records](/docs/student/academic-records)** - Educational background
- **[Documents](/docs/student/documents)** - Identity verification
- **[Shareable Links](/docs/student/shareable-links)** - Share your portfolio
