'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  Video, 
  Users, 
  Settings, 
  LogOut, 
  HardDrive, 
  ShieldCheck, 
  ShieldAlert,
  Megaphone,
  UserCheck,
  Menu,
  X
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [role, setRole] = useState<'superuser' | 'cofounder' | 'loading'>('loading');
  const [userEmail, setUserEmail] = useState<string>('');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      const storedRole = localStorage.getItem('xpig_admin_role') as any;
      const storedUser = JSON.parse(localStorage.getItem('xpig_admin_user') || '{}');
      setRole(storedRole === 'cofounder' ? 'cofounder' : 'superuser');
      if (storedUser?.email) setUserEmail(storedUser.email);
    } catch {
      setRole('superuser');
    }

    // Set Admin Browser Tab Favicon
    let icon = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (!icon) {
      icon = document.createElement('link');
      icon.rel = 'icon';
      document.head.appendChild(icon);
    }
    icon.type = 'image/png';
    icon.href = '/admin-icon.png';

    let appleIcon = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
    if (!appleIcon) {
      appleIcon = document.createElement('link');
      appleIcon.rel = 'apple-touch-icon';
      document.head.appendChild(appleIcon);
    }
    appleIcon.href = '/admin-icon.png';
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileDrawerOpen(false);
  }, [pathname]);

  // Co-Founder Heartbeat (every 60 seconds to track active session duration)
  useEffect(() => {
    if (role !== 'cofounder' || !userEmail) return;

    const interval = setInterval(async () => {
      try {
        await fetch('https://xpig.onrender.com/api/v1/admin/cofounders/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail, duration_increment: 1 }),
        });
      } catch {}
    }, 60000);

    return () => clearInterval(interval);
  }, [role, userEmail]);

  // If on login page, render full screen without the admin sidebar
  if (pathname === '/admin/login' || pathname.endsWith('/login')) {
    return <>{children}</>;
  }

  // RBAC Navigation Links
  const superuserLinks = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/videos', label: 'Videos', icon: Video },
    { href: '/admin/ads', label: 'Sponsor Ads', icon: Megaphone },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/storage', label: 'Storage Nodes', icon: HardDrive },
    { href: '/admin/team', label: 'Team Roles', icon: Users },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const cofounderLinks = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/videos', label: 'Videos', icon: Video },
  ];

  const navLinks = role === 'cofounder' ? cofounderLinks : superuserLinks;

  // Route Guard: Block Co-Founder from accessing restricted pages
  const restrictedForCofounder = ['/admin/storage', '/admin/team', '/admin/settings', '/admin/ads', '/admin/users'];
  const isBlocked = role === 'cofounder' && restrictedForCofounder.some(r => pathname === r || pathname.startsWith(`${r}/`));

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {}
    if (typeof window !== 'undefined') {
      document.cookie = 'xpig_admin_session=; path=/; max-age=0';
      localStorage.removeItem('xpig_admin_session');
      localStorage.removeItem('xpig_admin_role');
      localStorage.removeItem('xpig_admin_user');
      window.location.href = '/admin/login';
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-[#050505]">
      
      {/* 1. Mobile Top Navigation Bar (Shown on Mobile Only) */}
      <header className="md:hidden h-14 bg-[#111] border-b border-zinc-800 px-4 flex items-center justify-between shrink-0 z-40 select-none">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-colors active:scale-95"
            aria-label="Toggle menu"
          >
            {isMobileDrawerOpen ? <X className="w-5 h-5 text-rose-500" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden p-0.5">
              <img src="/admin-icon.png" alt="Admin" className="w-full h-full object-contain" />
            </div>
            <span className="font-black text-sm text-white tracking-tight">XPIG Control</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {role === 'cofounder' ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Co-Founder
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Master
            </span>
          )}
          <button 
            onClick={handleLogout} 
            className="p-2 text-zinc-400 hover:text-red-400 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. Mobile Slide-Over Drawer Overlay */}
      {isMobileDrawerOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/75 backdrop-blur-sm z-50 transition-opacity animate-in fade-in duration-200"
          onClick={() => setIsMobileDrawerOpen(false)}
        />
      )}

      {/* 3. Mobile Slide-Over Drawer Menu */}
      <div className={`md:hidden fixed top-0 bottom-0 left-0 w-72 bg-[#111] border-r border-zinc-800 z-50 flex flex-col p-4 shadow-2xl transition-transform duration-300 ease-in-out ${
        isMobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between pb-4 mb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden p-1">
              <img src="/admin-icon.png" alt="Admin" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white">XPIG Admin</h2>
              <p className="text-[10px] text-zinc-400 font-medium">Mobile Navigation</p>
            </div>
          </div>
          <button 
            onClick={() => setIsMobileDrawerOpen(false)}
            className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Navigation Links */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileDrawerOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all font-semibold text-sm ${
                  isActive
                    ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-900/30'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile Drawer Footer */}
        <div className="pt-3 border-t border-zinc-800">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-3.5 py-3 rounded-xl font-bold text-xs text-red-400 hover:bg-red-950/20 bg-zinc-900 w-full transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Control Panel</span>
          </button>
        </div>
      </div>

      {/* 4. Desktop 100% Fixed Left Sidebar (Hidden on Mobile, Visible on md+) */}
      <aside className="hidden md:flex w-64 h-full shrink-0 bg-[#111] border-r border-zinc-800 flex-col z-30 select-none">
        
        {/* Sidebar Header */}
        <div className="p-6 border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden p-0.5 shadow-sm">
              <img src="/admin-icon.png" alt="XPIG Admin" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-tight leading-tight">XPIG Admin</h2>
              <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Control Panel</span>
            </div>
          </div>

          {/* Role Status Pill */}
          <div className="mt-3">
            {role === 'cofounder' ? (
              <div className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-[10px] font-bold text-amber-400 flex items-center gap-1.5">
                <UserCheck className="w-3 h-3" />
                <span>Co-Founder (Limited Access)</span>
              </div>
            ) : (
              <div className="px-2.5 py-1 bg-zinc-800 border border-zinc-700/80 rounded-lg text-[10px] font-bold text-zinc-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Master Admin (Superuser)</span>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-medium text-xs ${
                  isActive
                    ? 'bg-zinc-800 text-white font-bold border border-zinc-700 shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0 text-zinc-400" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-zinc-800/80">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-colors font-medium text-xs text-red-400 hover:text-red-300 hover:bg-red-950/20 w-full"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 5. Main Content Viewport (Scrollable and 100% Mobile Responsive) */}
      <main className="flex-1 h-[calc(100vh-3.5rem)] md:h-full overflow-y-auto custom-scrollbar relative bg-[#09090b] w-full">
        {isBlocked ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/40 mb-4">
              <ShieldAlert className="w-12 h-12 text-red-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Access Denied (সীমিত অধিকার)</h2>
            <p className="text-zinc-400 max-w-md text-xs sm:text-sm mb-6">
              আপনার একাউন্টটি কো-ফাউন্ডার রোলের অধীনে নিবন্ধিত। শুধুমাত্র মাস্টার সুপার-অ্যাডমিন এই সেকশনটিতে প্রবেশাধিকারপ্রাপ্ত।
            </p>
            <Link
              href="/admin"
              className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded-xl text-xs font-bold transition-all"
            >
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto pb-24 md:pb-16 w-full">
            {children}
          </div>
        )}
      </main>
    </div>
  );
}
