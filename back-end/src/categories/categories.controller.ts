import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { AllExceptionsFilter } from "@/common/filters/all-exceptions.filter";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseFilters,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { CategoryType } from "@prisma/client";
import { CategoriesService } from "./categories.service";
import { CreateCategoryDto, UpdateCategoryDto } from "./dto/category.dto";

@Controller("categories")
@UseGuards(JwtAuthGuard)
@UseFilters(AllExceptionsFilter)
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Post()
  async createCategory(
    @CurrentUser() user: any,
    @Body(ValidationPipe) dto: CreateCategoryDto
  ) {
    return this.categoriesService.createCategory(user.id, dto);
  }

  @Get()
  async getCategories(
    @CurrentUser() user: any,
    @Query("type") type?: CategoryType
  ) {
    if (type) {
      return this.categoriesService.getCategoriesByType(user.id, type);
    }
    return this.categoriesService.getCategories(user.id);
  }

  @Get(":categoryId")
  async getCategory(
    @CurrentUser() user: any,
    @Param("categoryId") categoryId: string
  ) {
    return this.categoriesService.getCategory(user.id, categoryId);
  }

  @Patch(":categoryId")
  async updateCategory(
    @CurrentUser() user: any,
    @Param("categoryId") categoryId: string,
    @Body(ValidationPipe) dto: UpdateCategoryDto
  ) {
    return this.categoriesService.updateCategory(user.id, categoryId, dto);
  }

  @Delete(":categoryId")
  async deleteCategory(
    @CurrentUser() user: any,
    @Param("categoryId") categoryId: string
  ) {
    await this.categoriesService.deleteCategory(user.id, categoryId);
    return { message: "Category deleted" };
  }
}
