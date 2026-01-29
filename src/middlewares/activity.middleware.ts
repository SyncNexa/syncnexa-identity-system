import type { Request, Response, NextFunction } from "express";
import * as activityService from "../services/activity.service.js";

/**
 * Middleware to log user activity for authenticated users
 */
export function activityLog(action?: string, resourceType: string = "route") {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const user = req.user as any;
      if (!user?.id || !user?.email) {
        return next();
      }

      const ipAddress = req.ip || req.socket.remoteAddress || null;
      const userAgent = req.get("user-agent") || null;

      const resolvedAction =
        action || `${req.method} ${req.baseUrl}${req.path}`;

      const resourceId: string | null =
        (() => {
          const raw = req.params?.id ?? req.params?.userId ?? null;
          if (!raw) return null;
          return Array.isArray(raw) ? raw[0] : raw;
        })() ?? null;

      await activityService.logUserActivity({
        user_id: user.id,
        user_email: user.email,
        action: resolvedAction,
        resource_type: resourceType,
        resource_id: resourceId,
        ip_address: ipAddress,
        user_agent: userAgent,
        metadata: {
          params: req.params,
          query: req.query,
          route: req.baseUrl,
          path: req.path,
        },
      });
    } catch (err) {
      console.error("[ACTIVITY] Failed to log user activity:", err);
    }

    return next();
  };
}
