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
  Sparkles,
  Target,
  Zap,
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
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-blue-200">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-blue-100 opacity-20 animate-pulse"></div>
          </div>
          <p className="mt-6 text-blue-800 font-medium">Chargement de votre espace...</p>
          <div className="flex justify-center space-x-1 mt-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Sidebar className="border-r-0 shadow-xl bg-gradient-to-b from-white via-blue-50/30 to-blue-100/20 bg-blue-500 w-100">
     <SidebarHeader className="flex h-14 items-center border-b px-6 bg-white">
        <Link href={`/${locale}/dashboard`} className="flex items-center gap-2 font-semibold">
          <Shield className="h-6 w-6" />
          <span></span>
        </Link>
        <SidebarTrigger className="ml-auto md:hidden" />
      </SidebarHeader>
      <SidebarContent className="bg-gradient-to-b from-white to-gray-50/50">
        <SidebarMenu className="p-2">
          

          {/* MISSIONS - Design amélioré */}
          {hasPermission(["AGENT_RESSOURCES_HUMAINES", "DIRECTEUR_RESSOURCES_HUMAINES", "ADMIN"]) && (
            <div className="mt-4">
              
              <Collapsible open={openMissions} onOpenChange={setOpenMissions}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all duration-300 hover:shadow-md hover:scale-[1.02] border border-blue-200">
                      <div className="flex items-center py-3 px-4 w-full">
                        <div className="relative">
                          <Briefcase className="mr-3 h-5 w-5 text-blue-700" />
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                        </div>
                        <span className="font-bold text-blue-900 tracking-wide">MANDATS</span>
                        <ChevronDown
                          className={`ml-auto h-4 w-4 text-blue-700 transition-transform duration-300 ${openMissions ? "rotate-180" : ""}`}
                        />
                      </div>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                </SidebarMenuItem>
                <CollapsibleContent className="transition-all duration-300">
                  <div className="pl-4 pt-2 space-y-1">
                    <SidebarMenu>
                      {/* Création de mandat */}
                      {hasPermission(["AGENT_RESSOURCES_HUMAINES", "ADMIN"]) && (
                        <SidebarMenuItem>
                          <SidebarMenuButton 
                            asChild 
                            className={`
                              rounded-lg transition-all duration-200 hover:shadow-sm hover:scale-[1.01] border-l-4 border-l-transparent hover:border-l-green-500
                              ${pathname.endsWith("/dashboard/mandats/enregistrer-mandat") 
                                ? "bg-gradient-to-r from-blue-100 to-blue-200 border-l-green-500 text-blue-900" 
                                : "hover:bg-gradient-to-r hover:from-green-50 hover:to-yellow-50"
                              }
                            `}
                          >
                            <button onClick={() => navigateTo("/dashboard/mandats/enregistrer-mandat")} className="w-full">
                              <div className="flex items-center py-2 px-4">
                                <Target className="mr-2 h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium">Enregistrer un mandat</span>
                              </div>
                            </button>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )}

                      {[
                        { path: "en-attente-confirmation", label: "En attente de confirmation", color: "yellow", count: "3" },
                        { path: "en-attente-execution", label: "En attente d'exécution", color: "yellow", count: "5" },
                        { path: "en-cours", label: "En cours", color: "yellow", count: "8" },
                        { path: "acheve", label: "Achevé", color: "yellow", count: "12" },
                        { path: "mes-mandats", label: "Mes mandats", color: "yellow", count: "4" },
                        { path: "tous", label: "Tous les mandats", color: "yellow", count: "32" },
                      ].map((item) => (
                        <SidebarMenuItem key={item.path}>
                          <SidebarMenuButton 
                            asChild 
                            className={`
                              rounded-lg transition-all duration-200 hover:shadow-sm hover:scale-[1.01] border-l-4 border-l-transparent hover:border-l-${item.color}-500
                              ${pathname.endsWith(`/dashboard/mandats/${item.path}`) 
                                ? `bg-gradient-to-r from-${item.color}-100 to-${item.color}-200 border-l-${item.color}-500 text-${item.color}-900` 
                                : `hover:bg-gradient-to-r hover:from-${item.color}-50 hover:to-blue-50`
                              }
                            `}
                          >
                            <button onClick={() => navigateTo(`/dashboard/mandats/${item.path}`)} className="w-full">
                              <div className="flex items-center justify-between py-2 px-4">
                                <span className="text-sm font-medium">{item.label}</span>
                                <Badge className={`bg-${item.color}-100 text-${item.color}-800 text-xs px-2 py-1 animate-pulse`}>
                                  {item.count}
                                </Badge>
                              </div>
                            </button>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}

          {/* ORDRES DE MISSIONS */}
          {hasPermission(["AGENT_RESSOURCES_HUMAINES", "DIRECTEUR_RESSOURCES_HUMAINES", "ADMIN"]) && (
            <div className="mt-4">
              <Collapsible open={openOrdres} onOpenChange={setOpenOrdres}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all duration-300 hover:shadow-md hover:scale-[1.02] border border-green-200">
                      <div className="flex items-center py-3 px-4 w-full">
                        <div className="relative">
                          <FileText className="mr-3 h-5 w-5 text-green-700" />
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        </div>
                        <span className="font-bold text-green-900 tracking-wide">ORDRES DE MISSIONS</span>
                        <ChevronDown className={`ml-auto h-4 w-4 text-green-700 transition-transform duration-300 ${openOrdres ? "rotate-180" : ""}`} />
                      </div>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                </SidebarMenuItem>
                <CollapsibleContent className="transition-all duration-300">
                  <div className="pl-4 pt-2 space-y-1">
                    <SidebarMenu>
                      {[
                        { path: "en-attente-justificatif", label: "En attente de pièce jointe", color: "yellow", count: "" },
                        { path: "en-attente-confirmation", label: "En attente de confirmation", color: "yellow", count: "" },
                        { path: "en-attente-execution", label: "En attente d'exécution", color: "yellow", count: "" },
                        { path: "en-cours", label: "En cours", color: "yellow", count: "" },
                        { path: "acheve", label: "Achevé", color: "yellow", count: "" },
                        { path: "mes-ordres-mission", label: "Mes ordres de missions", color: "yellow", count: "" },
                      ].map((item) => (
                        <SidebarMenuItem key={item.path}>
                          <SidebarMenuButton 
                            asChild 
                            className={`
                              rounded-lg transition-all duration-200 hover:shadow-sm hover:scale-[1.01] border-l-4 border-l-transparent hover:border-l-${item.color}-500
                              ${pathname.endsWith(`/dashboard/ordres-mission/${item.path}`) 
                                ? `bg-gradient-to-r from-${item.color}-100 to-${item.color}-200 border-l-${item.color}-500 text-${item.color}-900` 
                                : `hover:bg-gradient-to-r hover:from-${item.color}-50 hover:to-green-50`
                              }
                            `}
                          >
                            <button onClick={() => navigateTo(`/dashboard/ordres-mission/${item.path}`)} className="w-full">
                              <div className="flex items-center justify-between py-2 px-4">
                                <span className="text-sm font-medium">{item.label}</span>
                                <Badge className={`bg-${item.color}-100 text-${item.color}-800 text-xs px-2 py-1 animate-pulse`}>
                                  {item.count}
                                </Badge>
                              </div>
                            </button>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}

          {/* CONFIGURATIONS */}
          <div className="mt-4">
            <Collapsible open={openAdmin} onOpenChange={setOpenAdmin}>
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all duration-300 hover:shadow-md hover:scale-[1.02] border border-green-200">
                    <div className="flex items-center py-3 px-4 w-full">
                      <div className="relative">
                        <Settings className="mr-3 h-5 w-5 text-green-700" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                      <span className="font-bold text-green-900 tracking-wide">CONFIGURATIONS</span>
                      <ChevronDown className={`ml-auto h-4 w-4 text-yellow-700 transition-transform duration-300 ${openAdmin ? "rotate-180" : ""}`} />
                    </div>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
              </SidebarMenuItem>
              <CollapsibleContent className="transition-all duration-300">
                <div className="pl-4 pt-2 space-y-1">
                  <SidebarMenu>
                    {hasPermission(["AGENT_RESSOURCES_HUMAINES", "DIRECTEUR_RESSOURCES_HUMAINES", "ADMIN"]) && (
                      <>
                        <SidebarMenuItem>
                          <SidebarMenuButton 
                            asChild 
                            className={`
                              rounded-lg transition-all duration-200 hover:shadow-sm hover:scale-[1.01] border-l-4 border-l-transparent hover:border-l-blue-500
                              ${pathname.endsWith("/dashboard/configurations/register") 
                                ? "bg-gradient-to-r from-blue-100 to-blue-200 border-l-blue-500 text-blue-900" 
                                : "hover:bg-gradient-to-r hover:from-blue-50 hover:to-yellow-50"
                              }
                            `}
                          >
                            <button onClick={() => navigateTo("/dashboard/configurations/register")} className="w-full">
                              <div className="flex items-center py-2 px-4">
                                <User className="mr-2 h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium">Créer un compte utilisateur</span>
                              </div>
                            </button>
                          </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                          <SidebarMenuButton 
                            asChild 
                            className={`
                              rounded-lg transition-all duration-200 hover:shadow-sm hover:scale-[1.01] border-l-4 border-l-transparent hover:border-l-green-500
                              ${pathname.endsWith("/dashboard/configurations/users") 
                                ? "bg-gradient-to-r from-green-100 to-green-200 border-l-green-500 text-green-900" 
                                : "hover:bg-gradient-to-r hover:from-green-50 hover:to-yellow-50"
                              }
                            `}
                          >
                            <button onClick={() => navigateTo("/dashboard/configurations/users")} className="w-full">
                              <div className="flex items-center py-2 px-4">
                                <Settings className="mr-2 h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium">Gérer les utilisateurs</span>
                              </div>
                            </button>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      </>
                    )}

                    {hasPermission(["DIRECTEUR_RESSOURCES_HUMAINES", "ADMIN"]) && (
                      <>
                        <SidebarMenuItem>
                          <SidebarMenuButton 
                            asChild 
                            className={`
                              rounded-lg transition-all duration-200 hover:shadow-sm hover:scale-[1.01] border-l-4 border-l-transparent hover:border-l-purple-500
                              ${pathname.endsWith("/dashboard/configurations/fonctions") 
                                ? "bg-gradient-to-r from-purple-100 to-purple-200 border-l-purple-500 text-purple-900" 
                                : "hover:bg-gradient-to-r hover:from-purple-50 hover:to-yellow-50"
                              }
                            `}
                          >
                            <button onClick={() => navigateTo("/dashboard/configurations/fonctions")} className="w-full">
                              <div className="flex items-center py-2 px-4">
                                <Briefcase className="mr-2 h-4 w-4 text-purple-600" />
                                <span className="text-sm font-medium">Fonctions</span>
                              </div>
                            </button>
                          </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                          <SidebarMenuButton 
                            asChild 
                            className={`
                              rounded-lg transition-all duration-200 hover:shadow-sm hover:scale-[1.01] border-l-4 border-l-transparent hover:border-l-indigo-500
                              ${pathname.endsWith("/dashboard/configurations/rangs") 
                                ? "bg-gradient-to-r from-indigo-100 to-indigo-200 border-l-indigo-500 text-indigo-900" 
                                : "hover:bg-gradient-to-r hover:from-indigo-50 hover:to-yellow-50"
                              }
                            `}
                          >
                            <button onClick={() => navigateTo("/dashboard/configurations/rangs")} className="w-full">
                              <div className="flex items-center py-2 px-4">
                                <Shield className="mr-2 h-4 w-4 text-indigo-600" />
                                <span className="text-sm font-medium">Rangs</span>
                              </div>
                            </button>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      </>
                    )}
                  </SidebarMenu>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </SidebarMenu>
      </SidebarContent>

      
    </Sidebar>
  )
}