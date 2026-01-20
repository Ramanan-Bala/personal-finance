"use client";

import { CashlyLogo, useAuth } from "@/shared";
import {
  ArrowLeftRight,
  BookOpen,
  HandCoins,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelRightClose,
  Settings,
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
  const { logout } = useAuth();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(usePathname());
  const [isOpen, setIsOpen] = useState(true);

  const menuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: "Dashboard", url: "/dashboard" },
    { icon: BookOpen, label: "Ledger", url: "/ledger" },
    {
      icon: ArrowLeftRight,
      label: "Income & Expenses",
      url: "/income-expenses",
    },
    { icon: HandCoins, label: "Lend/Debt", url: "/lend-debt" },
  ];

  const handleNavigate = (page: MenuItem) => {
    setCurrentPage(page.label);
    router.push(page.url);
  };

  return (
    <div
      className={`border-border/40 bg-card min-h-screen border-r flex flex-col transition-all duration-300 ${
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
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-muted-foreground hover:text-foreground transition-colors p-2"
        >
          {isOpen ? <PanelLeftClose /> : <PanelRightClose />}
        </button>
      </div>

      <motion.nav layout className="flex-1 space-y-2 p-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.url}
              onClick={() => handleNavigate(item)}
              className={`text-foreground hover:bg-card mb-1 flex w-full items-center gap-2 rounded-lg transition-colors duration-300 p-3 leading-5 ${
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
      {/* <div className="border-border border-t"> */}
      <button
        onClick={() => logout()}
        className="text-muted-foreground hover:text-foreground w-full flex items-center gap-3 rounded-lg p-4 leading-1 transition-colors"
      >
        <LogOut className="min-h-5 min-w-5 max-h-5 max-w-5" />
        <AnimatePresence>
          {isOpen && (
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              exit={{ opacity: 0, x: -20 }}
            >
              Logout
            </motion.span>
          )}
        </AnimatePresence>
      </button>
      <button className="text-muted-foreground hover:text-foreground w-full flex items-center gap-3 rounded-lg p-4 leading-1 transition-colors">
        <Settings className="min-h-5 min-w-5 max-h-5 max-w-5" />
        <AnimatePresence>
          {isOpen && (
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              exit={{ opacity: 0, x: -20 }}
            >
              Settings
            </motion.span>
          )}
        </AnimatePresence>
      </button>
      {/* </div> */}
    </div>
  );
};
