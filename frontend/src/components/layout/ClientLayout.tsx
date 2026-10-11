'use client';
import { useSidebar } from '@/context/SidebarContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { AgeGateModal } from '@/components/layout/AgeGateModal';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { Suspense } from 'react';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex flex-1 pt-16 md:pb-0 pb-16">
      <Suspense fallback={<aside className="hidden lg:block w-72 bg-[#0a0a0a] border-r border-zinc-800" />}>
        <Sidebar />
      </Suspense>
      <main className={`flex-1 w-full transition-all duration-300 min-h-[calc(100vh-4rem)] ${
        isCollapsed ? 'lg:pl-0' : 'lg:pl-72'
      }`}>
        {children}
      </main>
      <AgeGateModal />
      <MobileBottomNav />
    </div>
  );
}
