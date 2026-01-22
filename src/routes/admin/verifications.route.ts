import { Router } from "express";
import * as adminController from "../../controllers/admin/admin.controller.js";
import {
  requireAdmin,
  auditLog,
} from "../../middlewares/admin/admin.middleware.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.get(
  "/verifications",
  auditLog("list_verifications"),
  adminController.listVerifications,
);

router.get(
  "/verifications/:id",
  auditLog("view_verification"),
  adminController.getVerificationById,
);

router.patch(
  "/verifications/:id/status",
  auditLog("update_verification_status"),
  adminController.updateVerificationStatus,
);

export default router;
