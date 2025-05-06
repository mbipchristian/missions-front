"use client"

import { useState } from "react"
import { Edit, MoreHorizontal, Plus, Search, Trash } from "lucide-react"

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

// Exemple de données pour les grades
const grades = [
  {
    id: "G-001",
    nom: "Colonel",
    indemniteInterieure: "250 €",
    indemniteExterieure: "350 €",
  },
  {
    id: "G-002",
    nom: "Commandant",
    indemniteInterieure: "200 €",
    indemniteExterieure: "300 €",
  },
  {
    id: "G-003",
    nom: "Capitaine",
    indemniteInterieure: "180 €",
    indemniteExterieure: "280 €",
  },
  {
    id: "G-004",
    nom: "Lieutenant",
    indemniteInterieure: "160 €",
    indemniteExterieure: "260 €",
  },
  {
    id: "G-005",
    nom: "Major",
    indemniteInterieure: "150 €",
    indemniteExterieure: "250 €",
  },
]

export function GradesList() {
  const [searchTerm, setSearchTerm] = useState("")

  // Filtrer les grades en fonction de la recherche
  const filteredGrades = grades.filter((grade) => {
    return (
      grade.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grade.nom.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Liste des grades</CardTitle>
          <CardDescription>Gérez les grades et leurs indemnités</CardDescription>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau grade
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par ID ou nom..."
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
                <TableHead>Indemnité Intérieure</TableHead>
                <TableHead>Indemnité Extérieure</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGrades.map((grade) => (
                <TableRow key={grade.id}>
                  <TableCell className="font-medium">{grade.id}</TableCell>
                  <TableCell>{grade.nom}</TableCell>
                  <TableCell>{grade.indemniteInterieure}</TableCell>
                  <TableCell>{grade.indemniteExterieure}</TableCell>
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
