import { z } from "zod";

export const uploadDocumentSchema = z.object({
  body: z.object({
    doc_type: z.string(),
    // filename may be supplied by server after upload; client can omit when sending file
    filename: z.string().optional(),
    meta: z.any().optional(),
  }),
  query: z.any(),
  params: z.any(),
});

export const updateDocumentSchema = z.object({
  body: z.object({
    filename: z.string().optional(),
    filepath: z.string().optional(),
    meta: z.any().optional(),
  }),
  params: z.object({ id: z.string() }),
  query: z.any(),
});

export const requestVerificationSchema = z.object({
  body: z
    .object({ notes: z.string().optional(), metadata: z.any().optional() })
    .optional(),
  params: z.object({ id: z.string() }),
  query: z.any(),
});

export const getVerificationStatusSchema = z.object({
  body: z.any(),
  query: z.object({ user_id: z.string().optional() }).optional(),
  params: z.any(),
});

export default {
  uploadDocumentSchema,
  updateDocumentSchema,
  requestVerificationSchema,
  getVerificationStatusSchema,
};
