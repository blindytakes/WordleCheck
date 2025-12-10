/**
 * DARK MODE HOOK
 *
 * Manages dark mode state and persists it to localStorage.
 * Automatically applies/removes the 'dark' class on the document element.
 *
 * Features:
 * - Persists preference to localStorage
 * - Applies 'dark' class to document element
 * - Returns [isDark, toggleDarkMode] tuple
 *
 * Usage:
 * const [isDark, toggleDarkMode] = useDarkMode();
 */

import { useState, useEffect } from 'react';

export default function useDarkMode() {
  // Initialize from localStorage, default to false (light mode)
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });

  // Apply dark mode class to document element and save to localStorage
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDark]);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
  };

  return [isDark, toggleDarkMode];
}
