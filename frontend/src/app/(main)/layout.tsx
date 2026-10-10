import { Navbar } from "@/components/layout/Navbar";
import { SidebarProvider } from "@/context/SidebarContext";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { TopAdBanner } from "@/components/ads/TopAdBanner";

export const instant = false;

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Navbar />
      <TopAdBanner />
      <ClientLayout>
        {children}
      </ClientLayout>
    </SidebarProvider>
  );
}
