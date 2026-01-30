import type { RowDataPacket } from "mysql2";

import generateUUID from "../utils/uuid.js";
import pool from "../config/db.js";

const PILLARS: VerificationPillarName[] = [
  "personal_info",
  "academic_info",
  "documents",
  "school",
];

export async function initializePillarsForUser(userId: string) {
  try {
    const client = await pool.getConnection();
    await client.beginTransaction();

    for (const pillarName of PILLARS) {
      const id = generateUUID();
      await client.query(
        `INSERT INTO verification_pillars (id, user_id, pillar_name, weight_percentage, status)
         VALUES (?, ?, ?, 25, 'not_verified')`,
        [id, userId, pillarName],
      );
    }

    await client.commit();
    client.release();
    return true;
  } catch (err) {
    console.error("Error initializing pillars:", err);
    throw err;
  }
}

export async function getPillarsByUser(userId: string) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM verification_pillars WHERE user_id = ? ORDER BY pillar_name`,
      [userId],
    );
    return (rows as VerificationPillar[]) || [];
  } catch (err) {
    console.error("Error fetching pillars:", err);
    return [];
  }
}

export async function getPillarByUserAndName(
  userId: string,
  pillarName: VerificationPillarName,
) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM verification_pillars WHERE user_id = ? AND pillar_name = ?`,
      [userId, pillarName],
    );
    return (rows?.[0] as VerificationPillar) || null;
  } catch (err) {
    console.error("Error fetching pillar:", err);
    return null;
  }
}

export async function updatePillarStatus(
  pillarId: string,
  status: PillarStatus,
  completionPercentage?: number,
) {
  try {
    if (completionPercentage !== undefined) {
      await pool.query(
        `UPDATE verification_pillars SET status = ?, completion_percentage = ?, updated_at = NOW() WHERE id = ?`,
        [status, completionPercentage, pillarId],
      );
    } else {
      await pool.query(
        `UPDATE verification_pillars SET status = ?, updated_at = NOW() WHERE id = ?`,
        [status, pillarId],
      );
    }
    return true;
  } catch (err) {
    console.error("Error updating pillar status:", err);
    return false;
  }
}

export async function calculatePillarCompletion(pillarId: string) {
  try {
    // Get all steps for this pillar
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total, SUM(CASE WHEN status = 'verified' THEN 1 ELSE 0 END) as verified
       FROM verification_steps WHERE pillar_id = ?`,
      [pillarId],
    );

    const row = rows[0] as any;
    const total = row?.total || 0;
    const verified = row?.verified || 0;

    if (total === 0) return 0;
    return Math.round((verified / total) * 100);
  } catch (err) {
    console.error("Error calculating pillar completion:", err);
    return 0;
  }
}

export default {
  initializePillarsForUser,
  getPillarsByUser,
  getPillarByUserAndName,
  updatePillarStatus,
  calculatePillarCompletion,
};
