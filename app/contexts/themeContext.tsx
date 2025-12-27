"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the available themes and primary colors
const defaultColors = [
  'blue', 'red', 'green', 'purple', 'orange', 'teal', 'pink', 'yellow', 'indigo',
];

export type ThemeMode = 'light' | 'dark';
export type PrimaryColor = typeof defaultColors[number];

interface ThemeContextType {
  mode: ThemeMode;
  primaryColor: PrimaryColor;
  setMode: (mode: ThemeMode) => void;
  setPrimaryColor: (color: PrimaryColor) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [mode, setMode] = useState<ThemeMode>('light');
  const [primaryColor, setPrimaryColor] = useState<PrimaryColor>('blue');

  // Update Tailwind dark mode class on <html>
  React.useEffect(() => {
    const root = window.document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [mode]);

  // Update primary color as a CSS variable
  React.useEffect(() => {
    const root = window.document.documentElement;
    root.style.setProperty('--primary-color', primaryColor);
  }, [primaryColor]);

  const toggleMode = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ mode, primaryColor, setMode, setPrimaryColor, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// ThemeSwitcher component for toggling mode and selecting color
export const ThemeSwitcher = () => {
  const { mode, primaryColor, setPrimaryColor, toggleMode } = useTheme();
  return (
    <div className="flex items-center gap-4 p-2">
      <button
        className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
        onClick={toggleMode}
      >
        {mode === 'light' ? 'Switch to Dark' : 'Switch to Light'}
      </button>
      <select
        className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600"
        value={primaryColor}
        onChange={(e) => setPrimaryColor(e.target.value as PrimaryColor)}
      >
        {defaultColors.map((color) => (
          <option key={color} value={color}>{color.charAt(0).toUpperCase() + color.slice(1)}</option>
        ))}
      </select>
    </div>
  );
};
