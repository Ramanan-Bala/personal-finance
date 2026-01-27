import { z } from 'zod';

// Account Groups
export const createAccountGroupSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const updateAccountGroupSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

// Accounts
export const createAccountSchema = z.object({
  groupId: z.string().min(1),
  name: z.string().min(1),
  openingBalance: z.coerce.number(),
  description: z.string().optional(),
});

export const updateAccountSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  openingBalance: z.coerce.number().optional(),
});

export type CreateAccountGroupInput = z.infer<typeof createAccountGroupSchema>;
export type UpdateAccountGroupInput = z.infer<typeof updateAccountGroupSchema>;
export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
