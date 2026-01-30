import type { Request, Response } from "express";
import * as verificationCenterService from "../services/verificationCenter.service.js";
import { sendSuccess } from "../utils/response.js";
import { sendError } from "../utils/error.js";
import { paramToString } from "../utils/params.js";

export async function getVerificationCenter(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) return sendError(400, "user id required", res);

    const center =
      await verificationCenterService.getVerificationCenter(userId);
    if (!center)
      return sendError(500, "Failed to fetch verification center", res);

    return sendSuccess(200, "Verification center", res, center);
  } catch (err) {
    console.error(err);
    return sendError(500, "Fetch failed", res);
  }
}

export async function getVerificationPillar(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) return sendError(400, "user id required", res);

    const pillarName = paramToString(
      req.params.pillar,
    ) as VerificationPillarName;
    if (!pillarName) return sendError(400, "pillar name required", res);

    const pillarData = await verificationCenterService.getVerificationPillar(
      userId,
      pillarName,
    );
    if (!pillarData) return sendError(404, "Pillar not found", res);

    return sendSuccess(200, "Pillar details", res, pillarData);
  } catch (err) {
    console.error(err);
    return sendError(500, "Fetch failed", res);
  }
}

export async function updateStepStatus(req: Request, res: Response) {
  try {
    const stepId = paramToString(req.params.stepId);
    if (!stepId) return sendError(400, "step id required", res);

    const { status, status_message, failure_reason, failure_suggestion } =
      req.body;
    if (!status) return sendError(400, "status required", res);

    const updated = await verificationCenterService.updateStepStatus(
      stepId,
      status,
      {
        status_message,
        failure_reason,
        failure_suggestion,
      },
    );
    if (!updated) return sendError(500, "Failed to update step", res);

    return sendSuccess(200, "Step updated", res, updated);
  } catch (err) {
    console.error(err);
    return sendError(500, "Update failed", res);
  }
}

export async function retryVerificationStep(req: Request, res: Response) {
  try {
    const stepId = paramToString(req.params.stepId);
    if (!stepId) return sendError(400, "step id required", res);

    const retried = await verificationCenterService.retryStep(stepId);
    if (!retried) return sendError(500, "Failed to retry step", res);

    return sendSuccess(200, "Step retry initiated", res, retried);
  } catch (err) {
    if (err instanceof Error) {
      if (err.message.includes("Maximum retry attempts"))
        return sendError(429, err.message, res);
    }
    console.error(err);
    return sendError(500, "Retry failed", res);
  }
}

export async function adminReviewStep(req: Request, res: Response) {
  try {
    const stepId = paramToString(req.params.stepId);
    if (!stepId) return sendError(400, "step id required", res);

    const adminId = (req.user as any)?.id;
    if (!adminId) return sendError(401, "admin id required", res);

    const { status, notes } = req.body;
    if (!status || !["verified", "failed"].includes(status))
      return sendError(400, "valid status required", res);
    if (!notes) return sendError(400, "notes required", res);

    const reviewed = await verificationCenterService.reviewStepAsAdmin(
      stepId,
      adminId,
      status,
      notes,
    );
    if (!reviewed) return sendError(500, "Failed to review step", res);

    return sendSuccess(200, "Step reviewed", res, reviewed);
  } catch (err) {
    console.error(err);
    return sendError(500, "Review failed", res);
  }
}

export async function uploadStepEvidence(req: Request, res: Response) {
  try {
    const stepId = paramToString(req.params.stepId);
    if (!stepId) return sendError(400, "step id required", res);

    const { evidence_type, evidence_url, evidence_metadata } = req.body;
    if (!evidence_type || !evidence_url)
      return sendError(400, "evidence_type and evidence_url required", res);

    const evidence = await verificationCenterService.uploadStepEvidence(
      stepId,
      evidence_type,
      evidence_url,
      evidence_metadata,
    );
    if (!evidence) return sendError(500, "Failed to upload evidence", res);

    return sendSuccess(201, "Evidence uploaded", res, evidence);
  } catch (err) {
    console.error(err);
    return sendError(500, "Upload failed", res);
  }
}

export async function getStepDetails(req: Request, res: Response) {
  try {
    const stepId = paramToString(req.params.stepId);
    if (!stepId) return sendError(400, "step id required", res);

    const details = await verificationCenterService.getStepDetails(stepId);
    if (!details) return sendError(404, "Step not found", res);

    return sendSuccess(200, "Step details", res, details);
  } catch (err) {
    console.error(err);
    return sendError(500, "Fetch failed", res);
  }
}

export async function getUserVerificationStatus(req: Request, res: Response) {
  try {
    const userId = paramToString(req.params.userId);
    if (!userId) return sendError(400, "user id required", res);

    const status =
      await verificationCenterService.getVerificationCenter(userId);
    if (!status) return sendError(404, "Verification status not found", res);

    return sendSuccess(200, "User verification status", res, status);
  } catch (err) {
    console.error(err);
    return sendError(500, "Fetch failed", res);
  }
}

export async function listPendingVerifications(req: Request, res: Response) {
  try {
    const { page = 1, limit = 20, pillar, step_name } = req.query;

    const pending = await verificationCenterService.listPendingVerifications({
      page: Number(page),
      limit: Number(limit),
      pillar: pillar as string,
      step_name: step_name as string,
    });

    return sendSuccess(200, "Pending verifications", res, pending);
  } catch (err) {
    console.error(err);
    return sendError(500, "Fetch failed", res);
  }
}

export default {
  getVerificationCenter,
  getVerificationPillar,
  updateStepStatus,
  retryVerificationStep,
  adminReviewStep,
  uploadStepEvidence,
  getStepDetails,
  getUserVerificationStatus,
  listPendingVerifications,
};
