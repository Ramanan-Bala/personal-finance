"use client";

import { Flex, Skeleton } from "@radix-ui/themes";

interface ListSkeletonProps {
  count?: number;
  height?: string;
}

export function ListSkeleton({ count = 3, height = "h-16" }: ListSkeletonProps) {
  return (
    <Flex direction="column" gap="4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={`w-full ${height}`} />
      ))}
    </Flex>
  );
}
