import express from "express";
import * as studentsController from "../controllers/students.controller.js";

const router = express.Router();

router.post("/documents", studentsController.uploadDocument);
router.patch("/documents/:id", studentsController.updateDocument);
router.post("/documents/:id/verify", studentsController.requestVerification);
router.patch("/verifications/:id", studentsController.setVerificationStatus);
router.get("/verification-status", studentsController.getVerificationStatus);

// Academic records & transcripts
import * as academicController from "../controllers/academic.controller.js";

router.post("/academics", academicController.addRecord);
router.patch("/academics/:id", academicController.updateRecord);
router.get("/academics", academicController.listRecords);
router.post(
  "/academics/:academicId/transcripts",
  academicController.uploadTranscript
);
router.get(
  "/academics/:academicId/transcripts",
  academicController.listTranscripts
);

// Institution verification requests
import * as institutionController from "../controllers/institution.controller.js";

router.post(
  "/verification-requests",
  validateRequest(institutionValidator.createInstitutionVerificationSchema),
  institutionController.createRequest
);
router.get("/verification-requests", institutionController.listRequests);
router.patch(
  "/verification-requests/:id",
  validateRequest(institutionValidator.updateInstitutionVerificationSchema),
  institutionController.updateRequest
);

// Student cards (digital)
import * as studentCardController from "../controllers/studentCard.controller.js";
import upload from "../middlewares/upload.middleware.js";
import { validateRequest } from "../middlewares/validateRequest.middleware.js";
import studentValidator from "../validators/student.validator.js";
import academicValidator from "../validators/academic.validator.js";
import verificationValidator from "../validators/verification.validator.js";
import shareableLinkValidator from "../validators/shareableLink.validator.js";
import * as shareableLinkController from "../controllers/shareableLink.controller.js";
import institutionValidator from "../validators/institution.validator.js";
import studentCardValidator from "../validators/studentCard.validator.js";

router.post(
  "/cards",
  validateRequest(studentCardValidator.createCardSchema),
  studentCardController.createCard
);
router.post(
  "/cards/:id/token",
  validateRequest(studentCardValidator.issueTokenSchema),
  studentCardController.issueToken
);
router.post(
  "/cards/verify",
  validateRequest(studentCardValidator.verifyTokenSchema),
  studentCardController.verifyToken
);

// Verification token APIs
import * as verificationController from "../controllers/verification.controller.js";
router.post(
  "/verification-tokens",
  validateRequest(verificationValidator.issueVerificationSchema),
  verificationController.issueToken
);
router.patch(
  "/verification-tokens/:id/revoke",
  validateRequest(verificationValidator.revokeVerificationSchema),
  verificationController.revokeToken
);
router.post(
  "/verification-tokens/validate",
  validateRequest(verificationValidator.validateVerificationSchema),
  verificationController.validateToken
);
router.get("/verification-tokens/:id/logs", verificationController.getLogs);

// Shareable links (privacy controls)
router.post(
  "/shareable-links",
  validateRequest(shareableLinkValidator.createShareableLinkSchema),
  shareableLinkController.createLink
);
router.patch(
  "/shareable-links/:id/revoke",
  validateRequest(shareableLinkValidator.revokeShareableLinkSchema),
  shareableLinkController.revokeLink
);
router.post(
  "/shareable-links/validate",
  validateRequest(shareableLinkValidator.validateShareableLinkSchema),
  shareableLinkController.validateLink
);

// Portfolio routes
import * as portfolioController from "../controllers/portfolio.controller.js";
import portfolioValidator from "../validators/portfolio.validator.js";
import cvValidator from "../validators/cv.validator.js";

router.post(
  "/projects",
  validateRequest(portfolioValidator.createProjectSchema),
  portfolioController.createProject
);
router.patch(
  "/projects/:id",
  validateRequest(portfolioValidator.updateProjectSchema),
  portfolioController.updateProject
);
router.get("/projects", portfolioController.listProjects);

router.post(
  "/certificates",
  validateRequest(portfolioValidator.createCertificateSchema),
  portfolioController.createCertificate
);
router.patch(
  "/certificates/:id",
  validateRequest(portfolioValidator.updateCertificateSchema),
  portfolioController.updateCertificate
);
router.get("/certificates", portfolioController.listCertificates);

// CV generation
import * as cvController from "../controllers/cv.controller.js";
router.get("/cv", validateRequest(cvValidator.getCvSchema), cvController.getCv);

// Session Management & MFA
import * as sessionController from "../controllers/session.controller.js";
import sessionValidator from "../validators/session.validator.js";

router.post(
  "/sessions",
  validateRequest(sessionValidator.createSessionSchema),
  sessionController.createSession
);
router.get("/sessions", sessionController.listActiveSessions);
router.patch(
  "/sessions/:id/revoke",
  validateRequest(sessionValidator.revokeSessionSchema),
  sessionController.revokeSession
);
router.post("/sessions/revoke-all", sessionController.revokeAllSessions);

// TOTP MFA
router.post("/mfa/totp/setup", sessionController.setupTotp);
router.post(
  "/mfa/totp/enable",
  validateRequest(sessionValidator.enableTotpSchema),
  sessionController.enableTotp
);
router.post("/mfa/totp/disable", sessionController.disableTotp);

// Dashboard & Progress
import * as dashboardController from "../controllers/dashboard.controller.js";
import dashboardValidator from "../validators/dashboard.validator.js";

router.get(
  "/dashboard",
  validateRequest(dashboardValidator.getDashboardSchema),
  dashboardController.getDashboard
);
router.get(
  "/dashboard/progress",
  validateRequest(dashboardValidator.getDashboardSchema),
  dashboardController.getProgress
);
router.get(
  "/dashboard/suggestions",
  validateRequest(dashboardValidator.getDashboardSchema),
  dashboardController.getSuggestions
);

// Attach multer and validation to upload endpoints
router.post(
  "/documents",
  upload.uploadSingle("document"),
  validateRequest(studentValidator.uploadDocumentSchema),
  studentsController.uploadDocument
);

router.post(
  "/academics/:academicId/transcripts",
  upload.uploadSingle("transcript"),
  validateRequest(academicValidator.uploadTranscriptSchema),
  academicController.uploadTranscript
);

export default router;
