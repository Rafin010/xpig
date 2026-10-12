'use client';
import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useEffect, useRef } from 'react';
import { Search, Menu, Bell, User, Plus, Settings, X, LogOut } from 'lucide-react';
import { useSidebar } from '@/context/SidebarContext';
import { useAuth } from '@/context/AuthContext';
import { encodeVideoId } from '@/lib/obfuscate';


export function Navbar() {
  const { toggleSidebar } = useSidebar();
  const { user, loginWithGoogle, logout, isAuthenticated } = useAuth();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Manual Login Limits
  const [manualEmail, setManualEmail] = useState('');
  const [manualPassword, setManualPassword] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    let interval: any;
    if (isLocked && lockTimer > 0) {
      interval = setInterval(() => {
        setLockTimer((prev) => prev - 1);
      }, 1000);
    } else if (isLocked && lockTimer <= 0) {
      setIsLocked(false);
      setFailedAttempts(0);
      setLoginError('');
    }
    return () => clearInterval(interval);
  }, [isLocked, lockTimer]);

  const handleManualLogin = () => {
    if (isLocked) return;
    
    // Simulate failed login (since we only use Google Auth right now)
    const newAttempts = failedAttempts + 1;
    setFailedAttempts(newAttempts);
    
    if (newAttempts >= 4) {
      setIsLocked(true);
      setLockTimer(60);
      setLoginError('Too many failed attempts. Locked for 60s.');
    } else {
      setLoginError(`Invalid credentials. ${4 - newAttempts} attempts left.`);
    }
  };



  // Real-time search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://xpig.onrender.com/api/v1/discover/search`);
        if (res.ok) {
          const data = await res.json();
          const items = data.items || [];
          const filtered = items.filter((item: any) => item.title.toLowerCase().includes(searchQuery.toLowerCase()));
          setSearchResults(filtered);
        }
      } catch (err) {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchResults([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-black/50 backdrop-blur-xl z-50 flex items-center justify-between px-4 border-b border-white/10 shadow-sm">
      {/* Left: Menu & Logo */}
      <div className={`flex items-center gap-4 ${isMobileSearchOpen ? 'hidden md:flex' : 'flex'}`}>
        <button onClick={toggleSidebar} className="p-2 text-zinc-400 hover:text-white transition-colors">
          <Menu className="w-6 h-6" />
        </button>
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative w-10 h-10 transform group-hover:scale-110 transition-all duration-300 flex items-center justify-center">
            <Image src="/pig-logo.png" alt="PIG Icon" fill sizes="40px" className="object-contain" />
          </div>
          <div className="relative w-20 h-8 transform group-hover:scale-105 transition-all duration-300 flex items-center justify-center">
            <Image src="/xpig-text-logo.png" alt="XPIG Text" fill sizes="80px" className="object-contain" />
          </div>
        </Link>
      </div>

      {/* Center: Search */}
      <div className={`${isMobileSearchOpen ? 'flex' : 'hidden'} md:flex flex-1 max-w-2xl mx-4 md:mx-8 w-full`} ref={searchContainerRef}>
        <div className="relative w-full flex items-center gap-2">
          {isMobileSearchOpen && (
            <button onClick={() => setIsMobileSearchOpen(false)} className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          )}
          <div className="relative w-full flex flex-col">
            <div className="relative w-full flex z-10">
              <input 
                type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search videos, creators..." autoFocus={isMobileSearchOpen}
                className="w-full bg-[#1e1e1e] border border-zinc-800 rounded-l-md pl-4 pr-4 py-2 text-sm text-white focus:outline-none focus:border-zinc-500 transition-colors placeholder:text-zinc-500"
              />
              <button className="px-5 bg-[#2a2a2a] hover:bg-[#333] border border-l-0 border-zinc-800 rounded-r-md text-zinc-400 transition-colors flex items-center justify-center">
                <Search className="w-4 h-4" />
              </button>
            </div>
            {searchResults.length > 0 && searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#161616] border border-zinc-800 rounded-lg shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto">
                {searchResults.map((video) => (
                  <Link key={video.id} href={`/watch/${encodeVideoId(video.id)}`} onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                    className="flex items-center gap-3 p-3 hover:bg-[#222] transition-colors border-b border-zinc-800/50 last:border-0 group">
                    <div className="relative w-16 h-10 bg-zinc-900 rounded overflow-hidden shrink-0">
                      <Image src={video.thumbnail_url || "/icon.png"} alt={video.title} fill sizes="64px" className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-zinc-200 truncate group-hover:text-white transition-colors">{video.title}</h4>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-xs text-zinc-400 font-medium">xpig</span>
                        <Image 
                          src="/verified-badge.png" 
                          alt="Verified Creator" 
                          width={14} 
                          height={14} 
                          className="w-3.5 h-3.5 object-contain shrink-0" 
                        />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className={`flex items-center gap-2 md:gap-4 ${isMobileSearchOpen ? 'hidden md:flex' : 'flex'}`}>
        <button onClick={() => setIsMobileSearchOpen(true)} className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors">
          <Search className="w-5 h-5" />
        </button>
        <Link href="/upload" className="hidden md:flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700/80 rounded-full font-medium text-sm transition-all shadow-sm">
          <Plus className="w-4 h-4 text-zinc-300" /> <span>Upload</span>
        </Link>
        <button className="p-2 text-zinc-400 hover:text-white transition-colors hidden sm:block">
          <Bell className="w-5 h-5" />
        </button>

        {/* Profile Dropdown */}
        <div className="relative group ml-1">
          <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700/80 p-[2px] cursor-pointer overflow-hidden">
            {isAuthenticated && user ? (
              <img src={user.picture} alt={user.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-full h-full bg-zinc-900 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-zinc-300" />
              </div>
            )}
          </div>

          {/* Dropdown */}
          <div className="absolute top-full right-0 mt-2 w-72 bg-[#161616] border border-zinc-800 rounded-2xl shadow-2xl shadow-black/80 opacity-0 invisible group-hover:opacity-100 group-hover:visible focus-within:opacity-100 focus-within:visible transition-all duration-200 transform origin-top-right translate-y-2 group-hover:translate-y-0 focus-within:translate-y-0 z-50 overflow-hidden cursor-default">
            
            {isAuthenticated && user ? (
              <div className="p-5 flex flex-col gap-4">
                <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
                  <img src={user.picture} alt={user.name} className="w-12 h-12 rounded-full" />
                  <div>
                    <h4 className="font-bold text-white leading-tight flex items-center gap-1.5">
                      <span>{user.name}</span>
                      <Image 
                        src="/verified-badge.png" 
                        alt="Verified" 
                        width={16} 
                        height={16} 
                        className="w-4 h-4 object-contain shrink-0" 
                      />
                    </h4>
                    <p className="text-xs text-zinc-400">{user.email}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Link href="/profile" className="px-3 py-2 hover:bg-[#222] rounded-lg transition-colors text-sm font-medium flex items-center gap-2">
                    <User className="w-4 h-4 text-zinc-400" /> My Profile
                  </Link>
                  <Link href="/settings" className="px-3 py-2 hover:bg-[#222] rounded-lg transition-colors text-sm font-medium flex items-center gap-2">
                    <Settings className="w-4 h-4 text-zinc-400" /> Settings
                  </Link>
                </div>
                <button onClick={logout} className="mt-2 flex items-center justify-center gap-2 w-full bg-zinc-800 hover:bg-zinc-700 text-white py-2.5 rounded-xl font-bold transition-colors">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            ) : (
              <div className="p-5 flex flex-col gap-4">
                <h3 className="text-white font-bold text-lg text-center tracking-tight">Join XPIG Network</h3>
                <button onClick={() => loginWithGoogle()} className="flex items-center justify-center gap-2 w-full bg-white hover:bg-zinc-200 text-black py-2.5 rounded-xl font-bold transition-colors">
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                  Continue with Google
                </button>
                <div className="flex items-center gap-2 my-1">
                  <div className="h-px bg-zinc-800 flex-1"></div>
                  <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Or Manual</span>
                  <div className="h-px bg-zinc-800 flex-1"></div>
                </div>
                <div className="flex flex-col gap-3">
                  <input 
                    type="email" 
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    disabled={isLocked}
                    placeholder="Email Address" 
                    className="w-full bg-[#111] border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-500 transition-colors disabled:opacity-50" 
                  />
                  <input 
                    type="password" 
                    value={manualPassword}
                    onChange={(e) => setManualPassword(e.target.value)}
                    disabled={isLocked}
                    placeholder="Password" 
                    className="w-full bg-[#111] border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-500 transition-colors disabled:opacity-50" 
                  />
                  <button 
                    onClick={handleManualLogin}
                    disabled={isLocked || !manualEmail || !manualPassword}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 py-2.5 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLocked ? `Locked (${lockTimer}s)` : 'Log In / Sign Up'}
                  </button>
                  {loginError && !isLocked && <p className="text-red-500 text-xs text-center font-semibold mt-1">{loginError}</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}


