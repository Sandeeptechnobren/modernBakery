import React from 'react';
import { ThemeSwitcher } from '../contexts/themeContext';

const ThemeSwitcherBar = () => (
  <div className="fixed top-4 right-4 z-50">
    <ThemeSwitcher />
  </div>
);

export default ThemeSwitcherBar;
