"use client";

import {
  getIconForCategory,
  leftToRightVariants,
  Transaction,
  TransactionType,
  useFormatter,
  viewPortComplete,
} from "@/shared";
import { Badge, Button, DropdownMenu, Flex, Text } from "@radix-ui/themes";
import { format } from "date-fns";
import {
  ArrowLeftRight,
  ArrowRightFromLineIcon,
  ArrowUpRight,
  MoreVertical,
  Pencil,
  Repeat,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";

interface LedgerTransactionRowProps {
  transaction: Transaction;
  onEdit: (item: Transaction) => void;
  onDelete: (id: string, label: string) => void;
}

const TYPE_STYLES: Record<string, { barClass: string; bgClass: string }> = {
  INCOME: { barClass: "bg-primary", bgClass: "bg-primary/20" },
  EXPENSE: { barClass: "bg-red-400", bgClass: "bg-red-400/20" },
  TRANSFER: { barClass: "bg-blue-400", bgClass: "bg-blue-400/20" },
};

export function LedgerTransactionRow({
  transaction,
  onEdit,
  onDelete,
}: LedgerTransactionRowProps) {
  const { formatCurrency } = useFormatter();
  const isTransfer = transaction.type === TransactionType.TRANSFER;
  const isRecurring = !!transaction.recurringTransactionId;
  const style = TYPE_STYLES[transaction.type];
  const amountColor =
    transaction.type === TransactionType.INCOME
      ? "green"
      : transaction.type === TransactionType.TRANSFER
        ? "blue"
        : "red";
  const prefix =
    transaction.type === TransactionType.INCOME
      ? "+"
      : transaction.type === TransactionType.TRANSFER
        ? ""
        : "-";

  return (
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
          className={`hidden sm:block absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-full rounded-full ${style.barClass}`}
        />
        <div className={`p-2.5 rounded-lg hidden sm:block ${style.bgClass}`}>
          {!isTransfer ? (
            getIconForCategory(
              transaction.type,
              transaction.category?.icon,
            ) || <ArrowUpRight className="w-4 h-4 text-primary" />
          ) : (
            <ArrowLeftRight className="w-4 h-4 text-blue-400" />
          )}
        </div>
        <div>
          <Flex align="center" gap="2">
            <Text weight="medium" as="div">
              {transaction.notes || "No description"}
            </Text>
            {isRecurring && (
              <Badge size="1" variant="soft" color="iris">
                <Repeat size={10} />
                Recurring
              </Badge>
            )}
          </Flex>
          {!isTransfer ? (
            <Flex align="center" gap="2">
              <Text size="1" color="gray">
                {transaction.category?.name}
              </Text>
              <Text size="1" color="gray">
                &bull;
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
              <ArrowRightFromLineIcon color="gray" size="14" />
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
        <Text weight="bold" color={amountColor} as="div">
          {prefix}
          {formatCurrency(transaction.amount)}
        </Text>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button variant="ghost" color="gray">
              <MoreVertical size={16} />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end">
            <DropdownMenu.Item onClick={() => onEdit(transaction)}>
              <Pencil size={14} /> Edit
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item
              color="red"
              onClick={() =>
                onDelete(
                  transaction.id,
                  transaction.notes || formatCurrency(transaction.amount),
                )
              }
            >
              <Trash2 size={14} /> Delete
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Flex>
    </motion.div>
  );
}
