import type { RowDataPacket } from "mysql2";
import pool from "../config/db.js";

export async function createCard(userId: number | string, meta?: any) {
  try {
    const uuid = `card-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const [result] = await pool.query(
      `INSERT INTO student_cards (user_id, card_uuid, meta) VALUES (?, ?, ?)`,
      [userId, uuid, meta ? JSON.stringify(meta) : null]
    );
    // @ts-ignore
    const insertId = result?.insertId;
    if (!insertId) return null;
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM student_cards WHERE id = ?`,
      [insertId]
    );
    return rows[0] || null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function findCardByUser(userId: number | string) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM student_cards WHERE user_id = ?`,
      [userId]
    );
    return rows || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function issueToken(
  cardId: number | string,
  token: string,
  expiresAt: string,
  metadata?: any
) {
  try {
    const [result] = await pool.query(
      `INSERT INTO student_card_tokens (card_id, token, expires_at, metadata) VALUES (?, ?, ?, ?)`,
      [cardId, token, expiresAt, metadata ? JSON.stringify(metadata) : null]
    );
    // @ts-ignore
    const insertId = result?.insertId;
    if (!insertId) return null;
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM student_card_tokens WHERE id = ?`,
      [insertId]
    );
    return rows[0] || null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function findToken(token: string) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM student_card_tokens WHERE token = ? LIMIT 1`,
      [token]
    );
    return rows[0] || null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function markTokenUsed(id: number | string, usedBy?: string) {
  try {
    await pool.query(
      `UPDATE student_card_tokens SET used_at = NOW(), used_by = ? WHERE id = ?`,
      [usedBy || null, id]
    );
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM student_card_tokens WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export default {
  createCard,
  findCardByUser,
  issueToken,
  findToken,
  markTokenUsed,
};
