import { z } from "zod";

const createCardSchema = z.object({
  body: z.object({
    meta: z.record(z.string(), z.any()).optional(),
  }),
  params: z.any(),
  query: z.any(),
});

const issueTokenSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    ttl: z.number().int().positive().optional(),
  }),
  query: z.any(),
});

const verifyTokenSchema = z.object({
  body: z.object({ token: z.string().optional() }).optional(),
  query: z.object({ token: z.string().optional() }).optional(),
  params: z.any(),
});

export default {
  createCardSchema,
  issueTokenSchema,
  verifyTokenSchema,
};
