import verificationPillarModel from "../models/verificationPillar.model.js";
import verificationStepModel from "../models/verificationStep.model.js";
import * as emailVerificationModel from "../models/emailVerification.model.js";
import pool from "../config/db.js";
import { generateUUID } from "../utils/uuid.js";
import type { RowDataPacket } from "mysql2";

// Helper to convert Date to MySQL datetime format
function toMySQLDateTime(date: Date): string {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

// Step configurations for each pillar
const STEP_CONFIGS = {
  personal_info: [
    {
      step_name: "Face Match",
      step_order: 1,
      step_type: "automatic" as const,
      requirement_checklist: [
        { requirement: "Clear selfie photo", met: false },
        { requirement: "Neutral facial expression", met: false },
        { requirement: "Adequate lighting", met: false },
        { requirement: "Face must match government ID photo", met: false },
      ],
    },
    {
      step_name: "Contact Verification",
      step_order: 2,
      step_type: "automatic" as const,
      requirement_checklist: [
        { requirement: "Active email address", met: false },
        { requirement: "Active phone number", met: false },
        { requirement: "OTP confirmation for both", met: false },
      ],
    },
    {
      step_name: "Government ID",
      step_order: 3,
      step_type: "manual" as const,
      requirement_checklist: [
        { requirement: "Valid government-issued ID", met: false },
        { requirement: "Clear, readable image", met: false },
        { requirement: "Name must match profile", met: false },
        { requirement: "ID must not be expired", met: false },
      ],
    },
  ],
  academic_info: [
    {
      step_name: "Program & Level Validation",
      step_order: 1,
      step_type: "automatic" as const,
      requirement_checklist: [
        { requirement: "Institution selected", met: false },
        { requirement: "Program exists in institution catalog", met: false },
        { requirement: "Level matches program", met: false },
      ],
    },
    {
      step_name: "Session / Enrollment Logic Check",
      step_order: 2,
      step_type: "automatic" as const,
      requirement_checklist: [
        { requirement: "Academic session provided", met: false },
        { requirement: "Enrollment year plausible", met: false },
        { requirement: "Status aligns with current date", met: false },
      ],
    },
  ],
  documents: [
    {
      step_name: "Document Upload & Readability",
      step_order: 1,
      step_type: "automatic" as const,
      requirement_checklist: [
        { requirement: "Supported file type (PDF/JPG/PNG)", met: false },
        { requirement: "Text readable", met: false },
        { requirement: "No major cropping", met: false },
      ],
    },
    {
      step_name: "Content Match Check",
      step_order: 2,
      step_type: "automatic" as const,
      requirement_checklist: [
        { requirement: "Name matches profile", met: false },
        { requirement: "Institution matches selected school", met: false },
        { requirement: "Session/year matches academic info", met: false },
      ],
    },
    {
      step_name: "Freshness Validation",
      step_order: 3,
      step_type: "automatic" as const,
      requirement_checklist: [
        { requirement: "Document from current session/year", met: false },
        { requirement: "Within allowed validity window", met: false },
      ],
    },
  ],
  school: [
    {
      step_name: "Direct School Verification",
      step_order: 1,
      step_type: "external" as const,
      requirement_checklist: [
        { requirement: "Portal login OR verification code", met: false },
        { requirement: "School-issued confirmation", met: false },
      ],
    },
    {
      step_name: "School Email Verification",
      step_order: 2,
      step_type: "automatic" as const,
      requirement_checklist: [
        { requirement: "Active school email", met: false },
        { requirement: "OTP verification", met: false },
        { requirement: "Domain matches institution", met: false },
      ],
    },
    {
      step_name: "Admin Attestation",
      step_order: 3,
      step_type: "manual" as const,
      requirement_checklist: [
        { requirement: "Consistent documents", met: false },
        { requirement: "Academic info validated", met: false },
        { requirement: "Institution is trusted", met: false },
      ],
    },
  ],
};

export async function initializeVerificationCenterForUser(userId: string) {
  try {
    // Initialize pillars
    await verificationPillarModel.initializePillarsForUser(userId);

    // Initialize steps for each pillar
    const pillars = await verificationPillarModel.getPillarsByUser(userId);

    for (const pillar of pillars) {
      const stepConfigs =
        STEP_CONFIGS[pillar.pillar_name as VerificationPillarName];
      if (!stepConfigs) continue;

      for (const config of stepConfigs) {
        const step = await verificationStepModel.createStep({
          user_id: userId,
          pillar_id: pillar.id,
          step_name: config.step_name,
          step_order: config.step_order,
          step_type: config.step_type,
          requirement_checklist: config.requirement_checklist,
        });

        // Auto-verify Contact Verification step if email is already verified
        if (step && config.step_name === "Contact Verification") {
          const isEmailVerified =
            await emailVerificationModel.getEmailVerificationStatus(userId);
          if (isEmailVerified) {
            await verificationStepModel.updateStepStatus(step.id, "verified", {
              status_message:
                "Email verified during signup. Phone verification required for full completion.",
              verified_at: toMySQLDateTime(new Date()),
              last_attempted_at: toMySQLDateTime(new Date()),
            });
          }
        }
      }
    }

    return true;
  } catch (err) {
    console.error("Error initializing verification center:", err);
    return false;
  }
}

export async function getVerificationCenter(
  userId: string,
): Promise<VerificationCenter | null> {
  try {
    const pillars = await verificationPillarModel.getPillarsByUser(userId);
    const allSteps = await verificationStepModel.getStepsByUser(userId);

    let overallPercentage = 0;

    // Nest steps under each pillar for better structure
    const pillarsWithSteps = [];
    for (const pillar of pillars) {
      const pillarCompletion =
        await verificationPillarModel.calculatePillarCompletion(pillar.id);
      overallPercentage += (pillarCompletion * pillar.weight_percentage) / 100;

      // Get steps for this pillar
      const pillarSteps = allSteps.filter(
        (step) => step.pillar_id === pillar.id,
      );

      pillarsWithSteps.push({
        ...pillar,
        steps: pillarSteps,
      });
    }

    const isFullyVerified =
      pillars.length > 0 && pillars.every((p) => p.status === "verified");

    return {
      overall_verification_percentage: Math.round(overallPercentage),
      is_fully_verified: isFullyVerified,
      pillars: pillarsWithSteps,
    };
  } catch (err) {
    console.error("Error fetching verification center:", err);
    return null;
  }
}

export async function getVerificationPillar(
  userId: string,
  pillarName: VerificationPillarName,
) {
  try {
    const pillar = await verificationPillarModel.getPillarByUserAndName(
      userId,
      pillarName,
    );
    if (!pillar) return null;

    const steps = await verificationStepModel.getStepsByPillar(pillar.id);

    return {
      pillar,
      steps,
    };
  } catch (err) {
    console.error("Error fetching pillar details:", err);
    return null;
  }
}

export async function updateStepStatus(
  stepId: string,
  status: VerificationStepStatus,
  options?: {
    status_message?: string;
    failure_reason?: string;
    failure_suggestion?: string;
    admin_reviewer_id?: string;
    admin_review_notes?: string;
  },
) {
  try {
    const step = await verificationStepModel.getStepById(stepId);
    if (!step) throw new Error("Step not found");

    const updatePayload: any = {};

    if (options?.status_message)
      updatePayload.status_message = options.status_message;
    if (options?.failure_reason)
      updatePayload.failure_reason = options.failure_reason;
    if (options?.failure_suggestion)
      updatePayload.failure_suggestion = options.failure_suggestion;
    if (options?.admin_reviewer_id)
      updatePayload.admin_reviewer_id = options.admin_reviewer_id;
    if (options?.admin_review_notes)
      updatePayload.admin_review_notes = options.admin_review_notes;

    if (status === "verified") {
      updatePayload.verified_at = toMySQLDateTime(new Date());
    }
    updatePayload.last_attempted_at = toMySQLDateTime(new Date());

    const updated = await verificationStepModel.updateStepStatus(
      stepId,
      status,
      updatePayload,
    );

    if (updated) {
      // Update pillar status based on steps
      const pillarCompletion =
        await verificationPillarModel.calculatePillarCompletion(step.pillar_id);
      const newPillarStatus =
        pillarCompletion === 100 ? "verified" : "in_progress";
      await verificationPillarModel.updatePillarStatus(
        step.pillar_id,
        newPillarStatus,
        pillarCompletion,
      );
    }

    return updated;
  } catch (err) {
    console.error("Error updating step status:", err);
    return null;
  }
}

export async function retryStep(stepId: string) {
  try {
    const step = await verificationStepModel.getStepById(stepId);
    if (!step) throw new Error("Step not found");

    const canRetry = await verificationStepModel.canRetry(stepId);
    if (!canRetry) {
      throw new Error(
        "Maximum retry attempts reached. Please contact support.",
      );
    }

    const retried = await verificationStepModel.recordRetry(stepId);
    return retried;
  } catch (err) {
    console.error("Error retrying step:", err);
    return null;
  }
}

export async function reviewStepAsAdmin(
  stepId: string,
  adminId: string,
  status: "verified" | "failed",
  notes: string,
) {
  try {
    const updatePayload: {
      status_message?: string;
      failure_reason?: string;
      failure_suggestion?: string;
      admin_reviewer_id?: string;
      admin_review_notes?: string;
    } = {
      admin_reviewer_id: adminId,
      admin_review_notes: notes,
      status_message:
        status === "verified" ? "Verified by admin" : "Failed: " + notes,
    };

    if (status === "failed") {
      updatePayload.failure_reason = notes;
    }

    return await updateStepStatus(stepId, status, updatePayload);
  } catch (err) {
    console.error("Error reviewing step:", err);
    return null;
  }
}

export async function uploadStepEvidence(
  stepId: string,
  evidenceType: string,
  evidenceUrl: string,
  evidenceMetadata?: any,
) {
  try {
    const id = generateUUID();
    await pool.query(
      `INSERT INTO verification_step_evidence (id, step_id, evidence_type, evidence_url, evidence_metadata)
       VALUES (?, ?, ?, ?, ?)`,
      [
        id,
        stepId,
        evidenceType,
        evidenceUrl,
        evidenceMetadata ? JSON.stringify(evidenceMetadata) : null,
      ],
    );

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM verification_step_evidence WHERE id = ?`,
      [id],
    );

    return rows[0] || null;
  } catch (err) {
    console.error("Error uploading evidence:", err);
    return null;
  }
}

export async function getStepDetails(stepId: string) {
  try {
    const step = await verificationStepModel.getStepById(stepId);
    if (!step) return null;

    // Get evidence for this step
    const [evidenceRows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM verification_step_evidence WHERE step_id = ? ORDER BY uploaded_at DESC`,
      [stepId],
    );

    return {
      step,
      evidence: evidenceRows || [],
    };
  } catch (err) {
    console.error("Error fetching step details:", err);
    return null;
  }
}

