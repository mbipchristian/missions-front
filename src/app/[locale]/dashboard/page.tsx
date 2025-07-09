// import { DashboardContent } from "@/components/dashboard-content"
import DashboardContent from "@/components/dashboard-content"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
export default function DashboardPage() {
  return (
    <SidebarProvider>
      <div>
        <DashboardSidebar />
        <DashboardContent />
      </div>
    </SidebarProvider> 
    
  )
}
