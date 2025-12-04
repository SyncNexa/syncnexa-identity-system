import { z } from "zod";

export const getCvSchema = z.object({
  query: z
    .object({
      user_id: z.string().optional(),
      pdf: z.union([z.string(), z.boolean()]).optional(),
    })
    .optional(),
  body: z.any(),
  params: z.any(),
});

export default { getCvSchema };
