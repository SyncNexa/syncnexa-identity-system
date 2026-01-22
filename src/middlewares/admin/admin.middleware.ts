import type { Request, Response, NextFunction } from "express";

/**
 * Middleware to restrict access to admin and staff roles only
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  const allowedRoles = ["staff", "developer"];

  if (!allowedRoles.includes(req.user.user_role)) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    });
  }

  next();
}

/**
 * Middleware to restrict access to staff role only (higher privilege)
 */
export function requireStaff(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (req.user.user_role !== "staff") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Staff privileges required.",
    });
  }

  next();
}

/**
 * Middleware to log admin actions for audit trail
 */
export function auditLog(action: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const admin_id = req.user?.id || "unknown";
    const admin_email = req.user?.email || "unknown";
    const timestamp = new Date().toISOString();
    const ip_address = req.ip || req.socket.remoteAddress || "unknown";
    const user_agent = req.get("user-agent") || "unknown";

    // Store audit info in request for later use
    req.auditLog = {
      action,
      admin_id,
      admin_email,
      timestamp,
      ip_address,
      user_agent,
    };

    // Log to console (in production, this should go to a dedicated audit log service)
    console.log(
      `[AUDIT] ${timestamp} - ${admin_email} (${admin_id}) performed: ${action} from ${ip_address}`,
    );

    next();
  };
}
