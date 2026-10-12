'use client';
import Image from 'next/image';
import Link from 'next/link';
import { User, Settings, LogOut, Video, ThumbsUp, History, ShieldCheck, Sparkles, Upload } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';

export default function ProfilePage() {
  const { user, isAuthenticated, isInitializing, loginWithGoogle, logout } = useAuth();

  if (isInitializing) return <ProfileSkeleton />;

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
        <div className="bg-[#111] border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl">
          <div className="w-16 h-16 bg-red-950/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3 text-center">Create Your Profile</h1>
          <p className="text-zinc-400 text-center mb-8 leading-relaxed text-sm">
            Sign up to personalize your experience, save favorite videos, and interact with the community.
          </p>
          <button 
            onClick={() => loginWithGoogle()}
            className="w-full py-3.5 bg-white hover:bg-gray-100 text-black rounded-xl font-bold transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-white/10"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-24">
      {/* Cover Banner */}
      <div className="h-48 md:h-64 w-full bg-gradient-to-r from-zinc-950 via-zinc-900 to-black relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-4 right-6 flex items-center gap-2 opacity-60">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span className="text-xs uppercase tracking-widest text-zinc-400 font-bold">XPIG Verified Creator</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header Block */}
        <div className="relative -mt-16 sm:-mt-24 mb-8 flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
          {/* Avatar */}
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-[#0a0a0a] bg-zinc-900 overflow-hidden shadow-2xl flex-shrink-0 group">
            {user.picture ? (
              <img 
                src={user.picture} 
                alt={user.name} 
                className="w-full h-full object-cover rounded-full" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-400">
                <User className="w-16 h-16" />
              </div>
            )}
            <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 bg-black/80 rounded-full p-1 border border-white/10 shadow-lg" title="Verified Member">
              <Image 
                src="/verified-badge.png" 
                alt="Verified" 
                width={20} 
                height={20} 
                className="w-5 h-5 object-contain" 
              />
            </div>
          </div>

          {/* User Name & Details */}
          <div className="flex-1 pb-2 flex flex-col items-center sm:items-start text-center sm:text-left">
            <div className="flex items-center gap-2.5 flex-wrap justify-center sm:justify-start">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>{user.name}</span>
                <span className="inline-flex items-center shrink-0 align-middle" title="Verified Creator">
                  <Image 
                    src="/verified-badge.png" 
                    alt="Verified Badge" 
                    width={26} 
                    height={26} 
                    className="w-6 h-6 sm:w-7 sm:h-7 object-contain drop-shadow-[0_0_10px_rgba(0,149,246,0.5)]" 
                    priority
                  />
                </span>
              </h1>
            </div>

            <p className="text-sm text-zinc-400 mt-1">{user.email}</p>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mt-3 justify-center sm:justify-start">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 border border-sky-500/30 text-sky-400 shadow-sm">
                <Image 
                  src="/verified-badge.png" 
                  alt="Verified" 
                  width={14} 
                  height={14} 
                  className="w-3.5 h-3.5 object-contain" 
                />
                Verified Creator
              </span>

              {user.is_cofounder && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/15 border border-purple-500/30 text-purple-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  Co-Founder
                </span>
              )}

              {user.is_superuser && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  Administrator
                </span>
              )}

              <span className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-800/80 border border-zinc-700/60 text-zinc-300">
                Official Account
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mb-2 flex-wrap justify-center">
            <Link 
              href="/creator"
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-rose-900/20 flex items-center gap-2"
            >
              <Video className="w-4 h-4" />
              Creator Studio
            </Link>
            <Link 
              href="/settings"
              className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white rounded-xl transition-all"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </Link>
            <button 
              onClick={logout}
              className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-red-400 rounded-xl transition-all"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Nav Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <Link 
            href="/creator"
            className="p-5 bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 rounded-2xl transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Creator Studio</span>
              <div className="p-2 bg-rose-500/10 rounded-xl group-hover:bg-rose-500/20 transition-colors">
                <Video className="w-5 h-5 text-rose-500" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-bold text-white group-hover:text-rose-400 transition-colors">My Content Vault</h3>
              <p className="text-xs text-zinc-400 mt-1">Manage uploaded videos and view analytics</p>
            </div>
          </Link>

          <Link 
            href="/upload"
            className="p-5 bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 rounded-2xl transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Upload</span>
              <div className="p-2 bg-sky-500/10 rounded-xl group-hover:bg-sky-500/20 transition-colors">
                <Upload className="w-5 h-5 text-sky-400" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-bold text-white group-hover:text-sky-400 transition-colors">Publish Video</h3>
              <p className="text-xs text-zinc-400 mt-1">Upload high bitrate videos to XPIG</p>
            </div>
          </Link>

          <Link 
            href="/liked"
            className="p-5 bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 rounded-2xl transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Favorites</span>
              <div className="p-2 bg-emerald-500/10 rounded-xl group-hover:bg-emerald-500/20 transition-colors">
                <ThumbsUp className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">Liked Videos</h3>
              <p className="text-xs text-zinc-400 mt-1">Quick access to all videos you've liked</p>
            </div>
          </Link>

          <Link 
            href="/history"
            className="p-5 bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 rounded-2xl transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Activity</span>
              <div className="p-2 bg-amber-500/10 rounded-xl group-hover:bg-amber-500/20 transition-colors">
                <History className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">Watch History</h3>
              <p className="text-xs text-zinc-400 mt-1">Resume watching your recent streams</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
