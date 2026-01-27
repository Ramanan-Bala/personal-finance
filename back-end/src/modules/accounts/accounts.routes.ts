import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { accountsController } from './accounts.controller';
import {
  createAccountGroupSchema,
  createAccountSchema,
  updateAccountGroupSchema,
  updateAccountSchema,
} from './accounts.schema';

const router = Router();

router.use(authMiddleware);

// Groups
router.post(
  '/groups',
  validate(createAccountGroupSchema),
  accountsController.createAccountGroup,
);
router.get('/groups', accountsController.getAccountGroups);
router.patch(
  '/groups/:groupId',
  validate(updateAccountGroupSchema),
  accountsController.updateAccountGroup,
);
router.delete('/groups/:groupId', accountsController.deleteAccountGroup);

// Accounts
router.post(
  '/',
  validate(createAccountSchema),
  accountsController.createAccount,
);
router.get('/', accountsController.getAccounts);
router.get('/:accountId', accountsController.getAccount);
router.patch(
  '/:accountId',
  validate(updateAccountSchema),
  accountsController.updateAccount,
);
router.delete('/:accountId', accountsController.deleteAccount);

export default router;
