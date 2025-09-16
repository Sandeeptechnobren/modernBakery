"use client";
import { useContext, useEffect } from "react";
import { SettingsContext } from "../dashboard/contexts";

export function useThemeToggle() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error("useThemeToggle must be used within SettingsContext.Provider");
  }

  const { dispatchSettings, settings } = context;

  useEffect(() => {
    if (typeof window === "undefined") return;
    document.body.classList.remove("layoutTheme", "layoutTheme2");
    document.body.classList.add(settings.theme);
  }, [settings.theme]);

  const toggle = ()=>{
    const newTheme = settings.theme === "layoutTheme2" ? "layoutTheme" : "layoutTheme2";
    localStorage.theme = newTheme;
    dispatchSettings({ type: "themeChange", payload: { theme: newTheme } });
    dispatchSettings({ type: "layoutToggle", payload: { } });
  }

  return { theme: settings.theme, toggle };
}
