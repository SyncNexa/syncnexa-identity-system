import type { Request, Response } from "express";
import * as institutionService from "../services/institution.service.js";
import { sendSuccess } from "../utils/response.js";
import { sendError } from "../utils/error.js";
import { paramToString } from "../utils/params.js";

export async function createRequest(req: Request, res: Response) {
  try {
    const userId = req.user?.id || req.body.user_id || req.body.userId;
    if (!userId) return sendError(400, "user_id required", res);
    const { institution, contact_email, contact_phone, payload } = req.body;
    if (!institution) return sendError(400, "institution required", res);
    const r = await institutionService.requestInstitutionVerification({
      user_id: userId,
      institution,
      contact_email: contact_email || null,
      contact_phone: contact_phone || null,
      payload: payload || null,
    });
    if (!r) return sendError(500, "Failed to create verification request", res);
    return sendSuccess(201, "Verification request created", res, r);
  } catch (err) {
    console.error(err);
    return sendError(500, "Create failed", res);
  }
}

export async function listRequests(req: Request, res: Response) {
  try {
    const userId = req.user?.id || req.query.user_id || req.query.userId;
    if (!userId) return sendError(400, "user_id required", res);
    const rows = await institutionService.getVerificationRequestsForUser(
      userId as string,
    );
    return sendSuccess(200, "Verification requests", res, rows);
  } catch (err) {
    console.error(err);
    return sendError(500, "Fetch failed", res);
  }
}

export async function updateRequest(req: Request, res: Response) {
  try {
    const id = paramToString(req.params.id);
    if (!id) return sendError(400, "id required", res);
    const updates = req.body;
    const updated = await institutionService.setVerificationRequestStatus(
      id,
      updates,
    );
    if (!updated) return sendError(404, "Request not found", res);
    return sendSuccess(200, "Request updated", res, updated);
  } catch (err) {
    console.error(err);
    return sendError(500, "Update failed", res);
  }
}

export default { createRequest, listRequests, updateRequest };
