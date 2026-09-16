// src/providers/AppThemeProvider.jsx
'use client';

import { createContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getTheme } from '@/theme/theme';

export const ThemeModeContext = createContext({
  toggleTheme: () => { },
  mode: 'light',
});

export default function AppThemeProvider({ children }) {
  const [mode, setMode] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem('themeMode');
    if (savedMode === 'light' || savedMode === 'dark') {
      setMode(savedMode);
    } else {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setMode(systemPrefersDark ? 'dark' : 'light');
    }
    setMounted(true);
  }, []);

  const toggleTheme = (originX, originY) => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (document.startViewTransition && !prefersReducedMotion) {
      if (typeof originX === 'number' && typeof originY === 'number') {
        document.documentElement.style.setProperty('--theme-toggle-x', `${originX}px`);
        document.documentElement.style.setProperty('--theme-toggle-y', `${originY}px`);
      }
      document.documentElement.classList.add('theme-transitioning');

      const transition = document.startViewTransition(() => {
        setMode(newMode);
        localStorage.setItem('themeMode', newMode);
      });
      transition.finished.finally(() => {
        document.documentElement.classList.remove('theme-transitioning');
      });
    } else {
      setMode(newMode);
      localStorage.setItem('themeMode', newMode);
    }
  };

  const theme = useMemo(() => getTheme(mode), [mode]);

  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <ThemeModeContext.Provider value={{ toggleTheme, mode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}