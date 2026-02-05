import { z } from "zod";

export const initiateSchoolVerificationSchema = z.object({
  body: z.object({
    institution_code: z.string().min(2),
    matric_number: z.string().min(2),
  }),
  params: z.any(),
  query: z.any(),
});

export const schoolVerificationCallbackSchema = z.object({
  body: z.object({
    request_id: z.string().min(5),
    status: z.enum(["approved", "declined"]),
    student: z.any().optional(),
    verified_at: z.string().optional(),
    reason: z.string().optional(),
    declined_at: z.string().optional(),
  }),
  params: z.object({ requestId: z.string().min(5) }),
  query: z.any(),
});

export default {
  initiateSchoolVerificationSchema,
  schoolVerificationCallbackSchema,
};
