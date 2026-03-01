"use client";
import { useEffect } from "react";

export function useKeyboardFix() {
  useEffect(() => {
    const root = document.documentElement;
    const viewport = window.visualViewport;
    let baselineViewportHeight = viewport?.height ?? window.innerHeight;

    const isEditableElement = (el: Element | null) => {
      if (!(el instanceof HTMLElement)) return false;
      if (el.isContentEditable) return true;
      if (el.tagName === "TEXTAREA") return true;
      if (el.tagName !== "INPUT") return false;

      const input = el as HTMLInputElement;
      const nonTextTypes = new Set([
        "button",
        "checkbox",
        "color",
        "file",
        "hidden",
        "image",
        "radio",
        "range",
        "reset",
        "submit",
      ]);

      return !nonTextTypes.has(input.type);
    };

    let hasFocusedEditable = isEditableElement(document.activeElement);

    const updateViewportState = () => {
      const currentHeight = viewport?.height ?? window.innerHeight;
      baselineViewportHeight = Math.max(baselineViewportHeight, currentHeight);

      const viewportSuggestsKeyboard =
        baselineViewportHeight - currentHeight > 120;
      const keyboardOpen = hasFocusedEditable || viewportSuggestsKeyboard;

      root.style.setProperty("--app-vh", `${currentHeight}px`);
      root.classList.toggle("keyboard-open", keyboardOpen);
    };

    const resetBaseline = () => {
      baselineViewportHeight = viewport?.height ?? window.innerHeight;
      updateViewportState();
    };

    const onFocusIn = (event: FocusEvent) => {
      hasFocusedEditable = isEditableElement(event.target as Element);
      updateViewportState();
    };

    const onFocusOut = () => {
      requestAnimationFrame(() => {
        hasFocusedEditable = isEditableElement(document.activeElement);
        updateViewportState();
      });
    };

    updateViewportState();

    viewport?.addEventListener("resize", updateViewportState);
    viewport?.addEventListener("scroll", updateViewportState);
    window.addEventListener("orientationchange", resetBaseline);
    window.addEventListener("pageshow", resetBaseline);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);

    return () => {
      root.classList.remove("keyboard-open");
      viewport?.removeEventListener("resize", updateViewportState);
      viewport?.removeEventListener("scroll", updateViewportState);
      window.removeEventListener("orientationchange", resetBaseline);
      window.removeEventListener("pageshow", resetBaseline);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);
}
