import { ICON_MAP, TransactionType } from "@/shared";

export function getIconForCategory(
  transactionType: TransactionType,
  iconName?: string | null,
) {
  if (!iconName) return null;
  const Icon = ICON_MAP[iconName];
  if (!Icon) return null;

  const colorClass =
    transactionType === TransactionType.INCOME
      ? "text-green-600"
      : transactionType === TransactionType.TRANSFER
        ? "text-blue-600"
        : "text-red-600";

  return <Icon className={`h-4 w-4 ${colorClass}`} />;
}
