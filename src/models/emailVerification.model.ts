import pool from "../config/db.js";
import { generateUUID } from "../utils/uuid.js";
import type { RowDataPacket } from "mysql2";

/**
 * Create an OTP verification token for email verification
 */
export async function createEmailVerificationToken(
  userId: string,
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
        "email_verification",
        userId,
        expiresAt,
        JSON.stringify({ type: "email_otp", user_id: userId }),
      ],
    );

    return tokenId;
  } catch (err) {
    console.error("Error creating email verification token:", err);
    throw err;
  }
}

/**
 * Find a valid OTP token for a user
 */
export async function findEmailVerificationToken(userId: string, otp: string) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM verification_tokens
       WHERE issued_for = ?
       AND scope = 'email_verification'
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
    console.error("Error finding email verification token:", err);
    throw err;
  }
}

/**
 * Revoke a verification token by ID
 */
export async function revokeVerificationToken(tokenId: string) {
  try {
    await pool.query(
      `UPDATE verification_tokens SET revoked = 1 WHERE id = ?`,
      [tokenId],
    );
    return true;
  } catch (err) {
    console.error("Error revoking verification token:", err);
    throw err;
  }
}

/**
 * Revoke all OTP tokens for a user
 */
export async function revokeAllEmailVerificationTokens(userId: string) {
  try {
    await pool.query(
      `UPDATE verification_tokens
       SET revoked = 1
       WHERE issued_for = ?
       AND scope = 'email_verification'
       AND revoked = 0`,
      [userId],
    );
    return true;
  } catch (err) {
    console.error("Error revoking email verification tokens:", err);
    throw err;
  }
}

/**
 * Mark user email as verified
 */
export async function markEmailAsVerified(userId: string) {
  try {
    await pool.query(`UPDATE users SET is_verified = 1 WHERE id = ?`, [userId]);
    return true;
  } catch (err) {
    console.error("Error marking email as verified:", err);
    throw err;
  }
}

/**
 * Check if a user's email is verified
 */
export async function getEmailVerificationStatus(userId: string) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT is_verified FROM users WHERE id = ?`,
      [userId],
    );

    if (!rows || rows.length === 0) {
      return false;
    }

    return (rows[0] as any).is_verified === 1;
  } catch (err) {
    console.error("Error checking email verification status:", err);
    return false;
  }
}

/**
 * Get pending OTP token for a user (for testing purposes only)
 * Should not be exposed in production
 */
export async function getPendingEmailVerificationToken(userId: string) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT token, expires_at FROM verification_tokens
       WHERE issued_for = ?
       AND scope = 'email_verification'
       AND revoked = 0
       AND expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId],
    );

    if (!rows || rows.length === 0) {
      return null;
    }

    const row = rows[0] as any;
    return {
      otp: row.token,
      expiresAt: row.expires_at,
    };
  } catch (err) {
    console.error("Error getting pending OTP token:", err);
    return null;
  }
}
