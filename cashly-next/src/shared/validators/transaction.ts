import { z } from "zod";

export const recurringFrequencyValues = [
  "DAILY",
  "WEEKLY",
  "MONTHLY_START",
  "MONTHLY_END",
  "YEARLY",
] as const;

export const createTransactionSchema = z
  .object({
    id: z.string().optional(),
    accountId: z.string().min(1, "Account is required"),
    categoryId: z.string().optional(),
    type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
    amount: z
      .union([
        z.number(),
        z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
      ])
      .transform((val) => Number(val)),
    // Ensuring amount comes out as a number, allowing string input for better UX handling
    transactionDate: z.iso.datetime({
      message: "Invalid date format",
    }), // Expect ISO string
    notes: z.string().optional(),
    transferToAccountId: z.string().optional(),
    isRecurring: z.boolean().optional(),
    recurringFrequency: z.enum(recurringFrequencyValues).optional(),
    recurringEndDate: z.iso.datetime().nullable().optional(),
  })
  .refine(
    (data) => {
      if (data.type === "TRANSFER" && !data.transferToAccountId) {
        return false;
      }
      return true;
    },
    {
      message: "Transfer account is required for TRANSFER type",
      path: ["transferToAccountId"],
    },
  )
  .refine(
    (data) => {
      if (data.isRecurring && !data.recurringFrequency) {
        return false;
      }
      return true;
    },
    {
      message: "Frequency is required for recurring transactions",
      path: ["recurringFrequency"],
    },
  );

export type CreateTransactionSchema = z.infer<typeof createTransactionSchema>;
