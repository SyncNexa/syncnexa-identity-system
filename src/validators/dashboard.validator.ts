import { z } from "zod";

const getDashboardSchema = z.object({
  body: z.any(),
  params: z.any(),
  query: z.any(),
});

export default {
  getDashboardSchema,
};
