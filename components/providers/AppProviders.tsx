'use client';

import React from 'react';
import { AuthProvider } from './AuthProvider';
import { BookmarkProvider } from './BookmarkProvider';
import { ThemeProvider } from './ThemeProvider';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BookmarkProvider>{children}</BookmarkProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

