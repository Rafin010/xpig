'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from '@/context/AuthContext';
import { useEffect } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://xpig.onrender.com';

function getOrSetTrackerCookie(): string {
  if (typeof document === 'undefined') return '';
  // Check document.cookie
  const match = document.cookie.match(/(^|;\s*)xpig_tracker_cookie=([^;]+)/);
  let cookieVal = match ? match[2] : null;

  // Fallback to localStorage if cookie lost or vice versa
  if (!cookieVal) {
    try {
      cookieVal = localStorage.getItem('xpig_tracker_cookie');
    } catch (_) {}
  }

  if (!cookieVal) {
    cookieVal = 'xpig_trk_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
  }

  // Set 365 days persistent cookie
  try {
    document.cookie = `xpig_tracker_cookie=${cookieVal}; path=/; max-age=31536000; SameSite=Lax`;
    localStorage.setItem('xpig_tracker_cookie', cookieVal);
  } catch (_) {}

  return cookieVal;
}

// ── Accurate Hardware Device Name Parser ──
function parseExactDeviceName(ua: string): string {
  // 1. Samsung Devices (Match SM- or Galaxy)
  const smMatch = ua.match(/SM-([A-Z0-9]+)/i);
  if (smMatch) {
    const model = smMatch[1].toUpperCase();
    if (model.startsWith('S92') || model.startsWith('S91') || model.startsWith('S90')) return `Samsung Galaxy S-Series (SM-${model})`;
    if (model.startsWith('A') || model.startsWith('M') || model.startsWith('F')) return `Samsung Galaxy ${model.charAt(0)}-Series (SM-${model})`;
    if (model.startsWith('Z')) return `Samsung Galaxy Z Fold/Flip (SM-${model})`;
    return `Samsung Galaxy (SM-${model})`;
  }
  if (/SamsungBrowser/i.test(ua) || /Samsung/i.test(ua)) {
    return 'Samsung Galaxy Device';
  }

  // 2. Apple Devices
  if (/iPhone/i.test(ua)) {
    const iosMatch = ua.match(/OS (\d+)[_\d]*/i);
    const iosVer = iosMatch ? ` (iOS ${iosMatch[1]})` : ' (iOS)';
    return `Apple iPhone${iosVer}`;
  }
  if (/iPad/i.test(ua)) {
    return 'Apple iPad (iPadOS)';
  }

  // 3. Google Pixel
  const pixelMatch = ua.match(/Pixel\s?([0-9a-zA-Z\s]+?)(?:Build|\)|;)/i);
  if (pixelMatch) {
    return `Google Pixel ${pixelMatch[1].trim()}`;
  }
  if (/Pixel/i.test(ua)) {
    return 'Google Pixel (Android)';
  }

  // 4. Xiaomi / Redmi / POCO
  const redmiMatch = ua.match(/(Redmi[^\);]+|POCO[^\);]+|Mi\s[^\);]+)/i);
  if (redmiMatch) {
    return `${redmiMatch[1].trim()} (Android)`;
  }
  if (/Xiaomi/i.test(ua)) {
    return 'Xiaomi Device (MIUI)';
  }

  // 5. OnePlus / Vivo / Oppo / Realme / Motorola
  const onePlusMatch = ua.match(/(OnePlus[^\);]+)/i);
  if (onePlusMatch) return `${onePlusMatch[1].trim()}`;
  
  const vivoMatch = ua.match(/(vivo[^\);]+|V2\d{3}[^\);]*)/i);
  if (vivoMatch) return `Vivo ${vivoMatch[1].trim()}`;

  const oppoMatch = ua.match(/(CPH\d{4}|OPPO[^\);]+)/i);
  if (oppoMatch) return `Oppo ${oppoMatch[1].trim()}`;

  const realmeMatch = ua.match(/(RMX\d{4}|realme[^\);]+)/i);
  if (realmeMatch) return `Realme ${realmeMatch[1].trim()}`;

  const motoMatch = ua.match(/(Moto[^\);]+|motorola[^\);]+)/i);
  if (motoMatch) return `${motoMatch[1].trim()}`;

  // 6. Generic Android mobile with brand/hardware token
  if (/Android/i.test(ua)) {
    const tokenMatch = ua.match(/;\s*([A-Za-z0-9\s_-]{3,20})\s+Build/i);
    if (tokenMatch && !tokenMatch[1].includes('Android')) {
      return `${tokenMatch[1].trim()} (Android)`;
    }
    return 'Android Mobile Device';
  }

  // 7. Desktop Computers
  if (/Windows NT 10.0/i.test(ua)) {
    const is64 = /WOW64|Win64|x64/i.test(ua);
    return is64 ? 'Windows 11 / 10 PC (64-bit)' : 'Windows 11 / 10 PC';
  }
  if (/Windows NT 6.3/i.test(ua)) return 'Windows 8.1 PC';
  if (/Windows NT 6.1/i.test(ua)) return 'Windows 7 PC';
  if (/Windows NT/i.test(ua)) return 'Windows PC';
  if (/Macintosh|Mac OS X/i.test(ua)) return 'Apple Mac (macOS)';
  if (/Linux/i.test(ua)) return 'Linux Workstation';
  if (/CrOS/i.test(ua)) return 'Google Chromebook (ChromeOS)';

  return 'Desktop Computer';
}

