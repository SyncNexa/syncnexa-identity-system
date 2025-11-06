import express from "express";
import { validateRequest } from "../middlewares/validateRequest.middleware.js";
import { createUser } from "../controllers/auth.controller.js";
import { z } from "zod";

const router = express.Router();

router.get("/authorize");
router.post("/token");
router.get("/userinfo");

export default router;
