import type { RowDataPacket } from "mysql2";
import pool from "../config/db.js";

export async function createRequest(payload: {
  user_id: number | string;
  institution: string;
  contact_email?: string | null;
  contact_phone?: string | null;
  payload?: any;
}) {
  try {
    const [result] = await pool.query(
      `INSERT INTO institution_verification_requests (user_id, institution, contact_email, contact_phone, payload) VALUES (?, ?, ?, ?, ?)`,
      [
        payload.user_id,
        payload.institution,
        payload.contact_email || null,
        payload.contact_phone || null,
        payload.payload ? JSON.stringify(payload.payload) : null,
      ]
    );
    // @ts-ignore
    const insertId = result?.insertId;
    if (!insertId) return null;
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM institution_verification_requests WHERE id = ?`,
      [insertId]
    );
    return rows[0] || null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function findByUser(userId: number | string) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM institution_verification_requests WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );
    return rows || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function updateRequest(id: number | string, updates: any) {
  const fields: string[] = [];
  const values: any[] = [];
  if (updates.status !== undefined) {
    fields.push("status = ?");
    values.push(updates.status);
  }
  if (updates.payload !== undefined) {
    fields.push("payload = ?");
    values.push(JSON.stringify(updates.payload));
  }
  if (!fields.length) return null;
  values.push(id);
  try {
    await pool.query(
      `UPDATE institution_verification_requests SET ${fields.join(
        ", "
      )} WHERE id = ?`,
      values
    );
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM institution_verification_requests WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export default { createRequest, findByUser, updateRequest };
