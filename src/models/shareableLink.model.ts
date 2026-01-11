import type { RowDataPacket } from "mysql2";
import pool from "../config/db.js";
import { generateUUID } from "../utils/uuid.js";

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
  const id = generateUUID();
  try {
    await pool.query(
      `INSERT INTO shareable_links (id, user_id, token, resource_type, resource_id, scope, expires_at, max_uses)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        payload.user_id,
        payload.token,
        payload.resource_type,
        resourceId,
        scopeJson,
        expiresAt,
        maxUses,
      ]
    );
    return {
      id: id,
      user_id: payload.user_id as string,
      token: payload.token,
      resource_type: payload.resource_type,
      resource_id: resourceId as string | null,
      scope: payload.scope || null,
      expires_at: expiresAt || null,
      max_uses: maxUses || null,
      uses_count: 0,
      is_revoked: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as ShareableLink;
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
