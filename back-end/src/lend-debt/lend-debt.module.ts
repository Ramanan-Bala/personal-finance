import { Module } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { LendDebtController } from "./lend-debt.controller";
import { LendDebtService } from "./lend-debt.service";
import { LendDebtRepository } from "./repositories/lend-debt.repository";

@Module({
  controllers: [LendDebtController],
  providers: [LendDebtService, LendDebtRepository, PrismaClient],
})
export class LendDebtModule {}
