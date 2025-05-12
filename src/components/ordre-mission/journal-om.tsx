"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Eye,
  Search,
  SlidersHorizontal,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

// Types pour le journal des ordres de mission
type ActionType = "creation" | "modification" | "approbation" | "rejet" | "debut_mission" | "fin_mission"

interface OrdreMissionJournalEntry {
  id: string
  ordreId: string
  ordreNumero: string
  mandatReference: string
  mandatId: string
  nomsPrenoms: string
  actionType: ActionType
  actionDate: Date
  actionBy: string
  details: string
  statusAvant?: string
  statusApres?: string
  montant?: number
  devise?: string
}

// Données fictives pour le journal des ordres de mission
const journalOrdresMissionData: OrdreMissionJournalEntry[] = [
  {
    id: "j1",
    ordreId: "om1",
    ordreNumero: "OM-240501-A1B",
    mandatReference: "REF-2024-001",
    mandatId: "1",
    nomsPrenoms: "DUPONT Jean",
    actionType: "creation",
    actionDate: new Date("2024-05-01T10:15:23"),
    actionBy: "Jean Dupont",
    details: "Création de l'ordre de mission",
    statusApres: "en attente du visa_DG",
    montant: 72000,
    devise: "XAF",
  },
  {
    id: "j2",
    ordreId: "om2",
    ordreNumero: "OM-240520-C3D",
    mandatReference: "REF-2024-002",
    mandatId: "2",
    nomsPrenoms: "DUPONT Jean",
    actionType: "creation",
    actionDate: new Date("2024-05-20T14:22:10"),
    actionBy: "Jean Dupont",
    details: "Création de l'ordre de mission",
    statusApres: "en attente du visa_DG",
    montant: 144000,
    devise: "XAF",
  },
  {
    id: "j3",
    ordreId: "om2",
    ordreNumero: "OM-240520-C3D",
    mandatReference: "REF-2024-002",
    mandatId: "2",
    nomsPrenoms: "DUPONT Jean",
    actionType: "approbation",
    actionDate: new Date("2024-05-22T09:30:45"),
    actionBy: "Marie Martin (DG)",
    details: "Approbation de l'ordre de mission par le DG",
    statusAvant: "en attente du visa_DG",
    statusApres: "approuvé",
  },
  {
    id: "j4",
    ordreId: "om3",
    ordreNumero: "OM-240615-E5F",
    mandatReference: "REF-2024-003",
    mandatId: "3",
    nomsPrenoms: "DUPONT Jean",
    actionType: "creation",
    actionDate: new Date("2024-06-15T09:05:47"),
    actionBy: "Jean Dupont",
    details: "Création de l'ordre de mission",
    statusApres: "en attente du visa_DG",
    montant: 72000,
    devise: "XAF",
  },
  {
    id: "j5",
    ordreId: "om3",
    ordreNumero: "OM-240615-E5F",
    mandatReference: "REF-2024-003",
    mandatId: "3",
    nomsPrenoms: "DUPONT Jean",
    actionType: "approbation",
    actionDate: new Date("2024-06-16T11:20:33"),
    actionBy: "Marie Martin (DG)",
    details: "Approbation de l'ordre de mission par le DG",
    statusAvant: "en attente du visa_DG",
    statusApres: "approuvé",
  },
  {
    id: "j6",
    ordreId: "om3",
    ordreNumero: "OM-240615-E5F",
    mandatReference: "REF-2024-003",
    mandatId: "3",
    nomsPrenoms: "DUPONT Jean",
    actionType: "debut_mission",
    actionDate: new Date("2024-06-20T08:00:00"),
    actionBy: "Système",
    details: "Début de la mission",
    statusAvant: "approuvé",
    statusApres: "en cours de mission",
  },
  {
    id: "j7",
    ordreId: "om4",
    ordreNumero: "OM-240701-G7H",
    mandatReference: "REF-2024-004",
    mandatId: "4",
    nomsPrenoms: "DUPONT Jean",
    actionType: "creation",
    actionDate: new Date("2024-07-01T11:32:08"),
    actionBy: "Jean Dupont",
    details: "Création de l'ordre de mission",
    statusApres: "en attente du visa_DG",
    montant: 72000,
    devise: "XAF",
  },
  {
    id: "j8",
    ordreId: "om5",
    ordreNumero: "OM-240801-I9J",
    mandatReference: "REF-2024-005",
    mandatId: "5",
    nomsPrenoms: "DUPONT Jean",
    actionType: "creation",
    actionDate: new Date("2024-08-01T13:20:45"),
    actionBy: "Jean Dupont",
    details: "Création de l'ordre de mission",
    statusApres: "en attente du visa_DG",
    montant: 132000,
    devise: "XAF",
  },
  {
    id: "j9",
    ordreId: "om1",
    ordreNumero: "OM-240501-A1B",
    mandatReference: "REF-2024-001",
    mandatId: "1",
    nomsPrenoms: "DUPONT Jean",
    actionType: "modification",
    actionDate: new Date("2024-05-02T15:45:12"),
    actionBy: "Jean Dupont",
    details: "Modification du taux d'avance (50% → 60%)",
    statusAvant: "en attente du visa_DG",
    statusApres: "en attente du visa_DG",
  },
  {
    id: "j10",
    ordreId: "om2",
    ordreNumero: "OM-240520-C3D",
    mandatReference: "REF-2024-002",
    mandatId: "2",
    nomsPrenoms: "DUPONT Jean",
    actionType: "debut_mission",
    actionDate: new Date("2024-05-25T08:00:00"),
    actionBy: "Système",
    details: "Début de la mission",
    statusAvant: "approuvé",
    statusApres: "en cours de mission",
  },
  {
    id: "j11",
    ordreId: "om2",
    ordreNumero: "OM-240520-C3D",
    mandatReference: "REF-2024-002",
    mandatId: "2",
    nomsPrenoms: "DUPONT Jean",
    actionType: "fin_mission",
    actionDate: new Date("2024-06-05T18:00:00"),
    actionBy: "Système",
    details: "Fin de la mission",
    statusAvant: "en cours de mission",
    statusApres: "terminé",
  },
]

