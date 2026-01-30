// Verification Pillar Types
type VerificationPillarName =
  | "personal_info"
  | "academic_info"
  | "documents"
  | "school";
type VerificationStepStatus =
  | "not_verified"
  | "pending"
  | "failed"
  | "verified";
type PillarStatus = "not_verified" | "in_progress" | "verified";
type StepType = "automatic" | "manual" | "external";
type PerformedByType = "system" | "user" | "admin";

interface VerificationPillar {
  id: string;
  user_id: string;
  pillar_name: VerificationPillarName;
  weight_percentage: number;
  completion_percentage: number;
  status: PillarStatus;
  created_at: string;
  updated_at: string;
}

interface VerificationStepRequirement {
  requirement: string;
  met: boolean;
}

interface VerificationStep {
  id: string;
  user_id: string;
  pillar_id: string;
  step_name: string;
  step_order: number;
  step_type: StepType;
  status: VerificationStepStatus;
  status_message: string | null;
  failure_reason: string | null;
  failure_suggestion: string | null;
  requirement_checklist: VerificationStepRequirement[] | null;
  last_attempted_at: string | null;
  verified_at: string | null;
  retry_count: number;
  max_retries: number;
  admin_reviewer_id: string | null;
  admin_review_notes: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
}

interface VerificationStepEvidence {
  id: string;
  step_id: string;
  evidence_type: string;
  evidence_url: string;
  evidence_metadata: any;
  uploaded_at: string;
}

interface VerificationAuditLog {
  id: string;
  user_id: string;
  step_id: string | null;
  action: string;
  old_status: string | null;
  new_status: string | null;
  performed_by_id: string | null;
  performed_by_type: PerformedByType;
  metadata: any;
  created_at: string;
}

interface VerificationCenter {
  overall_verification_percentage: number;
  is_fully_verified: boolean;
  pillars: (VerificationPillar & {
    steps: VerificationStep[];
  })[];
}

// Pillar-specific step configurations
interface PersonalInfoSteps {
  face_match: VerificationStep;
  contact_verification: VerificationStep;
  government_id: VerificationStep;
}

interface AcademicInfoSteps {
  program_validation: VerificationStep;
  enrollment_logic_check: VerificationStep;
}

interface DocumentVerificationSteps {
  document_upload_readability: VerificationStep;
  content_match_check: VerificationStep;
  freshness_validation: VerificationStep;
}

interface SchoolVerificationSteps {
  direct_school_verification: VerificationStep;
  school_email_verification: VerificationStep;
  admin_attestation: VerificationStep;
}
