"use client"

import type React from "react"
import { useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, X, Calendar, Clock, DollarSign, FileText, Check } from "lucide-react"
import { type OrdreMission, OrdreMissionStatut } from "@/types"

interface OrdreMissionTableProps {
  ordresMission: OrdreMission[]
  title: string
  renderActions?: (ordre: OrdreMission) => React.ReactNode
}

const getStatusBadgeVariant = (statut: OrdreMissionStatut | string) => {
  switch (statut) {
    case OrdreMissionStatut.EN_ATTENTE_JUSTIFICATIF:
    case "EN_ATTENTE_JUSTIFICATIF":
      return "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200"
    case OrdreMissionStatut.EN_ATTENTE_CONFIRMATION:
    case "EN_ATTENTE_CONFIRMATION":
      return "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200"
    case OrdreMissionStatut.EN_ATTENTE_EXECUTION:
    case "EN_ATTENTE_EXECUTION":
      return "bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200"
    case OrdreMissionStatut.EN_COURS:
    case "EN_COURS":
      return "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
    case OrdreMissionStatut.ACHEVE:
    case "ACHEVE":
      return "bg-green-500 text-white hover:bg-green-600"
    default:
      return "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200"
  }
}

const getStatusIcon = (statut: OrdreMissionStatut | string) => {
  switch (statut) {
    case OrdreMissionStatut.EN_ATTENTE_JUSTIFICATIF:
    case "EN_ATTENTE_JUSTIFICATIF":
      return <FileText className="h-3 w-3 mr-1" />
    case OrdreMissionStatut.EN_ATTENTE_CONFIRMATION:
    case "EN_ATTENTE_CONFIRMATION":
      return <Clock className="h-3 w-3 mr-1" />
    case OrdreMissionStatut.EN_ATTENTE_EXECUTION:
    case "EN_ATTENTE_EXECUTION":
      return <Calendar className="h-3 w-3 mr-1" />
    case OrdreMissionStatut.EN_COURS:
    case "EN_COURS":
      return <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
    case OrdreMissionStatut.ACHEVE:
    case "ACHEVE":
      return <Check className="h-3 w-3 mr-1" />
    default:
      return null
  }
}

const getStatusLabel = (statut: OrdreMissionStatut | string) => {
  switch (statut) {
    case OrdreMissionStatut.EN_ATTENTE_JUSTIFICATIF:
    case "EN_ATTENTE_JUSTIFICATIF":
      return "En attente de justificatif"
    case OrdreMissionStatut.EN_ATTENTE_CONFIRMATION:
    case "EN_ATTENTE_CONFIRMATION":
      return "En attente de confirmation"
    case OrdreMissionStatut.EN_ATTENTE_EXECUTION:
    case "EN_ATTENTE_EXECUTION":
      return "En attente d'exécution"
    case OrdreMissionStatut.EN_COURS:
    case "EN_COURS":
      return "En cours"
    case OrdreMissionStatut.ACHEVE:
    case "ACHEVE":
      return "Achevé"
    default:
      return statut || "Statut inconnu"
  }
}

