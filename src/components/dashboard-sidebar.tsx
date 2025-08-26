"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { Briefcase, ChevronDown, Home, LogOut, Shield, User, Package, FileText, Settings, CheckSquare, Clock, Sparkles, Target, Zap, MapPin, Cross, X } from 'lucide-react'
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
import { useEffect, useState } from "react"
import { useAuth, getRoleDisplayName } from "@/hooks/use-auth"
import { Badge } from "@/components/ui/badge"
import { apiService } from "@/lib/api"

export function DashboardSidebar() {
  const t = useTranslations("DashboardSidebar")
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

  // Fonction pour vérifier si l'utilisateur a accès à un élément spécifique
  const hasAccessToMandatItem = (itemPath: string) => {
    if (hasPermission(["ADMIN"])) return true
    if (hasPermission(["DIRECTEUR_RESSOURCES_HUMAINES"])) return true
    if (hasPermission(["AGENT_RESSOURCES_HUMAINES"])) {
      // Agent RH n'a pas accès à "en-attente-confirmation"
      return itemPath !== "en-attente-confirmation"
    }
    if (hasPermission(["AGENT_ART"])) {
      // Agent ART n'a accès qu'à "mes-mandats"
      return itemPath === "mes-mandats" || itemPath === "acheve-avec-rapport"
    }
    if (hasPermission(["DIRECTEUR_PATRIMOINE"])) {
      // Directeur Patrimoine n'a accès qu'à "mes-mandats"
      return itemPath === "mes-mandats"
    }
    return false
  }

  const hasAccessToOrdreItem = (itemPath: string) => {
    if (hasPermission(["ADMIN"])) return true
    if (hasPermission(["DIRECTEUR_RESSOURCES_HUMAINES"])) return true
    if (hasPermission(["AGENT_RESSOURCES_HUMAINES"])) {
      // Agent RH n'a pas accès à "en-attente-confirmation"
      return itemPath !== "en-attente-confirmation"
    }
    if (hasPermission(["AGENT_ART"])) {
      // Agent ART n'a accès qu'à "mes-ordres-mission"
      return itemPath === "mes-ordres-mission"
    }
    if (hasPermission(["DIRECTEUR_PATRIMOINE"])) {
      // Directeur Patrimoine n'a accès qu'à "mes-ordres-mission"
      return itemPath === "mes-ordres-mission"
    }
    return false
  }

  const canCreateMandat = () => {
    return hasPermission(["ADMIN", "AGENT_RESSOURCES_HUMAINES"])
  }

  const canCreateOrdre = () => {
    return hasPermission(["ADMIN", "AGENT_RESSOURCES_HUMAINES"])
  }

  const hasAccessToMandatsModule = () => {
    return hasPermission(["ADMIN", "DIRECTEUR_RESSOURCES_HUMAINES", "AGENT_RESSOURCES_HUMAINES", "AGENT_ART", "DIRECTEUR_PATRIMOINE"])
  }

  const hasAccessToOrdresModule = () => {
    return hasPermission(["ADMIN", "DIRECTEUR_RESSOURCES_HUMAINES", "AGENT_RESSOURCES_HUMAINES", "AGENT_ART", "DIRECTEUR_PATRIMOINE"])
  }

  const hasAccessToConfigModule = () => {
    return hasPermission(["ADMIN"])
  }

  const hasAccessToRessources = () => {
    return hasPermission(["ADMIN", "DIRECTEUR_PATRIMOINE"])
  }

  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [countsOM, setCountsOM] = useState({});
  const [loadingOM, setLoadingOM] = useState(true);

  useEffect(() => {
    const fetchAllCounts = async () => {
      try {
        setLoading(true);
                
        const [
          enAttenteConfirmation,
          enAttenteExecution,
          enCours,
          acheve,
          acheveAvecRapport,
          mesMandats,
          tous
        ] = await Promise.all([
          apiService.getMandatsEnAttenteConfirmation(),
          apiService.getMandatsEnAttenteExecution(),
          apiService.getMandatsEnCours(),
          apiService.getMandatsAcheves(),
          apiService.getMandatsAchevesAvecRapport(),
          apiService.getMesMandats(),
          apiService.getAllMandats()
        ]);

        setCounts({
          'en-attente-confirmation': enAttenteConfirmation.length,
          'en-attente-execution': enAttenteExecution.length,
          'en-cours': enCours.length,
          'acheve': acheve.length,
          'acheve-avec-rapport': acheveAvecRapport.length,
          'mes-mandats': mesMandats.length,
          'tous': tous.length,
        })

        setLoadingOM(true);
        const [
          omEnAttenteJustificatif,
          omEnAttenteConfirmation,
          omEnAttenteExecution,
          omEnCours,
          omAcheve,
          omRejete,
          mesOrdresMission,
          tousOrdresMission
        ] = await Promise.all([
          apiService.getOrdresMissionEnAttenteJustificatif(),
          apiService.getOrdresMissionEnAttenteConfirmation(),
          apiService.getOrdresMissionEnAttenteExecution(),
          apiService.getOrdresMissionEnCours(),
          apiService.getOrdresMissionAcheves(),
          apiService.getOrdresMissionRejetes(),
          apiService.getMesOrdresMission(),
          apiService.getAllOrdresMission()
        ]);

        setCountsOM({
          'en-attente-justificatif': omEnAttenteJustificatif.length,
          'en-attente-confirmation': omEnAttenteConfirmation.length,
          'en-attente-execution': omEnAttenteExecution.length,
          'en-cours': omEnCours.length,
          'acheve': omAcheve.length,
          'rejete': omRejete.length,
          'mes-ordres-mission': mesOrdresMission.length,
          'tous': tousOrdresMission.length,
        });
              
      } catch (error) {
        console.error('Erreur lors du chargement des counts:', error);
      } finally {
        setLoading(false);
        setLoadingOM(false);
      }
    };

    fetchAllCounts();
  }, []);

  const mandatItems = [
    { path: "en-attente-confirmation", label: t("mandats.items.enAttenteConfirmation"), color: "green", icon: Clock },
    { path: "en-attente-execution", label: t("mandats.items.enAttenteExecution"), color: "green", icon: Clock },
    { path: "en-cours", label: t("mandats.items.enCours"), color: "green", icon: Zap },
    { path: "acheve", label: t("mandats.items.acheve"), color: "green", icon: CheckSquare },
    { path: "acheve-avec-rapport", label: t("mandats.items.acheveAvecRapport"), color: "green", icon: CheckSquare },
    { path: "mes-mandats", label: t("mandats.items.mesMandats"), color: "green", icon: User },
    { path: "tous", label: t("mandats.items.tous"), color: "green", icon: Briefcase },
  ];

  const ordreItems = [
    {path: "en-attente-justificatif", label: t("ordres.items.enAttenteJustificatif"), color: "green", icon: FileText },
    {path: "en-attente-confirmation", label: t("ordres.items.enAttenteConfirmation"), color: "green", icon: Clock },
    {path: "en-attente-execution", label: t("ordres.items.enAttenteExecution"), color: "green", icon: Clock },
    {path: "en-cours", label: t("ordres.items.enCours"), color: "green", icon: Zap },
    {path: "acheve", label: t("ordres.items.acheve"), color: "green", icon: CheckSquare },
    {path: "rejete", label: t("ordres.items.rejete"), color: "green", icon: X },
    {path: "mes-ordres-mission", label: t("ordres.items.mesOrdresMission"), color: "green", icon: User },
    {path: "tous", label: t("ordres.items.tous"), color: "green", icon: Briefcase },
  ]

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-blue-200">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-blue-100 opacity-20 animate-pulse"></div>
          </div>
          <p className="mt-6 text-blue-800 font-medium">{t("loading.message")}</p>
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
    <Sidebar className="border-r-0 shadow-xl bg-gradient-to-b from-white via-blue-50/30 to-blue-100/20 bg-blue-500 w-80">
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
          {hasAccessToMandatsModule() && (
            <div className="mt-4">
                            
              <Collapsible open={openMissions} onOpenChange={setOpenMissions}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all duration-300 hover:shadow-md hover:scale-[1.02] border border-green-200">
                      <div className="flex items-center py-3 px-4 w-full">
                        <div className="relative">
                          <Briefcase className="mr-3 h-5 w-5 text-green-700" />
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                        </div>
                        <span className="font-bold text-green-900 tracking-wide">{t("mandats.title")}</span>
                        <ChevronDown
                          className={`ml-auto h-4 w-4 text-green-700 transition-transform duration-300 ${openMissions ? "rotate-180" : ""}`}
                        />
                      </div>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                </SidebarMenuItem>
                <CollapsibleContent className="transition-all duration-300">
                  <div className="pl-4 pt-2 space-y-1">
                    <SidebarMenu>
                      {/* Création de mandat */}
                      {canCreateMandat() && (
                        <SidebarMenuItem>
                          <SidebarMenuButton
                             asChild
                             className={`
                              ${pathname.endsWith("/dashboard/mandats/enregistrer-mandat")
                                 ? "bg-gradient-to-r from-blue-100 to-blue-200 border-l-green-500 text-blue-900"
                                 : "hover:bg-gradient-to-r hover:from-green-50 hover:to-yellow-50"
                              }
                            `}
                          >
                            <button onClick={() => navigateTo("/dashboard/mandats/enregistrer-mandat")} className="w-full">
                              <div className="flex items-center py-2 px-4">
                                <Target className="mr-2 h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium">{t("mandats.actions.create")}</span>
                              </div>
                            </button>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )}

                      {mandatItems
        .filter(item => hasAccessToMandatItem(item.path))
        .map((item) => (
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
                  <div className="flex items-center">
                    <item.icon className="mr-2 h-4 w-4 text-black" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <Badge className={`bg-${item.color}-100 text-${item.color}-800 text-xs px-2 py-1 ${loading ? 'animate-pulse' : ''}`}>
                    {loading ? '...' : (counts[item.path as keyof typeof counts] || 0)}
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
          {hasAccessToOrdresModule() && (
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
                        <span className="font-bold text-green-900 tracking-wide">{t("ordres.title")}</span>
                        <ChevronDown className={`ml-auto h-4 w-4 text-green-700 transition-transform duration-300 ${openOrdres ? "rotate-180" : ""}`} />
                      </div>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                </SidebarMenuItem>
                <CollapsibleContent className="transition-all duration-300">
                  <div className="pl-4 pt-2 space-y-1">
                    <SidebarMenu>
                      {/* Création d'ordre de mission */}
                      {canCreateOrdre() && (
                        <SidebarMenuItem>
                          <SidebarMenuButton
                             asChild
                             className={`
                              rounded-lg transition-all duration-200 hover:shadow-sm hover:scale-[1.01] border-l-4 border-l-transparent hover:border-l-green-500
                              ${pathname.endsWith("/dashboard/ordres-mission/create")
                                 ? "bg-gradient-to-r from-green-100 to-green-200 border-l-green-500 text-green-900"
                                 : "hover:bg-gradient-to-r hover:from-green-50 hover:to-yellow-50"
                              }
                            `}
                          >
                            <button onClick={() => navigateTo("/dashboard/ordres-mission/create") } className="w-full">
                              <div className="flex items-center py-2 px-4">
                                <Target className="mr-2 h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium">{t("ordres.actions.create")}</span>
                              </div>
                            </button>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )}

                      {ordreItems
                        .filter(item => hasAccessToOrdreItem(item.path))
                        .map((item) => (
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
                                  <div className="flex items-center">
                                    <item.icon className="mr-2 h-4 w-4 text-black" />
                                    <span className="text-sm font-medium">{item.label}</span>
                                  </div>
                                  <Badge className={`bg-${item.color}-100 text-${item.color}-800 text-xs px-2 py-1 ${loadingOM ? 'animate-pulse' : ''}`}>
                                    {loadingOM ? '...' : (countsOM[item.path as keyof typeof countsOM] || 0)}
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

          {/* RESSOURCES - Module séparé pour Directeur Patrimoine */}
          {hasAccessToRessources() && (
            <div className="mt-4">
              <SidebarMenuItem>
                <SidebarMenuButton
                   asChild
                   className={`
                    rounded-xl bg-gradient-to-r from-green-50 to-green-50 hover:from-green-50 hover:to-green-50 transition-all duration-300 hover:shadow-md hover:scale-[1.02] border border-green-50
                    ${pathname.endsWith("/dashboard/ressources")
                       ? "bg-gradient-to-r from-green-50 to-green-50 border-l-green-50 text-green-900"
                       : "hover:bg-gradient-to-r hover:from-green-50 hover:to-yellow-50"
                    }
                  `}
                >
                  <button onClick={() => navigateTo("/dashboard/ressources")} className="w-full">
                    <div className="flex items-center py-3 px-4">
                      <div className="relative">
                        <Package className="mr-3 h-5 w-5 text-green-700" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                      <span className="font-bold text-green-900 tracking-wide">{t("ressources.title")}</span>
                    </div>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </div>
          )}

          {/* CONFIGURATIONS */}
          {hasAccessToConfigModule() && (
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
                        <span className="font-bold text-green-900 tracking-wide">{t("configurations.title")}</span>
                        <ChevronDown className={`ml-auto h-4 w-4 text-yellow-700 transition-transform duration-300 ${openAdmin ? "rotate-180" : ""}`} />
                      </div>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                </SidebarMenuItem>
                <CollapsibleContent className="transition-all duration-300">
                  <div className="pl-4 pt-2 space-y-1">
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                           asChild
                           className={`
                            ${pathname.endsWith("/dashboard/configurations/register")
                               ? "bg-gradient-to-r from-blue-100 to-blue-200 border-l-blue-500 text-blue-900"
                               : "hover:bg-gradient-to-r hover:from-blue-50 hover:to-yellow-50"
                            }
                          `}
                        >
                          <button onClick={() => navigateTo("/dashboard/configurations/register")} className="w-full">
                            <div className="flex items-center py-2 px-4">
                              <User className="mr-2 h-4 w-4" />
                              <span className="text-sm font-medium">{t("configurations.items.createUser")}</span>
                            </div>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                           asChild
                           className={`
                            ${pathname.endsWith("/dashboard/configurations/users")
                               ? "bg-gradient-to-r from-green-100 to-green-200 border-l-green-500 text-green-900"
                               : "hover:bg-gradient-to-r hover:from-green-50 hover:to-yellow-50"
                            }
                          `}
                        >
                          <button onClick={() => navigateTo("/dashboard/configurations/users")} className="w-full">
                            <div className="flex items-center py-2 px-4">
                              <Settings className="mr-2 h-4 w-4" />
                              <span className="text-sm font-medium">{t("configurations.items.manageUsers")}</span>
                            </div>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                           asChild
                           className={`
                            ${pathname.endsWith("/dashboard/configurations/rang")
                               ? "bg-gradient-to-r from-indigo-100 to-indigo-200 border-l-indigo-500 text-indigo-900"
                               : "hover:bg-gradient-to-r hover:from-indigo-50 hover:to-yellow-50"
                            }
                          `}
                        >
                          <button onClick={() => navigateTo("/dashboard/configurations/rang")} className="w-full">
                            <div className="flex items-center py-2 px-4">
                              <Shield className="mr-2 h-4 w-4" />
                              <span className="text-sm font-medium">{t("configurations.items.ranks")}</span>
                            </div>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                           asChild
                           className={`
                            ${pathname.endsWith("/dashboard/configurations/villes")
                               ? "bg-gradient-to-r from-pink-100 to-pink-200 border-l-pink-500 text-pink-900"
                               : "hover:bg-gradient-to-r hover:from-pink-50 hover:to-yellow-50"
                            }
                          `}
                        >
                          <button onClick={() => navigateTo("/dashboard/configurations/villes")} className="w-full">
                            <div className="flex items-center py-2 px-4">
                              <MapPin className="mr-2 h-4 w-4" />
                              <span className="text-sm font-medium">{t("configurations.items.manageCities")}</span>
                            </div>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                                          
                    </SidebarMenu>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}
        </SidebarMenu>
      </SidebarContent>
          
    </Sidebar>
  )
}
