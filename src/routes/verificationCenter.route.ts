import { Router } from "express";
import * as verificationCenterController from "../controllers/verificationCenter.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validateRequest.middleware.js";
import verificationCenterValidator from "../validators/verificationCenter.validator.js";

const router = Router();

// User routes (authenticated)
router.get(
  "/",
  authenticate,
  validateRequest(verificationCenterValidator.getVerificationCenterSchema),
  verificationCenterController.getVerificationCenter,
);

router.get(
  "/pillar/:pillar",
  authenticate,
  validateRequest(verificationCenterValidator.getPillarSchema),
  verificationCenterController.getVerificationPillar,
);

router.patch(
  "/step/:stepId/status",
  authenticate,
  validateRequest(verificationCenterValidator.updateStepStatusSchema),
  verificationCenterController.updateStepStatus,
);

router.post(
  "/step/:stepId/retry",
  authenticate,
  validateRequest(verificationCenterValidator.retryStepSchema),
  verificationCenterController.retryVerificationStep,
);

router.post(
  "/step/:stepId/evidence",
  authenticate,
  validateRequest(verificationCenterValidator.uploadEvidenceSchema),
  verificationCenterController.uploadStepEvidence,
);

// Admin routes (authenticated + admin check)
router.post(
  "/admin/step/:stepId/review",
  authenticate,
  validateRequest(verificationCenterValidator.adminReviewStepSchema),
  verificationCenterController.adminReviewStep,
);

router.get(
  "/admin/pending",
  authenticate,
  validateRequest(verificationCenterValidator.listPendingSchema),
  verificationCenterController.listPendingVerifications,
);

router.get(
  "/admin/user/:userId",
  authenticate,
  validateRequest(verificationCenterValidator.getUserStatusSchema),
  verificationCenterController.getUserVerificationStatus,
);

router.get(
  "/admin/step/:stepId",
  authenticate,
  validateRequest(verificationCenterValidator.getStepDetailsSchema),
  verificationCenterController.getStepDetails,
);

export default router;
