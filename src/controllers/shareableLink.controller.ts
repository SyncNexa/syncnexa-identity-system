import type { Request, Response } from "express";
import { sendSuccess } from "../utils/response.js";
import { sendError } from "../utils/error.js";
import * as shareableLinkService from "../services/shareableLink.service.js";

export async function createLink(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(400, "user id required", res);

    const { resourceType, resourceId, scope, expiresAt, maxUses } = req.body;
    const result = await shareableLinkService.createShareableLink({
      userId,
      resourceType,
      resourceId,
      scope,
      expiresAt,
      maxUses,
    });
    if (!result.record) return sendError(500, "Could not create link", res);
    return sendSuccess(201, "Shareable link created", res, result);
  } catch (err) {
    console.error(err);
    return sendError(500, "Failed to create link", res);
  }
}

export async function revokeLink(req: Request, res: Response) {
  try {
    const id = req.params.id;
    if (!id) return sendError(400, "id required", res);
    const updated = await shareableLinkService.revokeShareableLink(id);
    if (!updated) return sendError(404, "Link not found", res);
    return sendSuccess(200, "Shareable link revoked", res, updated);
  } catch (err) {
    console.error(err);
    return sendError(500, "Failed to revoke link", res);
  }
}

export async function validateLink(req: Request, res: Response) {
  try {
    const token =
      (req.body && req.body.token) ||
      (req.query && (req.query.token as string));
    if (!token) return sendError(400, "token required", res);
    const result = await shareableLinkService.validateShareableLink(
      token as string
    );
    if (!result.valid)
      return sendError(401, `Invalid link: ${result.reason}`, res);
    return sendSuccess(200, "Link valid", res, result.record);
  } catch (err) {
    console.error(err);
    return sendError(500, "Failed to validate link", res);
  }
}

export default { createLink, revokeLink, validateLink };