// Fonction pour obtenir une couleur de badge en fonction du type d'action
const getActionBadgeStyles = (action: ActionType) => {
  switch (action) {
    case "creation":
      return "bg-green-100 text-green-800 hover:bg-green-200"
    case "modification":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200"
    case "approbation":
      return "bg-purple-100 text-purple-800 hover:bg-purple-200"
    case "rejet":
      return "bg-red-100 text-red-800 hover:bg-red-200"
    case "debut_mission":
      return "bg-amber-100 text-amber-800 hover:bg-amber-200"
    case "fin_mission":
      return "bg-teal-100 text-teal-800 hover:bg-teal-200"
    default:
      return ""
  }
}

// Fonction pour obtenir le libellé en fonction du type d'action
const getActionLabel = (action: ActionType) => {
  switch (action) {
    case "creation":
      return "Création"
    case "modification":
      return "Modification"
    case "approbation":
      return "Approbation"
    case "rejet":
      return "Rejet"
    case "debut_mission":
      return "Début mission"
    case "fin_mission":
      return "Fin mission"
    default:
      return action
  }
}

// Fonction pour formater les montants
const formatMontant = (montant?: number, devise?: string) => {
  if (!montant || !devise) return "-"
  return new Intl.NumberFormat("fr-FR", { style: "decimal" }).format(montant) + " " + devise
}

