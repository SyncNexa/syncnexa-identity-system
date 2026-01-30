import type { RowDataPacket } from "mysql2";
import generateUUID from "../utils/uuid.js";
import pool from "../config/db.js";

export async function createStep(payload: {
  user_id: string;
  pillar_id: string;
  step_name: string;
  step_order: number;
  step_type: StepType;
  requirement_checklist?: any;
  metadata?: any;
}) {
  try {
    const id = generateUUID();
    await pool.query(
      `INSERT INTO verification_steps 
       (id, user_id, pillar_id, step_name, step_order, step_type, requirement_checklist, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        payload.user_id,
        payload.pillar_id,
        payload.step_name,
        payload.step_order,
        payload.step_type,
        payload.requirement_checklist
          ? JSON.stringify(payload.requirement_checklist)
          : null,
        payload.metadata ? JSON.stringify(payload.metadata) : null,
      ],
    );

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM verification_steps WHERE id = ?`,
      [id],
    );
    return (rows?.[0] as VerificationStep) || null;
  } catch (err) {
    console.error("Error creating verification step:", err);
    return null;
  }
}

export async function getStepsByPillar(pillarId: string) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM verification_steps WHERE pillar_id = ? ORDER BY step_order ASC`,
      [pillarId],
    );
    return (rows as VerificationStep[]) || [];
  } catch (err) {
    console.error("Error fetching steps by pillar:", err);
    return [];
  }
}

export async function getStepsByUser(userId: string) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM verification_steps WHERE user_id = ? ORDER BY created_at DESC`,
      [userId],
    );
    return (rows as VerificationStep[]) || [];
  } catch (err) {
    console.error("Error fetching steps by user:", err);
    return [];
  }
}

export async function getStepById(stepId: string) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM verification_steps WHERE id = ?`,
      [stepId],
    );
    return (rows?.[0] as VerificationStep) || null;
  } catch (err) {
    console.error("Error fetching step:", err);
    return null;
  }
}

export async function updateStepStatus(
  stepId: string,
  status: VerificationStepStatus,
  payload?: {
    status_message?: string;
    failure_reason?: string;
    failure_suggestion?: string;
    last_attempted_at?: string;
    verified_at?: string;
    retry_count?: number;
    admin_reviewer_id?: string;
    admin_review_notes?: string;
  },
) {
  try {
    const fields: string[] = ["status = ?"];
    const values: any[] = [status];

    if (payload) {
      if (payload.status_message !== undefined) {
        fields.push("status_message = ?");
        values.push(payload.status_message);
      }
      if (payload.failure_reason !== undefined) {
        fields.push("failure_reason = ?");
        values.push(payload.failure_reason);
      }
      if (payload.failure_suggestion !== undefined) {
        fields.push("failure_suggestion = ?");
        values.push(payload.failure_suggestion);
      }
      if (payload.last_attempted_at !== undefined) {
        fields.push("last_attempted_at = ?");
        values.push(payload.last_attempted_at);
      }
      if (payload.verified_at !== undefined) {
        fields.push("verified_at = ?");
        values.push(payload.verified_at);
      }
      if (payload.retry_count !== undefined) {
        fields.push("retry_count = ?");
        values.push(payload.retry_count);
      }
      if (payload.admin_reviewer_id !== undefined) {
        fields.push("admin_reviewer_id = ?");
        values.push(payload.admin_reviewer_id);
      }
      if (payload.admin_review_notes !== undefined) {
        fields.push("admin_review_notes = ?");
        values.push(payload.admin_review_notes);
      }
    }

    fields.push("updated_at = NOW()");
    values.push(stepId);

    await pool.query(
      `UPDATE verification_steps SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );

    return await getStepById(stepId);
  } catch (err) {
    console.error("Error updating step status:", err);
    return null;
  }
}

export async function recordRetry(stepId: string) {
  try {
    const step = await getStepById(stepId);
    if (!step) return null;

    const newRetryCount = (step.retry_count || 0) + 1;
    return await updateStepStatus(stepId, "pending", {
      last_attempted_at: new Date().toISOString(),
      retry_count: newRetryCount,
    });
  } catch (err) {
    console.error("Error recording retry:", err);
    return null;
  }
}

export async function canRetry(stepId: string): Promise<boolean> {
  try {
    const step = await getStepById(stepId);
    if (!step) return false;
    return (step.retry_count || 0) < (step.max_retries || 3);
  } catch (err) {
    console.error("Error checking retry eligibility:", err);
    return false;
  }
}

export default {
  createStep,
  getStepsByPillar,
  getStepsByUser,
  getStepById,
  updateStepStatus,
  recordRetry,
  canRetry,
};
