import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { authController } from './auth.controller';
import {
  forgotPasswordSchema,
  loginSchema,
  logoutSchema,
  refreshTokenSchema,
  registerSchema,
  resetPasswordSchema,
  verify2faSchema,
} from './auth.schema';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post(
  '/refresh',
  validate(refreshTokenSchema),
  authController.refreshToken,
);
router.post('/verify-2fa', validate(verify2faSchema), authController.verify2fa);
router.post(
  '/forgot-password',
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);
router.post(
  '/reset-password',
  validate(resetPasswordSchema),
  authController.resetPassword,
);
router.post(
  '/logout',
  authMiddleware,
  validate(logoutSchema),
  authController.logout,
);

export default router;
