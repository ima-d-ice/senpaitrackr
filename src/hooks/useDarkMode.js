// src/hooks/useDarkMode.js
import { useState, useEffect } from 'react';

export function useDarkMode() {
  const [mode, setMode] = useState(() => {
    // 1. Check localStorage
    const stored = localStorage.getItem('theme');
    if (stored) return stored;
    // 2. Fallback to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  // Apply class to <html> and persist
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(mode === 'dark' ? 'light' : 'dark');
    root.classList.add(mode);
    localStorage.setItem('theme', mode);
  }, [mode]);

  // Toggle function
  const toggle = () => setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));

  return [mode, toggle];
}
