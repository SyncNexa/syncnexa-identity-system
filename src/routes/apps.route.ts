import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
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

// All app management routes require authentication and developer role
router.use(authenticate);
router.use(authorizeRoles("developer"));

// Register a new app
router.post(
  "/register",
  validateRequest(appValidator.registerAppSchema),
  registerApp,
);

// Get all apps owned by the authenticated user
router.get("/my-apps", getMyApps);

// Get available apps (for discovery)
router.get("/available", getAvailableApps);

// Get a specific app by ID
router.get("/:id", validateRequest(appValidator.getAppByIdSchema), getAppById);

// Update an app
router.patch("/:id", validateRequest(appValidator.updateAppSchema), updateApp);

// Rotate client secret
router.post(
  "/rotate-secret",
  validateRequest(appValidator.rotateSecretSchema),
  rotateSecret,
);

// Delete an app
router.delete("/:id", validateRequest(appValidator.deleteAppSchema), deleteApp);

export default router;