export function OrdreMissionTable({ ordresMission, title, renderActions }: OrdreMissionTableProps) {
  const [selectedOrdre, setSelectedOrdre] = useState<OrdreMission | null>(null)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50">
        <CardHeader className="bg-gradient-to-r from-blue-300 via-blue-400 to-blue-500 p-6 rounded-xl shadow-lg">
          <CardTitle className="flex items-center justify-between text-xl">
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6" />
              {title}
            </div>
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 font-medium px-3 py-1">
              {ordresMission.length} ordre{ordresMission.length > 1 ? 's' : ''}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {ordresMission.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Aucun ordre de mission trouvé</p>
              <p className="text-sm mt-2">Les ordres de mission apparaîtront ici une fois créés</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-100">
                    <TableHead className="font-semibold text-gray-700">Référence</TableHead>
                    <TableHead className="font-semibold text-gray-700">Objectif</TableHead>
                    <TableHead className="font-semibold text-gray-700">Statut</TableHead>
                    <TableHead className="font-semibold text-gray-700">Période</TableHead>
                    <TableHead className="font-semibold text-gray-700">Durée</TableHead>
                    <TableHead className="font-semibold text-gray-700">Créé le</TableHead>
                    <TableHead className="font-semibold text-gray-700">Confirmé le</TableHead>
                    <TableHead className="font-semibold text-gray-700">Montant</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordresMission.map((ordre, index) => (
                    <TableRow 
                      key={ordre.id} 
                      className={`hover:bg-blue-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      }`}
                    >
                      <TableCell className="font-medium text-blue-700 bg-blue-50/50 rounded-l-lg">
                        {ordre.reference}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate font-medium text-gray-800" title={ordre.objectif}>
                          {ordre.objectif}
                        </div>
                      </TableCell>
                      <TableCell>
                        {ordre.statut ? (
                          <Badge className={`${getStatusBadgeVariant(ordre.statut)} flex items-center w-fit font-medium`}>
                            {getStatusIcon(ordre.statut)}
                            {getStatusLabel(ordre.statut)}
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800 border-gray-300">
                            Statut non défini
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-700">
                            {ordre.dateDebut ? 
                              format(new Date(ordre.dateDebut), "dd/MM/yyyy", { locale: fr }) : 
                              "—"
                            }
                          </div>
                          <div className="text-xs text-gray-500">
                            au {ordre.dateFin ? 
                              format(new Date(ordre.dateFin), "dd/MM/yyyy", { locale: fr }) : 
                              "—"
                            }
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                          {ordre.duree || 0} jour{(ordre.duree || 0) > 1 ? 's' : ''}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {ordre.created_at ? 
                          format(new Date(ordre.created_at), "dd/MM/yyyy", { locale: fr }) : 
                          "—"
                        }
                      </TableCell>
                      <TableCell className="text-sm">
                        {ordre.confirmele ? (
                          <span className="text-green-600 font-medium">
                            {format(new Date(ordre.confirmele), "dd/MM/yyyy", { locale: fr })}
                          </span>
                        ) : (
                          <span className="text-gray-400">Non confirmé</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-green-700 bg-green-50 px-2 py-1 rounded">
                          {formatCurrency(ordre.decompteTotal || 0)}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {renderActions ? (
                          renderActions(ordre)
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setSelectedOrdre(ordre)}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 hover:from-blue-600 hover:to-blue-700 shadow-md"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Voir
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

      {/* Modal de détails amélioré */}
      {selectedOrdre && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-0 animate-in slide-in-from-bottom-4 duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <CardTitle className="flex items-center justify-between text-xl">
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6" />
                  <div>
                    <div>Ordre de mission {selectedOrdre.reference}</div>
                    <div className="text-sm font-normal text-blue-100 mt-1">
                      Détails complets de la mission
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
                    Objectif de la mission
                  </h4>
                  <p className="text-gray-700 leading-relaxed">{selectedOrdre.objectif}</p>
                </div>

                {/* Statut */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                  <h4 className="font-semibold text-gray-800 mb-3">Statut actuel</h4>
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
                      Date de début
                    </h4>
                    <p className="text-lg font-medium text-green-700">
                      {selectedOrdre.dateDebut ? 
                        format(new Date(selectedOrdre.dateDebut), "dd MMMM yyyy", { locale: fr }) : 
                        "Date non définie"
                      }
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-red-600" />
                      Date de fin
                    </h4>
                    <p className="text-lg font-medium text-red-700">
                      {selectedOrdre.dateFin ? 
                        format(new Date(selectedOrdre.dateFin), "dd MMMM yyyy", { locale: fr }) : 
                        "Date non définie"
                      }
                    </p>
                  </div>
                </div>

                {/* Informations de paiement */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                    <h4 className="font-semibold text-gray-800 mb-2">Mode de paiement</h4>
                    <p className="text-gray-700">{selectedOrdre.modePaiement || "Non défini"}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                    <h4 className="font-semibold text-gray-800 mb-2">Devise</h4>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                      {selectedOrdre.devise || "XAF"}
                    </Badge>
                  </div>
                </div>

                {/* Détails financiers */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Détails financiers
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                      <p className="text-sm font-medium text-gray-600 mb-1">Montant total</p>
                      <p className="text-2xl font-bold text-blue-700">
                        {formatCurrency(selectedOrdre.decompteTotal || 0)}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        Avance ({selectedOrdre.tauxAvance || 0}%)
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(selectedOrdre.decompteAvance || 0)}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                      <p className="text-sm font-medium text-gray-600 mb-1">Reliquat</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {formatCurrency(selectedOrdre.decompteRelicat || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedOrdre(null)}
                    className="hover:bg-gray-100"
                  >
                    Fermer
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