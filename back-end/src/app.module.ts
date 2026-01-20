import { Module } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { AccountsModule } from "./accounts/accounts.module";
import { AuthModule } from "./auth/auth.module";
import { CategoriesModule } from "./categories/categories.module";
import { LedgerModule } from "./ledger/ledger.module";
import { LendDebtModule } from "./lend-debt/lend-debt.module";
import { TransactionsModule } from "./transactions/transactions.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    AuthModule,
    UsersModule,
    AccountsModule,
    CategoriesModule,
    TransactionsModule,
    LedgerModule,
    LendDebtModule,
  ],
  providers: [PrismaClient],
})
export class AppModule {}
