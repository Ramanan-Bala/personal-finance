import { Router } from 'express';
import accountsRoutes from './modules/accounts/accounts.routes';
import authRoutes from './modules/auth/auth.routes';
import categoriesRoutes from './modules/categories/categories.routes';
import usersRoutes from './modules/users/users.routes';
import transactionsRoutes from './modules/transactions/transactions.routes';
import recurringTransactionsRoutes from './modules/recurring-transactions/recurring-transactions.routes';
import lendDebtRoutes from './modules/lend-debt/lend-debt.routes';
import { authMiddleware } from './middleware/auth';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/accounts', accountsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/transactions', transactionsRoutes);
router.use('/recurring-transactions', recurringTransactionsRoutes);
router.use('/lend-debt', lendDebtRoutes);

router.get('/settings/features', authMiddleware, (_req, res) => {
  res.json({
    aiCategorizationEnabled: process.env.AI_CATEGORIZATION_ENABLED !== 'false',
  });
});

export default router;
