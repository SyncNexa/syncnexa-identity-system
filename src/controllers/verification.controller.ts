import type { Request, Response } from "express";
import * as verificationService from "../services/verification.service.js";
import { sendSuccess } from "../utils/response.js";
import { sendError } from "../utils/error.js";
import { paramToString } from "../utils/params.js";

export async function issueToken(req: Request, res: Response) {
  try {
    const { scope } = req.body;
    if (!scope) return sendError(400, "scope required", res);
    const issuedFor =
      req.body.issued_for || req.body.user_id || req.user?.id || null;
    const issuedBy = req.user?.id || null;
    const ttl = Number(req.body.ttl) || 300;
    const metadata = req.body.metadata || null;
    const result = await verificationService.issueVerificationToken(
      scope,
      issuedFor,
      issuedBy,
      ttl,
      metadata,
    );
    if (!result) return sendError(500, "Failed to issue token", res);
    return sendSuccess(201, "Verification token issued", res, result);
  } catch (err) {
    console.error(err);
    return sendError(500, "Issue failed", res);
  }
}

export async function revokeToken(req: Request, res: Response) {
  try {
    const id = paramToString(req.params.id);
    if (!id) return sendError(400, "id required", res);
    const updated = await verificationService.revokeVerificationToken(id);
    if (!updated) return sendError(404, "Token not found", res);
    return sendSuccess(200, "Token revoked", res, updated);
  } catch (err) {
    console.error(err);
    return sendError(500, "Revoke failed", res);
  }
}

export async function validateToken(req: Request, res: Response) {
  try {
    const token = req.body.token || req.query.token;
    if (!token) return sendError(400, "token required", res);
    const ok = await verificationService.validateVerificationToken(
      token as string,
    );
    if (!ok.valid) return sendError(401, `Invalid token: ${ok.reason}`, res);
    // Log usage
    const log = await verificationService.logVerificationUse(
      ok.record?.id || null,
      (req.user?.id as any) || req.ip,
      "validate",
      { accessed: true },
    );
    return sendSuccess(200, "Token valid", res, {
      decoded: ok.decoded,
      record: ok.record,
      log,
    });
  } catch (err) {
    console.error(err);
    return sendError(500, "Validate failed", res);
  }
}

export async function getLogs(req: Request, res: Response) {
  try {
    const tokenId = paramToString(req.params.id);
    if (!tokenId) return sendError(400, "token id required", res);
    const rows = await verificationService.getVerificationLogs(tokenId);
    return sendSuccess(200, "Verification logs", res, rows);
  } catch (err) {
    console.error(err);
    return sendError(500, "Fetch failed", res);
  }
}

export default { issueToken, revokeToken, validateToken, getLogs };
