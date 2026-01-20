import { Module } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { CategoriesController } from "./categories.controller";
import { CategoriesService } from "./categories.service";
import { CategoriesRepository } from "./repositories/categories.repository";

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoriesRepository, PrismaClient],
})
export class CategoriesModule {}
