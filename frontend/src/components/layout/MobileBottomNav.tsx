'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Plus, Heart, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  const isUploadActive = pathname === '/upload';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#181818]/95 backdrop-blur-xl border-t border-zinc-800/80 z-50 flex items-center justify-around px-2 pb-safe shadow-[0_-4px_30px_rgba(0,0,0,0.8)] select-none">
      
      {/* 1. Home Tab */}
      <Link 
        href="/" 
        className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-all ${
          pathname === '/' ? 'text-pink-500 font-bold scale-105' : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <Home className={`w-5 h-5 ${pathname === '/' ? 'fill-pink-500/20' : ''}`} strokeWidth={pathname === '/' ? 2.5 : 2} />
        <span className="text-[10px] font-medium tracking-tight">Home</span>
      </Link>

      {/* 2. Discover / Live Tab */}
      <Link 
        href="/live" 
        className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-all ${
          pathname.startsWith('/live') ? 'text-pink-500 font-bold scale-105' : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <Compass className={`w-5 h-5 ${pathname.startsWith('/live') ? 'fill-pink-500/20' : ''}`} strokeWidth={pathname.startsWith('/live') ? 2.5 : 2} />
        <span className="text-[10px] font-medium tracking-tight">Live</span>
      </Link>

      {/* 3. Central Prominent Elevated '+' Upload Button (Eye-catching YouTube/TikTok style) */}
      <div className="flex-1 flex justify-center items-center h-full">
        <Link 
          href="/upload" 
          aria-label="Upload Video"
          className="relative -top-3.5 flex flex-col items-center group focus:outline-none"
        >
          <div className="relative">
            {/* Glowing Aura Effect */}
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 opacity-75 blur-md group-hover:opacity-100 transition-opacity animate-pulse" />
            
            {/* Main Button Body */}
            <div className={`relative w-12 h-12 rounded-full bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 flex items-center justify-center shadow-xl ring-[3.5px] ring-[#0a0a0a] group-active:scale-90 group-hover:scale-105 transition-all duration-200 ${
              isUploadActive ? 'ring-pink-500' : ''
            }`}>
              <Plus className="w-7 h-7 text-white stroke-[2.8]" />
            </div>
          </div>
          <span className="text-[9px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-400 mt-1 uppercase tracking-wider">
            Upload
          </span>
        </Link>
      </div>

      {/* 4. Liked / Favorites Tab */}
      <Link 
        href="/liked" 
        className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-all ${
          pathname.startsWith('/liked') ? 'text-pink-500 font-bold scale-105' : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <Heart className={`w-5 h-5 ${pathname.startsWith('/liked') ? 'fill-pink-500/20' : ''}`} strokeWidth={pathname.startsWith('/liked') ? 2.5 : 2} />
        <span className="text-[10px] font-medium tracking-tight">Favorites</span>
      </Link>

      {/* 5. Profile Tab */}
      <Link 
        href="/profile" 
        className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-all ${
          pathname.startsWith('/profile') ? 'text-pink-500 font-bold scale-105' : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        {isAuthenticated && user?.picture ? (
          <div className={`w-5 h-5 rounded-full overflow-hidden border ${
            pathname.startsWith('/profile') ? 'border-pink-500 ring-1 ring-pink-500' : 'border-zinc-700'
          }`}>
            <img src={user.picture} alt="Profile" className="w-full h-full object-cover" />
          </div>
        ) : (
          <User className={`w-5 h-5 ${pathname.startsWith('/profile') ? 'fill-pink-500/20' : ''}`} strokeWidth={pathname.startsWith('/profile') ? 2.5 : 2} />
        )}
        <span className="text-[10px] font-medium tracking-tight">Profile</span>
      </Link>

    </nav>
  );
}
