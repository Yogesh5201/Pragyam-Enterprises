import React, { createContext, useContext, useState } from 'react';
import { UserRole } from '@pragyam/types';

export type MobileRole = 'BUYER' | 'SELLER';
export type MobileLanguage = 'en' | 'hi';

interface MobileAuthContextType {
  role: MobileRole;
  setRole: (role: MobileRole) => void;
  language: MobileLanguage;
  setLanguage: (lang: MobileLanguage) => void;
  isAuthenticated: boolean;
  login: (role: MobileRole) => void;
  logout: () => void;
  companyName: string;
}

const MobileAuthContext = createContext<MobileAuthContextType | undefined>(undefined);

export function MobileAuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<MobileRole>('BUYER');
  const [language, setLanguage] = useState<MobileLanguage>('en');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // Pre-authenticated for direct testing
  const [companyName, setCompanyName] = useState<string>('Royal Feast Global Exporters');

  const login = (newRole: MobileRole) => {
    setRole(newRole);
    setIsAuthenticated(true);
    setCompanyName(newRole === 'BUYER' ? 'Royal Feast Global Exporters' : 'Taraori Golden Rice Mills');
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <MobileAuthContext.Provider
      value={{
        role,
        setRole,
        language,
        setLanguage,
        isAuthenticated,
        login,
        logout,
        companyName,
      }}
    >
      {children}
    </MobileAuthContext.Provider>
  );
}

export function useMobileAuth() {
  const context = useContext(MobileAuthContext);
  if (!context) throw new Error('useMobileAuth must be used within MobileAuthProvider');
  return context;
}
