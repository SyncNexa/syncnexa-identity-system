import express from "express";
import { validateRequest } from "../middlewares/validateRequest.middleware.js";
import { createUser } from "../controllers/auth.controller.js";
import { z } from "zod";

const router = express.Router();

router.get("/me");
router.patch("/update-profile");
router.patch("/change-password");
router.post("/upload-avatar");
router.post("/verify-id");

export default router;
