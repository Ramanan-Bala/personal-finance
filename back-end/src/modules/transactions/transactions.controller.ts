import { Request, Response } from 'express';
import { transactionsService } from './transactions.service';

export class TransactionsController {
  async createTransaction(req: Request, res: Response) {
    try {
      const userId = (req.user as any).id;
      const transaction = await transactionsService.createTransaction(
        userId,
        req.body,
      );
      return res.status(201).json(transaction);
    } catch (error: any) {
      if (error.message.includes('not found'))
        return res.status(404).json({ message: error.message });
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getTransactions(req: Request, res: Response) {
    try {
      const userId = (req.user as any).id;
      const { accountId, from, to, withAdditional } = req.query;

      if (accountId) {
        const transactions = await transactionsService.getTransactionsByAccount(
          userId,
          accountId as string,
        );
        return res.json(transactions);
      }

      if (from && to) {
        const transactions =
          await transactionsService.getTransactionsByDateRange(
            userId,
            new Date(from as string),
            new Date(to as string),
            Boolean(withAdditional ?? false),
          );
        return res.json(transactions);
      }

      return res
        .status(400)
        .json({ message: 'Provide accountId or date range (from, to)' });
    } catch (error: any) {
      if (error.message === 'Account not found')
        return res.status(404).json({ message: error.message });
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getTransaction(req: Request, res: Response) {
    try {
      const userId = (req.user as any).id;
      const { transactionId } = req.params;
      const transaction = await transactionsService.getTransaction(
        userId,
        transactionId,
      );
      if (!transaction)
        return res.status(404).json({ message: 'Transaction not found' });
      return res.json(transaction);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateTransaction(req: Request, res: Response) {
    try {
      const userId = (req.user as any).id;
      const { transactionId } = req.params;
      const transaction = await transactionsService.updateTransaction(
        userId,
        transactionId,
        req.body,
      );
      return res.json(transaction);
    } catch (error: any) {
      if (error.message.includes('not found'))
        return res.status(404).json({ message: error.message });
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async deleteTransaction(req: Request, res: Response) {
    try {
      const userId = (req.user as any).id;
      const { transactionId } = req.params;
      await transactionsService.deleteTransaction(userId, transactionId);
      return res.json({ message: 'Transaction deleted' });
    } catch (error: any) {
      if (error.message === 'Transaction not found')
        return res.status(404).json({ message: error.message });
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export const transactionsController = new TransactionsController();
