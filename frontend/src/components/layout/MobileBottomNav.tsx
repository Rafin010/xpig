'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, PlusSquare, Heart, User } from 'lucide-react';

export function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Compass, label: 'Live', href: '/live' },
    { icon: PlusSquare, label: 'Upload', href: '/upload' },
    { icon: Heart, label: 'Liked', href: '/liked' },
    { icon: User, label: 'Profile', href: '/profile' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0a0a0a]/95 backdrop-blur-md border-t border-zinc-800 z-50 flex items-center justify-around px-2 pb-safe">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        
        return (
          <Link 
            key={item.label} 
            href={item.href} 
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
              isActive ? 'text-pink-500' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Icon className={`w-6 h-6 ${isActive ? 'fill-pink-500/20' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
