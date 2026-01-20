import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { AllExceptionsFilter } from "@/common/filters/all-exceptions.filter";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import {
  Controller,
  Get,
  Param,
  Query,
  UseFilters,
  UseGuards,
} from "@nestjs/common";
import { LedgerService } from "./ledger.service";

@Controller("ledger")
@UseGuards(JwtAuthGuard)
@UseFilters(AllExceptionsFilter)
export class LedgerController {
  constructor(private ledgerService: LedgerService) {}

  @Get("daily-summary")
  async getDailySummary(
    @CurrentUser() user: any,
    @Query("from") from?: string,
    @Query("to") to?: string
  ) {
    return this.ledgerService.getDailySummary(user.id, from, to);
  }

  @Get("account/:accountId/balance")
  async getAccountBalance(
    @CurrentUser() user: any,
    @Param("accountId") accountId: string
  ) {
    const balance = await this.ledgerService.getAccountBalance(
      user.id,
      accountId
    );
    return { accountId, balance };
  }

  @Get("accounts/balances")
  async getAccountBalances(@CurrentUser() user: any) {
    const balances = await this.ledgerService.getAccountBalances(user.id);
    return balances;
  }
}
