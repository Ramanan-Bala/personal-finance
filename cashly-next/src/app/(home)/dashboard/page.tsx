"use client";

import api from "@/lib/api/axios";
import {
  Account,
  AccountGroup,
  DashboardSummary,
  EmptyState,
  fadeInVariants,
  ICON_MAP,
  PageHeader,
  staggerContainerVariants,
  Transaction,
  TransactionType,
  useFormatter,
} from "@/shared";
import {
  Badge,
  Card,
  Flex,
  Grid,
  Heading,
  Skeleton,
  Text,
} from "@radix-ui/themes";
import {
  addMonths,
  endOfMonth,
  format,
  startOfMonth,
  subMonths,
} from "date-fns";
import { PiggyBank, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { MonthNavigator } from "../ledger/components/month-navigator";

import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CHART_COLORS = [
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#3b82f6",
  "#ec4899",
  "#8b5cf6",
  "#14b8a6",
];

export default function DashboardPage() {
  const { formatCurrency, formatDate } = useFormatter();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [accounts, setAccounts] = useState<AccountGroup[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  const dateRange = useMemo(
    () => ({
      from: startOfMonth(currentMonth),
      to: endOfMonth(currentMonth),
    }),
    [currentMonth],
  );

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [summaryRes, accountsRes, transactionsRes] = await Promise.all([
          api.get<DashboardSummary>("/dashboard/summary", {
            params: {
              from: dateRange.from.toISOString(),
              to: dateRange.to.toISOString(),
            },
          }),
          api.get<AccountGroup[]>("/accounts/groups"),
          api.get<Transaction[]>("/transactions", {
            params: {
              from: dateRange.from.toISOString(),
              to: dateRange.to.toISOString(),
              withAdditional: true,
            },
          }),
        ]);

        setSummary(summaryRes.data);
        setAccounts(accountsRes.data);
        setRecentTransactions(transactionsRes.data.slice(0, 10));
        console.log("Dashboard data:", {
          summary: summaryRes.data,
          accounts: accountsRes.data,
          transactions: transactionsRes.data,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [dateRange]);

  const totalBalance = useMemo(
    () =>
      accounts.reduce(
        (sum, group) =>
          sum +
          group.accounts.reduce(
            (s, account) => s + Number(account.openingBalance),
            0,
          ),
        0,
      ),
    [accounts],
  );

  const allAccounts = useMemo(
    () => accounts.flatMap((group) => group.accounts),
    [accounts],
  );

  const accountMonthlyNetMap = useMemo(() => {
    return recentTransactions.reduce<Record<string, number>>((acc, tx) => {
      const amount = Number(tx.amount);

      if (tx.type === TransactionType.INCOME) {
        acc[tx.accountId] = (acc[tx.accountId] ?? 0) + amount;
      } else if (tx.type === TransactionType.EXPENSE) {
        acc[tx.accountId] = (acc[tx.accountId] ?? 0) - amount;
      } else {
        acc[tx.accountId] = (acc[tx.accountId] ?? 0) - amount;
        if (tx.transferToAccountId) {
          acc[tx.transferToAccountId] =
            (acc[tx.transferToAccountId] ?? 0) + amount;
        }
      }

      return acc;
    }, {});
  }, [recentTransactions]);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Track your balance, trends, and recent activity"
      />
      <Flex justify="end">
        <Flex
          mb="4"
          width={{
            initial: "100%",
            sm: "calc(50% - 12px)",
            lg: "calc(25% - 12px)",
          }}
        >
          <MonthNavigator
            currentMonth={currentMonth}
            onPrev={() => setCurrentMonth((p) => subMonths(p, 1))}
            onNext={() => setCurrentMonth((p) => addMonths(p, 1))}
          />
        </Flex>
      </Flex>

      <motion.div {...staggerContainerVariants} className="space-y-6">
        <Grid columns={{ initial: "1", sm: "2", lg: "4" }} gap="4">
          <Card>
            <Flex justify="between" align="start" mb="2">
              <Text size="2" color="gray">
                Total Available Balance
              </Text>
              <Wallet size={18} className="text-muted-foreground" />
            </Flex>
            {loading ? (
              <Skeleton className="h-8 w-40" />
            ) : (
              <Heading size="6">{formatCurrency(totalBalance)}</Heading>
            )}
          </Card>

          <Card>
            <Flex justify="between" align="start" mb="2">
              <Text size="2" color="gray">
                Monthly Income
              </Text>
              <TrendingUp size={18} className="text-emerald-500" />
            </Flex>
            {loading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <Heading size="6" className="text-emerald-500">
                {formatCurrency(summary?.monthlyIncome ?? 0)}
              </Heading>
            )}
          </Card>

          <Card>
            <Flex justify="between" align="start" mb="2">
              <Text size="2" color="gray">
                Monthly Expense
              </Text>
              <TrendingDown size={18} className="text-red-500" />
            </Flex>
            {loading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <Heading size="6" className="text-red-500">
                {formatCurrency(summary?.monthlyExpense ?? 0)}
              </Heading>
            )}
          </Card>

          <Card>
            <Flex justify="between" align="start" mb="2">
              <Text size="2" color="gray">
                Net Savings
              </Text>
              <PiggyBank size={18} className="text-blue-500" />
            </Flex>
            {loading ? (
              <>
                <Skeleton className="mb-2 h-8 w-32" />
                <Skeleton className="h-4 w-24" />
              </>
            ) : (
              <>
                <Heading
                  size="6"
                  className={
                    (summary?.netSavings ?? 0) >= 0
                      ? "text-emerald-500"
                      : "text-red-500"
                  }
                >
                  {formatCurrency(summary?.netSavings ?? 0)}
                </Heading>
                <Text size="1" color="gray">
                  Savings rate: {(summary?.savingsRate ?? 0).toFixed(1)}%
                </Text>
              </>
            )}
          </Card>
        </Grid>

        <motion.div {...fadeInVariants}>
          <Text size="3" weight="bold" mb="3" as="div">
            Account Balances
          </Text>
          <div className="flex flex-wrap gap-3 pb-1">
            {loading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <Card key={index} className="min-w-[78%] sm:min-w-64">
                    <Skeleton className="mb-2 h-5 w-24" />
                    <Skeleton className="mb-2 h-7 w-40" />
                    <Skeleton className="h-5 w-24" />
                  </Card>
                ))
              : allAccounts.map((account: Account) => {
                  const currentBalance = Number(account.openingBalance);
                  const netFlow = accountMonthlyNetMap[account.id] ?? 0;
                  const estimatedLastMonthBalance = currentBalance - netFlow;
                  const percentChange =
                    estimatedLastMonthBalance === 0
                      ? 0
                      : (netFlow / Math.abs(estimatedLastMonthBalance)) * 100;

                  return (
                    <Card
                      key={account.id}
                      className="min-w-full sm:min-w-64 lg:min-w-72"
                    >
                      <Flex justify="between" align="start" mb="2">
                        <Text weight="medium" className="truncate pr-2">
                          {account.name}
                        </Text>
                        <Badge
                          color={
                            netFlow > 0 ? "green" : netFlow < 0 ? "red" : "gray"
                          }
                        >
                          {percentChange >= 0 ? "+" : ""}
                          {percentChange.toFixed(1)}%
                        </Badge>
                      </Flex>
                      <Heading size="5">
                        {formatCurrency(currentBalance)}
                      </Heading>
                      <Text size="1" color="gray">
                        vs last month
                      </Text>
                    </Card>
                  );
                })}
          </div>
        </motion.div>

        <Card>
          <Text size="3" weight="bold" mb="3" as="div">
            Income vs Expense (6 months)
          </Text>
          {loading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={summary?.sixMonthTrend ?? []}
                margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
              >
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar
                  dataKey="income"
                  fill="#22c55e"
                  name="Income"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="expense"
                  fill="#ef4444"
                  name="Expense"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Grid columns={{ initial: "1", md: "2", xl: "3" }} gap="4">
          <Card>
            <Text size="3" weight="bold" mb="3" as="div">
              Spending by Category
            </Text>
            {loading ? (
              <Skeleton className="h-[280px] w-full" />
            ) : (summary?.spendingByCategory.length ?? 0) === 0 ? (
              <EmptyState
                title="No expense data"
                description="No expense transactions found for this month."
              />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={summary?.spendingByCategory ?? []}
                    dataKey="amount"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={100}
                  >
                    {(summary?.spendingByCategory ?? []).map((_, index) => (
                      <Cell
                        key={`spend-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card>
            <Text size="3" weight="bold" mb="3" as="div">
              Income by Category
            </Text>
            {loading ? (
              <Skeleton className="h-[280px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={summary?.incomeByCategory ?? []}
                    dataKey="amount"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={100}
                  >
                    {(summary?.incomeByCategory ?? []).map((_, index) => (
                      <Cell
                        key={`income-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card className="md:col-span-2 xl:col-span-1">
            <Text size="3" weight="bold" mb="3" as="div">
              Daily Spending
            </Text>
            {loading ? (
              <Skeleton className="h-[280px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={summary?.dailySpending ?? []}>
                  <XAxis
                    dataKey="day"
                    tickFormatter={(day) => format(new Date(day), "dd")}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(day) => format(new Date(day), "dd MMM")}
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Grid>

        <Card>
          <Text size="3" weight="bold" mb="3" as="div">
            Last 10 Transactions
          </Text>

          {loading ? (
            <Flex direction="column" gap="3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </Flex>
          ) : recentTransactions.length === 0 ? (
            <EmptyState
              title="No transactions found"
              description="Add a transaction to start tracking your monthly activity."
            />
          ) : (
            <Flex direction="column" gap="2">
              {recentTransactions.map((transaction) => {
                const iconName = transaction.category?.icon ?? "Tag";
                const Icon = ICON_MAP[iconName] ?? ICON_MAP.Tag;

                return (
                  <Flex
                    key={transaction.id}
                    align={{ initial: "start", sm: "center" }}
                    justify="between"
                    direction={{ initial: "column", sm: "row" }}
                    gap={{ initial: "2", sm: "0" }}
                    className="rounded-md border px-3 py-2"
                  >
                    <Flex align="center" gap="3" className="min-w-0">
                      <div className="bg-muted rounded-md p-2">
                        <Icon size={14} />
                      </div>
                      <div className="min-w-0">
                        <Text size="2" weight="medium" className="line-clamp-1">
                          {transaction.notes ||
                            (transaction.type === TransactionType.TRANSFER
                              ? "Transfer"
                              : transaction.category?.name || "Transaction")}
                        </Text>
                        <Text size="1" color="gray">
                          {transaction.account?.name || "Account"}
                        </Text>
                      </div>
                    </Flex>

                    <Flex
                      direction="column"
                      align={{ initial: "start", sm: "end" }}
                      className="w-full sm:w-auto"
                    >
                      <Text
                        size="2"
                        weight="bold"
                        className={
                          transaction.type === TransactionType.INCOME
                            ? "text-emerald-500"
                            : transaction.type === TransactionType.EXPENSE
                              ? "text-red-500"
                              : "text-blue-500"
                        }
                      >
                        {transaction.type === TransactionType.INCOME
                          ? "+"
                          : transaction.type === TransactionType.EXPENSE
                            ? "-"
                            : ""}
                        {formatCurrency(Number(transaction.amount))}
                      </Text>
                      <Text size="1" color="gray">
                        {formatDate(transaction.transactionDate)}
                      </Text>
                    </Flex>
                  </Flex>
                );
              })}
            </Flex>
          )}
        </Card>
      </motion.div>
    </>
  );
}
