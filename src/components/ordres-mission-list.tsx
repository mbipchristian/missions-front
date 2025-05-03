"use client"

import { useState } from "react"
import { Calendar, Download, Edit, Eye, MoreHorizontal, Plus, Search, Trash } from "lucide-react"

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

// Exemple de données pour les ordres de mission
const ordresMission = [
  {
    id: "OM-2023-001",
    dateDebut: "2023-05-10",
    dateFin: "2023-05-15",
    destination: "Paris",
    duree: "5 jours",
    decompteMontant: "1500 €",
    status: "Approuvé",
  },
  {
    id: "OM-2023-002",
    dateDebut: "2023-06-20",
    dateFin: "2023-06-25",
    destination: "Lyon",
    duree: "5 jours",
    decompteMontant: "1200 €",
    status: "En attente",
  },
  {
    id: "OM-2023-003",
    dateDebut: "2023-07-05",
    dateFin: "2023-07-10",
    destination: "Marseille",
    duree: "5 jours",
    decompteMontant: "1300 €",
    status: "Approuvé",
  },
  {
    id: "OM-2023-004",
    dateDebut: "2023-08-15",
    dateFin: "2023-08-20",
    destination: "Bordeaux",
    duree: "5 jours",
    decompteMontant: "1100 €",
    status: "En attente",
  },
]

export function OrdresMissionList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Filtrer les ordres de mission en fonction de la recherche et du filtre de statut
  const filteredOrdres = ordresMission.filter((ordre) => {
    const matchesSearch =
      ordre.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordre.destination.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || ordre.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Liste des ordres de mission</CardTitle>
          <CardDescription>Gérez les ordres de mission</CardDescription>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouvel ordre de mission
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par ID, destination..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="Approuvé">Approuvé</SelectItem>
              <SelectItem value="En attente">En attente</SelectItem>
              <SelectItem value="Refusé">Refusé</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Période</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Durée</TableHead>
                <TableHead>Décompte</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrdres.map((ordre) => (
                <TableRow key={ordre.id}>
                  <TableCell className="font-medium">{ordre.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {ordre.dateDebut} - {ordre.dateFin}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{ordre.destination}</TableCell>
                  <TableCell>{ordre.duree}</TableCell>
                  <TableCell>{ordre.decompteMontant}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        ordre.status === "Approuvé"
                          ? "bg-green-100 text-green-800"
                          : ordre.status === "En attente"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {ordre.status}
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
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          <span>Télécharger</span>
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
