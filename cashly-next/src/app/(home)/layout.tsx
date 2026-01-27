"use client";
import { PageTransition, Sidebar, useAuth } from "@/shared";
import { Flex } from "@radix-ui/themes";
import { redirect } from "next/navigation";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    redirect("/login");
  }

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
