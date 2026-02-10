"use client";

import api from "@/lib/api/axios";
import {
  CreateLendDebtSchema,
  DeleteConfirmDialog,
  EmptyState,
  LendDebt,
  LendDebtForm,
  LendDebtStatus,
  LendDebtType,
  PageHeader,
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
  Dialog,
  Flex,
  Grid,
  Skeleton,
  Text,
} from "@radix-ui/themes";
import { motion } from "motion/react";

import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  Pencil,
  Phone,
  Plus,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

const LendDebtPage = () => {
  const [lendDebts, setLendDebts] = useState<LendDebt[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("lent");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<LendDebt | null>(null);

  const { formatCurrency, formatDate } = useFormatter();

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get<LendDebt[]>("/lend-debt");

      const updatedLendDebts = response.data.map((item) => ({
        ...item,
        amount: Number(item.amount),
        dueDate: item.dueDate ? new Date(item.dueDate) : undefined,
        outstanding: item.outstanding || Number(item.amount),
      }));

      setLendDebts(updatedLendDebts);
    } catch (err) {
      console.error("Error fetching lend/debt data:", err);
    } finally {
      setLoading(false);
    }
  };

  const createLendDebt = async (data: CreateLendDebtSchema) => {
    try {
      setLoading(true);
      const response = await api.post<LendDebt>("/lend-debt", data, {
        showSuccessToast: true,
      });
      response.data.amount = Number(response.data.amount);
      response.data.dueDate = response.data.dueDate
        ? new Date(response.data.dueDate)
        : undefined;
      if (response.data.type === LendDebtType.LEND) setActiveTab("lent");
      else setActiveTab("borrowed");
      setLendDebts((prev) => [...prev, response.data]);
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
      const response = await api.patch<LendDebt>(`/lend-debt/${id}`, data, {
        showSuccessToast: true,
      });
      response.data.amount = Number(response.data.amount);
      response.data.dueDate = response.data.dueDate
        ? new Date(response.data.dueDate)
        : undefined;
      setLendDebts((prev) =>
        prev.map((item) => (item.id === id ? response.data : item)),
      );
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
      setLendDebts((prev) => prev.filter((item) => item.id !== id));
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
      // Create a payment for the full outstanding amount
      const item = lendDebts.find((ld) => ld.id === id);
      if (!item) return;

      await api.post(
        "/lend-debt/payments",
        {
          lendDebtId: id,
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

  useEffect(() => {
    fetchData();
  }, []);

  const lendDebtsArray = Array.isArray(lendDebts) ? lendDebts : [];

  const lentData = lendDebtsArray.filter(
    (item) => item.type === LendDebtType.LEND,
  );
  const borrowedData = lendDebtsArray.filter(
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

  const getStatusBadge = (item: LendDebt) => {
    if (item.status === LendDebtStatus.SETTLED) {
      return (
        <Badge color="green" variant="soft">
          Settled
        </Badge>
      );
    }

    if (item.dueDate && new Date(item.dueDate) < new Date()) {
      return (
        <Badge color="red" variant="soft">
          Overdue
        </Badge>
      );
    }

    return (
      <Badge color="orange" variant="soft">
        Pending
      </Badge>
    );
  };

  return (
    <>
      <Dialog.Root open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <Dialog.Content maxWidth="450px">
          <Flex direction="column" justify="between" mb="4">
            <Flex justify="between">
              <Dialog.Title mb="0">Edit Entry</Dialog.Title>
              <Dialog.Close>
                <Button variant="ghost" color="gray">
                  <X size={18} />
                </Button>
              </Dialog.Close>
            </Flex>
            <Dialog.Description>
              Edit the lend/debt entry details below.
            </Dialog.Description>
          </Flex>
          <LendDebtForm
            onSubmit={updateLendDebt}
            defaultValues={editData as never}
            isLoading={loading}
          />
        </Dialog.Content>
      </Dialog.Root>

      <PageHeader
        title="Lend & Debt"
        description="Track money you've lent or borrowed"
        actions={
          <Dialog.Root open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <Dialog.Trigger>
              <Button>
                <Plus size={18} />
                Add Entry
              </Button>
            </Dialog.Trigger>
            <Dialog.Content maxWidth="450px">
              <Flex direction="column" justify="between" mb="4">
                <Flex justify="between">
                  <Dialog.Title mb="0">Create New Entry</Dialog.Title>
                  <Dialog.Close>
                    <Button variant="ghost" color="gray">
                      <X size={18} />
                    </Button>
                  </Dialog.Close>
                </Flex>
                <Dialog.Description size="2">
                  Add a new lend or debt entry to track your finances.
                </Dialog.Description>
              </Flex>
              <LendDebtForm onSubmit={createLendDebt} isLoading={loading} />
            </Dialog.Content>
          </Dialog.Root>
        }
      />

      {/* Summary Cards */}
      <Grid columns={{ initial: "1", md: "2" }} gap="4" mb="6">
        <StatsCard
          label="Money Lent"
          value={formatCurrency(totalLent)}
          icon={<ArrowUpRight size={20} />}
          color="green"
          description={
            <Text size="1" color="gray">
              To be received
            </Text>
          }
        />
        <StatsCard
          label="Money Owed"
          value={formatCurrency(totalOwed)}
          icon={<ArrowDownLeft size={20} />}
          color="red"
          description={
            <Text size="1" color="gray">
              To be paid
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
            <Skeleton className="w-full h-24" />
            <Skeleton className="w-full h-24" />
            <Skeleton className="w-full h-24" />
          </Flex>
        ) : lendDebtsArray.length > 0 ? (
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
              {activeTab === "lent" ? (
                <TabsContent value="lent" forceMount>
                  {lentData.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <Flex align="center" gap="4">
                        <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <Flex align="center" gap="2" mb="1">
                            <Text weight="bold" size="3">
                              {item.personName}
                            </Text>
                            {getStatusBadge(item)}
                          </Flex>
                          <Flex
                            direction="column"
                            gap="2"
                            className="text-muted-foreground"
                          >
                            <Flex gap="4">
                              {item.phoneNumber && (
                                <Flex align="center" gap="1">
                                  <Phone size={10} />
                                  <Text size="1">{item.phoneNumber}</Text>
                                </Flex>
                              )}
                              {item.dueDate && (
                                <Flex align="center" gap="1">
                                  <Calendar size={12} />
                                  <Text size="1">
                                    Due: {formatDate(item.dueDate)}
                                  </Text>
                                </Flex>
                              )}
                            </Flex>
                            <Text size="2">
                              {item.notes || "No description"}
                            </Text>
                          </Flex>
                        </div>
                      </Flex>
                      <Flex align="center" gap="2">
                        <Flex direction="column" align="end" gap="1" mr="2">
                          <Text weight="bold" color="green" size="4">
                            {formatCurrency(item.outstanding || 0)}
                          </Text>
                          <Text size="1" color="gray">
                            Lent on{" "}
                            {formatDate(new Date(item.createdAt || new Date()))}
                          </Text>
                          {item.status !== LendDebtStatus.SETTLED && (
                            <Button
                              variant="outline"
                              color="gray"
                              size="2"
                              onClick={() => markAsSettled(item.id)}
                            >
                              Mark Settled
                            </Button>
                          )}
                        </Flex>
                        <Flex direction="column" gap="2">
                          <Button
                            variant="soft"
                            color="gray"
                            size="2"
                            onClick={() => {
                              setIsEditModalOpen(true);
                              setEditData(item);
                            }}
                          >
                            <Pencil size={16} />
                          </Button>
                          <DeleteConfirmDialog
                            onConfirm={() => deleteLendDebt(item.id)}
                            title="Delete Entry"
                            description={`Delete lend entry for ${item.personName}? This action cannot be undone.`}
                          />
                        </Flex>
                      </Flex>
                    </motion.div>
                  ))}

                  {lentData.length === 0 && (
                    <EmptyState
                      title="No money lent"
                      description="You haven't lent any money yet."
                    />
                  )}
                </TabsContent>
              ) : (
                <TabsContent value="borrowed" forceMount>
                  <div className="divide-y divide-border">
                    {borrowedData.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                      >
                        <Flex align="center" gap="4" className="flex-1">
                          <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30">
                            <User className="w-5 h-5 text-red-600 dark:text-red-400" />
                          </div>
                          <div className="flex-1">
                            <Flex align="center" gap="2" mb="1">
                              <Text weight="bold" size="3">
                                {item.personName}
                              </Text>
                              {getStatusBadge(item)}
                            </Flex>
                            <Flex align="center" gap="2" wrap="wrap">
                              {item.dueDate && (
                                <>
                                  <Text size="1" color="gray">
                                    Due: {formatDate(item.dueDate)}
                                  </Text>
                                  <Text size="1" color="gray">
                                    •
                                  </Text>
                                </>
                              )}
                              <Text size="1" color="gray">
                                {item.notes || "No description"}
                              </Text>
                            </Flex>
                          </div>
                        </Flex>
                        <Flex align="center" gap="2">
                          <div className="text-right mr-3">
                            <Text weight="bold" color="red" size="4" as="div">
                              {formatCurrency(item.outstanding || 0)}
                            </Text>
                            <Text size="1" color="gray">
                              Borrowed on{" "}
                              {formatDate(
                                new Date(item.createdAt || new Date()),
                              )}
                            </Text>
                          </div>
                          {item.status !== LendDebtStatus.SETTLED && (
                            <Button
                              variant="soft"
                              color="green"
                              size="2"
                              onClick={() => markAsSettled(item.id)}
                            >
                              Mark Settled
                            </Button>
                          )}
                          <Button
                            variant="soft"
                            color="gray"
                            size="2"
                            onClick={() => {
                              setIsEditModalOpen(true);
                              setEditData(item);
                            }}
                          >
                            <Pencil size={16} />
                          </Button>
                          <DeleteConfirmDialog
                            onConfirm={() => deleteLendDebt(item.id)}
                            title="Delete Entry"
                            description={`Delete debt entry for ${item.personName}? This action cannot be undone.`}
                          />
                        </Flex>
                      </motion.div>
                    ))}

                    {borrowedData.length === 0 && (
                      <EmptyState
                        title="No money borrowed"
                        description="You haven't borrowed any money yet."
                      />
                    )}
                  </div>
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
    </>
  );
};

export default LendDebtPage;
