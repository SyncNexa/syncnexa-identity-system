import * as adminModel from "../../models/admin/admin.model.js";
import * as userModel from "../../models/admin/user.model.js";
import * as verificationModel from "../../models/admin/verification.model.js";

/**
 * Get dashboard statistics
 */
export async function getDashboardStats() {
  const [userStats, appStats, verificationStats] = await Promise.all([
    adminModel.getUserStats(),
    adminModel.getAppStats(),
    adminModel.getVerificationStats(),
  ]);

  return {
    users: userStats,
    apps: appStats,
    verifications: verificationStats,
  };
}

/**
 * Get audit logs
 */
export async function getAuditLogs(params: {
  page?: number;
  limit?: number;
  admin_id?: string;
  action?: string;
  resource_type?: string;
  start_date?: string;
  end_date?: string;
}) {
  return await adminModel.getAuditLogs(params);
}

/**
 * Create audit log
 */
export async function createAuditLog(data: {
  admin_id: string;
  admin_email: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  ip_address: string;
  user_agent: string;
  metadata?: any;
}) {
  return await adminModel.createAuditLog(data);
}

/**
 * Get all users with filters
 */
export async function getAllUsers(params: {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
  verified?: boolean;
}) {
  return await userModel.getAllUsers(params);
}

/**
 * Get user details by ID
 */
export async function getUserById(userId: string) {
  const user = await userModel.getUserById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

/**
 * Update user email verification status
 */
export async function verifyUserEmail(userId: string) {
  const updated = await userModel.updateUserStatus(userId, {
    email_verified: true,
  });

  if (!updated) {
    throw new Error("User not found or already verified");
  }

  return { message: "User email verified successfully" };
}

/**
 * Update user role
 */
export async function updateUserRole(
  userId: string,
  newRole: "student" | "developer" | "staff",
) {
  const updated = await userModel.updateUserRole(userId, newRole);

  if (!updated) {
    throw new Error("User not found");
  }

  return { message: "User role updated successfully" };
}

/**
 * Delete user
 */
export async function deleteUser(userId: string) {
  const deleted = await userModel.deleteUser(userId);

  if (!deleted) {
    throw new Error("User not found");
  }

  return { message: "User deleted successfully" };
}

/**
 * List verifications with filters
 */
export async function listVerifications(params: {
  page?: number;
  limit?: number;
  status?: verificationModel.VerificationStatus;
  type?: verificationModel.VerificationType;
  user_id?: string;
}) {
  return verificationModel.listVerifications(params);
}

/**
 * Get verification by ID
 */
export async function getVerificationById(id: string) {
  const verification = await verificationModel.getVerificationById(id);
  if (!verification) {
    throw new Error("Verification not found");
  }
  return verification;
}

/**
 * Update verification status (approve/reject)
 */
export async function updateVerificationStatus(
  id: string,
  status: verificationModel.VerificationStatus,
  adminId: string,
) {
  const updated = await verificationModel.updateVerificationStatus(
    id,
    status,
    adminId,
  );

  if (!updated) {
    throw new Error("Verification not found or already updated");
  }

  return { message: `Verification ${status} successfully` };
}
