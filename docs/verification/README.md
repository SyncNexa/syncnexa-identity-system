# Verification

Complete documentation for document verification, credential validation, and institutional verification processes.

---

## Overview

The Verification section covers all aspects of validating identity documents, academic credentials, and institutional records. SyncNexa provides comprehensive verification workflows including document validation, institution-based verification requests, and automated credential authentication.

**Key Features:**

- Identity document verification (KYC)
- Academic credential validation
- Institution verification requests
- Employment history verification
- Automated and manual review processes
- Verification status tracking

---

## Verification Features

### Core Features

1. **[Document Verification](/docs/verification/document-verification)** - Identity and official document validation
   - Submit documents for KYC verification
   - Track verification status
   - Manual and automated review
   - Multi-document verification support
   - Verification status dashboard

2. **[Academic Records Verification](/docs/verification/academic-records)** - Educational credential validation
   - Request institution verification
   - Academic record authentication
   - Degree and GPA verification
   - Employment history confirmation
   - Third-party verification requests

---

## Quick Navigation

| Feature               | Purpose                        | Documentation                                           |
| --------------------- | ------------------------------ | ------------------------------------------------------- |
| Document Verification | Validate identity documents    | [Get Started](/docs/verification/document-verification) |
| Academic Verification | Verify educational credentials | [Get Started](/docs/verification/academic-records)      |

---

## Common Patterns

### Authentication

All verification endpoints require authentication via Bearer token:

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
  "data": {
    /* endpoint-specific data */
  }
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

---

## Verification Workflows

### Document Verification Flow

```
┌─────────────────┐
│  Upload Doc     │
│  (Identity)     │
└────────┬────────┘
         │
         ├─ POST /user/documents
         │  (file, type, metadata)
         ▼
┌─────────────────┐
│ Document Stored │
│ is_verified:    │
│   false         │
└────────┬────────┘
         │
         ├─ POST /user/documents/:id/verify
         │  (notes, metadata)
         ▼
┌─────────────────┐
│ Verification    │
│ Request Created │
│ Status: pending │
└────────┬────────┘
         │
         ├─ Reviewer checks document
         ▼
┌─────────────────────────┐
│ Manual/Automated Review │
│ - Check authenticity    │
│ - Validate details      │
│ - Compare data          │
└────────┬────────────────┘
         │
         ├─ Decision: Approve/Reject
         ▼
┌──────────────────────┐
│ Verification Result  │
│ Status: approved or  │
│         rejected     │
│ is_verified: true    │
└──────────────────────┘
```

### Institution Verification Flow

```
┌─────────────────────┐
│  User submits       │
│  verification       │
│  request            │
└──────────┬──────────┘
           │
           ├─ POST /user/verification-requests
           │  (institution, details, message)
           ▼
┌──────────────────────────────┐
│ Request Created              │
│ Email sent to institution    │
│ Status: pending              │
└──────────┬───────────────────┘
           │
           ├─ Institution receives email
           │  with verification token
           ▼
┌──────────────────────────────┐
│ Institution Reviews          │
│ - Checks records             │
│ - Validates credentials      │
│ - Confirms details           │
└──────────┬───────────────────┘
           │
           ├─ Institution responds via link
           ▼
┌──────────────────────────────┐
│ Verification Response        │
│ Status: approved/rejected    │
│ Institution notes included   │
└──────────────────────────────┘
```

---

## Verification Statuses

### Document Verification Statuses

| Status             | Description                    | Next Action               |
| ------------------ | ------------------------------ | ------------------------- |
| pending            | Awaiting review                | Wait for reviewer         |
| review_in_progress | Reviewer is checking           | Wait for completion       |
| approved           | Document verified successfully | No action needed          |
| rejected           | Document rejected              | Resubmit with corrections |
| escalated          | Flagged for manual review      | Wait for specialist       |

### Institution Verification Statuses

| Status    | Description                          | Next Action                |
| --------- | ------------------------------------ | -------------------------- |
| pending   | Institution hasn't responded         | Wait or follow up          |
| approved  | Institution confirmed credentials    | No action needed           |
| rejected  | Institution couldn't verify          | Check details and resubmit |
| expired   | Verification token expired (30 days) | Submit new request         |
| cancelled | User cancelled request               | Submit new if needed       |

---

## Verification Types

### Document Types

| Type              | Description            | Verification Method |
| ----------------- | ---------------------- | ------------------- |
| national_id       | National ID card       | Manual + OCR        |
| passport          | International passport | Manual + MRZ scan   |
| drivers_license   | Driver's license       | Manual + OCR        |
| birth_certificate | Birth certificate      | Manual review       |
| utility_bill      | Proof of address       | Manual review       |

### Institution Request Types

| Type         | Description              | Typical Verifier     |
| ------------ | ------------------------ | -------------------- |
| academic     | Degree, GPA, graduation  | University registrar |
| employment   | Job title, dates, duties | HR department        |
| professional | Certifications, licenses | Licensing bodies     |

---

## API Endpoints Reference

### Document Verification

| Method | Endpoint                           | Purpose                         | Auth |
| ------ | ---------------------------------- | ------------------------------- | ---- |
| POST   | `/user/documents/:id/verify`       | Request document verification   | Yes  |
| GET    | `/user/documents/:id/verification` | Get verification status         | Yes  |
| GET    | `/user/verification-status`        | Get overall verification status | Yes  |

### Institution Verification

