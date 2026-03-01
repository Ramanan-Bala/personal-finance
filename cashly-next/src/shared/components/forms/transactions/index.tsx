"use client";

import {
  createTransactionSchema,
  recurringFrequencyValues,
} from "@/shared/validators/transaction";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Badge,
  Button,
  Flex,
  Select,
  Switch,
  Text,
  TextArea,
  TextField,
} from "@radix-ui/themes";
import { Repeat } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Account, Category, DatePicker, FREQUENCY_LABELS } from "@/shared";

export type TransactionFormOutput = z.infer<typeof createTransactionSchema>;
type TransactionFormInput = z.input<typeof createTransactionSchema>;

interface TransactionFormProps {
  onSubmit: (data: TransactionFormOutput) => void;
  categories: Category[];
  accounts: Account[];
  defaultValues?: Partial<TransactionFormInput>;
  isLoading?: boolean;
  isEditMode?: boolean;
  aiCategorizationEnabled?: boolean;
}

export function TransactionForm({
  onSubmit,
  categories,
  accounts,
  defaultValues,
  isLoading,
  isEditMode = false,
  aiCategorizationEnabled = true,
}: TransactionFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormInput>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      type: "INCOME",
      isRecurring: false,
      ...defaultValues,
      transferToAccountId: defaultValues?.transferToAccountId || "",
      transactionDate: defaultValues?.transactionDate
        ? (defaultValues.transactionDate as unknown as Date).toISOString()
        : new Date().toISOString(),
    },
  });

  const type = watch("type");
  const accountId = watch("accountId");
  const categoryId = watch("categoryId");
  const transferToAccountId = watch("transferToAccountId");
  const isRecurring = watch("isRecurring");
  const recurringFrequency = watch("recurringFrequency");
  const recurringEndDate = watch("recurringEndDate");

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
              setValue("type", val as "INCOME" | "EXPENSE" | "TRANSFER");
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
            className="block w-full"
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

        {/* Category: shown in edit mode always, or in create mode when AI is disabled */}
        {type !== "TRANSFER" && (isEditMode || !aiCategorizationEnabled) && (
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

        {/* Recurring Toggle — only in create mode */}
        {!isEditMode && (
          <div className="space-y-3 rounded-lg border border-gray-200 p-3 dark:border-white/10">
            <Flex justify="between" align="center">
              <Flex gap="2" align="center">
                <Repeat size={16} className="text-primary" />
                <Text size="2" weight="bold">
                  Make this recurring
                </Text>
              </Flex>
              <Switch
                checked={!!isRecurring}
                onCheckedChange={(checked) => {
                  setValue("isRecurring", checked);
                  if (!checked) {
                    setValue("recurringFrequency", undefined);
                    setValue("recurringEndDate", undefined);
                  }
                }}
                color="green"
              />
            </Flex>

            {isRecurring && (
              <Flex direction="column" gap="3">
                {/* Frequency */}
                <label className="block">
                  <Text as="div" size="2" mb="1" weight="bold">
                    Frequency
                  </Text>
                  <Select.Root
                    value={recurringFrequency || ""}
                    onValueChange={(val) =>
                      setValue(
                        "recurringFrequency",
                        val as (typeof recurringFrequencyValues)[number],
                      )
                    }
                  >
                    <Select.Trigger
                      className="w-full"
                      placeholder="Select frequency"
                    />
                    <Select.Content position="popper">
                      {recurringFrequencyValues.map((freq) => (
                        <Select.Item key={freq} value={freq}>
                          {FREQUENCY_LABELS[freq]}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                  {errors.recurringFrequency && (
                    <Text color="red" size="1">
                      {errors.recurringFrequency.message}
                    </Text>
                  )}
                </label>

                {/* End Date (optional) */}
                <label className="block">
                  <Flex gap="2" align="center" mb="1">
                    <Text as="div" size="2" weight="bold">
                      End Date
                    </Text>
                    <Badge size="1" variant="soft" color="gray">
                      Optional
                    </Badge>
                  </Flex>
                  <DatePicker
                    className="block w-full"
                    selected={
                      recurringEndDate ? new Date(recurringEndDate) : undefined
                    }
                    onChange={(date) =>
                      setValue("recurringEndDate", date?.toISOString() ?? null)
                    }
                  />
                </label>
              </Flex>
            )}
          </div>
        )}

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Transaction"}
        </Button>
      </Flex>
    </form>
  );
}
