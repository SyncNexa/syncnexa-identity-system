import express from "express";
import { sendSuccess } from "../utils/response.js";

const router = express.Router();

router.get("/", (req, res) => {
  console.log(req.ip);

  return sendSuccess(200, "Welcome to SIS", res);
});

router.get("/health", (req, res) => {
  console.log(req.ip);

  return sendSuccess(200, "Server is healthy", res);
});

export default router;
