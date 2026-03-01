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
        className={`border-border/40 bg-card hidden max-h-screen min-h-screen flex-col border-r transition-all duration-300 md:flex ${
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
            className="mr-1 py-2"
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
                className={`text-foreground hover:bg-primary/10 mb-1 flex w-full items-center gap-2 rounded-lg p-3 leading-5 transition-colors duration-300 ${
                  isActive ? "bg-primary! text-bg!" : ""
                }`}
              >
                <Icon className="max-h-5 min-h-5 max-w-5 min-w-5" />
                <AnimatePresence>
                  {isOpen && (
                    <motion.span
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="overflow-hidden text-ellipsis whitespace-nowrap"
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
              <LogOut className="max-h-5 min-h-5 max-w-5 min-w-5" />
              {isOpen && <span>Sign Out</span>}
            </Button>
            <Button
              variant="soft"
              color={pathname.startsWith("/settings") ? "green" : "gray"}
              className="grow p-2"
              onClick={() => handleNavigate("/settings")}
            >
              <Settings className="max-h-5 min-h-5 max-w-5 min-w-5" />
              {isOpen && <span>Settings</span>}
            </Button>
          </Flex>
        </Flex>
        <div className="mb-4 px-2">
          <ThemeSwitcher isTabStyle={isOpen} />
        </div>
        <div className="border-border m-2 mt-0 border-t pt-2">
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
                    className="overflow-hidden text-ellipsis whitespace-nowrap"
                  >
                    {user?.name}
                  </Text>
                  <Text
                    as="div"
                    size="2"
                    color="gray"
                    className="overflow-hidden text-ellipsis whitespace-nowrap"
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
  { icon: ArrowUpDown, label: "Lend & Debts", url: "/lend-debt" },
  { icon: BookOpen, label: "Ledger", url: "/ledger" },
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
    <div className="mobile-bottom-nav fixed right-0 bottom-0 left-0 z-50 h-14 md:hidden">
      <nav className="bg-card border-border flex items-center justify-around rounded-t-2xl border-t px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
        {primaryNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.url);

          return (
            <button
              key={item.url}
              onClick={() => onNavigate(item.url)}
              className={`flex min-w-11 flex-col items-center justify-center gap-0.5 transition-colors active:scale-90 ${
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
          className={`flex min-w-11 flex-col items-center justify-center gap-0.5 transition-colors active:scale-90 ${
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
          <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
          <Drawer.Content className="bg-card border-border fixed right-0 bottom-0 left-0 z-50 flex max-h-[calc(var(--app-vh,100dvh)-max(env(safe-area-inset-top),0.5rem))] flex-col rounded-t-2xl border-t">
            <div className="bg-muted-foreground/30 mx-auto mt-3 mb-1 h-1.5 w-12 rounded-full" />
            <Drawer.Title className="sr-only">More</Drawer.Title>
            <div
              className="overflow-y-auto px-2 pb-[max(1rem,env(safe-area-inset-bottom))]"
              data-vaul-no-drag
            >
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
                    className={`active:bg-muted flex h-12 w-full items-center gap-3 rounded-lg px-4 transition-colors ${
                      isActive ? "text-primary" : "text-foreground"
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}

              <div className="border-border mx-4 my-1 border-t" />

              <button
                onClick={() => {
                  setMoreOpen(false);
                  onLogout();
                }}
                className="flex h-12 w-full items-center gap-3 rounded-lg px-4 text-red-500 transition-colors active:bg-red-500/10"
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
