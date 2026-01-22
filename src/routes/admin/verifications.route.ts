import { Router } from "express";
import * as adminController from "../../controllers/admin/admin.controller.js";
import {
  requireAdmin,
  auditLog,
} from "../../middlewares/admin/admin.middleware.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validateRequest } from "../../middlewares/validateRequest.middleware.js";
import adminVerificationValidator from "../../validators/adminVerification.validator.js";

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.get(
  "/verifications",
  auditLog("list_verifications"),
  validateRequest(adminVerificationValidator.listVerificationsSchema),
  adminController.listVerifications,
);

router.get(
  "/verifications/:id",
  auditLog("view_verification"),
  validateRequest(adminVerificationValidator.getVerificationSchema),
  adminController.getVerificationById,
);

router.patch(
  "/verifications/:id/status",
  auditLog("update_verification_status"),
  validateRequest(adminVerificationValidator.updateVerificationStatusSchema),
  adminController.updateVerificationStatus,
);

export default router;
