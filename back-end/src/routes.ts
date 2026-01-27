import { Router } from 'express';
import accountsRoutes from './modules/accounts/accounts.routes';
import authRoutes from './modules/auth/auth.routes';
import categoriesRoutes from './modules/categories/categories.routes';
import usersRoutes from './modules/users/users.routes';
import transactionsRoutes from './modules/transactions/transactions.routes';
import lendDebtRoutes from './modules/lend-debt/lend-debt.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/accounts', accountsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/transactions', transactionsRoutes);
router.use('/lend-debt', lendDebtRoutes);

export default router;
