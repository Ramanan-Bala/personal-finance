"use client";

import { useAuth } from "@/shared/providers/auth-provider";
import { createContext, useContext, useEffect, useState } from "react";

type FontFamily =
  | "source-sans"
  | "inter"
  | "roboto"
  | "poppins"
  | "open-sans"
  | "system";

interface FontContextType {
  font: FontFamily;
  setFont: (font: FontFamily) => void;
}

const FontContext = createContext<FontContextType | undefined>(undefined);

// Map font names from backend to font IDs
const getFontId = (fontName?: string): FontFamily => {
  const fontIdMap: Record<string, FontFamily> = {
    "Source Sans 3": "source-sans",
    Inter: "inter",
    Roboto: "roboto",
    Poppins: "poppins",
    "Open Sans": "open-sans",
    System: "system",
  };
  return fontIdMap[fontName || ""] || "source-sans";
};

export function FontProvider({
  children,
  initialFont = "source-sans",
}: {
  children: React.ReactNode;
  initialFont?: FontFamily;
}) {
  const { user } = useAuth();
  const [font, setFontState] = useState<FontFamily>(initialFont);

  useEffect(() => {
    // Priority 1: Load from user auth state
    if (user?.fontFamily) {
      const fontId = getFontId(user.fontFamily);
      setFontState(fontId);
      document.documentElement.setAttribute("data-font", fontId);
      return;
    }

    // Priority 2: Load from localStorage
    const savedFont = localStorage.getItem("font-family") as FontFamily;
    if (savedFont) {
      setFontState(savedFont);
      document.documentElement.setAttribute("data-font", savedFont);
    }
  }, [user?.fontFamily]);

  const setFont = (newFont: FontFamily) => {
    setFontState(newFont);
    localStorage.setItem("font-family", newFont);
    document.documentElement.setAttribute("data-font", newFont);

    // Save to backend with proper font name mapping
    saveToBackend(newFont);
  };

  // Map font IDs to actual font names for backend
  const getFontName = (fontId: FontFamily): string => {
    const fontMap: Record<FontFamily, string> = {
      "source-sans": "Source Sans 3",
      inter: "Inter",
      roboto: "Roboto",
      poppins: "Poppins",
      "open-sans": "Open Sans",
      system: "System",
    };
    return fontMap[fontId];
  };

  const saveToBackend = async (fontId: FontFamily) => {
    try {
      const fontName = getFontName(fontId);
      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/users/profile`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ fontFamily: fontName }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to save font preference");
      }
    } catch (error) {
      console.error("Failed to save font preference:", error);
    }
  };

  return (
    <FontContext.Provider value={{ font, setFont }}>
      {children}
    </FontContext.Provider>
  );
}

export function useFont() {
  const context = useContext(FontContext);
  if (!context) {
    throw new Error("useFont must be used within FontProvider");
  }
  return context;
}
