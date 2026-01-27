import { Request, Response } from 'express';
import { lendDebtService } from './lend-debt.service';

export class LendDebtController {
  // Lend/Debt
  async createLendDebt(req: Request, res: Response) {
    try {
      const userId = (req.user as any).id;
      const item = await lendDebtService.createLendDebt(userId, req.body);
      return res.status(201).json(item);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getLendDebts(req: Request, res: Response) {
    try {
      const userId = (req.user as any).id;
      const items = await lendDebtService.getLendDebts(userId);
      return res.json(items);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getLendDebt(req: Request, res: Response) {
    try {
      const userId = (req.user as any).id;
      const { id } = req.params;
      const item = await lendDebtService.getLendDebt(userId, id);
      if (!item)
        return res.status(404).json({ message: 'Lend/Debt not found' });
      return res.json(item);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateLendDebt(req: Request, res: Response) {
    try {
      const userId = (req.user as any).id;
      const { id } = req.params;
      const item = await lendDebtService.updateLendDebt(userId, id, req.body);
      if (!item)
        return res.status(404).json({ message: 'Lend/Debt not found' });
      return res.json(item);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async deleteLendDebt(req: Request, res: Response) {
    try {
      const userId = (req.user as any).id;
      const { id } = req.params;
      await lendDebtService.deleteLendDebt(userId, id);
      return res.json({ message: 'Lend/Debt deleted' });
    } catch (error) {
      if (!error)
        return res.status(404).json({ message: 'Lend/Debt not found' });
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Payments
  async createPayment(req: Request, res: Response) {
    try {
      const userId = (req.user as any).id;
      const payment = await lendDebtService.createPayment(userId, req.body);
      return res.status(201).json(payment);
    } catch (error: any) {
      if (error.message === 'Lend/Debt not found')
        return res.status(404).json({ message: error.message });
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getPayment(req: Request, res: Response) {
    try {
      const userId = (req.user as any).id;
      const { paymentId } = req.params;
      const payment = await lendDebtService.getPayment(userId, paymentId);
      if (!payment)
        return res.status(404).json({ message: 'Payment not found' });
      return res.json(payment);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updatePayment(req: Request, res: Response) {
    try {
      const userId = (req.user as any).id;
      const { paymentId } = req.params;
      const payment = await lendDebtService.updatePayment(
        userId,
        paymentId,
        req.body,
      );
      if (!payment)
        return res.status(404).json({ message: 'Payment not found' });
      return res.json(payment);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async deletePayment(req: Request, res: Response) {
    try {
      const userId = (req.user as any).id;
      const { paymentId } = req.params;
      await lendDebtService.deletePayment(userId, paymentId);
      return res.json({ message: 'Payment deleted' });
    } catch (error) {
      if (!error) return res.status(404).json({ message: 'Payment not found' });
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export const lendDebtController = new LendDebtController();
