"use client";

import api from "@/lib/api/axios";
import {
  Account,
  Category,
  DeleteConfirmDialog,
  EmptyState,
  ICON_MAP,
  leftToRightVariants,
  PageHeader,
  ResponsiveModal,
  staggerContainerVariants,
  StatsCard,
  Transaction,
  TransactionForm,
  TransactionFormOutput,
  TransactionType,
  useFormatter,
  viewPortComplete,
} from "@/shared";
import {
  Button,
  Card,
  DropdownMenu,
  Flex,
  Grid,
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
  ArrowLeftRight,
  ArrowRightFromLineIcon,
  ArrowUpRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";

interface LedgerTransaction {
  totalIncome: number;
  totalExpense: number;
  totalTransfer: number;
  transactions: Transaction[];
  displayDate?: string; // Added to store the formatted date for display
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

  const [groupedTransactions, setGroupedTransactions] = useState<{
    [key: string]: LedgerTransaction;
  }>({});
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [searchQuery, setSearchQuery] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<Transaction | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    label: string;
    onConfirm: () => void;
  } | null>(null);

  const filteredTransactions = useMemo(() => {
    const query = searchQuery.toLowerCase();

    const filtered: { [key: string]: LedgerTransaction } = {};

    Object.entries({ ...groupedTransactions }).map(([date, item]) => {
      const filteredTransactions = item.transactions.filter((transaction) =>
        transaction.notes?.toLowerCase().includes(query),
      );

      if (filteredTransactions.length > 0)
        filtered[date] = { ...item, transactions: filteredTransactions };
    });

    return filtered ?? {};
  }, [groupedTransactions, searchQuery]);

  const totalIncome = useMemo(
    () =>
      Object.values(groupedTransactions).reduce(
        (sum, item) => sum + (Number(item.totalIncome) || 0),
        0,
      ),
    [groupedTransactions],
  );
  const totalExpense = useMemo(
    () =>
      Object.values(groupedTransactions).reduce(
        (sum, item) => sum + (Number(item.totalExpense) || 0),
        0,
      ),
    [groupedTransactions],
  );

  useEffect(() => {
    const fetchData = async () => {
      const [accountsRes, categoriesRes] = await Promise.all([
        api.get<Account[]>("/accounts"),
        api.get<Category[]>("/categories"),
      ]);

      setAccounts(accountsRes.data);
      setCategories(categoriesRes.data);
    };

    fetchData();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await api.get<Transaction[]>("/transactions", {
        params: {
          from: dateRange.from.toISOString(),
          to: dateRange.to.toISOString(),
          withAdditional: true,
        },
      });

      const groupedTransactions = response.data.reduce(
        (acc, transaction) => {
          const date = format(transaction.transactionDate, "yyyy-MM-dd"); // Stable grouping key
          const displayDate = formatDate(transaction.transactionDate);
          if (!acc[date]) {
            acc[date] = {
              totalIncome: 0,
              totalExpense: 0,
              totalTransfer: 0,
              transactions: [],
              displayDate: "",
            };
          }
          // Store the display date so we use it in the UI
          acc[date].displayDate = displayDate;
          transaction.transactionDate = new Date(transaction.transactionDate);
          acc[date].transactions.push(transaction);
          if (transaction.type === TransactionType.INCOME) {
            acc[date].totalIncome += Number(transaction.amount);
          } else if (transaction.type === TransactionType.TRANSFER) {
            acc[date].totalTransfer += Number(transaction.amount);
          } else {
            acc[date].totalExpense += Number(transaction.amount);
          }
          return acc;
        },
        {} as { [key: string]: LedgerTransaction },
      );

      setGroupedTransactions(groupedTransactions);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchTransactions();
  }, [dateRange]);

  const createTransaction = async (data: TransactionFormOutput) => {
    try {
      setLoading(true);
      const response = await api.post<Transaction>("/transactions", data, {
        showSuccessToast: true,
      });
      response.data.amount = Number(response.data.amount);
      response.data.transactionDate = new Date(response.data.transactionDate);
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
      const id = data.id;
      setLoading(true);
      const response = await api.patch<Transaction>(
        `/transactions/${id}`,
        data,
        { showSuccessToast: true },
      );
      response.data.amount = Number(response.data.amount);
      response.data.transactionDate = new Date(response.data.transactionDate);
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
    <>
      <PageHeader title="Ledger" description="Your daily financial timeline" />

      {/* Create New Transaction */}
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
          aiCategorizationEnabled={false}
        />
      </ResponsiveModal>

      {/* Edit Transaction */}
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
          aiCategorizationEnabled={false}
        />
      </ResponsiveModal>

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={() => {
          deleteTarget?.onConfirm();
          setDeleteTarget(null);
        }}
        title="Delete Entry"
        description={
          deleteTarget
            ? `Delete entry for ${deleteTarget.label}? This will reverse all balance changes and remove all associated payments.`
            : ""
        }
      />

      {/* Summary Cards */}
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

      {/* Search and Filter */}
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
          <div className="flex items-center gap-1 justify-between bg-card border border-border rounded-lg px-3 py-2 w-full">
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
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="hidden sm:flex"
            size="3"
          >
            <Plus size={18} />
            Add Transaction
          </Button>
        </Flex>
      </Flex>

      <Button
        onClick={() => setIsAddModalOpen(true)}
        className="sm:hidden w-10 h-10 rounded-full fixed z-50 right-[max(env(safe-area-inset-right),2rem)]"
        style={{
          bottom: "max(calc(env(safe-area-inset-bottom) + 3rem), 5rem)",
        }}
      >
        <Plus size={18} />
      </Button>

      {loading ? (
        <Flex direction="column" gap="4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </Flex>
      ) : Object.entries(filteredTransactions).length === 0 ? (
        <EmptyState
          title="No transactions found"
          description="Try adjusting your filters or search query to find what you're looking for."
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
                    className="sticky top-0 z-10 backdrop-blur-lg"
                    my="3"
                    wrap="wrap"
                    gap="2"
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
                          <motion.div
                            key={transaction.id}
                            layout="position"
                            variants={leftToRightVariants.variants}
                            initial="hidden"
                            exit={{ opacity: 0, scale: 0.9 }}
                            whileInView="visible"
                            {...viewPortComplete}
                            className="flex items-center justify-between p-3 sm:p-4 hover:bg-muted/90 transition-colors sm:pl-6 cursor-pointer"
                          >
                            <Flex align="center" gap="4" className="relative">
                              <span
                                className={
                                  "hidden sm:block absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-full rounded-full " +
                                  (transaction.type === TransactionType.INCOME
                                    ? "bg-primary"
                                    : transaction.type ===
                                        TransactionType.TRANSFER
                                      ? "bg-blue-400"
                                      : "bg-red-400")
                                }
                              ></span>
                              <div
                                className={
                                  "p-2.5 rounded-lg hidden sm:block " +
                                  (transaction.type === TransactionType.INCOME
                                    ? "bg-primary/20"
                                    : transaction.type ===
                                        TransactionType.TRANSFER
                                      ? "bg-blue-400/20"
                                      : "bg-red-400/20")
                                }
                              >
                                {transaction.type !=
                                TransactionType.TRANSFER ? (
                                  getIconForCategory(
                                    transaction.type,
                                    transaction.category?.icon,
                                  ) || (
                                    <ArrowUpRight className="w-4 h-4 text-primary" />
                                  )
                                ) : (
                                  <ArrowLeftRight className="w-4 h-4 text-blue-400" />
                                )}
                              </div>
                              <div>
                                <Text weight="medium" as="div">
                                  {transaction.notes || "No description"}
                                </Text>
                                {transaction.type !=
                                TransactionType.TRANSFER ? (
                                  <Flex align="center" gap="2">
                                    <Text size="1" color="gray">
                                      {transaction.category?.name}
                                    </Text>
                                    <Text size="1" color="gray">
                                      •
                                    </Text>
                                    <Text size="1" color="gray">
                                      {transaction.account?.name}
                                    </Text>
                                    <Text size="1" color="gray">
                                      {format(transaction.transactionDate, "p")}
                                    </Text>
                                  </Flex>
                                ) : (
                                  <Flex align="center" gap="2">
                                    <Text size="1" color="gray">
                                      {transaction.transferAccount?.name}
                                    </Text>
                                    <ArrowRightFromLineIcon
                                      color="gray"
                                      size="14"
                                    />
                                    <Text size="1" color="gray">
                                      {transaction.account?.name}
                                    </Text>
                                    <Text size="1" color="gray">
                                      {format(transaction.transactionDate, "p")}
                                    </Text>
                                  </Flex>
                                )}
                              </div>
                            </Flex>

                            <Flex align="center" gap="2">
                              <Text
                                weight="bold"
                                color={
                                  transaction.type === TransactionType.INCOME
                                    ? "green"
                                    : transaction.type ===
                                        TransactionType.TRANSFER
                                      ? "blue"
                                      : "red"
                                }
                                as="div"
                              >
                                {transaction.type === TransactionType.INCOME
                                  ? "+"
                                  : transaction.type ===
                                      TransactionType.TRANSFER
                                    ? ""
                                    : "-"}
                                {formatCurrency(transaction.amount)}
                              </Text>

                              <DropdownMenu.Root>
                                <DropdownMenu.Trigger>
                                  <Button variant="ghost" color="gray">
                                    <MoreVertical size={16} />
                                  </Button>
                                </DropdownMenu.Trigger>
                                <DropdownMenu.Content align="end">
                                  <DropdownMenu.Item
                                    onClick={() => {
                                      setEditData(transaction);
                                      setIsEditModalOpen(true);
                                    }}
                                  >
                                    <Pencil size={14} />
                                    Edit
                                  </DropdownMenu.Item>
                                  <DropdownMenu.Separator />
                                  <DropdownMenu.Item
                                    color="red"
                                    onClick={() =>
                                      setDeleteTarget({
                                        id: transaction.id,
                                        label:
                                          transaction.notes ||
                                          formatCurrency(transaction.amount),
                                        onConfirm: () =>
                                          deleteTransaction(transaction.id),
                                      })
                                    }
                                  >
                                    <Trash2 size={14} />
                                    Delete
                                  </DropdownMenu.Item>
                                </DropdownMenu.Content>
                              </DropdownMenu.Root>
                            </Flex>
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
    </>
  );
}