export default function JournalOrdresMissionList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [actionTypeFilter, setActionTypeFilter] = useState<string>("all")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [userFilter, setUserFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<string>("actionDate")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const itemsPerPage = 10

  // Obtenir la liste unique des utilisateurs pour le filtre
  const uniqueUsers = Array.from(new Set(journalOrdresMissionData.map((entry) => entry.actionBy))).sort()

  // Filtrage du journal
  const filteredJournal = journalOrdresMissionData.filter((entry) => {
    const matchesSearch =
      entry.ordreNumero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.mandatReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.nomsPrenoms.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.actionBy.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesAction = actionTypeFilter === "all" || entry.actionType === actionTypeFilter
    const matchesUser = userFilter === "all" || entry.actionBy === userFilter

    const matchesDateRange =
      (!startDate || entry.actionDate >= startDate) &&
      (!endDate || entry.actionDate <= new Date(endDate.setHours(23, 59, 59, 999)))

    return matchesSearch && matchesAction && matchesUser && matchesDateRange
  })

  // Tri du journal
  const sortedJournal = [...filteredJournal].sort((a, b) => {
    if (sortField === "actionDate") {
      return sortDirection === "asc"
        ? a.actionDate.getTime() - b.actionDate.getTime()
        : b.actionDate.getTime() - a.actionDate.getTime()
    } else if (sortField === "ordreNumero") {
      return sortDirection === "asc"
        ? a.ordreNumero.localeCompare(b.ordreNumero)
        : b.ordreNumero.localeCompare(a.ordreNumero)
    } else if (sortField === "nomsPrenoms") {
      return sortDirection === "asc"
        ? a.nomsPrenoms.localeCompare(b.nomsPrenoms)
        : b.nomsPrenoms.localeCompare(a.nomsPrenoms)
    } else if (sortField === "actionBy") {
      return sortDirection === "asc" ? a.actionBy.localeCompare(b.actionBy) : b.actionBy.localeCompare(a.actionBy)
    } else if (sortField === "actionType") {
      return sortDirection === "asc"
        ? a.actionType.localeCompare(b.actionType)
        : b.actionType.localeCompare(a.actionType)
    }
    return 0
  })

  // Pagination
  const totalPages = Math.ceil(sortedJournal.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedJournal = sortedJournal.slice(startIndex, startIndex + itemsPerPage)

  // Fonction pour changer le tri
  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm("")
    setActionTypeFilter("all")
    setUserFilter("all")
    setStartDate(undefined)
    setEndDate(undefined)
    setCurrentPage(1)
  }

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
          <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type d'action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les actions</SelectItem>
              <SelectItem value="creation">Création</SelectItem>
              <SelectItem value="modification">Modification</SelectItem>
              <SelectItem value="approbation">Approbation</SelectItem>
              <SelectItem value="rejet">Rejet</SelectItem>
              <SelectItem value="debut_mission">Début mission</SelectItem>
              <SelectItem value="fin_mission">Fin mission</SelectItem>
            </SelectContent>
          </Select>

          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Utilisateur" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les utilisateurs</SelectItem>
              {uniqueUsers.map((user) => (
                <SelectItem key={user} value={user}>
                  {user}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[250px]">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                <span>
                  {startDate && endDate
                    ? `${format(startDate, "dd/MM/yyyy")} - ${format(endDate, "dd/MM/yyyy")}`
                    : startDate
                      ? `Depuis le ${format(startDate, "dd/MM/yyyy")}`
                      : endDate
                        ? `Jusqu'au ${format(endDate, "dd/MM/yyyy")}`
                        : "Période"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="end">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Période</h4>
                  <div className="flex gap-2">
                    <div className="grid gap-1">
                      <label className="text-sm font-medium">Début</label>
                      <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                    </div>
                    <div className="grid gap-1">
                      <label className="text-sm font-medium">Fin</label>
                      <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                    </div>
                  </div>
                </div>
                <Button onClick={resetFilters} variant="outline">
                  Réinitialiser les filtres
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => toggleSort("ordreNumero")}>
                    Numéro
                    {sortField === "ordreNumero" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => toggleSort("nomsPrenoms")}>
                    Bénéficiaire
                    {sortField === "nomsPrenoms" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => toggleSort("actionType")}>
                    Action
                    {sortField === "actionType" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                  </TableHead>
                  <TableHead>Détails</TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => toggleSort("actionBy")}>
                    Utilisateur
                    {sortField === "actionBy" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => toggleSort("actionDate")}>
                    Date
                    {sortField === "actionDate" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedJournal.length > 0 ? (
                  paginatedJournal.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <Link href={`/ordre-mission/${entry.ordreId}`} className="hover:underline font-medium">
                          {entry.ordreNumero}
                        </Link>
                        <div className="text-xs text-muted-foreground">
                          <Link href={`/mandat/${entry.mandatId}`} className="hover:underline">
                            {entry.mandatReference}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell>{entry.nomsPrenoms}</TableCell>
                      <TableCell>
                        <Badge className={getActionBadgeStyles(entry.actionType)}>
                          {getActionLabel(entry.actionType)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <div className="line-clamp-2">{entry.details}</div>
                        {entry.statusAvant && entry.statusApres && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Statut: {entry.statusAvant} → {entry.statusApres}
                          </div>
                        )}
                        {entry.montant && entry.devise && (
                          <div className="text-xs text-muted-foreground">
                            Montant: {formatMontant(entry.montant, entry.devise)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{entry.actionBy}</TableCell>
                      <TableCell>
                        <div className="whitespace-nowrap">
                          {format(entry.actionDate, "dd/MM/yyyy", { locale: fr })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(entry.actionDate, "HH:mm:ss", { locale: fr })}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => viewOrdreMission(entry.ordreId)}
                            title="Visualiser"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Visualiser</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => downloadOrdreMission(entry.ordreId, entry.ordreNumero)}
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
                      Aucune activité trouvée.
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
            Affichage de {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedJournal.length)} sur{" "}
            {sortedJournal.length} entrées
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
