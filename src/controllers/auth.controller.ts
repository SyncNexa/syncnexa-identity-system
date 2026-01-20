import type { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../utils/response.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { sendError } from "../utils/error.js";
import { internalError } from "../utils/httpError.js";
import * as authService from "../services/auth.service.js";
import {
  DuplicateEmailError,
  DuplicateMatricNumberError,
} from "../models/user.model.js";
import { enrichStudentData } from "../utils/universities.js";

export async function createUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await authService.registerUser(req.body);
    if (result) {
      // Enrich student data with full institution/faculty names if student role
      const enrichedResult =
        result.user_role === "student" ? enrichStudentData(result) : result;
      sendSuccess(201, "User created successfully!", res, enrichedResult);
    } else {
      throw internalError("Could not create account, please try again.");
    }
  } catch (err) {
    // Handle duplicate email error with 409 Conflict
    if (err instanceof DuplicateEmailError) {
      return sendError(409, err.message, res);
    }

    // Handle duplicate matric number error with 409 Conflict
    if (err instanceof DuplicateMatricNumberError) {
      return sendError(409, err.message, res);
    }

    console.log(err);
    next(err);
  }
}

export async function refreshAccessToken(req: Request, res: Response) {
  try {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) return sendError(400, "Refresh token required", res);

    const tokenRow = await authService.findRefreshToken(refreshToken);
    if (!tokenRow)
      return sendError(401, "Invalid or expired refresh token", res);

    const user = await authService.getUserByIdMinimal(tokenRow?.user_id);
    if (!user) return sendError(401, "User not found", res);

    const newAccessToken = generateAccessToken({
      id: user?.id,
      email: user?.email,
      role: user?.role,
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

  await authService.deleteRefreshToken(refreshToken);
  return sendSuccess(200, "Logged out successfully", res);
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  try {
    const user = await authService.authenticateUser(email, password);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    // Generate tokens
    const accessToken = generateAccessToken({
      id: user?.id,
      email: user?.email,
      role: user?.role,
    });

    const refreshToken = await generateRefreshToken(user?.id);

    return sendSuccess(200, "Login successful!", res, {
      accessToken,
      refreshToken,
      role: user?.role,
    });
  } catch (err) {
    console.error("Login error:", err);
    return sendError(500, "Login failed", res);
  }
}
