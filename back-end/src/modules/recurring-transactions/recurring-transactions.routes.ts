import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { recurringTransactionsController } from './recurring-transactions.controller';
import {
  createRecurringTransactionSchema,
  materializeSchema,
  updateRecurringTransactionSchema,
} from './recurring-transactions.schema';

const router = Router();

router.use(authMiddleware);

router.get('/', recurringTransactionsController.listRules);
router.post(
  '/',
  validate(createRecurringTransactionSchema),
  recurringTransactionsController.createRule,
);
router.patch(
  '/:recurringTransactionId',
  validate(updateRecurringTransactionSchema),
  recurringTransactionsController.updateRule,
);
router.post(
  '/materialize',
  validate(materializeSchema),
  recurringTransactionsController.materialize,
);

export default router;
