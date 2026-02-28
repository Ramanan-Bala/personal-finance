"use client";

import { TransactionType } from "@/shared";
import { createCategorySchema } from "@/shared/validators/category";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Flex,
  Grid,
  IconButton,
  Select,
  Text,
  TextArea,
  TextField,
} from "@radix-ui/themes";
import {
  Banknote,
  Briefcase,
  Car,
  Coffee,
  CreditCard,
  Gamepad2,
  GraduationCap,
  HeartPulse,
  House,
  Lightbulb,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  Utensils,
} from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

export type CategoryFormOutput = z.infer<typeof createCategorySchema>;
type CategoryFormInput = z.input<typeof createCategorySchema>;

interface CategoryFormProps {
  onSubmit: (data: CategoryFormOutput) => void;
  defaultValues?: Partial<CategoryFormInput>;
  isLoading?: boolean;
}

const CATEGORY_ICONS = [
  { name: "Banknote", icon: Banknote },
  { name: "Briefcase", icon: Briefcase },
  { name: "Car", icon: Car },
  { name: "Coffee", icon: Coffee },
  { name: "CreditCard", icon: CreditCard },
  { name: "Gamepad2", icon: Gamepad2 },
  { name: "GraduationCap", icon: GraduationCap },
  { name: "HeartPulse", icon: HeartPulse },
  { name: "House", icon: House },
  { name: "Lightbulb", icon: Lightbulb },
  { name: "ShoppingBag", icon: ShoppingBag },
  { name: "Utensils", icon: Utensils },
];

export function CategoryForm({
  onSubmit,
  defaultValues,
  isLoading,
}: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormInput>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      type: TransactionType.INCOME,
      icon: "Banknote",
      ...defaultValues,
    },
  });

  const selectedIcon = watch("icon");

  const handleFormSubmit = (data: CategoryFormInput) => {
    onSubmit(data as CategoryFormOutput);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Flex direction="column" gap="3">
        {/* Name */}
        <label className="block">
          <Text as="div" size="2" mb="1" weight="bold">
            Name
          </Text>
          <TextField.Root placeholder="Category Name" {...register("name")} />
          {errors.name && (
            <Text color="red" size="1">
              {errors.name.message}
            </Text>
          )}
        </label>

        {/* Type */}
        <label className="block">
          <Text as="div" size="2" mb="1" weight="bold">
            Type
          </Text>
          <Select.Root
            defaultValue={defaultValues?.type || TransactionType.INCOME}
            onValueChange={(val) => setValue("type", val as never)}
          >
            <Select.Trigger className="w-full" />
            <Select.Content position="popper">
              <Select.Item value="INCOME">
                <span className="flex items-center gap-2">
                  <TrendingUp className="text-green-500" size={14} />
                  Income
                </span>
              </Select.Item>
              <Select.Item value="EXPENSE">
                <span className="flex items-center gap-2">
                  <TrendingDown className="text-red-500" size={14} />
                  Expense
                </span>
              </Select.Item>
            </Select.Content>
          </Select.Root>
          {errors.type && (
            <Text color="red" size="1">
              {errors.type.message}
            </Text>
          )}
        </label>

        {/* Icon Picker */}
        <div className="block">
          <Text as="div" size="2" mb="2" weight="bold">
            Select Icon
          </Text>
          <Grid columns="6" gap="2">
            {CATEGORY_ICONS.map(({ name, icon: Icon }) => (
              <IconButton
                key={name}
                type="button"
                variant={selectedIcon === name ? "solid" : "soft"}
                color={selectedIcon === name ? "green" : "gray"}
                onClick={() => setValue("icon", name)}
                size="3"
              >
                <Icon size={20} />
              </IconButton>
            ))}
          </Grid>
          {errors.icon && (
            <Text color="red" size="1" mt="1">
              {errors.icon.message}
            </Text>
          )}
        </div>

        {/* Description */}
        <label className="block">
          <Text as="div" size="2" mb="1" weight="bold">
            Description
          </Text>
          <TextArea
            placeholder="About this category..."
            {...register("description")}
          />
          {errors.description && (
            <Text color="red" size="1">
              {errors.description.message}
            </Text>
          )}
        </label>

        <Button type="submit" disabled={isLoading} size="3">
          {isLoading ? "Saving..." : "Save Category"}
        </Button>
      </Flex>
    </form>
  );
}
