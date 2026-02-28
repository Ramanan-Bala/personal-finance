"use client";

import {
  DeleteConfirmDialog,
  Transaction,
  TransactionType,
  useFormatter,
  getIconForCategory,
} from "@/shared";
import { Button, DropdownMenu, Flex, Text } from "@radix-ui/themes";
import { motion } from "motion/react";
import {
  ArrowDownRight,
  ArrowLeftRight,
  ArrowRightFromLineIcon,
  ArrowUpRight,
  MoreVertical,
  Pencil,
  Sparkles,
  Trash2,
} from "lucide-react";

interface TransactionListItemProps {
  item: Transaction;
  index: number;
  onEdit: (item: Transaction) => void;
  onDelete: (id: string, label: string) => void;
}

const TYPE_CONFIG = {
  [TransactionType.INCOME]: {
    color: "green" as const,
    prefix: "+",
    bgClass: "bg-green-100 dark:bg-green-900/30",
    fallbackIcon: ArrowUpRight,
    fallbackIconClass: "w-4 h-4 text-green-600",
  },
  [TransactionType.EXPENSE]: {
    color: "red" as const,
    prefix: "-",
    bgClass: "bg-red-100 dark:bg-red-900/30",
    fallbackIcon: ArrowDownRight,
    fallbackIconClass: "w-4 h-4 text-red-600",
  },
  [TransactionType.TRANSFER]: {
    color: "blue" as const,
    prefix: "",
    bgClass: "bg-blue-100 dark:bg-blue-900/30",
    fallbackIcon: ArrowLeftRight,
    fallbackIconClass: "w-4 h-4 text-blue-600",
  },
};

export function TransactionListItem({
  item,
  index,
  onEdit,
  onDelete,
}: TransactionListItemProps) {
  const { formatCurrency, formatDate } = useFormatter();
  const config = TYPE_CONFIG[item.type];
  const FallbackIcon = config.fallbackIcon;
  const isTransfer = item.type === TransactionType.TRANSFER;

  return (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors cursor-pointer"
    >
      <Flex align="center" gap="4">
        <div className={`p-2.5 rounded-lg ${config.bgClass}`}>
          {isTransfer ? (
            <FallbackIcon className={config.fallbackIconClass} />
          ) : (
            getIconForCategory(item.type, item.category?.icon) || (
              <FallbackIcon className={config.fallbackIconClass} />
            )
          )}
        </div>
        <div>
          <Text
            weight="medium"
            as="div"
            className="w-max overflow-hidden text-ellipsis whitespace-nowrap"
          >
            {item.notes || "No description"}
          </Text>
          <Flex align="center" gap="2">
            {isTransfer ? (
              <>
                <Text size="1" color="gray">{item.transferAccount?.name}</Text>
                <ArrowRightFromLineIcon color="gray" size="14" />
                <Text size="1" color="gray">{item.account?.name}</Text>
              </>
            ) : (
              <>
                <Flex align="center" gap="1">
                  <Text size="1" color="gray">{item.category?.name}</Text>
                  {item.category?.isAiGenerated && <Sparkles size={10} className="text-amber-500" />}
                </Flex>
                <Text size="1" color="gray">&bull;</Text>
                <Text size="1" color="gray">{item.account?.name}</Text>
              </>
            )}
          </Flex>
        </div>
      </Flex>

      <Flex align="center" gap="2">
        <div className="text-right">
          <Text weight="bold" color={config.color} as="div">
            {config.prefix}{formatCurrency(item.amount)}
          </Text>
          <Text size="1" color="gray">
            {item.transactionDate ? formatDate(item.transactionDate) : "No date"}
          </Text>
        </div>

        {isTransfer ? null : (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant="ghost" color="gray"><MoreVertical size={16} /></Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end">
              <DropdownMenu.Item onClick={() => onEdit(item)}>
                <Pencil size={14} /> Edit
              </DropdownMenu.Item>
              <DropdownMenu.Separator />
              <DropdownMenu.Item
                color="red"
                onClick={() => onDelete(item.id, item.notes || formatCurrency(item.amount))}
              >
                <Trash2 size={14} /> Delete
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        )}
      </Flex>
    </motion.div>
  );
}
