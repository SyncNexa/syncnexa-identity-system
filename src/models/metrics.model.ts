import type { RowDataPacket } from "mysql2";
import pool from "../config/db.js";

export async function getUserMetrics(
  userId: number | string
): Promise<UserMetrics> {
  try {
    const queries = [
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as count FROM student_documents WHERE user_id = ?`,
        [userId]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as count FROM student_documents WHERE user_id = ? AND is_verified = 1`,
        [userId]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as count FROM academic_records WHERE user_id = ?`,
        [userId]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as count FROM academic_transcripts WHERE user_id = ?`,
        [userId]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as count FROM institution_verification_requests WHERE user_id = ?`,
        [userId]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as count FROM institution_verification_requests WHERE user_id = ? AND status = 'approved'`,
        [userId]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as count FROM student_projects WHERE user_id = ?`,
        [userId]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as count FROM student_certificates WHERE user_id = ?`,
        [userId]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as count FROM student_certificates WHERE user_id = ? AND is_verified = 1`,
        [userId]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as count FROM student_cards WHERE user_id = ? LIMIT 1`,
        [userId]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as count FROM user_mfa_settings WHERE user_id = ? AND is_enabled = 1 LIMIT 1`,
        [userId]
      ),
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = (await Promise.all(queries)) as any[];

    return {
      documents_count: results[0][0][0]?.count || 0,
      documents_verified: results[1][0][0]?.count || 0,
      academics_count: results[2][0][0]?.count || 0,
      transcripts_count: results[3][0][0]?.count || 0,
      institution_verifications_count: results[4][0][0]?.count || 0,
      institution_verified: results[5][0][0]?.count || 0,
      projects_count: results[6][0][0]?.count || 0,
      certificates_count: results[7][0][0]?.count || 0,
      certificates_verified: results[8][0][0]?.count || 0,
      has_student_card: (results[9][0][0]?.count || 0) > 0,
      has_mfa_enabled: (results[10][0][0]?.count || 0) > 0,
    };
  } catch (err) {
    console.error(err);
    return {
      documents_count: 0,
      documents_verified: 0,
      academics_count: 0,
      transcripts_count: 0,
      institution_verifications_count: 0,
      institution_verified: 0,
      projects_count: 0,
      certificates_count: 0,
      certificates_verified: 0,
      has_student_card: false,
      has_mfa_enabled: false,
    };
  }
}

export default {
  getUserMetrics,
};
