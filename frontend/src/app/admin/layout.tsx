'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Video, Users, Settings } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, isInitializing } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isInitializing) {
      if (!isAuthenticated || !user?.is_superuser) {
        router.replace('/');
      }
    }
  }, [isAuthenticated, user, isInitializing, router]);

  if (isInitializing || !isAuthenticated || !user?.is_superuser) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <span className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></span>
      </div>
    );
  }

  const navLinks = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/videos', label: 'Videos', icon: Video },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-[#050505]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#111] border-r border-zinc-800 flex flex-col">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-xl font-black text-pink-500 tracking-tight">PIG Admin</h2>
          <p className="text-xs text-zinc-500 mt-1">Superuser Access</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navLinks.map(link => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${isActive ? 'bg-pink-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}>
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar relative">
        <div className="p-8 pb-20">
          {children}
        </div>
      </main>
    </div>
  );
}
