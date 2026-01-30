import { Router } from "express";
import * as securityController from "../controllers/security.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();

/**
 * GET /security
 * Returns security information for the authenticated student
 * - Password strength (not the password itself)
 * - MFA status (enabled/disabled)
 * - Active sessions list
 */
router.get(
  "/",
  authenticate,
  authorizeRoles("student"),
  securityController.getSecurityInfo,
);

export default router;
