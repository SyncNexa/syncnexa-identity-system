# Shareable Links

Complete documentation for creating and managing public shareable links to your profile.

---

## Overview

Shareable Links allow you to generate public URLs that give controlled access to specific sections of your profile without requiring authentication. Use shareable links to share your portfolio, academic records, or complete profile with recruiters, educational institutions, or other parties.

**Use Cases:**

- Share portfolio with recruiters
- Create public profile link for social sharing
- Allow institutions to view your credentials
- Generate unique URLs for different purposes
- Control what information is publicly accessible

**Authentication:** Link creation requires authentication; link validation doesn't.

---

## 1. Create Shareable Link

**Name:** Create Shareable Link

**Description:** Generates a shareable public link with controlled access to specific profile sections.

**Route:** `POST /user/shareable-links`

**Authentication Required:** Yes

### Request Payload

```json
{
  "token": "custom-portfolio-link-2024",
  "resource_type": "profile",
  "resource_id": null,
  "scope": {
    "sections": ["bio", "education", "projects", "certificates"],
    "permissions": ["read"]
  },
  "expires_at": "2026-12-31T23:59:59.000Z",
  "max_views": 100,
  "metadata": {
    "campaign": "job_search_2024",
    "contact": "recruiter@techcorp.com"
  }
}
```

### Field Requirements

| Field         | Type   | Required | Description                                       |
| ------------- | ------ | -------- | ------------------------------------------------- |
| token         | string | No       | Custom URL token (auto-generated if not provided) |
| resource_type | string | Yes      | "profile", "portfolio", "academic", or "document" |
| resource_id   | string | No       | Specific resource ID (null for entire profile)    |
| scope         | object | No       | What sections can be accessed                     |
| expires_at    | string | No       | Expiration date (YYYY-MM-DDTHH:mm:ss.000Z)        |
| max_views     | number | No       | Maximum number of views allowed                   |
| metadata      | object | No       | Custom metadata/context                           |

### Scope Options

| Section      | Description                             |
| ------------ | --------------------------------------- |
| bio          | Basic profile info (name, email, phone) |
| education    | Academic records and institutions       |
| projects     | Portfolio projects                      |
| certificates | Professional certificates               |
| documents    | Identity documents (if verified)        |
| all          | All accessible sections                 |

### Request Example (JavaScript)

```javascript
async function createShareableLink(accessToken, linkData) {
  const response = await fetch(
    "https://identity.syncnexa.com/api/v1/user/shareable-links",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(linkData),
    },
  );

  return await response.json();
}

// Usage - Create portfolio link for job search
const link = await createShareableLink(accessToken, {
  token: "my-portfolio-2024",
  resource_type: "profile",
  scope: {
    sections: ["bio", "education", "projects", "certificates"],
    permissions: ["read"],
  },
  expires_at: "2026-12-31T23:59:59.000Z",
  max_views: 1000,
  metadata: {
    campaign: "job_search_2024",
  },
});

console.log("Public URL:", link.data.public_url);
```

### Request Example (cURL)

```bash
curl -X POST https://identity.syncnexa.com/api/v1/user/shareable-links \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "resource_type": "profile",
    "scope": {
      "sections": ["bio", "education", "projects"],
      "permissions": ["read"]
    },
    "max_views": 500
  }'
```

### Success Response (201 Created)

```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Shareable link created",
  "data": {
    "id": "link-f50e8400-e29b-41d4-a716-446655440011",
    "user_id": "user-123e4567-e89b-12d3-a456-426614174000",
    "token": "custom-portfolio-link-2024",
    "resource_type": "profile",
    "resource_id": null,
    "scope": {
      "sections": ["bio", "education", "projects", "certificates"],
      "permissions": ["read"]
    },
    "expires_at": "2026-12-31T23:59:59.000Z",
    "max_views": 100,
    "views_count": 0,
    "is_revoked": false,
    "public_url": "https://identity.syncnexa.com/shared/custom-portfolio-link-2024",
    "created_at": "2026-01-11T16:30:00.000Z"
  }
}
```

### Error Responses

#### 400 Bad Request - Token Already Exists

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "This token is already in use. Choose a different token."
}
```

#### 400 Bad Request - Invalid Token Format

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "token",
      "message": "Token must be 3-50 alphanumeric characters"
    }
  ]
}
```

---

## 2. Retrieve Shareable Links

**Name:** List My Shareable Links

**Description:** Lists all shareable links you've created.

**Route:** `GET /user/shareable-links`

