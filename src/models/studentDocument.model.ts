import type { RowDataPacket } from "mysql2";
import pool from "../config/db.js";
import { generateUUID } from "../utils/uuid.js";

export async function insertDocument(doc: {
  user_id: number | string;
  doc_type: string;
  filename: string;
  filepath?: string | null;
  mime_type?: string | null;
  file_size?: number | null;
  meta?: any;
}) {
  try {
    const id = generateUUID();
    await pool.query(
      `INSERT INTO student_documents (id, user_id, doc_type, filename, filepath, mime_type, file_size, meta) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        doc.user_id,
        doc.doc_type,
        doc.filename,
        doc.filepath || null,
        doc.mime_type || null,
        doc.file_size || null,
        doc.meta ? JSON.stringify(doc.meta) : null,
      ]
    );
    return {
      id,
      user_id: doc.user_id as any,
      doc_type: doc.doc_type,
      filename: doc.filename,
      filepath: doc.filepath || null,
      mime_type: doc.mime_type || null,
      file_size: doc.file_size || null,
      meta: doc.meta || null,
      is_verified: 0,
    } as any;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function updateDocument(id: number | string, updates: any) {
  const fields: string[] = [];
  const values: any[] = [];
  if (updates.filename !== undefined) {
    fields.push("filename = ?");
    values.push(updates.filename);
  }
  if (updates.filepath !== undefined) {
    fields.push("filepath = ?");
    values.push(updates.filepath);
  }
  if (updates.mime_type !== undefined) {
    fields.push("mime_type = ?");
    values.push(updates.mime_type);
  }
  if (updates.file_size !== undefined) {
    fields.push("file_size = ?");
    values.push(updates.file_size);
  }
  if (updates.meta !== undefined) {
    fields.push("meta = ?");
    values.push(JSON.stringify(updates.meta));
  }

  if (!fields.length) return null;
  values.push(id);
  try {
    await pool.query(
      `UPDATE student_documents SET ${fields.join(", ")} WHERE id = ?`,
      values
    );
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM student_documents WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function findDocumentsByUser(userId: number | string) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM student_documents WHERE user_id = ?`,
      [userId]
    );
    return rows;
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function findDocumentById(id: number | string) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM student_documents WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function createDocumentVerification(
  docId: number | string,
  payload: {
    reviewer_id?: number | null;
    status?: string;
    notes?: string;
    metadata?: any;
  }
) {
  try {
    const verId = generateUUID();
    await pool.query(
      `INSERT INTO student_document_verifications (id, document_id, reviewer_id, status, notes, metadata) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        verId,
        docId,
        payload.reviewer_id || null,
        payload.status || "pending",
        payload.notes || null,
        payload.metadata ? JSON.stringify(payload.metadata) : null,
      ]
    );
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM student_document_verifications WHERE id = ?`,
      [verId]
    );
    // update document record with verification_id and is_verified if approved/rejected
    await pool.query(
      `UPDATE student_documents SET verification_id = ? WHERE id = ?`,
      [verId, docId]
    );
    return rows[0] || null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function updateDocumentVerification(
  id: number | string,
  updates: any
) {
  const fields: string[] = [];
  const values: any[] = [];
  if (updates.status !== undefined) {
    fields.push("status = ?");
    values.push(updates.status);
  }
  if (updates.notes !== undefined) {
    fields.push("notes = ?");
    values.push(updates.notes);
  }
  if (updates.metadata !== undefined) {
    fields.push("metadata = ?");
    values.push(JSON.stringify(updates.metadata));
  }
  if (!fields.length) return null;
  values.push(id);
  try {
    await pool.query(
      `UPDATE student_document_verifications SET ${fields.join(
        ", "
      )} WHERE id = ?`,
      values
    );
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM student_document_verifications WHERE id = ?`,
      [id]
    );
    // reflect verification status on document
    const ver = rows[0];
    if (ver) {
      const isVerified = ver.status === "approved" ? 1 : 0;
      const [docRows] = await pool.query<RowDataPacket[]>(
        `SELECT * FROM student_documents WHERE id = ?`,
        [ver.document_id]
      );
      if (docRows.length) {
        await pool.query(
          `UPDATE student_documents SET is_verified = ? WHERE id = ?`,
          [isVerified, ver.document_id]
        );
      }
    }
    return rows[0] || null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function getLatestVerificationForUser(userId: number | string) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT d.*, v.status AS verification_status, v.notes AS verification_notes, v.metadata AS verification_metadata, v.created_at AS verification_date
       FROM student_documents d
       LEFT JOIN student_document_verifications v ON v.id = d.verification_id
       WHERE d.user_id = ?
       ORDER BY d.uploaded_at DESC`,
      [userId]
    );
    return rows || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

export default {
  insertDocument,
  updateDocument,
  findDocumentsByUser,
  findDocumentById,
  createDocumentVerification,
  updateDocumentVerification,
  getLatestVerificationForUser,
};
