export interface SixMonthTrendItem {
  month: string;
  income: number;
  expense: number;
}

export interface CategoryBreakdownItem {
  categoryId: string;
  name: string;
  amount: number;
  percentage: number;
}

export interface DailySpendingItem {
  day: string;
  amount: number;
}

export interface DashboardSummary {
  sixMonthTrend: SixMonthTrendItem[];
  monthlyIncome: number;
  monthlyExpense: number;
  netSavings: number;
  savingsRate: number;
  spendingByCategory: CategoryBreakdownItem[];
  incomeByCategory: CategoryBreakdownItem[];
  dailySpending: DailySpendingItem[];
  lastMonthIncome: number;
  lastMonthExpense: number;
}
