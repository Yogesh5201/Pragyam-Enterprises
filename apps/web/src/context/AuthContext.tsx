'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '@pragyam/types';
import { Language, translations } from '../lib/translations';

interface User {
  id: string;
  email: string;
  role: UserRole;
  fullName?: string;
  profile?: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (typeof translations)['en'];
  login: (token: string, user: User) => void;
  logout: () => void;
  quickLoginAs: (role: 'BUYER' | 'SELLER' | 'ADMIN') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    // Read from localStorage on mount
    const savedToken = localStorage.getItem('pragyam_token');
    const savedUser = localStorage.getItem('pragyam_user');
    const savedLang = localStorage.getItem('pragyam_lang') as Language;

    if (savedLang) setLanguage(savedLang);

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('pragyam_token');
        localStorage.removeItem('pragyam_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('pragyam_token', newToken);
    localStorage.setItem('pragyam_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('pragyam_token');
    localStorage.removeItem('pragyam_user');
  };

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('pragyam_lang', lang);
  };

  const quickLoginAs = async (targetRole: 'BUYER' | 'SELLER' | 'ADMIN') => {
    try {
      if (targetRole === 'ADMIN') {
        const res = await fetch('/api/auth/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'admin@pragyam.com',
            password: 'Pragyam@Admin2026!',
            mfaCode: '123456',
          }),
        });
        const data = await res.json();
        if (data.success) {
          login(data.token, data.user);
        }
      } else if (targetRole === 'BUYER') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'exports@royalfeast.com',
            password: 'Pragyam@2026',
          }),
        });
        const data = await res.json();
        if (data.success) {
          login(data.token, data.user);
        }
      } else {
        // SELLER
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'taraori@mills.com',
            password: 'Pragyam@2026',
          }),
        });
        const data = await res.json();
        if (data.success) {
          login(data.token, data.user);
        }
      }
    } catch (e) {
      console.error('Quick login failed', e);
    }
  };

  const t = translations[language];

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        isAuthenticated: !!user && !!token,
        isLoading,
        language,
        setLanguage: changeLanguage,
        t,
        login,
        logout,
        quickLoginAs,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
