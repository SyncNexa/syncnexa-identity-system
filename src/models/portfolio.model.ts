import type { RowDataPacket } from "mysql2";
import pool from "../config/db.js";
import { generateUUID } from "../utils/uuid.js";

export async function insertProject(payload: {
  user_id: number | string;
  title: string;
  description?: string | null;
  links?: any;
  attachments?: any;
}) {
  try {
    const id = generateUUID();
    await pool.query(
      `INSERT INTO student_projects (id, user_id, title, description, links, attachments) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        payload.user_id,
        payload.title,
        payload.description || null,
        payload.links ? JSON.stringify(payload.links) : null,
        payload.attachments ? JSON.stringify(payload.attachments) : null,
      ]
    );
    return {
      id,
      user_id: payload.user_id as any,
      title: payload.title,
      description: payload.description || null,
      links: payload.links || null,
      attachments: payload.attachments || null,
    } as any;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function updateProject(id: number | string, updates: any) {
  const fields: string[] = [];
  const values: any[] = [];
  if (updates.title !== undefined) {
    fields.push("title = ?");
    values.push(updates.title);
  }
  if (updates.description !== undefined) {
    fields.push("description = ?");
    values.push(updates.description);
  }
  if (updates.links !== undefined) {
    fields.push("links = ?");
    values.push(JSON.stringify(updates.links));
  }
  if (updates.attachments !== undefined) {
    fields.push("attachments = ?");
    values.push(JSON.stringify(updates.attachments));
  }
  if (!fields.length) return null;
  values.push(id);
  try {
    await pool.query(
      `UPDATE student_projects SET ${fields.join(", ")} WHERE id = ?`,
      values
    );
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM student_projects WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function findProjectsByUser(userId: number | string) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM student_projects WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );
    return rows || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function insertCertificate(payload: {
  user_id: number | string;
  issuer: string;
  title: string;
  issue_date?: string | null;
  file_path?: string | null;
  metadata?: any;
}) {
  try {
    const id = generateUUID();
    await pool.query(
      `INSERT INTO student_certificates (id, user_id, issuer, title, issue_date, file_path, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        payload.user_id,
        payload.issuer,
        payload.title,
        payload.issue_date || null,
        payload.file_path || null,
        payload.metadata ? JSON.stringify(payload.metadata) : null,
      ]
    );
    return {
      id,
      user_id: payload.user_id as any,
      issuer: payload.issuer,
      title: payload.title,
      issue_date: payload.issue_date || null,
      file_path: payload.file_path || null,
      metadata: payload.metadata || null,
    } as any;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function updateCertificate(id: number | string, updates: any) {
  const fields: string[] = [];
  const values: any[] = [];
  if (updates.issuer !== undefined) {
    fields.push("issuer = ?");
    values.push(updates.issuer);
  }
  if (updates.title !== undefined) {
    fields.push("title = ?");
    values.push(updates.title);
  }
  if (updates.issue_date !== undefined) {
    fields.push("issue_date = ?");
    values.push(updates.issue_date);
  }
  if (updates.file_path !== undefined) {
    fields.push("file_path = ?");
    values.push(updates.file_path);
  }
  if (updates.metadata !== undefined) {
    fields.push("metadata = ?");
    values.push(JSON.stringify(updates.metadata));
  }
  if (updates.is_verified !== undefined) {
    fields.push("is_verified = ?");
    values.push(updates.is_verified ? 1 : 0);
  }
  if (updates.verification_notes !== undefined) {
    fields.push("verification_notes = ?");
    values.push(updates.verification_notes);
  }
  if (!fields.length) return null;
  values.push(id);
  try {
    await pool.query(
      `UPDATE student_certificates SET ${fields.join(", ")} WHERE id = ?`,
      values
    );
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM student_certificates WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function findCertificatesByUser(userId: number | string) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM student_certificates WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );
    return rows || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

export default {
  insertProject,
  updateProject,
  findProjectsByUser,
  insertCertificate,
  updateCertificate,
  findCertificatesByUser,
};
