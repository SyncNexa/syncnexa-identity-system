import type { RowDataPacket } from "mysql2";
import pool from "../config/db.js";
import { generateUUID } from "../utils/uuid.js";

export async function getOrCreateProgress(user_id: number | string) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM profile_progress WHERE user_id = ?`,
      [user_id]
    );
    if (rows && rows.length > 0) {
      return rows[0] as ProfileProgress;
    }
    // Create new record with app-generated id
    const id = generateUUID();
    await pool.query(
      `INSERT INTO profile_progress (id, user_id) VALUES (?, ?)`,
      [id, user_id]
    );
    // Return minimal default values without extra SELECT
    return {
      id,
      user_id: user_id as string,
      documents_count: 0,
      documents_verified: 0,
      academics_count: 0,
      transcripts_count: 0,
      institution_verifications_count: 0,
      institution_verified: 0,
      projects_count: 0,
      certificates_count: 0,
      certificates_verified: 0,
      has_student_card: 0,
      has_mfa_enabled: 0,
      profile_completion_percent: 0,
      last_updated: new Date().toISOString(),
    } as unknown as ProfileProgress;
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
