"use client";

import api from "@/lib/api/axios";
import {
  Account,
  Category,
  DeleteConfirmDialog,
  EmptyState,
  FloatingAddButton,
  ListSkeleton,
  PageHeader,
  ResponsiveModal,
  staggerContainerVariants,
  StatsCard,
  Transaction,
  TransactionForm,
  TransactionFormOutput,
  TransactionType,
  useDeleteConfirm,
  useFormatter,
} from "@/shared";
import {
  Button,
  Card,
  Flex,
  Grid,
  Heading,
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
  ArrowLeftRight,
  ArrowUpRight,
  Calendar,
  LoaderCircleIcon,
  Plus,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { LedgerTransactionRow } from "./components/ledger-transaction-row";
import { MonthNavigator } from "./components/month-navigator";

interface LedgerGroup {
  totalIncome: number;
  totalExpense: number;
  totalTransfer: number;
  transactions: Transaction[];
  displayDate?: string;
}

export default function LedgerPage() {
  const { formatDate, formatCurrency } = useFormatter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const dateRange = useMemo(
    () => ({
      from: startOfMonth(currentMonth),
      to: endOfMonth(currentMonth),
    }),
    [currentMonth],
  );

  const [groupedTransactions, setGroupedTransactions] = useState<
    Record<string, LedgerGroup>
  >({});
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [aiCategorizationEnabled, setAiCategorizationEnabled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<Transaction | null>(null);

  const {
    deleteTarget,
    requestDelete,
    confirmDelete,
    cancelDelete,
    isDeleteOpen,
  } = useDeleteConfirm();

  const filteredTransactions = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const filtered: Record<string, LedgerGroup> = {};
    Object.entries(groupedTransactions).forEach(([date, item]) => {
      const matched = item.transactions.filter((t) =>
        t.notes?.toLowerCase().includes(query),
      );
      if (matched.length > 0)
        filtered[date] = { ...item, transactions: matched };
    });
    return filtered;
  }, [groupedTransactions, searchQuery]);

  const totalIncome = useMemo(
    () =>
      Object.values(groupedTransactions).reduce(
        (s, i) => s + (Number(i.totalIncome) || 0),
        0,
      ),
    [groupedTransactions],
  );

  const totalExpense = useMemo(
    () =>
      Object.values(groupedTransactions).reduce(
        (s, i) => s + (Number(i.totalExpense) || 0),
        0,
      ),
    [groupedTransactions],
  );

  useEffect(() => {
    const fetchReferenceData = async () => {
      const [accountsRes, categoriesRes, featuresRes] = await Promise.all([
        api.get<Account[]>("/accounts"),
        api.get<Category[]>("/categories"),
        api.get<{ aiCategorizationEnabled: boolean }>("/settings/features"),
      ]);
      setAiCategorizationEnabled(featuresRes.data.aiCategorizationEnabled);
      setAccounts(accountsRes.data);
      setCategories(categoriesRes.data);
    };
    fetchReferenceData();
  }, []);

  const [materializing, setMaterializing] = useState(false);

  const materializeRecurring = useCallback(async () => {
    try {
      setMaterializing(true);
      await api.post("/recurring-transactions/materialize", {
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString(),
      });
    } catch {
      // Materialization errors are non-blocking; transactions still load
    } finally {
      setMaterializing(false);
    }
  }, [dateRange]);

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await api.get<Transaction[]>("/transactions", {
        params: {
          from: dateRange.from.toISOString(),
          to: dateRange.to.toISOString(),
          withAdditional: true,
        },
      });
      const grouped = response.data.reduce(
        (acc, transaction) => {
          const date = format(transaction.transactionDate, "yyyy-MM-dd");
          if (!acc[date])
            acc[date] = {
              totalIncome: 0,
              totalExpense: 0,
              totalTransfer: 0,
              transactions: [],
              displayDate: "",
            };
          acc[date].displayDate = formatDate(transaction.transactionDate);
          transaction.transactionDate = new Date(transaction.transactionDate);
          acc[date].transactions.push(transaction);
          if (transaction.type === TransactionType.INCOME)
            acc[date].totalIncome += Number(transaction.amount);
          else if (transaction.type === TransactionType.TRANSFER)
            acc[date].totalTransfer += Number(transaction.amount);
          else acc[date].totalExpense += Number(transaction.amount);
          return acc;
        },
        {} as Record<string, LedgerGroup>,
      );
      setGroupedTransactions(grouped);
    } finally {
      setLoading(false);
    }
  }, [dateRange, formatDate]);

  useEffect(() => {
    const loadMonth = async () => {
      setLoading(true);
      await materializeRecurring();
      await fetchTransactions();
    };
    loadMonth();
  }, [fetchTransactions, materializeRecurring]);

  const createTransaction = async (data: TransactionFormOutput) => {
    try {
      setLoading(true);
      await api.post("/transactions", data, { showSuccessToast: true });
      setIsAddModalOpen(false);
      fetchTransactions();
    } catch (err) {
      console.error("Error creating transaction:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateTransaction = async (data: TransactionFormOutput) => {
    try {
      setLoading(true);
      await api.patch(`/transactions/${data.id}`, data, {
        showSuccessToast: true,
      });
      setIsEditModalOpen(false);
      fetchTransactions();
    } catch (err) {
      console.error("Error updating transaction:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      setLoading(true);
      await api.delete(`/transactions/${id}`, { showSuccessToast: true });
      fetchTransactions();
    } catch (err) {
      console.error("Error deleting transaction:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader title="Ledger" description="Your daily financial timeline" />

      <ResponsiveModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        title="Create New Transaction"
        description="Add a new transaction to manage your income and expenses."
      >
        <TransactionForm
          categories={categories}
          accounts={accounts}
          onSubmit={createTransaction}
          isLoading={loading}
          aiCategorizationEnabled={aiCategorizationEnabled}
        />
      </ResponsiveModal>

      <ResponsiveModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        title="Edit Transaction"
        description="Edit the transaction details below."
      >
        <TransactionForm
          categories={categories}
          accounts={accounts}
          onSubmit={updateTransaction}
          defaultValues={editData as never}
          isLoading={loading}
          isEditMode
          aiCategorizationEnabled={aiCategorizationEnabled}
        />
      </ResponsiveModal>

      <DeleteConfirmDialog
        open={isDeleteOpen}
        onOpenChange={(open) => {
          if (!open) cancelDelete();
        }}
        onConfirm={confirmDelete}
        title="Delete Entry"
        description={
          deleteTarget
            ? `Delete entry for ${deleteTarget.label}? This will reverse all balance changes.`
            : ""
        }
      />

      <Grid
        columns={{ initial: "1", md: "2" }}
        gap="4"
        mb="6"
        display={{ initial: "none", sm: "grid" }}
      >
        <StatsCard
          label="Total Income"
          value={formatCurrency(totalIncome)}
          icon={<TrendingUp size={20} />}
          color="green"
          description={
            <Text size="1" color="gray">
              This month
            </Text>
          }
        />
        <StatsCard
          label="Total Expenses"
          value={formatCurrency(totalExpense)}
          icon={<TrendingDown size={20} />}
          color="red"
          description={
            <Text size="1" color="gray">
              This month
            </Text>
          }
        />
      </Grid>

      <Flex
        justify="between"
        align={{ initial: "stretch", sm: "center" }}
        gap="4"
        mb="4"
        direction={{ initial: "column-reverse", sm: "row" }}
      >
        <TextField.Root
          size="3"
          placeholder="Search transactions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-80"
        >
          <TextField.Slot>
            <Search size={16} />
          </TextField.Slot>
        </TextField.Root>
        <Flex align="center" gap="4">
          <MonthNavigator
            currentMonth={currentMonth}
            onPrev={() => setCurrentMonth((p) => subMonths(p, 1))}
            onNext={() => setCurrentMonth((p) => addMonths(p, 1))}
          />
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="hidden sm:flex"
            size="3"
          >
            <Plus size={18} /> Add Transaction
          </Button>
        </Flex>
      </Flex>

      <FloatingAddButton onClick={() => setIsAddModalOpen(true)} />

      {materializing ? (
        <Flex direction="column" align="center" justify="center" gap="3" py="9">
          <LoaderCircleIcon size={28} className="animate-spin text-primary" />
          <Text size="3" weight="medium" color="gray">
            Creating recurring transactions, please wait...
          </Text>
        </Flex>
      ) : loading ? (
        <ListSkeleton count={3} height="h-12" />
      ) : Object.entries(filteredTransactions).length === 0 ? (
        <EmptyState
          title="No transactions found"
          description="Try adjusting your filters or search query."
        />
      ) : (
        <div className="flex-1 relative space-y-5 rounded-lg">
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
                    direction={{ initial: "column", sm: "row" }}
                    justify="between"
                    align="center"
                    className="sticky -top-6 z-10 backdrop-blur-lg"
                    mb="3"
                    wrap="wrap"
                    gap="2"
                    py={{ initial: "2", sm: "0" }}
                  >
                    <Flex gap="3">
                      <Button
                        variant="soft"
                        className="py-6 rounded-lg shrink-0 hidden sm:flex"
                      >
                        <Calendar />
                      </Button>
                      <Flex
                        direction={{ initial: "row", sm: "column" }}
                        justify={{ initial: "between", sm: "start" }}
                        className="grow justify-between"
                      >
                        <Heading size="3" truncate>
                          {item.displayDate || date}
                        </Heading>
                        <Flex gap="2" wrap="wrap">
                          <Text
                            color="green"
                            size="2"
                            className="flex items-center gap-1"
                          >
                            <ArrowUpRight size="12" />
                            {formatCurrency(item.totalIncome)}
                          </Text>
                          <Text
                            color="red"
                            size="2"
                            className="flex items-center gap-1"
                          >
                            <ArrowDownRight size="12" />
                            {formatCurrency(item.totalExpense)}
                          </Text>
                          <Text
                            color="blue"
                            size="2"
                            className="flex items-center gap-1"
                          >
                            <ArrowLeftRight size="12" />
                            {formatCurrency(item.totalTransfer)}
                          </Text>
                        </Flex>
                      </Flex>
                    </Flex>
                    <Heading
                      size={{ initial: "3", sm: "4" }}
                      color={
                        item.totalIncome - item.totalExpense > 0
                          ? "green"
                          : item.totalIncome - item.totalExpense < 0
                            ? "red"
                            : "gray"
                      }
                      className="shrink-0 hidden sm:block"
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
                        {item.transactions.map((transaction) => (
                          <LedgerTransactionRow
                            key={transaction.id}
                            transaction={transaction}
                            onEdit={(t) => {
                              setEditData(t);
                              setIsEditModalOpen(true);
                            }}
                            onDelete={(id, label) =>
                              requestDelete(id, label, () =>
                                deleteTransaction(id),
                              )
                            }
                          />
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
    </>
  );
}
