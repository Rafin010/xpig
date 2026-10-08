import { Navbar } from "@/components/layout/Navbar";
import { SidebarProvider } from "@/context/SidebarContext";
import { ClientLayout } from "@/components/layout/ClientLayout";

export const instant = false;

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Navbar />
      <ClientLayout>
        {children}
      </ClientLayout>
    </SidebarProvider>
  );
}
