'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemePreference } from '@/types/user';

export interface User {
  id: string;
  name: string;
  email: string;
  country?: string;
  profession?: string;
  theme_preference?: ThemePreference;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isAuthModalOpen: boolean;
  login: (user: User) => void;
  loginDemoUser: () => void;
  logout: () => void;
  updateProfile: (fields: Partial<Omit<User, 'id' | 'email'>>) => Promise<void>;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = 'tx_expliner_user_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.warn('Failed to load user session from localStorage', e);
    }
  }, []);

  const login = (newUser: User) => {
    setUser(newUser);
    try {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(newUser));
    } catch (e) {
      console.warn('Failed to save user session', e);
    }
    setIsAuthModalOpen(false);
  };

  const loginDemoUser = () => {
    const demoUser: User = {
      id: 'demo_user_2026',
      name: 'Demo Budget Analyst',
      email: 'demo.analyst@fiscalquant.org',
      country: 'India',
      profession: 'Senior Economic Analyst',
      theme_preference: 'dark',
    };
    login(demoUser);
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    } catch (e) {
      console.warn('Failed to clear user session', e);
    }
  };

  const updateProfile = async (fields: Partial<Omit<User, 'id' | 'email'>>) => {
    if (!user) return;
    const updatedUser = { ...user, ...fields };
    setUser(updatedUser);
    try {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updatedUser));
    } catch (e) {
      console.warn('Failed to update local user session', e);
    }

    // Call backend API if online
    try {
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, ...fields }),
      });
    } catch (e) {
      console.warn('Failed to sync profile update to backend', e);
    }
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isAuthModalOpen,
        login,
        loginDemoUser,
        logout,
        updateProfile,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

