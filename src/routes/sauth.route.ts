import express from "express";

const router = express.Router();

router.get("/authorize");
router.post("/token");
router.get("/userinfo");

export default router;
