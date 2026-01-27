import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1),
  type: z.enum(['INCOME', 'EXPENSE']),
  icon: z.string().optional(),
  description: z.string().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  icon: z.string().optional(),
  description: z.string().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
