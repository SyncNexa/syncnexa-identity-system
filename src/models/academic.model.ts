import type { RowDataPacket } from "mysql2";
import pool from "../config/db.js";
import { generateUUID } from "../utils/uuid.js";

export async function insertAcademicRecord(rec: {
  user_id: number | string;
  institution: string;
  program?: string | null;
  matric_number?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  degree?: string | null;
  gpa?: string | null;
  meta?: any;
}) {
  try {
    const id = generateUUID();
    await pool.query(
      `INSERT INTO academic_records (id, user_id, institution, program, matric_number, start_date, end_date, degree, gpa, meta) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        rec.user_id,
        rec.institution,
        rec.program || null,
        rec.matric_number || null,
        rec.start_date || null,
        rec.end_date || null,
        rec.degree || null,
        rec.gpa || null,
        rec.meta ? JSON.stringify(rec.meta) : null,
      ],
    );
    return {
      id,
      user_id: rec.user_id as any,
      institution: rec.institution,
      program: rec.program || null,
      matric_number: rec.matric_number || null,
      start_date: rec.start_date || null,
      end_date: rec.end_date || null,
      degree: rec.degree || null,
      gpa: rec.gpa || null,
      meta: rec.meta || null,
    } as any;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function updateAcademicRecord(id: number | string, updates: any) {
  const fields: string[] = [];
  const values: any[] = [];
  const allowed = [
    "institution",
    "program",
    "matric_number",
    "start_date",
    "end_date",
    "degree",
    "gpa",
    "meta",
  ];
  for (const k of allowed) {
    if (updates[k] !== undefined) {
      fields.push(`${k} = ?`);
      values.push(k === "meta" ? JSON.stringify(updates[k]) : updates[k]);
    }
  }
  if (!fields.length) return null;
  values.push(id);
  try {
    await pool.query(
      `UPDATE academic_records SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM academic_records WHERE id = ?`,
      [id],
    );
    return rows[0] || null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function findAcademicByUser(userId: number | string) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM academic_records WHERE user_id = ? ORDER BY start_date DESC`,
      [userId],
    );
    return rows || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function getStudentByUserId(userId: number | string) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM students WHERE user_id = ?`,
      [userId],
    );
    return rows[0] || null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function insertTranscript(payload: {
  academic_record_id: number | string;
  filename: string;
  filepath?: string | null;
  mime_type?: string | null;
  file_size?: number | null;
  metadata?: any;
}) {
  try {
    const tId = generateUUID();
    await pool.query(
      `INSERT INTO transcripts (id, academic_record_id, filename, filepath, mime_type, file_size, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        tId,
        payload.academic_record_id,
        payload.filename,
        payload.filepath || null,
        payload.mime_type || null,
        payload.file_size || null,
        payload.metadata ? JSON.stringify(payload.metadata) : null,
      ],
    );
    return {
      id: tId,
      academic_record_id: payload.academic_record_id as any,
      filename: payload.filename,
      filepath: payload.filepath || null,
      mime_type: payload.mime_type || null,
      file_size: payload.file_size || null,
      metadata: payload.metadata || null,
    } as any;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function findTranscriptsByAcademic(academicId: number | string) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM transcripts WHERE academic_record_id = ? ORDER BY uploaded_at DESC`,
      [academicId],
    );
    return rows || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

export default {
  insertAcademicRecord,
  updateAcademicRecord,
  findAcademicByUser,
  getStudentByUserId,
  insertTranscript,
  findTranscriptsByAcademic,
};
