import { z } from "zod";

export const requestEmailVerificationSchema = z.object({
  body: z.object({}).strict(),
});

export const verifyEmailSchema = z.object({
  body: z
    .object({
      otp: z
        .string()
        .length(6, "OTP must be exactly 6 digits")
        .regex(/^\d+$/, "OTP must contain only digits"),
    })
    .strict(),
});

export default {
  requestEmailVerificationSchema,
  verifyEmailSchema,
};
