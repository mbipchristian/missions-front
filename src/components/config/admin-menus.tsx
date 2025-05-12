"use client"

import { useState } from "react"
import { Loader2, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { updateMenuAccess } from "@/app/actions"

// Types pour les menus et les profils
interface MenuItem {
  id: string
  name: string
  description: string
  category: string
}

interface MenuCategory {
  id: string
  name: string
}

type ProfileType = "Agent_ART" | "Agent_RH" | "DP" | "DRH" | "Admin"

interface ProfileAccess {
  profile: ProfileType
  label: string
  menus: string[] // IDs des menus accessibles
}

// Données pour les catégories de menus
const menuCategories: MenuCategory[] = [
  { id: "dashboard", name: "Tableau de bord" },
  { id: "mandats", name: "Mandats de mission" },
  { id: "ordres", name: "Ordres de mission" },
  { id: "rapports", name: "Rapports" },
  { id: "utilisateurs", name: "Utilisateurs" },
  { id: "parametres", name: "Paramètres" },
]

// Données pour les menus
const menuItems: MenuItem[] = [
  {
    id: "dashboard_view",
    name: "Consulter le tableau de bord",
    description: "Accéder aux statistiques et indicateurs",
    category: "dashboard",
  },
  {
    id: "dashboard_export",
    name: "Exporter les statistiques",
    description: "Télécharger les données du tableau de bord",
    category: "dashboard",
  },
  {
    id: "mandats_view",
    name: "Consulter les mandats",
    description: "Voir la liste des mandats de mission",
    category: "mandats",
  },
  {
    id: "mandats_create",
    name: "Créer un mandat",
    description: "Créer un nouveau mandat de mission",
    category: "mandats",
  },
  {
    id: "mandats_edit",
    name: "Modifier un mandat",
    description: "Modifier les informations d'un mandat existant",
    category: "mandats",
  },
  {
    id: "mandats_delete",
    name: "Supprimer un mandat",
    description: "Supprimer définitivement un mandat",
    category: "mandats",
  },
  {
    id: "mandats_history",
    name: "Historique des mandats",
    description: "Consulter l'historique des mandats",
    category: "mandats",
  },
  {
    id: "ordres_view",
    name: "Consulter les ordres",
    description: "Voir la liste des ordres de mission",
    category: "ordres",
  },
  {
    id: "ordres_create",
    name: "Créer un ordre",
    description: "Créer un nouvel ordre de mission",
    category: "ordres",
  },
  {
    id: "ordres_edit",
    name: "Modifier un ordre",
    description: "Modifier les informations d'un ordre existant",
    category: "ordres",
  },
  {
    id: "ordres_approve",
    name: "Approuver un ordre",
    description: "Approuver ou rejeter un ordre de mission",
    category: "ordres",
  },
  {
    id: "ordres_journal",
    name: "Journal des ordres",
    description: "Consulter le journal des ordres de mission",
    category: "ordres",
  },
  {
    id: "rapports_view",
    name: "Consulter les rapports",
    description: "Voir la liste des rapports de mission",
    category: "rapports",
  },
  {
    id: "rapports_upload",
    name: "Téléverser un rapport",
    description: "Ajouter un nouveau rapport de mission",
    category: "rapports",
  },
  {
    id: "rapports_history",
    name: "Historique des rapports",
    description: "Consulter l'historique des rapports",
    category: "rapports",
  },
  {
    id: "users_view",
    name: "Consulter les utilisateurs",
    description: "Voir la liste des utilisateurs",
    category: "utilisateurs",
  },
  {
    id: "users_create",
    name: "Créer un utilisateur",
    description: "Créer un nouveau compte utilisateur",
    category: "utilisateurs",
  },
  {
    id: "users_edit",
    name: "Modifier un utilisateur",
    description: "Modifier les informations d'un utilisateur",
    category: "utilisateurs",
  },
  {
    id: "users_delete",
    name: "Supprimer un utilisateur",
    description: "Supprimer définitivement un utilisateur",
    category: "utilisateurs",
  },
  {
    id: "settings_general",
    name: "Paramètres généraux",
    description: "Configurer les paramètres généraux de l'application",
    category: "parametres",
  },
  {
    id: "settings_menus",
    name: "Gestion des menus",
    description: "Configurer les accès aux menus par profil",
    category: "parametres",
  },
]

// Données initiales pour les accès par profil
const initialProfileAccess: ProfileAccess[] = [
  {
    profile: "Agent_ART",
    label: "Agent ART",
    menus: ["dashboard_view", "mandats_view", "ordres_view", "ordres_create", "rapports_view", "rapports_upload"],
  },
  {
    profile: "Agent_RH",
    label: "Agent RH",
    menus: [
      "dashboard_view",
      "mandats_view",
      "ordres_view",
      "ordres_create",
      "ordres_edit",
      "rapports_view",
      "rapports_upload",
      "users_view",
    ],
  },
  {
    profile: "DP",
    label: "DP",
    menus: [
      "dashboard_view",
      "dashboard_export",
      "mandats_view",
      "mandats_create",
      "mandats_edit",
      "ordres_view",
      "ordres_create",
      "ordres_edit",
      "ordres_approve",
      "rapports_view",
      "rapports_upload",
      "rapports_history",
    ],
  },
  {
    profile: "DRH",
    label: "DRH",
    menus: [
      "dashboard_view",
      "dashboard_export",
      "mandats_view",
      "mandats_create",
      "mandats_edit",
      "mandats_history",
      "ordres_view",
      "ordres_create",
      "ordres_edit",
      "ordres_approve",
      "ordres_journal",
      "rapports_view",
      "rapports_upload",
      "rapports_history",
      "users_view",
      "users_create",
      "users_edit",
    ],
  },
  {
    profile: "Admin",
    label: "Administrateur",
    menus: menuItems.map((item) => item.id), // Tous les menus
  },
]

export default function MenuManagement() {
  const [profileAccess, setProfileAccess] = useState<ProfileAccess[]>(initialProfileAccess)
  const [activeTab, setActiveTab] = useState<ProfileType>("Agent_ART")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Fonction pour vérifier si un menu est accessible pour un profil
  const isMenuAccessible = (menuId: string, profile: ProfileType) => {
    const profileData = profileAccess.find((p) => p.profile === profile)
    return profileData ? profileData.menus.includes(menuId) : false
  }

  // Fonction pour mettre à jour l'accès à un menu
  const toggleMenuAccess = (menuId: string, profile: ProfileType) => {
    setProfileAccess((prevAccess) => {
      return prevAccess.map((p) => {
        if (p.profile === profile) {
          const hasAccess = p.menus.includes(menuId)
          if (hasAccess) {
            return { ...p, menus: p.menus.filter((id) => id !== menuId) }
          } else {
            return { ...p, menus: [...p.menus, menuId] }
          }
        }
        return p
      })
    })
  }

  // Fonction pour activer/désactiver tous les menus d'une catégorie
  const toggleCategoryAccess = (categoryId: string, profile: ProfileType, enable: boolean) => {
    const categoryMenuIds = menuItems.filter((item) => item.category === categoryId).map((item) => item.id)

    setProfileAccess((prevAccess) => {
      return prevAccess.map((p) => {
        if (p.profile === profile) {
          let updatedMenus = [...p.menus]

          if (enable) {
            // Ajouter tous les menus de la catégorie qui ne sont pas déjà présents
            categoryMenuIds.forEach((menuId) => {
              if (!updatedMenus.includes(menuId)) {
                updatedMenus.push(menuId)
              }
            })
          } else {
            // Retirer tous les menus de la catégorie
            updatedMenus = updatedMenus.filter((menuId) => !categoryMenuIds.includes(menuId))
          }

          return { ...p, menus: updatedMenus }
        }
        return p
      })
    })
  }

  // Vérifier si tous les menus d'une catégorie sont accessibles
  const isCategoryFullyAccessible = (categoryId: string, profile: ProfileType) => {
    const categoryMenuIds = menuItems.filter((item) => item.category === categoryId).map((item) => item.id)
    const profileData = profileAccess.find((p) => p.profile === profile)

    if (!profileData) return false

    return categoryMenuIds.every((menuId) => profileData.menus.includes(menuId))
  }

  // Vérifier si certains menus d'une catégorie sont accessibles (mais pas tous)
  const isCategoryPartiallyAccessible = (categoryId: string, profile: ProfileType) => {
    const categoryMenuIds = menuItems.filter((item) => item.category === categoryId).map((item) => item.id)
    const profileData = profileAccess.find((p) => p.profile === profile)

    if (!profileData) return false

    const hasAny = categoryMenuIds.some((menuId) => profileData.menus.includes(menuId))
    const hasAll = categoryMenuIds.every((menuId) => profileData.menus.includes(menuId))

    return hasAny && !hasAll
  }

  // Sauvegarder les modifications
  const saveChanges = async () => {
    try {
      setIsSubmitting(true)

      // Appel de l'action serveur pour mettre à jour les accès
      const result = await updateMenuAccess(profileAccess)

      if (result.success) {
        toast({
          title: "Modifications enregistrées",
          description: "Les accès aux menus ont été mis à jour avec succès.",
        })
      } else {
        throw new Error(result.message || "Une erreur est survenue")
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour des accès:", error)
      toast({
        title: "Erreur",
        description:
          error instanceof Error ? error.message : "Une erreur est survenue lors de la mise à jour des accès.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration des accès aux menus</CardTitle>
        <CardDescription>
          Définissez les menus accessibles pour chaque profil d'utilisateur. Les modifications s'appliqueront à tous les
          utilisateurs ayant le profil correspondant.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ProfileType)}>
          <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-6">
            {profileAccess.map((profile) => (
              <TabsTrigger key={profile.profile} value={profile.profile}>
                {profile.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {profileAccess.map((profile) => (
            <TabsContent key={profile.profile} value={profile.profile} className="space-y-6">
              {menuCategories.map((category) => (
                <div key={category.id} className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`${profile.profile}-${category.id}-all`}
                      checked={isCategoryFullyAccessible(category.id, profile.profile)}
                      indeterminate={isCategoryPartiallyAccessible(category.id, profile.profile)}
                      onCheckedChange={(checked) => {
                        toggleCategoryAccess(category.id, profile.profile, checked === true)
                      }}
                    />
                    <Label htmlFor={`${profile.profile}-${category.id}-all`} className="text-base font-medium">
                      {category.name}
                    </Label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ml-6">
                    {menuItems
                      .filter((item) => item.category === category.id)
                      .map((menuItem) => (
                        <div key={menuItem.id} className="flex items-start space-x-2">
                          <Checkbox
                            id={`${profile.profile}-${menuItem.id}`}
                            checked={isMenuAccessible(menuItem.id, profile.profile)}
                            onCheckedChange={(checked) => {
                              toggleMenuAccess(menuItem.id, profile.profile)
                            }}
                          />
                          <div className="grid gap-1.5">
                            <Label htmlFor={`${profile.profile}-${menuItem.id}`} className="font-medium">
                              {menuItem.name}
                            </Label>
                            <p className="text-sm text-muted-foreground">{menuItem.description}</p>
                          </div>
                        </div>
                      ))}
                  </div>

                  <Separator className="my-4" />
                </div>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={saveChanges} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Enregistrer les modifications
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
