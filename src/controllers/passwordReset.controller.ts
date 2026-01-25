import type { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../utils/response.js";
import { sendError } from "../utils/error.js";
import * as passwordResetService from "../services/passwordReset.service.js";
import * as authService from "../services/auth.service.js";

/**
 * Request password reset OTP
 * Sends OTP to user's email (in real implementation)
 */
export async function requestPasswordReset(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email } = req.body;

    // Request password reset (generates OTP)
    const result = await passwordResetService.requestPasswordReset(email);

    // For security, always return success even if email doesn't exist
    // This prevents email enumeration attacks
    const isDevelopment = process.env.NODE_ENV === "development";

    if (isDevelopment && result) {
      // In development, return OTP for testing
      return sendSuccess(
        200,
        "OTP sent to your email (check response in dev)",
        res,
        {
          otp: result.otp, // Only in development
          expiresIn: "15 minutes",
          tokenId: result.tokenId,
        },
      );
    }

    // In production, just confirm OTP was sent
    return sendSuccess(200, "OTP sent to your email", res, {
      expiresIn: "15 minutes",
      message:
        "If an account exists with this email, you will receive a verification code",
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

/**
 * Verify password reset OTP
 */
export async function verifyPasswordResetOTP(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return sendError(400, "Email and OTP are required", res);
    }

    // Find user by email
    const user = await authService.getUserByEmail(email);
    if (!user) {
      return sendError(404, "User not found", res);
    }

    // Verify the OTP
    await passwordResetService.verifyPasswordResetOTP(user.id, otp);

    return sendSuccess(200, "OTP verified successfully", res, {
      verified: true,
      message: "You can now reset your password",
      userId: user.id,
    });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message.includes("Invalid or expired OTP")) {
        return sendError(400, "Invalid or expired OTP", res);
      }
    }
    console.log(err);
    next(err);
  }
}

/**
 * Reset password with OTP
 */
export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return sendError(400, "Email, OTP, and new password are required", res);
    }

    // Find user by email
    const user = await authService.getUserByEmail(email);
    if (!user) {
      return sendError(404, "User not found", res);
    }

    // Reset password
    await passwordResetService.resetPassword(user.id, otp, newPassword);

    return sendSuccess(200, "Password reset successfully", res, {
      success: true,
      message:
        "Your password has been reset. Please login with your new password",
    });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message.includes("Invalid or expired OTP")) {
        return sendError(400, "Invalid or expired OTP", res);
      }
    }
    console.log(err);
    next(err);
  }
}
