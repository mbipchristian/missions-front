"use client"

import { useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, Calendar, Clock, CheckCircle, AlertCircle, FileText, CreditCard } from "lucide-react"
import { type OrdreMission, OrdreMissionStatut } from "@/types"

interface MesOrdresMissionTableProps {
  ordresMission: OrdreMission[]
  title: string
}

const getStatusBadgeVariant = (statut: OrdreMissionStatut) => {
  switch (statut) {
    case OrdreMissionStatut.EN_ATTENTE_JUSTIFICATIF:
      return "secondary"
    case OrdreMissionStatut.EN_ATTENTE_CONFIRMATION:
      return "outline"
    case OrdreMissionStatut.EN_ATTENTE_EXECUTION:
      return "default"
    case OrdreMissionStatut.EN_COURS:
      return "destructive"
    case OrdreMissionStatut.ACHEVE:
      return "destructive"
    default:
      return "secondary"
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
      return <FileText className="h-4 w-4" />
    case OrdreMissionStatut.EN_ATTENTE_CONFIRMATION:
      return <AlertCircle className="h-4 w-4" />
    case OrdreMissionStatut.EN_ATTENTE_EXECUTION:
      return <Calendar className="h-4 w-4" />
    case OrdreMissionStatut.EN_COURS:
      return <Clock className="h-4 w-4" />
    case OrdreMissionStatut.ACHEVE:
      return <CheckCircle className="h-4 w-4" />
    default:
      return <Clock className="h-4 w-4" />
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
      return daysToStart > 0 ? `Débute dans ${daysToStart} jour(s)` : "Débute aujourd'hui"
    }

    if (statut === OrdreMissionStatut.EN_COURS) {
      const daysToEnd = Math.ceil((fin.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return daysToEnd > 0 ? `${daysToEnd} jour(s) restant(s)` : "Se termine aujourd'hui"
    }

    return null
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {title}
            <Badge variant="outline">{ordresMission.length} ordre(s)</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ordresMission.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun ordre de mission</p>
              <p className="text-sm">Vous n'avez pas encore d'ordres de mission confirmés.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Référence</TableHead>
                    <TableHead>Objectif</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Période</TableHead>
                    <TableHead>Durée</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Progression</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordresMission.map((ordre) => {
                    const daysInfo = getDaysRemaining(ordre.dateDebut, ordre.dateFin, ordre.statut)
                    return (
                      <TableRow key={ordre.id}>
                        <TableCell className="font-medium">{ordre.reference}</TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate" title={ordre.objectif}>
                            {ordre.objectif}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(ordre.statut)}
                            <Badge variant={getStatusBadgeVariant(ordre.statut)}>{getStatusLabel(ordre.statut)}</Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{format(new Date(ordre.dateDebut), "dd/MM/yyyy", { locale: fr })}</div>
                            <div className="text-muted-foreground">
                              au {format(new Date(ordre.dateFin), "dd/MM/yyyy", { locale: fr })}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{ordre.duree} jour(s)</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{formatCurrency(ordre.decompteTotal)}</div>
                            <div className="text-muted-foreground">Avance: {formatCurrency(ordre.decompteAvance)}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {daysInfo && (
                            <div className="text-sm text-muted-foreground">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {daysInfo}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => setSelectedOrdre(ordre)}>
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

      {/* Modal de détails */}
      {selectedOrdre && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Ordre de mission {selectedOrdre.reference}</span>
                <Badge variant={getStatusBadgeVariant(selectedOrdre.statut)}>
                  {getStatusLabel(selectedOrdre.statut)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Objectif de la mission</h4>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded">{selectedOrdre.objectif}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 border rounded">
                    <h4 className="font-semibold mb-3 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Période de mission
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Date de début:</span>
                        <span className="font-medium">
                          {format(new Date(selectedOrdre.dateDebut), "dd/MM/yyyy", { locale: fr })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Date de fin:</span>
                        <span className="font-medium">
                          {format(new Date(selectedOrdre.dateFin), "dd/MM/yyyy", { locale: fr })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Durée totale:</span>
                        <Badge variant="outline">{selectedOrdre.duree} jour(s)</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded">
                    <h4 className="font-semibold mb-3">Modalités de paiement</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Mode de paiement:</span>
                        <Badge variant="outline">{selectedOrdre.modePaiement}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Devise:</span>
                        <span className="font-medium">{selectedOrdre.devise}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taux d'avance:</span>
                        <span className="font-medium">{selectedOrdre.tauxAvance}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Détails financiers
                  </h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded">
                      <div className="text-sm text-blue-600 mb-1">Montant total</div>
                      <div className="text-xl font-bold text-blue-700">
                        {formatCurrency(selectedOrdre.decompteTotal)}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-green-50 rounded">
                        <div className="text-sm text-green-600 mb-1">Avance</div>
                        <div className="font-bold text-green-700">{formatCurrency(selectedOrdre.decompteAvance)}</div>
                      </div>
                      <div className="p-3 bg-orange-50 rounded">
                        <div className="text-sm text-orange-600 mb-1">Reliquat</div>
                        <div className="font-bold text-orange-700">{formatCurrency(selectedOrdre.decompteRelicat)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedOrdre(null)}>
                  Fermer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
