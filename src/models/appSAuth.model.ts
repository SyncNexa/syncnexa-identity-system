import type { RowDataPacket } from "mysql2";
import pool from "../config/db.js";
import { generateUUID } from "../utils/uuid.js";

// App Grant operations
export async function createGrant(payload: {
  user_id: number | string;
  app_id: number | string;
  scopes?: any;
  access_token: string;
  refresh_token?: string | null;
  token_expires_at?: string | null;
}) {
  try {
    const scopesJson = payload.scopes ? JSON.stringify(payload.scopes) : null;
    const id = generateUUID();
    await pool.query(
      `INSERT INTO app_grants (id, user_id, app_id, scopes, access_token, refresh_token, token_expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        payload.user_id,
        payload.app_id,
        scopesJson,
        payload.access_token,
        payload.refresh_token || null,
        payload.token_expires_at || null,
      ]
    );
    return {
      id,
      user_id: payload.user_id as any,
      app_id: payload.app_id as any,
      scopes: payload.scopes || null,
      access_token: payload.access_token,
      refresh_token: payload.refresh_token || null,
      token_expires_at: payload.token_expires_at || null,
      is_revoked: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as any;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function getGrantById(id: number | string) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM app_grants WHERE id = ?`,
      [id]
    );
    return (rows && rows[0]) as AppGrant;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function getGrantByAccessToken(token: string) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM app_grants WHERE access_token = ? AND is_revoked = 0`,
      [token]
    );
    return (rows && rows[0]) as AppGrant;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function getUserGrants(
  user_id: number | string,
  app_id?: number | string
) {
  try {
    const sql = `SELECT * FROM app_grants WHERE user_id = ? AND is_revoked = 0${
      app_id ? " AND app_id = ?" : ""
    }`;
    const params = app_id ? [user_id, app_id] : [user_id];
    const [rows] = await pool.query<RowDataPacket[]>(sql, params);
    return rows || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function revokeGrant(id: number | string) {
  try {
    await pool.query(`UPDATE app_grants SET is_revoked = 1 WHERE id = ?`, [id]);
    return await getGrantById(id);
  } catch (err) {
    console.error(err);
    return null;
  }
}

// Authorization Code operations
export async function createAuthorizationCode(payload: {
  user_id: number | string;
  app_id: number | string;
  code: string;
  scopes?: any;
  redirect_uri?: string | null;
  expires_at: string;
}) {
  try {
    const scopesJson = payload.scopes ? JSON.stringify(payload.scopes) : null;
    const id = generateUUID();
    await pool.query(
      `INSERT INTO authorization_codes (id, user_id, app_id, code, scopes, redirect_uri, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        payload.user_id,
        payload.app_id,
        payload.code,
        scopesJson,
        payload.redirect_uri || null,
        payload.expires_at,
      ]
    );
    return {
      id,
      user_id: payload.user_id as any,
      app_id: payload.app_id as any,
      code: payload.code,
      scopes: payload.scopes || null,
      redirect_uri: payload.redirect_uri || null,
      is_used: 0,
      expires_at: payload.expires_at,
      created_at: new Date().toISOString(),
    } as any;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function getAuthorizationCodeById(id: number | string) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM authorization_codes WHERE id = ?`,
      [id]
    );
    return (rows && rows[0]) as AuthorizationCode;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function getAuthorizationCodeByCode(code: string) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM authorization_codes WHERE code = ? AND is_used = 0 LIMIT 1`,
      [code]
    );
    return (rows && rows[0]) as AuthorizationCode;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function markCodeAsUsed(code_id: number | string) {
  try {
    await pool.query(
      `UPDATE authorization_codes SET is_used = 1 WHERE id = ?`,
      [code_id]
    );
    return await getAuthorizationCodeById(code_id);
  } catch (err) {
    console.error(err);
    return null;
  }
}

export default {
  createGrant,
  getGrantById,
  getGrantByAccessToken,
  getUserGrants,
  revokeGrant,
  createAuthorizationCode,
  getAuthorizationCodeById,
  getAuthorizationCodeByCode,
  markCodeAsUsed,
};
