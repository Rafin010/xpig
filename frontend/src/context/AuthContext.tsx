'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';

type AuthUser = {
  id?: number;
  name: string;
  email: string;
  picture: string;
  sub: string;
  is_superuser?: boolean;
  is_cofounder?: boolean;
};

type AuthContextType = {
  user: AuthUser | null;
  login: (profile: AuthUser) => void;
  loginWithGoogle: () => void;
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
    localStorage.removeItem('xpig_admin_session');
    localStorage.removeItem('xpig_admin_role');
    localStorage.removeItem('xpig_admin_user');
    document.cookie = 'xpig_admin_session=; path=/; max-age=0';
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await res.json();
        
        // Sync with backend
        const backendRes = await fetch('https://xpig.onrender.com/api/v1/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_token: tokenResponse.access_token,
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture,
          })
        });
        const backendData = await backendRes.json();
        const bUser = backendData.user || backendData;

        login({
          id: bUser.id,
          name: userInfo.name,
          email: userInfo.email,
          picture: userInfo.picture,
          sub: userInfo.sub || '',
          is_superuser: bUser.is_superuser,
          is_cofounder: bUser.is_cofounder
        });

        // Grant Co-Founder or Admin panel access seamlessly
        if (bUser.is_cofounder || bUser.is_superuser) {
          const adminRole = bUser.is_superuser ? 'superuser' : 'cofounder';
          document.cookie = 'xpig_admin_session=authenticated_admin; path=/; max-age=2592000; SameSite=Lax';
          localStorage.setItem('xpig_admin_session', 'authenticated_admin');
          localStorage.setItem('xpig_admin_role', adminRole);
          localStorage.setItem('xpig_admin_user', JSON.stringify({
            id: bUser.id,
            email: userInfo.email,
            username: bUser.username || userInfo.name,
            picture: userInfo.picture || bUser.avatar_url || null,
            avatar_url: userInfo.picture || bUser.avatar_url || null,
            role: adminRole,
            is_cofounder: bUser.is_cofounder,
            is_superuser: bUser.is_superuser,
          }));
        }
      } catch (err) {
        console.error('Google login failed', err);
      }
    }
  });

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, logout, isAuthenticated: !!user, isInitializing }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
