import { Request, Response } from 'express';
import { categoriesService } from './categories.service';

export class CategoriesController {
  async createCategory(req: Request, res: Response) {
    try {
      const userId = (req.user as any).id;
      const category = await categoriesService.createCategory(userId, req.body);
      return res.status(201).json(category);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getCategories(req: Request, res: Response) {
    try {
      const userId = (req.user as any).id;
      const { type } = req.query;

      if (type && (type === 'INCOME' || type === 'EXPENSE')) {
        const categories = await categoriesService.getCategoriesByType(
          userId,
          type,
        );
        return res.json(categories);
      }

      const categories = await categoriesService.getCategories(userId);
      return res.json(categories);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getCategory(req: Request, res: Response) {
    try {
      const userId = (req.user as any).id;
      const { categoryId } = req.params;
      const category = await categoriesService.getCategory(userId, categoryId);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      return res.json(category);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateCategory(req: Request, res: Response) {
    try {
      const userId = (req.user as any).id;
      const { categoryId } = req.params;
      const category = await categoriesService.updateCategory(
        userId,
        categoryId,
        req.body,
      );
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      return res.json(category);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async deleteCategory(req: Request, res: Response) {
    try {
      const userId = (req.user as any).id;
      const { categoryId } = req.params;
      await categoriesService.deleteCategory(userId, categoryId);
      return res.json({ message: 'Category deleted' });
    } catch (error: any) {
      if (error.message === 'Cannot delete category with transactions') {
        return res.status(400).json({ message: error.message });
      }
      if (!error)
        return res.status(404).json({ message: 'Category not found' });
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export const categoriesController = new CategoriesController();
