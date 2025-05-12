"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, SlidersHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

// Types pour l'historique des mandats
type ActionType = "creation" | "modification" | "suppression"

interface MandatHistoryEntry {
  id: string
  mandatId: string
  mandatReference: string
  actionType: ActionType
  actionDate: Date
  actionBy: string
  details: string
}

// Données fictives pour l'historique des mandats
const mandatsHistoryData: MandatHistoryEntry[] = [
  {
    id: "h1",
    mandatId: "1",
    mandatReference: "REF-2024-001",
    actionType: "creation",
    actionDate: new Date("2024-04-28T10:15:23"),
    actionBy: "Jean Dupont",
    details: "Création initiale du mandat de mission",
  },
  {
    id: "h2",
    mandatId: "1",
    mandatReference: "REF-2024-001",
    actionType: "modification",
    actionDate: new Date("2024-04-30T14:22:10"),
    actionBy: "Marie Martin",
    details: "Modification des dates de mission",
  },
  {
    id: "h3",
    mandatId: "2",
    mandatReference: "REF-2024-002",
    actionType: "creation",
    actionDate: new Date("2024-05-15T09:05:47"),
    actionBy: "Pierre Durand",
    details: "Création initiale du mandat de mission",
  },
  {
    id: "h4",
    mandatId: "3",
    mandatReference: "REF-2024-003",
    actionType: "creation",
    actionDate: new Date("2024-06-10T11:32:08"),
    actionBy: "Sophie Lefebvre",
    details: "Création initiale du mandat de mission",
  },
  {
    id: "h5",
    mandatId: "2",
    mandatReference: "REF-2024-002",
    actionType: "modification",
    actionDate: new Date("2024-06-12T16:45:33"),
    actionBy: "Pierre Durand",
    details: "Ajout de membres d'équipe supplémentaires",
  },
  {
    id: "h6",
    mandatId: "4",
    mandatReference: "REF-2024-004",
    actionType: "creation",
    actionDate: new Date("2024-06-25T08:30:15"),
    actionBy: "Thomas Bernard",
    details: "Création initiale du mandat de mission",
  },
  {
    id: "h7",
    mandatId: "5",
    mandatReference: "REF-2024-005",
    actionType: "creation",
    actionDate: new Date("2024-07-18T13:20:45"),
    actionBy: "Jean Dupont",
    details: "Création initiale du mandat de mission",
  },
  {
    id: "h8",
    mandatId: "3",
    mandatReference: "REF-2024-003",
    actionType: "modification",
    actionDate: new Date("2024-07-20T10:12:56"),
    actionBy: "Sophie Lefebvre",
    details: "Modification du périmètre de la mission",
  },
  {
    id: "h9",
    mandatId: "5",
    mandatReference: "REF-2024-005",
    actionType: "modification",
    actionDate: new Date("2024-07-25T15:33:22"),
    actionBy: "Marie Martin",
    details: "Mise à jour des ressources matérielles",
  },
  {
    id: "h10",
    mandatId: "2",
    mandatReference: "REF-2024-002",
    actionType: "suppression",
    actionDate: new Date("2024-08-05T09:45:11"),
    actionBy: "Admin Système",
    details: "Suppression du mandat suite à une annulation",
  },
]

// Fonction pour obtenir une couleur de badge en fonction du type d'action
const getActionBadgeStyles = (action: ActionType) => {
  switch (action) {
    case "creation":
      return "bg-green-100 text-green-800 hover:bg-green-200"
    case "modification":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200"
    case "suppression":
      return "bg-red-100 text-red-800 hover:bg-red-200"
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
    case "suppression":
      return "Suppression"
    default:
      return action
  }
}

export default function MandatsHistoryList() {
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
  const uniqueUsers = Array.from(new Set(mandatsHistoryData.map((entry) => entry.actionBy))).sort()

  // Filtrage de l'historique
  const filteredHistory = mandatsHistoryData.filter((entry) => {
    const matchesSearch =
      entry.mandatReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
                  <TableHead>Détails</TableHead>
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
                      <TableCell className="max-w-[300px]">
                        <div className="line-clamp-2">{entry.details}</div>
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
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
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
