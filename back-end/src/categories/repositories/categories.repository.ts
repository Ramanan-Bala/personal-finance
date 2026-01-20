import { Injectable } from '@nestjs/common';
import { Category, CategoryType, PrismaClient } from '@prisma/client';

@Injectable()
export class CategoriesRepository {
  constructor(private prisma: PrismaClient) {}

  async createCategory(
    userId: string,
    name: string,
    type: CategoryType,
    icon?: string,
    description?: string,
  ): Promise<Category> {
    return this.prisma.category.create({
      data: {
        userId,
        name,
        type,
        icon,
        description,
      },
    });
  }

  async findCategoryById(
    userId: string,
    categoryId: string,
  ): Promise<Category | null> {
    return this.prisma.category.findFirst({
      where: {
        id: categoryId,
        userId,
      },
    });
  }

  async findCategoriesByUserId(userId: string): Promise<Category[]> {
    return this.prisma.category.findMany({
      where: { userId },
    });
  }

  async findCategoriesByType(
    userId: string,
    type: CategoryType,
  ): Promise<Category[]> {
    return this.prisma.category.findMany({
      where: {
        userId,
        type,
      },
    });
  }

  async updateCategory(
    _userId: string,
    categoryId: string,
    data: Partial<Category>,
  ): Promise<Category> {
    return this.prisma.category.update({
      where: { id: categoryId },
      data: {
        name: data.name,
        icon: data.icon,
        description: data.description,
      },
    });
  }

  async deleteCategory(_userId: string, categoryId: string): Promise<void> {
    await this.prisma.category.delete({
      where: { id: categoryId },
    });
  }

  async hasTransactions(categoryId: string): Promise<boolean> {
    const count = await this.prisma.transaction.count({
      where: { categoryId },
    });
    return count > 0;
  }
}
