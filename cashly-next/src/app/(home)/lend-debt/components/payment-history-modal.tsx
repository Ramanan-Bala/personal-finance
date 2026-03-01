"use client";

import {
  DeleteConfirmDialog,
  LendDebt,
  LendDebtStatus,
  LendDebtType,
  ResponsiveModal,
  useFormatter,
} from "@/shared";
import { Button, Flex, Progress, Text } from "@radix-ui/themes";
import { motion } from "motion/react";
import { CreditCard, Wallet } from "lucide-react";

interface PaymentHistoryModalProps {
  item: LendDebt | null;
  onClose: () => void;
  onDeletePayment: (paymentId: string) => void;
  onRecordNewPayment: (item: LendDebt) => void;
  getAccountName: (accountId: string) => string;
}

function getProgressPercent(item: LendDebt): number {
  if (item.amount === 0) return 100;
  const paid = item.amount - (item.outstanding || 0);
  return Math.min(Math.round((paid / item.amount) * 100), 100);
}

export function PaymentHistoryModal({
  item,
  onClose,
  onDeletePayment,
  onRecordNewPayment,
  getAccountName,
}: PaymentHistoryModalProps) {
  const { formatCurrency, formatDate } = useFormatter();
  if (!item) return null;

  const isLend = item.type === LendDebtType.LEND;

  return (
    <ResponsiveModal
      open={!!item}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title="Payment History"
      description={
        isLend
          ? `Payments received from ${item.personName}`
          : `Payments made to ${item.personName}`
      }
      maxWidth="520px"
    >
      <Flex direction="column" gap="4">
        <Flex
          justify="between"
          align="center"
          className="bg-muted/60 dark:bg-muted/40 rounded-lg px-4 py-3"
        >
          <Flex direction="column" gap="0">
            <Text size="1" color="gray" weight="medium">
              Total
            </Text>
            <Text size="3" weight="bold">
              {formatCurrency(item.amount)}
            </Text>
          </Flex>
          <Flex direction="column" gap="0" align="center">
            <Text size="1" color="gray" weight="medium">
              Paid
            </Text>
            <Text size="3" weight="bold" color="green">
              {formatCurrency(item.amount - (item.outstanding || 0))}
            </Text>
          </Flex>
          <Flex direction="column" gap="0" align="end">
            <Text size="1" color="gray" weight="medium">
              Outstanding
            </Text>
            <Text
              size="3"
              weight="bold"
              color={item.outstanding === 0 ? "green" : "orange"}
            >
              {formatCurrency(item.outstanding || 0)}
            </Text>
          </Flex>
        </Flex>

        <Progress
          value={getProgressPercent(item)}
          color={isLend ? "green" : "red"}
          size="2"
        />

        {item.payments && item.payments.length > 0 ? (
          <div className="relative ml-3">
            <div className="bg-border absolute top-2 bottom-2 left-0 w-px" />
            <Flex direction="column" gap="0">
              {item.payments.map((payment, i) => (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Flex
                    align="start"
                    gap="3"
                    className="group hover:bg-muted/30 relative -ml-3 rounded-lg py-3 pr-2 pl-5 transition-colors"
                  >
                    <div
                      className={`ring-card absolute top-[18px] left-0 z-10 h-2.5 w-2.5 rounded-full ring-2 ${
                        isLend
                          ? "bg-green-500 dark:bg-green-400"
                          : "bg-red-500 dark:bg-red-400"
                      }`}
                    />
                    <Flex
                      justify="between"
                      align="center"
                      className="min-w-0 flex-1"
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
                              <Text size="1" color="gray" className="shrink-0">
                                &middot;
                              </Text>
                              <Text size="1" color="gray" truncate>
                                {payment.notes}
                              </Text>
                            </>
                          )}
                        </Flex>
                      </Flex>
                      <div className="ml-2 shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
                        <DeleteConfirmDialog
                          onConfirm={() => onDeletePayment(payment.id)}
                          title="Delete Payment"
                          description={`Delete payment of ${formatCurrency(Number(payment.amount))}? This will reverse the balance change.`}
                        />
                      </div>
                    </Flex>
                  </Flex>
                </motion.div>
              ))}
            </Flex>
          </div>
        ) : (
          <Flex align="center" justify="center" py="6">
            <Text size="2" color="gray">
              No payments recorded yet.
            </Text>
          </Flex>
        )}

        {item.status !== LendDebtStatus.SETTLED && (
          <Button
            variant="soft"
            color={isLend ? "green" : "red"}
            className="w-full"
            onClick={() => onRecordNewPayment(item)}
          >
            <CreditCard size={15} />
            {isLend ? "Record Received Payment" : "Record Payment Made"}
          </Button>
        )}
      </Flex>
    </ResponsiveModal>
  );
}
