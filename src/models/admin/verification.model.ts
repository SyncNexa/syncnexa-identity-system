import type { RowDataPacket, ResultSetHeader } from "mysql2";
import pool from "../../config/db.js";

export type VerificationStatus = "pending" | "approved" | "rejected";
export type VerificationType = "institution" | "system" | "external";

interface ListParams {
  page?: number;
  limit?: number;
  status?: VerificationStatus;
  type?: VerificationType;
  user_id?: string;
}

export async function listVerifications(params: ListParams) {
  const { page = 1, limit = 20, status, type, user_id } = params;
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const values: any[] = [];

  if (status) {
    conditions.push("v.verification_status = ?");
    values.push(status);
  }

  if (type) {
    conditions.push("v.verification_type = ?");
    values.push(type);
  }

  if (user_id) {
    conditions.push("v.user_id = ?");
    values.push(user_id);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const [countRows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) as total FROM verifications v ${whereClause}`,
    values,
  );
  const total = countRows[0]?.total || 0;

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT 
      v.id,
      v.user_id,
      v.verified_by,
      v.verification_type,
      v.verification_status,
      v.evidence_url,
      v.created_at,
      v.updated_at,
      u.email as user_email,
      u.first_name,
      u.last_name
    FROM verifications v
    LEFT JOIN users u ON u.user_id = v.user_id
    ${whereClause}
    ORDER BY v.created_at DESC
    LIMIT ? OFFSET ?`,
    [...values, limit, offset],
  );

  return { items: rows, total, page, limit };
}

export async function getVerificationById(id: string) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT 
      v.id,
      v.user_id,
      v.verified_by,
      v.verification_type,
      v.verification_status,
      v.evidence_url,
      v.created_at,
      v.updated_at,
      u.email as user_email,
      u.first_name,
      u.last_name
    FROM verifications v
    LEFT JOIN users u ON u.user_id = v.user_id
    WHERE v.id = ?
    LIMIT 1`,
    [id],
  );

  return rows[0] || null;
}

export async function updateVerificationStatus(
  id: string,
  status: VerificationStatus,
  adminId: string,
) {
  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE verifications 
     SET verification_status = ?, verified_by = ?, updated_at = NOW()
     WHERE id = ?`,
    [status, adminId, id],
  );

  return result.affectedRows > 0;
}
