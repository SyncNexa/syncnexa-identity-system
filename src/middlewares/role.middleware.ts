import type { Request, Response, NextFunction } from "express";

export function authorizeRoles(
  ...allowedRoles: ("student" | "developer" | "staff")[]
) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!allowedRoles.includes(req.user.user_role)) {
      return res.status(403).json({ message: "Forbidden: Insufficient role" });
    }

    req.authRole = req.user.user_role;
    next();
  };
}
