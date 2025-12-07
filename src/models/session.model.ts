import type { RowDataPacket } from "mysql2";
import pool from "../config/db.js";

export interface UserSession {
  id: number;
  user_id: number;
  session_token: string;
  ip_address: string | null;
  user_agent: string | null;
  is_active: number;
  last_activity: string;
  expires_at: string;
  created_at: string;
}

export async function createSession(payload: {
  user_id: number | string;
  session_token: string;
  ip_address?: string | null;
  user_agent?: string | null;
  expires_at: string;
}) {
  try {
    const [result] = await pool.query(
      `INSERT INTO user_sessions (user_id, session_token, ip_address, user_agent, expires_at)
       VALUES (?, ?, ?, ?, ?)`,
      [
        payload.user_id,
        payload.session_token,
        payload.ip_address || null,
        payload.user_agent || null,
        payload.expires_at,
      ]
    );
    // @ts-ignore
    const insertId = result?.insertId;
    if (!insertId) return null;
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM user_sessions WHERE id = ?`,
      [insertId]
    );
    return rows[0] as UserSession;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function findSessionByToken(token: string) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM user_sessions WHERE session_token = ? LIMIT 1`,
      [token]
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
      [id]
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
      [user_id]
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
      [user_id]
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
      [id]
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
