import { z } from "zod";

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

export const requestPasswordResetSchema = z.object({
  body: z
    .object({
      email: z.email("Invalid email address"),
    })
    .strict(),
});

export const verifyPasswordResetOTPSchema = z.object({
  body: z
    .object({
      email: z.email("Invalid email address"),
      otp: z
        .string()
        .length(6, "OTP must be exactly 6 digits")
        .regex(/^\d+$/, "OTP must contain only digits"),
    })
    .strict(),
});

export const resetPasswordSchema = z.object({
  body: z
    .object({
      email: z.email("Invalid email address"),
      otp: z
        .string()
        .length(6, "OTP must be exactly 6 digits")
        .regex(/^\d+$/, "OTP must contain only digits"),
      newPassword: passwordSchema,
      confirmPassword: z.string(),
    })
    .strict()
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
});

export default {
  requestPasswordResetSchema,
  verifyPasswordResetOTPSchema,
  resetPasswordSchema,
};
