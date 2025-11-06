import type { Request, Response, NextFunction } from "express";
import { createNewUser } from "../models/user.model.js";
import { sendSuccess } from "../utils/success.js";
import pool from "../config/db.js";
import type { RowDataPacket } from "mysql2";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { sendError } from "../utils/error.js";
import bcrypt from "bcrypt";

export async function createUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await createNewUser(req.body);
    if (result) {
      sendSuccess(201, "User created successfully!", res, result);
    } else {
      throw new Error("Could not create account, please try again.");
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export async function refreshAccessToken(req: Request, res: Response) {
  try {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) return sendError(400, "Refresh token required", res);

    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW()",
      [refreshToken]
    );

    if (!rows.length)
      return sendError(401, "Invalid or expired refresh token", res);

    const tokenRow = rows[0];
    const [users] = await pool.query<RowDataPacket[]>(
      "SELECT id, email, user_role FROM users WHERE id = ? LIMIT 1",
      [tokenRow?.user_id]
    );

    if (!users.length) return sendError(401, "User not found", res);

    const user = users[0];
    const newAccessToken = generateAccessToken({
      id: user?.id,
      email: user?.email,
      role: user?.user_role,
    });

    return sendSuccess(200, "Access token refreshed!", res, {
      accessToken: newAccessToken,
    });
  } catch (err) {
    return sendError(500, "Token refresh failed", res);
  }
}

export async function logout(req: Request, res: Response) {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) return sendError(400, "Refresh token required", res);

  await pool.query("DELETE FROM refresh_tokens WHERE token = ?", [
    refreshToken,
  ]);
  return sendSuccess(200, "Logged out successfully", res);
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id, email, password_hash, user_role FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (!rows.length)
      return res.status(401).json({ message: "Invalid credentials" });

    const user = rows[0];
    const match = await bcrypt.compare(password, user?.password_hash);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    // Generate tokens
    const accessToken = generateAccessToken({
      id: user?.id,
      email: user?.email,
      role: user?.user_role,
    });

    const refreshToken = await generateRefreshToken(user?.id);

    return sendSuccess(200, "Login successful!", res, {
      accessToken,
      refreshToken,
      role: user?.user_role,
    });
  } catch (err) {
    console.error("Login error:", err);
    return sendError(500, "Login failed", res);
  }
}