**Authentication Required:** Yes

### Query Parameters

| Parameter | Type    | Required | Description                    |
| --------- | ------- | -------- | ------------------------------ |
| active    | boolean | No       | Filter by active status        |
| skip      | number  | No       | Pagination: skip N items       |
| limit     | number  | No       | Pagination: return max N items |

### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Shareable links",
  "data": [
    {
      "id": "link-f50e8400-e29b-41d4-a716-446655440011",
      "token": "custom-portfolio-link-2024",
      "resource_type": "profile",
      "public_url": "https://identity.syncnexa.com/shared/custom-portfolio-link-2024",
      "expires_at": "2026-12-31T23:59:59.000Z",
      "is_revoked": false,
      "views_count": 15,
      "max_views": 100,
      "created_at": "2026-01-11T16:30:00.000Z"
    }
  ]
}
```

---

## 3. Get Link Details

**Name:** Get Shareable Link Details

**Description:** Retrieves detailed information about a specific shareable link.

**Route:** `GET /user/shareable-links/:id`

**Authentication Required:** Yes

### Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Shareable link",
  "data": {
    "id": "link-f50e8400-e29b-41d4-a716-446655440011",
    "token": "custom-portfolio-link-2024",
    "resource_type": "profile",
    "scope": {
      "sections": ["bio", "education", "projects", "certificates"],
      "permissions": ["read"]
    },
    "public_url": "https://identity.syncnexa.com/shared/custom-portfolio-link-2024",
    "expires_at": "2026-12-31T23:59:59.000Z",
    "is_revoked": false,
    "views_count": 15,
    "max_views": 100,
    "last_viewed_at": "2026-01-20T10:30:00.000Z",
    "metadata": {
      "campaign": "job_search_2024",
      "contact": "recruiter@techcorp.com"
    },
    "created_at": "2026-01-11T16:30:00.000Z"
  }
}
```

---

## 4. Revoke Shareable Link

**Name:** Revoke Shareable Link

**Description:** Immediately disables a shareable link, making the URL inaccessible.

**Route:** `PATCH /user/shareable-links/:id/revoke`

**Authentication Required:** Yes

### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Link revoked"
}
```

### Error Response - Already Revoked

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Link is already revoked"
}
```

---

## 5. View Shareable Link (Public)

**Name:** View Shared Profile

**Description:** Publicly accesses a shareable link without authentication. This is what recipients see.

**Route:** `GET /shared/:token`

**Authentication Required:** No

### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Shared profile",
  "data": {
    "profile": {
      "bio": {
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com"
      },
      "education": [
        {
          "institution": "University of Lagos",
          "degree": "Bachelor of Science",
          "field_of_study": "Computer Science"
        }
      ],
      "projects": [
        {
          "title": "E-commerce Platform",
          "description": "Full-stack e-commerce...",
          "demo_url": "https://demo.example.com"
        }
      ]
    }
  }
}
```

### Error Responses

#### 404 Not Found - Link Doesn't Exist

```json
{
  "status": "error",
  "statusCode": 404,
  "message": "Link not found"
}
```

#### 410 Gone - Link Revoked

```json
{
  "status": "error",
  "statusCode": 410,
  "message": "This link has been revoked"
}
```

#### 410 Gone - Link Expired

```json
{
  "status": "error",
  "statusCode": 410,
  "message": "This link has expired"
}
```

#### 429 Too Many Requests - Max Views Exceeded

```json
{
  "status": "error",
  "statusCode": 429,
  "message": "Maximum views for this link have been exceeded"
}
```

---

## Examples

### Create and Share Portfolio Link

```javascript
// 1. Create a portfolio link
const linkResponse = await fetch(
  "https://identity.syncnexa.com/api/v1/user/shareable-links",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token: `portfolio-${Date.now()}`,
      resource_type: "profile",
      scope: {
        sections: ["bio", "education", "projects", "certificates"],
        permissions: ["read"],
      },
      max_views: 500,
      metadata: {
        campaign: "job_search",
        created_for: "recruiter",
      },
    }),
  },
);

const linkData = await linkResponse.json();
const shareUrl = linkData.data.public_url;

// 2. Generate QR code (using external library)
const QRCode = require("qrcode");
const qrCode = await QRCode.toDataURL(shareUrl);

