"use client";
import { PageTransition, Sidebar, useAuth } from "@/shared";
import { Flex } from "@radix-ui/themes";
import { redirect } from "next/navigation";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    redirect("/");
  }

  return (
    <Flex className="overflow-hidden">
      <Sidebar />

      <Flex
        direction="column"
        className="flex-1 bg-bg transition-all duration-300 relative min-h-0"
      >
        <div
          className="flex-1 overflow-auto p-6 pt-[env(safe-area-inset-top)] md:pt-6 md:pb-6"
          style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
        >
          <PageTransition>{children}</PageTransition>
        </div>
      </Flex>
    </Flex>
  );
}
