import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { usersController } from './users.controller';
import { updateProfileSchema } from './users.schema';

const router = Router();

router.get('/profile', authMiddleware, usersController.getProfile);
router.patch(
  '/profile',
  authMiddleware,
  validate(updateProfileSchema),
  usersController.updateProfile,
);

export default router;
