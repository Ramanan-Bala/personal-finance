"use client";

import { createLendDebtPaymentSchema } from "@/shared/validators/lend-debt-payment";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Flex,
  Select,
  Text,
  TextArea,
  TextField,
} from "@radix-ui/themes";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Account, DatePicker } from "@/shared";

type PaymentFormOutput = z.infer<typeof createLendDebtPaymentSchema>;
type PaymentFormInput = z.input<typeof createLendDebtPaymentSchema>;

interface LendDebtPaymentFormProps {
  lendDebtId: string;
  defaultAccountId: string;
  outstanding: number;
  accounts?: Account[];
  onSubmit: (data: PaymentFormOutput) => void;
  isLoading?: boolean;
}

export function LendDebtPaymentForm({
  lendDebtId,
  defaultAccountId,
  outstanding,
  accounts = [],
  onSubmit,
  isLoading,
}: LendDebtPaymentFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PaymentFormInput>({
    resolver: zodResolver(createLendDebtPaymentSchema),
    defaultValues: {
      lendDebtId,
      accountId: defaultAccountId,
      paymentDate: new Date().toISOString(),
    },
  });

  const handleFormSubmit = (data: PaymentFormInput) => {
    onSubmit(data as unknown as PaymentFormOutput);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <input type="hidden" {...register("lendDebtId")} />
      <Flex direction="column" gap="3">
        {/* Account */}
        <label className="block">
          <Text as="div" size="2" mb="1" weight="bold">
            Account
          </Text>
          <Select.Root
            defaultValue={defaultAccountId}
            onValueChange={(val) => setValue("accountId", val)}
          >
            <Select.Trigger className="w-full" placeholder="Select account" />
            <Select.Content position="popper">
              {accounts.map((account) => (
                <Select.Item key={account.id} value={account.id}>
                  {account.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
          {errors.accountId && (
            <Text color="red" size="1">
              {errors.accountId.message}
            </Text>
          )}
        </label>

        {/* Amount */}
        <label className="block">
          <Text as="div" size="2" mb="1" weight="bold">
            Amount
          </Text>
          <TextField.Root
            placeholder={`Outstanding: ${outstanding.toFixed(2)}`}
            type="number"
            step="0.01"
            max={outstanding}
            {...register("amount")}
          />
          {errors.amount && (
            <Text color="red" size="1">
              {errors.amount.message}
            </Text>
          )}
        </label>

        {/* Payment Date */}
        <label className="block">
          <Text as="div" size="2" mb="1" weight="bold">
            Payment Date
          </Text>
          <DatePicker
            className="w-full block"
            selected={new Date()}
            onChange={(date) =>
              setValue("paymentDate", date?.toISOString() || new Date().toISOString())
            }
          />
          {errors.paymentDate && (
            <Text color="red" size="1">
              {errors.paymentDate.message}
            </Text>
          )}
        </label>

        {/* Notes */}
        <label className="block">
          <Text as="div" size="2" mb="1" weight="bold">
            Notes (Optional)
          </Text>
          <TextArea
            placeholder="Add a note about this payment..."
            {...register("notes")}
          />
          {errors.notes && (
            <Text color="red" size="1">
              {errors.notes.message}
            </Text>
          )}
        </label>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Recording..." : "Record Payment"}
        </Button>
      </Flex>
    </form>
  );
}
