import type { RowDataPacket } from "mysql2";
import pool from "../config/db.js";
import { generateUUID } from "../utils/uuid.js";

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
    const id = generateUUID();
    await pool.query(
      `INSERT INTO user_mfa_settings (id, user_id, mfa_type, secret, backup_codes, verified_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         secret = VALUES(secret),
         backup_codes = VALUES(backup_codes),
         verified_at = VALUES(verified_at),
         updated_at = CURRENT_TIMESTAMP`,
      [
        id,
        payload.user_id,
        payload.mfa_type,
        payload.secret || null,
        backup,
        payload.verified_at || null,
      ]
    );
    return {
      id: id,
      user_id: payload.user_id as string,
      mfa_type: payload.mfa_type,
      is_enabled: 0,
      secret: payload.secret || null,
      backup_codes: payload.backup_codes
        ? JSON.stringify(payload.backup_codes)
        : null,
      verified_at: payload.verified_at || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as UserMfaSetting;
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
