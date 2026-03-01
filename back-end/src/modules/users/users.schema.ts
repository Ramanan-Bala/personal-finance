import { z } from 'zod';
import { isValidTimeZone } from '../../common/date-utils';

export const updateProfileSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  currency: z.string().optional(),
  dateFormat: z.string().optional(),
  fontFamily: z.string().optional(),
  timezone: z
    .string()
    .optional()
    .refine(value => !value || isValidTimeZone(value), {
      message: 'Invalid timezone',
    }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
