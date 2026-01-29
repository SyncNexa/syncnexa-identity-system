import type { Request, Response } from "express";
import { sendSuccess } from "../utils/response.js";
import { sendError } from "../utils/error.js";
import * as sessionService from "../services/session.service.js";
import { paramToString } from "../utils/params.js";

// Session Management
export async function createSession(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) return sendError(400, "user id required", res);

    const result = await sessionService.createSession({
      userId,
      ipAddress: req.ip || null,
      userAgent: req.headers["user-agent"] || null,
      ttlSeconds: req.body.ttl_seconds || 604800, // 7 days
    });

    if (!result.record) return sendError(500, "Failed to create session", res);
    return sendSuccess(201, "Session created", res, {
      token: result.token,
      record: result.record,
    });
  } catch (err) {
    console.error(err);
    return sendError(500, "Failed to create session", res);
  }
}

export async function listActiveSessions(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) return sendError(400, "user id required", res);

    const sessions = await sessionService.getActiveSessions(userId);

    // Format sessions for better UI display
    const formattedSessions = sessions.map((session: any) => ({
      id: session.id,
      device: {
        name: session.device_name || "Unknown Device",
        browser: session.browser || "Unknown Browser",
        type: session.device_type || "unknown",
      },
      ip_address: session.ip_address,
      location: session.location,
      last_activity: session.last_activity,
      created_at: session.created_at,
      is_current: false, // Could be set based on current token if needed
    }));

    return sendSuccess(200, "Active sessions", res, formattedSessions);
  } catch (err) {
    console.error(err);
    return sendError(500, "Failed to list sessions", res);
  }
}

export async function revokeSession(req: Request, res: Response) {
  try {
    const id = paramToString(req.params.id);
    if (!id) return sendError(400, "session id required", res);

    const updated = await sessionService.revokeSession(id);
    if (!updated) return sendError(404, "Session not found", res);

    return sendSuccess(200, "Session revoked", res, updated);
  } catch (err) {
    console.error(err);
    return sendError(500, "Failed to revoke session", res);
  }
}

export async function revokeAllSessions(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) return sendError(400, "user id required", res);

    const ok = await sessionService.revokeAllSessions(userId);
    if (!ok) return sendError(500, "Failed to revoke sessions", res);

    return sendSuccess(200, "All sessions revoked", res, null);
  } catch (err) {
    console.error(err);
    return sendError(500, "Failed to revoke sessions", res);
  }
}

// TOTP MFA Management
export async function setupTotp(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) return sendError(400, "user id required", res);

    const result = await sessionService.setupTotpMfa(userId);
    if (!result.record) return sendError(500, "Failed to setup TOTP", res);

    return sendSuccess(201, "TOTP setup", res, {
      secret: result.secret,
      qrCode: result.qrCode,
    });
  } catch (err) {
    console.error(err);
    return sendError(500, "Failed to setup TOTP", res);
  }
}

export async function enableTotp(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) return sendError(400, "user id required", res);

    const token = req.body.token;
    if (!token) return sendError(400, "token required", res);

    const result = await sessionService.enableTotpMfa(userId, token);
    if (!result) return sendError(401, "Invalid TOTP token", res);

    return sendSuccess(200, "TOTP enabled", res, {
      record: result.record,
      backupCodes: result.backupCodes,
    });
  } catch (err) {
    console.error(err);
    return sendError(500, "Failed to enable TOTP", res);
  }
}

export async function disableTotp(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) return sendError(400, "user id required", res);

    const updated = await sessionService.disableTotpMfa(userId);
    if (!updated) return sendError(404, "TOTP not found", res);

    return sendSuccess(200, "TOTP disabled", res, updated);
  } catch (err) {
    console.error(err);
    return sendError(500, "Failed to disable TOTP", res);
  }
}

export default {
  createSession,
  listActiveSessions,
  revokeSession,
  revokeAllSessions,
  setupTotp,
  enableTotp,
  disableTotp,
};
