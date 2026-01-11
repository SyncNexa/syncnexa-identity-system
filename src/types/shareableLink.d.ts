interface ShareableLink {
  id: string;
  user_id: string;
  token: string;
  resource_type: string;
  resource_id: string | null;
  scope: any;
  expires_at: string | null;
  max_uses: number | null;
  uses_count: number;
  is_revoked: number;
  created_at: string;
  updated_at: string;
}
