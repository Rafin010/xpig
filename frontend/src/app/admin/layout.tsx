'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Video, Users, Settings, LogOut, HardDrive } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // If on login page, render full screen without the admin sidebar
  if (pathname === '/admin/login' || pathname.endsWith('/login')) {
    return <>{children}</>;
  }

  const navLinks = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/videos', label: 'Videos', icon: Video },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/storage', label: 'Storage Nodes', icon: HardDrive },
    { href: '/admin/team', label: 'Team Roles', icon: Users },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      window.location.href = '/admin/login';
    } catch {
      window.location.href = '/admin/login';
    }
  };

  return (
    <div className="flex min-h-screen bg-[#050505]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#111] border-r border-zinc-800 flex flex-col">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-xl font-black text-pink-500 tracking-tight">XPIG Admin</h2>
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
        <div className="p-4 border-t border-zinc-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm text-red-400 hover:text-red-300 hover:bg-red-950/30 w-full"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
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
