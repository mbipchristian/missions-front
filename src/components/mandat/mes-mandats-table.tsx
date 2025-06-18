"use client"

import { useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, Users, MapPin, Package, Calendar, Clock, Play, CheckCircle } from "lucide-react"
import { type Mandat, MandatStatut } from "@/types"

interface MesMandatsTableProps {
  mandats: Mandat[]
  title: string
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

const getStatusIcon = (statut: MandatStatut) => {
  switch (statut) {
    case MandatStatut.EN_ATTENTE_CONFIRMATION:
      return <Clock className="h-4 w-4" />
    case MandatStatut.EN_ATTENTE_EXECUTION:
      return <Calendar className="h-4 w-4" />
    case MandatStatut.EN_COURS:
      return <Play className="h-4 w-4" />
    case MandatStatut.ACHEVE:
      return <CheckCircle className="h-4 w-4" />
    default:
      return <Clock className="h-4 w-4" />
  }
}

export function MesMandatsTable({ mandats, title }: MesMandatsTableProps) {
  const [selectedMandat, setSelectedMandat] = useState<Mandat | null>(null)

  const getDaysRemaining = (dateDebut: string, dateFin: string, statut: MandatStatut) => {
    const now = new Date()
    const debut = new Date(dateDebut)
    const fin = new Date(dateFin)

    if (statut === MandatStatut.EN_ATTENTE_EXECUTION) {
      const daysToStart = Math.ceil((debut.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return daysToStart > 0 ? `Débute dans ${daysToStart} jour(s)` : "Débute aujourd'hui"
    }

    if (statut === MandatStatut.EN_COURS) {
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
            <Badge variant="outline">{mandats.length} mandat(s)</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mandats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun mandat assigné</p>
              <p className="text-sm">Vous n'avez pas encore de mandats confirmés.</p>
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
                    <TableHead>Équipe</TableHead>
                    <TableHead>Progression</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mandats.map((mandat) => {
                    const daysInfo = getDaysRemaining(mandat.dateDebut, mandat.dateFin, mandat.statut)
                    return (
                      <TableRow key={mandat.id}>
                        <TableCell className="font-medium">{mandat.reference}</TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate" title={mandat.objectif}>
                            {mandat.objectif}
                          </div>
                          {mandat.missionDeControle && (
                            <Badge variant="outline" className="mt-1 text-xs">
                              Mission de contrôle
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(mandat.statut)}
                            <Badge variant={getStatusBadgeVariant(mandat.statut)}>
                              {getStatusLabel(mandat.statut)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{format(new Date(mandat.dateDebut), "dd/MM/yyyy", { locale: fr })}</div>
                            <div className="text-muted-foreground">
                              au {format(new Date(mandat.dateFin), "dd/MM/yyyy", { locale: fr })}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{mandat.duree} jour(s)</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4 text-blue-500" />
                              <span className="text-sm">{mandat.usersCount}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4 text-green-500" />
                              <span className="text-sm">{mandat.villesCount}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Package className="h-4 w-4 text-orange-500" />
                              <span className="text-sm">{mandat.ressourcesCount}</span>
                            </div>
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
                          <Button variant="outline" size="sm" onClick={() => setSelectedMandat(mandat)}>
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
      {selectedMandat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Mandat {selectedMandat.reference}</span>
                <Badge variant={getStatusBadgeVariant(selectedMandat.statut)}>
                  {getStatusLabel(selectedMandat.statut)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Objectif de la mission</h4>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded">{selectedMandat.objectif}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded">
                  <h4 className="font-semibold mb-2">Période</h4>
                  <div className="space-y-1 text-sm">
                    <div>
                      <strong>Début:</strong> {format(new Date(selectedMandat.dateDebut), "dd/MM/yyyy", { locale: fr })}
                    </div>
                    <div>
                      <strong>Fin:</strong> {format(new Date(selectedMandat.dateFin), "dd/MM/yyyy", { locale: fr })}
                    </div>
                    <div>
                      <strong>Durée:</strong> {selectedMandat.duree} jour(s)
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded">
                  <h4 className="font-semibold mb-2">Type de mission</h4>
                  <Badge variant={selectedMandat.missionDeControle ? "default" : "outline"}>
                    {selectedMandat.missionDeControle ? "Mission de contrôle" : "Mission standard"}
                  </Badge>
                </div>

                <div className="p-4 border rounded">
                  <h4 className="font-semibold mb-2">Créé par</h4>
                  <p className="text-sm">{selectedMandat.createdBy}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Équipe assignée ({selectedMandat.users.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedMandat.users.map((user) => (
                    <div key={user.id} className="flex items-center space-x-3 p-3 bg-muted rounded">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">{user.username}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.matricule} • {user.fonction}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Destinations ({selectedMandat.villes.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedMandat.villes.map((ville) => (
                    <Badge key={ville.id} variant="outline" className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>
                        {ville.name} ({ville.code})
                      </span>
                      {ville.interieur && <span className="text-xs">• Intérieur</span>}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Ressources allouées ({selectedMandat.ressources.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedMandat.ressources.map((ressource) => (
                    <Badge key={ressource.id} variant="outline" className="flex items-center space-x-1">
                      <Package className="h-3 w-3" />
                      <span>{ressource.name}</span>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
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
