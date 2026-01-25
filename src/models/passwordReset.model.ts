import pool from "../config/db.js";
import { generateUUID } from "../utils/uuid.js";
import type { RowDataPacket } from "mysql2";

/**
 * Create a password reset OTP token
 */
export async function createPasswordResetToken(
  userId: string,
  email: string,
  otp: string,
  expiresAt: Date,
) {
  try {
    const tokenId = generateUUID();

    await pool.query(
      `INSERT INTO verification_tokens (id, token, scope, issued_for, expires_at, metadata)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        tokenId,
        otp,
        "password_reset",
        userId,
        expiresAt,
        JSON.stringify({ type: "password_reset_otp", user_id: userId, email }),
      ],
    );

    return tokenId;
  } catch (err) {
    console.error("Error creating password reset token:", err);
    throw err;
  }
}

/**
 * Find a valid password reset OTP token for a user
 */
export async function findPasswordResetToken(userId: string, otp: string) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM verification_tokens
       WHERE issued_for = ?
       AND scope = 'password_reset'
       AND token = ?
       AND revoked = 0
       AND expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId, otp],
    );

    if (!rows || rows.length === 0) {
      return null;
    }

    return (rows[0] as any).id;
  } catch (err) {
    console.error("Error finding password reset token:", err);
    throw err;
  }
}

/**
 * Revoke a password reset token by ID
 */
export async function revokePasswordResetToken(tokenId: string) {
  try {
    await pool.query(
      `UPDATE verification_tokens SET revoked = 1 WHERE id = ?`,
      [tokenId],
    );
    return true;
  } catch (err) {
    console.error("Error revoking password reset token:", err);
    throw err;
  }
}

/**
 * Revoke all password reset tokens for a user
 */
export async function revokeAllPasswordResetTokens(userId: string) {
  try {
    await pool.query(
      `UPDATE verification_tokens
       SET revoked = 1
       WHERE issued_for = ?
       AND scope = 'password_reset'
       AND revoked = 0`,
      [userId],
    );
    return true;
  } catch (err) {
    console.error("Error revoking password reset tokens:", err);
    throw err;
  }
}

/**
 * Check if a user has a pending password reset token
 */
export async function hasPendingPasswordResetToken(userId: string) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM verification_tokens
       WHERE issued_for = ?
       AND scope = 'password_reset'
       AND revoked = 0
       AND expires_at > NOW()`,
      [userId],
    );

    return rows[0]?.count > 0;
  } catch (err) {
    console.error("Error checking pending password reset token:", err);
    return false;
  }
}
