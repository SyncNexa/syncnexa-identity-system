import type { Request, Response } from "express";
import { sendSuccess } from "../utils/response.js";
import { sendError } from "../utils/error.js";
import { paramToString } from "../utils/params.js";
import * as schoolVerificationService from "../services/schoolVerification.service.js";

export async function initiateSchoolVerification(req: Request, res: Response) {
  try {
    const { institution_code, matric_number } = req.body || {};
    if (!institution_code || !matric_number) {
      return sendError(
        400,
        "institution_code and matric_number are required",
        res,
      );
    }

    const result = await schoolVerificationService.initiateSchoolVerification({
      user_id: req.user?.id as string,
      institution_code,
      matric_number,
    });

    return sendSuccess(201, "School verification initiated", res, result);
  } catch (err) {
    console.error(err);
    return sendError(500, "Failed to initiate school verification", res);
  }
}

export async function handleSchoolVerificationCallback(
  req: Request,
  res: Response,
) {
  try {
    const requestId = paramToString(req.params.requestId);
    const payload = req.body;

    if (!requestId) {
      return sendError(400, "requestId is required", res);
    }

    if (payload?.request_id && payload.request_id !== requestId) {
      return sendError(400, "request_id mismatch", res);
    }

    const signature = req.get("x-request-signature") || undefined;
    const timestamp = req.get("x-request-timestamp") || undefined;
    const rawBody = req.rawBody || JSON.stringify(payload || {});

    const updated = await schoolVerificationService.handleSchoolCallback({
      requestId,
      payload,
      rawBody,
      signature,
      timestamp,
    });

    if (!updated) {
      return sendError(400, "Callback could not be processed", res);
    }

    return sendSuccess(200, "Callback processed", res, {
      request_id: requestId,
      status: updated.status,
      verification_outcome: updated.verification_outcome,
    });
  } catch (err) {
    console.error(err);
    return sendError(500, "Failed to process callback", res);
  }
}

export default {
  initiateSchoolVerification,
  handleSchoolVerificationCallback,
};
