import express from "express";

const router = express.Router();

router.get("/me");
router.patch("/update-profile");
router.patch("/change-password");
router.post("/upload-avatar");
router.post("/verify-id");

export default router;
