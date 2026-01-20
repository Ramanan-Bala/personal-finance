import { Module } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { TransactionsRepository } from "./repositories/transactions.repository";
import { TransactionsController } from "./transactions.controller";
import { TransactionsService } from "./transactions.service";

@Module({
  controllers: [TransactionsController],
  providers: [TransactionsService, TransactionsRepository, PrismaClient],
})
export class TransactionsModule {}
