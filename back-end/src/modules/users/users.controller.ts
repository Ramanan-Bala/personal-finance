import { Request, Response } from 'express';
import { usersService } from './users.service';

export class UsersController {
  async getProfile(req: Request, res: Response) {
    try {
      const userId = (req.user as any).id;
      const user = await usersService.getProfile(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.json(user);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req.user as any).id;
      const user = await usersService.updateProfile(userId, req.body);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.json(user);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export const usersController = new UsersController();
