import { Flex, Heading, Text } from "@radix-ui/themes";
import React from "react";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  description?: React.ReactNode;
  color?: "gray" | "blue" | "green" | "red" | "orange";
}

const colorMap = {
  gray: {
    bg: "bg-gray-400/5",
    border: "border-gray-400/10",
    iconBg: "bg-gray-400/20",
    text: "text-gray-400",
  },
  blue: {
    bg: "bg-blue-400/5",
    border: "border-blue-400/10",
    iconBg: "bg-blue-400/20",
    text: "text-blue-400",
  },
  green: {
    bg: "bg-emerald-400/5",
    border: "border-emerald-400/10",
    iconBg: "bg-emerald-400/20",
    text: "text-emerald-400",
  },
  red: {
    bg: "bg-red-400/5",
    border: "border-red-400/10",
    iconBg: "bg-red-400/20",
    text: "text-red-400",
  },
  orange: {
    bg: "bg-orange-400/5",
    border: "border-orange-400/10",
    iconBg: "bg-orange-400/20",
    text: "text-orange-400",
  },
};

export function StatsCard({
  label,
  value,
  icon,
  description,
  color = "blue",
}: StatsCardProps) {
  const styles = colorMap[color];

  return (
    <div className={`rounded-lg border ${styles.bg} ${styles.border}`}>
      <Flex align="center" justify="between" px="4" py="3">
        <Flex align="center" gap="3">
          <div className={`p-2 rounded-lg ${styles.iconBg} ${styles.text}`}>
            {icon}
          </div>
          <div>
            <Text
              size="1"
              color="gray"
              weight="bold"
              className="uppercase tracking-wider"
            >
              {label}
            </Text>
            <Heading size="6">{value}</Heading>
          </div>
        </Flex>
        {description && (
          <Flex direction="column" align="end">
            {description}
          </Flex>
        )}
      </Flex>
    </div>
  );
}
