"use client";

import { useUIStore } from "@/lib";
import { CashlyLogo, ThemeSwitcher, useAuth } from "@/shared";
import { Avatar, Button, Flex, Text } from "@radix-ui/themes";
import {
  ArrowUpDown,
  BookOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelRightClose,
  Settings,
  Tags,
  Wallet,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Drawer } from "vaul";

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
    // { icon: ArrowUpDown, label: "Transactions", url: "/transactions" },
    { icon: ArrowUpDown, label: "Lend & Debts", url: "/lend-debt" },
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

      {/* Mobile Docked Bottom Nav */}
      <MobileBottomNav
        pathname={pathname}
        onNavigate={handleNavigate}
        onLogout={logout}
      />
    </>
  );
};

const primaryNavItems = [
  { icon: LayoutDashboard, label: "Home", url: "/dashboard" },
  // { icon: ArrowUpDown, label: "Transactions", url: "/transactions" },
  { icon: BookOpen, label: "Ledger", url: "/ledger" },
  { icon: ArrowUpDown, label: "Lend & Debts", url: "/lend-debt" },
  { icon: Settings, label: "Settings", url: "/settings" },
];

const secondaryNavItems = [
  { icon: Wallet, label: "Accounts", url: "/accounts" },
  { icon: Tags, label: "Categories", url: "/categories" },
];

function MobileBottomNav({
  pathname,
  onNavigate,
  onLogout,
}: {
  pathname: string;
  onNavigate: (url: string) => void;
  onLogout: () => void;
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const portalRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    portalRef.current = document.querySelector(".radix-themes");
  }, []);

  const isSecondaryActive = secondaryNavItems.some((item) =>
    pathname.startsWith(item.url),
  );

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      <nav className="bg-card border-t border-border rounded-t-2xl shadow-[0_-2px_10px_rgba(0,0,0,0.08)] px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center justify-around">
        {primaryNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.url);

          return (
            <button
              key={item.url}
              onClick={() => onNavigate(item.url)}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-11 transition-colors active:scale-90 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon size={22} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}

        {/* More button */}
        <button
          onClick={() => setMoreOpen(true)}
          className={`flex flex-col items-center justify-center gap-0.5 min-w-11 transition-colors active:scale-90 ${
            isSecondaryActive ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Menu size={22} />
          <span className="text-[10px] font-medium">More</span>
        </button>
      </nav>

      {/* More bottom sheet */}
      <Drawer.Root open={moreOpen} onOpenChange={setMoreOpen}>
        <Drawer.Portal container={portalRef.current}>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-card border-t border-border flex flex-col">
            <div className="mx-auto mt-3 mb-1 h-1.5 w-12 rounded-full bg-muted-foreground/30" />
            <Drawer.Title className="sr-only">More</Drawer.Title>
            <div className="px-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
              {secondaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.url);

                return (
                  <button
                    key={item.url}
                    onClick={() => {
                      onNavigate(item.url);
                      setMoreOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full px-4 h-12 rounded-lg transition-colors active:bg-muted ${
                      isActive ? "text-primary" : "text-foreground"
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}

              <div className="mx-4 my-1 border-t border-border" />

              <button
                onClick={() => {
                  setMoreOpen(false);
                  onLogout();
                }}
                className="flex items-center gap-3 w-full px-4 h-12 rounded-lg text-red-500 transition-colors active:bg-red-500/10"
              >
                <LogOut size={20} />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
