"use client";

import { createTransactionSchema } from "@/shared/validators/transaction";
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

import { Account, Category, DatePicker } from "@/shared";

export type TransactionFormOutput = z.infer<typeof createTransactionSchema>;
type TransactionFormInput = z.input<typeof createTransactionSchema>;

interface TransactionFormProps {
  onSubmit: (data: TransactionFormOutput) => void;
  categories: Category[];
  accounts: Account[];
  defaultValues?: Partial<TransactionFormInput>;
  isLoading?: boolean;
}

export function TransactionForm({
  onSubmit,
  categories,
  accounts,
  defaultValues,
  isLoading,
}: TransactionFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    getValues,
  } = useForm<TransactionFormInput>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      type: "INCOME",
      ...defaultValues,
      transferToAccountId: defaultValues?.transferToAccountId || "",
      transactionDate: defaultValues?.transactionDate
        ? (defaultValues.transactionDate as any).toISOString()
        : new Date().toISOString(),
    },
  });

  const type = watch("type");
  const accountId = watch("accountId");
  const categoryId = watch("categoryId");
  const transferToAccountId = watch("transferToAccountId");

  const currentCategories = categories.filter((cat) => cat.type === type);

  const handleFormSubmit = (data: TransactionFormInput) => {
    onSubmit(data as unknown as TransactionFormOutput);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Flex direction="column" gap="3">
        {/* Transaction Type */}
        <label className="block">
          <Text as="div" size="2" mb="1" weight="bold">
            Type
          </Text>
          <Select.Root
            defaultValue={defaultValues?.type || "INCOME"}
            onValueChange={(val) => {
              setValue("type", val as never);
              setValue("categoryId", ""); // Reset category when type changes
            }}
          >
            <Select.Trigger className="w-full" />
            <Select.Content position="popper">
              <Select.Item value="INCOME">Income</Select.Item>
              <Select.Item value="EXPENSE">Expense</Select.Item>
              <Select.Item value="TRANSFER">Transfer</Select.Item>
            </Select.Content>
          </Select.Root>
          {errors.type && (
            <Text color="red" size="1">
              {errors.type.message}
            </Text>
          )}
        </label>

        {/* Amount */}
        <label className="block">
          <Text as="div" size="2" mb="1" weight="bold">
            Amount
          </Text>
          <TextField.Root
            placeholder="0.00"
            type="number"
            step="0.01"
            {...register("amount")}
          />
          {errors.amount && (
            <Text color="red" size="1">
              {errors.amount.message}
            </Text>
          )}
        </label>

        {/* Date */}
        <label className="block">
          <Text as="div" size="2" mb="1" weight="bold">
            Date
          </Text>
          <DatePicker
            className="w-full block"
            selected={new Date(defaultValues?.transactionDate || new Date())}
            onChange={(date) =>
              setValue(
                "transactionDate",
                date?.toISOString() || new Date().toISOString(),
              )
            }
          />
          {errors.transactionDate && (
            <Text color="red" size="1">
              {errors.transactionDate.message}
            </Text>
          )}
        </label>

        {/* Account */}
        <label className="block">
          <Text as="div" size="2" mb="1" weight="bold">
            {type === "TRANSFER" ? "From Account" : "Account"}
          </Text>
          <Select.Root
            value={accountId}
            onValueChange={(val) => setValue("accountId", val)}
          >
            <Select.Trigger className="w-full" placeholder="Select Account" />
            <Select.Content position="popper">
              {accounts.map((acc) => (
                <Select.Item key={acc.id} value={acc.id}>
                  {acc.name}
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

        {/* Transfer To Account (Only for Transfer) */}
        {type === "TRANSFER" && (
          <label className="block">
            <Text as="div" size="2" mb="1" weight="bold">
              To Account
            </Text>
            <Select.Root
              value={transferToAccountId}
              onValueChange={(val) => setValue("transferToAccountId", val)}
            >
              <Select.Trigger
                className="w-full"
                placeholder="Select Target Account"
              />
              <Select.Content position="popper">
                {accounts.map((acc) => (
                  <Select.Item key={acc.id} value={acc.id}>
                    {acc.name}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
            {errors.transferToAccountId && (
              <Text color="red" size="1">
                {errors.transferToAccountId.message}
              </Text>
            )}
          </label>
        )}

        {/* Category (Only for Income/Expense) */}
        {type !== "TRANSFER" && (
          <label className="block">
            <Text as="div" size="2" mb="1" weight="bold">
              Category
            </Text>
            <Select.Root
              value={categoryId}
              onValueChange={(val) => setValue("categoryId", val)}
            >
              <Select.Trigger
                className="w-full"
                placeholder="Select Category"
              />
              <Select.Content position="popper">
                {currentCategories.map((cat) => (
                  <Select.Item key={cat.id} value={cat.id}>
                    {cat.name}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
            {errors.categoryId && (
              <Text color="red" size="1">
                {errors.categoryId.message}
              </Text>
            )}
          </label>
        )}

        {/* Notes */}
        <label className="block">
          <Text as="div" size="2" mb="1" weight="bold">
            Notes
          </Text>
          <TextArea placeholder="Add a note..." {...register("notes")} />
          {errors.notes && (
            <Text color="red" size="1">
              {errors.notes.message}
            </Text>
          )}
        </label>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Transaction"}
        </Button>
      </Flex>
    </form>
  );
}
