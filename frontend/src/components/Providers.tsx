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
      }).catch(err => console.error('Tracker error:', err));
    };
    
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
