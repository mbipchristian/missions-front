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

// Types pour l'historique des rapports
type ActionType = "upload" | "suppression" | "telechargement" | "consultation"

interface RapportHistoryEntry {
  id: string
  rapportId: string
  mandatReference: string
  mandatId: string
  actionType: ActionType
  actionDate: Date
  actionBy: string
  fileName: string
  details: string
}

// Données fictives pour l'historique des rapports
const rapportsHistoryData: RapportHistoryEntry[] = [
  {
    id: "r1",
    rapportId: "1",
    mandatReference: "REF-2024-001",
    mandatId: "1",
    actionType: "upload",
    actionDate: new Date("2024-05-16T09:30:45"),
    actionBy: "Jean Dupont",
    fileName: "rapport-audit-processus-internes.pdf",
    details: "Téléversement initial du rapport de mission",
  },
  {
    id: "r2",
    rapportId: "1",
    mandatReference: "REF-2024-001",
    mandatId: "1",
    actionType: "consultation",
    actionDate: new Date("2024-05-17T14:20:33"),
    actionBy: "Marie Martin",
    fileName: "rapport-audit-processus-internes.pdf",
    details: "Consultation du rapport de mission",
  },
  {
    id: "r3",
    rapportId: "1",
    mandatReference: "REF-2024-001",
    mandatId: "1",
    actionType: "telechargement",
    actionDate: new Date("2024-05-18T10:45:12"),
    actionBy: "Pierre Durand",
    fileName: "rapport-audit-processus-internes.pdf",
    details: "Téléchargement du rapport de mission",
  },
  {
    id: "r4",
    rapportId: "2",
    mandatReference: "REF-2024-003",
    mandatId: "3",
    actionType: "upload",
    actionDate: new Date("2024-07-02T15:10:27"),
    actionBy: "Sophie Lefebvre",
    fileName: "rapport-controle-conformite.pdf",
    details: "Téléversement initial du rapport de mission",
  },
  {
    id: "r5",
    rapportId: "2",
    mandatReference: "REF-2024-003",
    mandatId: "3",
    actionType: "consultation",
    actionDate: new Date("2024-07-05T11:25:40"),
    actionBy: "Thomas Bernard",
    fileName: "rapport-controle-conformite.pdf",
    details: "Consultation du rapport de mission",
  },
  {
    id: "r6",
    rapportId: "2",
    mandatReference: "REF-2024-003",
    mandatId: "3",
    actionType: "telechargement",
    actionDate: new Date("2024-07-08T09:15:22"),
    actionBy: "Jean Dupont",
    fileName: "rapport-controle-conformite.pdf",
    details: "Téléchargement du rapport de mission",
  },
  {
    id: "r7",
    rapportId: "3",
    mandatReference: "REF-2024-005",
    mandatId: "5",
    actionType: "upload",
    actionDate: new Date("2024-09-05T13:40:15"),
    actionBy: "Marie Martin",
    fileName: "rapport-audit-financier.pdf",
    details: "Téléversement initial du rapport de mission",
  },
  {
    id: "r8",
    rapportId: "3",
    mandatReference: "REF-2024-005",
    mandatId: "5",
    actionType: "consultation",
    actionDate: new Date("2024-09-06T10:30:18"),
    actionBy: "Pierre Durand",
    fileName: "rapport-audit-financier.pdf",
    details: "Consultation du rapport de mission",
  },
  {
    id: "r9",
    rapportId: "3",
    mandatReference: "REF-2024-005",
    mandatId: "5",
    actionType: "telechargement",
    actionDate: new Date("2024-09-07T16:22:50"),
    actionBy: "Sophie Lefebvre",
    fileName: "rapport-audit-financier.pdf",
    details: "Téléchargement du rapport de mission",
  },
  {
    id: "r10",
    rapportId: "1",
    mandatReference: "REF-2024-001",
    mandatId: "1",
    actionType: "suppression",
    actionDate: new Date("2024-09-15T08:55:30"),
    actionBy: "Admin Système",
    fileName: "rapport-audit-processus-internes.pdf",
    details: "Suppression du rapport suite à une mise à jour",
  },
]

