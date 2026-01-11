interface UserMfaSetting {
  id: string;
  user_id: string;
  mfa_type: "totp" | "sms" | "email";
  is_enabled: number;
  secret: string | null;
  backup_codes: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}
