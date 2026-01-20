import { AppException } from "@/common/exceptions/app.exception";
import { Injectable } from "@nestjs/common";
import { CategoryType } from "@prisma/client";
import { CreateCategoryDto, UpdateCategoryDto } from "./dto/category.dto";
import { CategoriesRepository } from "./repositories/categories.repository";

@Injectable()
export class CategoriesService {
  constructor(private categoriesRepository: CategoriesRepository) {}

  async createCategory(userId: string, dto: CreateCategoryDto) {
    return this.categoriesRepository.createCategory(
      userId,
      dto.name,
      dto.type,
      dto.icon,
      dto.description
    );
  }

  async getCategories(userId: string) {
    return this.categoriesRepository.findCategoriesByUserId(userId);
  }

  async getCategory(userId: string, categoryId: string) {
    const category = await this.categoriesRepository.findCategoryById(
      userId,
      categoryId
    );

    if (!category) {
      AppException.notFound("Category");
    }

    return category;
  }

  async getCategoriesByType(userId: string, type: CategoryType) {
    return this.categoriesRepository.findCategoriesByType(userId, type);
  }

  async updateCategory(
    userId: string,
    categoryId: string,
    dto: UpdateCategoryDto
  ) {
    const category = await this.categoriesRepository.findCategoryById(
      userId,
      categoryId
    );

    if (!category) {
      AppException.notFound("Category");
    }

    return this.categoriesRepository.updateCategory(userId, categoryId, dto);
  }

  async deleteCategory(userId: string, categoryId: string) {
    const category = await this.categoriesRepository.findCategoryById(
      userId,
      categoryId
    );

    if (!category) {
      AppException.notFound("Category");
    }

    // Check if category has transactions
    const hasTransactions = await this.categoriesRepository.hasTransactions(
      categoryId
    );

    if (hasTransactions) {
      AppException.badRequest("Cannot delete category with transactions");
    }

    await this.categoriesRepository.deleteCategory(userId, categoryId);
  }
}
