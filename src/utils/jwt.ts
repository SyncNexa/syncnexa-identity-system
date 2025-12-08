import jwt from "jsonwebtoken";
import crypto from "crypto";
import pool from "../config/db.js";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn: "15m" });
}

export async function generateRefreshToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(64).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

  await pool.query(
    "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
    [userId, token, expiresAt]
  );

  return token;
}
