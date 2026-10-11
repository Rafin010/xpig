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
  UserCheck
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [role, setRole] = useState<'superuser' | 'cofounder' | 'loading'>('loading');
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    try {
      const storedRole = localStorage.getItem('xpig_admin_role') as any;
      const storedUser = JSON.parse(localStorage.getItem('xpig_admin_user') || '{}');
      setRole(storedRole === 'cofounder' ? 'cofounder' : 'superuser');
      if (storedUser?.email) setUserEmail(storedUser.email);
    } catch {
      setRole('superuser');
    }
  }, []);

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
    <div className="flex h-screen w-screen overflow-hidden bg-[#050505]">
      {/* 100% Fixed Left Sidebar (Never scrolls away) */}
      <aside className="w-64 h-full shrink-0 bg-[#111] border-r border-zinc-800 flex flex-col z-30 select-none">
        
        {/* Sidebar Header */}
        <div className="p-6 border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
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

      {/* Main Content Viewport (Only this area scrolls) */}
      <main className="flex-1 h-full overflow-y-auto custom-scrollbar relative bg-[#09090b]">
        {isBlocked ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/40 mb-4">
              <ShieldAlert className="w-12 h-12 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Access Denied (সীমিত অধিকার)</h2>
            <p className="text-zinc-400 max-w-md text-sm mb-6">
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
          <div className="p-6 md:p-8 max-w-7xl mx-auto pb-24">
            {children}
          </div>
        )}
      </main>
    </div>
  );
}