export function Providers({ children }: { children: React.ReactNode }) {
  
  useEffect(() => {
    // ── Persistent 1-Year Tracker Cookie ──
    const trackerCookie = getOrSetTrackerCookie();

    // ── Analytics Tracker Session ──
    let sessionId = localStorage.getItem('xpig_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      localStorage.setItem('xpig_session_id', sessionId);
    }

    // ── Hardware, Browser & OS Profiling ──
    const ua = navigator.userAgent || '';

    const detectDevice = (): string => {
      if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
      if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry/i.test(ua)) return 'mobile';
      return 'desktop';
    };

    const detectBrowser = (): string => {
      if (ua.includes('SamsungBrowser')) return 'Samsung Internet';
      if (ua.includes('OPR') || ua.includes('Opera')) return 'Opera';
      if (ua.includes('Edg')) return 'Edge';
      if (ua.includes('Firefox')) return 'Firefox';
      if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
      if (ua.includes('Chrome')) return 'Chrome';
      return 'Browser';
    };

    const detectOS = (): string => {
      if (/android/i.test(ua)) return 'Android';
      if (/iPad|iPhone|iPod/.test(ua)) return 'iOS';
      if (/Windows/.test(ua)) return 'Windows';
      if (/Mac OS/.test(ua)) return 'macOS';
      if (/Linux/.test(ua)) return 'Linux';
      return 'OS';
    };

    const detectSource = (): string => {
      const ref = document.referrer || '';
      const params = new URLSearchParams(window.location.search);
      if (params.get('tg_unlock') || params.get('utm_source') === 'telegram' || ref.includes('t.me')) return 'telegram';
      if (ref.includes('google.')) return 'google';
      if (ref.includes('facebook.') || ref.includes('fb.')) return 'facebook';
      if (ref.includes('twitter.') || ref.includes('x.com')) return 'twitter';
      if (ref.includes('youtube.')) return 'youtube';
      if (ref === '' || ref.includes(window.location.hostname)) return 'direct';
      return 'other';
    };

    let cachedDeviceName = parseExactDeviceName(ua);

    // Try modern UserAgentData High Entropy API for exact hardware model if available
    if (typeof navigator !== 'undefined' && (navigator as any).userAgentData?.getHighEntropyValues) {
      (navigator as any).userAgentData.getHighEntropyValues(['model', 'platform', 'platformVersion'])
        .then((hints: any) => {
          if (hints?.model && hints.model.trim()) {
            const m = hints.model.trim();
            if (m.startsWith('SM-')) cachedDeviceName = `Samsung Galaxy (${m})`;
            else if (m.includes('Pixel')) cachedDeviceName = `Google Pixel ${m}`;
            else cachedDeviceName = `${m} (${hints.platform || 'Android'})`;
          }
        })
        .catch(() => {});
    }

    // ── User & Co-Founder Identity Extraction ──
    const getUserIdentity = (): { userId?: number; userEmail?: string } => {
      try {
        // 1. Check admin user (co-founders or superadmins inside or outside /admin)
        const storedAdmin = localStorage.getItem('xpig_admin_user');
        if (storedAdmin) {
          const parsedAdmin = JSON.parse(storedAdmin);
          if (parsedAdmin && (parsedAdmin.id || parsedAdmin.email)) {
            return {
              userId: parsedAdmin.id ? Number(parsedAdmin.id) : undefined,
              userEmail: parsedAdmin.email ? String(parsedAdmin.email).trim().toLowerCase() : undefined,
            };
          }
        }
        // 2. Check regular logged-in user
        const storedUser = localStorage.getItem('xpig_user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser && (parsedUser.id || parsedUser.email)) {
            return {
              userId: parsedUser.id ? Number(parsedUser.id) : undefined,
              userEmail: parsedUser.email ? String(parsedUser.email).trim().toLowerCase() : undefined,
            };
          }
        }
      } catch (_) {}
      return {};
    };

    // ── Global Real-Time Click Activity Tracking ──
    let pendingClicks = 0;
    let clickDebounceTimer: any = null;

    const ping = () => {
      const clicksToSend = pendingClicks;
      pendingClicks = 0; // reset buffer

      const identity = getUserIdentity();

      fetch(`${API_BASE}/api/v1/analytics/ping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          current_page: window.location.pathname,
          device_type: detectDevice(),
          device_name: cachedDeviceName,
          browser: detectBrowser(),
          os_name: detectOS(),
          referrer_source: detectSource(),
          cookie_tracker_id: trackerCookie,
          user_id: identity.userId,
          user_email: identity.userEmail,
          clicks: clicksToSend,
        })
      }).catch(() => {});
    };

    const handleClick = () => {
      pendingClicks += 1;
      clearTimeout(clickDebounceTimer);
      // Fast real-time sync: flush clicks within 1.2 seconds of interaction
      if (pendingClicks >= 3) {
        ping(); // Immediate flush on multiple clicks
      } else {
        clickDebounceTimer = setTimeout(() => {
          ping();
        }, 1200);
      }
    };

    document.addEventListener('click', handleClick, { passive: true });

    // Send remaining clicks on page unload/hide
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && pendingClicks > 0) {
        ping();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Telegram Daily Quota Unlock via website visit
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const tgUnlock = searchParams.get('tg_unlock');
      if (tgUnlock) {
        const tgId = parseInt(tgUnlock, 10);
        if (!isNaN(tgId) && tgId > 0) {
          fetch(`${API_BASE}/api/v1/links/unlock-quota`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegram_id: tgId })
          }).catch(() => {});
        }
      }
    } catch (_) {}

    ping(); // Immediate initial heartbeat
    const interval = setInterval(ping, 15000); // Heartbeat every 15 seconds for live real-time presence

    return () => {
      clearInterval(interval);
      clearTimeout(clickDebounceTimer);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <GoogleOAuthProvider clientId="26352619743-nsvioecoa35l16npela9u6n5u207elln.apps.googleusercontent.com">
      <AuthProvider>
        {children}
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
