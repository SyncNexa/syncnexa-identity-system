import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { activityLog } from "../middlewares/activity.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import { validateRequest } from "../middlewares/validateRequest.middleware.js";

import * as studentsController from "../controllers/students.controller.js";
import * as activityController from "../controllers/activity.controller.js";
import * as academicController from "../controllers/academic.controller.js";
import * as institutionController from "../controllers/institution.controller.js";
import * as studentCardController from "../controllers/studentCard.controller.js";
import * as shareableLinkController from "../controllers/shareableLink.controller.js";
import * as verificationController from "../controllers/verification.controller.js";
import * as portfolioController from "../controllers/portfolio.controller.js";
import * as cvController from "../controllers/cv.controller.js";
import * as sessionController from "../controllers/session.controller.js";
import * as dashboardController from "../controllers/dashboard.controller.js";

import studentValidator from "../validators/student.validator.js";
import academicValidator from "../validators/academic.validator.js";
import verificationValidator from "../validators/verification.validator.js";
import shareableLinkValidator from "../validators/shareableLink.validator.js";
import institutionValidator from "../validators/institution.validator.js";
import studentCardValidator from "../validators/studentCard.validator.js";
import portfolioValidator from "../validators/portfolio.validator.js";
import cvValidator from "../validators/cv.validator.js";
import sessionValidator from "../validators/session.validator.js";
import dashboardValidator from "../validators/dashboard.validator.js";

const router = express.Router();

// Apply authentication to all routes in this router
router.use(authenticate);
router.use(activityLog());

// User activity logs (students)
router.get(
  "/activities",
  authorizeRoles("student"),
  activityController.getMyActivities,
);

router.post("/documents", studentsController.uploadDocument);
router.patch("/documents/:id", studentsController.updateDocument);
router.post("/documents/:id/verify", studentsController.requestVerification);
router.patch("/verifications/:id", studentsController.setVerificationStatus);
router.get("/verification-status", studentsController.getVerificationStatus);

// Academic records & transcripts
router.post(
  "/academics",
  authorizeRoles("student"),
  academicController.addRecord,
);
router.patch(
  "/academics/:id",
  authorizeRoles("student"),
  academicController.updateRecord,
);
router.get(
  "/academics",
  authorizeRoles("student", "staff"),
  academicController.listRecords,
);
router.post(
  "/academics/:academicId/transcripts",
  authorizeRoles("student"),
  academicController.uploadTranscript,
);
router.get(
  "/academics/:academicId/transcripts",
  authorizeRoles("student", "staff"),
  academicController.listTranscripts,
);

// Institution verification requests
router.post(
  "/verification-requests",
  authorizeRoles("student"),
  validateRequest(institutionValidator.createInstitutionVerificationSchema),
  institutionController.createRequest,
);
router.get(
  "/verification-requests",
  authorizeRoles("student", "staff"),
  institutionController.listRequests,
);
router.patch(
  "/verification-requests/:id",
  authorizeRoles("staff"),
  validateRequest(institutionValidator.updateInstitutionVerificationSchema),
  institutionController.updateRequest,
);

// Student cards (digital)
router.post(
  "/cards",
  authorizeRoles("student"),
  validateRequest(studentCardValidator.createCardSchema),
  studentCardController.createCard,
);
router.post(
  "/cards/:id/token",
  authorizeRoles("student"),
  validateRequest(studentCardValidator.issueTokenSchema),
  studentCardController.issueToken,
);
router.post(
  "/cards/verify",
  authorizeRoles("student", "staff"),
  validateRequest(studentCardValidator.verifyTokenSchema),
  studentCardController.verifyToken,
);

// Verification token APIs
router.post(
  "/verification-tokens",
  authorizeRoles("student"),
  validateRequest(verificationValidator.issueVerificationSchema),
  verificationController.issueToken,
);
router.patch(
  "/verification-tokens/:id/revoke",
  authorizeRoles("student"),
  validateRequest(verificationValidator.revokeVerificationSchema),
  verificationController.revokeToken,
);
router.post(
  "/verification-tokens/validate",
  authorizeRoles("student", "staff"),
  validateRequest(verificationValidator.validateVerificationSchema),
  verificationController.validateToken,
);
router.get(
  "/verification-tokens/:id/logs",
  authorizeRoles("student", "staff"),
  verificationController.getLogs,
);

