import express from "express";
import * as appSAuthController from "../controllers/appSAuth.controller.js";

const router = express.Router();

// SAuth Authorization Code Flow endpoints
router.get("/authorize", appSAuthController.authorize);
router.post("/token", appSAuthController.token);
router.get("/userinfo", appSAuthController.userinfo);

// Revoke access
router.post("/revoke", appSAuthController.revokeAccess);

export default router;
