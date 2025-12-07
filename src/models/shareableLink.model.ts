import type { RowDataPacket } from "mysql2";
import pool from "../config/db.js";

export interface ShareableLink {
  id: number;
  user_id: number;
  token: string;
  resource_type: string;
  resource_id: number | null;
  scope: any;
  expires_at: string | null;
  max_uses: number | null;
  uses_count: number;
  is_revoked: number;
  created_at: string;
  updated_at: string;
}

export async function createLink(payload: {
  user_id: number | string;
  token: string;
  resource_type: string;
  resource_id?: number | string | null;
  scope?: any;
  expires_at?: string | null;
  max_uses?: number | null;
}) {
  const scopeJson = payload.scope ? JSON.stringify(payload.scope) : null;
  const expiresAt = payload.expires_at || null;
  const maxUses = payload.max_uses ?? null;
  const resourceId = payload.resource_id ?? null;
  const values = [
    payload.user_id,
    payload.token,
    payload.resource_type,
    resourceId,
    scopeJson,
    expiresAt,
    maxUses,
  ];
  try {
    const [result] = await pool.query(
      `INSERT INTO shareable_links (user_id, token, resource_type, resource_id, scope, expires_at, max_uses)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      values
    );
    // @ts-ignore
    const insertId = result?.insertId;
    if (!insertId) return null;
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM shareable_links WHERE id = ?`,
      [insertId]
    );
    return rows[0] as ShareableLink;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function revokeLink(id: number | string) {
  try {
    await pool.query(`UPDATE shareable_links SET is_revoked = 1 WHERE id = ?`, [
      id,
    ]);
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM shareable_links WHERE id = ?`,
      [id]
    );
    return rows[0] as ShareableLink;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function findByToken(token: string) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM shareable_links WHERE token = ? LIMIT 1`,
      [token]
    );
    return (rows && rows[0]) as ShareableLink;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function incrementUse(id: number | string) {
  try {
    await pool.query(
      `UPDATE shareable_links SET uses_count = uses_count + 1 WHERE id = ?`,
      [id]
    );
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM shareable_links WHERE id = ?`,
      [id]
    );
    return rows[0] as ShareableLink;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export default {
  createLink,
  revokeLink,
  findByToken,
  incrementUse,
};
