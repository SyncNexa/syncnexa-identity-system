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
