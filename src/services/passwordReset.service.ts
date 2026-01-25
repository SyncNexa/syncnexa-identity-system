import * as passwordResetModel from "../models/passwordReset.model.js";
import * as userModel from "../models/user.model.js";
import bcrypt from "bcrypt";

/**
 * Generate a 6-digit OTP
 */
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Request password reset - generates OTP and sends to email
 */
export async function requestPasswordReset(email: string) {
  try {
    // Find user by email
    const user = await userModel.selectUserByEmail(email);
    if (!user) {
      // Don't reveal if email exists for security reasons
      return null;
    }

    // Revoke any previous password reset OTP tokens
    await passwordResetModel.revokeAllPasswordResetTokens(user.id);

    // Create new OTP token
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const tokenId = await passwordResetModel.createPasswordResetToken(
      user.id,
      email,
      otp,
      expiresAt,
    );

    // TODO: In production, send OTP to user's email
    // For now, we'll return it in development mode for testing

    return { tokenId, otp, userId: user.id };
  } catch (err) {
    console.error("Error requesting password reset:", err);
    throw err;
  }
}

/**
 * Verify password reset OTP
 */
export async function verifyPasswordResetOTP(userId: string, otp: string) {
  try {
    // Find valid OTP token
    const tokenId = await passwordResetModel.findPasswordResetToken(
      userId,
      otp,
    );

    if (!tokenId) {
      throw new Error("Invalid or expired OTP");
    }

    return { tokenId, verified: true };
  } catch (err) {
    console.error("Error verifying password reset OTP:", err);
    throw err;
  }
}

/**
 * Reset password using OTP
 */
export async function resetPassword(
  userId: string,
  otp: string,
  newPassword: string,
) {
  try {
    // Verify OTP first
    const { tokenId } = await verifyPasswordResetOTP(userId, otp);

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update user password
    await userModel.updateUserPassword(userId, passwordHash);

    // Revoke the OTP token
    await passwordResetModel.revokePasswordResetToken(tokenId);

    // Revoke all other password reset tokens for this user
    await passwordResetModel.revokeAllPasswordResetTokens(userId);

    return { success: true, message: "Password reset successfully" };
  } catch (err) {
    console.error("Error resetting password:", err);
    throw err;
  }
}

/**
 * Get pending password reset token for a user (for testing purposes only)
 * Should not be exposed in production
 */
export async function getPendingPasswordResetToken(userId: string) {
  try {
    return await passwordResetModel.hasPendingPasswordResetToken(userId);
  } catch (err) {
    console.error("Error getting pending password reset token:", err);
    return false;
  }
}
