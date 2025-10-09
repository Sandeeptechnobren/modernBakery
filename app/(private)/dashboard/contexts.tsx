"use client";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export type ThemeName = "layoutTheme" | "layoutTheme2";

interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = "theme";
const DEFAULT_THEME: ThemeName = "layoutTheme";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    try {
      if (typeof window === "undefined") return DEFAULT_THEME;
      const stored = localStorage.getItem(STORAGE_KEY) as ThemeName | null;
      return (stored ?? DEFAULT_THEME) as ThemeName;
    } catch {
      return DEFAULT_THEME;
    }
  });

  // keep body class and localStorage in sync
  useEffect(() => {
    if (typeof window === "undefined") return;
    document.body.classList.remove("layoutTheme", "layoutTheme2");
    document.body.classList.add(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore storage errors */
    }
  }, [theme]);

  const setTheme = useCallback((t: ThemeName) => {
    setThemeState(t);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "layoutTheme2" ? "layoutTheme" : "layoutTheme2"));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  toggleTheme: () => void;
} {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}