'use client';
import Link from 'next/link';
import { Home, Compass, Radio, Users, User, Star, History, ThumbsUp, ShieldAlert, BarChart3, Settings } from 'lucide-react';
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
  ];

  const NavItem = ({ icon: Icon, label, href }: { icon: any, label: string, href: string }) => {
    const isActive = pathname === href || (pathname.startsWith(href) && href !== '/');
    return (
      <Link 
        href={href}
        className={`flex items-center ${isCollapsed ? 'justify-center lg:px-0 px-4' : 'gap-4 px-4'} py-3 rounded-2xl transition-all duration-300 font-bold text-sm ${
          isActive 
            ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-[0_4px_10px_rgba(236,72,153,0.4)] transform hover:-translate-y-1' 
            : 'text-zinc-400 hover:bg-pink-500/10 hover:text-pink-400 transform hover:scale-105'
        }`}
        title={isCollapsed ? label : undefined}
      >
        <Icon className={`w-5 h-5 ${isActive ? 'drop-shadow-md' : 'drop-shadow-sm'}`} />
        <span className={isCollapsed ? 'lg:hidden block ml-4' : 'block'}>{label}</span>
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
      <aside className={`fixed left-0 top-16 bottom-0 transition-all duration-300 bg-[#111111] z-[60] flex flex-col
        ${isCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'translate-x-0 w-64'}
      `}>
      
      {/* Scrollable Links Area */}
      <div className={`flex-1 overflow-y-auto p-4 flex flex-col gap-6 relative ${isCollapsed ? 'items-center' : ''}`}>
        
        <div className="w-full">
          {!isCollapsed && <h4 className="px-4 text-xs font-bold text-zinc-600 uppercase tracking-wider mb-2">Discover</h4>}
          <div className="space-y-1 w-full">
            {mainLinks.map(link => <NavItem key={link.href} {...link} />)}
          </div>
        </div>

        <div className="w-full">
          {!isCollapsed && <h4 className="px-4 text-xs font-bold text-zinc-600 uppercase tracking-wider mb-2">Library</h4>}
          <div className="space-y-1 w-full">
            {userLinks.map(link => <NavItem key={link.href} {...link} />)}
          </div>
        </div>

        <div className="w-full">
          {!isCollapsed && <h4 className="px-4 text-xs font-bold text-zinc-600 uppercase tracking-wider mb-2">Management</h4>}
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
      <div className={`bg-[#111111] z-10 p-4 border-t border-zinc-900 flex flex-col gap-4 ${isCollapsed ? 'items-center' : ''}`}>
        <div className="w-full">
          <NavItem icon={Settings} label="Settings" href="/settings" />
        </div>
        
        {!isCollapsed && (
          <div>
            <div className="flex flex-wrap gap-x-3 gap-y-2 text-[13px] font-bold text-zinc-500 mb-2">
              <Link href="/sponsors" target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-500">Sponsors</Link>
              <Link href="/terms" className="hover:text-zinc-300">Terms</Link>
              <Link href="/privacy" className="hover:text-zinc-300">Privacy</Link>
              <Link href="/dmca" className="hover:text-zinc-300">DMCA</Link>
            </div>
          <p className="text-xs text-zinc-600 mt-2">&copy; 2026 XPIG Platform</p>
          </div>
        )}
      </div>
    </aside>
    </>
  );
}
