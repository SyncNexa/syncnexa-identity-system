import * as emailVerificationModel from "../models/emailVerification.model.js";

/**
 * Generate a 6-digit OTP
 */
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Create an OTP verification token for email verification
 */
export async function createEmailVerificationToken(userId: string) {
  try {
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const tokenId = await emailVerificationModel.createEmailVerificationToken(
      userId,
      otp,
      expiresAt,
    );

    return { tokenId, otp };
  } catch (err) {
    console.error("Error creating email verification token:", err);
    throw err;
  }
}

/**
 * Verify OTP and mark email as verified
 */
export async function verifyEmailOTP(userId: string, otp: string) {
  try {
    // Find valid OTP token
    const tokenId = await emailVerificationModel.findEmailVerificationToken(
      userId,
      otp,
    );

    if (!tokenId) {
      throw new Error("Invalid or expired OTP");
    }

    // Mark token as used
    await emailVerificationModel.revokeVerificationToken(tokenId);

    // Mark user email as verified
    await emailVerificationModel.markEmailAsVerified(userId);

    return true;
  } catch (err) {
    console.error("Error verifying email OTP:", err);
    throw err;
  }
}

/**
 * Revoke all OTP tokens for a user
 */
export async function revokeEmailVerificationTokens(userId: string) {
  try {
    return await emailVerificationModel.revokeAllEmailVerificationTokens(
      userId,
    );
  } catch (err) {
    console.error("Error revoking email verification tokens:", err);
    throw err;
  }
}

/**
 * Check if a user's email is verified
 */
export async function isEmailVerified(userId: string) {
  try {
    return await emailVerificationModel.getEmailVerificationStatus(userId);
  } catch (err) {
    console.error("Error checking email verification status:", err);
    return false;
  }
}

/**
 * Get pending OTP token for a user (for testing purposes only)
 * Should not be exposed in production
 */
export async function getPendingOTPToken(userId: string) {
  try {
    return await emailVerificationModel.getPendingEmailVerificationToken(
      userId,
    );
  } catch (err) {
    console.error("Error getting pending OTP token:", err);
    return null;
  }
}
