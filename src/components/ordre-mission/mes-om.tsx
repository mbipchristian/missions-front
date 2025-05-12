"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download, Eye, Search, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

// Types pour les ordres de mission
interface OrdreMission {
  id: string
  numero: string
  mandatReference: string
  mandatId: string
  nomsPrenoms: string
  grade: string
  fonction: string
  pays: string
  ville: string
  dateDebut: Date
  dateFin: Date
  duree: number
  decompteTotal: number
  decompteAvance: number
  decompteReliquat: number
  devise: string
  status: string
  dateCreation: Date
}

// Données fictives pour les ordres de mission
const ordresMissionData: OrdreMission[] = [
  {
    id: "om1",
    numero: "OM-240501-A1B",
    mandatReference: "REF-2024-001",
    mandatId: "1",
    nomsPrenoms: "DUPONT Jean",
    grade: "B",
    fonction: "CHEF",
    pays: "France",
    ville: "Paris",
    dateDebut: new Date("2024-05-05"),
    dateFin: new Date("2024-05-10"),
    duree: 6,
    decompteTotal: 72000,
    decompteAvance: 36000,
    decompteReliquat: 36000,
    devise: "XAF",
    status: "en attente du visa_DG",
    dateCreation: new Date("2024-05-01T10:15:23"),
  },
  {
    id: "om2",
    numero: "OM-240520-C3D",
    mandatReference: "REF-2024-002",
    mandatId: "2",
    nomsPrenoms: "DUPONT Jean",
    grade: "B",
    fonction: "CHEF",
    pays: "Belgique",
    ville: "Bruxelles",
    dateDebut: new Date("2024-05-25"),
    dateFin: new Date("2024-06-05"),
    duree: 12,
    decompteTotal: 144000,
    decompteAvance: 72000,
    decompteReliquat: 72000,
    devise: "XAF",
    status: "approuvé",
    dateCreation: new Date("2024-05-20T14:22:10"),
  },
  {
    id: "om3",
    numero: "OM-240615-E5F",
    mandatReference: "REF-2024-003",
    mandatId: "3",
    nomsPrenoms: "DUPONT Jean",
    grade: "B",
    fonction: "CHEF",
    pays: "France",
    ville: "Lyon",
    dateDebut: new Date("2024-06-20"),
    dateFin: new Date("2024-06-25"),
    duree: 6,
    decompteTotal: 72000,
    decompteAvance: 36000,
    decompteReliquat: 36000,
    devise: "XAF",
    status: "en cours de mission",
    dateCreation: new Date("2024-06-15T09:05:47"),
  },
  {
    id: "om4",
    numero: "OM-240701-G7H",
    mandatReference: "REF-2024-004",
    mandatId: "4",
    nomsPrenoms: "DUPONT Jean",
    grade: "B",
    fonction: "CHEF",
    pays: "Suisse",
    ville: "Genève",
    dateDebut: new Date("2024-07-05"),
    dateFin: new Date("2024-07-10"),
    duree: 6,
    decompteTotal: 72000,
    decompteAvance: 36000,
    decompteReliquat: 36000,
    devise: "XAF",
    status: "en attente du visa_DG",
    dateCreation: new Date("2024-07-01T11:32:08"),
  },
  {
    id: "om5",
    numero: "OM-240801-I9J",
    mandatReference: "REF-2024-005",
    mandatId: "5",
    nomsPrenoms: "DUPONT Jean",
    grade: "B",
    fonction: "CHEF",
    pays: "France",
    ville: "Marseille",
    dateDebut: new Date("2024-08-10"),
    dateFin: new Date("2024-08-20"),
    duree: 11,
    decompteTotal: 132000,
    decompteAvance: 66000,
    decompteReliquat: 66000,
    devise: "XAF",
    status: "en attente du visa_DG",
    dateCreation: new Date("2024-08-01T13:20:45"),
  },
]

