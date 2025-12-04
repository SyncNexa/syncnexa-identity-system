import { z } from "zod";

export const addAcademicSchema = z.object({
  body: z.object({
    institution: z.string(),
    program: z.string().optional(),
    matric_number: z.string().optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    degree: z.string().optional(),
    gpa: z.string().optional(),
    meta: z.any().optional(),
  }),
  params: z.any(),
  query: z.any(),
});

export const updateAcademicSchema = z.object({
  body: z.object({
    institution: z.string().optional(),
    program: z.string().optional(),
    matric_number: z.string().optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    degree: z.string().optional(),
    gpa: z.string().optional(),
    meta: z.any().optional(),
  }),
  params: z.object({ id: z.string() }),
  query: z.any(),
});

export const uploadTranscriptSchema = z.object({
  body: z.object({
    filename: z.string().optional(),
    metadata: z.any().optional(),
  }),
  params: z.object({ academicId: z.string() }),
  query: z.any(),
});

export default {
  addAcademicSchema,
  updateAcademicSchema,
  uploadTranscriptSchema,
};
