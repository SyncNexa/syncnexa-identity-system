import type { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../utils/response.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { sendError } from "../utils/error.js";
import { internalError } from "../utils/httpError.js";
import * as authService from "../services/auth.service.js";
import * as loginSecurityService from "../services/loginSecurity.service.js";
import * as activityService from "../services/activity.service.js";
import * as emailVerificationService from "../services/emailVerification.service.js";
import * as sessionService from "../services/session.service.js";
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
      // Send email verification OTP immediately after signup
      try {
        await emailVerificationService.createAndSendEmailVerificationOTP(
          result.id,
        );
        console.log(
          `[EMAIL] Verification OTP sent to ${result.email} after signup`,
        );
      } catch (emailErr) {
        console.error(
          "[EMAIL] Error sending verification OTP after signup:",
          emailErr,
        );
        // Don't fail the registration if email sending fails
        // User can request OTP later
      }

      // Enrich student data with full institution/faculty names if student role
      const enrichedResult =
        result.user_role === "student" ? enrichStudentData(result) : result;
      sendSuccess(
        201,
        "User created successfully! Check your email for verification code.",
        res,
        enrichedResult,
      );
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
  const { refreshToken, sessionId } = req.body;
  if (!refreshToken) return sendError(400, "Refresh token required", res);

  await authService.deleteRefreshToken(refreshToken);

  // Revoke the current session if sessionId is provided
  if (sessionId) {
    await sessionService.revokeSession(sessionId);
  }

  const user = req.user as any;
  if (user?.id && user?.email) {
    await activityService.logUserActivity({
      user_id: user.id,
      user_email: user.email,
      action: "logout",
      resource_type: "auth",
      resource_id: sessionId || null,
      ip_address: req.ip || req.socket.remoteAddress || null,
      user_agent: req.get("user-agent") || null,
    });
  }
  return sendSuccess(200, "Logged out successfully", res);
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  try {
    const ipAddress =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
      req.socket.remoteAddress ||
      "unknown";
    const userAgent = req.headers["user-agent"] || "unknown";

    const banStatus = await loginSecurityService.isEmailBanned(email);
    if (banStatus.banned) {
      const timeRemaining = loginSecurityService.formatBanDuration(
        banStatus.expiresIn || 0,
      );
      return sendError(
        429,
        `Account temporarily locked. Please try again in ${timeRemaining}. Reason: ${banStatus.reason}`,
        res,
      );
    }

    const userExists = await authService.getUserByEmail(email);
    const user = await authService.authenticateUser(email, password);

    if (!user) {
      if (userExists) {
        const { shouldBan, attemptsLeft, banDuration } =
          await loginSecurityService.recordFailedLoginAttempt(email, true);

        await activityService.logUserActivity({
          user_id: userExists.id,
          user_email: userExists.email,
          action: "login_failed",
          resource_type: "auth",
          resource_id: null,
          ip_address: ipAddress,
          user_agent: userAgent,
          metadata: {
            reason: "invalid_password",
            attempts_left: attemptsLeft,
          },
        });

        if (attemptsLeft > 0) {
          await loginSecurityService.sendFailedLoginAlert(
            email,
            ipAddress,
            userAgent,
            attemptsLeft,
          );
        }

        if (shouldBan) {
          const timeFormatted = loginSecurityService.formatBanDuration(
            banDuration || 0,
          );
          console.log(
            `[SECURITY] User ${email} banned for ${timeFormatted} after multiple failed attempts`,
          );
          return sendError(
            429,
            `Too many failed login attempts. Account temporarily locked for ${timeFormatted}. Please try again later.`,
            res,
          );
        }

        return sendError(
          401,
          `Invalid password. ${attemptsLeft} attempt${attemptsLeft !== 1 ? "s" : ""} remaining before temporary lock.`,
          res,
        );
      }

      const { shouldBan, attemptsLeft, banDuration } =
        await loginSecurityService.recordFailedLoginAttempt(email, false);

      if (shouldBan) {
        const timeFormatted = loginSecurityService.formatBanDuration(
          banDuration || 0,
        );
        console.log(
          `[SECURITY] Email ${email} banned for ${timeFormatted} after repeated attempts with non-existent account`,
        );
        return sendError(
          429,
          `Too many login attempts. This email has been temporarily blocked for ${timeFormatted}. If you need an account, please register.`,
          res,
        );
      }

      return sendError(
        404,
        `Account not found. Please check your email or create a new account. (${attemptsLeft} attempt${attemptsLeft !== 1 ? "s" : ""} remaining)`,
        res,
      );
    }

    await loginSecurityService.clearFailedAttempts(email);

    await activityService.logUserActivity({
      user_id: user.id,
      user_email: user.email,
      action: "login_success",
      resource_type: "auth",
      resource_id: null,
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    // Create a session for device tracking
    const sessionResult = await sessionService.createSession({
      userId: user.id,
      ipAddress: ipAddress,
      userAgent: userAgent,
      ttlSeconds: 86400 * 7, // 7 days
    });

    const accessToken = generateAccessToken({
      id: user?.id,
      email: user?.email,
      role: user?.role,
    });

    const refreshToken = await generateRefreshToken(user?.id);

    console.log(`[AUTH] Successful login for user ${email} from ${ipAddress}`);

    return sendSuccess(200, "Login successful!", res, {
      accessToken,
      refreshToken,
      role: user?.role,
      sessionId: sessionResult.record?.id,
    });
  } catch (err) {
    console.error("Login error:", err);
    return sendError(500, "Login failed", res);
  }
}
