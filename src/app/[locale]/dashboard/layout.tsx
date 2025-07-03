import type React from "react"
import { AuthProvider } from "@/hooks/use-auth"
import Header from '@/components/header';
import Footer from '@/components/footer';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <div className='flex flex-col min-h-screen'>
          {/* Header fixe */}
          <Header />
          
          <div className='flex flex-1 pt-16'> {/* pt-16 pour compenser la hauteur du header fixe */}
            {/* Sidebar */}
            <div className='w-64 flex-shrink-0'> {/* Largeur fixe pour la sidebar */}
              <DashboardSidebar />
            </div>
            
            {/* Contenu principal */}
            <main className='flex-1 p-4 overflow-auto ml-32'>
              <div className='max-w-full'>
                {children}
              </div>
            </main>
          </div>
          
          <Footer />
        </div>
      </SidebarProvider>
    </AuthProvider>
  );
}