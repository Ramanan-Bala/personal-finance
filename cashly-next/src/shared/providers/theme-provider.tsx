"use client";

import { ReactNode, useEffect, useState } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check for saved user preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      if (savedTheme === "dark") {
        document.body.classList.add("dark");
      } else {
        document.body.classList.remove("dark");
      }
    } else {
      // Check system preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      if (prefersDark) {
        document.body.classList.add("dark");
      }
    }
  }, []);

  if (!mounted) return null;

  return <>{children}</>;
}
