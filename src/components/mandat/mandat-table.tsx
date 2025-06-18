"use client"

import type React from "react"

import { useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, Users, MapPin, Package } from "lucide-react"
import { type Mandat, MandatStatut } from "@/types"

interface MandatTableProps {
  mandats: Mandat[]
  title: string
  renderActions?: (mandat: Mandat) => React.ReactNode
}

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

const getStatusLabel = (statut: MandatStatut) => {
  switch (statut) {
    case MandatStatut.EN_ATTENTE_CONFIRMATION:
      return "En attente de confirmation"
    case MandatStatut.EN_ATTENTE_EXECUTION:
      return "En attente d'exécution"
    case MandatStatut.EN_COURS:
      return "En cours"
    case MandatStatut.ACHEVE:
      return "Achevé"
    default:
      return statut
  }
}

export function MandatTable({ mandats, title, renderActions }: MandatTableProps) {
  const [selectedMandat, setSelectedMandat] = useState<Mandat | null>(null)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {title}
            <Badge variant="outline">{mandats.length} mandat(s)</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mandats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Aucun mandat trouvé</div>
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
                    <TableHead>Équipe</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mandats.map((mandat) => (
                    <TableRow key={mandat.id}>
                      <TableCell className="font-medium">{mandat.reference}</TableCell>
                      <TableCell className="max-w-xs truncate">{mandat.objectif}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(mandat.statut)}>{getStatusLabel(mandat.statut)}</Badge>
                      </TableCell>
                      <TableCell>{format(new Date(mandat.dateDebut), "dd/MM/yyyy", { locale: fr })}</TableCell>
                      <TableCell>{format(new Date(mandat.dateFin), "dd/MM/yyyy", { locale: fr })}</TableCell>
                      <TableCell>{mandat.duree} jour(s)</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{mandat.usersCount}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{mandat.villesCount}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Package className="h-4 w-4" />
                            <span>{mandat.ressourcesCount}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {renderActions ? (
                          renderActions(mandat)
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => setSelectedMandat(mandat)}>
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
      {selectedMandat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Détails du mandat {selectedMandat.reference}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold">Objectif</h4>
                <p className="text-sm text-muted-foreground">{selectedMandat.objectif}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Date de début</h4>
                  <p className="text-sm">{format(new Date(selectedMandat.dateDebut), "dd/MM/yyyy", { locale: fr })}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Date de fin</h4>
                  <p className="text-sm">{format(new Date(selectedMandat.dateFin), "dd/MM/yyyy", { locale: fr })}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold">Équipe assignée</h4>
                <div className="space-y-2 mt-2">
                  {selectedMandat.users.map((user) => (
                    <div key={user.id} className="flex items-center space-x-2 p-2 bg-muted rounded">
                      <span className="font-medium">{user.username}</span>
                      <span className="text-sm text-muted-foreground">({user.matricule})</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold">Villes</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedMandat.villes.map((ville) => (
                    <Badge key={ville.id} variant="outline">
                      {ville.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold">Ressources</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedMandat.ressources.map((ressource) => (
                    <Badge key={ressource.id} variant="outline">
                      {ressource.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedMandat(null)}>
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
