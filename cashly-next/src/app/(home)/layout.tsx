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
  // useKeyboardFix();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    redirect("/");
  }

  return (
    <Flex className="min-h-(--app-vh,100dvh) overflow-hidden">
      <Sidebar />

      <Flex
        direction="column"
        className="bg-bg relative min-h-0 flex-1 transition-all duration-300"
      >
        <div className="main-container max-h-[calc(var(--app-vh,100dvh)-max(env(safe-area-inset-bottom),3rem))] flex-1 overflow-y-auto p-3 pt-[max(env(safe-area-inset-top),1.5rem)] pb-[max(env(safe-area-inset-bottom),5rem)] sm:p-6 md:pt-6 md:pb-6">
          <PageTransition>{children}</PageTransition>
        </div>
      </Flex>
    </Flex>
  );
}
