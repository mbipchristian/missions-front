"use client"

import { useState } from "react"
import {
  Briefcase,
  Edit,
  FileText,
  FolderOpen,
  Home,
  LogOut,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Shield,
  Trash,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"

// Exemple de données pour les menus
const menus = [
  {
    id: "M-001",
    nom: "Tableau de bord",
    icone: <Home className="h-4 w-4" />,
    ordre: 1,
    actif: true,
    parent: null,
  },
  {
    id: "M-002",
    nom: "Missions",
    icone: <Briefcase className="h-4 w-4" />,
    ordre: 2,
    actif: true,
    parent: null,
  },
  {
    id: "M-003",
    nom: "Missions effectuées",
    icone: <Briefcase className="h-4 w-4" />,
    ordre: 1,
    actif: true,
    parent: "M-002",
  },
  {
    id: "M-004",
    nom: "Missions en cours",
    icone: <Briefcase className="h-4 w-4" />,
    ordre: 2,
    actif: true,
    parent: "M-002",
  },
  {
    id: "M-005",
    nom: "Ressources",
    icone: <FolderOpen className="h-4 w-4" />,
    ordre: 3,
    actif: true,
    parent: null,
  },
  {
    id: "M-006",
    nom: "Ordres de missions",
    icone: <FileText className="h-4 w-4" />,
    ordre: 4,
    actif: true,
    parent: null,
  },
  {
    id: "M-007",
    nom: "Décharges de missions",
    icone: <LogOut className="h-4 w-4" />,
    ordre: 5,
    actif: true,
    parent: null,
  },
  {
    id: "M-008",
    nom: "Rapports de missions",
    icone: <FileText className="h-4 w-4" />,
    ordre: 6,
    actif: true,
    parent: null,
  },
  {
    id: "M-009",
    nom: "Gestion des utilisateurs",
    icone: <Users className="h-4 w-4" />,
    ordre: 7,
    actif: true,
    parent: null,
  },
  {
    id: "M-010",
    nom: "Gestion des profils",
    icone: <Settings className="h-4 w-4" />,
    ordre: 8,
    actif: true,
    parent: null,
  },
  {
    id: "M-011",
    nom: "Gestion des grades",
    icone: <Shield className="h-4 w-4" />,
    ordre: 9,
    actif: true,
    parent: null,
  },
]

export function MenusList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showSubmenus, setShowSubmenus] = useState(true)

  // Filtrer les menus en fonction de la recherche et de l'option d'affichage des sous-menus
  const filteredMenus = menus.filter((menu) => {
    const matchesSearch =
      menu.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      menu.nom.toLowerCase().includes(searchTerm.toLowerCase())

    const isSubmenu = menu.parent !== null
    const shouldShow = showSubmenus || !isSubmenu

    return matchesSearch && shouldShow
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Liste des menus</CardTitle>
          <CardDescription>Gérez les menus du système</CardDescription>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau menu
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par ID ou nom..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="show-submenus" checked={showSubmenus} onCheckedChange={setShowSubmenus} />
            <label htmlFor="show-submenus" className="text-sm font-medium">
              Afficher les sous-menus
            </label>
          </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Icône</TableHead>
                <TableHead>Ordre</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMenus.map((menu) => (
                <TableRow key={menu.id} className={menu.parent ? "bg-muted/30" : ""}>
                  <TableCell className="font-medium">{menu.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {menu.parent && <div className="w-4 border-l-2 border-b-2 h-4 rounded-bl-md" />}
                      {menu.nom}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center bg-muted/50 rounded-md w-8 h-8">{menu.icone}</div>
                  </TableCell>
                  <TableCell>{menu.ordre}</TableCell>
                  <TableCell>{menu.parent || "-"}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        menu.actif ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {menu.actif ? "Actif" : "Inactif"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Modifier</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Plus className="mr-2 h-4 w-4" />
                          <span>Ajouter un sous-menu</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash className="mr-2 h-4 w-4" />
                          <span>Supprimer</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
