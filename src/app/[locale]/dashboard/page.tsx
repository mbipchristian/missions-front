import { DashboardContent } from "@/components/dashboard-content"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
export default function DashboardPage() {
  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
        <DashboardSidebar />
        <DashboardContent />
      </div>
    </SidebarProvider> 
    
  )
}
