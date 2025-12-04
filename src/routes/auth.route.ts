import express from "express";
import { validateRequest } from "../middlewares/validateRequest.middleware.js";
import {
  createUser,
  login,
  logout,
  refreshAccessToken,
} from "../controllers/auth.controller.js";
import { z } from "zod";

const router = express.Router();

const countrySchema = z
  .string()
  .min(2, "Country name too short")
  .max(56, "Country name too long")
  .regex(/^[A-Za-z\s]+$/, "Country must contain only letters and spaces");

const stateSchema = z
  .string()
  .min(2, "State name too short")
  .max(50, "State name too long")
  .regex(
    /^[A-Za-z\s-]+$/,
    "State must contain only letters, spaces, or hyphens"
  );

const addressSchema = z
  .string()
  .min(5, "Address too short")
  .max(100, "Address too long")
  .regex(/^[A-Za-z0-9\s.,#\-/]+$/, "Address contains invalid characters");

const genderSchema = z.enum(["male", "female", "non-binary", "other"]);

const phoneSchema = z
  .string()
  .regex(
    /^\+?[1-9]\d{7,14}$/,
    "Invalid phone number format (use E.164, e.g. +2348012345678)"
  );

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character"
  );

export const registerSchema = z.object({
  body: z.object({
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters long"),
    lastName: z.string().min(2, "Last name must be at least 2 characters long"),
    email: z.email("Invalid email address"),
    password: passwordSchema,
    country: countrySchema,
    state: stateSchema,
    address: addressSchema,
    gender: genderSchema,
    phone: phoneSchema,
  }),
});

router.post("/register", validateRequest(registerSchema), createUser);
// router.post("/verify-email");
router.post("/login", login);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", logout);
// router.post("/forgot-password");
// router.post("/reset-password");
// router.post("/verify-email");

export default router;
