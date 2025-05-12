"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRouter} from "next/navigation"
import { useLocale } from "next-intl"
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
  const router = useRouter()
  const locale = useLocale() // Récupérez la locale actuelle

  const navigateTo = (path: string) => {
    router.push(`/${locale}${path}`)
  }
  
  return (
    <Sidebar>
      <SidebarHeader className="flex h-14 items-center border-b px-6">
        <Link href={`/${locale}/dashboard`} className="flex items-center gap-2 font-semibold">
          <Shield className="h-6 w-6" />
          <span>Nom de mon appli</span>
        </Link>
        <SidebarTrigger className="ml-auto md:hidden" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
          <SidebarMenuButton 
              asChild 
              isActive={pathname.endsWith("/dashboard")}
            >
              <button onClick={() => navigateTo("/dashboard")}>
                <Home className="mr-2 h-4 w-4" />
                <span>AGENCE DE REGULATION DES TELECOMMUNICATIONS</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Missions */}
          <Collapsible open={openMissions} onOpenChange={setOpenMissions}>
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton>
                  <Briefcase className="mr-2 h-4 w-4" />
                  <span>MISSIONS</span>
                  <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${openMissions ? "rotate-180" : ""}`} />
                </SidebarMenuButton>
              </CollapsibleTrigger>
            </SidebarMenuItem>
            <CollapsibleContent>
              <div className="pl-6 pt-1">
                <SidebarMenu>
                  <SidebarMenuItem>
                  <SidebarMenuButton 
                      asChild 
                      isActive={pathname.endsWith("/dashboard/missions")}
                    >
                      <button onClick={() => navigateTo("/dashboard/missions")}>
                        <span>Enrégistrer un mandat de mission</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                  <SidebarMenuButton 
                      asChild 
                      isActive={pathname.endsWith("/dashboard/ordres-mission")}
                    >
                      <button onClick={() => navigateTo("/dashboard/ordres-mission")}>
                        <span>Mes mandats de missions</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                  <SidebarMenuButton 
                      asChild 
                      isActive={pathname.endsWith("/dashboard/decharges")}
                    >
                      <button onClick={() => navigateTo("/dashboard/decharges")}>
                        <span>Journal des mandats de missions</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                  <SidebarMenuButton 
                      asChild 
                      isActive={pathname.endsWith("/dashboard/rapports")}
                    >
                      <button onClick={() => navigateTo("/dashboard/rapports")}>
                        <span>Journal des rapports de missions</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Ordres de missions */}
          <Collapsible open={openMissions} onOpenChange={setOpenMissions}>
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton>
                  <Briefcase className="mr-2 h-4 w-4" />
                  <span>ORDRES DE MISSIONS</span>
                  <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${openMissions ? "rotate-180" : ""}`} />
                </SidebarMenuButton>
              </CollapsibleTrigger>
            </SidebarMenuItem>
            <CollapsibleContent>
              <div className="pl-6 pt-1">
                <SidebarMenu>
                  <SidebarMenuItem>
                  <SidebarMenuButton 
                      asChild 
                      isActive={pathname.endsWith("/dashboard/missions")}
                    >
                      <button onClick={() => navigateTo("/dashboard/missions")}>
                        <span>Enrégistrer un ordre de mission</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                  <SidebarMenuButton 
                      asChild 
                      isActive={pathname.endsWith("/dashboard/ordres-mission")}
                    >
                      <button onClick={() => navigateTo("/dashboard/ordres-mission")}>
                        <span>Mes ordres de missions</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                  <SidebarMenuButton 
                      asChild 
                      isActive={pathname.endsWith("/dashboard/decharges")}
                    >
                      <button onClick={() => navigateTo("/dashboard/decharges")}>
                        <span>Journal des ordres de missions</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* RESSOURCES */}
          <Collapsible open={openMissions} onOpenChange={setOpenMissions}>
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton>
                  <Briefcase className="mr-2 h-4 w-4" />
                  <span>RESSOURCES</span>
                  <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${openMissions ? "rotate-180" : ""}`} />
                </SidebarMenuButton>
              </CollapsibleTrigger>
            </SidebarMenuItem>
            <CollapsibleContent>
              <div className="pl-6 pt-1">
                <SidebarMenu>
                  <SidebarMenuItem>
                  <SidebarMenuButton 
                      asChild 
                      isActive={pathname.endsWith("/dashboard/missions")}
                    >
                      <button onClick={() => navigateTo("/dashboard/missions")}>
                        <span>Ajouter une ressource</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                  <SidebarMenuButton 
                      asChild 
                      isActive={pathname.endsWith("/dashboard/ordres-mission")}
                    >
                      <button onClick={() => navigateTo("/dashboard/ordres-mission")}>
                        <span>Journal des ressources</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Configurations */}
          <Collapsible open={openAdmin} onOpenChange={setOpenAdmin}>
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton>
                  <Shield className="mr-2 h-4 w-4" />
                  <span>CONFIGURATIONS</span>
                  <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${openAdmin ? "rotate-180" : ""}`} />
                </SidebarMenuButton>
              </CollapsibleTrigger>
            </SidebarMenuItem>
            <CollapsibleContent>
              <div className="pl-6 pt-1">
                <SidebarMenu>
                  <SidebarMenuItem>
                  <SidebarMenuButton 
                      asChild 
                      isActive={pathname.endsWith("/dashboard/configurations/register")}
                    >
                      <button onClick={() => navigateTo("/dashboard/configurations/register")}>
                        <span>Créer un compte utilisateur</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                  <SidebarMenuButton 
                      asChild 
                      isActive={pathname.endsWith("/dashboard/profiles")}
                    >
                      <button onClick={() => navigateTo("/dashboard/profiles")}>
                        <span>Liste des utilisateurs</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                  <SidebarMenuButton 
                      asChild 
                      isActive={pathname.endsWith("/dashboard/grades")}
                    >
                      <button onClick={() => navigateTo("/dashboard/grades")}>
                        <span>Profils et Menus</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                  <SidebarMenuButton 
                      asChild 
                      isActive={pathname.endsWith("/dashboard/menus")}
                    >
                      <button onClick={() => navigateTo("/dashboard/menus")}>
                        <span>Grades et Indemnités</span>
                      </button>
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
              <p className="font-medium">Christian MBIP</p>
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
