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
    <div
      className={`w-full min-w-0 overflow-hidden rounded-lg border ${styles.bg} ${styles.border}`}
    >
      <Flex align="center" justify="between" px="4" py="3" gap="2">
        <Flex align="center" gap="3" className="min-w-0">
          <div
            className={`shrink-0 rounded-lg p-2 ${styles.iconBg} ${styles.text}`}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <Text
              size="1"
              color="gray"
              weight="bold"
              className="tracking-wider uppercase"
            >
              {label}
            </Text>
            <Heading size="4" truncate>
              {value}
            </Heading>
          </div>
        </Flex>
        {description && (
          <Flex direction="column" align="end" className="shrink-0">
            {description}
          </Flex>
        )}
      </Flex>
    </div>
  );
}
