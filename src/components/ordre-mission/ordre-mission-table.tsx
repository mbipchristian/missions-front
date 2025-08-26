"use client"

import type React from "react"
import { useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { useTranslations } from "next-intl"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, X, Calendar, Clock, DollarSign, FileText, Check, Download } from 'lucide-react'
import { type OrdreMission, OrdreMissionStatut } from "@/types"
import { apiService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface OrdreMissionTableProps {
  ordresMission: OrdreMission[]
  title: string
  renderActions?: (ordre: OrdreMission) => React.ReactNode
  hideColumns?: string[] // Nouvelle prop pour masquer des colonnes
}

export function OrdreMissionTable({ ordresMission, title, renderActions, hideColumns = [] }: OrdreMissionTableProps) {
  const t = useTranslations("OrdreMissionTable")
  const [selectedOrdre, setSelectedOrdre] = useState<OrdreMission | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const { toast } = useToast()

  const getStatusBadgeVariant = (statut: OrdreMissionStatut | string) => {
    switch (statut) {
      case OrdreMissionStatut.EN_ATTENTE_JUSTIFICATIF:
      case "EN_ATTENTE_JUSTIFICATIF":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case OrdreMissionStatut.EN_ATTENTE_CONFIRMATION:
      case "EN_ATTENTE_CONFIRMATION":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case OrdreMissionStatut.EN_ATTENTE_EXECUTION:
      case "EN_ATTENTE_EXECUTION":
        return "bg-orange-50 text-orange-700 border-orange-200"
      case OrdreMissionStatut.EN_COURS:
      case "EN_COURS":
        return "bg-blue-500 text-white"
      case OrdreMissionStatut.ACHEVE:
      case "ACHEVE":
        return "bg-green-500 text-white"
      case OrdreMissionStatut.REJETE:
      case "REJETE":
        return "bg-red-500 text-white"
      default:
        return "bg-gray-50 text-gray-700"
    }
  }

  const getStatusIcon = (statut: OrdreMissionStatut | string) => {
    switch (statut) {
      case OrdreMissionStatut.EN_ATTENTE_JUSTIFICATIF:
      case "EN_ATTENTE_JUSTIFICATIF":
        return <FileText className="h-2.5 w-2.5" />
      case OrdreMissionStatut.EN_ATTENTE_CONFIRMATION:
      case "EN_ATTENTE_CONFIRMATION":
        return <Clock className="h-2.5 w-2.5" />
      case OrdreMissionStatut.EN_ATTENTE_EXECUTION:
      case "EN_ATTENTE_EXECUTION":
        return <Calendar className="h-2.5 w-2.5" />
      case OrdreMissionStatut.EN_COURS:
      case "EN_COURS":
        return <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
      case OrdreMissionStatut.ACHEVE:
      case "ACHEVE":
        return <Check className="h-2.5 w-2.5" />
      case OrdreMissionStatut.REJETE:
      case "REJETE":
        return <X className="h-2.5 w-2.5" />
      default:
        return null
    }
  }

  const getStatusLabel = (statut: OrdreMissionStatut | string) => {
    switch (statut) {
      case OrdreMissionStatut.EN_ATTENTE_JUSTIFICATIF:
      case "EN_ATTENTE_JUSTIFICATIF":
        return t("status.justification")
      case OrdreMissionStatut.EN_ATTENTE_CONFIRMATION:
      case "EN_ATTENTE_CONFIRMATION":
        return t("status.confirmation")
      case OrdreMissionStatut.EN_ATTENTE_EXECUTION:
      case "EN_ATTENTE_EXECUTION":
        return t("status.execution")
      case OrdreMissionStatut.EN_COURS:
      case "EN_COURS":
        return t("status.inProgress")
      case OrdreMissionStatut.ACHEVE:
      case "ACHEVE":
        return t("status.completed")
      case OrdreMissionStatut.REJETE:
      case "REJETE":
        return t("status.rejected")
      default:
        return t("status.unknown")
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
  }

  const shouldShowColumn = (columnName: string) => {
    return !hideColumns.includes(columnName)
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
    <div className="space-y-3">
      <Card className="shadow-sm border">
        <CardContent className="p-0">
          {ordresMission.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-medium">{t("empty.title")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 h-8">
                    <TableHead className="font-semibold text-gray-700 text-xs py-2 px-2 w-20">{t("headers.name")}</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs py-2 px-2 w-32">{t("headers.objective")}</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs py-2 px-2 w-24">{t("headers.status")}</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs py-2 px-2 w-20">{t("headers.start")}</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs py-2 px-2 w-20">{t("headers.end")}</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs py-2 px-2 w-16">{t("headers.duration")}</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs py-2 px-2 w-20">{t("headers.created")}</TableHead>
                    {shouldShowColumn('confirme') && (
                      <TableHead className="font-semibold text-gray-700 text-xs py-2 px-2 w-20">{t("headers.confirmed")}</TableHead>
                    )}
                    {shouldShowColumn('rejete') && (
                      <TableHead className="font-semibold text-gray-700 text-xs py-2 px-2 w-20">{t("headers.rejected")}</TableHead>
                    )}
                    <TableHead className="font-semibold text-gray-700 text-xs py-2 px-2 w-20">{t("headers.amount")}</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs py-2 px-2 w-24">{t("headers.documents")}</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs py-2 px-2 w-16 text-center">{t("headers.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordresMission.map((ordre, index) => (
                    <TableRow
                      key={ordre.id}
                      className={`hover:bg-blue-50 transition-colors h-10 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                      }`}
                    >
                      <TableCell className="font-medium text-blue-700 text-xs py-1 px-2">
                        {ordre.user?.username}
                      </TableCell>
                      <TableCell className="text-xs py-1 px-2">
                        <div className="truncate font-medium text-gray-800 max-w-32" title={ordre.objectif}>
                          {truncateText(ordre.objectif, 20)}
                        </div>
                      </TableCell>
                      <TableCell className="py-1 px-2">
                        {ordre.statut ? (
                          <Badge className={`${getStatusBadgeVariant(ordre.statut)} flex items-center w-fit text-xs px-1.5 py-0.5 gap-1`}>
                            {getStatusIcon(ordre.statut)}
                            {getStatusLabel(ordre.statut)}
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800 text-xs px-1.5 py-0.5">
                            N/A
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs py-1 px-2 text-gray-600">
                        {ordre.dateDebut ?
                          format(new Date(ordre.dateDebut), "dd/MM/yy", { locale: fr }) :
                          "—"
                        }
                      </TableCell>
                      <TableCell className="text-xs py-1 px-2 text-gray-600">
                        {ordre.dateFin ?
                          format(new Date(ordre.dateFin), "dd/MM/yy", { locale: fr }) :
                          "—"
                        }
                      </TableCell>
                      <TableCell className="py-1 px-2">
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300 text-xs px-1.5 py-0.5">
                          {t("labels.durationDays", { days: ordre.duree || 0 })}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs py-1 px-2 text-gray-600">
                        {ordre.created_at ?
                          format(new Date(ordre.created_at), "dd/MM/yy", { locale: fr }) :
                          "—"
                        }
                      </TableCell>
                      {shouldShowColumn('confirme') && (
                        <TableCell className="text-xs py-1 px-2">
                          {ordre.confirmele ? (
                            <span className="text-green-600 font-medium">
                              {format(new Date(ordre.confirmele), "dd/MM/yy", { locale: fr })}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </TableCell>
                      )}
                      {shouldShowColumn('rejete') && (
                        <TableCell className="text-xs py-1 px-2">
                          {ordre.rejetele ? (
                            <span className="text-green-600 font-medium">
                              {format(new Date(ordre.rejetele), "dd/MM/yy", { locale: fr })}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </TableCell>
                      )}
                      <TableCell className="py-1 px-2">
                        <div className="font-semibold text-green-700 bg-green-50 px-1.5 py-0.5 rounded text-xs">
                          {formatCurrency(ordre.decompteTotal || 0).replace(' XAF', '')}
                        </div>
                      </TableCell>
                      <TableCell className="px-2 py-1">
                        {ordre.piecesJointes && ordre.piecesJointes.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {ordre.piecesJointes.map((pieceJointe, index) => (
                              <Button
                                key={pieceJointe.id}
                                variant="outline"
                                size="sm"
                                className="h-5 px-1.5 text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                                onClick={() => handleDownloadPieceJointe(pieceJointe.id, pieceJointe.nomOriginal)}
                                disabled={loading === `download-${pieceJointe.id}`}
                                title={t("documents.downloadTitle", { name: pieceJointe.nomOriginal || t("documents.document") })}
                              >
                                <Download className="h-2.5 w-2.5 mr-1" />
                                {loading === `download-${pieceJointe.id}`
                                  ? "..."
                                  : index === 0 ? t("documents.missionOrder") : index === 1 ? t("documents.attachment") : t("documents.attachmentNumber", { number: index + 1 })}
                              </Button>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">{t("documents.none")}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center py-1 px-2">
                        {renderActions ? (
                          renderActions(ordre)
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrdre(ordre)}
                            className="bg-blue-500 text-white border-0 hover:bg-blue-600 h-6 w-6 p-0"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
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
      {selectedOrdre && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-0">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <CardTitle className="flex items-center justify-between text-xl">
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6" />
                  <div>
                    <div>{t("modal.title", { reference: selectedOrdre.reference })}</div>
                    <div className="text-sm font-normal text-blue-100 mt-1">
                      {t("modal.subtitle")}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedOrdre(null)}
                  className="text-white hover:bg-white/20 rounded-full p-2"
                >
                  <X className="h-5 w-5" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-gradient-to-br from-white to-blue-50">
              <div className="space-y-6">
                {/* Objectif */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    {t("modal.sections.missionObjective")}
                  </h4>
                  <p className="text-gray-700 leading-relaxed">{selectedOrdre.objectif}</p>
                </div>

                {/* Statut */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                  <h4 className="font-semibold text-gray-800 mb-3">{t("modal.sections.currentStatus")}</h4>
                  <Badge className={`${getStatusBadgeVariant(selectedOrdre.statut)} flex items-center w-fit text-sm px-3 py-2`}>
                    {getStatusIcon(selectedOrdre.statut)}
                    {getStatusLabel(selectedOrdre.statut)}
                  </Badge>
                </div>

                {/* Informations temporelles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-green-600" />
                      {t("modal.sections.startDate")}
                    </h4>
                    <p className="text-lg font-medium text-green-700">
                      {selectedOrdre.dateDebut ?
                        format(new Date(selectedOrdre.dateDebut), "dd MMMM yyyy", { locale: fr }) :
                        t("modal.dateNotDefined")
                      }
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-red-600" />
                      {t("modal.sections.endDate")}
                    </h4>
                    <p className="text-lg font-medium text-red-700">
                      {selectedOrdre.dateFin ?
                        format(new Date(selectedOrdre.dateFin), "dd MMMM yyyy", { locale: fr }) :
                        t("modal.dateNotDefined")
                      }
                    </p>
                  </div>
                </div>

                {/* Informations de paiement */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                    <h4 className="font-semibold text-gray-800 mb-2">{t("modal.sections.paymentMode")}</h4>
                    <p className="text-gray-700">{selectedOrdre.modePaiement || t("modal.notDefined")}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                    <h4 className="font-semibold text-gray-800 mb-2">{t("modal.sections.currency")}</h4>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                      {selectedOrdre.devise || "XAF"}
                    </Badge>
                  </div>
                </div>

                {/* Détails financiers */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    {t("modal.sections.financialDetails")}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                      <p className="text-sm font-medium text-gray-600 mb-1">{t("modal.financial.totalAmount")}</p>
                      <p className="text-2xl font-bold text-blue-700">
                        {formatCurrency(selectedOrdre.decompteTotal || 0)}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {t("modal.financial.advance", { rate: selectedOrdre.tauxAvance || 0 })}
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(selectedOrdre.decompteAvance || 0)}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                      <p className="text-sm font-medium text-gray-600 mb-1">{t("modal.financial.balance")}</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {formatCurrency(selectedOrdre.decompteRelicat || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                {selectedOrdre.piecesJointes && selectedOrdre.piecesJointes.length > 0 && (
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Download className="h-4 w-4 text-purple-600" />
                      {t("modal.sections.documents", { count: selectedOrdre.piecesJointes.length })}
                    </h4>
                    <div className="space-y-2">
                      {selectedOrdre.piecesJointes.map((pieceJointe, index) => (
                        <div key={pieceJointe.id} className="flex items-center justify-between bg-gray-50 p-2 rounded border">
                          <span className="text-sm text-gray-700 truncate">
                            {pieceJointe.nomOriginal || t("modal.documents.document", { number: index + 1 })}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadPieceJointe(pieceJointe.id, pieceJointe.nomOriginal)}
                            disabled={loading === `download-${pieceJointe.id}`}
                            className="ml-2 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
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
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedOrdre(null)}
                    className="hover:bg-gray-100"
                  >
                    {t("actions.close")}
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
