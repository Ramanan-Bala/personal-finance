import { and, between, eq, gte, lte, sql } from 'drizzle-orm';
import { endOfMonth, startOfMonth, subMonths } from 'date-fns';
import { db } from '../../db';
import { categories, transactions } from '../../db/schema';

type AmountSums = {
  income: number;
  expense: number;
};

type CategoryBreakdown = {
  categoryId: string;
  name: string;
  amount: number;
  percentage: number;
};

export class DashboardService {
  private async getRangeSums(
    userId: string,
    from: Date,
    to: Date,
  ): Promise<AmountSums> {
    const [row] = await db
      .select({
        income: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'INCOME' THEN ${transactions.amount} ELSE 0 END), 0)`,
        expense: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'EXPENSE' THEN ${transactions.amount} ELSE 0 END), 0)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          between(transactions.transactionDate, from, to),
        ),
      );

    return {
      income: Number(row?.income ?? 0),
      expense: Number(row?.expense ?? 0),
    };
  }

  private async getCategoryBreakdown(
    userId: string,
    from: Date,
    to: Date,
    type: 'INCOME' | 'EXPENSE',
  ): Promise<CategoryBreakdown[]> {
    const rows = await db
      .select({
        categoryId: transactions.categoryId,
        name: sql<string>`COALESCE(${categories.name}, 'Uncategorized')`,
        amount: sql<string>`COALESCE(SUM(${transactions.amount}), 0)`,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, type),
          gte(transactions.transactionDate, from),
          lte(transactions.transactionDate, to),
          sql`${transactions.categoryId} IS NOT NULL`,
        ),
      )
      .groupBy(transactions.categoryId, categories.name);

    const items = rows
      .map(row => ({
        categoryId: row.categoryId ?? 'uncategorized',
        name: row.name,
        amount: Number(row.amount),
      }))
      .sort((a, b) => b.amount - a.amount);

    const total = items.reduce((sum, item) => sum + item.amount, 0);

    return items.map(item => ({
      ...item,
      percentage: total > 0 ? (item.amount / total) * 100 : 0,
    }));
  }

  async getSummary(userId: string, from: Date, to: Date) {
    const sixMonthTrend = await Promise.all(
      Array.from({ length: 6 }, (_, index) => index)
        .reverse()
        .map(async monthOffset => {
          const monthDate = subMonths(to, monthOffset);
          const monthStart = startOfMonth(monthDate);
          const monthEnd = endOfMonth(monthDate);
          const sums = await this.getRangeSums(userId, monthStart, monthEnd);

          return {
            month: monthDate.toLocaleString('en-US', { month: 'short' }),
            income: sums.income,
            expense: sums.expense,
          };
        }),
    );

    const currentMonthSums = await this.getRangeSums(userId, from, to);
    const monthlyIncome = currentMonthSums.income;
    const monthlyExpense = currentMonthSums.expense;
    const netSavings = monthlyIncome - monthlyExpense;
    const savingsRate =
      monthlyIncome > 0 ? (netSavings / monthlyIncome) * 100 : 0;

    const [spendingByCategory, incomeByCategory] = await Promise.all([
      this.getCategoryBreakdown(userId, from, to, 'EXPENSE'),
      this.getCategoryBreakdown(userId, from, to, 'INCOME'),
    ]);

    const dailyRows = await db
      .select({
        day: sql<string>`DATE(${transactions.transactionDate})`,
        amount: sql<string>`COALESCE(SUM(${transactions.amount}), 0)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, 'EXPENSE'),
          gte(transactions.transactionDate, from),
          lte(transactions.transactionDate, to),
        ),
      )
      .groupBy(sql`DATE(${transactions.transactionDate})`);

    const dailyMap = new Map(
      dailyRows.map(row => [row.day, Number(row.amount)] as const),
    );

    const dailySpending: Array<{ day: string; amount: number }> = [];
    const cursor = new Date(from);
    cursor.setHours(0, 0, 0, 0);
    const endCursor = new Date(to);
    endCursor.setHours(0, 0, 0, 0);

    while (cursor <= endCursor) {
      const dayKey = cursor.toISOString().split('T')[0];
      dailySpending.push({
        day: dayKey,
        amount: dailyMap.get(dayKey) ?? 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    const previousMonthDate = subMonths(from, 1);
    const previousMonthFrom = startOfMonth(previousMonthDate);
    const previousMonthTo = endOfMonth(previousMonthDate);
    const previousMonthSums = await this.getRangeSums(
      userId,
      previousMonthFrom,
      previousMonthTo,
    );

    return {
      sixMonthTrend,
      monthlyIncome,
      monthlyExpense,
      netSavings,
      savingsRate,
      spendingByCategory,
      incomeByCategory,
      dailySpending,
      lastMonthIncome: previousMonthSums.income,
      lastMonthExpense: previousMonthSums.expense,
    };
  }
}

export const dashboardService = new DashboardService();