export async function listPendingVerifications(params: {
  page?: number;
  limit?: number;
  pillar?: string;
  step_name?: string;
}) {
  try {
    const { page = 1, limit = 20, pillar, step_name } = params;
    const offset = (page - 1) * limit;

    const conditions: string[] = ["vs.status = 'pending'"];
    const values: any[] = [];

    if (pillar) {
      conditions.push("vp.pillar_name = ?");
      values.push(pillar);
    }

    if (step_name) {
      conditions.push("vs.step_name = ?");
      values.push(step_name);
    }

    const whereClause = conditions.join(" AND ");

    // Get total count
    const [countRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total 
       FROM verification_steps vs
       JOIN verification_pillars vp ON vs.pillar_id = vp.id
       WHERE ${whereClause}`,
      values,
    );
    const total = countRows[0]?.total || 0;

    // Get paginated results
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        vs.*,
        vp.pillar_name,
        vp.weight_percentage,
        u.email as user_email,
        u.first_name,
        u.last_name
       FROM verification_steps vs
       JOIN verification_pillars vp ON vs.pillar_id = vp.id
       JOIN users u ON vs.user_id = u.id
       WHERE ${whereClause}
       ORDER BY vs.last_attempted_at DESC, vs.created_at DESC
       LIMIT ? OFFSET ?`,
      [...values, limit, offset],
    );

    return {
      items: rows || [],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (err) {
    console.error("Error listing pending verifications:", err);
    return {
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
  }
}

// Helper function to check and update email verification status
export async function checkAndUpdateEmailVerification(userId: string) {
  try {
    // Check if email is verified
    const isEmailVerified =
      await emailVerificationModel.getEmailVerificationStatus(userId);
    if (!isEmailVerified) return;

    // Find the Contact Verification step in personal_info pillar
    const pillar = await verificationPillarModel.getPillarByUserAndName(
      userId,
      "personal_info",
    );
    if (!pillar) return;

    const steps = await verificationStepModel.getStepsByPillar(pillar.id);
    const contactStep = steps.find(
      (s) => s.step_name === "Contact Verification",
    );
    if (!contactStep) return;

    // Update step to verified if not already
    if (contactStep.status !== "verified") {
      await updateStepStatus(contactStep.id, "verified", {
        status_message: "Email verified during signup",
      });
    }
  } catch (err) {
    console.error("Error checking email verification:", err);
    throw err;
  }
}

export default {
  initializeVerificationCenterForUser,
  getVerificationCenter,
  getVerificationPillar,
  updateStepStatus,
  retryStep,
  reviewStepAsAdmin,
  uploadStepEvidence,
  getStepDetails,
  listPendingVerifications,
  checkAndUpdateEmailVerification,
};
