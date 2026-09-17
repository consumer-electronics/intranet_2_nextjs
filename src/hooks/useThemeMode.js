'use client';

import { useContext } from 'react';
import { ThemeModeContext } from '@/providers/AppThemeProvider';

export const useThemeMode = () => {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within an AppThemeProvider');
  }
  return context;
};
