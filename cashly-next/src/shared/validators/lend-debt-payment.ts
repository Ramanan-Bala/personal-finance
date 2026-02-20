import { z } from "zod";

export const createLendDebtPaymentSchema = z.object({
  lendDebtId: z.string().min(1),
  accountId: z.string().min(1, "Account is required"),
  amount: z
    .union([
      z.number().positive("Amount must be greater than 0"),
      z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
    ])
    .transform((val) => Number(val)),
  paymentDate: z.string().datetime(),
  notes: z.string().optional(),
});

export type CreateLendDebtPaymentSchema = z.infer<
  typeof createLendDebtPaymentSchema
>;
