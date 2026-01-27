"use client";
import { PageTransition, Sidebar } from "@/shared";
import { Flex } from "@radix-ui/themes";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Flex>
      <Sidebar />

      <Flex
        direction="column"
        className="flex-1 bg-bg transition-all duration-300 relative"
      >
        <div className="flex-1 overflow-auto p-6">
          <PageTransition>{children}</PageTransition>
        </div>
      </Flex>
    </Flex>
  );
}
