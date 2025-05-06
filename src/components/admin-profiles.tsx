"use client"

import { useState } from "react"
import { Edit, MoreHorizontal, Plus, Search, Shield, Trash, Users } from "lucide-react"

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
import { Badge } from "@/components/ui/badge"

// Exemple de données pour les profils
const profils = [
  {
    id: "P-001",
    nom: "Administrateur",
    code: "ADMIN",
    utilisateurs: 5,
    permissions: ["Toutes les permissions"],
  },
  {
    id: "P-002",
    nom: "Gestionnaire",
    code: "GEST",
    utilisateurs: 8,
    permissions: ["Gestion des missions", "Gestion des ordres", "Gestion des décharges"],
  },
  {
    id: "P-003",
    nom: "Utilisateur",
    code: "USER",
    utilisateurs: 15,
    permissions: ["Consultation des missions", "Création de missions"],
  },
  {
    id: "P-004",
    nom: "Validateur",
    code: "VALID",
    utilisateurs: 3,
    permissions: ["Validation des missions", "Validation des décharges"],
  },
]

export function ProfilesList() {
  const [searchTerm, setSearchTerm] = useState("")

  // Filtrer les profils en fonction de la recherche
  const filteredProfils = profils.filter((profil) => {
    return (
      profil.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profil.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profil.code.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Liste des profils</CardTitle>
          <CardDescription>Gérez les profils utilisateurs et leurs permissions</CardDescription>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau profil
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par ID, nom ou code..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Utilisateurs</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProfils.map((profil) => (
                <TableRow key={profil.id}>
                  <TableCell className="font-medium">{profil.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {profil.nom === "Administrateur" ? (
                        <Shield className="h-4 w-4 text-primary" />
                      ) : (
                        <Users className="h-4 w-4 text-muted-foreground" />
                      )}
                      {profil.nom}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{profil.code}</Badge>
                  </TableCell>
                  <TableCell>{profil.utilisateurs}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {profil.permissions.map((permission, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                    </div>
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
                          <Users className="mr-2 h-4 w-4" />
                          <span>Voir les utilisateurs</span>
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
