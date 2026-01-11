/**
 * SAuth (Student Authentication) - SAuth 2.0 Authorization Code Flow
 * Type definitions for app grants and authorization codes
 */

interface AppGrant {
  id: string;
  user_id: string;
  app_id: string;
  scopes: any;
  access_token: string;
  refresh_token: string | null;
  token_expires_at: string | null;
  is_revoked: number;
  created_at: string;
  updated_at: string;
}

interface AuthorizationCode {
  id: string;
  user_id: string;
  app_id: string;
  code: string;
  scopes: any;
  redirect_uri: string | null;
  is_used: number;
  expires_at: string;
  created_at: string;
}
