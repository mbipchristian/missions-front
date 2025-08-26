"use client"

import type React from "react"
import { useState } from "react"
import { format } from "date-fns"
import { fr, enUS } from "date-fns/locale"
import { useTranslations } from "next-intl"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Eye, Users, MapPin, Package, X, Calendar, Clock, Target, MoreHorizontal, Edit, Trash2, Download } from 'lucide-react'
import { type Mandat, MandatStatut } from "@/types"
import { apiService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface MandatTableProps {
  mandats: Mandat[]
  title: string
  renderActions?: (mandat: Mandat) => React.ReactNode
}

export function MandatTable({ mandats, title, renderActions }: MandatTableProps) {
  const t = useTranslations("MandatTable")
  const [selectedMandat, setSelectedMandat] = useState<Mandat | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const { toast } = useToast()

  const getStatusBadgeVariant = (statut: MandatStatut) => {
    switch (statut) {
      case MandatStatut.EN_ATTENTE_CONFIRMATION:
        return "secondary"
      case MandatStatut.EN_ATTENTE_EXECUTION:
        return "outline"
      case MandatStatut.EN_COURS:
        return "default"
      case MandatStatut.ACHEVE:
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getStatusColor = (statut: MandatStatut) => {
    switch (statut) {
      case MandatStatut.EN_ATTENTE_CONFIRMATION:
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case MandatStatut.EN_ATTENTE_EXECUTION:
        return "bg-blue-50 text-blue-700 border-blue-200"
      case MandatStatut.EN_COURS:
        return "bg-green-50 text-green-700 border-green-200"
      case MandatStatut.ACHEVE:
        return "bg-red-200 text-gray-700 border-gray-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getStatusLabel = (statut: MandatStatut) => {
    switch (statut) {
      case MandatStatut.EN_ATTENTE_CONFIRMATION:
        return t("status.awaitingConfirmation")
      case MandatStatut.EN_ATTENTE_EXECUTION:
        return t("status.awaitingExecution")
      case MandatStatut.EN_COURS:
        return t("status.inProgress")
      case MandatStatut.ACHEVE:
        return t("status.completed")
      default:
        return statut
    }
  }

  const handleDownloadPieceJointe = async (pieceJointeId: number, nomOriginal?: string) => {
    try {
      setLoading(`download-${pieceJointeId}`)
      const blob = await apiService.downloadPieceJointe(pieceJointeId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = nomOriginal || `document_${pieceJointeId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: t("success.title"),
        description: t("success.fileDownloaded"),
        variant: "default",
      })
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error)
      toast({
        title: t("errors.title"),
        description: t("errors.downloadFailed"),
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden shadow-sm border bg-white">
        <CardContent className="p-0">
          {mandats.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Target className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-base font-medium">{t("empty.title")}</p>
              <p className="text-sm">{t("empty.description")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50 border-b">
                    <TableHead className="font-medium text-gray-700 py-2 px-3 text-xs">{t("headers.reference")}</TableHead>
                    <TableHead className="font-medium text-gray-700 py-2 px-3 text-xs">{t("headers.objective")}</TableHead>
                    <TableHead className="font-medium text-gray-700 py-2 px-3 text-xs">{t("headers.status")}</TableHead>
                    <TableHead className="font-medium text-gray-700 py-2 px-3 text-xs">{t("headers.start")}</TableHead>
                    <TableHead className="font-medium text-gray-700 py-2 px-3 text-xs">{t("headers.end")}</TableHead>
                    <TableHead className="font-medium text-gray-700 py-2 px-3 text-xs">{t("headers.duration")}</TableHead>
                    <TableHead className="font-medium text-gray-700 py-2 px-3 text-xs">{t("headers.created")}</TableHead>
                    <TableHead className="font-medium text-gray-700 py-2 px-3 text-xs">{t("headers.confirmed")}</TableHead>
                    <TableHead className="font-medium text-gray-700 py-2 px-3 text-xs">{t("headers.assignments")}</TableHead>
                    <TableHead className="font-medium text-gray-700 py-2 px-3 text-xs">{t("headers.documents")}</TableHead>
                    <TableHead className="font-medium text-gray-700 py-2 px-3 text-xs w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mandats.map((mandat, index) => (
                    <TableRow
                      key={mandat.id}
                      className={`
                        transition-colors hover:bg-gray-50 border-b
                        ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}
                      `}
                    >
                      <TableCell className="font-medium text-blue-600 py-2 px-3 text-xs">
                        {mandat.reference}
                      </TableCell>
                      <TableCell className="max-w-32 py-2 px-3">
                        <div className="truncate text-xs font-medium text-gray-800" title={mandat.objectif}>
                          {mandat.objectif}
                        </div>
                      </TableCell>
                      <TableCell className="py-2 px-3">
                        <Badge className={`${getStatusColor(mandat.statut)} text-xs px-2 py-0.5 font-medium`}>
                          {getStatusLabel(mandat.statut)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600 py-2 px-3 text-xs">
                        {format(new Date(mandat.dateDebut), "dd/MM/yy", { locale: fr })}
                      </TableCell>
                      <TableCell className="text-gray-600 py-2 px-3 text-xs">
                        {format(new Date(mandat.dateFin), "dd/MM/yy", { locale: fr })}
                      </TableCell>
                      <TableCell className="py-2 px-3">
                        <span className="text-xs font-medium text-gray-700">{mandat.duree}j</span>
                      </TableCell>
                      <TableCell className="text-gray-500 py-2 px-3 text-xs">
                        {format(new Date(mandat.createdAt), "dd/MM/yy", { locale: fr })}
                      </TableCell>
                      <TableCell className="text-gray-500 py-2 px-3 text-xs">
                        {mandat.confirmele
                          ? format(new Date(mandat.confirmele), "dd/MM/yy", { locale: fr })
                          : <span className="text-yellow-600">{t("common.no")}</span>}
                      </TableCell>
                      <TableCell className="py-2 px-3">
                        <div className="flex items-center space-x-1">
                          <div className="flex items-center space-x-1 bg-blue-50 px-1.5 py-0.5 rounded text-xs">
                            <Users className="h-3 w-3 text-blue-600" />
                            <span className="text-blue-700 font-medium">{mandat.usersCount}</span>
                          </div>
                          <div className="flex items-center space-x-1 bg-green-50 px-1.5 py-0.5 rounded text-xs">
                            <MapPin className="h-3 w-3 text-green-600" />
                            <span className="text-green-700 font-medium">{mandat.villesCount}</span>
                          </div>
                          <div className="flex items-center space-x-1 bg-yellow-50 px-1.5 py-0.5 rounded text-xs">
                            <Package className="h-3 w-3 text-yellow-600" />
                            <span className="text-yellow-700 font-medium">{mandat.ressourcesCount}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-2 px-3">
                        {mandat.piecesJointes && mandat.piecesJointes.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {mandat.piecesJointes.map((pieceJointe, index) => (
                              <Button
                                key={pieceJointe.id}
                                variant="outline"
                                size="sm"
                                className="h-6 px-2 text-xs bg-green-200 hover:bg-gray-50 text-gray-700"
                                onClick={() => handleDownloadPieceJointe(pieceJointe.id, pieceJointe.nomOriginal)}
                                disabled={loading === `download-${pieceJointe.id}`}
                                title={t("documents.downloadTitle", { name: pieceJointe.nomOriginal || t("documents.document") })}
                              >
                                <Download className="h-3 w-3 mr-1" />
                                {loading === `download-${pieceJointe.id}` ? "..." : 
                                  index === 0 ? t("documents.mandat") : 
                                  index === 1 ? t("documents.report") : 
                                  t("documents.pdf", { number: index + 1 })}
                              </Button>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">{t("documents.none")}</span>
                        )}
                      </TableCell>
                      <TableCell className="py-2 px-3">
                        {renderActions ? (
                          renderActions(mandat)
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-gray-100"
                              >
                                <MoreHorizontal className="h-4 w-4 text-gray-500" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-32">
                              <DropdownMenuItem onClick={() => setSelectedMandat(mandat)}>
                                <Eye className="h-4 w-4 mr-2" />
                                {t("actions.view")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de détails */}
      {selectedMandat && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Target className="h-6 w-6" />
                    {t("modal.title", { reference: selectedMandat.reference })}
                  </CardTitle>
                  <Badge className={`${getStatusColor(selectedMandat.statut)} text-xs`}>
                    {getStatusLabel(selectedMandat.statut)}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMandat(null)}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 overflow-y-auto max-h-[calc(90vh-100px)]">
              <div className="space-y-4">
                {/* Objectif */}
                <div className="bg-gray-50 p-3 rounded border">
                  <h4 className="font-medium text-gray-800 flex items-center gap-2 mb-2 text-sm">
                    <Target className="h-4 w-4" />
                    {t("modal.sections.objective")}
                  </h4>
                  <p className="text-gray-700 text-sm leading-relaxed">{selectedMandat.objectif}</p>
                </div>

                {/* Informations temporelles */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-green-50 p-3 rounded border border-green-200">
                    <h4 className="font-medium text-green-800 flex items-center gap-2 mb-1 text-sm">
                      <Calendar className="h-4 w-4" />
                      {t("modal.sections.startDate")}
                    </h4>
                    <p className="text-green-700 font-medium text-sm">
                      {format(new Date(selectedMandat.dateDebut), "dd/MM/yyyy", { locale: fr })}
                    </p>
                  </div>
                  <div className="bg-red-50 p-3 rounded border border-red-200">
                    <h4 className="font-medium text-red-800 flex items-center gap-2 mb-1 text-sm">
                      <Calendar className="h-4 w-4" />
                      {t("modal.sections.endDate")}
                    </h4>
                    <p className="text-red-700 font-medium text-sm">
                      {format(new Date(selectedMandat.dateFin), "dd/MM/yyyy", { locale: fr })}
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                    <h4 className="font-medium text-yellow-800 flex items-center gap-2 mb-1 text-sm">
                      <Clock className="h-4 w-4" />
                      {t("modal.sections.duration")}
                    </h4>
                    <p className="text-yellow-700 font-medium text-sm">{t("modal.durationValue", { days: selectedMandat.duree })}</p>
                  </div>
                </div>

                {/* Équipe assignée */}
                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <h4 className="font-medium text-blue-800 flex items-center gap-2 mb-2 text-sm">
                    <Users className="h-4 w-4" />
                    {t("modal.sections.assignedTeam", { count: selectedMandat.users.length })}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedMandat.users.map((user) => (
                      <div key={user.id} className="bg-white p-2 rounded border border-blue-200">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-xs">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-medium text-gray-800 text-sm">{user.username}</span>
                            <span className="text-xs text-gray-500 ml-1">({user.matricule})</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Villes */}
                <div className="bg-green-50 p-3 rounded border border-green-200">
                  <h4 className="font-medium text-green-800 flex items-center gap-2 mb-2 text-sm">
                    <MapPin className="h-4 w-4" />
                    {t("modal.sections.concernedCities", { count: selectedMandat.villes.length })}
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedMandat.villes.map((ville) => (
                      <Badge key={ville.id} className="bg-green-100 text-green-800 border-green-300 text-xs">
                        {ville.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Ressources */}
                <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                  <h4 className="font-medium text-yellow-800 flex items-center gap-2 mb-2 text-sm">
                    <Package className="h-4 w-4" />
                    {t("modal.sections.necessaryResources", { count: selectedMandat.ressources.length })}
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedMandat.ressources.map((ressource) => (
                      <Badge key={ressource.id} className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">
                        {ressource.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Documents */}
                {selectedMandat.piecesJointes && selectedMandat.piecesJointes.length > 0 && (
                  <div className="bg-purple-50 p-3 rounded border border-purple-200">
                    <h4 className="font-medium text-purple-800 flex items-center gap-2 mb-2 text-sm">
                      <Download className="h-4 w-4" />
                      {t("modal.sections.documents", { count: selectedMandat.piecesJointes.length })}
                    </h4>
                    <div className="space-y-2">
                      {selectedMandat.piecesJointes.map((pieceJointe, index) => (
                        <div key={pieceJointe.id} className="flex items-center justify-between bg-white p-2 rounded border border-purple-200">
                          <span className="text-sm text-gray-700 truncate">
                            {pieceJointe.nomOriginal || t("documents.document", { number: index + 1 })}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadPieceJointe(pieceJointe.id, pieceJointe.nomOriginal)}
                            disabled={loading === `download-${pieceJointe.id}`}
                            className="ml-2"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            {loading === `download-${pieceJointe.id}` ? "..." : t("actions.download")}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-2 pt-3 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedMandat(null)}
                    size="sm"
                  >
                    {t("actions.close")}
                  </Button>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    {t("actions.edit")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
