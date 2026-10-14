'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from '@/context/AuthContext';
import { useEffect } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  
  useEffect(() => {
    // Analytics Tracker
    let sessionId = localStorage.getItem('xpig_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      localStorage.setItem('xpig_session_id', sessionId);
    }
    
    const ping = () => {
      fetch('https://xpig.onrender.com/api/v1/analytics/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId })
      }).catch(() => {});
    };
    
    // Telegram Daily Quota Unlock via website visit
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const tgUnlock = searchParams.get('tg_unlock');
      if (tgUnlock) {
        const tgId = parseInt(tgUnlock, 10);
        if (!isNaN(tgId) && tgId > 0) {
          fetch('https://xpig.onrender.com/api/v1/links/unlock-quota', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegram_id: tgId })
          }).catch(() => {});
        }
      }
    } catch (_) {}

    ping(); // Immediate ping on load
    const interval = setInterval(ping, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <GoogleOAuthProvider clientId="26352619743-nsvioecoa35l16npela9u6n5u207elln.apps.googleusercontent.com">
      <AuthProvider>
        {children}
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
