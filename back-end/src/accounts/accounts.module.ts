import { Module } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { AccountsController } from "./accounts.controller";
import { AccountsService } from "./accounts.service";
import { AccountsRepository } from "./repositories/accounts.repository";

@Module({
  controllers: [AccountsController],
  providers: [AccountsService, AccountsRepository, PrismaClient],
})
export class AccountsModule {}
