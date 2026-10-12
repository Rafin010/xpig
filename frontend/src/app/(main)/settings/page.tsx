'use client';
import { Settings, Lock, User, ShieldCheck, LogOut } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function SettingsPage() {
  const { user, isAuthenticated, isInitializing, loginWithGoogle, logout } = useAuth();

  if (isInitializing) return null;

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
          <Settings className="w-10 h-10 text-zinc-500" />
        </div>
        <h1 className="text-3xl font-black text-white mb-3">Account Settings</h1>
        <p className="text-zinc-400 max-w-md mb-8">
          You need to be logged in to access account settings, update preferences, and manage your active subscriptions.
        </p>
        <button 
          onClick={() => loginWithGoogle()}
          className="px-8 py-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-rose-900/20"
        >
          Sign In to XPIG
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 max-w-4xl mx-auto pb-24">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="w-8 h-8 text-rose-500" />
        <h1 className="text-3xl font-bold">Account Settings</h1>
      </div>

      {/* Account Info Card */}
      <div className="bg-[#111] border border-zinc-800 rounded-2xl p-6 mb-8">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-4">Profile & Identity</h2>
        <div className="flex items-center gap-4 flex-wrap">
          {user.picture ? (
            <img src={user.picture} alt={user.name} className="w-16 h-16 rounded-full object-cover border-2 border-zinc-700" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center">
              <User className="w-8 h-8 text-zinc-400" />
            </div>
          )}
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white">{user.name}</h3>
              <Image 
                src="/verified-badge.png" 
                alt="Verified" 
                width={20} 
                height={20} 
                className="w-5 h-5 object-contain inline-block shrink-0" 
              />
            </div>
            <p className="text-sm text-zinc-400">{user.email}</p>
          </div>
          <Link 
            href="/profile" 
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-bold text-white transition-colors"
          >
            View Profile
          </Link>
        </div>
      </div>

      {/* Preferences / Controls */}
      <div className="bg-[#111] border border-zinc-800 rounded-2xl p-6 space-y-6">
        <div>
          <h3 className="font-bold text-base text-zinc-200">Account Security</h3>
          <p className="text-sm text-zinc-400 mt-1">Google OAuth 2.0 active. Authenticated session secured via JWT.</p>
        </div>
        <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-zinc-300">Creator Status</h4>
            <p className="text-xs text-zinc-500">Verified platform member</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <Image src="/verified-badge.png" alt="Verified" width={14} height={14} className="w-3.5 h-3.5 object-contain" />
            Verified
          </span>
        </div>
        <div className="pt-4 border-t border-zinc-800">
          <button 
            onClick={logout}
            className="px-4 py-2.5 bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 rounded-xl font-bold text-sm transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
