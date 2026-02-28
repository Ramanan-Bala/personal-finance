import { z } from 'zod';

const recurrenceFrequencyValues = [
  'DAILY',
  'WEEKLY',
  'MONTHLY_START',
  'MONTHLY_END',
  'YEARLY',
] as const;

const recurringStatusValues = ['ACTIVE', 'PAUSED', 'STOPPED'] as const;

export const createRecurringTransactionSchema = z
  .object({
    accountId: z.string().min(1, 'Please select an account'),
    categoryId: z.string().optional(),
    transferToAccountId: z.string().optional(),
    type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER'], {
      message: 'Please select a transaction type',
    }),
    amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
    notes: z.string().optional(),
    frequency: z.enum(recurrenceFrequencyValues, {
      message: 'Please select a frequency',
    }),
    startDate: z.string().datetime(),
    endDate: z.string().datetime().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'TRANSFER' && !data.transferToAccountId) {
      ctx.addIssue({
        path: ['transferToAccountId'],
        message: 'Transfer account is required for TRANSFER type',
        code: z.ZodIssueCode.custom,
      });
    }
  });

export const updateRecurringTransactionSchema = z.object({
  accountId: z.string().min(1).optional(),
  categoryId: z.string().optional(),
  transferToAccountId: z.string().optional(),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']).optional(),
  amount: z.coerce.number().min(0.01).optional(),
  notes: z.string().optional(),
  frequency: z.enum(recurrenceFrequencyValues).optional(),
  endDate: z.string().datetime().nullable().optional(),
  status: z.enum(recurringStatusValues).optional(),
});

export const materializeSchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
});

export type CreateRecurringTransactionInput = z.infer<
  typeof createRecurringTransactionSchema
>;
export type UpdateRecurringTransactionInput = z.infer<
  typeof updateRecurringTransactionSchema
>;
export type MaterializeInput = z.infer<typeof materializeSchema>;
