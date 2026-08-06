'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemePreference } from '@/types/user';

interface ThemeContextType {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const LOCAL_STORAGE_THEME_KEY = 'theme_preference';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemePreference>('dark');

  // Read initial theme preference on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(LOCAL_STORAGE_THEME_KEY) as ThemePreference | null;
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setThemeState(savedTheme);
        applyThemeToDOM(savedTheme);
      } else {
        const initialTheme: ThemePreference = 'dark';
        setThemeState(initialTheme);
        applyThemeToDOM(initialTheme);
      }
    } catch (e) {
      console.warn('Failed to read theme preference from localStorage', e);
    }
  }, []);

  const applyThemeToDOM = (newTheme: ThemePreference) => {
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
  };

  const setTheme = (newTheme: ThemePreference) => {
    setThemeState(newTheme);
    applyThemeToDOM(newTheme);

    try {
      localStorage.setItem(LOCAL_STORAGE_THEME_KEY, newTheme);
    } catch (e) {
      console.warn('Failed to save theme to localStorage', e);
    }
  };

  const toggleTheme = () => {
    const nextTheme: ThemePreference = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
