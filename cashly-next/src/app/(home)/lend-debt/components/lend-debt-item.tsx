"use client";

import {
  DeleteConfirmDialog,
  LendDebt,
  LendDebtStatus,
  LendDebtType,
  useFormatter,
} from "@/shared";
import {
  Badge,
  Button,
  DropdownMenu,
  Flex,
  Text,
  Tooltip,
} from "@radix-ui/themes";
import { motion } from "motion/react";
import {
  Check,
  CreditCard,
  History,
  MoreVertical,
  Pencil,
  Trash2,
  User,
} from "lucide-react";

interface LendDebtItemProps {
  item: LendDebt;
  color: "green" | "red";
  getAccountName: (accountId: string) => string;
  onEdit: (item: LendDebt) => void;
  onDelete: (id: string, label: string) => void;
  onRecordPayment: (item: LendDebt) => void;
  onMarkSettled: (id: string) => void;
  onViewHistory: (item: LendDebt) => void;
}

function getStatusBadge(item: LendDebt) {
  if (item.status === LendDebtStatus.SETTLED) {
    return <Badge color="green" variant="soft" size="1">Settled</Badge>;
  }
  if (item.dueDate && new Date(item.dueDate) < new Date()) {
    return <Badge color="red" variant="soft" size="1">Overdue</Badge>;
  }
  if (item.payments && item.payments.length > 0) {
    return <Badge color="blue" variant="soft" size="1">Partial</Badge>;
  }
  return <Badge color="orange" variant="soft" size="1">Pending</Badge>;
}

export function LendDebtItem({
  item,
  color,
  getAccountName,
  onEdit,
  onDelete,
  onRecordPayment,
  onMarkSettled,
  onViewHistory,
}: LendDebtItemProps) {
  const { formatCurrency, formatDate } = useFormatter();
  const hasPayments = item.payments && item.payments.length > 0;
  const isSettled = item.status === LendDebtStatus.SETTLED;

  const tooltipLines: string[] = [];
  if (item.phoneNumber) tooltipLines.push(`Phone: ${item.phoneNumber}`);
  if (item.dueDate) tooltipLines.push(`Due: ${formatDate(item.dueDate)}`);
  tooltipLines.push(`Account: ${getAccountName(item.accountId)}`);
  if (item.notes) tooltipLines.push(`Note: ${item.notes}`);

  return (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 py-3"
    >
      <Flex justify="between" align="center" gap="3">
        <Flex gap="3" align="center" className="flex-1 min-w-0">
          <Tooltip content={tooltipLines.join("\n")} delayDuration={300}>
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
                  <Text size="1" color="gray" truncate>{item.notes}</Text>
                )}
                {item.notes && item.dueDate && (
                  <Text size="1" color="gray" className="shrink-0">&middot;</Text>
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

          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant="ghost" color="gray">
                <MoreVertical size={16} />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end" size="2">
              {!isSettled && (
                <>
                  <DropdownMenu.Item onClick={() => onRecordPayment(item)}>
                    <CreditCard size={14} /> Record Payment
                  </DropdownMenu.Item>
                  <DropdownMenu.Item onClick={() => onMarkSettled(item.id)}>
                    <Check size={14} /> Mark as Settled
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator />
                </>
              )}
              <DropdownMenu.Item onClick={() => onEdit(item)}>
                <Pencil size={14} /> Edit
              </DropdownMenu.Item>
              <DropdownMenu.Item
                color="red"
                onClick={() => onDelete(item.id, item.personName)}
              >
                <Trash2 size={14} /> Delete
              </DropdownMenu.Item>
              {hasPayments && (
                <>
                  <DropdownMenu.Separator />
                  <DropdownMenu.Item onClick={() => onViewHistory(item)}>
                    <History size={15} /> Payment History
                  </DropdownMenu.Item>
                </>
              )}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Flex>
      </Flex>
    </motion.div>
  );
}
