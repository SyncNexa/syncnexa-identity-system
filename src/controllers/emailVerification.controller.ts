import type { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../utils/response.js";
import { sendError } from "../utils/error.js";
import * as emailVerificationService from "../services/emailVerification.service.js";

/**
 * Request email verification OTP
 * Sends OTP to user's email (in real implementation)
 */
export async function requestEmailVerification(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return sendError(401, "User not authenticated", res);
    }

    // Revoke any previous OTP tokens
    await emailVerificationService.revokeEmailVerificationTokens(userId);

    // Create new OTP token
    const { tokenId, otp } =
      await emailVerificationService.createEmailVerificationToken(userId);

    // TODO: In production, send OTP to user's email
    // For now, we'll return it in development mode for testing
    const isDevelopment = process.env.NODE_ENV === "development";

    if (isDevelopment) {
      // In development, return OTP for testing
      return sendSuccess(
        200,
        "OTP sent to your email (check response in dev)",
        res,
        {
          otp, // Only in development
          expiresIn: "15 minutes",
          tokenId,
        },
      );
    }

    // In production, just confirm OTP was sent
    return sendSuccess(200, "OTP sent to your email", res, {
      expiresIn: "15 minutes",
      message: "Check your email for the verification code",
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

/**
 * Verify email with OTP
 */
export async function verifyEmail(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user?.id;
    const { otp } = req.body;

    if (!userId) {
      return sendError(401, "User not authenticated", res);
    }

    if (!otp) {
      return sendError(400, "OTP is required", res);
    }

    // Verify the OTP
    await emailVerificationService.verifyEmailOTP(userId, otp);

    return sendSuccess(200, "Email verified successfully", res, {
      verified: true,
      message: "Your email has been verified",
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
 * Check email verification status
 */
export async function checkVerificationStatus(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return sendError(401, "User not authenticated", res);
    }

    const verified = await emailVerificationService.isEmailVerified(userId);

    return sendSuccess(200, "Verification status retrieved", res, {
      verified,
      message: verified ? "Email is verified" : "Email is not verified",
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

/**
 * Resend OTP (for testing/development)
 * This is an alias for requestEmailVerification
 */
export async function resendOTP(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  return requestEmailVerification(req, res, next);
}
