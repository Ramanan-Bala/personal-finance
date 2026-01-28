"use client";

import { Tabs, TabsList, TabsTrigger, useTheme } from "@/shared";
import { Moon, Sun } from "lucide-react";

export function ThemeSwitcher({ isTabStyle }: { isTabStyle?: boolean }) {
  const { theme, toggleTheme } = useTheme();

  if (isTabStyle)
    return (
      <Tabs value={theme} onValueChange={toggleTheme}>
        <TabsList className="w-full dark:bg-bg bg-bg">
          <TabsTrigger
            value="light"
            className="bg-white shadow-md"
            key={"light"}
          >
            <Sun size={16} className="text-foreground" />
            <span className="text-foreground">Light</span>
          </TabsTrigger>
          <TabsTrigger value="dark" className="bg-gray-300" key={"dark"}>
            <Moon size={16} />
            Dark
          </TabsTrigger>
        </TabsList>
      </Tabs>
    );

  return (
    <button
      onClick={toggleTheme}
      className="bg-bg border-border relative flex h-10 w-10 items-center justify-center rounded-[14px] border transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5 text-foreground" />
      ) : (
        <Sun className="h-5 w-5 text-foreground" />
      )}
    </button>
  );
}
