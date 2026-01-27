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
import { useState } from "react";

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  url: string;
}

export const Sidebar = () => {
  const { logout, user } = useAuth();
  const avatar = user?.name
    .split(" ")
    .map((name) => name[0])
    .join("");
  const router = useRouter();
  const { isSidebarOpen: isOpen, toggleSidebar } = useUIStore();
  const [currentPage, setCurrentPage] = useState(usePathname());

  const menuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: "Dashboard", url: "/dashboard" },
    { icon: BookOpen, label: "Ledger", url: "/ledger" },
    { icon: ArrowUpDown, label: "Transactions", url: "/transactions" },
    { icon: Tags, label: "Categories", url: "/categories" },
    // { icon: HandCoins, label: "Lend/Debt", url: "/lend-debt" },
    { icon: Wallet, label: "Accounts", url: "/accounts" },
  ];

  const handleNavigate = (page: MenuItem) => {
    setCurrentPage(page.label);
    router.push(page.url);
  };

  return (
    <div
      className={`border-border/40 bg-card min-h-screen max-h-screen border-r flex flex-col transition-all duration-300 ${
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
          return (
            <button
              key={item.url}
              onClick={() => handleNavigate(item)}
              className={`text-foreground hover:bg-primary/10 mb-1 flex w-full items-center gap-2 rounded-lg transition-colors duration-300 p-3 leading-5 ${
                currentPage
                  .toLocaleLowerCase()
                  .includes(item.label.toLocaleLowerCase())
                  ? "bg-primary! text-bg!"
                  : ""
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

      <Flex p="4" direction="column" gap="4">
        <Flex gap="2" direction={isOpen ? "row" : "column"}>
          <Button
            variant="ghost"
            color="red"
            onClick={() => logout()}
            className="grow p-2"
          >
            <LogOut className="min-h-5 min-w-5 max-h-5 max-w-5" />
            {isOpen && <span>Logout</span>}
          </Button>
          <Button variant="ghost" color="gray" className="grow p-2">
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
          <Avatar size="3" radius="full" fallback={avatar ? avatar : "USER"} />
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
  );
};
