"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, FileText, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

// Données fictives pour les mandats
const mandatsData = [
  {
    id: "1",
    reference: "REF-2024-001",
    objectif: "Audit des processus internes",
    dateDebut: new Date("2024-05-01"),
    dateFin: new Date("2024-05-15"),
    duree: 15,
    typeMission: "controle",
    pays: "France",
    ville: "Paris",
    perimetre: "interieur",
    teamMembers: ["1", "2", "3"], // IDs des membres d'équipe
    hasRapport: true,
  },
  {
    id: "2",
    reference: "REF-2024-002",
    objectif: "Évaluation des risques opérationnels",
    dateDebut: new Date("2024-05-20"),
    dateFin: new Date("2024-06-10"),
    duree: 22,
    typeMission: "autre",
    pays: "Belgique",
    ville: "Bruxelles",
    perimetre: "exterieur",
    teamMembers: ["1", "4"],
    hasRapport: false,
  },
  {
    id: "3",
    reference: "REF-2024-003",
    objectif: "Contrôle de conformité réglementaire",
    dateDebut: new Date("2024-06-15"),
    dateFin: new Date("2024-06-30"),
    duree: 16,
    typeMission: "controle",
    pays: "France",
    ville: "Lyon",
    perimetre: "interieur",
    teamMembers: ["1", "5"],
    hasRapport: true,
  },
  {
    id: "4",
    reference: "REF-2024-004",
    objectif: "Analyse des processus de production",
    dateDebut: new Date("2024-07-01"),
    dateFin: new Date("2024-07-15"),
    duree: 15,
    typeMission: "autre",
    pays: "Suisse",
    ville: "Genève",
    perimetre: "exterieur",
    teamMembers: ["1", "2", "4"],
    hasRapport: false,
  },
  {
    id: "5",
    reference: "REF-2024-005",
    objectif: "Audit financier annuel",
    dateDebut: new Date("2024-08-01"),
    dateFin: new Date("2024-08-31"),
    duree: 31,
    typeMission: "controle",
    pays: "France",
    ville: "Marseille",
    perimetre: "interieur",
    teamMembers: ["1", "3", "5"],
    hasRapport: true,
  },
]

// Données fictives pour les membres d'équipe
const teamMembers = [
  { id: "1", name: "Jean Dupont" },
  { id: "2", name: "Marie Martin" },
  { id: "3", name: "Pierre Durand" },
  { id: "4", name: "Sophie Lefebvre" },
  { id: "5", name: "Thomas Bernard" },
]

// Fonction pour obtenir le nom d'un membre d'équipe à partir de son ID
const getMemberName = (id: string) => {
  const member = teamMembers.find((m) => m.id === id)
  return member ? member.name : "Inconnu"
}

// Fonction pour obtenir les noms des membres d'équipe à partir de leurs IDs
const getTeamMembersNames = (ids: string[]) => {
  return ids.map((id) => getMemberName(id)).join(", ")
}

export default function MandatsList() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [perimetreFilter, setPerimetreFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Filtrage des mandats
  const filteredMandats = mandatsData.filter((mandat) => {
    const matchesSearch =
      mandat.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mandat.objectif.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mandat.ville.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mandat.pays.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === "all" || mandat.typeMission === typeFilter
    const matchesPerimetre = perimetreFilter === "all" || mandat.perimetre === perimetreFilter

    return matchesSearch && matchesType && matchesPerimetre
  })

  // Pagination
  const totalPages = Math.ceil(filteredMandats.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedMandats = filteredMandats.slice(startIndex, startIndex + itemsPerPage)

  // Navigation vers la page des rapports
  const viewRapports = () => {
    router.push("/mes-rapports")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type de mission" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="controle">Mission de contrôle</SelectItem>
              <SelectItem value="autre">Autre mission</SelectItem>
            </SelectContent>
          </Select>

          <Select value={perimetreFilter} onValueChange={setPerimetreFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Périmètre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les périmètres</SelectItem>
              <SelectItem value="interieur">Intérieur</SelectItem>
              <SelectItem value="exterieur">Extérieur</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={viewRapports}>
            <FileText className="h-4 w-4" />
            <span className="sr-only">Voir les rapports</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Référence</TableHead>
                  <TableHead className="hidden md:table-cell">Objectif</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead className="hidden md:table-cell">Lieu</TableHead>
                  <TableHead className="hidden lg:table-cell">Type</TableHead>
                  <TableHead className="text-right">Rapport</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedMandats.length > 0 ? (
                  paginatedMandats.map((mandat) => (
                    <TableRow key={mandat.id}>
                      <TableCell className="font-medium">
                        <Link href={`/mandat/${mandat.id}`} className="hover:underline">
                          {mandat.reference}
                        </Link>
                        <div className="md:hidden text-xs text-muted-foreground mt-1 line-clamp-1">
                          {mandat.objectif}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell max-w-[200px]">
                        <div className="line-clamp-2">{mandat.objectif}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{format(mandat.dateDebut, "dd/MM/yyyy", { locale: fr })}</span>
                          <span className="text-muted-foreground text-xs">
                            au {format(mandat.dateFin, "dd/MM/yyyy", { locale: fr })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {mandat.ville}, {mandat.pays}
                        <div className="text-xs text-muted-foreground">
                          {mandat.perimetre === "interieur" ? "Intérieur" : "Extérieur"}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant={mandat.typeMission === "controle" ? "default" : "outline"}>
                          {mandat.typeMission === "controle" ? "Contrôle" : "Autre"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {mandat.hasRapport ? (
                          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
                            Disponible
                          </Badge>
                        ) : (   
                          <Badge variant="outline" className="text-muted-foreground">
                            Non disponible
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Aucun mandat trouvé.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
            <ChevronsLeft className="h-4 w-4" />
            <span className="sr-only">Première page</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Page précédente</span>
          </Button>
          <span className="text-sm">
            Page {currentPage} sur {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Page suivante</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
            <span className="sr-only">Dernière page</span>
          </Button>
        </div>
      )}
    </div>
  )
}
