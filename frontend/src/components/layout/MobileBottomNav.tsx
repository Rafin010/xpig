'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusSquare, Heart, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  const navItems = [
    { icon: Home, href: '/', label: 'Home' },
    { icon: Search, href: '/search', label: 'Search' },
    { icon: PlusSquare, href: '/upload', label: 'Upload', isUpload: true },
    { icon: Heart, href: '/liked', label: 'Liked' },
    { icon: User, href: '/profile', label: 'Profile', isProfile: true },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 h-14 bg-[#0f0f0f]/98 backdrop-blur-xl border-t border-zinc-800/80 z-50 flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] select-none">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
        const colorClass = isActive
          ? 'text-pink-500'
          : item.isUpload
          ? 'text-pink-500 hover:text-pink-400'
          : 'text-zinc-500 hover:text-zinc-300';

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            className={`flex items-center justify-center flex-1 h-full transition-colors ${colorClass}`}
          >
            {item.isProfile && isAuthenticated && user?.picture ? (
              <div
                className={`w-5 h-5 rounded-full overflow-hidden border ${
                  isActive ? 'border-pink-500 ring-1 ring-pink-500' : 'border-zinc-700'
                }`}
              >
                <img src={user.picture} alt="Profile" className="w-full h-full object-cover" />
              </div>
            ) : (
              <Icon className="w-5 h-5" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
