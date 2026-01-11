import type { RowDataPacket } from "mysql2";
import pool from "../config/db.js";
import { generateUUID } from "../utils/uuid.js";

export async function storeToken(payload: {
  token: string;
  scope?: string | null;
  issued_for?: number | string | null;
  issued_by?: number | string | null;
  expires_at: string;
  metadata?: any;
}) {
  try {
    const id = generateUUID();
    await pool.query(
      `INSERT INTO verification_tokens (id, token, scope, issued_for, issued_by, expires_at, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        payload.token,
        payload.scope || null,
        payload.issued_for || null,
        payload.issued_by || null,
        payload.expires_at,
        payload.metadata ? JSON.stringify(payload.metadata) : null,
      ]
    );
    return {
      id,
      token: payload.token,
      scope: payload.scope || null,
      issued_for: payload.issued_for || null,
      issued_by: payload.issued_by || null,
      expires_at: payload.expires_at,
      revoked: 0,
      metadata: payload.metadata || null,
      created_at: new Date().toISOString(),
    } as any;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function revokeToken(id: number | string) {
  try {
    await pool.query(
      `UPDATE verification_tokens SET revoked = 1 WHERE id = ?`,
      [id]
    );
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM verification_tokens WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function findTokenByValue(token: string) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM verification_tokens WHERE token = ? LIMIT 1`,
      [token]
    );
    return rows[0] || null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function logVerification(
  tokenId: number | string | null,
  verifier: string | null,
  action: string,
  accessedData?: any
) {
  try {
    const id = generateUUID();
    await pool.query(
      `INSERT INTO verification_logs (id, token_id, verifier, action, accessed_data) VALUES (?, ?, ?, ?, ?)`,
      [
        id,
        tokenId || null,
        verifier || null,
        action,
        accessedData ? JSON.stringify(accessedData) : null,
      ]
    );
    return {
      id,
      token_id: tokenId || null,
      verifier: verifier || null,
      action,
      accessed_data: accessedData || null,
      created_at: new Date().toISOString(),
    } as any;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function getLogsForToken(tokenId: number | string) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM verification_logs WHERE token_id = ? ORDER BY created_at DESC`,
      [tokenId]
    );
    return rows || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

export default {
  storeToken,
  revokeToken,
  findTokenByValue,
  logVerification,
  getLogsForToken,
};
