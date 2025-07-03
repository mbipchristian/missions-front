"use client"

import { useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, Calendar, Clock, CheckCircle, AlertCircle, FileText, CreditCard, X, User, TrendingUp } from "lucide-react"
import { type OrdreMission, OrdreMissionStatut } from "@/types"

interface MesOrdresMissionTableProps {
  ordresMission: OrdreMission[]
  title: string
}

const getStatusBadgeVariant = (statut: OrdreMissionStatut) => {
  switch (statut) {
    case OrdreMissionStatut.EN_ATTENTE_JUSTIFICATIF:
      return "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200"
    case OrdreMissionStatut.EN_ATTENTE_CONFIRMATION:
      return "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200"
    case OrdreMissionStatut.EN_ATTENTE_EXECUTION:
      return "bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200"
    case OrdreMissionStatut.EN_COURS:
      return "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
    case OrdreMissionStatut.ACHEVE:
      return "bg-green-500 text-white hover:bg-green-600"
    default:
      return "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200"
  }
}

const getStatusLabel = (statut: OrdreMissionStatut) => {
  switch (statut) {
    case OrdreMissionStatut.EN_ATTENTE_JUSTIFICATIF:
      return "En attente de justificatif"
    case OrdreMissionStatut.EN_ATTENTE_CONFIRMATION:
      return "En attente de confirmation"
    case OrdreMissionStatut.EN_ATTENTE_EXECUTION:
      return "En attente d'exécution"
    case OrdreMissionStatut.EN_COURS:
      return "En cours"
    case OrdreMissionStatut.ACHEVE:
      return "Achevé"
    default:
      return statut
  }
}

const getStatusIcon = (statut: OrdreMissionStatut) => {
  switch (statut) {
    case OrdreMissionStatut.EN_ATTENTE_JUSTIFICATIF:
      return <FileText className="h-3 w-3 mr-1" />
    case OrdreMissionStatut.EN_ATTENTE_CONFIRMATION:
      return <AlertCircle className="h-3 w-3 mr-1" />
    case OrdreMissionStatut.EN_ATTENTE_EXECUTION:
      return <Calendar className="h-3 w-3 mr-1" />
    case OrdreMissionStatut.EN_COURS:
      return <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
    case OrdreMissionStatut.ACHEVE:
      return <CheckCircle className="h-3 w-3 mr-1" />
    default:
      return <Clock className="h-3 w-3 mr-1" />
  }
}

