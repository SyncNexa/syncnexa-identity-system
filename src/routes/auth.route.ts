import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validateRequest.middleware.js";
import {
  createUser,
  login,
  logout,
  refreshAccessToken,
} from "../controllers/auth.controller.js";
import * as emailVerificationController from "../controllers/emailVerification.controller.js";
import emailVerificationValidator from "../validators/emailVerification.validator.js";
import {
  isValidInstitution,
  isValidFacultyForInstitution,
} from "../utils/universities.js";
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
    "State must contain only letters, spaces, or hyphens",
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
    "Invalid phone number format (use E.164, e.g. +2348012345678)",
  );

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character",
  );

const roleSchema = z
  .enum(["student", "staff", "developer"])
  .refine((role) => ["student", "staff", "developer"].includes(role), {
    message:
      'Invalid role. Supported roles are: "student", "staff", or "developer"',
  });

export const registerSchema = z.object({
  body: z
    .object({
      firstName: z
        .string()
        .min(2, "First name must be at least 2 characters long"),
      lastName: z
        .string()
        .min(2, "Last name must be at least 2 characters long"),
      email: z.email("Invalid email address"),
      password: passwordSchema,
      role: roleSchema,
      country: countrySchema,
      state: stateSchema,
      address: addressSchema,
      gender: genderSchema,
      phone: phoneSchema,
      // Student-specific required fields
      institution: z
        .string()
        .min(1, "Institution code is required for students")
        .refine(
          (code) => isValidInstitution(code),
          "Invalid institution code. Please use institution codes like FUTO_NG, IMSU_NG, etc.",
        ),
      matric_number: z
        .string()
        .min(2, "Matric number is required for students"),
      // Optional academic info (nested under academic_info for students)
      academic_info: z
        .object({
          department: z
            .string()
            .min(2, "Department must be at least 2 characters")
            .optional(),
          faculty: z
            .string()
            .min(1, "Faculty code is required for students")
            .optional(),
          program: z
            .string()
            .min(2, "Program (degree) is required for students")
            .optional(),
          student_level: z.string().optional(),
          graduation_year: z
            .number()
            .int()
            .min(1900)
            .max(new Date().getFullYear() + 10)
            .optional(),
        })
        .strict()
        .optional(),
    })
    .strict()
    .refine(
      (data) => {
        // If role is student, validate required student fields
        if (data.role === "student") {
          return Boolean(data.institution && data.matric_number);
        }
        return true;
      },
      {
        message:
          "Institution and matric_number are required for student registration",
        path: ["institution"],
      },
    )
    .refine(
      (data) => {
        // If role is student, academic_info.program must be present
        if (data.role === "student") {
          return Boolean(data.academic_info && data.academic_info.program);
        }
        return true;
      },
      {
        message:
          "Program (degree) is required in academic_info for student registration",
        path: ["academic_info", "program"],
      },
    )
    .refine(
      (data) => {
        // If role is student and faculty is provided, validate it against institution
        if (
          data.role === "student" &&
          data.academic_info?.faculty &&
          data.institution
        ) {
          return isValidFacultyForInstitution(
            data.institution,
            data.academic_info.faculty,
          );
        }
        return true;
      },
      {
        message: "Faculty code is not valid for the selected institution",
        path: ["academic_info", "faculty"],
      },
    ),
});

// Public routes (no authentication required)
router.post("/register", validateRequest(registerSchema), createUser);
router.post("/login", login);
router.post("/refresh-token", refreshAccessToken);

// Protected routes (require authentication)
router.post("/logout", authenticate, logout);

// Email verification routes (protected - require authentication)
router.post(
  "/verify-email/request",
  authenticate,
  validateRequest(emailVerificationValidator.requestEmailVerificationSchema),
  emailVerificationController.requestEmailVerification,
);

router.post(
  "/verify-email",
  authenticate,
  validateRequest(emailVerificationValidator.verifyEmailSchema),
  emailVerificationController.verifyEmail,
);

router.get(
  "/verify-email/status",
  authenticate,
  emailVerificationController.checkVerificationStatus,
);

router.post(
  "/verify-email/resend",
  authenticate,
  validateRequest(emailVerificationValidator.requestEmailVerificationSchema),
  emailVerificationController.resendOTP,
);

// router.post("/forgot-password");
// router.post("/reset-password");

export default router;
