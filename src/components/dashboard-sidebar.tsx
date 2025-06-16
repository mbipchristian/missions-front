"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"
import { useLocale } from "next-intl"
import {
  Briefcase,
  ChevronDown,
  Home,
  LogOut,
  Shield,
  User,
  Package,
  FileText,
  Settings,
  CheckSquare,
  Clock,
} from "lucide-react"
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
import { useAuth, getRoleDisplayName } from "@/hooks/use-auth"
import { Badge } from "@/components/ui/badge"

export function DashboardSidebar() {
  const pathname = usePathname()
  const [openMissions, setOpenMissions] = useState(true)
  const [openOrdres, setOpenOrdres] = useState(false)
  const [openRessources, setOpenRessources] = useState(false)
  const [openAdmin, setOpenAdmin] = useState(false)
  const [openApprobations, setOpenApprobations] = useState(false)
  const router = useRouter()
  const locale = useLocale()
  const { user, logout, hasPermission } = useAuth()

  const navigateTo = (path: string) => {
    router.push(`/${locale}${path}`)
  }

  const handleLogout = () => {
    logout()
    router.push(`/${locale}`)
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <Sidebar>
      <SidebarHeader className="flex h-14 items-center border-b px-6">
        <Link href={`/${locale}/dashboard`} className="flex items-center gap-2 font-semibold">
          <Shield className="h-6 w-6" />
          <span>ART Dashboard</span>
        </Link>
        <SidebarTrigger className="ml-auto md:hidden" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {/* Dashboard principal */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.endsWith("/dashboard")}>
              <button onClick={() => navigateTo("/dashboard")}>
                <Home className="mr-2 h-4 w-4" />
                <span>TABLEAU DE BORD</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* MISSIONS - Visible pour Agent RH et Directeur RH */}
          {hasPermission(["AGENT_RESSOURCES_HUMAINES", "DIRECTEUR_RESSOURCES_HUMAINES", "ADMIN"]) && (
            <Collapsible open={openMissions} onOpenChange={setOpenMissions}>
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton>
                    <Briefcase className="mr-2 h-4 w-4" />
                    <span>MANDATS</span>
                    <ChevronDown
                      className={`ml-auto h-4 w-4 transition-transform ${openMissions ? "rotate-180" : ""}`}
                    />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
              </SidebarMenuItem>
              <CollapsibleContent>
                <div className="pl-6 pt-1">
                  <SidebarMenu>
                    {/* Création de mandat - Agent RH uniquement */}
                    {hasPermission(["AGENT_RESSOURCES_HUMAINES"]) && (
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname.endsWith("/dashboard/mandats/create")}>
                          <button onClick={() => navigateTo("/dashboard/mandats/create")}>
                            <span>Créer un mandat</span>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}

                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname.endsWith("/dashboard/mandats")}>
                        <button onClick={() => navigateTo("/dashboard/mandats")}>
                          <span>Journal des mandats</span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname.endsWith("/dashboard/etapes")}>
                        <button onClick={() => navigateTo("/dashboard/etapes")}>
                          <span>Étapes de missions</span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* ORDRES DE MISSIONS - Visible pour Agent RH et Directeur RH */}
          {hasPermission(["AGENT_RESSOURCES_HUMAINES", "DIRECTEUR_RESSOURCES_HUMAINES", "ADMIN"]) && (
            <Collapsible open={openOrdres} onOpenChange={setOpenOrdres}>
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton>
                    <FileText className="mr-2 h-4 w-4" />
                    <span>ORDRES DE MISSIONS</span>
                    <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${openOrdres ? "rotate-180" : ""}`} />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
              </SidebarMenuItem>
              <CollapsibleContent>
                <div className="pl-6 pt-1">
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname.endsWith("/dashboard/ordres-mission")}>
                        <button onClick={() => navigateTo("/dashboard/ordres-mission")}>
                          <span>Gérer les ordres</span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    {/* Gestion des pièces jointes - Agent RH uniquement */}
                    {hasPermission(["AGENT_RESSOURCES_HUMAINES"]) && (
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname.endsWith("/dashboard/pieces-jointes")}>
                          <button onClick={() => navigateTo("/dashboard/pieces-jointes")}>
                            <span>Pièces jointes</span>
                            <Badge variant="secondary" className="ml-auto">
                              12
                            </Badge>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                  </SidebarMenu>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* APPROBATIONS - Visible uniquement pour Directeur RH */}
          {hasPermission(["DIRECTEUR_RESSOURCES_HUMAINES", "ADMIN"]) && (
            <Collapsible open={openApprobations} onOpenChange={setOpenApprobations}>
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton>
                    <CheckSquare className="mr-2 h-4 w-4" />
                    <span>APPROBATIONS</span>
                    <Badge variant="destructive" className="ml-auto">
                      5
                    </Badge>
                    <ChevronDown
                      className={`ml-2 h-4 w-4 transition-transform ${openApprobations ? "rotate-180" : ""}`}
                    />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
              </SidebarMenuItem>
              <CollapsibleContent>
                <div className="pl-6 pt-1">
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname.endsWith("/dashboard/approbations/mandats")}>
                        <button onClick={() => navigateTo("/dashboard/approbations/mandats")}>
                          <span>Mandats en attente</span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname.endsWith("/dashboard/approbations/ordres")}>
                        <button onClick={() => navigateTo("/dashboard/approbations/ordres")}>
                          <span>Ordres en attente</span>
                          <Badge variant="outline" className="ml-auto bg-blue-100 text-blue-800">
                            7
                          </Badge>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* MES MISSIONS - Visible pour tous les utilisateurs */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.endsWith("/dashboard/mes-missions")}>
              <button onClick={() => navigateTo("/dashboard/mes-missions")}>
                <Clock className="mr-2 h-4 w-4" />
                <span>MES MISSIONS</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* RESSOURCES - Visible pour AGENT_ART et ADMIN */}
          {hasPermission(["AGENT_ART", "ADMIN"]) && (
            <Collapsible open={openRessources} onOpenChange={setOpenRessources}>
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton>
                    <Package className="mr-2 h-4 w-4" />
                    <span>RESSOURCES</span>
                    <ChevronDown
                      className={`ml-auto h-4 w-4 transition-transform ${openRessources ? "rotate-180" : ""}`}
                    />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
              </SidebarMenuItem>
              <CollapsibleContent>
                <div className="pl-6 pt-1">
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname.endsWith("/dashboard/ressources")}>
                        <button onClick={() => navigateTo("/dashboard/ressources")}>
                          <span>Gérer les ressources</span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname.endsWith("/dashboard/configurations/villes")}>
                        <button onClick={() => navigateTo("/dashboard/configurations/villes")}>
                          <span>Gérer les villes</span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* CONFIGURATIONS - Visible selon les rôles */}
          <Collapsible open={openAdmin} onOpenChange={setOpenAdmin}>
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>CONFIGURATIONS</span>
                  <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${openAdmin ? "rotate-180" : ""}`} />
                </SidebarMenuButton>
              </CollapsibleTrigger>
            </SidebarMenuItem>
            <CollapsibleContent>
              <div className="pl-6 pt-1">
                <SidebarMenu>
                  {/* Création de comptes - RH et Admin uniquement */}
                  {hasPermission(["AGENT_RESSOURCES_HUMAINES", "DIRECTEUR_RESSOURCES_HUMAINES", "ADMIN"]) && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname.endsWith("/dashboard/configurations/register")}>
                        <button onClick={() => navigateTo("/dashboard/configurations/register")}>
                          <span>Créer un compte utilisateur</span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}

                  {/* Gestion des utilisateurs - RH et Admin uniquement */}
                  {hasPermission(["AGENT_RESSOURCES_HUMAINES", "DIRECTEUR_RESSOURCES_HUMAINES", "ADMIN"]) && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname.endsWith("/dashboard/configurations/users")}>
                        <button onClick={() => navigateTo("/dashboard/configurations/users")}>
                          <span>Gérer les utilisateurs</span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}

                  {/* Fonctions - Directeur RH et Admin uniquement */}
                  {hasPermission(["DIRECTEUR_RESSOURCES_HUMAINES", "ADMIN"]) && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname.endsWith("/dashboard/configurations/fonctions")}>
                        <button onClick={() => navigateTo("/dashboard/configurations/fonctions")}>
                          <span>Fonctions</span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}

                  {/* Rangs - Directeur RH et Admin uniquement */}
                  {hasPermission(["DIRECTEUR_RESSOURCES_HUMAINES", "ADMIN"]) && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname.endsWith("/dashboard/configurations/rangs")}>
                        <button onClick={() => navigateTo("/dashboard/configurations/rangs")}>
                          <span>Rangs</span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="h-5 w-5 text-gray-600" />
            </div>
            <div className="text-sm">
              <p className="font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.fonction?.nom || "Fonction non définie"}</p>
            </div>
          </div>
          <Badge variant="outline" className="w-fit">
            {getRoleDisplayName(user.role.name)}
          </Badge>
          <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