export function MesOrdresMissionTable({ ordresMission, title }: MesOrdresMissionTableProps) {
  const [selectedOrdre, setSelectedOrdre] = useState<OrdreMission | null>(null)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getDaysRemaining = (dateDebut: string, dateFin: string, statut: OrdreMissionStatut) => {
    const now = new Date()
    const debut = new Date(dateDebut)
    const fin = new Date(dateFin)

    if (statut === OrdreMissionStatut.EN_ATTENTE_EXECUTION) {
      const daysToStart = Math.ceil((debut.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return {
        text: daysToStart > 0 ? `Débute dans ${daysToStart} jour${daysToStart > 1 ? 's' : ''}` : "Débute aujourd'hui",
        type: daysToStart <= 1 ? "urgent" : "normal",
        days: daysToStart
      }
    }

    if (statut === OrdreMissionStatut.EN_COURS) {
      const daysToEnd = Math.ceil((fin.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return {
        text: daysToEnd > 0 ? `${daysToEnd} jour${daysToEnd > 1 ? 's' : ''} restant${daysToEnd > 1 ? 's' : ''}` : "Se termine aujourd'hui",
        type: daysToEnd <= 2 ? "urgent" : "normal",
        days: daysToEnd
      }
    }

    return null
  }

  const getProgressPercentage = (dateDebut: string, dateFin: string, statut: OrdreMissionStatut) => {
    if (statut === OrdreMissionStatut.ACHEVE) return 100
    if (statut === OrdreMissionStatut.EN_ATTENTE_EXECUTION) return 0
    
    const now = new Date()
    const debut = new Date(dateDebut)
    const fin = new Date(dateFin)
    const total = fin.getTime() - debut.getTime()
    const elapsed = now.getTime() - debut.getTime()
    
    return Math.max(0, Math.min(100, Math.round((elapsed / total) * 100)))
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-green-50">
        <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
          <CardTitle className="flex items-center justify-between text-xl">
            <div className="flex items-center gap-2">
              <User className="h-6 w-6" />
              {title}
            </div>
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 font-medium px-3 py-1">
              {ordresMission.length} mission{ordresMission.length > 1 ? 's' : ''}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {ordresMission.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <User className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Aucun ordre de mission</p>
              <p className="text-sm mt-2">Vous n'avez pas encore d'ordres de mission confirmés</p>
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
                    <TableHead className="font-semibold text-gray-700">Montant</TableHead>
                    <TableHead className="font-semibold text-gray-700">Progression</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordresMission.map((ordre, index) => {
                    const daysInfo = getDaysRemaining(ordre.dateDebut, ordre.dateFin, ordre.statut)
                    const progress = getProgressPercentage(ordre.dateDebut, ordre.dateFin, ordre.statut)
                    
                    return (
                      <TableRow 
                        key={ordre.id} 
                        className={`hover:bg-green-50 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                        }`}
                      >
                        <TableCell className="font-medium text-green-700 bg-green-50/50 rounded-l-lg">
                          {ordre.reference}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate font-medium text-gray-800" title={ordre.objectif}>
                            {ordre.objectif}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusBadgeVariant(ordre.statut)} flex items-center w-fit font-medium`}>
                            {getStatusIcon(ordre.statut)}
                            {getStatusLabel(ordre.statut)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-700">
                              {format(new Date(ordre.dateDebut), "dd/MM/yyyy", { locale: fr })}
                            </div>
                            <div className="text-xs text-gray-500">
                              au {format(new Date(ordre.dateFin), "dd/MM/yyyy", { locale: fr })}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                            {ordre.duree} jour{ordre.duree > 1 ? 's' : ''}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded text-sm">
                              {formatCurrency(ordre.decompteTotal)}
                            </div>
                            <div className="text-xs text-green-600 font-medium">
                              Avance: {formatCurrency(ordre.decompteAvance)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            {/* Barre de progression */}
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  progress === 100 ? 'bg-green-500' : 
                                  progress > 75 ? 'bg-yellow-500' : 
                                  'bg-gradient-to-r from-blue-500 to-blue-600'
                                }`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <div className="text-xs text-center font-medium text-gray-600">
                              {progress}%
                            </div>
                            {daysInfo && (
                              <div className={`text-xs text-center font-medium ${
                                daysInfo.type === 'urgent' ? 'text-red-600' : 'text-gray-600'
                              }`}>
                                <Clock className="h-3 w-3 inline mr-1" />
                                {daysInfo.text}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setSelectedOrdre(ordre)}
                            className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 hover:from-green-600 hover:to-green-700 shadow-md"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Voir
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de détails amélioré */}
      {selectedOrdre && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <Card className="max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-0 animate-in slide-in-from-bottom-4 duration-300">
            <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white">
              <CardTitle className="flex items-center justify-between text-xl">
                <div className="flex items-center gap-3">
                  <User className="h-6 w-6" />
                  <div>
                    <div>Ma mission {selectedOrdre.reference}</div>
                    <div className="text-sm font-normal text-green-100 mt-1">
                      Suivi détaillé de votre ordre de mission
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={`${getStatusBadgeVariant(selectedOrdre.statut)} text-sm px-3 py-2`}>
                    {getStatusIcon(selectedOrdre.statut)}
                    {getStatusLabel(selectedOrdre.statut)}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedOrdre(null)}
                    className="text-white hover:bg-white/20 rounded-full p-2"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-gradient-to-br from-white to-green-50">
              <div className="space-y-6">
                {/* Objectif */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-600" />
                    Objectif de la mission
                  </h4>
                  <p className="text-gray-700 leading-relaxed bg-green-50 p-3 rounded">
                    {selectedOrdre.objectif}
                  </p>
                </div>

                {/* Progression et timing */}
                {(() => {
                  const progress = getProgressPercentage(selectedOrdre.dateDebut, selectedOrdre.dateFin, selectedOrdre.statut)
                  const daysInfo = getDaysRemaining(selectedOrdre.dateDebut, selectedOrdre.dateFin, selectedOrdre.statut)
                  
                  return (
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        Progression de la mission
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Avancement</span>
                          <span className="font-semibold text-blue-700">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-500 ${
                              progress === 100 ? 'bg-green-500' : 
                              progress > 75 ? 'bg-yellow-500' : 
                              'bg-gradient-to-r from-blue-500 to-blue-600'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        {daysInfo && (
                          <div className={`text-center p-2 rounded ${
                            daysInfo.type === 'urgent' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
                          }`}>
                            <Clock className="h-4 w-4 inline mr-1" />
                            {daysInfo.text}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })()}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Période de mission */}
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      Période de mission
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                        <span className="text-sm text-blue-600">Date de début</span>
                        <span className="font-medium text-blue-800">
                          {format(new Date(selectedOrdre.dateDebut), "dd MMMM yyyy", { locale: fr })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                        <span className="text-sm text-red-600">Date de fin</span>
                        <span className="font-medium text-red-800">
                          {format(new Date(selectedOrdre.dateFin), "dd MMMM yyyy", { locale: fr })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                        <span className="text-sm text-yellow-600">Durée totale</span>
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                          {selectedOrdre.duree} jour{selectedOrdre.duree > 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Modalités de paiement */}
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-purple-600" />
                      Modalités de paiement
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                        <span className="text-sm text-purple-600">Mode de paiement</span>
                        <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">
                          {selectedOrdre.modePaiement}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-600">Devise</span>
                        <span className="font-medium text-gray-800">{selectedOrdre.devise}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                        <span className="text-sm text-green-600">Taux d'avance</span>
                        <span className="font-medium text-green-800">{selectedOrdre.tauxAvance}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Détails financiers */}
                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    Détails financiers
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm text-center border-l-4 border-blue-500">
                      <div className="text-sm font-medium text-blue-600 mb-2">Montant total</div>
                      <div className="text-2xl font-bold text-blue-700">
                        {formatCurrency(selectedOrdre.decompteTotal)}
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm text-center border-l-4 border-green-500">
                      <div className="text-sm font-medium text-green-600 mb-2">
                        Avance reçue ({selectedOrdre.tauxAvance}%)
                      </div>
                      <div className="text-2xl font-bold text-green-700">
                        {formatCurrency(selectedOrdre.decompteAvance)}
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm text-center border-l-4 border-yellow-500">
                      <div className="text-sm font-medium text-yellow-600 mb-2">Reliquat à recevoir</div>
                      <div className="text-2xl font-bold text-yellow-700">
                        {formatCurrency(selectedOrdre.decompteRelicat)}
                      </div>
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