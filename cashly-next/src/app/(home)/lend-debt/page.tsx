"use client";

import api from "@/lib/api/axios";
import {
  Account,
  CreateLendDebtPaymentSchema,
  CreateLendDebtSchema,
  DeleteConfirmDialog,
  EmptyState,
  LendDebt,
  LendDebtForm,
  LendDebtPaymentForm,
  LendDebtStatus,
  LendDebtType,
  PageHeader,
  ResponsiveModal,
  StatsCard,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  useFormatter,
} from "@/shared";
import {
  Badge,
  Button,
  Card,
  DropdownMenu,
  Flex,
  Grid,
  Progress,
  Skeleton,
  Text,
  Tooltip,
} from "@radix-ui/themes";
import { motion } from "motion/react";

import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  CreditCard,
  History,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
  User,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";

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

  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    label: string;
    onConfirm: () => void;
  } | null>(null);

  const { formatCurrency, formatDate } = useFormatter();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [lendDebtResponse, accountsResponse] = await Promise.all([
        api.get<LendDebt[]>("/lend-debt"),
        api.get<Account[]>("/accounts"),
      ]);

      const updatedLendDebts = lendDebtResponse.data.map((item) => ({
        ...item,
        amount: Number(item.amount),
        dueDate: item.dueDate ? new Date(item.dueDate) : undefined,
        outstanding: item.outstanding ?? Number(item.amount),
        payments: item.payments?.map((p) => ({
          ...p,
          amount: Number(p.amount),
          paymentDate: new Date(p.paymentDate),
        })),
      }));

      setLendDebts(updatedLendDebts);
      setAccounts(accountsResponse.data);
    } catch (err) {
      console.error("Error fetching lend/debt data:", err);
    } finally {
      setLoading(false);
    }
  };

  const createLendDebt = async (data: CreateLendDebtSchema) => {
    try {
      setLoading(true);
      await api.post<LendDebt>("/lend-debt", data, {
        showSuccessToast: true,
      });
      if (data.type === LendDebtType.LEND) setActiveTab("lent");
      else setActiveTab("borrowed");
      setIsAddModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Error creating lend/debt:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateLendDebt = async (data: CreateLendDebtSchema) => {
    try {
      const id = data.id;
      setLoading(true);
      await api.patch<LendDebt>(`/lend-debt/${id}`, data, {
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

  const deleteLendDebt = async (id: string) => {
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

  const markAsSettled = async (id: string) => {
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

  const createPayment = async (data: CreateLendDebtPaymentSchema) => {
    try {
      setLoading(true);
      await api.post("/lend-debt/payments", data, {
        showSuccessToast: true,
      });
      setIsPaymentModalOpen(false);
      setPaymentTarget(null);
      fetchData();
    } catch (err) {
      console.error("Error creating payment:", err);
    } finally {
      setLoading(false);
    }
  };

  const deletePayment = async (paymentId: string) => {
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

  useEffect(() => {
    fetchData();
  }, []);

  const lentData = lendDebts.filter((item) => item.type === LendDebtType.LEND);
  const borrowedData = lendDebts.filter(
    (item) => item.type === LendDebtType.DEBT,
  );

  const totalLent = lentData.reduce(
    (sum, item) => sum + (item.outstanding || 0),
    0,
  );
  const totalOwed = borrowedData.reduce(
    (sum, item) => sum + (item.outstanding || 0),
    0,
  );

  const getAccountName = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId);
    return account?.name || "Unknown";
  };

  const getStatusBadge = (item: LendDebt) => {
    if (item.status === LendDebtStatus.SETTLED) {
      return (
        <Badge color="green" variant="soft" size="1">
          Settled
        </Badge>
      );
    }
    if (item.dueDate && new Date(item.dueDate) < new Date()) {
      return (
        <Badge color="red" variant="soft" size="1">
          Overdue
        </Badge>
      );
    }
    if (item.payments && item.payments.length > 0) {
      return (
        <Badge color="blue" variant="soft" size="1">
          Partial
        </Badge>
      );
    }
    return (
      <Badge color="orange" variant="soft" size="1">
        Pending
      </Badge>
    );
  };

  const getProgressPercent = (item: LendDebt) => {
    if (item.amount === 0) return 100;
    const paid = item.amount - (item.outstanding || 0);
    return Math.min(Math.round((paid / item.amount) * 100), 100);
  };

  const buildTooltipContent = (item: LendDebt) => {
    const lines: string[] = [];
    if (item.phoneNumber) lines.push(`Phone: ${item.phoneNumber}`);
    if (item.dueDate) lines.push(`Due: ${formatDate(item.dueDate)}`);
    lines.push(`Account: ${getAccountName(item.accountId)}`);
    if (item.notes) lines.push(`Note: ${item.notes}`);
    return lines.join("\n");
  };

  const renderItem = (item: LendDebt, color: "green" | "red") => {
    const hasPayments = item.payments && item.payments.length > 0;
    const isSettled = item.status === LendDebtStatus.SETTLED;

    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 py-3"
      >
        <Flex justify="between" align="center" gap="3">
          {/* Left: avatar + name + details */}
          <Flex gap="3" align="center" className="flex-1 min-w-0">
            <Tooltip content={buildTooltipContent(item)} delayDuration={300}>
              <div
                className={`p-2 rounded-full shrink-0 cursor-default ${
                  color === "green"
                    ? "bg-green-100 dark:bg-green-900/30"
                    : "bg-red-100 dark:bg-red-900/30"
                }`}
              >
                <User
                  className={`w-4 h-4 ${
                    color === "green"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                />
              </div>
            </Tooltip>
            <div className="min-w-0 flex-1">
              <Flex align="center" gap="2">
                <Text weight="bold" size="3" truncate>
                  {item.personName}
                </Text>
                {getStatusBadge(item)}
              </Flex>
              <Flex align="center" gap="2" className="mt-0.5">
                <span className="hidden sm:contents">
                  {item.notes && (
                    <Text size="1" color="gray" truncate>
                      {item.notes}
                    </Text>
                  )}
                  {item.notes && item.dueDate && (
                    <Text size="1" color="gray" className="shrink-0">
                      &middot;
                    </Text>
                  )}
                </span>
                {item.dueDate && (
                  <Text
                    size="1"
                    color={new Date(item.dueDate) < new Date() ? "red" : "gray"}
                    className="shrink-0"
                  >
                    Due {formatDate(item.dueDate)}
                  </Text>
                )}
              </Flex>
            </div>
          </Flex>

          {/* Right: amount + menu */}
          <Flex align="center" gap="3">
            <Flex direction="column" align="end" gap="0" className="min-w-0">
              <Text weight="bold" color={color} size="3" truncate>
                {formatCurrency(item.outstanding || 0)}
              </Text>
              {hasPayments && (
                <Text size="1" color="gray" truncate>
                  of {formatCurrency(item.amount)}
                </Text>
              )}
            </Flex>

            {hasPayments && (
              <Tooltip content="Payment history">
                <Button
                  variant="ghost"
                  color="gray"
                  size="2"
                  onClick={() => setHistoryTarget(item)}
                >
                  <History size={15} />
                </Button>
              </Tooltip>
            )}

            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <Button variant="ghost" color="gray">
                  <MoreVertical size={16} />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content align="end">
                {!isSettled && (
                  <>
                    <DropdownMenu.Item
                      onClick={() => {
                        setPaymentTarget(item);
                        setIsPaymentModalOpen(true);
                      }}
                    >
                      <CreditCard size={14} />
                      Record Payment
                    </DropdownMenu.Item>
                    <DropdownMenu.Item onClick={() => markAsSettled(item.id)}>
                      <Check size={14} />
                      Mark as Settled
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator />
                  </>
                )}
                <DropdownMenu.Item
                  onClick={() => {
                    setEditData(item);
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
                      id: item.id,
                      label: item.personName,
                      onConfirm: () => deleteLendDebt(item.id),
                    })
                  }
                >
                  <Trash2 size={14} />
                  Delete
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </Flex>
        </Flex>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-6rem)]">
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

      {/* Edit Dialog */}
      <ResponsiveModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        title="Edit Entry"
        description="Edit the lend/debt entry details below."
      >
        <LendDebtForm
          onSubmit={updateLendDebt}
          defaultValues={editData as never}
          accounts={accounts}
          isLoading={loading}
        />
      </ResponsiveModal>

      {/* Payment Dialog */}
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
            onSubmit={createPayment}
            isLoading={loading}
          />
        )}
      </ResponsiveModal>

      {/* Payment History Dialog */}
      <ResponsiveModal
        open={!!historyTarget}
        onOpenChange={(open) => {
          if (!open) setHistoryTarget(null);
        }}
        title="Payment History"
        description={
          historyTarget?.type === LendDebtType.LEND
            ? `Payments received from ${historyTarget?.personName}`
            : `Payments made to ${historyTarget?.personName}`
        }
        maxWidth="520px"
      >
        {historyTarget && (
          <Flex direction="column" gap="4">
            {/* Summary strip */}
            <Flex
              justify="between"
              align="center"
              className="rounded-lg bg-muted/60 dark:bg-muted/40 px-4 py-3"
            >
              <Flex direction="column" gap="0">
                <Text size="1" color="gray" weight="medium">
                  Total
                </Text>
                <Text size="3" weight="bold">
                  {formatCurrency(historyTarget.amount)}
                </Text>
              </Flex>
              <Flex direction="column" gap="0" align="center">
                <Text size="1" color="gray" weight="medium">
                  Paid
                </Text>
                <Text size="3" weight="bold" color="green">
                  {formatCurrency(
                    historyTarget.amount - (historyTarget.outstanding || 0),
                  )}
                </Text>
              </Flex>
              <Flex direction="column" gap="0" align="end">
                <Text size="1" color="gray" weight="medium">
                  Outstanding
                </Text>
                <Text
                  size="3"
                  weight="bold"
                  color={historyTarget.outstanding === 0 ? "green" : "orange"}
                >
                  {formatCurrency(historyTarget.outstanding || 0)}
                </Text>
              </Flex>
            </Flex>

            {/* Progress */}
            <Progress
              value={getProgressPercent(historyTarget)}
              color={historyTarget.type === LendDebtType.LEND ? "green" : "red"}
              size="2"
            />

            {/* Timeline */}
            {historyTarget.payments && historyTarget.payments.length > 0 ? (
              <div className="relative ml-3">
                <div className="absolute left-0 top-2 bottom-2 w-px bg-border" />
                <Flex direction="column" gap="0">
                  {historyTarget.payments.map((payment, i) => {
                    const isLend = historyTarget.type === LendDebtType.LEND;
                    return (
                      <motion.div
                        key={payment.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                      >
                        <Flex
                          align="start"
                          gap="3"
                          className="relative py-3 pl-5 group hover:bg-muted/30 -ml-3 pr-2 rounded-lg transition-colors"
                        >
                          {/* Dot */}
                          <div
                            className={`absolute left-0 top-[18px] w-2.5 h-2.5 rounded-full ring-2 ring-card z-10 ${
                              isLend
                                ? "bg-green-500 dark:bg-green-400"
                                : "bg-red-500 dark:bg-red-400"
                            }`}
                          />

                          <Flex
                            justify="between"
                            align="center"
                            className="flex-1 min-w-0"
                          >
                            <Flex
                              direction="column"
                              gap="0"
                              className="min-w-0 flex-1"
                            >
                              <Flex align="center" gap="2">
                                <Text size="3" weight="bold">
                                  {formatCurrency(Number(payment.amount))}
                                </Text>
                                <Text size="1" color="gray">
                                  {formatDate(new Date(payment.paymentDate))}
                                </Text>
                              </Flex>
                              <Flex align="center" gap="1" className="mt-0.5">
                                <Wallet
                                  size={11}
                                  className="text-muted-foreground shrink-0"
                                />
                                <Text size="1" color="gray" truncate>
                                  {getAccountName(payment.accountId)}
                                </Text>
                                {payment.notes && (
                                  <>
                                    <Text
                                      size="1"
                                      color="gray"
                                      className="shrink-0"
                                    >
                                      &middot;
                                    </Text>
                                    <Text size="1" color="gray" truncate>
                                      {payment.notes}
                                    </Text>
                                  </>
                                )}
                              </Flex>
                            </Flex>

                            <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                              <DeleteConfirmDialog
                                onConfirm={() => deletePayment(payment.id)}
                                title="Delete Payment"
                                description={`Delete payment of ${formatCurrency(Number(payment.amount))}? This will reverse the balance change.`}
                              />
                            </div>
                          </Flex>
                        </Flex>
                      </motion.div>
                    );
                  })}
                </Flex>
              </div>
            ) : (
              <Flex align="center" justify="center" py="6">
                <Text size="2" color="gray">
                  No payments recorded yet.
                </Text>
              </Flex>
            )}

            {/* Record new payment button */}
            {historyTarget.status !== LendDebtStatus.SETTLED && (
              <Button
                variant="soft"
                color={
                  historyTarget.type === LendDebtType.LEND ? "green" : "red"
                }
                className="w-full"
                onClick={() => {
                  const target = historyTarget;
                  setHistoryTarget(null);
                  setTimeout(() => {
                    setPaymentTarget(target);
                    setIsPaymentModalOpen(true);
                  }, 150);
                }}
              >
                <CreditCard size={15} />
                {historyTarget.type === LendDebtType.LEND
                  ? "Record Received Payment"
                  : "Record Payment Made"}
              </Button>
            )}
          </Flex>
        )}
      </ResponsiveModal>

      <PageHeader
        title="Lend & Debt"
        description="Track money you've lent or borrowed"
        actions={
          <>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus size={18} />
              Add Entry
            </Button>
            <ResponsiveModal
              open={isAddModalOpen}
              onOpenChange={setIsAddModalOpen}
              title="Create New Entry"
              description="Add a new lend or debt entry to track your finances."
            >
              <LendDebtForm
                onSubmit={createLendDebt}
                accounts={accounts}
                isLoading={loading}
              />
            </ResponsiveModal>
          </>
        }
      />

      {/* Summary Cards */}
      <Grid columns={{ initial: "1", md: "2" }} gap="4" mb="6">
        <StatsCard
          label="To Receive"
          value={formatCurrency(totalLent)}
          icon={<ArrowUpRight size={20} />}
          color="green"
          description={
            <Text size="1" color="gray">
              {
                lentData.filter((i) => i.status !== LendDebtStatus.SETTLED)
                  .length
              }{" "}
              open entries
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
              {
                borrowedData.filter((i) => i.status !== LendDebtStatus.SETTLED)
                  .length
              }{" "}
              open entries
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
            <TabsTrigger value="lent" className="bg-primary">
              <ArrowUpRight className="w-4 h-4" />
              Money Lent
            </TabsTrigger>
            <TabsTrigger value="borrowed" className="bg-red-400">
              <ArrowDownLeft className="w-4 h-4" />
              Money Borrowed
            </TabsTrigger>
          </TabsList>
        </Flex>

        {loading ? (
          <Flex direction="column" gap="4">
            <Skeleton className="w-full h-16" />
            <Skeleton className="w-full h-16" />
            <Skeleton className="w-full h-16" />
          </Flex>
        ) : lendDebts.length > 0 ? (
          <Card
            asChild
            className="divide-y divide-border p-0 overflow-hidden"
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
                    lentData.map((item) => renderItem(item, "green"))
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
                    borrowedData.map((item) => renderItem(item, "red"))
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
