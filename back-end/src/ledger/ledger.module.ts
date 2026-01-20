import { Module } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { LedgerController } from "./ledger.controller";
import { LedgerService } from "./ledger.service";
import { LedgerRepository } from "./repositories/ledger.repository";

@Module({
  controllers: [LedgerController],
  providers: [LedgerService, LedgerRepository, PrismaClient],
})
export class LedgerModule {}
