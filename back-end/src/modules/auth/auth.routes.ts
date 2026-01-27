import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { authController } from './auth.controller';
import {
  loginSchema,
  logoutSchema,
  refreshTokenSchema,
  registerSchema,
} from './auth.schema';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post(
  '/refresh',
  validate(refreshTokenSchema),
  authController.refreshToken,
);
router.post(
  '/logout',
  authMiddleware,
  validate(logoutSchema),
  authController.logout,
);

export default router;
