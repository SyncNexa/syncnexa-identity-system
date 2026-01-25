import bcrypt from "bcrypt";
import type { RowDataPacket } from "mysql2";
import pool from "../config/db.js";
import {
  createNewUser,
  selectUserByEmail,
  selectUserById,
} from "../models/user.model.js";

export async function registerUser(data: any) {
  const user = await createNewUser(data);
  if (!user) {
    throw new Error("Could not create user");
  }
  return user;
}

export async function authenticateUser(email: string, password: string) {
  const user = await selectUserByEmail(email);
  if (!user) return null;
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return null;
  return { id: user.id, email: user.email, role: user.user_role };
}

export async function findRefreshToken(token: string) {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW()",
    [token],
  );
  return rows[0];
}

export async function deleteRefreshToken(token: string) {
  await pool.query("DELETE FROM refresh_tokens WHERE token = ?", [token]);
}

export async function getUserByIdMinimal(userId: string) {
  const user = await selectUserById(userId);
  if (!user) return null;
  return { id: user.id, email: user.email, role: user.user_role };
}

export async function getUserByEmail(email: string) {
  const user = await selectUserByEmail(email);
  if (!user) return null;
  return { id: user.id, email: user.email, role: user.user_role };
}
