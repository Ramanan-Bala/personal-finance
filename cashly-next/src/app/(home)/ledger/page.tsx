"use client";

import api from "@/lib/api/axios";
import {
  EmptyState,
  ICON_MAP,
  leftToRightVariants,
  PageHeader,
  staggerContainerVariants,
  Transaction,
  TransactionType,
  useFormatter,
  viewPortOnce,
} from "@/shared";
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Skeleton,
  Text,
  TextField,
} from "@radix-ui/themes";
import {
  addMonths,
  endOfMonth,
  format,
  startOfMonth,
  subMonths,
} from "date-fns";
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";

interface LedgerTransaction {
  totalIncome: number;
  totalExpense: number;
  transactions: Transaction[];
}

export default function LedgerPage() {
  const { formatDate, formatCurrency } = useFormatter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const handlePrevMonth = () => setCurrentMonth((prev) => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth((prev) => addMonths(prev, 1));

  const dateRange = useMemo(() => {
    return { from: startOfMonth(currentMonth), to: endOfMonth(currentMonth) };
  }, [currentMonth]);

  const [transactions, setTransactions] = useState<{
    [key: string]: LedgerTransaction;
  }>({});

  const [searchQuery, setSearchQuery] = useState("");

  const filteredTransactions = useMemo(() => {
    const query = searchQuery.toLowerCase();

    const filtered: { [key: string]: LedgerTransaction } = {};

    Object.entries({ ...transactions }).map(([date, item]) => {
      const filteredTransactions = item.transactions.filter((transaction) =>
        transaction.notes?.toLowerCase().includes(query),
      );

      if (filteredTransactions.length > 0)
        filtered[date] = { ...item, transactions: filteredTransactions };
    });

    return filtered ?? {};
  }, [transactions, searchQuery]);

  useEffect(() => {
    setLoading(true);
    const fetchTransactions = async () => {
      try {
        const response = await api.get<Transaction[]>("/transactions", {
          params: {
            from: dateRange.from.toISOString(),
            to: dateRange.to.toISOString(),
            withAdditional: true,
          },
        });
        var groupedTransactions = response.data.reduce(
          (acc, transaction) => {
            const date = format(transaction.transactionDate, "yyyy-MM-dd"); // Stable grouping key
            const displayDate = formatDate(transaction.transactionDate);
            if (!acc[date]) {
              acc[date] = { totalIncome: 0, totalExpense: 0, transactions: [] };
            }
            // Store the display date so we use it in the UI
            (acc[date] as any).displayDate = displayDate;
            acc[date].transactions.push(transaction);
            if (transaction.type === TransactionType.INCOME) {
              acc[date].totalIncome += Number(transaction.amount);
            } else {
              acc[date].totalExpense += Number(transaction.amount);
            }
            return acc;
          },
          {} as { [key: string]: LedgerTransaction },
        );

        setTransactions(groupedTransactions);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [dateRange]);

  const getIconForCategory = (
    transactionType: TransactionType,
    iconName?: string | null,
  ) => {
    if (!iconName) return null;
    const Icon = ICON_MAP[iconName];
    return Icon ? (
      <Icon
        className={`w-4 h-4 ${transactionType === TransactionType.INCOME ? "text-primary" : "text-red-600"}`}
      />
    ) : null;
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-6rem)]">
      <PageHeader
        title="Ledger"
        description="Your daily financial timeline"
        actions={
          <div className="flex items-center gap-1 bg-card border border-border rounded-lg px-3 py-2">
            <Button
              variant="ghost"
              className="h-6 w-4"
              onClick={handlePrevMonth}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="px-3 text-sm font-medium text-foreground w-36 text-center">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <Button
              variant="ghost"
              className="h-6 w-4"
              onClick={handleNextMonth}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        }
      />

      <TextField.Root
        size="3"
        placeholder="Search transactions..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full md:w-80 mb-4"
      >
        <TextField.Slot>
          <Search size={16} />
        </TextField.Slot>
      </TextField.Root>

      {loading ? (
        <Flex direction="column" gap="4">
          <Flex justify="between">
            <Skeleton className="w-1/4 h-10" />
            <Skeleton className="w-1/12 h-10" />
          </Flex>
          <Skeleton className="w-full h-10" />
          <Skeleton className="w-full h-10" />
          <Skeleton className="w-full h-10" />
        </Flex>
      ) : Object.entries(filteredTransactions).length === 0 ? (
        <EmptyState
          title="No transactions found"
          description="Try adjusting your filters or search query to find what you're looking for."
        />
      ) : (
        <div className="flex-1 overflow-y-auto relative space-y-5 rounded-lg">
          <AnimatePresence mode="popLayout">
            {Object.entries(filteredTransactions).map(([date, item]) => (
              <motion.div
                key={date}
                layout="position"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Flex direction="column">
                  <Flex
                    justify="between"
                    align="center"
                    className="sticky top-0 z-10 backdrop-blur-lg"
                    my="3"
                  >
                    <Flex gap="4">
                      <Button variant="soft" className="py-6 rounded-lg">
                        <Calendar />
                      </Button>
                      <Box>
                        <Heading size="3">
                          {(item as any).displayDate || date}
                        </Heading>
                        <Flex gap="4">
                          <Text
                            color="green"
                            className="flex items-center gap-1"
                          >
                            <ArrowUpRight size="14" />{" "}
                            {formatCurrency(item.totalIncome)}
                          </Text>
                          <Text color="red" className="flex items-center gap-1">
                            <ArrowDownRight size="14" />{" "}
                            {formatCurrency(item.totalExpense)}
                          </Text>
                        </Flex>
                      </Box>
                    </Flex>
                    <Heading
                      size="4"
                      color={
                        item.totalIncome - item.totalExpense > 0
                          ? "green"
                          : "red"
                      }
                    >
                      {formatCurrency(item.totalIncome - item.totalExpense)}
                    </Heading>
                  </Flex>
                  <Card
                    asChild
                    className="p-0 sticky top-0 z-0"
                    variant="classic"
                  >
                    <motion.div
                      layout
                      variants={staggerContainerVariants.variants}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ amount: 0.2, once: true }}
                    >
                      <AnimatePresence mode="popLayout">
                        {item.transactions.map((transaction, index) => (
                          <motion.div
                            key={transaction.id}
                            layout="position"
                            variants={leftToRightVariants.variants}
                            initial="hidden"
                            exit={{ opacity: 0, scale: 0.9 }}
                            whileInView="visible"
                            {...viewPortOnce}
                            className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors pl-6"
                          >
                            <Flex align="center" gap="4" className="relative">
                              <span
                                className={
                                  "absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-full rounded-full " +
                                  (transaction.type === TransactionType.INCOME
                                    ? "bg-primary"
                                    : "bg-red-400")
                                }
                              ></span>
                              <div
                                className={
                                  "p-2.5 rounded-lg " +
                                  (transaction.type === TransactionType.INCOME
                                    ? "bg-primary/20"
                                    : "bg-red-400/20")
                                }
                              >
                                {getIconForCategory(
                                  transaction.type,
                                  transaction.category?.icon,
                                ) || (
                                  <ArrowUpRight className="w-4 h-4 text-green-600" />
                                )}
                              </div>
                              <div>
                                <Text weight="medium" as="div">
                                  {transaction.notes || "No description"}
                                </Text>
                                <Flex align="center" gap="2">
                                  <Text size="1" color="gray">
                                    {transaction.category?.name}
                                  </Text>
                                  <Text size="1" color="gray">
                                    •
                                  </Text>
                                  <Text size="1" color="gray">
                                    {format(transaction.transactionDate, "p")}
                                  </Text>
                                </Flex>
                              </div>
                            </Flex>
                            <Text
                              weight="bold"
                              color={
                                transaction.type === TransactionType.INCOME
                                  ? "green"
                                  : "red"
                              }
                              as="div"
                            >
                              {transaction.type === TransactionType.INCOME
                                ? "+"
                                : "-"}
                              {formatCurrency(transaction.amount)}
                            </Text>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  </Card>
                </Flex>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
