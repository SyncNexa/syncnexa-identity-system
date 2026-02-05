import type { RowDataPacket } from "mysql2";
import pool from "../config/db.js";
import { generateUUID } from "../utils/uuid.js";

export async function getSchoolConfigByInstitutionCode(
  institutionCode: string,
): Promise<SchoolApiConfig | null> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM school_api_configs WHERE institution_code = ? LIMIT 1`,
      [institutionCode],
    );
    return (rows[0] as SchoolApiConfig) || null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function getSchoolConfigById(
  id: string,
): Promise<SchoolApiConfig | null> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM school_api_configs WHERE id = ? LIMIT 1`,
      [id],
    );
    return (rows[0] as SchoolApiConfig) || null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function createVerificationRequest(params: {
  user_id: string;
  school_config_id: string;
  request_id: string;
  matric_number: string;
  status: string;
  status_message?: string | null;
  callback_url: string;
  expiration_time: string;
}): Promise<SchoolVerificationRequest | null> {
  try {
    const id = generateUUID();
    await pool.query(
      `INSERT INTO school_verification_requests (
        id,
        user_id,
        school_config_id,
        request_id,
        matric_number,
        status,
        status_message,
        callback_url,
        expiration_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        params.user_id,
        params.school_config_id,
        params.request_id,
        params.matric_number,
        params.status,
        params.status_message || null,
        params.callback_url,
        params.expiration_time,
      ],
    );
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM school_verification_requests WHERE id = ? LIMIT 1`,
      [id],
    );
    return (rows[0] as SchoolVerificationRequest) || null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function getRequestByRequestId(
  requestId: string,
): Promise<SchoolVerificationRequest | null> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM school_verification_requests WHERE request_id = ? LIMIT 1`,
      [requestId],
    );
    return (rows[0] as SchoolVerificationRequest) || null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function updateVerificationRequest(
  requestId: string,
  updates: Partial<SchoolVerificationRequest>,
): Promise<SchoolVerificationRequest | null> {
  const fields: string[] = [];
  const values: any[] = [];

  const allowed = [
    "status",
    "status_message",
    "student_notified_at",
    "callback_received_at",
    "callback_signature_valid",
    "verification_completed_at",
    "verification_outcome",
    "canonical_data_json",
    "canonical_data_hash",
  ];

  for (const key of allowed) {
    if (updates[key as keyof SchoolVerificationRequest] !== undefined) {
      fields.push(`${key} = ?`);
      values.push((updates as any)[key]);
    }
  }

  if (!fields.length) return null;

  values.push(requestId);

  try {
    await pool.query(
      `UPDATE school_verification_requests SET ${fields.join(", ")} WHERE request_id = ?`,
      values,
    );
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM school_verification_requests WHERE request_id = ? LIMIT 1`,
      [requestId],
    );
    return (rows[0] as SchoolVerificationRequest) || null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function insertMatchResult(params: {
  request_id: string;
  field_name: string;
  student_claimed?: string | null;
  school_returned: string;
  match_result: string;
  match_score?: number | null;
  notes?: string | null;
}): Promise<SchoolVerificationMatch | null> {
  try {
    const id = generateUUID();
    await pool.query(
      `INSERT INTO school_verification_matches (
        id,
        request_id,
        field_name,
        student_claimed,
        school_returned,
        match_result,
        match_score,
        notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        params.request_id,
        params.field_name,
        params.student_claimed || null,
        params.school_returned,
        params.match_result,
        params.match_score || null,
        params.notes || null,
      ],
    );
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM school_verification_matches WHERE id = ? LIMIT 1`,
      [id],
    );
    return (rows[0] as SchoolVerificationMatch) || null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function logAudit(params: {
  request_id?: string | null;
  user_id?: string | null;
  action: string;
  action_details?: string | null;
  http_status_code?: number | null;
  error_code?: string | null;
  error_message?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
}) {
  try {
    const id = generateUUID();
    await pool.query(
      `INSERT INTO school_verification_audit_logs (
        id,
        request_id,
        user_id,
        action,
        action_details,
        http_status_code,
        error_code,
        error_message,
        ip_address,
        user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        params.request_id || null,
        params.user_id || null,
        params.action,
        params.action_details || null,
        params.http_status_code || null,
        params.error_code || null,
        params.error_message || null,
        params.ip_address || null,
        params.user_agent || null,
      ],
    );
    return id;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export default {
  getSchoolConfigByInstitutionCode,
  getSchoolConfigById,
  createVerificationRequest,
  getRequestByRequestId,
  updateVerificationRequest,
  insertMatchResult,
  logAudit,
};
