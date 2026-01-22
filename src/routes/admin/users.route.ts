import { Router } from "express";
import * as adminController from "../../controllers/admin/admin.controller.js";
import {
  requireAdmin,
  auditLog,
} from "../../middlewares/admin/admin.middleware.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// Dashboard
router.get(
  "/dashboard/stats",
  auditLog("view_dashboard_stats"),
  adminController.getDashboardStats,
);

// Audit logs
router.get(
  "/audit-logs",
  auditLog("view_audit_logs"),
  adminController.getAuditLogs,
);

// User management
router.get("/users", auditLog("list_users"), adminController.getAllUsers);
router.get(
  "/users/:userId",
  auditLog("view_user"),
  adminController.getUserById,
);
router.patch(
  "/users/:userId/verify-email",
  auditLog("verify_user_email"),
  adminController.verifyUserEmail,
);
router.patch(
  "/users/:userId/role",
  auditLog("update_user_role"),
  adminController.updateUserRole,
);
router.delete(
  "/users/:userId",
  auditLog("delete_user"),
  adminController.deleteUser,
);

export default router;
