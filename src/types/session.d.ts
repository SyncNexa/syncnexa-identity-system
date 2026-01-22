interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  ip_address: string | null;
  user_agent: string | null;
  is_active: number;
  last_activity: string;
  expires_at: string;
  created_at: string;
}

interface AuditLog {
  id: number;
  admin_id: string;
  admin_email: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  ip_address: string;
  user_agent: string;
  metadata: any;
  created_at: Date;
}
