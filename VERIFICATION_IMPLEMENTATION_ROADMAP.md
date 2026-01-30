# Verification System - Implementation Roadmap

## Overview

The verification system consists of 4 pillars, each worth 25% of the overall verification score. A student is 100% verified when all 4 pillars are verified.

### Automatic Initialization

The verification center is **automatically initialized** when a student account is created during signup. All 4 pillars are created with their respective verification steps immediately. If the student verifies their email during signup, the Contact Verification step is automatically marked as verified.

---

## Pillar 1: Personal Info Verification (25%)

**Purpose**: Is this a real, unique person we can reliably identify and contact?

### Step 1.1: Face Match

- **Type**: Automatic
- **Order**: 1
- **Status Types**: Not Verified → Pending → Verified / Failed
- **Requirements**:
  - [ ] Clear selfie photo
  - [ ] Neutral facial expression
  - [ ] Adequate lighting
  - [ ] Face must match government ID photo

**Implementation Notes**:

- User can retry automatically up to 3 times
- Beyond that → manual admin review
- Integration needed: Face recognition API (e.g., AWS Rekognition, Google Vision)
- Status Messages:
  - Low image quality — face not clearly visible
  - Under manual review
  - Face verified successfully

---

### Step 1.2: Contact Verification

- **Type**: Automatic
- **Order**: 2
- **Status Types**: Not Verified → Pending → Verified / Failed
- **Requirements**:
  - [ ] Active email address
  - [ ] Active phone number
  - [ ] OTP confirmation for both

**Implementation Notes**:

- **Email**: Auto-verified if verified during signup
- **Phone**: Requires OTP via SMS
- No "Pending" status - either done or not
- Fast and confidence-building step
- Status Messages:
  - Email not confirmed
  - Phone OTP expired
  - Phone and email confirmed

---

### Step 1.3: Government ID

- **Type**: Manual (Admin Review)
- **Order**: 3
- **Status Types**: Not Verified → Pending → Verified / Failed
- **Requirements**:
  - [ ] Valid government-issued ID
  - [ ] Clear, readable image
  - [ ] Name must match profile
  - [ ] ID must not be expired

**Implementation Notes**:

- User uploads ID (document upload with OCR)
- System auto-validates readability and expiry
- Admin must manually review for identity match
- Can be optional by region but required for:
  - High-trust use cases
  - Long-term validity
- Status Messages:
  - ID number mismatch
  - ID image unreadable
  - Under review by verification team
  - Government ID verified

---

## Pillar 2: Academic Info Verification (25%)

**Purpose**: Does the claimed academic profile make sense and align with reality?

### Step 2.1: Program & Level Validation

- **Type**: Automatic
- **Order**: 1
- **Status Types**: Not Verified → Verified / Failed
- **Requirements**:
  - [ ] Institution selected
  - [ ] Program exists in institution catalog
  - [ ] Level matches program (e.g., BSc ≠ PhD)

**Implementation Notes**:

- Validate against institution database
- Check program catalog for selected institution
- Ensure level alignment with program type
- Status Messages:
  - Program not offered by institution
  - Level does not match program
  - Academic program validated

---

### Step 2.2: Session / Enrollment Logic Check

- **Type**: Automatic
- **Order**: 2
- **Status Types**: Not Verified → Verified / Failed
- **Requirements**:
  - [ ] Academic session provided
  - [ ] Enrollment year plausible
  - [ ] Status aligns with current date

**Implementation Notes**:

