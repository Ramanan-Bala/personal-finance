import { Module } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { UsersRepository } from "./repositories/users.repository";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, PrismaClient],
})
export class UsersModule {}
