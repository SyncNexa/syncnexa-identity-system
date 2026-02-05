import studentDocModel from "../models/studentDocument.model.js";
import * as userModel from "../models/user.model.js";
import * as emailVerificationService from "./emailVerification.service.js";
import * as sessionModel from "../models/session.model.js";
import { sendEmailChangeAlertEmail } from "../utils/email.js";

export async function uploadIdentityDocument(payload: any) {
  // payload: { user_id, doc_type, filename, filepath, mime_type, file_size, meta }
  const doc = await studentDocModel.insertDocument(payload);
  return doc;
}

export async function updateIdentityDocument(
  id: number | string,
  updates: any,
) {
  const updated = await studentDocModel.updateDocument(id, updates);
  return updated;
}

export async function requestDocumentVerification(
  documentId: number | string,
  reviewerId: number | null,
  notes?: string,
  metadata?: any,
) {
  // create a verification record (initially pending or directly set status)
  const payload: any = { reviewer_id: reviewerId, status: "pending" };
  if (notes !== undefined) payload.notes = notes;
  if (metadata !== undefined) payload.metadata = metadata;
  const ver = await studentDocModel.createDocumentVerification(
    documentId,
    payload,
  );
  return ver;
}

export async function setDocumentVerificationStatus(
  verificationId: number | string,
  updates: any,
) {
  const ver = await studentDocModel.updateDocumentVerification(
    verificationId,
    updates,
  );
  return ver;
}

export async function getUserVerificationStatus(userId: number | string) {
  const rows = await studentDocModel.getLatestVerificationForUser(userId);
  // derive overall status: if any approved -> approved, else if any pending -> pending, else rejected or none
  if (!rows || !rows.length) return { overall: "none", documents: [] };
  const docs = rows.map((r: any) => ({ ...r }));
  const statuses = docs.map(
    (d: any) => d.verification_status || (d.is_verified ? "approved" : "none"),
  );
  if (statuses.includes("approved"))
    return { overall: "approved", documents: docs };
  if (statuses.includes("pending"))
    return { overall: "pending", documents: docs };
  return { overall: "rejected", documents: docs };
}

export async function getPersonalInfo(
  userId: string,
): Promise<PersonalInfo | null> {
  try {
    const user = await userModel.getUserPersonalInfo(userId);

    if (!user) {
      return null;
    }

    return {
      fullName: `${user.first_name} ${user.last_name}`,
      email: user.email,
      emailStatus: user.email_status as "pending" | "verified" | "failed",
      phoneNumber: user.phone,
      phoneStatus: user.phone_status as "pending" | "verified" | "failed",
      address: user.user_address || "",
      gender: user.gender as "male" | "female" | "other",
      linkedId: user.linked_id || null,
    };
  } catch (error) {
    console.error("Error fetching personal info:", error);
    throw error;
  }
}

export async function updatePersonalInfo(
  userId: string,
  payload: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    address?: string;
    gender?: string;
  },
  ipAddress?: string,
  userAgent?: string,
): Promise<{ data: PersonalInfo; emailVerificationRequired?: boolean }> {
  try {
    // Get current user data first to check if email actually changed
    const currentUser = await userModel.getUserPersonalInfo(userId);
    if (!currentUser) {
      throw new Error("User not found");
    }

    const emailChanged =
      payload.email !== undefined && payload.email !== currentUser.email;

    // Build update object with correct database column names
    const updates: any = {};
    if (payload.firstName !== undefined) updates.first_name = payload.firstName;
    if (payload.lastName !== undefined) updates.last_name = payload.lastName;
    if (payload.email !== undefined) updates.email = payload.email;
    if (payload.phoneNumber !== undefined) updates.phone = payload.phoneNumber;
    if (payload.address !== undefined) updates.user_address = payload.address;
    if (payload.gender !== undefined) updates.gender = payload.gender;

    // Update in database
    const updated = await userModel.updateUserPersonalInfo(userId, updates);
    if (!updated) {
      throw new Error("Failed to update personal information");
    }

    // If email was actually changed to a different one, handle verification reset, logging, and session termination
    if (emailChanged) {
      // Send alert email to old email address
      await sendEmailChangeAlertEmail(
        currentUser.email,
        payload.email!,
        ipAddress,
        userAgent,
      );

      // Log the email change for audit trail
      await userModel.logEmailChange(userId, currentUser.email, payload.email!);

      // Reset email verification status to pending
      await userModel.resetEmailVerificationStatus(userId);

      // Revoke existing verification tokens
      await emailVerificationService.revokeEmailVerificationTokens(userId);

      // Revoke all active sessions to force re-login
      await sessionModel.revokeAllUserSessions(userId);

      // Create and send new OTP to the new email
      await emailVerificationService.createAndSendEmailVerificationOTP(userId);
    }

    // Fetch and return updated personal info
    const user = await userModel.getUserPersonalInfo(userId);
    if (!user) {
      return null as any;
    }

    const personalInfo: PersonalInfo = {
      fullName: `${user.first_name} ${user.last_name}`,
      email: user.email,
      emailStatus: user.email_status as "pending" | "verified" | "failed",
      phoneNumber: user.phone,
      phoneStatus: user.phone_status as "pending" | "verified" | "failed",
      address: user.user_address || "",
      gender: user.gender as "male" | "female" | "other",
      linkedId: user.linked_id || null,
    };

    return {
      data: personalInfo,
      emailVerificationRequired: emailChanged,
    };
  } catch (error) {
    console.error("Error updating personal info:", error);
    throw error;
  }
}

export async function getMe(userId: string): Promise<UserMe | null> {
  try {
    const user = await userModel.getUserBasicInfo(userId);

    if (!user) {
      return null;
    }

    return {
      fullName: `${user.first_name} ${user.last_name}`,
      role: user.user_role,
      profileImage: user.profile_image || null,
      email: user.email,
      accountStatus: user.account_status as
        | "active"
        | "suspended"
        | "deactivated",
    };
  } catch (error) {
    console.error("Error fetching user info:", error);
    throw error;
  }
}

export async function getAcademicDetails(
  userId: string,
): Promise<AcademicDetails | null> {
  try {
    const student = await userModel.getStudentAcademicDetails(userId);

    if (!student) {
      return null;
    }

    return {
      institution: student.institution,
      department: student.department || null,
      level: student.student_level || null,
      program: student.program as
        | "secondary"
        | "undergraduate"
        | "postgraduate"
        | "diploma"
        | "certificate"
        | "other"
        | null,
      matricNumber: student.matric_number,
      admissionYear: student.admission_year || null,
      expectedGraduationYear: student.expected_graduation_year || null,
    };
  } catch (error) {
    console.error("Error fetching academic details:", error);
    throw error;
  }
}

export default {
  uploadIdentityDocument,
  updateIdentityDocument,
  requestDocumentVerification,
  setDocumentVerificationStatus,
  getUserVerificationStatus,
  getPersonalInfo,
  updatePersonalInfo,
  getMe,
  getAcademicDetails,
};
