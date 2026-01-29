import type { RowDataPacket } from "mysql2";
import pool from "../config/db.js";
import { generateUUID } from "../utils/uuid.js";

export async function createSession(payload: {
  user_id: number | string;
  session_token: string;
  ip_address?: string | null;
  user_agent?: string | null;
  device_name?: string | null;
  browser?: string | null;
  device_type?: "desktop" | "mobile" | "tablet" | "unknown";
  location?: string | null;
  expires_at: string;
}) {
  try {
    const id = generateUUID();
    await pool.query(
      `INSERT INTO user_sessions (id, user_id, session_token, ip_address, user_agent, device_name, browser, device_type, location, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        payload.user_id,
        payload.session_token,
        payload.ip_address || null,
        payload.user_agent || null,
        payload.device_name || null,
        payload.browser || null,
        payload.device_type || "unknown",
        payload.location || null,
        payload.expires_at,
      ],
    );
    return {
      id: id,
      user_id: payload.user_id as string,
      session_token: payload.session_token,
      ip_address: payload.ip_address || null,
      user_agent: payload.user_agent || null,
      device_name: payload.device_name || null,
      browser: payload.browser || null,
      device_type: payload.device_type || "unknown",
      location: payload.location || null,
      is_active: 1,
      last_activity: new Date().toISOString(),
      expires_at: payload.expires_at,
      created_at: new Date().toISOString(),
    } as UserSession;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function findSessionByToken(token: string) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM user_sessions WHERE session_token = ? LIMIT 1`,
      [token],
    );
    return (rows && rows[0]) as UserSession;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function revokeSession(id: number | string) {
  try {
    await pool.query(`UPDATE user_sessions SET is_active = 0 WHERE id = ?`, [
      id,
    ]);
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM user_sessions WHERE id = ?`,
      [id],
    );
    return rows[0] as UserSession;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function revokeAllUserSessions(user_id: number | string) {
  try {
    await pool.query(
      `UPDATE user_sessions SET is_active = 0 WHERE user_id = ?`,
      [user_id],
    );
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export async function getActiveSessions(user_id: number | string) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM user_sessions WHERE user_id = ? AND is_active = 1 AND expires_at > NOW() ORDER BY last_activity DESC`,
      [user_id],
    );
    return rows || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function updateSessionActivity(id: number | string) {
  try {
    await pool.query(
      `UPDATE user_sessions SET last_activity = CURRENT_TIMESTAMP WHERE id = ?`,
      [id],
    );
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export default {
  createSession,
  findSessionByToken,
  revokeSession,
  revokeAllUserSessions,
  getActiveSessions,
  updateSessionActivity,
};
