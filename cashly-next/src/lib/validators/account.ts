import { z } from "zod";

export const createAccountSchema = z.object({
  groupId: z.string().min(1, "Account group is required"),
  name: z
    .string()
    .min(1, "Account name is required")
    .max(50, "Name is too long"),
  openingBalance: z.coerce.number().default(0),
  description: z.string().max(200, "Description is too long").optional(),
});

export type CreateAccountSchema = z.infer<typeof createAccountSchema>;
