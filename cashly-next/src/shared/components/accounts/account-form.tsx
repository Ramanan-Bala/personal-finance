"use client";

import { createAccountSchema } from "@/lib/validators/account";
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
import { z } from "zod";

type AccountFormOutput = z.infer<typeof createAccountSchema>;
type AccountFormInput = z.input<typeof createAccountSchema>;

interface AccountFormProps {
  onSubmit: (data: AccountFormOutput) => void;
  groups: { id: string; name: string }[];
  isLoading?: boolean;
}

export function AccountForm({ onSubmit, groups, isLoading }: AccountFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AccountFormInput>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      openingBalance: 0,
    },
  });

  const handleFormSubmit = (data: AccountFormInput) => {
    onSubmit(data as unknown as AccountFormOutput);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Flex direction="column" gap="3">
        {/* Name */}
        <label className="block">
          <Text as="div" size="2" mb="1" weight="bold">
            Account Name
          </Text>
          <TextField.Root placeholder="e.g. SBI Bank" {...register("name")} />
          {errors.name && (
            <Text color="red" size="1">
              {errors.name.message}
            </Text>
          )}
        </label>

        {/* Group */}
        <label className="block">
          <Text as="div" size="2" mb="1" weight="bold">
            Group
          </Text>
          <Select.Root onValueChange={(val) => setValue("groupId", val)}>
            <Select.Trigger className="w-full" placeholder="Select Group" />
            <Select.Content position="popper">
              {groups.map((group) => (
                <Select.Item key={group.id} value={group.id}>
                  {group.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
          {errors.groupId && (
            <Text color="red" size="1">
              {errors.groupId.message}
            </Text>
          )}
        </label>

        {/* Opening Balance */}
        <label className="block">
          <Text as="div" size="2" mb="1" weight="bold">
            Opening Balance
          </Text>
          <TextField.Root
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register("openingBalance")}
          />
          {errors.openingBalance && (
            <Text color="red" size="1">
              {errors.openingBalance.message}
            </Text>
          )}
        </label>

        {/* Description */}
        <label className="block">
          <Text as="div" size="2" mb="1" weight="bold">
            Description
          </Text>
          <TextArea
            placeholder="Brief description..."
            {...register("description")}
          />
          {errors.description && (
            <Text color="red" size="1">
              {errors.description.message}
            </Text>
          )}
        </label>

        <Button type="submit" disabled={isLoading} mt="2">
          {isLoading ? "Creating..." : "Create Account"}
        </Button>
      </Flex>
    </form>
  );
}
