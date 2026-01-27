import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { transactionsController } from './transactions.controller';
import {
  createTransactionSchema,
  updateTransactionSchema,
} from './transactions.schema';

const router = Router();

router.use(authMiddleware);

router.post(
  '/',
  validate(createTransactionSchema),
  transactionsController.createTransaction,
);
router.get('/', transactionsController.getTransactions);
router.get('/:transactionId', transactionsController.getTransaction);
router.patch(
  '/:transactionId',
  validate(updateTransactionSchema),
  transactionsController.updateTransaction,
);
router.delete('/:transactionId', transactionsController.deleteTransaction);

export default router;
