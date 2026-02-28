import { and, eq } from 'drizzle-orm';
import { stripTimestamps } from '../../common/utils';
import { db } from '../../db';
import { categories, transactions } from '../../db/schema';
import { CreateCategoryInput, UpdateCategoryInput } from './categories.schema';

export class CategoriesService {
  async createCategory(userId: string, input: CreateCategoryInput) {
    const [category] = await db
      .insert(categories)
      .values({ userId, ...input })
      .returning();

    return category ? stripTimestamps(category) : null;
  }

  async getCategories(userId: string) {
    return db.query.categories.findMany({
      where: eq(categories.userId, userId),
      columns: { createdAt: false, updatedAt: false },
    });
  }

  async getCategoriesByType(userId: string, type: 'INCOME' | 'EXPENSE') {
    return db.query.categories.findMany({
      where: and(eq(categories.userId, userId), eq(categories.type, type)),
      columns: { createdAt: false, updatedAt: false },
    });
  }

  async getCategory(userId: string, categoryId: string) {
    return db.query.categories.findFirst({
      where: and(eq(categories.id, categoryId), eq(categories.userId, userId)),
      columns: { createdAt: false, updatedAt: false },
    });
  }

  async updateCategory(
    userId: string,
    categoryId: string,
    input: UpdateCategoryInput,
  ) {
    const [category] = await db
      .update(categories)
      .set({ ...input, updatedAt: new Date() })
      .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
      .returning();

    return category ? stripTimestamps(category) : null;
  }

  async deleteCategory(userId: string, categoryId: string) {
    const category = await db.query.categories.findFirst({
      where: and(eq(categories.id, categoryId), eq(categories.userId, userId)),
    });
    if (!category) return null;

    const hasTransactions = await db.query.transactions.findFirst({
      where: eq(transactions.categoryId, categoryId),
    });
    if (hasTransactions)
      throw new Error('Cannot delete category with transactions');

    await db
      .delete(categories)
      .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)));
    return true;
  }
}

export const categoriesService = new CategoriesService();
