import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validateRequest.middleware.js";
import {
  deleteApp,
  getAppById,
  getAvailableApps,
  getMyApps,
  registerApp,
  rotateSecret,
  updateApp,
} from "../controllers/apps.controller.js";
import * as appValidator from "../validators/app.validator.js";

const router = express.Router();

// Register a new app
router.post(
  "/register",
  authenticate,
  validateRequest(appValidator.registerAppSchema),
  registerApp
);

// Get all apps owned by the authenticated user
router.get("/my-apps", authenticate, getMyApps);

// Get available apps (for discovery)
router.get("/available", authenticate, getAvailableApps);

// Get a specific app by ID
router.get(
  "/:id",
  authenticate,
  validateRequest(appValidator.getAppByIdSchema),
  getAppById
);

// Update an app
router.patch(
  "/:id",
  authenticate,
  validateRequest(appValidator.updateAppSchema),
  updateApp
);

// Rotate client secret
router.post(
  "/rotate-secret",
  authenticate,
  validateRequest(appValidator.rotateSecretSchema),
  rotateSecret
);

// Delete an app
router.delete(
  "/:id",
  authenticate,
  validateRequest(appValidator.deleteAppSchema),
  deleteApp
);

export default router;
