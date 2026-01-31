"use client";

import { useUIStore } from "@/lib";
import { CashlyLogo, ThemeSwitcher, useAuth } from "@/shared";
import { Avatar, Button, Flex, Text } from "@radix-ui/themes";
import {
  ArrowUpDown,
  BookOpen,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelRightClose,
  Settings,
  Tags,
  Wallet,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";

interface MenuItem {
  icon: React.ComponentType<{ className?: string; size?: number }>;
  label: string;
  url: string;
}

export const Sidebar = () => {
  const { logout, user } = useAuth();
  const avatar = user?.name
    ?.split(" ")
    .map((name) => name[0])
    .join("");
  const router = useRouter();
  const { isSidebarOpen: isOpen, toggleSidebar } = useUIStore();
  const pathname = usePathname();

  const menuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: "Dashboard", url: "/dashboard" },
    { icon: BookOpen, label: "Ledger", url: "/ledger" },
    { icon: ArrowUpDown, label: "Transactions", url: "/transactions" },
    { icon: Tags, label: "Categories", url: "/categories" },
    { icon: Wallet, label: "Accounts", url: "/accounts" },
  ];

  const handleNavigate = (url: string) => {
    router.push(url);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`border-border/40 bg-card hidden md:flex min-h-screen max-h-screen border-r flex-col transition-all duration-300 ${
          isOpen ? "w-64" : "w-15"
        }`}
      >
        <div className="border-border/40 flex items-center justify-between border-b p-2">
          <motion.div
            animate={{ opacity: isOpen ? 1 : 0, x: isOpen ? 0 : -100 }}
            className="overflow-hidden"
          >
            <CashlyLogo showWordMark={isOpen} />
          </motion.div>
          <Button
            variant="ghost"
            color="gray"
            onClick={toggleSidebar}
            className="py-2 mr-1"
          >
            {isOpen ? (
              <PanelLeftClose size={20} />
            ) : (
              <PanelRightClose size={20} />
            )}
          </Button>
        </div>

        <motion.nav layout className="flex-1 space-y-2 p-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.url);
            return (
              <button
                key={item.url}
                onClick={() => handleNavigate(item.url)}
                className={`text-foreground hover:bg-primary/10 mb-1 flex w-full items-center gap-2 rounded-lg transition-colors duration-300 p-3 leading-5 ${
                  isActive ? "bg-primary! text-bg!" : ""
                }`}
              >
                <Icon className="min-h-5 min-w-5 max-h-5 max-w-5" />
                <AnimatePresence>
                  {isOpen && (
                    <motion.span
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="text-ellipsis overflow-hidden whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </motion.nav>

        <Flex p="2" direction="column" gap="4">
          <Flex gap="2" direction={isOpen ? "row" : "column"}>
            <Button
              variant="soft"
              color="red"
              onClick={() => logout()}
              className="grow p-2"
            >
              <LogOut className="min-h-5 min-w-5 max-h-5 max-w-5" />
              {isOpen && <span>Sign Out</span>}
            </Button>
            <Button
              variant="soft"
              color={pathname.startsWith("/settings") ? "green" : "gray"}
              className="grow p-2"
              onClick={() => handleNavigate("/settings")}
            >
              <Settings className="min-h-5 min-w-5 max-h-5 max-w-5" />
              {isOpen && <span>Settings</span>}
            </Button>
          </Flex>
        </Flex>
        <div className="px-2 mb-4">
          <ThemeSwitcher isTabStyle={isOpen} />
        </div>
        <div className="m-2 mt-0 border-t border-border pt-2">
          <Flex gap="3" align="center">
            <Avatar
              size="3"
              radius="full"
              fallback={avatar ? avatar : "USER"}
            />
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Text
                    as="div"
                    size="2"
                    weight="bold"
                    className="text-ellipsis overflow-hidden whitespace-nowrap"
                  >
                    {user?.name}
                  </Text>
                  <Text
                    as="div"
                    size="2"
                    color="gray"
                    className="text-ellipsis overflow-hidden whitespace-nowrap"
                  >
                    {user?.email}
                  </Text>
                </motion.div>
              )}
            </AnimatePresence>
          </Flex>
        </div>
      </div>

      {/* Mobile Floating Nav - Evenly distributed items including Settings */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md">
        <nav className="bg-card/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-full px-2 py-3 flex items-center justify-around">
          {[
            ...menuItems,
            { icon: Settings, label: "Settings", url: "/settings" },
          ]
            .filter((item) => item.label !== "Categories")
            .map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.url);

              return (
                <button
                  key={item.url}
                  onClick={() => handleNavigate(item.url)}
                  className={`flex flex-col items-center gap-1 transition-all active:scale-90 px-1 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-[9px] font-medium tracking-wide">
                    {item.label}
                  </span>
                </button>
              );
            })}
        </nav>
      </div>
    </>
  );
};
