import type { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../utils/response.js";
import { sendError } from "../utils/error.js";
import * as emailVerificationService from "../services/emailVerification.service.js";

/**
 * Request email verification OTP
 * Sends OTP to user's email
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

    // Create new OTP token and send email
    const { tokenId } =
      await emailVerificationService.createAndSendEmailVerificationOTP(userId);

    // In development, also return OTP for testing purposes
    const isDevelopment = process.env.NODE_ENV === "development";

    if (isDevelopment) {
      // In development, also return OTP for testing
      const { otp } =
        await emailVerificationService.createEmailVerificationToken(userId);
      return sendSuccess(
        200,
        "OTP sent to your email (check response in dev)",
        res,
        {
          otp, // Only in development
          expiresIn: "15 minutes",
          tokenId,
          message: "Check your email for the verification code",
        },
      );
    }

    // In production, just confirm OTP was sent
    return sendSuccess(200, "OTP sent to your email", res, {
      expiresIn: "15 minutes",
      message: "Check your email for the verification code",
    });
  } catch (err) {
    console.error("[EMAIL] Error in requestEmailVerification:", err);
    if (err instanceof Error) {
      if (err.message.includes("User not found")) {
        return sendError(404, "User not found", res);
      }
    }
    next(err);
  }
}

/**
 * Verify email with OTP - Works for both authenticated and unauthenticated users
 * For unauthenticated users, requires email and OTP in request body
 * For authenticated users, uses user from JWT token
 */
export async function verifyEmail(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { otp, email } = req.body;
    let userId: string | undefined = req.user?.id;

    if (!otp) {
      return sendError(400, "OTP is required", res);
    }

    // If not authenticated, require email in request body
    if (!userId) {
      if (!email) {
        return sendError(
          400,
          "Email is required for unauthenticated verification",
          res,
        );
      }
      // Get user ID by email for unauthenticated request
      const userFromEmail =
        await emailVerificationService.getUserByEmail(email);
      if (!userFromEmail) {
        return sendError(404, "User not found", res);
      }
      userId = userFromEmail.id;
    }

    // Verify the OTP (userId is guaranteed to be set at this point)
    if (!userId) {
      return sendError(400, "Could not identify user", res);
    }
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
 * Resend OTP - Works for both authenticated and unauthenticated users
 * For unauthenticated users, requires email in request body
 * For authenticated users, uses user from JWT token
 */
export async function resendOTP(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email } = req.body;
    let userId = req.user?.id;

    // If not authenticated, require email in request body
    if (!userId) {
      if (!email) {
        return sendError(
          400,
          "Email is required for unauthenticated OTP resend",
          res,
        );
      }
      // Get user ID by email for unauthenticated request
      const userFromEmail =
        await emailVerificationService.getUserByEmail(email);
      if (!userFromEmail) {
        return sendError(404, "User not found", res);
      }
      userId = userFromEmail.id;
    }

    // Type guard: ensure userId is defined
    if (!userId) {
      return sendError(400, "Could not identify user", res);
    }

    // Revoke any previous OTP tokens
    await emailVerificationService.revokeEmailVerificationTokens(userId);

    // Create new OTP token and send email
    const { tokenId } =
      await emailVerificationService.createAndSendEmailVerificationOTP(userId);

    // In development, also return OTP for testing purposes
    const isDevelopment = process.env.NODE_ENV === "development";

    if (isDevelopment) {
      // In development, also return OTP for testing
      const { otp } =
        await emailVerificationService.createEmailVerificationToken(userId);
      return sendSuccess(
        200,
        "OTP resent to your email (check response in dev)",
        res,
        {
          otp, // Only in development
          expiresIn: "15 minutes",
          tokenId,
          message: "Check your email for the verification code",
        },
      );
    }

    // In production, just confirm OTP was sent
    return sendSuccess(200, "OTP resent to your email", res, {
      expiresIn: "15 minutes",
      message: "Check your email for the verification code",
    });
  } catch (err) {
    console.error("[EMAIL] Error in resendOTP:", err);
    if (err instanceof Error) {
      if (err.message.includes("User not found")) {
        return sendError(404, "User not found", res);
      }
    }
    next(err);
  }
}
