import { Router } from "express";
import * as appController from "../../controllers/admin/app.controller.js";
import {
  requireAdmin,
  auditLog,
} from "../../middlewares/admin/admin.middleware.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// App management
router.get("/apps", auditLog("list_apps"), appController.getAllApps);
router.patch(
  "/apps/:appId/status",
  auditLog("update_app_status"),
  appController.updateAppStatus,
);
router.post(
  "/apps/:appId/regenerate-secret",
  auditLog("regenerate_app_secret"),
  appController.regenerateAppSecret,
);
router.delete("/apps/:appId", auditLog("delete_app"), appController.deleteApp);

export default router;
