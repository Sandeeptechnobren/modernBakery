"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../contexts/themeContext';
import Toggle from './toggle';

const defaultColors = [
  'blue', 'red', 'green', 'purple', 'orange', 'teal', 'pink', 'yellow', 'indigo',
];

const colorMap: Record<string, string> = {
  blue: '#3b82f6',
  red: '#ef4444',
  green: '#22c55e',
  purple: '#a21caf',
  orange: '#f59e42',
  teal: '#14b8a6',
  pink: '#ec4899',
  yellow: '#eab308',
  indigo: '#6366f1',
};

const ThemePaletteModal: React.FC = () => {
  const { primaryColor, setPrimaryColor, mode, toggleMode } = useTheme();
  const [open, setOpen] = useState(false);
  const [sidebarType, setSidebarType] = useState<'default' | 'compact'>('default');
  const modalRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut: Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40">
      <div ref={modalRef} className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 min-w-[340px]">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Theme Settings</h2>
        <div className="flex items-center gap-4 mb-4">
          <span className="text-gray-700 dark:text-gray-200 font-medium">Dark Mode:</span>
          <Toggle
            isChecked={mode === 'dark'}
            onChange={toggleMode}
            label={mode === 'dark' ? 'Dark' : 'Light'}
          />
        </div>
        <div className="mb-4">
          <span className="text-gray-700 dark:text-gray-200 font-medium">Sidebar Style:</span>
          <div className="flex gap-2 mt-2">
            <button
              className={`px-3 py-1 rounded border font-medium transition-colors ${sidebarType === 'default' ? 'bg-primary text-white border-primary' : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200'}`}
              onClick={() => setSidebarType('default')}
            >
              Default
            </button>
            <button
              className={`px-3 py-1 rounded border font-medium transition-colors ${sidebarType === 'compact' ? 'bg-primary text-white border-primary' : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200'}`}
              onClick={() => setSidebarType('compact')}
            >
              Compact
            </button>
          </div>
        </div>
        <div className="mb-2">
          <div className="mb-1 text-gray-700 dark:text-gray-200 font-medium">Primary Color:</div>
          <div className="flex flex-wrap gap-3">
            {defaultColors.map((color) => (
              <button
                key={color}
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${primaryColor === color ? 'border-primary ring-2 ring-primary' : 'border-gray-300 dark:border-gray-700'}`}
                style={{ background: colorMap[color] }}
                aria-label={color}
                onClick={() => setPrimaryColor(color as any)}
              >
                {primaryColor === color && (
                  <span className="text-white text-xl">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
        <button
          className="mt-4 px-4 py-2 rounded bg-primary text-white font-medium hover:opacity-90"
          onClick={() => setOpen(false)}
        >
          Close
        </button>
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">Shortcut: Ctrl+K</div>
      </div>
    </div>
  );
};

export default ThemePaletteModal;
