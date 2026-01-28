"use client";

import { Tabs, TabsList, TabsTrigger } from "@/shared";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeSwitcher({ isTabStyle }: { isTabStyle?: boolean }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check for saved user preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      setTheme(prefersDark ? "dark" : "light");
    }

    // Apply the theme to the body
    if (theme === "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);

    if (newTheme === "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }

    localStorage.setItem("theme", newTheme);
  };

  if (!mounted) return null;

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
          <TabsTrigger value="dark" className="bg-gray-400" key={"dark"}>
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