// 3. Create a beautiful share card
const shareCard = document.getElementById("share-card");
shareCard.innerHTML = `
  <div class="card">
    <h3>Share Your Profile</h3>
    <img src="${qrCode}" alt="QR Code" width="200" />
    <p>Share this link:</p>
    <input type="text" value="${shareUrl}" readonly />
    <button onclick="copyToClipboard('${shareUrl}')">Copy Link</button>
  </div>
`;

// 4. Check link analytics
setInterval(async () => {
  const analyticsResponse = await fetch(
    `https://identity.syncnexa.com/api/v1/user/shareable-links/${linkData.data.id}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  const analytics = await analyticsResponse.json();
  console.log(
    `Link views: ${analytics.data.views_count}/${analytics.data.max_views}`,
  );
}, 60000); // Check every minute
```

### Python Example: Multi-Purpose Links

```python
import requests
from datetime import datetime, timedelta

class LinkManager:
    def __init__(self, access_token):
        self.base_url = 'https://identity.syncnexa.com/api/v1'
        self.headers = {'Authorization': f'Bearer {access_token}'}

    def create_campaign_links(self, campaigns):
        """Create links for different recruitment campaigns"""
        results = []

        for campaign in campaigns:
            expires = datetime.now() + timedelta(days=campaign.get('duration_days', 90))

            response = requests.post(
                f'{self.base_url}/user/shareable-links',
                headers=self.headers,
                json={
                    'token': campaign['token'],
                    'resource_type': 'profile',
                    'scope': {
                        'sections': campaign.get('sections', ['bio', 'education', 'projects']),
                        'permissions': ['read']
                    },
                    'max_views': campaign.get('max_views', 1000),
                    'expires_at': expires.isoformat() + 'Z',
                    'metadata': {
                        'campaign': campaign['name'],
                        'company': campaign.get('company', 'Unknown')
                    }
                }
            )

            if response.status_code == 201:
                link = response.json()['data']
                results.append({
                    'campaign': campaign['name'],
                    'url': link['public_url'],
                    'created': link['created_at']
                })
            else:
                results.append({
                    'campaign': campaign['name'],
                    'error': response.json()['message']
                })

        return results

    def cleanup_old_links(self, days_old=30):
        """Revoke links older than N days"""
        response = requests.get(
            f'{self.base_url}/user/shareable-links',
            headers=self.headers
        )

        links = response.json()['data']
        threshold = datetime.now() - timedelta(days=days_old)
        revoked = []

        for link in links:
            created = datetime.fromisoformat(link['created_at'].replace('Z', '+00:00'))
            if created.replace(tzinfo=None) < threshold and not link['is_revoked']:
                revoke_response = requests.patch(
                    f'{self.base_url}/user/shareable-links/{link["id"]}/revoke',
                    headers=self.headers
                )
                if revoke_response.status_code == 200:
                    revoked.append(link['token'])

        return revoked

# Usage
manager = LinkManager(access_token)

# Create links for multiple campaigns
campaigns = [
    {
        'name': 'Tech Company 1',
        'token': 'tech-company-1-2024',
        'company': 'TechCorp Nigeria',
        'max_views': 100,
        'duration_days': 30
    },
    {
        'name': 'Startup Recruitment',
        'token': 'startup-2024',
        'max_views': 500,
        'sections': ['bio', 'projects', 'certificates']
    }
]

results = manager.create_campaign_links(campaigns)
for result in results:
    if 'url' in result:
        print(f"{result['campaign']}: {result['url']}")
    else:
        print(f"{result['campaign']}: {result['error']}")

# Clean up old links
revoked = manager.cleanup_old_links(days_old=90)
print(f"Revoked {len(revoked)} old links")
```

---

## Best Practices

### Link Creation

- Use descriptive tokens (e.g., "portfolio-techcorp-2024")
- Set appropriate expiration dates
- Limit views to prevent oversharing
- Include metadata for tracking
- Create separate links for different purposes

### Privacy & Security

- Only share sections that are relevant
- Set max_views to limit exposure
- Use read-only permissions
- Revoke links when no longer needed
- Don't include sensitive information

### Link Management

- Keep track of created links
- Monitor view analytics
- Revoke expired/unused links
- Update links before they expire
- Delete links after campaign ends

### Sharing Strategy

- Create campaign-specific links
- Track which companies viewed your profile
- Follow up based on engagement
- A/B test different profile versions
- Maintain privacy by sharing selective info

---

## Related Features

- **[Verification Tokens](/docs/student/verification-tokens)** - Controlled credential sharing
- **[Portfolio](/docs/student/portfolio)** - Showcase your work
- **[Academic Records](/docs/student/academic-records)** - Share education history
