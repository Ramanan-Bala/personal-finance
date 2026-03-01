"use client";

import { createLendDebtSchema } from "@/shared/validators/lend-debt";
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

type LendDebtFormOutput = z.infer<typeof createLendDebtSchema>;
type LendDebtFormInput = z.input<typeof createLendDebtSchema>;

interface LendDebtFormProps {
  onSubmit: (data: LendDebtFormOutput) => void;
  defaultValues?: Partial<LendDebtFormInput>;
  accounts?: Account[];
  isLoading?: boolean;
}

export function LendDebtForm({
  onSubmit,
  defaultValues,
  accounts = [],
  isLoading,
}: LendDebtFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LendDebtFormInput>({
    resolver: zodResolver(createLendDebtSchema),
    defaultValues: {
      type: "LEND",
      ...defaultValues,
      dueDate: defaultValues?.dueDate || undefined,
    },
  });

  const type = watch("type");

  const handleFormSubmit = (data: LendDebtFormInput) => {
    onSubmit(data as unknown as LendDebtFormOutput);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Flex direction="column" gap="3">
        {/* Type */}
        <label className="block">
          <Text as="div" size="2" mb="1" weight="bold">
            Type
          </Text>
          <Select.Root
            defaultValue={defaultValues?.type || "LEND"}
            onValueChange={(val) => {
              setValue("type", val as LendDebtFormInput["type"]);
            }}
          >
            <Select.Trigger className="w-full" />
            <Select.Content position="popper">
              <Select.Item value="LEND">Money Lent</Select.Item>
              <Select.Item value="DEBT">Money Borrowed</Select.Item>
            </Select.Content>
          </Select.Root>
          {errors.type && (
            <Text color="red" size="1">
              {errors.type.message}
            </Text>
          )}
        </label>

        {/* Account */}
        <label className="block">
          <Text as="div" size="2" mb="1" weight="bold">
            Account
          </Text>
          <Select.Root
            defaultValue={defaultValues?.accountId || ""}
            onValueChange={(val) => {
              setValue("accountId", val);
            }}
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

        {/* Person Name */}
        <label className="block">
          <Text as="div" size="2" mb="1" weight="bold">
            Person Name
          </Text>
          <TextField.Root
            placeholder="Enter person's name"
            {...register("personName")}
          />
          {errors.personName && (
            <Text color="red" size="1">
              {errors.personName.message}
            </Text>
          )}
        </label>

        {/* Phone Number (Only for LEND) */}
        {type === "LEND" && (
          <label className="block">
            <Text as="div" size="2" mb="1" weight="bold">
              Phone Number
            </Text>
            <TextField.Root
              placeholder="+91 98765 43210"
              {...register("phoneNumber")}
            />
            {errors.phoneNumber && (
              <Text color="red" size="1">
                {errors.phoneNumber.message}
              </Text>
            )}
          </label>
        )}

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

        {/* Due Date */}
        <label className="block">
          <Text as="div" size="2" mb="1" weight="bold">
            Due Date (Optional)
          </Text>
          <DatePicker
            className="block w-full"
            selected={
              defaultValues?.dueDate
                ? new Date(defaultValues.dueDate)
                : undefined
            }
            onChange={(date) =>
              setValue("dueDate", date?.toISOString() || undefined)
            }
            disabled={(date: Date) => date < new Date()}
          />
          {errors.dueDate && (
            <Text color="red" size="1">
              {errors.dueDate.message}
            </Text>
          )}
        </label>

        {/* Notes */}
        <label className="block">
          <Text as="div" size="2" mb="1" weight="bold">
            Notes (Optional)
          </Text>
          <TextArea
            placeholder="Add a note (e.g., for medical emergency)..."
            {...register("notes")}
          />
          {errors.notes && (
            <Text color="red" size="1">
              {errors.notes.message}
            </Text>
          )}
        </label>

        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? "Saving..."
            : defaultValues?.id
              ? "Update Entry"
              : "Add Entry"}
        </Button>
      </Flex>
    </form>
  );
}
