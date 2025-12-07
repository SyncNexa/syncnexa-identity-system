import type { RowDataPacket } from "mysql2";
import pool from "../config/db.js";

export interface UserMfaSetting {
  id: number;
  user_id: number;
  mfa_type: "totp" | "sms" | "email";
  is_enabled: number;
  secret: string | null;
  backup_codes: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function createOrUpdateMfaSetting(payload: {
  user_id: number | string;
  mfa_type: "totp" | "sms" | "email";
  secret?: string | null;
  backup_codes?: any;
  verified_at?: string | null;
}) {
  try {
    const backup = payload.backup_codes
      ? JSON.stringify(payload.backup_codes)
      : null;
    const [result] = await pool.query(
      `INSERT INTO user_mfa_settings (user_id, mfa_type, secret, backup_codes, verified_at)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         secret = VALUES(secret),
         backup_codes = VALUES(backup_codes),
         verified_at = VALUES(verified_at),
         updated_at = CURRENT_TIMESTAMP`,
      [
        payload.user_id,
        payload.mfa_type,
        payload.secret || null,
        backup,
        payload.verified_at || null,
      ]
    );
    // @ts-ignore
    const id = result?.insertId || result?.affectedRows;
    if (!id) return null;
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM user_mfa_settings WHERE user_id = ? AND mfa_type = ?`,
      [payload.user_id, payload.mfa_type]
    );
    return (rows && rows[0]) as UserMfaSetting;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function getMfaSetting(
  user_id: number | string,
  mfa_type: string
) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM user_mfa_settings WHERE user_id = ? AND mfa_type = ?`,
      [user_id, mfa_type]
    );
    return (rows && rows[0]) as UserMfaSetting;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function enableMfa(
  user_id: number | string,
  mfa_type: string,
  verified_at: string
) {
  try {
    await pool.query(
      `UPDATE user_mfa_settings SET is_enabled = 1, verified_at = ? WHERE user_id = ? AND mfa_type = ?`,
      [verified_at, user_id, mfa_type]
    );
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM user_mfa_settings WHERE user_id = ? AND mfa_type = ?`,
      [user_id, mfa_type]
    );
    return (rows && rows[0]) as UserMfaSetting;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function disableMfa(user_id: number | string, mfa_type: string) {
  try {
    await pool.query(
      `UPDATE user_mfa_settings SET is_enabled = 0 WHERE user_id = ? AND mfa_type = ?`,
      [user_id, mfa_type]
    );
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM user_mfa_settings WHERE user_id = ? AND mfa_type = ?`,
      [user_id, mfa_type]
    );
    return (rows && rows[0]) as UserMfaSetting;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export default {
  createOrUpdateMfaSetting,
  getMfaSetting,
  enableMfa,
  disableMfa,
};
