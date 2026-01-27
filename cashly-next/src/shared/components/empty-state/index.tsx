"use client";

import { Box, Flex, Heading, Text } from "@radix-ui/themes";
import { LucideIcon, Search } from "lucide-react";
import { motion } from "motion/react";
import React from "react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState = ({
  icon: Icon = Search,
  title,
  description,
  action,
}: EmptyStateProps) => {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      p="8"
      className="w-full min-h-72"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: 0.5,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="flex flex-col items-center text-center"
      >
        <Box className="mb-6 p-6 rounded-3xl bg-muted/50 text-muted-foreground relative">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Icon size={48} strokeWidth={1.5} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            className="absolute -inset-2 bg-primary/10 blur-2xl rounded-full -z-10"
          />
        </Box>

        <Heading size="5" mb="2" weight="bold">
          {title}
        </Heading>
        <Text size="2" color="gray" className="max-w-64 mb-6">
          {description}
        </Text>

        {action && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {action}
          </motion.div>
        )}
      </motion.div>
    </Flex>
  );
};
