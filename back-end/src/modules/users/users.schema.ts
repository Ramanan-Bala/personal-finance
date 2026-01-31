import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  currency: z.string().optional(),
  dateFormat: z.string().optional(),
  fontFamily: z.string().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