// Shareable links (privacy controls)
router.post(
  "/shareable-links",
  authorizeRoles("student"),
  validateRequest(shareableLinkValidator.createShareableLinkSchema),
  shareableLinkController.createLink,
);
router.patch(
  "/shareable-links/:id/revoke",
  authorizeRoles("student"),
  validateRequest(shareableLinkValidator.revokeShareableLinkSchema),
  shareableLinkController.revokeLink,
);
router.post(
  "/shareable-links/validate",
  authorizeRoles("student", "staff", "developer"),
  validateRequest(shareableLinkValidator.validateShareableLinkSchema),
  shareableLinkController.validateLink,
);

// Portfolio routes
router.post(
  "/projects",
  authorizeRoles("student"),
  validateRequest(portfolioValidator.createProjectSchema),
  portfolioController.createProject,
);
router.patch(
  "/projects/:id",
  authorizeRoles("student"),
  validateRequest(portfolioValidator.updateProjectSchema),
  portfolioController.updateProject,
);
router.get(
  "/projects",
  authorizeRoles("student"),
  portfolioController.listProjects,
);

router.post(
  "/certificates",
  authorizeRoles("student"),
  validateRequest(portfolioValidator.createCertificateSchema),
  portfolioController.createCertificate,
);
router.patch(
  "/certificates/:id",
  authorizeRoles("student"),
  validateRequest(portfolioValidator.updateCertificateSchema),
  portfolioController.updateCertificate,
);
router.get(
  "/certificates",
  authorizeRoles("student"),
  portfolioController.listCertificates,
);

// CV generation
router.get(
  "/cv",
  authorizeRoles("student"),
  validateRequest(cvValidator.getCvSchema),
  cvController.getCv,
);

// Session Management & MFA
router.post(
  "/sessions",
  authorizeRoles("student", "developer", "staff"),
  validateRequest(sessionValidator.createSessionSchema),
  sessionController.createSession,
);
router.get(
  "/sessions",
  authorizeRoles("student", "developer", "staff"),
  sessionController.listActiveSessions,
);
router.patch(
  "/sessions/:id/revoke",
  authorizeRoles("student", "developer", "staff"),
  validateRequest(sessionValidator.revokeSessionSchema),
  sessionController.revokeSession,
);
router.post(
  "/sessions/revoke-all",
  authorizeRoles("student", "developer", "staff"),
  sessionController.revokeAllSessions,
);

// TOTP MFA
router.post(
  "/mfa/totp/setup",
  authorizeRoles("student", "developer", "staff"),
  sessionController.setupTotp,
);
router.post(
  "/mfa/totp/enable",
  authorizeRoles("student", "developer", "staff"),
  validateRequest(sessionValidator.enableTotpSchema),
  sessionController.enableTotp,
);
router.post(
  "/mfa/totp/disable",
  authorizeRoles("student", "developer", "staff"),
  sessionController.disableTotp,
);

// Dashboard & Progress
router.get(
  "/dashboard",
  authorizeRoles("student"),
  validateRequest(dashboardValidator.getDashboardSchema),
  dashboardController.getDashboard,
);
router.get(
  "/dashboard/progress",
  authorizeRoles("student"),
  validateRequest(dashboardValidator.getDashboardSchema),
  dashboardController.getProgress,
);
router.get(
  "/dashboard/suggestions",
  authorizeRoles("student"),
  validateRequest(dashboardValidator.getDashboardSchema),
  dashboardController.getSuggestions,
);

router.get(
  "/overview",
  authorizeRoles("student"),
  validateRequest(dashboardValidator.getDashboardSchema),
  dashboardController.getStudentOverview,
);

// Attach multer and validation to upload endpoints
router.post(
  "/documents",
  authorizeRoles("student"),
  upload.uploadSingle("document"),
  validateRequest(studentValidator.uploadDocumentSchema),
  studentsController.uploadDocument,
);

router.post(
  "/academics/:academicId/transcripts",
  authorizeRoles("student"),
  upload.uploadSingle("transcript"),
  validateRequest(academicValidator.uploadTranscriptSchema),
  academicController.uploadTranscript,
);

export default router;
