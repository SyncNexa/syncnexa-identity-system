interface ProfileProgress {
  id: string;
  user_id: string;
  documents_count: number;
  documents_verified: number;
  academics_count: number;
  transcripts_count: number;
  institution_verifications_count: number;
  institution_verified: number;
  projects_count: number;
  certificates_count: number;
  certificates_verified: number;
  has_student_card: number;
  has_mfa_enabled: number;
  profile_completion_percent: number;
  last_updated: string;
}
