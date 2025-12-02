import express from "express";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.post("/apps", authorizeRoles("developer", "staff"));
router.post("/register");
router.get("/available");
router.post("/connect");
router.delete("/revoke/:appId");
router.get("/my-apps");
router.get("/my");
router.patch("/:id");
router.delete("/:id");
router.post("/rotate-secret");

export default router;
