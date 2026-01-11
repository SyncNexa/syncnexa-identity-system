import type { RowDataPacket } from "mysql2";
import pool from "../config/db.js";
import { generateUUID } from "../utils/uuid.js";

export async function createCard(userId: number | string, meta?: any) {
  try {
    const id = generateUUID();
    const cardUuid = `card-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    await pool.query(
      `INSERT INTO student_cards (id, user_id, card_uuid, meta) VALUES (?, ?, ?, ?)`,
      [id, userId, cardUuid, meta ? JSON.stringify(meta) : null]
    );
    return {
      id,
      user_id: userId as any,
      card_uuid: cardUuid,
      meta: meta || null,
    } as any;
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
    const id = generateUUID();
    await pool.query(
      `INSERT INTO student_card_tokens (id, card_id, token, expires_at, metadata) VALUES (?, ?, ?, ?, ?)`,
      [id, cardId, token, expiresAt, metadata ? JSON.stringify(metadata) : null]
    );
    return {
      id,
      card_id: cardId as any,
      token,
      expires_at: expiresAt,
      metadata: metadata || null,
    } as any;
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
