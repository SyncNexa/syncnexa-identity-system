import type { Request, Response } from "express";
import * as securityService from "../services/security.service.js";
import { sendSuccess } from "../utils/response.js";
import { sendError } from "../utils/error.js";

/**
 * GET /security
 * Returns security information for the authenticated student
 * - Password strength (not the password itself)
 * - MFA status (enabled/disabled)
 * - Active sessions list
 */
export async function getSecurityInfo(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(400, "User ID required", res);
    }

    const securityInfo = await securityService.getSecurityInfo(userId);
    if (!securityInfo) {
      return sendError(404, "Security information not found", res);
    }

    return sendSuccess(
      200,
      "Security information retrieved",
      res,
      securityInfo,
    );
  } catch (err) {
    console.error("[SECURITY] Error in getSecurityInfo controller:", err);
    return sendError(500, "Failed to retrieve security information", res);
  }
}
