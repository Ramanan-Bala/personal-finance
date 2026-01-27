import { z } from "zod";

export const createCategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  type: z.enum(["INCOME", "EXPENSE"]),
  icon: z.string().optional(),
  description: z.string().optional(),
});

export type CreateCategorySchema = z.infer<typeof createCategorySchema>;
