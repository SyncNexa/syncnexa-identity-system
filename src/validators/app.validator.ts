import { z } from "zod";

export const registerAppSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(3, "App name must be at least 3 characters")
      .max(100, "App name must not exceed 100 characters"),
    description: z
      .string()
      .max(500, "Description must not exceed 500 characters")
      .optional(),
    website_url: z.string().url("Invalid website URL").optional(),
    callback_url: z.string().url("Invalid callback URL"),
    scopes: z
      .array(z.enum(["profile", "student:profile", "student:documents"]))
      .optional()
      .default(["profile"]),
  }),
});

export const updateAppSchema = z.object({
  params: z.object({
    id: z.string().min(1, "App ID is required"),
  }),
  body: z.object({
    name: z
      .string()
      .min(3, "App name must be at least 3 characters")
      .max(100, "App name must not exceed 100 characters")
      .optional(),
    description: z
      .string()
      .max(500, "Description must not exceed 500 characters")
      .optional(),
    website_url: z.string().url("Invalid website URL").optional(),
    callback_url: z.string().url("Invalid callback URL").optional(),
    status: z.enum(["active", "inactive", "suspended"]).optional(),
  }),
});

export const rotateSecretSchema = z.object({
  body: z.object({
    app_id: z.string().min(1, "App ID is required"),
  }),
});

export const deleteAppSchema = z.object({
  params: z.object({
    id: z.string().min(1, "App ID is required"),
  }),
});

export const getAppByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "App ID is required"),
  }),
});