| Method | Endpoint                          | Purpose                     | Auth |
| ------ | --------------------------------- | --------------------------- | ---- |
| POST   | `/user/verification-requests`     | Create verification request | Yes  |
| GET    | `/user/verification-requests/:id` | Get request status          | Yes  |
| GET    | `/user/verification-requests`     | List all requests           | Yes  |
| DELETE | `/user/verification-requests/:id` | Cancel request              | Yes  |

---

## Common Use Cases

### KYC Compliance Workflow

```javascript
// 1. Upload required documents
const nationalIdDoc = await uploadDocument(nationalIdFile, "national_id");
const proofOfAddress = await uploadDocument(utilityBill, "utility_bill");

// 2. Request verification for both
await requestVerification(nationalIdDoc.id, "KYC compliance - account upgrade");
await requestVerification(proofOfAddress.id, "Address verification");

// 3. Monitor status
const status = await getOverallVerificationStatus();
if (status.overall_status === "fully_verified") {
  console.log("KYC complete! Account upgraded.");
}
```

### Academic Verification for Employment

```javascript
// 1. Request institution verification
const academicVerification = await requestInstitutionVerification({
  institution_name: "University of Lagos",
  institution_email: "registrar@unilag.edu.ng",
  request_type: "academic",
  details: {
    degree: "B.Sc Computer Science",
    graduation_year: "2022",
    student_id: "UL/18/CS/1234",
  },
  message: "Employment verification for TechCorp Nigeria",
});

// 2. Share verification token with employer
const verificationToken = academicVerification.verification_token;
shareWithEmployer(verificationToken);

// 3. Monitor until approved
await monitorVerificationStatus(academicVerification.id);
```

### Multi-Document Batch Verification

```javascript
async function batchVerifyDocuments(documentIds) {
  const results = [];

  for (const docId of documentIds) {
    const verification = await fetch(
      `https://identity.syncnexa.com/api/v1/user/documents/${docId}/verify`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notes: "Batch verification for account setup",
          metadata: { batch: true },
        }),
      },
    );

    results.push(await verification.json());
  }

  return results;
}

// Usage
const docIds = ["doc-1", "doc-2", "doc-3"];
const verifications = await batchVerifyDocuments(docIds);
```

---

## Best Practices

### Document Submission

- **High Quality:** Use clear, high-resolution scans
- **Complete Information:** Ensure all details are visible
- **Valid Documents:** Check expiration dates before submission
- **Correct Type:** Select proper document type
- **Supporting Docs:** Provide additional context if needed

### Verification Requests

- **Accurate Details:** Double-check all information
- **Official Contacts:** Use official institutional emails
- **Professional Tone:** Write clear, professional messages
- **Context:** Explain why verification is needed
- **Follow Timeline:** Check typical response times

### Status Monitoring

- **Regular Checks:** Check status periodically (don't spam)
- **Set Alerts:** Use webhooks or notifications
- **Handle Rejections:** Quickly address and resubmit
- **Track Timeline:** Note average verification times
- **Keep Records:** Save all verification responses

### Error Handling

- **Retry Logic:** Implement exponential backoff
- **User Feedback:** Show clear status messages
- **Handle Timeouts:** Set reasonable timeout limits
- **Network Errors:** Gracefully handle failures
- **Rate Limiting:** Respect API rate limits

---

## Security Considerations

### Document Security

- **Encryption:** All documents encrypted at rest
- **Access Control:** Role-based access restrictions
- **Audit Logging:** All access logged
- **Secure Storage:** Documents stored in secure storage
- **Retention Policy:** Documents retained per compliance

### Verification Security

- **Token Expiration:** Verification tokens expire after 30 days
- **One-Time Use:** Verification responses are immutable
- **Secure Communication:** All verification emails use HTTPS links
- **Authentication Required:** All endpoints require valid tokens
- **Rate Limiting:** Prevent abuse with rate limits

### Privacy Protection

- **Data Minimization:** Only required data collected
- **User Consent:** Verification requires explicit consent
- **Third-Party Sharing:** Controlled by user permissions
- **Data Deletion:** Users can delete verification records
- **GDPR Compliance:** Full GDPR compliance

---

## Troubleshooting

### Common Issues

| Issue                         | Cause                 | Solution                         |
| ----------------------------- | --------------------- | -------------------------------- |
| Verification stuck in pending | Reviewer backlog      | Wait or escalate                 |
| Document rejected             | Quality issues        | Resubmit higher quality scan     |
| Institution not responding    | Email bounced or spam | Verify email and resend          |
| Token expired                 | 30-day limit exceeded | Submit new request               |
| Cannot cancel request         | Already completed     | Cannot cancel completed requests |

### Debug Checklist

- [ ] Document is clear and legible
- [ ] All details are visible
- [ ] Document is not expired
- [ ] Correct document type selected
- [ ] Institution email is correct
- [ ] Request details match records
- [ ] Verification token not expired
- [ ] Network connectivity is good

---

## Verification Metrics

### Performance Indicators

| Metric                    | Description                      | Target             |
| ------------------------- | -------------------------------- | ------------------ |
| Average Review Time       | Time from submission to decision | < 24 hours         |
| Approval Rate             | % of documents approved          | > 90%              |
| Resubmission Rate         | % requiring resubmission         | < 10%              |
| Institution Response Time | Time for institution to respond  | 5-10 business days |
| Verification Success Rate | % of successful verifications    | > 95%              |

---

## Related Documentation

- **[Documents](/docs/student/documents)** - Upload and manage documents
- **[Academic Records](/docs/student/academic-records)** - Manage academic history
- **[Verification Tokens](/docs/student/verification-tokens)** - Share verified credentials
- **[Student Card](/docs/student/student-card)** - Digital ID card
