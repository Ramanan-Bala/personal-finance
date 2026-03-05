import { Request, Response } from 'express';
import { dashboardQuerySchema } from './dashboard.schema';
import { dashboardService } from './dashboard.service';

export class DashboardController {
  async getSummary(req: Request, res: Response) {
    try {
      const authUser = req.user as { id?: string; sub?: string } | undefined;
      const userId = authUser?.id ?? authUser?.sub;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const parsed = dashboardQuerySchema.safeParse(req.query);

      if (!parsed.success) {
        return res.status(400).json({
          error: parsed.error.issues.map(issue => issue.message).join(', '),
        });
      }

      const from = new Date(parsed.data.from);
      const to = new Date(parsed.data.to);

      if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
        return res.status(400).json({ error: 'Invalid from/to date range' });
      }

      const result = await dashboardService.getSummary(userId, from, to);
      return res.json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }
}

export const dashboardController = new DashboardController();
