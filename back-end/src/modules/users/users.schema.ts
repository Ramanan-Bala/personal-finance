import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
