import { Request, Response } from 'express';
import { accountsService } from './accounts.service';

export class AccountsController {
  // Groups
  async createAccountGroup(req: Request, res: Response) {
    try {
      const userId = (req.user as any).id;
      const group = await accountsService.createAccountGroup(userId, req.body);
      return res.status(201).json(group);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getAccountGroups(req: Request, res: Response) {
    try {
      const userId = (req.user as any).id;
      const groups = await accountsService.getAccountGroups(userId);
      return res.json(groups);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateAccountGroup(req: Request, res: Response) {
    try {
      const userId = (req.user as any).id;
      const { groupId } = req.params;
      const group = await accountsService.updateAccountGroup(
        userId,
        groupId,
        req.body,
      );
      if (!group)
        return res.status(404).json({ message: 'Account group not found' });
      return res.json(group);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async deleteAccountGroup(req: Request, res: Response) {
    try {
      const userId = (req.user as any).id;
      const { groupId } = req.params;
      const success = await accountsService.deleteAccountGroup(userId, groupId);
      if (!success)
        return res.status(404).json({ message: 'Account group not found' });
      return res.json({ message: 'Account group deleted' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Accounts
  async createAccount(req: Request, res: Response) {
    try {
      const userId = (req.user as any).id;
      const account = await accountsService.createAccount(userId, req.body);
      return res.status(201).json(account);
    } catch (error: any) {
      if (error.message === 'Account Group not found')
        return res.status(404).json({ message: error.message });
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getAccounts(req: Request, res: Response) {
    try {
      const userId = (req.user as any).id;
      const accounts = await accountsService.getAccounts(userId);
      return res.json(accounts);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getAccount(req: Request, res: Response) {
    try {
      const userId = (req.user as any).id;
      const { accountId } = req.params;
      const account = await accountsService.getAccount(userId, accountId);
      if (!account)
        return res.status(404).json({ message: 'Account not found' });
      return res.json(account);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateAccount(req: Request, res: Response) {
    try {
      const userId = (req.user as any).id;
      const { accountId } = req.params;
      const account = await accountsService.updateAccount(
        userId,
        accountId,
        req.body,
      );
      if (!account)
        return res.status(404).json({ message: 'Account not found' });
      return res.json(account);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async deleteAccount(req: Request, res: Response) {
    try {
      const userId = (req.user as any).id;
      const { accountId } = req.params;
      await accountsService.deleteAccount(userId, accountId);
      return res.json({ message: 'Account deleted' });
    } catch (error: any) {
      if (error.message === 'Cannot delete account with transactions')
        return res.status(400).json({ message: error.message });
      if (!error) return res.status(404).json({ message: 'Account not found' }); // null return from service
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export const accountsController = new AccountsController();
