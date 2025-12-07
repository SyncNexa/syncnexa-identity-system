import { z } from "zod";

const createShareableLinkSchema = z.object({
  body: z.object({
    resourceType: z.string().min(1, "resourceType required"),
    resourceId: z.number().int().positive().optional(),
    scope: z
      .union([z.array(z.string().min(1)), z.record(z.string(), z.any())])
      .optional(),
    expiresAt: z.string().datetime().optional(),
    maxUses: z.number().int().positive().optional(),
  }),
});

const revokeShareableLinkSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

const validateShareableLinkSchema = z
  .object({
    body: z.object({ token: z.string().min(1) }).partial(),
    query: z.object({ token: z.string().min(1) }).partial(),
  })
  .refine(
    (data) => {
      return (data.body && data.body.token) || (data.query && data.query.token);
    },
    { message: "token required in body or query" }
  );

export default {
  createShareableLinkSchema,
  revokeShareableLinkSchema,
  validateShareableLinkSchema,
};
