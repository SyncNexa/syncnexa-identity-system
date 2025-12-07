/**
 * SAuth (Student Authentication) - OAuth 2.0 Authorization Code Flow
 * Type definitions for app grants and authorization codes
 */

export interface AppGrant {
  id: number;
  user_id: number;
  app_id: number;
  scopes: any;
  access_token: string;
  refresh_token: string | null;
  token_expires_at: string | null;
  is_revoked: number;
  created_at: string;
  updated_at: string;
}

export interface AuthorizationCode {
  id: number;
  user_id: number;
  app_id: number;
  code: string;
  scopes: any;
  redirect_uri: string | null;
  is_used: number;
  expires_at: string;
  created_at: string;
}
