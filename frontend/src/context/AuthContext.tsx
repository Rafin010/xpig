'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

type AuthUser = {
  id?: number;
  name: string;
  email: string;
  picture: string;
  sub: string;
  is_superuser?: boolean;
};

type AuthContextType = {
  user: AuthUser | null;
  login: (profile: AuthUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isInitializing: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('xpig_user');
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch {}
    }
    setIsInitializing(false);
  }, []);

  const login = (profile: AuthUser) => {
    setUser(profile);
    localStorage.setItem('xpig_user', JSON.stringify(profile));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('xpig_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isInitializing }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
