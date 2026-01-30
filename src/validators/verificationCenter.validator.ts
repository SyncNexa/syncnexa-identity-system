import { z } from "zod";

export const getVerificationCenterSchema = z.object({
  body: z.any(),
  params: z.any(),
  query: z.any(),
});

export const getPillarSchema = z.object({
  params: z.object({
    pillar: z.enum(["personal_info", "academic_info", "documents", "school"]),
  }),
  body: z.any(),
  query: z.any(),
});

export const updateStepStatusSchema = z.object({
  params: z.object({
    stepId: z.string(),
  }),
  body: z.object({
    status: z.enum(["not_verified", "pending", "failed", "verified"]),
    status_message: z.string().optional(),
    failure_reason: z.string().optional(),
    failure_suggestion: z.string().optional(),
  }),
  query: z.any(),
});

export const retryStepSchema = z.object({
  params: z.object({
    stepId: z.string(),
  }),
  body: z.any(),
  query: z.any(),
});

export const adminReviewStepSchema = z.object({
  params: z.object({
    stepId: z.string(),
  }),
  body: z.object({
    status: z.enum(["verified", "failed"]),
    notes: z.string().min(5, "Notes must be at least 5 characters"),
  }),
  query: z.any(),
});

export const uploadEvidenceSchema = z.object({
  params: z.object({
    stepId: z.string(),
  }),
  body: z.object({
    evidence_type: z.string(),
    evidence_url: z.string(),
    evidence_metadata: z.any().optional(),
  }),
  query: z.any(),
});

export const listPendingSchema = z.object({
  params: z.any(),
  body: z.any(),
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    pillar: z
      .enum(["personal_info", "academic_info", "documents", "school"])
      .optional(),
    step_name: z.string().optional(),
  }),
});

export const getUserStatusSchema = z.object({
  params: z.object({
    userId: z.string(),
  }),
  body: z.any(),
  query: z.any(),
});

export const getStepDetailsSchema = z.object({
  params: z.object({
    stepId: z.string(),
  }),
  body: z.any(),
  query: z.any(),
});

export default {
  getVerificationCenterSchema,
  getPillarSchema,
  updateStepStatusSchema,
  retryStepSchema,
  adminReviewStepSchema,
  uploadEvidenceSchema,
  listPendingSchema,
  getUserStatusSchema,
  getStepDetailsSchema,
};