// Fonction pour obtenir une couleur de badge en fonction du statut
const getStatusBadgeStyles = (status: string) => {
  switch (status) {
    case "en attente du visa_DG":
      return "bg-amber-100 text-amber-800 hover:bg-amber-200"
    case "approuvé":
      return "bg-green-100 text-green-800 hover:bg-green-200"
    case "rejeté":
      return "bg-red-100 text-red-800 hover:bg-red-200"
    case "en cours de mission":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200"
    case "terminé":
      return "bg-purple-100 text-purple-800 hover:bg-purple-200"
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200"
  }
}

// Fonction pour formater les montants
const formatMontant = (montant: number, devise: string) => {
  return new Intl.NumberFormat("fr-FR", { style: "decimal" }).format(montant) + " " + devise
}

export default function MesOrdresMissionList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Filtrage des ordres de mission
  const filteredOrdres = ordresMissionData.filter((ordre) => {
    const matchesSearch =
      ordre.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordre.mandatReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordre.pays.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordre.ville.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || ordre.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredOrdres.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedOrdres = filteredOrdres.slice(startIndex, startIndex + itemsPerPage)

  // Simuler la visualisation d'un ordre de mission
  const viewOrdreMission = (ordreId: string) => {
    alert(`Visualisation de l'ordre de mission ${ordreId}`)
    // Dans une application réelle, vous redirigeriez vers une page de détails
  }

  // Simuler le téléchargement d'un ordre de mission
  const downloadOrdreMission = (ordreId: string, numero: string) => {
    alert(`Téléchargement de l'ordre de mission ${numero}`)
    // Dans une application réelle, vous utiliseriez une API pour télécharger le fichier PDF
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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="en attente du visa_DG">En attente du visa DG</SelectItem>
              <SelectItem value="approuvé">Approuvé</SelectItem>
              <SelectItem value="rejeté">Rejeté</SelectItem>
              <SelectItem value="en cours de mission">En cours de mission</SelectItem>
              <SelectItem value="terminé">Terminé</SelectItem>
            </SelectContent>
          </Select>

          <Button asChild>
            <Link href="/ordre-mission/nouveau">
              <Plus className="h-4 w-4 mr-2" />
              Nouvel ordre de mission
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numéro</TableHead>
                  <TableHead className="hidden md:table-cell">Mandat</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead className="hidden md:table-cell">Destination</TableHead>
                  <TableHead className="hidden lg:table-cell">Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrdres.length > 0 ? (
                  paginatedOrdres.map((ordre) => (
                    <TableRow key={ordre.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{ordre.numero}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(ordre.dateCreation, "dd/MM/yyyy", { locale: fr })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Link href={`/mandat/${ordre.mandatId}`} className="hover:underline">
                          {ordre.mandatReference}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{format(ordre.dateDebut, "dd/MM/yyyy", { locale: fr })}</span>
                          <span className="text-muted-foreground text-xs">
                            au {format(ordre.dateFin, "dd/MM/yyyy", { locale: fr })}
                          </span>
                          <span className="text-xs font-medium">{ordre.duree} jours</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {ordre.ville}, {ordre.pays}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex flex-col">
                          <span>{formatMontant(ordre.decompteTotal, ordre.devise)}</span>
                          <span className="text-xs text-muted-foreground">
                            Avance: {formatMontant(ordre.decompteAvance, ordre.devise)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeStyles(ordre.status)}>{ordre.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => viewOrdreMission(ordre.id)}
                            title="Visualiser"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Visualiser</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => downloadOrdreMission(ordre.id, ordre.numero)}
                            title="Télécharger"
                          >
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Télécharger</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Aucun ordre de mission trouvé.
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
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Affichage de {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredOrdres.length)} sur{" "}
            {filteredOrdres.length} ordres de mission
          </div>
          <div className="flex items-center space-x-2">
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
        </div>
      )}
    </div>
  )
}
