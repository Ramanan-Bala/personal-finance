import { AppException } from "@/common/exceptions/app.exception";
import { Injectable } from "@nestjs/common";
import { LedgerRepository } from "./repositories/ledger.repository";

@Injectable()
export class LedgerService {
  constructor(private ledgerRepository: LedgerRepository) {}

  async getDailySummary(userId: string, from?: string, to?: string) {
    let startDate = new Date();
    let endDate = new Date();

    if (from && to) {
      startDate = new Date(from);
      endDate = new Date(to);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        AppException.badRequest("Invalid date format");
      }
    } else {
      // Default to last 30 days
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
    }

    return this.ledgerRepository.getDailySummary(userId, startDate, endDate);
  }

  async getAccountBalance(userId: string, accountId: string) {
    return this.ledgerRepository.getAccountBalance(userId, accountId);
  }

  async getAccountBalances(userId: string) {
    const balances = await this.ledgerRepository.getAccountBalances(userId);

    const result: Record<string, number> = {};
    for (const [accountId, balance] of balances.entries()) {
      result[accountId] = balance;
    }

    return result;
  }
}
