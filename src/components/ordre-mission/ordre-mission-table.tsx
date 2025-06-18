"use client"

import type React from "react"

import { useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye } from "lucide-react"
import { type OrdreMission, OrdreMissionStatut } from "@/types"

interface OrdreMissionTableProps {
  ordresMission: OrdreMission[]
  title: string
  renderActions?: (ordre: OrdreMission) => React.ReactNode
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
            <div className="text-center py-8 text-muted-foreground">Aucun ordre de mission trouvé</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Référence</TableHead>
                    <TableHead>Objectif</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date début</TableHead>
                    <TableHead>Date fin</TableHead>
                    <TableHead>Durée</TableHead>
                    <TableHead>Montant total</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordresMission.map((ordre) => (
                    <TableRow key={ordre.id}>
                      <TableCell className="font-medium">{ordre.reference}</TableCell>
                      <TableCell className="max-w-xs truncate">{ordre.objectif}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(ordre.statut)}>{getStatusLabel(ordre.statut)}</Badge>
                      </TableCell>
                      <TableCell>{format(new Date(ordre.dateDebut), "dd/MM/yyyy", { locale: fr })}</TableCell>
                      <TableCell>{format(new Date(ordre.dateFin), "dd/MM/yyyy", { locale: fr })}</TableCell>
                      <TableCell>{ordre.duree} jour(s)</TableCell>
                      <TableCell>{formatCurrency(ordre.decompteTotal)}</TableCell>
                      <TableCell>
                        {renderActions ? (
                          renderActions(ordre)
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => setSelectedOrdre(ordre)}>
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

      {/* Modal de détails */}
      {selectedOrdre && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Détails de l'ordre de mission {selectedOrdre.reference}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold">Objectif</h4>
                <p className="text-sm text-muted-foreground">{selectedOrdre.objectif}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Date de début</h4>
                  <p className="text-sm">{format(new Date(selectedOrdre.dateDebut), "dd/MM/yyyy", { locale: fr })}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Date de fin</h4>
                  <p className="text-sm">{format(new Date(selectedOrdre.dateFin), "dd/MM/yyyy", { locale: fr })}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Mode de paiement</h4>
                  <p className="text-sm">{selectedOrdre.modePaiement}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Devise</h4>
                  <p className="text-sm">{selectedOrdre.devise}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Détails financiers</h4>
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded">
                  <div>
                    <p className="text-sm font-medium">Montant total</p>
                    <p className="text-lg font-bold">{formatCurrency(selectedOrdre.decompteTotal)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Avance ({selectedOrdre.tauxAvance}%)</p>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(selectedOrdre.decompteAvance)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Reliquat</p>
                    <p className="text-lg font-bold text-orange-600">{formatCurrency(selectedOrdre.decompteRelicat)}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
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
