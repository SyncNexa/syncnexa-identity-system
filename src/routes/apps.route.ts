import express from "express";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  deleteApp,
  getAvailableApps,
  getMyApps,
  registerApp,
  rotateSecret,
  updateApp,
} from "../controllers/apps.controller.js";

const router = express.Router();

router.post("/apps", authorizeRoles("developer", "staff"));
router.post("/register", authenticate, registerApp);
router.get("/available", authenticate, getAvailableApps);
// router.post("/connect", authenticate, );
// router.delete("/revoke/:appId", authenticate, );
router.get("/my-apps", authenticate, getMyApps);
// router.get("/my", authenticate, );
router.patch("/:id", authenticate, updateApp);
router.delete("/:id", authenticate, deleteApp);
router.post("/rotate-secret", authenticate, rotateSecret);

export default router;
