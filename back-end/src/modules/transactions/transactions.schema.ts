import { z } from 'zod';

export const createTransactionSchema = z
  .object({
    accountId: z.string('Please select an account').min(1),
    categoryId: z.string('Please select a category').min(1),
    type: z.enum(
      ['INCOME', 'EXPENSE', 'TRANSFER'],
      'Please select a transaction type',
    ),
    amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
    transactionDate: z.string('Date is required').datetime(), // Expect ISO string
    notes: z.string().optional(),
    transferToAccountId: z.string().optional(),
  })
  .refine(
    data => {
      if (data.type === 'TRANSFER' && !data.transferToAccountId) {
        return false;
      }
      return true;
    },
    {
      message: 'transferToAccountId is required for TRANSFER type',
      path: ['transferToAccountId'],
    },
  );

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
