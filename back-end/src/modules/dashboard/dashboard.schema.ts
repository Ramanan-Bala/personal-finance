import { z } from 'zod';

export const dashboardQuerySchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
});

export type DashboardQueryInput = z.infer<typeof dashboardQuerySchema>;
