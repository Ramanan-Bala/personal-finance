"use client";

import {
  Account,
  Category,
  ICON_MAP,
  Transaction,
  TransactionType,
} from "@/lib";
import api from "@/lib/utils/axios";
import {
  DateRangePicker,
  PageHeader,
  StatsCard,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TransactionForm,
} from "@/shared";
import {
  Button,
  Card,
  Dialog,
  Flex,
  Grid,
  Skeleton,
  Text,
} from "@radix-ui/themes";
import { motion } from "motion/react";

import { endOfToday, startOfToday, subDays } from "date-fns";
import {
  ArrowDownRight,
  ArrowUpRight,
  Pencil,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
  X,
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
    from: subDays(startOfToday(), 10),
    to: endOfToday(),
  });

  useEffect(() => {
    fetchData();
  }, [dateRange]);

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
      }));

      setTransactions(updatedTransactions);
    } catch (err) {
      console.error("Error fetching transactions data:", err);
    } finally {
      setLoading(false);
    }
  };

  const transactionsArray = Array.isArray(transactions) ? transactions : [];

  const incomeData = transactionsArray.filter(
    (item) => item.type === TransactionType.INCOME,
  );
  const expenseData = transactionsArray.filter(
    (item) => item.type === TransactionType.EXPENSE,
  );

  const totalIncome = incomeData.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0,
  );
  const totalExpense = expenseData.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0,
  );

  const createTransaction = async (data: any) => {
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

  const updateTransaction = async (data: any) => {
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

  // if (loading && transactionsArray.length === 0) {
  //   return (
  //     <LayoutContainer>
  //       <Flex justify="between" align="center" mb="6">
  //         <Skeleton width="200px" height="40px" />
  //         <Skeleton width="120px" height="40px" />
  //       </Flex>
  //       <Flex direction="column" gap="4">
  //         {[1, 2, 3].map((i) => (
  //           <Skeleton key={i} height="100px" />
  //         ))}
  //       </Flex>
  //     </LayoutContainer>
  //   );
  // }

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

  return (
    <>
      <Dialog.Root open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <Dialog.Content maxWidth="450px">
          <Flex direction="column" justify="between" mb="4">
            <Flex justify="between">
              <Dialog.Title mb="0">Edit Transaction</Dialog.Title>
              <Dialog.Close>
                <Button variant="ghost" color="gray">
                  <X size={18} />
                </Button>
              </Dialog.Close>
            </Flex>
            <Dialog.Description>
              Edit the transaction details below.
            </Dialog.Description>
          </Flex>
          <TransactionForm
            categories={categories}
            accounts={accounts}
            onSubmit={updateTransaction}
            defaultValues={editData as any}
            isLoading={loading}
          />
        </Dialog.Content>
      </Dialog.Root>

      <PageHeader
        title="Transactions"
        description="Monitor your chronological income and expenses"
        actions={
          <Dialog.Root open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <Dialog.Trigger>
              <Button>
                <Plus size={18} />
                Add Transaction
              </Button>
            </Dialog.Trigger>
            <Dialog.Content maxWidth="450px">
              <Flex direction="column" justify="between" mb="4">
                <Flex justify="between">
                  <Dialog.Title mb="0">Create New Transaction</Dialog.Title>
                  <Dialog.Close>
                    <Button variant="ghost" color="gray">
                      <X size={18} />
                    </Button>
                  </Dialog.Close>
                </Flex>
                <Dialog.Description size="2">
                  Add a new transaction to manage your income and expenses.
                </Dialog.Description>
              </Flex>
              <TransactionForm
                categories={categories}
                accounts={accounts}
                onSubmit={createTransaction}
                isLoading={loading}
              />
            </Dialog.Content>
          </Dialog.Root>
        }
      />

      {/* Summary Cards */}
      <Grid columns={{ initial: "1", md: "2" }} gap="4" mb="6">
        <StatsCard
          label="Total Income"
          value={`₹${totalIncome.toLocaleString()}`}
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
          value={`₹${totalExpense.toLocaleString()}`}
          icon={<TrendingDown size={20} />}
          color="red"
          description={
            <Text size="1" color="gray">
              This month
            </Text>
          }
        />
      </Grid>

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
          </TabsList>
          <DateRangePicker
            value={dateRange}
            onChange={(range: { from: Date; to: Date }) => setDateRange(range)}
          />
        </Flex>

        {loading ? (
          <Flex direction="column" gap="4">
            <Skeleton className="w-full h-18" />
            <Skeleton className="w-full h-18" />
            <Skeleton className="w-full h-18" />
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
                            +₹{(Number(item.amount) || 0).toLocaleString()}
                          </Text>
                          <Text size="1" color="gray">
                            {item.transactionDate?.toLocaleDateString() ||
                              "No date"}
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
                        <Button
                          variant="soft"
                          color="red"
                          // onClick={() => deleteTransaction(item.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </Flex>
                    </motion.div>
                  ))}

                  {incomeData.length === 0 && (
                    <Flex justify="center" align="center" p="4">
                      <Text size="4" color="gray">
                        No income transactions found
                      </Text>
                    </Flex>
                  )}
                </TabsContent>
              ) : (
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
                        <div className="text-right">
                          <Text weight="bold" color="red" as="div">
                            -₹{(Number(item.amount) || 0).toLocaleString()}
                          </Text>
                          <Text size="1" color="gray">
                            {item.transactionDate?.toLocaleDateString() ||
                              "No date"}
                          </Text>
                        </div>
                      </motion.div>
                    ))}

                    {expenseData.length === 0 && (
                      <Flex justify="center" align="center" p="4">
                        <Text size="4" color="gray">
                          No expense transactions found
                        </Text>
                      </Flex>
                    )}
                  </div>
                </TabsContent>
              )}
            </motion.div>
          </Card>
        ) : (
          <Flex align="center" justify="center" p="8">
            <Text color="gray">No transactions found</Text>
          </Flex>
        )}
      </Tabs>
    </>
  );
};
export default Transactions;
