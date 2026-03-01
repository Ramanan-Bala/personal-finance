import { Request, Response } from 'express';
import { parseUtcDate } from '../../common/date-utils';
import { recurringTransactionsService } from './recurring-transactions.service';

export class RecurringTransactionsController {
  async listRules(req: Request, res: Response) {
    try {
      const userId = (req.user as any).id;
      const rules = await recurringTransactionsService.listRules(userId);
      return res.json(rules);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async createRule(req: Request, res: Response) {
    try {
      const userId = (req.user as any).id;
      const rule = await recurringTransactionsService.createRule(
        userId,
        req.body,
      );
      return res.status(201).json(rule);
    } catch (error: any) {
      if (error.message.includes('not found'))
        return res.status(404).json({ message: error.message });
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateRule(req: Request, res: Response) {
    try {
      const userId = (req.user as any).id;
      const { recurringTransactionId } = req.params;
      const rule = await recurringTransactionsService.updateRule(
        userId,
        recurringTransactionId,
        req.body,
      );
      return res.json(rule);
    } catch (error: any) {
      if (error.message.includes('not found'))
        return res.status(404).json({ message: error.message });
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async materialize(req: Request, res: Response) {
    try {
      const userId = (req.user as any).id;
      const { from, to } = req.body;

      const fromDate = parseUtcDate(from);
      const toDate = parseUtcDate(to);

      if (!fromDate || !toDate) {
        return res.status(400).json({
          message: 'Invalid date range. Send from/to as UTC ISO strings.',
        });
      }

      const result =
        await recurringTransactionsService.materializeDueTransactions(
          userId,
          fromDate,
          toDate,
        );
      return res.json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export const recurringTransactionsController =
  new RecurringTransactionsController();
