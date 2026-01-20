import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export interface DailySummary {
  date: string;
  income: number;
  expense: number;
  netBalance: number;
}

@Injectable()
export class LedgerRepository {
  constructor(private prisma: PrismaClient) {}

  async getDailySummary(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<DailySummary[]> {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        transactionDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        transactionDate: true,
        type: true,
        amount: true,
      },
    });

    // Group by date
    const grouped = new Map<string, { income: number; expense: number }>();

    for (const transaction of transactions) {
      const dateKey = transaction.transactionDate.toISOString().split('T')[0];

      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, { income: 0, expense: 0 });
      }

      const data = grouped.get(dateKey)!;
      const amount = Number(transaction.amount);

      if (transaction.type === 'INCOME') {
        data.income += amount;
      } else if (transaction.type === 'EXPENSE') {
        data.expense += amount;
      }
    }

    // Convert to array and sort
    const result: DailySummary[] = [];
    for (const [date, data] of grouped.entries()) {
      result.push({
        date,
        income: data.income,
        expense: data.expense,
        netBalance: data.income - data.expense,
      });
    }

    return result.sort((a, b) => a.date.localeCompare(b.date));
  }

  async getAccountBalance(userId: string, accountId: string): Promise<number> {
    const account = await this.prisma.account.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) {
      return 0;
    }

    let balance = Number(account.openingBalance);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        accountId,
      },
    });

    for (const transaction of transactions) {
      const amount = Number(transaction.amount);
      if (transaction.type === 'INCOME') {
        balance += amount;
      } else if (transaction.type === 'EXPENSE') {
        balance -= amount;
      }
    }

    return balance;
  }

  async getAccountBalances(userId: string): Promise<Map<string, number>> {
    const accounts = await this.prisma.account.findMany({
      where: { userId },
    });

    const balances = new Map<string, number>();

    for (const account of accounts) {
      const balance = await this.getAccountBalance(userId, account.id);
      balances.set(account.id, balance);
    }

    return balances;
  }
}
