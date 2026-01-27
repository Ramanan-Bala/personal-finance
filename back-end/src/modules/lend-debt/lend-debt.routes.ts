import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { lendDebtController } from './lend-debt.controller';
import {
  createLendDebtPaymentSchema,
  createLendDebtSchema,
  updateLendDebtPaymentSchema,
  updateLendDebtSchema,
} from './lend-debt.schema';

const router = Router();

router.use(authMiddleware);

// Lend/Debt
router.post(
  '/',
  validate(createLendDebtSchema),
  lendDebtController.createLendDebt,
);
router.get('/', lendDebtController.getLendDebts);
router.get('/:id', lendDebtController.getLendDebt);
router.patch(
  '/:id',
  validate(updateLendDebtSchema),
  lendDebtController.updateLendDebt,
);
router.delete('/:id', lendDebtController.deleteLendDebt);

// Payments (Nested under lend-debt for consistency with controller but usually separate resource)
// Actually controller had separate routes. I'll match them.
router.post(
  '/payments',
  validate(createLendDebtPaymentSchema),
  lendDebtController.createPayment,
);
router.get('/payments/:paymentId', lendDebtController.getPayment);
router.patch(
  '/payments/:paymentId',
  validate(updateLendDebtPaymentSchema),
  lendDebtController.updatePayment,
);
router.delete('/payments/:paymentId', lendDebtController.deletePayment);

export default router;
