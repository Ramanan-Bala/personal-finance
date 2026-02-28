"use client";
import { useEffect } from "react";

export function useKeyboardFix() {
  useEffect(() => {
    const handleFocusOut = () => {
      setTimeout(() => {
        // Reset scroll
        window.scrollTo({ top: 0, behavior: "instant" });
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;

        // Reset any transform
        document.body.style.transform = "";
        document.body.style.height = "";
        document.body.style.top = "";
        document.body.style.position = "";
      }, 150); // slightly longer delay than before
    };

    const viewport = window.visualViewport;
    const handleViewport = () => {
      if (viewport && viewport.height === window.innerHeight) {
        // Keyboard fully closed
        window.scrollTo({ top: 0, behavior: "instant" });
      }
    };

    document.addEventListener("focusout", handleFocusOut);
    viewport?.addEventListener("resize", handleViewport);

    return () => {
      document.removeEventListener("focusout", handleFocusOut);
      viewport?.removeEventListener("resize", handleViewport);
    };
  }, []);
}