- Validate academic session format (e.g., 2023/2024)
- Check enrollment year is reasonable (not in future, not >10 years ago)
- Verify status makes sense for current date (e.g., can't be "graduating" if just enrolled)
- Status Messages:
  - Enrollment session is invalid
  - Academic timeline inconsistent
  - Enrollment timeline verified

---

## Pillar 3: Document Verification (25%)

**Purpose**: Is there institutional evidence backing the claim?

### Step 3.1: Document Upload & Readability

- **Type**: Automatic
- **Order**: 1
- **Status Types**: Not Verified → Verified / Failed
- **Requirements**:
  - [ ] Supported file type (PDF/JPG/PNG)
  - [ ] Text readable (OCR must extract text)
  - [ ] No major cropping

**Implementation Notes**:

- File validation (MIME type, size limits)
- OCR extraction to verify readability
- Image quality checks for cropping/rotation
- Status Messages:
  - Document unreadable
  - Unsupported file format
  - Document accepted

---

### Step 3.2: Content Match Check

- **Type**: Automatic (OCR + Rules)
- **Order**: 2
- **Status Types**: Not Verified → Verified / Failed
- **Requirements**:
  - [ ] Name matches profile
  - [ ] Institution matches selected school
  - [ ] Session/year matches academic info

**Implementation Notes**:

- Extract text via OCR
- Fuzzy match name against profile (allow minor variations)
- Validate institution name appears in document
- Verify session/year aligns with academic info
- Status Messages:
  - Institution name mismatch
  - Session does not match profile
  - Document details verified

---

### Step 3.3: Freshness Validation

- **Type**: Automatic
- **Order**: 3
- **Status Types**: Failed / Verified
- **Requirements**:
  - [ ] Document from current session/year
  - [ ] Within allowed validity window

**Implementation Notes**:

- Extract issue/effective date from document
- Check document is from current academic session
- No "Pending" status for this step
- Status Messages:
  - Document is outdated
  - Document is current

---

## Pillar 4: School Verification (25%)

**Purpose**: Did the institution itself confirm this student?

### Step 4.1: Direct School Verification (Best)

- **Type**: External
- **Order**: 1
- **Status Types**: Not Verified → Verified / Failed
- **Requirements**:
  - [ ] Portal login OR
  - [ ] Verification code OR
  - [ ] School-issued confirmation

**Implementation Notes**:

- Integration with institution verification APIs
- Can be portal login, verification code, or email confirmation from institution
- Best method for high confidence
- Status Messages (varies by institution)

---

### Step 4.2: School Email Verification

- **Type**: Automatic
- **Order**: 2
- **Status Types**: Not Verified → Verified / Failed
- **Requirements**:
  - [ ] Active school email
  - [ ] OTP verification
  - [ ] Domain matches institution

**Implementation Notes**:

- Extract email from document
- Verify domain matches known institutional domain
- Send OTP to school email
- User confirms OTP
- Status Messages:
  - Email domain not recognized
  - Email not confirmed
  - School email verified

---

### Step 4.3: Admin Attestation (Fallback)

- **Type**: Manual
- **Order**: 3
- **Status Types**: Pending → Verified / Failed
- **Requirements**:
  - [ ] Consistent documents
  - [ ] Academic info validated
  - [ ] Institution is trusted

**Implementation Notes**:

- Used as fallback when direct/email verification unavailable
- Admin manually reviews:
  - Document consistency
  - Academic info completeness
  - Institution trustworthiness
- Status Messages:
  - Under verification team review
  - School verified by admin
  - Verification failed - resubmit documents

---

## Implementation Priority

### Phase 1 (High Priority)

1. Database schema and models
2. Service layer and controllers
3. Auto email verification on signup
4. **Contact Verification - Phone OTP** (implement SMS OTP)
5. **Document Upload & Readability** (integrate OCR library - Tesseract/AWS Textract)
6. **Content Match Check** (fuzzy matching logic)

### Phase 2 (Medium Priority)

1. **Face Match** (integrate face recognition API)
2. **Program & Level Validation** (build institution catalog)
3. **Session / Enrollment Logic Check** (validation rules)
4. **Government ID** (OCR + expiry validation + admin review UI)

### Phase 3 (Lower Priority / Advanced)

1. **Freshness Validation** (date extraction from documents)
2. **Direct School Verification** (institution API integrations)
3. **School Email Verification** (school domain database)
4. **Admin Attestation** (admin dashboard UI)

---

## Database Tables Reference

- `verification_pillars` - Tracks the 4 main pillars
- `verification_steps` - Individual verification steps
- `verification_step_evidence` - Evidence uploads
- `verification_audit_log` - Audit trail

---

## API Endpoints Summary

### User Endpoints

**Verification Center Management**:

- `POST /api/user/verification-center/initialize` - Initialize verification center for new user
- `GET /api/user/verification-center` - Get full verification center overview
- `GET /api/user/verification-center/pillar/:pillar` - Get specific pillar details with all steps
  - Params: `pillar` - One of: `personal_info`, `academic_info`, `documents`, `school`

**Step Management**:

- `PATCH /api/user/verification-center/step/:stepId/status` - Update step status (user-initiated)
  - Body: `{ status, status_message?, failure_reason?, failure_suggestion? }`
- `POST /api/user/verification-center/step/:stepId/retry` - Retry failed step (up to 3 attempts)
- `POST /api/user/verification-center/step/:stepId/evidence` - Upload evidence for a step
  - Body: `{ evidence_type, evidence_url, evidence_metadata? }`

### Admin Endpoints

**Verification Review**:

- `POST /api/user/verification-center/admin/step/:stepId/review` - Review and approve/reject step
  - Body: `{ status: "verified" | "failed", notes }`
- `GET /api/admin/verification-center/pending` - List all users with pending verification steps
  - Query: `{ page?, limit?, pillar?, step_name? }`
- `GET /api/admin/verification-center/user/:userId` - Get user's full verification status
- `GET /api/admin/verification-center/step/:stepId` - Get detailed step info with evidence
- `GET /api/admin/verification-center/step/:stepId/evidence` - Get all evidence for a step

**Bulk Operations** (Planned):

- `POST /api/admin/verification-center/batch-review` - Batch review multiple steps at once
  - Body: `{ reviews: [{ stepId, status, notes }] }`

---

## Status Flow

```
Not Verified
    ↓
Pending (if manual review needed)
    ↓
Verified ✅ or Failed ❌
    ↓
(If Failed) Can Retry (up to 3 times)
    ↓
(After max retries) Admin Review
```

---

## Next Steps

- [ ] Implement Phase 1 requirements
- [ ] Create admin dashboard for step management
- [ ] Set up notification system for status updates
- [ ] Build institution catalog/database
- [ ] Integrate third-party APIs (face recognition, OCR, SMS)
- [ ] Create comprehensive admin documentation
