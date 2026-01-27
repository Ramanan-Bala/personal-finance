import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { categoriesController } from './categories.controller';
import {
  createCategorySchema,
  updateCategorySchema,
} from './categories.schema';

const router = Router();

router.use(authMiddleware);

router.post(
  '/',
  validate(createCategorySchema),
  categoriesController.createCategory,
);
router.get('/', categoriesController.getCategories);
router.get('/:categoryId', categoriesController.getCategory);
router.patch(
  '/:categoryId',
  validate(updateCategorySchema),
  categoriesController.updateCategory,
);
router.delete('/:categoryId', categoriesController.deleteCategory);

export default router;
