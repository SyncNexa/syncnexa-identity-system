import { z } from "zod";

export const createProjectSchema = z.object({
  body: z.object({
    title: z.string(),
    description: z.string().optional(),
    links: z.any().optional(),
    attachments: z.any().optional(),
  }),
  params: z.any(),
  query: z.any(),
});

export const updateProjectSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    links: z.any().optional(),
    attachments: z.any().optional(),
  }),
  params: z.object({ id: z.string() }),
  query: z.any(),
});

export const createCertificateSchema = z.object({
  body: z.object({
    issuer: z.string(),
    title: z.string(),
    issue_date: z.string().optional(),
    metadata: z.any().optional(),
  }),
  params: z.any(),
  query: z.any(),
});

export const updateCertificateSchema = z.object({
  body: z.object({
    issuer: z.string().optional(),
    title: z.string().optional(),
    issue_date: z.string().optional(),
    metadata: z.any().optional(),
    is_verified: z.boolean().optional(),
    verification_notes: z.string().optional(),
  }),
  params: z.object({ id: z.string() }),
  query: z.any(),
});

export default {
  createProjectSchema,
  updateProjectSchema,
  createCertificateSchema,
  updateCertificateSchema,
};
