"use client"

import { useState } from "react"
import { Calendar, Edit, Eye, MoreHorizontal, Plus, Search, Trash } from "lucide-react"

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

// Exemple de données pour les missions
const missions = [
  {
    id: "M-2023-001",
    dateDebut: "2023-05-10",
    dateFin: "2023-05-15",
    typeMission: "Formation",
    lieu: "Paris",
    status: "Terminée",
  },
  {
    id: "M-2023-002",
    dateDebut: "2023-06-20",
    dateFin: "2023-06-25",
    typeMission: "Audit",
    lieu: "Lyon",
    status: "En cours",
  },
  {
    id: "M-2023-003",
    dateDebut: "2023-07-05",
    dateFin: "2023-07-10",
    typeMission: "Réunion",
    lieu: "Marseille",
    status: "En attente",
  },
  {
    id: "M-2023-004",
    dateDebut: "2023-08-15",
    dateFin: "2023-08-20",
    typeMission: "Formation",
    lieu: "Bordeaux",
    status: "Planifiée",
  },
  {
    id: "M-2023-005",
    dateDebut: "2023-09-10",
    dateFin: "2023-09-15",
    typeMission: "Audit",
    lieu: "Lille",
    status: "Planifiée",
  },
]

export function MissionsList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Filtrer les missions en fonction de la recherche et du filtre de statut
  const filteredMissions = missions.filter((mission) => {
    const matchesSearch =
      mission.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mission.lieu.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mission.typeMission.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || mission.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Liste des missions</CardTitle>
          <CardDescription>Gérez et suivez toutes vos missions</CardDescription>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle mission
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par ID, lieu, type..."
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
              <SelectItem value="En cours">En cours</SelectItem>
              <SelectItem value="En attente">En attente</SelectItem>
              <SelectItem value="Terminée">Terminée</SelectItem>
              <SelectItem value="Planifiée">Planifiée</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Période</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Lieu</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMissions.map((mission) => (
                <TableRow key={mission.id}>
                  <TableCell className="font-medium">{mission.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {mission.dateDebut} - {mission.dateFin}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{mission.typeMission}</TableCell>
                  <TableCell>{mission.lieu}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        mission.status === "Terminée"
                          ? "bg-green-100 text-green-800"
                          : mission.status === "En cours"
                            ? "bg-blue-100 text-blue-800"
                            : mission.status === "En attente"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {mission.status}
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
