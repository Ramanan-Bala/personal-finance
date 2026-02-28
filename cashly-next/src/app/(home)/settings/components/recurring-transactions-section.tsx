"use client";

import api from "@/lib/api/axios";
import {
  DatePicker,
  FREQUENCY_LABELS,
  RecurringStatus,
  RecurringTransaction,
  useFormatter,
} from "@/shared";
import {
  Badge,
  Button,
  Card,
  Flex,
  IconButton,
  Text,
  Tooltip,
} from "@radix-ui/themes";
import { format } from "date-fns";
import {
  Info,
  LoaderCircleIcon,
  Pause,
  Play,
  Repeat,
  Square,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const STATUS_COLOR: Record<string, "green" | "orange" | "red" | "gray"> = {
  [RecurringStatus.ACTIVE]: "green",
  [RecurringStatus.PAUSED]: "orange",
  [RecurringStatus.STOPPED]: "red",
};

export default function RecurringTransactionsSection() {
  const { formatCurrency } = useFormatter();

  const [recurringRules, setRecurringRules] = useState<RecurringTransaction[]>(
    [],
  );
  const [recurringLoading, setRecurringLoading] = useState(false);
  const [editEndDateId, setEditEndDateId] = useState<string | null>(null);
  const [editEndDateValue, setEditEndDateValue] = useState<Date | undefined>(
    undefined,
  );

  const fetchRecurringRules = useCallback(async () => {
    try {
      setRecurringLoading(true);
      const response = await api.get<RecurringTransaction[]>(
        "/recurring-transactions",
      );
      setRecurringRules(response.data);
    } catch {
      // Error toast handled by axios interceptor
    } finally {
      setRecurringLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecurringRules();
  }, [fetchRecurringRules]);

  const handleRecurringAction = async (
    id: string,
    action: "pause" | "resume" | "stop",
  ) => {
    const statusMap: Record<string, RecurringStatus> = {
      pause: RecurringStatus.PAUSED,
      resume: RecurringStatus.ACTIVE,
      stop: RecurringStatus.STOPPED,
    };
    try {
      await api.patch(
        `/recurring-transactions/${id}`,
        { status: statusMap[action] },
        { showSuccessToast: true },
      );
      fetchRecurringRules();
    } catch {
      // Error toast handled by axios interceptor
    }
  };

  const handleUpdateEndDate = async (id: string) => {
    try {
      await api.patch(
        `/recurring-transactions/${id}`,
        { endDate: editEndDateValue?.toISOString() || null },
        { showSuccessToast: true },
      );
      setEditEndDateId(null);
      setEditEndDateValue(undefined);
      fetchRecurringRules();
    } catch {
      // Error toast handled by axios interceptor
    }
  };

  return (
    <div className="space-y-3">
      <Text
        size="2"
        weight="bold"
        color="gray"
        className="uppercase tracking-wider"
      >
        Recurring Transactions
      </Text>
      <Card size="1" className="overflow-hidden">
        {recurringLoading ? (
          <Flex align="center" justify="center" py="6">
            <LoaderCircleIcon
              size={20}
              className="animate-spin text-gray-400"
            />
            <Text size="2" color="gray" ml="2">
              Loading rules...
            </Text>
          </Flex>
        ) : recurringRules.length === 0 ? (
          <Flex
            direction="column"
            align="center"
            justify="center"
            py="6"
            gap="2"
          >
            <LoaderCircleIcon size={24} className="text-gray-300" />
            <Text size="2" color="gray">
              No recurring transactions yet
            </Text>
            <Text size="1" color="gray">
              Create one from the Ledger page
            </Text>
          </Flex>
        ) : (
          <Flex
            direction="column"
            className="divide-y divide-gray-100 dark:divide-white/5"
          >
            {recurringRules.map((rule) => (
              <div key={rule.id} className="p-1 space-y-2">
                <Flex justify="between" align="center" wrap="wrap" gap="2">
                  <Flex direction="column" gap="1" className="min-w-0">
                    <Flex align="center" gap="2">
                      <Text size="2" weight="bold" truncate>
                        {rule.notes ||
                          `${rule.type} — ${formatCurrency(rule.amount)}`}
                      </Text>
                      <Badge
                        size="1"
                        variant="soft"
                        color={STATUS_COLOR[rule.status] || "gray"}
                      >
                        {rule.status}
                      </Badge>
                    </Flex>
                    <Flex gap="2" align="center" wrap="wrap">
                      <Badge size="1" variant="outline" color="iris">
                        <Repeat size={10} />
                        {FREQUENCY_LABELS[rule.frequency] || rule.frequency}
                      </Badge>
                      <Text size="3" weight="bold" color="gray">
                        {formatCurrency(rule.amount)}
                      </Text>
                      {rule.endDate && (
                        <Text size="1" color="gray">
                          Ends {format(new Date(rule.endDate), "MMM dd, yyyy")}
                        </Text>
                      )}
                    </Flex>
                  </Flex>

                  <Flex gap="2" align="center" className="shrink-0">
                    {/* Pause / Resume */}
                    {rule.status === RecurringStatus.ACTIVE && (
                      <Tooltip content="Pause">
                        <IconButton
                          size="1"
                          variant="soft"
                          color="orange"
                          onClick={() =>
                            handleRecurringAction(rule.id, "pause")
                          }
                        >
                          <Pause size={14} />
                        </IconButton>
                      </Tooltip>
                    )}
                    {rule.status === RecurringStatus.PAUSED && (
                      <Tooltip content="Resume">
                        <IconButton
                          size="1"
                          variant="soft"
                          color="green"
                          onClick={() =>
                            handleRecurringAction(rule.id, "resume")
                          }
                        >
                          <Play size={14} />
                        </IconButton>
                      </Tooltip>
                    )}
                    {/* Stop */}
                    {rule.status !== RecurringStatus.STOPPED && (
                      <Tooltip content="Stop permanently">
                        <IconButton
                          size="1"
                          variant="soft"
                          color="red"
                          onClick={() => handleRecurringAction(rule.id, "stop")}
                        >
                          <Square size={14} />
                        </IconButton>
                      </Tooltip>
                    )}
                    {/* Edit End Date */}
                    {rule.status !== RecurringStatus.STOPPED && (
                      <Tooltip content="Edit end date">
                        <IconButton
                          size="1"
                          variant="soft"
                          color="iris"
                          onClick={() => {
                            setEditEndDateId(rule.id);
                            setEditEndDateValue(
                              rule.endDate ? new Date(rule.endDate) : undefined,
                            );
                          }}
                        >
                          <Info size={14} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Flex>
                </Flex>

                {/* Inline end-date editor */}
                {editEndDateId === rule.id && (
                  <Flex gap="2" align="center" wrap="wrap" pt="1">
                    <DatePicker
                      selected={editEndDateValue}
                      onChange={(date) => setEditEndDateValue(date)}
                      disabled={() => false}
                    />
                    <Button
                      size="1"
                      variant="soft"
                      onClick={() => handleUpdateEndDate(rule.id)}
                    >
                      Save
                    </Button>
                    <Button
                      size="1"
                      variant="soft"
                      color="gray"
                      onClick={() => {
                        setEditEndDateId(null);
                        setEditEndDateValue(undefined);
                      }}
                    >
                      Cancel
                    </Button>
                  </Flex>
                )}
              </div>
            ))}
          </Flex>
        )}
      </Card>
    </div>
  );
}
