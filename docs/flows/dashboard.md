# Dashboard Flow

Complete documentation for the student dashboard endpoints, including metrics, profile completion tracking, and personalized suggestions.

---

## Overview

The Dashboard Flow provides students with comprehensive insights into their profile status, completion progress, and actionable recommendations for improving their profile. It aggregates data from multiple sources to present a unified view of the student's academic identity.

**Authentication:** All endpoints require authentication via Bearer token in the Authorization header.

---

## Table of Contents

1. [Get Dashboard Metrics](#1-get-dashboard-metrics)
2. [Get Profile Progress](#2-get-profile-progress)
3. [Get Progress Suggestions](#3-get-progress-suggestions)

---

## 1. Get Dashboard Metrics

**Name:** Get Dashboard Overview Metrics

**Description:** Retrieves comprehensive dashboard metrics including counts of documents, academic records, institution verifications, portfolio items, and profile status. This endpoint provides a quick snapshot of the student's overall profile health and activity.

**Route:** `GET /dashboard` (or similar endpoint - check your routes)

**Authentication Required:** Yes

### Request

No query parameters or request body required. User ID is extracted from the Bearer token.

```
GET /api/v1/dashboard
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Dashboard metrics",
  "data": {
    "user_id": "user-123e4567-e89b-12d3-a456-426614174000",
    "metrics": {
      "documents_count": 3,
      "documents_verified": 2,
      "academics_count": 2,
      "transcripts_count": 2,
      "institution_verifications_count": 1,
      "institution_verified": 1,
      "projects_count": 5,
      "certificates_count": 3,
      "certificates_verified": 2,
      "has_student_card": true,
      "has_mfa_enabled": true
    },
    "profile_completion_percent": 85,
    "verification_status": "partially_verified",
    "recent_activity": {
      "last_document_upload": "2026-01-10T14:30:00.000Z",
      "last_profile_update": "2026-01-11T10:15:00.000Z",
      "last_verification_request": "2026-01-09T16:45:00.000Z"
    }
  }
}
```

### Response Fields Explanation

| Field                           | Type    | Description                                    |
| ------------------------------- | ------- | ---------------------------------------------- |
| documents_count                 | number  | Total number of identity documents uploaded    |
| documents_verified              | number  | Number of verified identity documents          |
| academics_count                 | number  | Number of academic records added               |
| transcripts_count               | number  | Number of transcripts uploaded                 |
| institution_verifications_count | number  | Total institution verification requests        |
| institution_verified            | number  | Number of approved institution verifications   |
| projects_count                  | number  | Number of portfolio projects added             |
| certificates_count              | number  | Total certificates added to portfolio          |
| certificates_verified           | number  | Number of verified certificates                |
| has_student_card                | boolean | Whether student has a digital student card     |
| has_mfa_enabled                 | boolean | Whether multi-factor authentication is enabled |
| profile_completion_percent      | number  | Overall profile completion percentage (0-100)  |

### Error Responses

#### 400 Bad Request - Missing User ID

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "user id required"
}
```

**What Happens:** The authentication token is invalid or doesn't contain a user ID. No metrics are returned. User must re-authenticate.

#### 401 Unauthorized

```json
{
  "status": "error",
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**What Happens:** The Bearer token is missing, invalid, or expired. No metrics are returned. User must log in again.

#### 500 Internal Server Error

```json
{
  "status": "error",
  "statusCode": 500,
  "message": "Failed to fetch dashboard"
}
```

**What Happens:** An unexpected error occurred while fetching dashboard metrics (database connection issue, data aggregation error, etc.). No metrics are returned. User should retry after a brief delay.

---

## 2. Get Profile Progress

**Name:** Get Profile Completion Progress

**Description:** Calculates and returns detailed profile completion metrics with a weighted scoring system. The system evaluates multiple aspects of the student's profile and provides a comprehensive completion percentage based on predefined weights for each component.

**Route:** `GET /dashboard/progress`

**Authentication Required:** Yes

### Request

```
GET /api/v1/dashboard/progress
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Completion Scoring Algorithm

The profile completion percentage is calculated using a weighted system:

| Component                    | Weight | Criteria                                                 |
| ---------------------------- | ------ | -------------------------------------------------------- |
| **Documents**                | 15%    | At least 1 verified document (7% for unverified)         |
| **Academic Records**         | 20%    | 1+ academic record with transcript (10% for record only) |
| **Institution Verification** | 15%    | 1+ approved verification (7% for pending)                |
| **Portfolio**                | 20%    | 2+ projects AND 2+ verified certificates (8% partial)    |
| **Student Card**             | 10%    | Digital student card created                             |
| **MFA Security**             | 10%    | Multi-factor authentication enabled                      |
| **CV Readiness**             | 10%    | Has documents, academics, and portfolio items            |

**Maximum Score:** 100%

### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Profile progress",
  "data": {
    "id": "progress-450e8400-e29b-41d4-a716-446655440012",
    "user_id": "user-123e4567-e89b-12d3-a456-426614174000",
    "profile_completion_percent": 85,
    "component_scores": {
      "documents": {
        "score": 15,
        "max_score": 15,
        "status": "complete",
        "details": {
          "total": 3,
          "verified": 2
        }
      },
      "academics": {
        "score": 20,
        "max_score": 20,
        "status": "complete",
        "details": {
          "records": 2,
          "transcripts": 2
        }
      },
      "institution_verification": {
        "score": 15,
        "max_score": 15,
        "status": "complete",
        "details": {
          "total_requests": 1,
          "approved": 1
        }
      },
      "portfolio": {
        "score": 16,
        "max_score": 20,
        "status": "partial",
        "details": {
          "projects": 5,
          "certificates": 3,
          "certificates_verified": 2
        }
      },
      "student_card": {
        "score": 10,
        "max_score": 10,
        "status": "complete"
      },
      "mfa": {
        "score": 10,
        "max_score": 10,
        "status": "complete"
      },
      "cv_readiness": {
        "score": 10,
        "max_score": 10,
        "status": "complete"
      }
    },
    "raw_metrics": {
      "documents_count": 3,
      "documents_verified": 2,
      "academics_count": 2,
      "transcripts_count": 2,
      "institution_verifications_count": 1,
      "institution_verified": 1,
      "projects_count": 5,
      "certificates_count": 3,
      "certificates_verified": 2,
      "has_student_card": 1,
      "has_mfa_enabled": 1
    },
    "last_updated": "2026-01-11T16:30:00.000Z"
  }
}
```

### Component Status Values

| Status       | Description                                         |
| ------------ | --------------------------------------------------- |
| `complete`   | Component fully completed (100% of weight achieved) |
| `partial`    | Component partially completed (50-99% of weight)    |
| `incomplete` | Component not started or minimal progress (<50%)    |

### Progress Calculation Examples

**Example 1: New User (0%)**

- No data uploaded yet
- All components at 0%
- **Total:** 0%

**Example 2: Basic Setup (45%)**

- 1 verified document: 15%
- 1 academic record (no transcript): 10%
- 1 project: 8%
- No card, no MFA, no CV readiness
- **Total:** 33%

**Example 3: Well-Established Profile (85%)**

- 2+ verified documents: 15%
- 1+ academic record with transcript: 20%
- 1+ approved institution verification: 15%
- 5 projects, 2 verified certificates: 16%
- Student card created: 10%
- MFA enabled: 10%
- CV ready: 10%
- **Total:** 96%

### Error Responses

#### 400 Bad Request

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "user id required"
}
```

**What Happens:** Authentication token is invalid or doesn't contain a user ID. No progress data is returned.

#### 401 Unauthorized

```json
{
  "status": "error",
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**What Happens:** Bearer token is missing, invalid, or expired. User must re-authenticate.

#### 500 Internal Server Error

```json
{
  "status": "error",
  "statusCode": 500,
  "message": "Failed to calculate progress"
}
```

**What Happens:** An unexpected error occurred during progress calculation (database error, metrics aggregation failure, etc.). No progress data is returned. User should retry.

---

## 3. Get Progress Suggestions

**Name:** Get Personalized Progress Suggestions

**Description:** Provides personalized, actionable recommendations to help students complete their profiles. The suggestions are dynamically generated based on the current profile state and missing components, prioritizing the most impactful actions.

**Route:** `GET /dashboard/suggestions`

**Authentication Required:** Yes

### Request

```
GET /api/v1/dashboard/suggestions
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Progress suggestions",
  "data": {
    "suggestions": [
      {
        "priority": "high",
        "category": "security",
        "title": "Enable Multi-Factor Authentication",
        "description": "Secure your account with two-factor authentication for enhanced protection",
        "action": {
          "label": "Set up MFA",
          "url": "/settings/security/mfa",
          "method": "POST"
        },
        "impact": "10% profile completion"
      },
      {
        "priority": "high",
        "category": "verification",
        "title": "Request Institution Verification",
        "description": "Get your academic institution to verify your student status for better credibility",
        "action": {
          "label": "Request Verification",
          "url": "/user/verification-requests",
          "method": "POST"
        },
        "impact": "15% profile completion"
      },
      {
        "priority": "medium",
        "category": "portfolio",
        "title": "Add More Certificates",
        "description": "You have 1 certificate. Add at least one more verified certificate to reach 20% portfolio completion",
        "action": {
          "label": "Add Certificate",
          "url": "/user/certificates",
          "method": "POST"
        },
        "impact": "Up to 20% profile completion"
      },
      {
        "priority": "medium",
        "category": "identity",
        "title": "Create Digital Student Card",
        "description": "Generate a digital student card for easy identity verification",
        "action": {
          "label": "Create Card",
          "url": "/user/cards",
          "method": "POST"
        },
        "impact": "10% profile completion"
      },
      {
        "priority": "low",
        "category": "academics",
        "title": "Upload Academic Transcripts",
        "description": "Add transcripts to your academic records for complete academic verification",
        "action": {
          "label": "Upload Transcript",
          "url": "/user/academics/{id}/transcripts",
          "method": "POST"
        },
        "impact": "10% additional profile completion"
      }
    ],
    "profile_completion_percent": 65,
    "next_milestone": {
      "percentage": 75,
      "requirements": [
        "Add 1 more verified certificate",
        "Create digital student card"
      ]
    }
  }
}
```

### Suggestion Categories

| Category       | Description                                   | Typical Priority |
| -------------- | --------------------------------------------- | ---------------- |
| `security`     | Account security improvements (MFA, password) | High             |
| `verification` | Identity and credential verifications         | High             |
| `identity`     | Identity documents and student cards          | High             |
| `academics`    | Academic records and transcripts              | Medium           |
| `portfolio`    | Projects and certificates                     | Medium           |
| `profile`      | Basic profile information                     | Low              |

### Priority Levels

| Priority | Description                                   | When to Show                       |
| -------- | --------------------------------------------- | ---------------------------------- |
| `high`   | Critical for profile credibility and security | Always show first                  |
| `medium` | Important for profile completeness            | Show after high priorities         |
| `low`    | Nice to have for comprehensive profile        | Show when high/medium are complete |

### Suggestion Algorithm Logic

The system generates suggestions based on the following rules:

1. **No Verified Documents (Priority: High)**

   - Suggestion: "Upload and verify at least one identity document"
   - Impact: 15% completion

2. **No Academic Records (Priority: High)**

   - Suggestion: "Add your academic records and institutions"
   - Impact: 20% completion

3. **No Transcripts (Priority: Medium)**

   - Suggestion: "Upload academic transcripts"
   - Impact: 10% additional completion

4. **No Institution Verification (Priority: High)**

   - Suggestion: "Request institution verification"
   - Impact: 15% completion

5. **Incomplete Portfolio (Priority: Medium)**

   - Suggestion: "Add projects and certificates"
   - Impact: Up to 20% completion

6. **No Student Card (Priority: Medium)**

   - Suggestion: "Create digital student card"
   - Impact: 10% completion

7. **No MFA Enabled (Priority: High)**
   - Suggestion: "Enable multi-factor authentication"
   - Impact: 10% completion

### Error Responses

#### 400 Bad Request

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "user id required"
}
```

**What Happens:** Authentication token is invalid or doesn't contain user ID. No suggestions are returned.

#### 401 Unauthorized

```json
{
  "status": "error",
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**What Happens:** Bearer token is missing, invalid, or expired. User must re-authenticate.

#### 500 Internal Server Error

```json
{
  "status": "error",
  "statusCode": 500,
  "message": "Failed to fetch suggestions"
}
```

**What Happens:** An unexpected error occurred while generating suggestions. No suggestions are returned. User should retry.

---

## Dashboard Use Cases

### Use Case 1: New Student Onboarding

**Scenario:** A new student has just registered and wants to understand what they need to do.

**Flow:**

1. Student logs in → Dashboard shows 0% completion
2. Dashboard displays high-priority suggestions:
   - Upload identity document
   - Add academic records
   - Enable MFA
3. Student follows suggestions step by step
4. Dashboard updates in real-time as each action is completed
5. Completion percentage increases with each milestone

**Expected Progression:**

- Start: 0%
- After document upload: 15%
- After academic record + MFA: 35%
- After verification + portfolio: 65%
- Complete profile: 100%

### Use Case 2: Profile Health Check

**Scenario:** An existing student wants to review their profile completeness.

**Flow:**

1. Student navigates to dashboard
2. Views overall metrics and completion percentage
3. Reviews component-wise breakdown
4. Identifies missing or incomplete sections
5. Follows personalized suggestions to improve profile
6. Monitors progress over time

### Use Case 3: Job Application Preparation

**Scenario:** Student is preparing to apply for jobs and needs a complete, verified profile.

**Flow:**

1. Dashboard shows 70% completion
2. Suggestions highlight:
   - Request institution verification (High priority)
   - Add more certificates (Medium priority)
   - Upload transcripts (Medium priority)
3. Student completes high-priority items first
4. Dashboard updates to 90% completion
5. Student is now ready to share profile with employers

---

## Dashboard Widgets (UI Recommendations)

### Widget 1: Profile Completion Gauge

**Visual:** Circular progress indicator showing percentage
**Data:** `profile_completion_percent`
**Color Coding:**

- 0-30%: Red (Critical)
- 31-60%: Orange (Needs Attention)
- 61-80%: Yellow (Good Progress)
- 81-100%: Green (Excellent)

### Widget 2: Metrics Overview Cards

**Layout:** Grid of stat cards
**Cards:**

- Documents (verified/total)
- Academic Records
- Portfolio Items
- Verification Status
- Security Status (MFA badge)

### Widget 3: Recent Activity Timeline

**Visual:** Chronological list of recent actions
**Displays:**

- Last document upload
- Last verification request
- Last profile update
- OAuth app authorizations

### Widget 4: Action Suggestions Panel

**Visual:** Prioritized list with action buttons
**Features:**

- Priority badges (High/Medium/Low)
- Impact indicators
- Quick action buttons
- Progress impact preview

### Widget 5: Completion Breakdown

**Visual:** Horizontal bar chart or stacked progress bar
**Shows:** Component-wise completion scores
**Interactive:** Click to see details and suggestions for each component

---

## Best Practices

### For Frontend Developers

1. **Real-Time Updates:**

   - Refresh dashboard data after any profile update
   - Use optimistic UI updates for better UX
   - Implement polling or WebSocket for live updates

2. **Performance:**

   - Cache dashboard data for 5-10 minutes
   - Use loading skeletons during data fetch
   - Implement pagination for activity lists

3. **User Experience:**

   - Show progress animations when completion increases
   - Celebrate milestones (25%, 50%, 75%, 100%)
   - Provide contextual help for each suggestion

4. **Accessibility:**
   - Ensure progress indicators are accessible
   - Provide text alternatives for visual metrics
   - Support keyboard navigation for actions

### For Students

1. **Optimize Profile:**

   - Follow suggestions in priority order
   - Focus on high-impact actions first
   - Aim for 80%+ completion for credibility

2. **Verification:**

   - Verify documents as soon as possible
   - Request institution verification early
   - Keep certificates up to date

3. **Security:**
   - Enable MFA for account protection
   - Review authorized applications regularly
   - Keep contact information current

### For Administrators

1. **Monitoring:**

   - Track average user completion percentages
   - Identify common bottlenecks
   - Monitor verification request volumes

2. **Optimization:**
   - Adjust scoring weights based on priorities
   - Update suggestion algorithms based on user behavior
   - A/B test different suggestion formats

---

## Calculation Details

### Profile Completion Formula

```
completion_score =
  documents_score (15%) +
  academics_score (20%) +
  institution_score (15%) +
  portfolio_score (20%) +
  card_score (10%) +
  mfa_score (10%) +
  cv_readiness_score (10%)

Max: 100%
```

### Detailed Scoring Logic

```typescript
// Documents: 15% max
if (verified_documents >= 1) score += 15;
else if (total_documents > 0) score += 7;

// Academics: 20% max
if (academic_records >= 1 && transcripts >= 1) score += 20;
else if (academic_records >= 1) score += 10;

// Institution: 15% max
if (institution_verified >= 1) score += 15;
else if (institution_requests >= 1) score += 7;

// Portfolio: 20% max
if (projects >= 2 && verified_certificates >= 2) score += 20;
else if (projects >= 1) score += 8;
else if (verified_certificates >= 1) score += 8;

// Student Card: 10% max
if (has_card) score += 10;

// MFA: 10% max
if (mfa_enabled) score += 10;

// CV Readiness: 10% max
if (has_documents && has_academics && has_portfolio) score += 10;

total = Math.min(100, score);
```

---

## Related Documentation

- [User Management Flow](./user-management.md) - Detailed docs on profile data endpoints
- [Authentication Flow](./authentication.md) - Login and session management
- [Verification Process](../guides/verification-guide.md) - Document and institution verification
- [Security Settings](../security/mfa-setup.md) - Multi-factor authentication guide

---

## API Integration Example

```javascript
// Fetch complete dashboard data
async function loadDashboard() {
  try {
    // 1. Get metrics
    const metricsResponse = await fetch("/api/v1/dashboard", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const { data: metrics } = await metricsResponse.json();

    // 2. Get progress
    const progressResponse = await fetch("/api/v1/dashboard/progress", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const { data: progress } = await progressResponse.json();

    // 3. Get suggestions
    const suggestionsResponse = await fetch("/api/v1/dashboard/suggestions", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const { data: suggestions } = await suggestionsResponse.json();

    // Combine and render
    renderDashboard({
      metrics,
      progress,
      suggestions,
    });
  } catch (error) {
    console.error("Failed to load dashboard:", error);
    showErrorMessage("Unable to load dashboard. Please try again.");
  }
}
```

---

## Troubleshooting

### Issue: Progress Not Updating

**Cause:** Cache not invalidated after profile updates
**Solution:** Implement cache-busting or force refresh after mutations

### Issue: Inaccurate Completion Percentage

**Cause:** Metrics calculation out of sync
**Solution:** Trigger recalculation after any profile data change

### Issue: Missing Suggestions

**Cause:** Progress record not initialized
**Solution:** Ensure progress record is created during user registration

### Issue: Slow Dashboard Load

**Cause:** Too many database queries
**Solution:** Implement data aggregation and caching layer
