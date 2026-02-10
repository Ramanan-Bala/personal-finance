import { CARD_COLOR_MAP } from "@/shared/constants";
import { Flex, Heading, Text } from "@radix-ui/themes";
import React from "react";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  description?: React.ReactNode;
  color?: "gray" | "blue" | "green" | "red" | "orange";
}

export function StatsCard({
  label,
  value,
  icon,
  description,
  color = "blue",
}: StatsCardProps) {
  const styles = CARD_COLOR_MAP[color];

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
