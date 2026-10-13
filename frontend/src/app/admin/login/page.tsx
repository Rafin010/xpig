'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGoogleLogin } from '@react-oauth/google';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  MapPin, 
  Scale, 
  ShieldAlert, 
  KeyRound, 
  Users2,
  Clock
} from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();

  // Mode: 'team' (default Google Sign-In with Geolocation) or 'master' (email/password)
  const [authMode, setAuthMode] = useState<'team' | 'master'>('team');

  // Master Admin States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lockout States (3 attempts -> 60s cooldown)
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Team Google Login States
  const [isVerifyingGoogle, setIsVerifyingGoogle] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  // Initialize lockout from localStorage
  useEffect(() => {
    try {
      const lockUntil = Number(localStorage.getItem('xpig_admin_lockout_until') || '0');
      const now = Date.now();
      if (lockUntil > now) {
        setLockoutSeconds(Math.ceil((lockUntil - now) / 1000));
      }
    } catch {}
  }, []);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          localStorage.removeItem('xpig_admin_lockout_until');
          setFailedAttempts(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  // Handle Master Admin Email/Password Login
  const handleMasterLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSeconds > 0) return;

    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.locked) {
          const secs = data.remainingSeconds || 60;
          setLockoutSeconds(secs);
          localStorage.setItem('xpig_admin_lockout_until', String(Date.now() + secs * 1000));
          throw new Error('নিরাপত্তা লক: ৩ বার ভুল চেষ্টা করায় অ্যাকাউন্ট ৬০ সেকেন্ডের জন্য ব্লক করা হয়েছে।');
        }

        const newFails = (failedAttempts + 1);
        setFailedAttempts(newFails);
        if (newFails >= 3) {
          setLockoutSeconds(60);
          localStorage.setItem('xpig_admin_lockout_until', String(Date.now() + 60000));
          throw new Error('নিরাপত্তা লক: ৩ বার ভুল চেষ্টা করায় ফর্ম ৬০ সেকেন্ডের জন্য ব্লক করা হয়েছে।');
        }

        throw new Error(data.message || `ভুল ইমেইল বা পাসওয়ার্ড। অবশিষ্ট সুযোগ: ${3 - newFails} বার`);
      }

      // Success
      setFailedAttempts(0);
      localStorage.removeItem('xpig_admin_lockout_until');

      if (typeof window !== 'undefined') {
        document.cookie = 'xpig_admin_session=authenticated_admin; path=/; max-age=2592000; SameSite=Lax';
        localStorage.setItem('xpig_admin_session', 'authenticated_admin');
        localStorage.setItem('xpig_admin_role', 'superuser');
      }

      window.location.href = '/admin';
    } catch (err: any) {
      setError(err.message || 'অথেন্টিকেশন ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  // Obtain mandatory GPS Geolocation
  const getDeviceLocation = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('আপনার ব্রাউজারে জিপিএস বা লোকেশন ট্র্যাকিং সুবিধা নেই।'));
        return;
      }
      setLocationStatus('জিপিএস লোকেশন সনাক্ত করা হচ্ছে...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationStatus(null);
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          setLocationStatus(null);
          let msg = 'নিরাপত্তা প্রটোকল: সিস্টেমে প্রবেশ করতে আপনার বর্তমান ম্যাপ লোকেশন অনুমোদন করা বাধ্যতামূলক।';
          if (error.code === error.PERMISSION_DENIED) {
            msg = 'লোকেশন অনুমোদন বাতিল করা হয়েছে! নিরাপত্তা নিয়মানুযায়ী ম্যাপ লোকেশন ছাড়া এই পোর্টালে প্রবেশ নিষিদ্ধ। ব্রাউজার পারমিশন থেকে লোকেশন Allow করুন।';
          }
          reject(new Error(msg));
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    });
  };

  // Google Login for Co-Founders & Team Members
  const triggerGoogleAuth = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsVerifyingGoogle(true);
      setError(null);

      try {
        // 1. Geolocation verification (graceful fallback)
        let location = { latitude: null as number | null, longitude: null as number | null };
        try {
          location = await getDeviceLocation();
        } catch (locErr) {
          console.warn('Geolocation detection skipped or denied:', locErr);
        }

        // 2. Verify with backend admin auth endpoint
        const res = await fetch('https://xpig.onrender.com/api/v1/auth/admin/google-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_token: tokenResponse.access_token,
            latitude: location.latitude,
            longitude: location.longitude,
          }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.detail || 'অননুমোদিত প্রবেশাধিকার। শুধুমাত্র অনুমোদিত কো-ফাউন্ডাররা প্রবেশ করতে পারবেন।');
        }

        // Set persistent session cookies and role
        document.cookie = 'xpig_admin_session=authenticated_admin; path=/; max-age=2592000; SameSite=Lax';
        localStorage.setItem('xpig_admin_session', 'authenticated_admin');
        localStorage.setItem('xpig_admin_role', data.user.role || 'cofounder');
        localStorage.setItem('xpig_admin_user', JSON.stringify(data.user));

        window.location.href = '/admin';
      } catch (err: any) {
        setError(err.message || 'গুগল অথেন্টিকেশন ব্যর্থ হয়েছে।');
      } finally {
        setIsVerifyingGoogle(false);
      }
    },
    onError: () => {
      setError('গুগল লগইন উইন্ডো বন্ধ করা হয়েছে বা ব্যর্থ হয়েছে।');
      setIsVerifyingGoogle(false);
    },
  });

  return (
    <div className="min-h-screen bg-[#070707] text-white flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-zinc-800/20 via-zinc-900/10 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-zinc-800/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-lg relative z-10">
        <div className="bg-[#111113]/95 border border-zinc-800/80 shadow-[0_20px_70px_rgba(0,0,0,0.9)] backdrop-blur-2xl rounded-3xl p-7 sm:p-10 transition-all">
          
          {/* Logo & Security Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative mb-4 group">
              <div className="w-16 h-16 bg-[#18181b] border border-zinc-700/60 rounded-2xl flex items-center justify-center p-2.5 shadow-2xl">
                <Image
                  src="/pig-logo.png"
                  alt="XPIG Logo"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-full text-[11px] font-semibold text-zinc-300 mb-2.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Restricted Management Portal</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              XPIG <span className="text-zinc-300">Admin Control</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Authorized Infrastructure & Core Operations
            </p>
          </div>

          {/* Error Alert Box */}
          {error && (
            <div className="mb-6 p-4 bg-red-950/40 border border-red-500/40 rounded-2xl flex items-start gap-3 text-red-300 text-xs sm:text-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{error}</div>
            </div>
          )}

          {/* Location status pill */}
          {locationStatus && (
            <div className="mb-6 p-3 bg-blue-950/40 border border-blue-500/40 rounded-xl flex items-center gap-2.5 text-blue-300 text-xs animate-pulse">
              <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
              <span>{locationStatus}</span>
            </div>
          )}

          {/* VIEW 1: Team & Co-Founder Google Access (Default) */}
          {authMode === 'team' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Legal Warning Notice Box */}
              <div className="bg-red-950/20 border border-red-900/40 rounded-2xl p-4.5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <span>আইনি ও নিরাপত্তা সতর্কবার্তা</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  এই ডোমেইনে শুধুমাত্র প্ল্যাটফর্মের অনুমোদিত <strong>কো-ফাউন্ডার ও টিম মেম্বাররা</strong> প্রবেশ করতে পারবেন। সিস্টেমে প্রবেশের সময় জিপিএস ম্যাপ লোকেশন ও আইপি রেকর্ড করা হয়। অননুমোদিত ব্যক্তি কর্তৃক অনধিকার প্রবেশের যে কোনো চেষ্টা <strong>ডিজিটাল নিরাপত্তা আইন</strong> অনুযায়ী কঠোর আইনি ব্যবস্থার আওতায় আসবে।
                </p>
              </div>

              {/* Google Sign-In Button */}
              <button
                type="button"
                onClick={() => triggerGoogleAuth()}
                disabled={isVerifyingGoogle}
                className="w-full bg-[#18181b] hover:bg-[#222226] border border-zinc-700/80 text-white font-bold py-3.5 px-6 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 group active:scale-[0.98] disabled:opacity-60"
              >
                {isVerifyingGoogle ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                    <span className="text-sm">লোকেশন ও অনুমতি যাচাই করা হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                    <span className="text-sm font-semibold tracking-wide">Continue with Google</span>
                  </>
                )}
              </button>

              {/* Co-Founder Permissions & Access Scope Summary */}
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 space-y-3">
                <div className="text-xs font-bold text-zinc-200 flex items-center justify-between border-b border-zinc-800/80 pb-2">
                  <span className="flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-amber-400" />
                    <span>Team Role Access Scope</span>
                  </span>
                  <span className="text-[10px] text-pink-400 font-mono bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">RBAC Verified</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div className="space-y-1 bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-800/60">
                    <span className="text-emerald-400 font-bold block flex items-center gap-1">
                      ✓ Allowed Privileges
                    </span>
                    <ul className="text-zinc-300 space-y-0.5 pl-3 list-disc">
                      <li>Video Moderation Queue</li>
                      <li>Content Review & Approvals</li>
                      <li>Live Traffic Overview</li>
                      <li>User Directory & Support</li>
                    </ul>
                  </div>
                  <div className="space-y-1 bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-800/60">
                    <span className="text-rose-400 font-bold block flex items-center gap-1">
                      ✕ Restricted (Super Admin Only)
                    </span>
                    <ul className="text-zinc-500 space-y-0.5 pl-3 list-disc">
                      <li>Cloudflare R2 API Secrets</li>
                      <li>User GPS & Geo-Location</li>
                      <li>Financials & Payout Data</li>
                      <li>Team Role Modifications</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 justify-center text-[11px] text-zinc-500">
                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                <span>ম্যাপ লোকেশন অনুমোদন বাধ্যতামূলক</span>
              </div>
            </div>
          )}

          {/* VIEW 2: Super Admin Email & Password Form */}
          {authMode === 'master' && (
            <form onSubmit={handleMasterLogin} className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
                <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  Master Admin Credentials
                </span>
                <span className="text-[11px] text-zinc-500">Superuser Access</span>
              </div>

              {/* Lockout Banner */}
              {lockoutSeconds > 0 && (
                <div className="p-4 bg-red-950/60 border border-red-500/50 rounded-2xl text-center space-y-1">
                  <Clock className="w-6 h-6 text-red-400 mx-auto animate-pulse" />
                  <div className="text-sm font-bold text-red-300">অ্যাক্সেস সাময়িকভাবে স্থগিত</div>
                  <div className="text-xs text-zinc-400">
                    ৩ বার ভুল পাসওয়ার্ড দেওয়ার কারণে ফর্মটি লক করা হয়েছে। অপেক্ষা করুন:{' '}
                    <strong className="text-white text-sm">{lockoutSeconds} সেকেন্ড</strong>
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 ml-1">Admin Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    disabled={lockoutSeconds > 0}
                    placeholder="Enter admin email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#18181b] border border-zinc-800 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 ml-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={lockoutSeconds > 0}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#18181b] border border-zinc-800 rounded-2xl pl-10 pr-11 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-all disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || lockoutSeconds > 0}
                className="w-full mt-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3.5 rounded-2xl border border-zinc-700 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Authenticate Master Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Discrete Switch Footer */}
          <div className="mt-8 pt-5 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
            {authMode === 'team' ? (
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setAuthMode('master');
                }}
                className="hover:text-zinc-300 transition-colors underline flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5 text-zinc-400" />
                <span>Only Super Admin Login</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setAuthMode('team');
                }}
                className="hover:text-zinc-300 transition-colors underline flex items-center gap-1.5"
              >
                <Users2 className="w-3.5 h-3.5 text-zinc-400" />
                <span>Back to Team Member Login</span>
              </button>
            )}

            <Link href="https://xpig.me" className="hover:text-zinc-400 transition-colors">
              xpig.me
            </Link>
          </div>
        </div>

        {/* Security badge at bottom */}
        <p className="text-center text-[11px] text-zinc-600 mt-4 flex items-center justify-center gap-1.5">
          <Scale className="w-3.5 h-3.5" />
          <span>XPIG Zero-Trust Guard &bull; Authorized Personnel Only</span>
        </p>
      </div>
    </div>
  );
}
