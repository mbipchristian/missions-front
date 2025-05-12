"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download, Eye, FileText, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"

// Données fictives pour les rapports
const rapportsData = [
  {
    id: "1",
    mandatReference: "REF-2024-001",
    mandatId: "1",
    fileName: "rapport-audit-processus-internes.pdf",
    dateEnregistrement: new Date("2024-05-16"),
    taille: 2.4, // en Mo
    objectifMandat: "Audit des processus internes",
  },
  {
    id: "2",
    mandatReference: "REF-2024-003",
    mandatId: "3",
    fileName: "rapport-controle-conformite.pdf",
    dateEnregistrement: new Date("2024-07-02"),
    taille: 3.7,
    objectifMandat: "Contrôle de conformité réglementaire",
  },
  {
    id: "3",
    mandatReference: "REF-2024-005",
    mandatId: "5",
    fileName: "rapport-audit-financier.pdf",
    dateEnregistrement: new Date("2024-09-05"),
    taille: 5.2,
    objectifMandat: "Audit financier annuel",
  },
]

export default function RapportsList() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Filtrage des rapports
  const filteredRapports = rapportsData.filter((rapport) => {
    return (
      rapport.mandatReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rapport.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rapport.objectifMandat.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  // Pagination
  const totalPages = Math.ceil(filteredRapports.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedRapports = filteredRapports.slice(startIndex, startIndex + itemsPerPage)

  // Navigation vers la page des mandats
  const viewMandats = () => {
    router.push("/mes-mandats")
  }

  // Simuler le téléchargement d'un rapport
  const downloadRapport = (rapportId: string, fileName: string) => {
    alert(`Téléchargement du rapport ${fileName}`)
    // Dans une application réelle, vous utiliseriez une API pour télécharger le fichier
  }

  // Simuler la visualisation d'un rapport
  const viewRapport = (rapportId: string) => {
    alert(`Visualisation du rapport ${rapportId}`)
    // Dans une application réelle, vous redirigeriez vers une page de visualisation du PDF
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
          <Button variant="outline" onClick={viewMandats}>
            <FileText className="h-4 w-4 mr-2" />
            Voir mes mandats
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Référence du mandat</TableHead>
                  <TableHead className="hidden md:table-cell">Objectif</TableHead>
                  <TableHead>Fichier</TableHead>
                  <TableHead className="hidden md:table-cell">Date d'enregistrement</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRapports.length > 0 ? (
                  paginatedRapports.map((rapport) => (
                    <TableRow key={rapport.id}>
                      <TableCell className="font-medium">
                        <Link href={`/mandat/${rapport.mandatId}`} className="hover:underline">
                          {rapport.mandatReference}
                        </Link>
                      </TableCell>
                      <TableCell className="hidden md:table-cell max-w-[300px]">
                        <div className="line-clamp-2">{rapport.objectifMandat}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="truncate max-w-[150px] md:max-w-[200px]">{rapport.fileName}</span>
                          <span className="text-xs text-muted-foreground">{rapport.taille.toFixed(1)} Mo</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {format(rapport.dateEnregistrement, "dd MMMM yyyy", { locale: fr })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => viewRapport(rapport.id)}
                            title="Visualiser"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Visualiser</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => downloadRapport(rapport.id, rapport.fileName)}
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
                    <TableCell colSpan={5} className="h-24 text-center">
                      Aucun rapport trouvé.
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
