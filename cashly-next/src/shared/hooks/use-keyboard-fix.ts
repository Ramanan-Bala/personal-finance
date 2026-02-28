"use client";
import { useEffect } from "react";

export function useKeyboardFix() {
  useEffect(() => {
    const handleFocusOut = () => {
      // Small delay to let keyboard fully close
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
      }, 100);
    };

    document.addEventListener("focusout", handleFocusOut);
    return () => document.removeEventListener("focusout", handleFocusOut);
  }, []);
}
