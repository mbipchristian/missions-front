"use client"

import type React from "react"

import { useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, Users, MapPin, Package, X, Calendar, Clock, Target } from "lucide-react"
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

const getStatusColor = (statut: MandatStatut) => {
  switch (statut) {
    case MandatStatut.EN_ATTENTE_CONFIRMATION:
      return "bg-yellow-100 text-yellow-800 border-yellow-300"
    case MandatStatut.EN_ATTENTE_EXECUTION:
      return "bg-blue-100 text-blue-800 border-blue-300"
    case MandatStatut.EN_COURS:
      return "bg-green-100 text-green-800 border-green-300"
    case MandatStatut.ACHEVE:
      return "bg-gray-100 text-gray-800 border-gray-300"
    default:
      return "bg-gray-100 text-gray-800 border-gray-300"
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
    <div className="space-y-6">
  {/* Header avec gradient BLUE */}
  <div className="bg-gradient-to-r from-blue-300 via-blue-400 to-blue-500 p-6 rounded-xl shadow-lg">
    <div className="flex items-center justify-between text-black">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <Target className="h-8 w-8" />
          {title}
        </h2>
        <p className="text-black-100">Gestion et suivi des mandats</p>
      </div>
      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/30">
        <span className="text-lg font-semibold">{mandats.length}</span>
        <span className="text-sm ml-1">mandat{mandats.length > 1 ? 's' : ''}</span>
      </div>
    </div>
  </div>

      {/* Tableau principal */}
      <Card className="overflow-hidden shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
        <CardContent className="p-0">
          {mandats.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Target className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Aucun mandat trouvé</p>
              <p className="text-sm">Les mandats apparaîtront ici une fois créés</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-150 border-b-2 border-blue-200">
                    <TableHead className="font-bold text-blue-900 py-4">Référence</TableHead>
                    <TableHead className="font-bold text-blue-900">Objectif</TableHead>
                    <TableHead className="font-bold text-blue-900">Statut</TableHead>
                    <TableHead className="font-bold text-blue-900">Date début</TableHead>
                    <TableHead className="font-bold text-blue-900">Date fin</TableHead>
                    <TableHead className="font-bold text-blue-900">Durée</TableHead>
                    <TableHead className="font-bold text-blue-900">Enregistré le</TableHead>
                    <TableHead className="font-bold text-blue-900">Confirmé le</TableHead>
                    <TableHead className="font-bold text-blue-900">Assignations</TableHead>
                    <TableHead className="font-bold text-blue-900">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mandats.map((mandat, index) => (
                    <TableRow 
                      key={mandat.id} 
                      className={`
                        transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 
                        hover:shadow-md hover:scale-[1.01] cursor-pointer border-l-4 border-l-transparent
                        hover:border-l-blue-500 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                      `}
                    >
                      <TableCell className="font-semibold text-blue-900 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          {mandat.reference}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate font-medium text-gray-800" title={mandat.objectif}>
                          {mandat.objectif}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={`${getStatusColor(mandat.statut)} font-medium shadow-sm transition-all duration-200 hover:shadow-md`}
                        >
                          {getStatusLabel(mandat.statut)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-700">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-green-600" />
                          <span>{format(new Date(mandat.dateDebut), "dd/MM/yyyy", { locale: fr })}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-700">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-red-600" />
                          <span>{format(new Date(mandat.dateFin), "dd/MM/yyyy", { locale: fr })}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4 text-yellow-600" />
                          <span className="font-medium text-yellow-800">{mandat.duree} jour(s)</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm">
                        {format(new Date(mandat.createdAt), "dd/MM/yyyy", { locale: fr })}
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm">
                        {mandat.confirmele
                          ? format(new Date(mandat.confirmele), "dd/MM/yyyy", { locale: fr })
                          : <span className="text-yellow-600 font-medium">Non confirmé</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1 bg-blue-100 px-2 py-1 rounded-full">
                            <Users className="h-4 w-4 text-blue-600" />
                            <span className="text-blue-800 font-medium text-xs">{mandat.usersCount}</span>
                          </div>
                          <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-full">
                            <MapPin className="h-4 w-4 text-green-600" />
                            <span className="text-green-800 font-medium text-xs">{mandat.villesCount}</span>
                          </div>
                          <div className="flex items-center space-x-1 bg-yellow-100 px-2 py-1 rounded-full">
                            <Package className="h-4 w-4 text-yellow-600" />
                            <span className="text-yellow-800 font-medium text-xs">{mandat.ressourcesCount}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {renderActions ? (
                          renderActions(mandat)
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setSelectedMandat(mandat)}
                            className="bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                          >
                            <Eye className="h-4 w-4 mr-2" />
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
      {selectedMandat && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border-0 animate-in slide-in-from-bottom-4 duration-300">
            {/* Header du modal avec gradient */}
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-bold flex items-center gap-3">
                    <Target className="h-8 w-8" />
                    Mandat {selectedMandat.reference}
                  </CardTitle>
                  <Badge className={`${getStatusColor(selectedMandat.statut)} text-sm`}>
                    {getStatusLabel(selectedMandat.statut)}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMandat(null)}
                  className="text-white hover:bg-white/20 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] bg-gradient-to-br from-white to-gray-50">
              <div className="space-y-6">
                {/* Objectif */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <h4 className="font-bold text-blue-900 flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5" />
                    Objectif
                  </h4>
                  <p className="text-gray-700 leading-relaxed">{selectedMandat.objectif}</p>
                </div>

                {/* Informations temporelles */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 shadow-sm">
                    <h4 className="font-bold text-green-900 flex items-center gap-2 mb-2">
                      <Calendar className="h-5 w-5" />
                      Date de début
                    </h4>
                    <p className="text-green-800 font-medium">
                      {format(new Date(selectedMandat.dateDebut), "dd/MM/yyyy", { locale: fr })}
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200 shadow-sm">
                    <h4 className="font-bold text-red-900 flex items-center gap-2 mb-2">
                      <Calendar className="h-5 w-5" />
                      Date de fin
                    </h4>
                    <p className="text-red-800 font-medium">
                      {format(new Date(selectedMandat.dateFin), "dd/MM/yyyy", { locale: fr })}
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 shadow-sm">
                    <h4 className="font-bold text-yellow-900 flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5" />
                      Durée
                    </h4>
                    <p className="text-yellow-800 font-medium">{selectedMandat.duree} jour(s)</p>
                  </div>
                </div>

                {/* Équipe assignée */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 shadow-sm">
                  <h4 className="font-bold text-blue-900 flex items-center gap-2 mb-3">
                    <Users className="h-5 w-5" />
                    Équipe assignée ({selectedMandat.users.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedMandat.users.map((user) => (
                      <div key={user.id} className="bg-white p-3 rounded-lg shadow-sm border border-blue-200 transition-all duration-200 hover:shadow-md hover:scale-[1.02]">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">{user.username}</span>
                            <span className="text-sm text-gray-500 ml-2">({user.matricule})</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Villes */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 shadow-sm">
                  <h4 className="font-bold text-green-900 flex items-center gap-2 mb-3">
                    <MapPin className="h-5 w-5" />
                    Villes concernées ({selectedMandat.villes.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMandat.villes.map((ville) => (
                      <Badge key={ville.id} className="bg-green-100 text-green-800 border-green-300 hover:bg-green-200 transition-colors">
                        {ville.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Ressources */}
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 shadow-sm">
                  <h4 className="font-bold text-yellow-900 flex items-center gap-2 mb-3">
                    <Package className="h-5 w-5" />
                    Ressources nécessaires ({selectedMandat.ressources.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMandat.ressources.map((ressource) => (
                      <Badge key={ressource.id} className="bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200 transition-colors">
                        {ressource.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedMandat(null)}
                    className="hover:bg-gray-100 transition-colors"
                  >
                    Fermer
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200">
                    Modifier
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