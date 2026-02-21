"use client";

import api from "@/lib/api/axios";
import {
  AccountForm,
  AccountGroup,
  CreateAccountDTO,
  EmptyState,
  PageHeader,
  ResponsiveModal,
  useFormatter,
} from "@/shared";
import {
  Badge,
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  IconButton,
  Skeleton,
  Text,
  TextField,
} from "@radix-ui/themes";
import { Plus, Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";

export default function AccountsPage() {
  const { formatCurrency } = useFormatter();
  const [groups, setGroups] = useState<AccountGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<AccountGroup[]>("/accounts/groups");
      setGroups(response.data);
    } catch (err) {
      setError("Failed to load account groups");
      console.error("Error fetching account groups:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (data: CreateAccountDTO) => {
    try {
      setIsCreating(true);
      await api.post("/accounts", data, { showSuccessToast: true });

      await fetchGroups();
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Error creating account:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groups;

    const query = searchQuery.toLowerCase();
    return groups
      .map((group) => ({
        ...group,
        accounts: group.accounts.filter(
          (acc) =>
            acc.name.toLowerCase().includes(query) ||
            acc.description?.toLowerCase().includes(query),
        ),
      }))
      .filter(
        (group) =>
          group.accounts.length > 0 || group.name.toLowerCase().includes(query),
      );
  }, [groups, searchQuery]);

  const totalBalance = useMemo(() => {
    return groups.reduce(
      (sum, group) =>
        sum +
        group.accounts.reduce(
          (accSum, acc) => Number(accSum) + Number(acc.openingBalance),
          0,
        ),
      0,
    );
  }, [groups]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accounts"
        description="Manage your financial accounts and groups"
        actions={
          <>
            <Button
              variant="solid"
              color="green"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus size={18} />
              <span>Add Account</span>
            </Button>
            <ResponsiveModal
              open={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              title="Create New Account"
              description="Add a new account to manage your financial transactions."
            >
              <AccountForm
                groups={groups.map((g) => ({ id: g.id, name: g.name }))}
                onSubmit={handleCreateAccount}
                isLoading={isCreating}
              />
            </ResponsiveModal>
          </>
        }
      />

      {loading ? (
        <Flex direction="column" gap="4">
          <Skeleton className="h-10 w-full sm:w-72" />
          <Skeleton className="h-8 w-full sm:w-48" />
          <Grid columns={{ initial: "1", md: "2", lg: "3" }} gap="4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </Grid>
        </Flex>
      ) : (
        <Flex direction="column" gap="4">
          <TextField.Root
            size="3"
            placeholder="Search accounts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-80"
          >
            <TextField.Slot>
              <Search size={16} />
            </TextField.Slot>
            {searchQuery && (
              <TextField.Slot>
                <IconButton
                  variant="ghost"
                  size="1"
                  onClick={() => setSearchQuery("")}
                >
                  <X size={14} />
                </IconButton>
              </TextField.Slot>
            )}
          </TextField.Root>

          {/* Groups and Accounts List */}
          <div className="space-y-10">
            <AnimatePresence mode="popLayout">
              {filteredGroups.length === 0 ? (
                <EmptyState
                  title="No accounts found"
                  description="Try adjusting your search query or create a new account to get started."
                />
              ) : (
                filteredGroups.map((group) => (
                  <motion.section key={group.id} layout className="space-y-4">
                    <Flex align="center" gap="2">
                      <Heading size="4" weight="bold">
                        {group.name}
                      </Heading>
                      <Badge variant="soft" color="gray">
                        {group.accounts.length}
                      </Badge>
                      {group.description && (
                        <Text size="1" color="gray" ml="2">
                          {group.description}
                        </Text>
                      )}
                    </Flex>

                    <Grid columns={{ initial: "1", md: "2", lg: "3" }} gap="4">
                      <AnimatePresence mode="popLayout">
                        {group.accounts.map((account) => (
                          <motion.div
                            key={account.id}
                            layout="position"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            whileHover={{ y: -4 }}
                          >
                            <Card
                              variant="classic"
                              style={{ cursor: "pointer" }}
                            >
                              <Flex direction="column" gap="3">
                                <div>
                                  <Heading size="3">{account.name}</Heading>
                                  <Text size="1" color="gray">
                                    {account.description || "No description"}
                                  </Text>
                                </div>
                                <Flex justify="between" align="end">
                                  <Badge color="green" size="1">
                                    Active
                                  </Badge>
                                  <Heading size="5" color="green">
                                    {formatCurrency(account.openingBalance)}
                                  </Heading>
                                </Flex>
                              </Flex>
                            </Card>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </Grid>
                  </motion.section>
                ))
              )}
            </AnimatePresence>
          </div>
        </Flex>
      )}
    </div>
  );
}
