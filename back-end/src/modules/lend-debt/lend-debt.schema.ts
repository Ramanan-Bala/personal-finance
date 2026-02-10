import { z } from 'zod';

// Lend/Debt
export const createLendDebtSchema = z.object({
  type: z.enum(['LEND', 'DEBT']),
  personName: z.string().min(1),
  phoneNumber: z.string().optional(),
  amount: z.coerce.number(),
  dueDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export const updateLendDebtSchema = z.object({
  personName: z.string().min(1).optional(),
  phoneNumber: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

// Payments
export const createLendDebtPaymentSchema = z.object({
  lendDebtId: z.string().min(1),
  amount: z.coerce.number(),
  paymentDate: z.string().datetime(),
  notes: z.string().optional(),
});

export const updateLendDebtPaymentSchema = z.object({
  amount: z.coerce.number().optional(),
  paymentDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export type CreateLendDebtInput = z.infer<typeof createLendDebtSchema>;
export type UpdateLendDebtInput = z.infer<typeof updateLendDebtSchema>;
export type CreateLendDebtPaymentInput = z.infer<
  typeof createLendDebtPaymentSchema
>;
export type UpdateLendDebtPaymentInput = z.infer<
  typeof updateLendDebtPaymentSchema
>;
