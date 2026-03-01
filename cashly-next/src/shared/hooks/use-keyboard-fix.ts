"use client";
import { useEffect } from "react";

export function useKeyboardFix() {
  useEffect(() => {
    const root = document.documentElement;
    const viewport = window.visualViewport;
    let baselineViewportHeight = viewport?.height ?? window.innerHeight;

    const updateViewportState = () => {
      const currentHeight = viewport?.height ?? window.innerHeight;
      baselineViewportHeight = Math.max(baselineViewportHeight, currentHeight);

      const keyboardOpen = baselineViewportHeight - currentHeight > 120;

      root.style.setProperty("--app-vh", `${currentHeight}px`);
      root.classList.toggle("keyboard-open", keyboardOpen);
    };

    const resetBaseline = () => {
      baselineViewportHeight = viewport?.height ?? window.innerHeight;
      updateViewportState();
    };

    updateViewportState();

    viewport?.addEventListener("resize", updateViewportState);
    viewport?.addEventListener("scroll", updateViewportState);
    window.addEventListener("orientationchange", resetBaseline);
    window.addEventListener("pageshow", resetBaseline);

    return () => {
      root.classList.remove("keyboard-open");
      viewport?.removeEventListener("resize", updateViewportState);
      viewport?.removeEventListener("scroll", updateViewportState);
      window.removeEventListener("orientationchange", resetBaseline);
      window.removeEventListener("pageshow", resetBaseline);
    };
  }, []);
}
