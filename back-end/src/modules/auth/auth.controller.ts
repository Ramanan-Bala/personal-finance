import { Request, Response } from 'express';
import { authService } from './auth.service';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const tokens = await authService.register(req.body);
      return res.status(201).json(tokens);
    } catch (error: any) {
      if (error.message === 'Email already in use') {
        return res.status(409).json({ message: error.message });
      }
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const result = await authService.login(req.body);
      if ('twoFactorRequired' in result) {
        return res.status(202).json(result);
      }
      return res.json(result);
    } catch (error: any) {
      if (error.message === 'Invalid email or password') {
        return res.status(400).json({ message: error.message });
      }
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async verify2fa(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;
      const tokens = await authService.verify2fa(email, otp);
      return res.json(tokens);
    } catch (error: any) {
      if (error.message === 'Invalid or expired OTP') {
        return res.status(400).json({ message: error.message });
      }
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      await authService.forgotPassword(req.body.email);
      return res.json({ message: 'If the email exists, an OTP has been sent' });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      await authService.resetPassword(req.body);
      return res.json({ message: 'Password has been reset successfully' });
    } catch (error: any) {
      if (error.message === 'Invalid or expired OTP') {
        return res.status(400).json({ message: error.message });
      }
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const tokens = await authService.refreshToken(req.body.refreshToken);
      return res.json(tokens);
    } catch (error: any) {
      if (
        error.message.includes('Invalid') ||
        error.message.includes('expired')
      ) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const userId = (req.user as any)?.id;
      const { refreshToken } = req.body;
      await authService.logout(userId, refreshToken);
      return res.json({ message: 'Logged out successfully' });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export const authController = new AuthController();
