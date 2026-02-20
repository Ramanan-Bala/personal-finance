import { z } from "zod";

export const createLendDebtSchema = z
  .object({
    id: z.string().optional(),
    type: z.enum(["LEND", "DEBT"]),
    accountId: z.string().min(1, "Account is required"),
    personName: z.string().min(1, "Person name is required"),
    phoneNumber: z.string().optional(),
    amount: z
      .union([
        z.number(),
        z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
      ])
      .transform((val) => Number(val)),
    dueDate: z.string().datetime().optional(),
    notes: z.string().optional(),
  });

export type CreateLendDebtSchema = z.infer<typeof createLendDebtSchema>;
