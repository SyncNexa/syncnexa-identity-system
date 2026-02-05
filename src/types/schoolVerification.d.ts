interface SchoolApiConfig {
  id: string;
  institution_code: string;
  institution_name: string;
  api_endpoint: string;
  vault_secret_path: string;
  is_active: boolean;
  last_tested_at?: string | null;
  test_status?: string | null;
  test_message?: string | null;
  last_secret_rotated_at?: string | null;
  secret_rotation_status?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface SchoolVerificationRequest {
  id: string;
  user_id: string;
  school_config_id: string;
  request_id: string;
  matric_number: string;
  status: string;
  status_message?: string | null;
  callback_url: string;
  student_notified_at?: string | null;
  callback_received_at?: string | null;
  callback_signature_valid?: boolean | null;
  verification_completed_at?: string | null;
  verification_outcome?: string | null;
  canonical_data_json?: string | null;
  canonical_data_hash?: string | null;
  expiration_time: string;
  created_at?: string;
  updated_at?: string;
}

interface SchoolVerificationMatch {
  id: string;
  request_id: string;
  field_name: string;
  student_claimed?: string | null;
  school_returned: string;
  match_result: string;
  match_score?: number | null;
  notes?: string | null;
  created_at?: string;
}

interface SchoolVerificationAuditLog {
  id: string;
  request_id?: string | null;
  user_id?: string | null;
  action: string;
  action_details?: string | null;
  http_status_code?: number | null;
  error_code?: string | null;
  error_message?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at?: string;
}

interface SchoolCanonicalStudent {
  full_name: string;
  matric_number: string;
  institution: string;
  faculty: string;
  department: string;
  degree: string;
  level: string;
  academic_session: string;
  enrollment_status: string;
}

interface SchoolVerificationCallbackPayload {
  request_id: string;
  status: "approved" | "declined";
  student?: SchoolCanonicalStudent;
  verified_at?: string;
  reason?: string;
  declined_at?: string;
}
