import { z } from "zod";

const StatusEnum = z.enum(["pending", "approved", "rejected"]);
const TypeEnum = z.enum(["institution", "system", "external"]);

export const listVerificationsSchema = z.object({
  body: z.any(),
  params: z.any(),
  query: z
    .object({
      page: z.string().regex(/^\d+$/).optional(),
      limit: z.string().regex(/^\d+$/).optional(),
      status: StatusEnum.optional(),
      type: TypeEnum.optional(),
      user_id: z.string().uuid().optional(),
    })
    .optional(),
});

export const getVerificationSchema = z.object({
  body: z.any(),
  query: z.any(),
  params: z.object({ id: z.string().uuid() }),
});

export const updateVerificationStatusSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({ status: StatusEnum }),
  query: z.any(),
});

export default {
  listVerificationsSchema,
  getVerificationSchema,
  updateVerificationStatusSchema,
};
