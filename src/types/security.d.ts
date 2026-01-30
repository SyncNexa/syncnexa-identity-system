interface SecurityInfo {
  password_strength: {
    score: number;
    label: string;
    feedback: string[];
  };
  mfa_status: {
    enabled: boolean;
    type?: "totp" | "sms" | "email" | null;
  };
  sessions: SessionInfo[];
}

interface SessionInfo {
  id: string;
  device_name?: string | null;
  browser?: string | null;
  device_type: string;
  ip_address?: string | null;
  location?: string | null;
  last_activity: string;
  created_at: string;
  expires_at: string;
}
