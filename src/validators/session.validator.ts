import { z } from "zod";

const createSessionSchema = z.object({
  body: z.object({
    ttl_seconds: z.number().int().positive().optional(),
  }),
  params: z.any(),
  query: z.any(),
});

const revokeSessionSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.any(),
  query: z.any(),
});

const setupTotpSchema = z.object({
  body: z.object({}).strict(),
  params: z.any(),
  query: z.any(),
});

const enableTotpSchema = z.object({
  body: z.object({
    token: z.string().min(6, "token required").max(6),
  }),
  params: z.any(),
  query: z.any(),
});

export default {
  createSessionSchema,
  revokeSessionSchema,
  setupTotpSchema,
  enableTotpSchema,
};
