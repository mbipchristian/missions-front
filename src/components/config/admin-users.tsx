"use client"

import { useState } from "react"
import { Edit, Eye, MoreHorizontal, Search, Trash, UserPlus } from "lucide-react"

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

// Exemple de données pour les utilisateurs
const utilisateurs = [
  {
    matricule: "MAT-001",
    nom: "Jean Dupont",
    grade: "Commandant",
    profil: "Administrateur",
    joursDesMissionsCumules: 45,
    status: "Actif",
  },
  {
    matricule: "MAT-002",
    nom: "Marie Martin",
    grade: "Lieutenant",
    profil: "Utilisateur",
    joursDesMissionsCumules: 30,
    status: "Actif",
  },
  {
    matricule: "MAT-003",
    nom: "Pierre Durand",
    grade: "Capitaine",
    profil: "Gestionnaire",
    joursDesMissionsCumules: 60,
    status: "Actif",
  },
  {
    matricule: "MAT-004",
    nom: "Sophie Lefebvre",
    grade: "Major",
    profil: "Utilisateur",
    joursDesMissionsCumules: 25,
    status: "Inactif",
  },
  {
    matricule: "MAT-005",
    nom: "Thomas Bernard",
    grade: "Colonel",
    profil: "Administrateur",
    joursDesMissionsCumules: 75,
    status: "Actif",
  },
]

export function UsersList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [profilFilter, setProfilFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  // Filtrer les utilisateurs en fonction de la recherche et des filtres
  const filteredUtilisateurs = utilisateurs.filter((utilisateur) => {
    const matchesSearch =
      utilisateur.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
      utilisateur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      utilisateur.grade.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesProfil = profilFilter === "all" || utilisateur.profil === profilFilter
    const matchesStatus = statusFilter === "all" || utilisateur.status === statusFilter

    return matchesSearch && matchesProfil && matchesStatus
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Liste des utilisateurs</CardTitle>
          <CardDescription>Gérez les utilisateurs du système</CardDescription>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Nouvel utilisateur
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 mb-4 sm:flex-row">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par matricule, nom, grade..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={profilFilter} onValueChange={setProfilFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrer par profil" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les profils</SelectItem>
              <SelectItem value="Administrateur">Administrateur</SelectItem>
              <SelectItem value="Gestionnaire">Gestionnaire</SelectItem>
              <SelectItem value="Utilisateur">Utilisateur</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="Actif">Actif</SelectItem>
              <SelectItem value="Inactif">Inactif</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Matricule</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Profil</TableHead>
                <TableHead>Jours cumulés</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUtilisateurs.map((utilisateur) => (
                <TableRow key={utilisateur.matricule}>
                  <TableCell className="font-medium">{utilisateur.matricule}</TableCell>
                  <TableCell>{utilisateur.nom}</TableCell>
                  <TableCell>{utilisateur.grade}</TableCell>
                  <TableCell>
                    <Badge variant={utilisateur.profil === "Administrateur" ? "default" : "outline"}>
                      {utilisateur.profil}
                    </Badge>
                  </TableCell>
                  <TableCell>{utilisateur.joursDesMissionsCumules} jours</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        utilisateur.status === "Actif" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {utilisateur.status}
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
                          <Eye className="mr-2 h-4 w-4" />
                          <span>Voir les détails</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Modifier</span>
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