// Fonction pour obtenir une couleur de badge en fonction du type d'action
const getActionBadgeStyles = (action: ActionType) => {
  switch (action) {
    case "upload":
      return "bg-green-100 text-green-800 hover:bg-green-200"
    case "consultation":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200"
    case "telechargement":
      return "bg-amber-100 text-amber-800 hover:bg-amber-200"
    case "suppression":
      return "bg-red-100 text-red-800 hover:bg-red-200"
    default:
      return ""
  }
}

// Fonction pour obtenir le libellé en fonction du type d'action
const getActionLabel = (action: ActionType) => {
  switch (action) {
    case "upload":
      return "Téléversement"
    case "consultation":
      return "Consultation"
    case "telechargement":
      return "Téléchargement"
    case "suppression":
      return "Suppression"
    default:
      return action
  }
}

export default function RapportsHistoryList() {
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
  const uniqueUsers = Array.from(new Set(rapportsHistoryData.map((entry) => entry.actionBy))).sort()

  // Filtrage de l'historique
  const filteredHistory = rapportsHistoryData.filter((entry) => {
    const matchesSearch =
      entry.mandatReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.actionBy.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesAction = actionTypeFilter === "all" || entry.actionType === actionTypeFilter
    const matchesUser = userFilter === "all" || entry.actionBy === userFilter

    const matchesDateRange =
      (!startDate || entry.actionDate >= startDate) &&
      (!endDate || entry.actionDate <= new Date(endDate.setHours(23, 59, 59, 999)))

    return matchesSearch && matchesAction && matchesUser && matchesDateRange
  })

  // Tri de l'historique
  const sortedHistory = [...filteredHistory].sort((a, b) => {
    if (sortField === "actionDate") {
      return sortDirection === "asc"
        ? a.actionDate.getTime() - b.actionDate.getTime()
        : b.actionDate.getTime() - a.actionDate.getTime()
    } else if (sortField === "reference") {
      return sortDirection === "asc"
        ? a.mandatReference.localeCompare(b.mandatReference)
        : b.mandatReference.localeCompare(a.mandatReference)
    } else if (sortField === "fileName") {
      return sortDirection === "asc" ? a.fileName.localeCompare(b.fileName) : b.fileName.localeCompare(a.fileName)
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
  const totalPages = Math.ceil(sortedHistory.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedHistory = sortedHistory.slice(startIndex, startIndex + itemsPerPage)

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

  // Simuler la visualisation d'un rapport
  const viewRapport = (rapportId: string) => {
    alert(`Visualisation du rapport ${rapportId}`)
    // Dans une application réelle, vous redirigeriez vers une page de visualisation du PDF
  }

  // Simuler le téléchargement d'un rapport
  const downloadRapport = (rapportId: string, fileName: string) => {
    alert(`Téléchargement du rapport ${fileName}`)
    // Dans une application réelle, vous utiliseriez une API pour télécharger le fichier
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
              <SelectItem value="upload">Téléversement</SelectItem>
              <SelectItem value="consultation">Consultation</SelectItem>
              <SelectItem value="telechargement">Téléchargement</SelectItem>
              <SelectItem value="suppression">Suppression</SelectItem>
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
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => toggleSort("reference")}>
                    Référence
                    {sortField === "reference" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => toggleSort("fileName")}>
                    Fichier
                    {sortField === "fileName" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => toggleSort("actionType")}>
                    Action
                    {sortField === "actionType" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => toggleSort("actionBy")}>
                    Utilisateur
                    {sortField === "actionBy" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => toggleSort("actionDate")}>
                    Date
                    {sortField === "actionDate" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedHistory.length > 0 ? (
                  paginatedHistory.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <Link href={`/mandat/${entry.mandatId}`} className="hover:underline font-medium">
                          {entry.mandatReference}
                        </Link>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <div className="truncate" title={entry.fileName}>
                          {entry.fileName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getActionBadgeStyles(entry.actionType)}>
                          {getActionLabel(entry.actionType)}
                        </Badge>
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
                      <TableCell>
                        {entry.actionType !== "suppression" && (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => viewRapport(entry.rapportId)}
                              title="Visualiser"
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">Visualiser</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => downloadRapport(entry.rapportId, entry.fileName)}
                              title="Télécharger"
                            >
                              <Download className="h-4 w-4" />
                              <span className="sr-only">Télécharger</span>
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
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
            Affichage de {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedHistory.length)} sur{" "}
            {sortedHistory.length} entrées
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
