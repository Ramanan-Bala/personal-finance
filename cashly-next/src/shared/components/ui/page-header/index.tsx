import { Flex, Heading, Text } from "@radix-ui/themes";
import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <Flex
      direction={{ initial: "column", md: "row" }}
      justify="between"
      align={{ md: "center" }}
      gap="4"
      mb={{ initial: "4", sm: "6" }}
    >
      <div>
        <Heading size="8" mb="1">
          {title}
        </Heading>
        {description && (
          <Text color="gray" size="2">
            {description}
          </Text>
        )}
      </div>
      {actions && (
        <Flex gap="3" align="center">
          {actions}
        </Flex>
      )}
    </Flex>
  );
}
