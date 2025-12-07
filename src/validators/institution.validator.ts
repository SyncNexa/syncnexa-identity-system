import { z } from "zod";

const createInstitutionVerificationSchema = z.object({
  body: z.object({
    institution: z.string().min(1, "institution required"),
    contact_email: z.string().email().optional(),
    contact_phone: z.string().optional(),
    payload: z.record(z.string(), z.any()).optional(),
  }),
  params: z.any(),
  query: z.any(),
});

const updateInstitutionVerificationSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    status: z.enum(["pending", "approved", "rejected"]).optional(),
    verifier_notes: z.string().optional(),
    verified_at: z.string().datetime().optional(),
  }),
  query: z.any(),
});

export default {
  createInstitutionVerificationSchema,
  updateInstitutionVerificationSchema,
};
