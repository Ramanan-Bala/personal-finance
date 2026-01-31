import { z } from 'zod';

export const createTransactionSchema = z
  .object({
    accountId: z.string().min(1, 'Please select an account'),
    categoryId: z.string().optional(),
    type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER'], {
      message: 'Please select a transaction type',
    }),
    amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
    transactionDate: z.string('Date is required').datetime(),
    notes: z.string().optional(),
    transferToAccountId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // TRANSFER → categoryId NOT required
    if (data.type !== 'TRANSFER' && !data.categoryId) {
      ctx.addIssue({
        path: ['categoryId'],
        message: 'Please select a category',
        code: z.ZodIssueCode.custom,
      });
    }

    // TRANSFER → transferToAccountId required
    if (data.type === 'TRANSFER' && !data.transferToAccountId) {
      ctx.addIssue({
        path: ['transferToAccountId'],
        message: 'Transfer account is required for TRANSFER type',
        code: z.ZodIssueCode.custom,
      });
    }
  });

export const updateTransactionSchema = z.object({
  categoryId: z.string().min(1),
  amount: z.coerce.number().optional(),
  transactionDate: z.string().datetime().optional(),
  notes: z.string().optional(),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']).optional(),
  transferToAccountId: z.string().optional(),
  accountId: z.string().optional(), // In case we allow moving transaction
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
