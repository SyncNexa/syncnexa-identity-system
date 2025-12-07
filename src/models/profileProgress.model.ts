import type { RowDataPacket } from "mysql2";
import pool from "../config/db.js";

export interface ProfileProgress {
  id: number;
  user_id: number;
  documents_count: number;
  documents_verified: number;
  academics_count: number;
  transcripts_count: number;
  institution_verifications_count: number;
  institution_verified: number;
  projects_count: number;
  certificates_count: number;
  certificates_verified: number;
  has_student_card: number;
  has_mfa_enabled: number;
  profile_completion_percent: number;
  last_updated: string;
}

export async function getOrCreateProgress(user_id: number | string) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM profile_progress WHERE user_id = ?`,
      [user_id]
    );
    if (rows && rows.length > 0) {
      return rows[0] as ProfileProgress;
    }
    // Create new record
    await pool.query(`INSERT INTO profile_progress (user_id) VALUES (?)`, [
      user_id,
    ]);
    const [newRows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM profile_progress WHERE user_id = ?`,
      [user_id]
    );
    return (newRows && newRows[0]) as ProfileProgress;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function updateProgress(
  user_id: number | string,
  updates: Partial<ProfileProgress>
) {
  try {
    const fields = Object.keys(updates)
      .filter((k) => k !== "id" && k !== "user_id")
      .map((k) => `${k} = ?`)
      .join(", ");
    const values = Object.entries(updates)
      .filter(([k]) => k !== "id" && k !== "user_id")
      .map(([, v]) => v);

    if (!fields) return await getOrCreateProgress(user_id);

    await pool.query(
      `UPDATE profile_progress SET ${fields}, last_updated = CURRENT_TIMESTAMP WHERE user_id = ?`,
      [...values, user_id]
    );

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM profile_progress WHERE user_id = ?`,
      [user_id]
    );
    return (rows && rows[0]) as ProfileProgress;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export default {
  getOrCreateProgress,
  updateProgress,
};
