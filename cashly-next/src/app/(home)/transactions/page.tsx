"use client";

import api from "@/lib/api/axios";
import {
  Account,
  Category,
  DateRangePicker,
  DeleteConfirmDialog,
  EmptyState,
  ICON_MAP,
  PageHeader,
  ResponsiveModal,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Transaction,
  TransactionForm,
  TransactionFormOutput,
  TransactionType,
  useFormatter,
} from "@/shared";
import { Button, Card, Flex, Skeleton, Text } from "@radix-ui/themes";
import { motion } from "motion/react";

import { endOfToday, startOfToday } from "date-fns";
import {
  ArrowDownRight,
  ArrowLeftRight,
  ArrowRightFromLineIcon,
  ArrowUpRight,
  Pencil,
  Plus,
} from "lucide-react";
import { useEffect, useState } from "react";

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("income");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<Transaction | null>(null);

  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfToday(),
    to: endOfToday(),
  });

  const { formatCurrency, formatDate } = useFormatter();

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch all data in parallel
      const [transactionsRes, accountsRes, categoriesRes] = await Promise.all([
        api.get<Transaction[]>("/transactions", {
          params: {
            from: dateRange.from.toISOString(),
            to: dateRange.to.toISOString(),
          },
        }),
        api.get<Account[]>("/accounts"),
        api.get<Category[]>("/categories"),
      ]);

      setAccounts(accountsRes.data);
      setCategories(categoriesRes.data);

      const updatedTransactions = transactionsRes.data.map((item) => ({
        ...item,
        amount: Number(item.amount),
        transactionDate: new Date(item.transactionDate),
        account: accountsRes.data.find(
          (account) => account.id === item.accountId,
        )!,
        category: categoriesRes.data.find(
          (category) => category.id === item.categoryId,
        )!,
        transferAccount:
          item.transferToAccountId != null
            ? accountsRes.data.find(
                (account) => account.id === item.transferToAccountId,
              )
            : undefined,
      }));

      console.log(transactionsRes);
      console.log(updatedTransactions);
      setTransactions(updatedTransactions);
    } catch (err) {
      console.error("Error fetching transactions data:", err);
    } finally {
      setLoading(false);
    }
  };

  const createTransaction = async (data: TransactionFormOutput) => {
    try {
      setLoading(true);
      const response = await api.post<Transaction>("/transactions", data, {
        showSuccessToast: true,
      });
      response.data.amount = Number(response.data.amount);
      response.data.transactionDate = new Date(response.data.transactionDate);
      if (response.data.type === TransactionType.INCOME) setActiveTab("income");
      else setActiveTab("expense");
      setTransactions((prev) => [...prev, response.data]);
      setIsAddModalOpen(false);
      // Re-fetch transactions to get updated and sorted list
      fetchData();
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
      setTransactions((prev) =>
        prev.map((item) => (item.id === id ? response.data : item)),
      );
      setIsEditModalOpen(false);
      // Re-fetch transactions to get updated and sorted list
      fetchData();
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
      setTransactions((prev) => prev.filter((item) => item.id !== id));
      // Re-fetch transactions to get updated and sorted list
      fetchData();
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
        className={`w-4 h-4 ${transactionType === TransactionType.INCOME ? "text-green-600" : "text-red-600"}`}
      />
    ) : null;
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const transactionsArray = Array.isArray(transactions) ? transactions : [];

  const incomeData = transactionsArray.filter(
    (item) => item.type === TransactionType.INCOME,
  );
  const expenseData = transactionsArray.filter(
    (item) => item.type === TransactionType.EXPENSE,
  );

  const transferData = transactionsArray.filter(
    (item) => item.type === TransactionType.TRANSFER,
  );

  return (
    <>
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
        />
      </ResponsiveModal>

      <PageHeader
        title="Transactions"
        description="Monitor your chronological income and expenses"
        actions={
          <>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus size={18} />
              Add Transaction
            </Button>
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
              />
            </ResponsiveModal>
          </>
        }
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <Flex
          direction={{ initial: "column-reverse", sm: "row" }}
          gap="4"
          align={{ sm: "center" }}
          mb="4"
        >
          <TabsList>
            <TabsTrigger value="income" className="bg-primary">
              <ArrowUpRight className="w-4 h-4" />
              Income
            </TabsTrigger>
            <TabsTrigger value="expense" className="bg-red-400">
              <ArrowDownRight className="w-4 h-4" />
              Expenses
            </TabsTrigger>
            <TabsTrigger value="transfer" className="bg-blue-400">
              <ArrowLeftRight className="w-4 h-4" />
              Transfer
            </TabsTrigger>
          </TabsList>
          <DateRangePicker
            value={dateRange}
            onChange={(range: { from: Date; to: Date }) => setDateRange(range)}
          />
        </Flex>

        {loading ? (
          <Flex direction="column" gap="4">
            <Skeleton className="w-full h-16" />
            <Skeleton className="w-full h-16" />
            <Skeleton className="w-full h-16" />
          </Flex>
        ) : transactionsArray.length > 0 ? (
          <Card
            asChild
            className="divide-y divide-border p-0"
            variant="classic"
          >
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "income" ? (
                <TabsContent value="income" forceMount>
                  {incomeData.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <Flex align="center" gap="4">
                        <div className="p-2.5 rounded-lg bg-green-100 dark:bg-green-900/30">
                          {getIconForCategory(
                            item.type,
                            item.category?.icon,
                          ) || (
                            <ArrowUpRight className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                        <div>
                          <Text weight="medium" as="div">
                            {item.notes || "No description"}
                          </Text>
                          <Flex align="center" gap="2">
                            <Text size="1" color="gray">
                              {item.category?.name}
                            </Text>
                            <Text size="1" color="gray">
                              •
                            </Text>
                            <Text size="1" color="gray">
                              {item.account?.name}
                            </Text>
                          </Flex>
                        </div>
                      </Flex>
                      <Flex align="center" gap="2">
                        <div className="text-right">
                          <Text weight="bold" color="green" as="div">
                            +{formatCurrency(item.amount)}
                          </Text>
                          <Text size="1" color="gray">
                            {item.transactionDate
                              ? formatDate(item.transactionDate)
                              : "No date"}
                          </Text>
                        </div>
                        <Button
                          variant="soft"
                          color="gray"
                          onClick={() => {
                            setIsEditModalOpen(true);
                            setEditData(item);
                          }}
                        >
                          <Pencil size={16} />
                        </Button>
                        {/* <Button
                          variant="soft"
                          color="red"
                          onClick={() => deleteTransaction(item.id)}
                        >
                          <Trash2 size={16} />
                        </Button> */}
                        <DeleteConfirmDialog
                          onConfirm={() => deleteTransaction(item.id)}
                          title="Delete Transaction"
                          description={`Delete ${item.type} of ${item.amount}? This will update your account balance.`}
                        />
                      </Flex>
                    </motion.div>
                  ))}

                  {incomeData.length === 0 && (
                    <EmptyState
                      title="No income recorded"
                      description="You haven't added any income transactions for this period."
                    />
                  )}
                </TabsContent>
              ) : activeTab === "expense" ? (
                <TabsContent value="expense" forceMount>
                  <div className="divide-y divide-border">
                    {expenseData.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors cursor-pointer"
                      >
                        <Flex align="center" gap="4">
                          <div className="p-2.5 rounded-lg bg-red-100 dark:bg-red-900/30">
                            {getIconForCategory(
                              item.type,
                              item.category?.icon,
                            ) || (
                              <ArrowDownRight className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                          <div>
                            <Text weight="medium" as="div">
                              {item.notes}
                            </Text>
                            <Flex align="center" gap="2">
                              <Text size="1" color="gray">
                                {item.category?.name}
                              </Text>
                              <Text size="1" color="gray">
                                •
                              </Text>
                              <Text size="1" color="gray">
                                {item.account?.name}
                              </Text>
                            </Flex>
                          </div>
                        </Flex>
                        <Flex align="center" gap="2">
                          <div className="text-right">
                            <Text weight="bold" color="red" as="div">
                              -{formatCurrency(item.amount)}
                            </Text>
                            <Text size="1" color="gray">
                              {item.transactionDate
                                ? formatDate(item.transactionDate)
                                : "No date"}
                            </Text>
                          </div>
                          <Button
                            variant="soft"
                            color="gray"
                            onClick={() => {
                              setIsEditModalOpen(true);
                              setEditData(item);
                            }}
                          >
                            <Pencil size={16} />
                          </Button>
                          {/* <Button
                            variant="soft"
                            color="red"
                            onClick={() => deleteTransaction(item.id)}
                          >
                            <Trash2 size={16} />
                          </Button> */}
                          <DeleteConfirmDialog
                            onConfirm={() => deleteTransaction(item.id)}
                            title="Delete Transaction"
                            description={`Delete ${item.type} of ${item.amount}? This will update your account balance.`}
                          />
                        </Flex>
                      </motion.div>
                    ))}

                    {expenseData.length === 0 && (
                      <EmptyState
                        title="No expenses recorded"
                        description="You haven't added any expense transactions for this period."
                      />
                    )}
                  </div>
                </TabsContent>
              ) : (
                <TabsContent value="transfer" forceMount>
                  <div className="divide-y divide-border">
                    {transferData.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors cursor-pointer"
                      >
                        <Flex align="center" gap="4">
                          <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <ArrowLeftRight className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <Text weight="medium" as="div">
                              {item.notes}
                            </Text>
                            <Flex align="center" gap="2">
                              <Text size="1" color="gray">
                                {item.transferAccount?.name}
                              </Text>
                              <ArrowRightFromLineIcon color="gray" size="14" />
                              <Text size="1" color="gray">
                                {item.account?.name}
                              </Text>
                            </Flex>
                          </div>
                        </Flex>
                        <div className="text-right">
                          <Text weight="bold" color="blue" as="div">
                            {formatCurrency(item.amount)}
                          </Text>
                          <Text size="1" color="gray">
                            {item.transactionDate
                              ? formatDate(item.transactionDate)
                              : "No date"}
                          </Text>
                        </div>
                      </motion.div>
                    ))}

                    {transferData.length === 0 && (
                      <EmptyState
                        title="No transfers recorded"
                        description="You haven't added any transfer transactions for this period."
                      />
                    )}
                  </div>
                </TabsContent>
              )}
            </motion.div>
          </Card>
        ) : (
          <EmptyState
            title="No transactions found"
            description="You haven't recorded any transactions for this period."
          />
        )}
      </Tabs>
    </>
  );
};
export default Transactions;
