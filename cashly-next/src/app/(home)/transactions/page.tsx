"use client";

import api from "@/lib/api/axios";
import {
  Account,
  Category,
  DateRangePicker,
  DeleteConfirmDialog,
  EmptyState,
  ListSkeleton,
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
  useDeleteConfirm,
} from "@/shared";
import { Button, Card, Flex } from "@radix-ui/themes";
import { motion } from "motion/react";
import { endOfToday, startOfToday } from "date-fns";
import {
  ArrowDownRight,
  ArrowLeftRight,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import { useEffect, useState } from "react";

import { TransactionListItem } from "./components/transaction-list-item";

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("income");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<Transaction | null>(null);
  const [aiCategorizationEnabled, setAiCategorizationEnabled] = useState(true);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfToday(),
    to: endOfToday(),
  });

  const { deleteTarget, requestDelete, confirmDelete, cancelDelete, isDeleteOpen } = useDeleteConfirm();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transactionsRes, accountsRes, categoriesRes, featuresRes] =
        await Promise.all([
          api.get<Transaction[]>("/transactions", {
            params: { from: dateRange.from.toISOString(), to: dateRange.to.toISOString() },
          }),
          api.get<Account[]>("/accounts"),
          api.get<Category[]>("/categories"),
          api.get<{ aiCategorizationEnabled: boolean }>("/settings/features"),
        ]);

      setAiCategorizationEnabled(featuresRes.data.aiCategorizationEnabled);
      setAccounts(accountsRes.data);
      setCategories(categoriesRes.data);

      setTransactions(
        transactionsRes.data.map((item) => ({
          ...item,
          amount: Number(item.amount),
          transactionDate: new Date(item.transactionDate),
          account: accountsRes.data.find((a) => a.id === item.accountId)!,
          category: categoriesRes.data.find((c) => c.id === item.categoryId)!,
          transferAccount: item.transferToAccountId
            ? accountsRes.data.find((a) => a.id === item.transferToAccountId)
            : undefined,
        })),
      );
    } catch (err) {
      console.error("Error fetching transactions data:", err);
    } finally {
      setLoading(false);
    }
  };

  const createTransaction = async (data: TransactionFormOutput) => {
    try {
      setLoading(true);
      await api.post("/transactions", data, { showSuccessToast: true });
      if (data.type === TransactionType.INCOME) setActiveTab("income");
      else setActiveTab("expense");
      setIsAddModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Error creating transaction:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateTransaction = async (data: TransactionFormOutput) => {
    try {
      setLoading(true);
      await api.patch(`/transactions/${data.id}`, data, { showSuccessToast: true });
      setIsEditModalOpen(false);
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
      fetchData();
    } catch (err) {
      console.error("Error deleting transaction:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [dateRange]);

  const incomeData = transactions.filter((i) => i.type === TransactionType.INCOME);
  const expenseData = transactions.filter((i) => i.type === TransactionType.EXPENSE);
  const transferData = transactions.filter((i) => i.type === TransactionType.TRANSFER);

  const renderTabContent = (data: Transaction[], emptyTitle: string, emptyDesc: string) => (
    data.length > 0 ? (
      data.map((item, index) => (
        <TransactionListItem
          key={item.id}
          item={item}
          index={index}
          onEdit={(i) => { setEditData(i); setIsEditModalOpen(true); }}
          onDelete={(id, label) => requestDelete(id, label, () => deleteTransaction(id))}
        />
      ))
    ) : (
      <EmptyState title={emptyTitle} description={emptyDesc} />
    )
  );

  return (
    <>
      <ResponsiveModal open={isEditModalOpen} onOpenChange={setIsEditModalOpen} title="Edit Transaction" description="Edit the transaction details below.">
        <TransactionForm categories={categories} accounts={accounts} onSubmit={updateTransaction} defaultValues={editData as never} isLoading={loading} isEditMode aiCategorizationEnabled={aiCategorizationEnabled} />
      </ResponsiveModal>

      <DeleteConfirmDialog
        open={isDeleteOpen}
        onOpenChange={(open) => { if (!open) cancelDelete(); }}
        onConfirm={confirmDelete}
        title="Delete Entry"
        description={deleteTarget ? `Delete entry for ${deleteTarget.label}? This will reverse all balance changes.` : ""}
      />

      <PageHeader
        title="Transactions"
        description="Monitor your chronological income and expenses"
        actions={
          <>
            <Button onClick={() => setIsAddModalOpen(true)}><Plus size={18} /> Add Transaction</Button>
            <ResponsiveModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} title="Create New Transaction" description="Add a new transaction to manage your income and expenses.">
              <TransactionForm categories={categories} accounts={accounts} onSubmit={createTransaction} isLoading={loading} aiCategorizationEnabled={aiCategorizationEnabled} />
            </ResponsiveModal>
          </>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <Flex direction={{ initial: "column-reverse", sm: "row" }} gap="4" align={{ sm: "center" }} mb="4">
          <TabsList>
            <TabsTrigger value="income" className="bg-primary"><ArrowUpRight className="w-4 h-4" /> Income</TabsTrigger>
            <TabsTrigger value="expense" className="bg-red-400"><ArrowDownRight className="w-4 h-4" /> Expenses</TabsTrigger>
            <TabsTrigger value="transfer" className="bg-blue-400"><ArrowLeftRight className="w-4 h-4" /> Transfer</TabsTrigger>
          </TabsList>
          <DateRangePicker value={dateRange} onChange={(range: { from: Date; to: Date }) => setDateRange(range)} />
        </Flex>

        {loading ? (
          <ListSkeleton count={3} />
        ) : transactions.length > 0 ? (
          <Card asChild className="divide-y divide-border p-0" variant="classic">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              {activeTab === "income" ? (
                <TabsContent value="income" forceMount>
                  {renderTabContent(incomeData, "No income recorded", "You haven't added any income transactions for this period.")}
                </TabsContent>
              ) : activeTab === "expense" ? (
                <TabsContent value="expense" forceMount>
                  <div className="divide-y divide-border">
                    {renderTabContent(expenseData, "No expenses recorded", "You haven't added any expense transactions for this period.")}
                  </div>
                </TabsContent>
              ) : (
                <TabsContent value="transfer" forceMount>
                  <div className="divide-y divide-border">
                    {renderTabContent(transferData, "No transfers recorded", "You haven't added any transfer transactions for this period.")}
                  </div>
                </TabsContent>
              )}
            </motion.div>
          </Card>
        ) : (
          <EmptyState title="No transactions found" description="You haven't recorded any transactions for this period." />
        )}
      </Tabs>
    </>
  );
};

export default Transactions;
