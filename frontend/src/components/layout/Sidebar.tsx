'use client';
import Link from 'next/link';
import { Home, Compass, Radio, Users, User, Star, History, ThumbsUp, ShieldAlert, BarChart3, Settings, Database, Megaphone } from 'lucide-react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/context/SidebarContext';

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebar();

  const mainLinks = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Compass, label: 'Blog & News', href: '/blog' },
    { icon: Radio, label: 'Live Cams', href: '/live' },
    { icon: Users, label: 'Top Creators', href: '/creators' },
    { icon: Star, label: 'Subscriptions', href: '/subscriptions' },
  ];

  const userLinks = [
    { icon: User, label: 'My Profile', href: '/profile' },
    { icon: History, label: 'History', href: '/history' },
    { icon: ThumbsUp, label: 'Liked Videos', href: '/liked' },
  ];

  const adminLinks = [
    { icon: BarChart3, label: 'Creator Dashboard', href: '/creator' },
    { icon: ShieldAlert, label: 'Trust & Safety', href: '/admin' },
    { icon: Database, label: 'Storage', href: '/admin/storage' },
    { icon: Users, label: 'Team', href: '/admin/team' },
  ];

  const NavItem = ({ icon: Icon, label, href }: { icon: any, label: string, href: string }) => {
    const isActive = pathname === href || (pathname.startsWith(href) && href !== '/');
    return (
      <Link 
        href={href}
        onClick={() => {
          if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            toggleSidebar();
          }
        }}
        className={`flex items-center ${isCollapsed ? 'justify-center lg:px-0 px-4' : 'gap-4 px-4'} py-3.5 rounded-xl transition-all duration-200 font-semibold text-[15px] ${
          isActive 
            ? 'bg-zinc-800 text-white shadow-sm' 
            : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'
        }`}
        title={isCollapsed ? label : undefined}
      >
        <Icon className={`w-6 h-6 shrink-0 transition-transform duration-200 ${isActive ? 'text-white' : 'text-zinc-400 group-hover:scale-105'}`} />
        <span className={isCollapsed ? 'lg:hidden block ml-4' : 'block leading-tight'}>{label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[50] lg:hidden top-16"
          onClick={toggleSidebar}
        />
      )}
      <aside className={`fixed left-0 top-16 bottom-0 transition-all duration-300 bg-[#181818]/95 backdrop-blur-xl border-r border-zinc-800/80 z-[60] flex flex-col
        ${isCollapsed ? '-translate-x-full' : 'translate-x-0 w-72'}
      `}>
      
      {/* Scrollable Links Area */}
      <div className={`flex-1 overflow-y-auto p-4 flex flex-col gap-6 relative ${isCollapsed ? 'items-center' : ''}`}>
        
        <div className="w-full">
          {!isCollapsed && <h4 className="px-4 text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2.5">Discover</h4>}
          <div className="space-y-1 w-full">
            {mainLinks.map(link => <NavItem key={link.href} {...link} />)}
          </div>
        </div>

        <div className="w-full">
          {!isCollapsed && <h4 className="px-4 text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2.5">Library</h4>}
          <div className="space-y-1 w-full">
            {userLinks.map(link => <NavItem key={link.href} {...link} />)}
          </div>
        </div>

        <div className="w-full">
          {!isCollapsed && <h4 className="px-4 text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2.5">Management</h4>}
          <div className="space-y-1 w-full">
            {adminLinks.map(link => <NavItem key={link.href} {...link} />)}
          </div>
        </div>

        {/* Sidebar Branding inside scroll area at bottom */}
        {!isCollapsed && (
          <div className="mt-4 flex justify-center opacity-20 pointer-events-none">
            <img src="/pig-logo.png" alt="Pig Branding" className="w-24 h-24 object-contain grayscale" />
          </div>
        )}

      </div>

      {/* Settings & Footer Fixed Area */}
      <div className={`p-4 border-t border-white/5 flex flex-col gap-4 ${isCollapsed ? 'items-center' : ''}`}>
        <div className="w-full space-y-1">
          <NavItem icon={Settings} label="Settings" href="/settings" />
          
          <Link 
            href="/support"
            className="group flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 font-semibold text-[15px] text-zinc-400 hover:bg-zinc-800/60 hover:text-white w-full gap-4"
            title={isCollapsed ? "Support Us" : undefined}
          >
            <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
              <Image 
                src="/pig-logo.png" 
                alt="Support" 
                width={24} 
                height={24} 
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-125"
              />
            </div>
            {!isCollapsed && <span className="leading-tight">Support</span>}
          </Link>
        </div>
        
        {!isCollapsed && (
          <div className="px-2">
            <div className="flex flex-wrap gap-x-3 gap-y-2 text-[13px] font-medium text-zinc-500 mb-2">
              <Link href="/sponsors" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">Sponsors</Link>
              <Link href="/terms" className="hover:text-zinc-300 transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-zinc-300 transition-colors">Privacy</Link>
              <Link href="/dmca" className="hover:text-zinc-300 transition-colors">DMCA</Link>
            </div>
            <p className="text-xs text-zinc-600 mt-2">&copy; 2026 XPIG Platform</p>
          </div>
        )}
      </div>
    </aside>
    </>
  );
}
