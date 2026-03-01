"use client";

import api from "@/lib/api/axios";
import {
  Account,
  CreateLendDebtPaymentSchema,
  CreateLendDebtSchema,
  DeleteConfirmDialog,
  EmptyState,
  FloatingAddButton,
  LendDebt,
  LendDebtForm,
  LendDebtPaymentForm,
  LendDebtType,
  ListSkeleton,
  PageHeader,
  ResponsiveModal,
  StatsCard,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  useDeleteConfirm,
  useFormatter,
} from "@/shared";
import { Button, Card, Flex, Grid, Text } from "@radix-ui/themes";
import { ArrowDownLeft, ArrowUpRight, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

import { LendDebtItem } from "./components/lend-debt-item";
import { PaymentHistoryModal } from "./components/payment-history-modal";

const LendDebtPage = () => {
  const [lendDebts, setLendDebts] = useState<LendDebt[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("lent");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<LendDebt | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState<LendDebt | null>(null);
  const [historyTarget, setHistoryTarget] = useState<LendDebt | null>(null);

  const {
    deleteTarget,
    requestDelete,
    confirmDelete,
    cancelDelete,
    isDeleteOpen,
  } = useDeleteConfirm();
  const { formatCurrency } = useFormatter();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [lendDebtRes, accountsRes] = await Promise.all([
        api.get<LendDebt[]>("/lend-debt"),
        api.get<Account[]>("/accounts"),
      ]);
      setLendDebts(
        lendDebtRes.data.map((item) => ({
          ...item,
          amount: Number(item.amount),
          dueDate: item.dueDate ? new Date(item.dueDate) : undefined,
          outstanding: item.outstanding ?? Number(item.amount),
          payments: item.payments?.map((p) => ({
            ...p,
            amount: Number(p.amount),
            paymentDate: new Date(p.paymentDate),
          })),
        })),
      );
      setAccounts(accountsRes.data);
    } catch (err) {
      console.error("Error fetching lend/debt data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getAccountName = (accountId: string) =>
    accounts.find((a) => a.id === accountId)?.name || "Unknown";

  const handleCreate = async (data: CreateLendDebtSchema) => {
    try {
      setLoading(true);
      await api.post("/lend-debt", data, { showSuccessToast: true });
      setActiveTab(data.type === LendDebtType.LEND ? "lent" : "borrowed");
      setIsAddModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Error creating lend/debt:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (data: CreateLendDebtSchema) => {
    try {
      setLoading(true);
      await api.patch(`/lend-debt/${data.id}`, data, {
        showSuccessToast: true,
      });
      setIsEditModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Error updating lend/debt:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await api.delete(`/lend-debt/${id}`, { showSuccessToast: true });
      fetchData();
    } catch (err) {
      console.error("Error deleting lend/debt:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkSettled = async (id: string) => {
    try {
      setLoading(true);
      const item = lendDebts.find((ld) => ld.id === id);
      if (!item) return;
      await api.post(
        "/lend-debt/payments",
        {
          lendDebtId: id,
          accountId: item.accountId,
          amount: item.outstanding,
          paymentDate: new Date().toISOString(),
          notes: "Marked as settled",
        },
        { showSuccessToast: true },
      );
      fetchData();
    } catch (err) {
      console.error("Error marking as settled:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayment = async (data: CreateLendDebtPaymentSchema) => {
    try {
      setLoading(true);
      await api.post("/lend-debt/payments", data, { showSuccessToast: true });
      setIsPaymentModalOpen(false);
      setPaymentTarget(null);
      fetchData();
    } catch (err) {
      console.error("Error creating payment:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    try {
      setLoading(true);
      await api.delete(`/lend-debt/payments/${paymentId}`, {
        showSuccessToast: true,
      });
      fetchData();
    } catch (err) {
      console.error("Error deleting payment:", err);
    } finally {
      setLoading(false);
    }
  };

  const lentData = lendDebts.filter((i) => i.type === LendDebtType.LEND);
  const borrowedData = lendDebts.filter((i) => i.type === LendDebtType.DEBT);
  const totalLent = lentData.reduce((s, i) => s + (i.outstanding || 0), 0);
  const totalOwed = borrowedData.reduce((s, i) => s + (i.outstanding || 0), 0);

  return (
    <div className="flex flex-col">
      <DeleteConfirmDialog
        open={isDeleteOpen}
        onOpenChange={(open) => {
          if (!open) cancelDelete();
        }}
        onConfirm={confirmDelete}
        title="Delete Entry"
        description={
          deleteTarget
            ? `Delete entry for ${deleteTarget.label}? This will reverse all balance changes and remove all associated payments.`
            : ""
        }
      />

      <ResponsiveModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        title="Edit Entry"
        description="Edit the lend/debt entry details below."
      >
        <LendDebtForm
          onSubmit={handleUpdate}
          defaultValues={editData as never}
          accounts={accounts}
          isLoading={loading}
        />
      </ResponsiveModal>

      <ResponsiveModal
        open={isPaymentModalOpen}
        onOpenChange={(open) => {
          setIsPaymentModalOpen(open);
          if (!open) setPaymentTarget(null);
        }}
        title={
          paymentTarget?.type === LendDebtType.LEND
            ? "Record Received Payment"
            : "Record Payment Made"
        }
        description={
          paymentTarget
            ? `${paymentTarget.type === LendDebtType.LEND ? `Receiving from ${paymentTarget.personName}` : `Paying to ${paymentTarget.personName}`} -- Outstanding: ${formatCurrency(paymentTarget.outstanding || 0)}`
            : undefined
        }
      >
        {paymentTarget && (
          <LendDebtPaymentForm
            lendDebtId={paymentTarget.id}
            defaultAccountId={paymentTarget.accountId}
            outstanding={paymentTarget.outstanding || 0}
            accounts={accounts}
            onSubmit={handleCreatePayment}
            isLoading={loading}
          />
        )}
      </ResponsiveModal>

      <PaymentHistoryModal
        item={historyTarget}
        onClose={() => setHistoryTarget(null)}
        onDeletePayment={handleDeletePayment}
        onRecordNewPayment={(target) => {
          setHistoryTarget(null);
          setTimeout(() => {
            setPaymentTarget(target);
            setIsPaymentModalOpen(true);
          }, 150);
        }}
        getAccountName={getAccountName}
      />

      <ResponsiveModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        title="Create New Entry"
        description="Add a new lend or debt entry to track your finances."
      >
        <LendDebtForm
          onSubmit={handleCreate}
          accounts={accounts}
          isLoading={loading}
        />
      </ResponsiveModal>

      <PageHeader
        title="Lend & Debt"
        description="Track money you've lent or borrowed"
      />
      <FloatingAddButton onClick={() => setIsAddModalOpen(true)} />

      <Grid
        columns={{ initial: "1", md: "2" }}
        gap="4"
        mb="6"
        display={{ initial: "none", sm: "grid" }}
      >
        <StatsCard
          label="To Receive"
          value={formatCurrency(totalLent)}
          icon={<ArrowUpRight size={20} />}
          color="green"
          description={
            <Text size="1" color="gray">
              {lentData.filter((i) => i.status !== "SETTLED").length} open
              entries
            </Text>
          }
        />
        <StatsCard
          label="To Pay"
          value={formatCurrency(totalOwed)}
          icon={<ArrowDownLeft size={20} />}
          color="red"
          description={
            <Text size="1" color="gray">
              {borrowedData.filter((i) => i.status !== "SETTLED").length} open
              entries
            </Text>
          }
        />
      </Grid>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <Flex justify="between" align="center" mb="4">
          <Flex gap="4" align={{ sm: "center" }} className="w-full">
            <TabsList className="w-full sm:w-max">
              <TabsTrigger value="lent" className="bg-primary">
                <ArrowUpRight className="h-4 w-4" /> Money Lent
              </TabsTrigger>
              <TabsTrigger value="borrowed" className="bg-red-400">
                <ArrowDownLeft className="h-4 w-4" /> Money Borrowed
              </TabsTrigger>
            </TabsList>
          </Flex>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="hidden sm:flex"
            size="3"
          >
            <Plus size={18} /> Add Entry
          </Button>
        </Flex>

        {loading ? (
          <ListSkeleton count={3} />
        ) : lendDebts.length > 0 ? (
          <Card
            asChild
            className="divide-border divide-y overflow-hidden p-0"
            variant="classic"
          >
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "lent" ? (
                <TabsContent value="lent" forceMount>
                  {lentData.length > 0 ? (
                    lentData.map((item) => (
                      <LendDebtItem
                        key={item.id}
                        item={item}
                        color="green"
                        getAccountName={getAccountName}
                        onEdit={(i) => {
                          setEditData(i);
                          setIsEditModalOpen(true);
                        }}
                        onDelete={(id, label) =>
                          requestDelete(id, label, () => handleDelete(id))
                        }
                        onRecordPayment={(i) => {
                          setPaymentTarget(i);
                          setIsPaymentModalOpen(true);
                        }}
                        onMarkSettled={handleMarkSettled}
                        onViewHistory={setHistoryTarget}
                      />
                    ))
                  ) : (
                    <EmptyState
                      title="No money lent"
                      description="You haven't lent any money yet."
                    />
                  )}
                </TabsContent>
              ) : (
                <TabsContent value="borrowed" forceMount>
                  {borrowedData.length > 0 ? (
                    borrowedData.map((item) => (
                      <LendDebtItem
                        key={item.id}
                        item={item}
                        color="red"
                        getAccountName={getAccountName}
                        onEdit={(i) => {
                          setEditData(i);
                          setIsEditModalOpen(true);
                        }}
                        onDelete={(id, label) =>
                          requestDelete(id, label, () => handleDelete(id))
                        }
                        onRecordPayment={(i) => {
                          setPaymentTarget(i);
                          setIsPaymentModalOpen(true);
                        }}
                        onMarkSettled={handleMarkSettled}
                        onViewHistory={setHistoryTarget}
                      />
                    ))
                  ) : (
                    <EmptyState
                      title="No money borrowed"
                      description="You haven't borrowed any money yet."
                    />
                  )}
                </TabsContent>
              )}
            </motion.div>
          </Card>
        ) : (
          <EmptyState
            title="No entries found"
            description="You haven't added any lend or debt entries yet."
          />
        )}
      </Tabs>
    </div>
  );
};

export default LendDebtPage;
