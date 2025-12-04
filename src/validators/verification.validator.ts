import { z } from "zod";

export const issueVerificationSchema = z.object({
  body: z.object({
    scope: z.string(),
    issued_for: z.string().optional(),
    ttl: z.number().optional(),
    metadata: z.any().optional(),
  }),
  params: z.any(),
  query: z.any(),
});

export const revokeVerificationSchema = z.object({
  body: z.any(),
  params: z.object({ id: z.string() }),
  query: z.any(),
});

export const validateVerificationSchema = z.object({
  body: z.object({ token: z.string().optional() }).optional(),
  query: z.object({ token: z.string().optional() }).optional(),
  params: z.any(),
});

export default {
  issueVerificationSchema,
  revokeVerificationSchema,
  validateVerificationSchema,
};
