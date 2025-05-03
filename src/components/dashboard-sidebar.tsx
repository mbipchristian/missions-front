"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Briefcase, ChevronDown, Home, LogOut, Shield, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useState } from "react"

export function DashboardSidebar() {
  const pathname = usePathname()
  const [openMissions, setOpenMissions] = useState(true)
  const [openAdmin, setOpenAdmin] = useState(false)

  return (
    <Sidebar>
      <SidebarHeader className="flex h-14 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Shield className="h-6 w-6" />
          <span>Gestion des Missions</span>
        </Link>
        <SidebarTrigger className="ml-auto md:hidden" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/dashboard"}>
              <Link href="/dashboard">
                <Home className="mr-2 h-4 w-4" />
                <span>Tableau de bord</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Missions */}
          <Collapsible open={openMissions} onOpenChange={setOpenMissions}>
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton>
                  <Briefcase className="mr-2 h-4 w-4" />
                  <span>Missions</span>
                  <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${openMissions ? "rotate-180" : ""}`} />
                </SidebarMenuButton>
              </CollapsibleTrigger>
            </SidebarMenuItem>
            <CollapsibleContent>
              <div className="pl-6 pt-1">
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/dashboard/missions"}>
                      <Link href="/dashboard/missions">
                        <span>Liste des missions</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/dashboard/ordres-mission"}>
                      <Link href="/dashboard/ordres-mission">
                        <span>Ordres de mission</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/dashboard/decharges"}>
                      <Link href="/dashboard/decharges">
                        <span>Décharges</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/dashboard/rapports"}>
                      <Link href="/dashboard/rapports">
                        <span>Rapports</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Administration */}
          <Collapsible open={openAdmin} onOpenChange={setOpenAdmin}>
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton>
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Administration</span>
                  <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${openAdmin ? "rotate-180" : ""}`} />
                </SidebarMenuButton>
              </CollapsibleTrigger>
            </SidebarMenuItem>
            <CollapsibleContent>
              <div className="pl-6 pt-1">
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/dashboard/utilisateurs"}>
                      <Link href="/dashboard/utilisateurs">
                        <span>Utilisateurs</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/dashboard/profils"}>
                      <Link href="/dashboard/profils">
                        <span>Profils</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/dashboard/grades"}>
                      <Link href="/dashboard/grades">
                        <span>Grades</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/dashboard/menus"}>
                      <Link href="/dashboard/menus">
                        <span>Menus</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <div className="text-sm">
              <p className="font-medium">John Doe</p>
              <p className="text-xs text-muted-foreground">Matricule: 12345</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full">
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
