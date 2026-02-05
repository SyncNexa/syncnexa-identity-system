import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import * as academicController from "../controllers/academic.controller.js";

const router = express.Router();

router.use(authenticate);

// Get all academic records for the user
router.get("/", academicController.listRecords);

// Get a specific academic record by ID
router.get("/:id", academicController.getRecord);

export default router;
