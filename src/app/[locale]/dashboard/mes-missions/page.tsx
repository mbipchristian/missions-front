"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/status-badge"
import { useAuth } from "@/hooks/use-auth"
import { Search, Eye, FileText, Clock, Calendar, CircleDollarSign, Loader2 } from "lucide-react"

interface OrdreMission {
  id: number
  reference: string
  objectif: string
  libelle: string
  dateDebut: string
  dateFin: string
  duree: number
  modePaiement: string
  devise: string
  decompteTotal: number
  decompteAvance: number
  decompteRelicat: number
  createdAt: string
  updatedAt: string
}

export default function MesMissionsPage() {
  const { user } = useAuth()
  const [ordres, setOrdres] = useState<OrdreMission[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMesMissions = async () => {
      if (!user) return

      try {
        setLoading(true)
        const response = await fetch("http://localhost:8080/auth/ordres-mission/mes-ordres", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          setOrdres(data)
        } else {
          console.error("Erreur lors de la récupération des ordres de mission")
        }
      } catch (error) {
        console.error("Erreur:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMesMissions()
  }, [user])

  const filteredOrdres = ordres.filter(
    (ordre) =>
      ordre.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordre.objectif.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement de vos missions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mes Missions</h1>
          <p className="text-muted-foreground">{filteredOrdres.length} ordre(s) de mission assigné(s)</p>
        </div>
      </div>

      {/* Barre de recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par référence ou objectif..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Liste des ordres de mission */}
      {filteredOrdres.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Mes ordres de mission</CardTitle>
            <CardDescription>Liste de tous vos ordres de mission</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Référence</TableHead>
                  <TableHead>Objectif</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Durée</TableHead>
                  <TableHead>Décompte</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrdres.map((ordre) => (
                  <TableRow key={ordre.id}>
                    <TableCell className="font-medium">{ordre.reference}</TableCell>
                    <TableCell className="max-w-xs truncate">{ordre.objectif}</TableCell>
                    <TableCell>
                      <StatusBadge status={ordre.libelle} type="ordre" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="whitespace-nowrap">
                          {new Date(ordre.dateDebut).toLocaleDateString()} -{" "}
                          {new Date(ordre.dateFin).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{ordre.duree} jours</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <CircleDollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="whitespace-nowrap">
                          {ordre.decompteTotal.toLocaleString()} {ordre.devise}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" /> Détails
                        </Button>
                        {ordre.libelle === "EN_ATTENTE_JUSTIFICATIF" && (
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            <FileText className="h-4 w-4 mr-1" /> Ajouter justificatifs
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune mission assignée</h3>
              <p className="text-muted-foreground">Vous n&apos;avez pas encore d&apos;ordre de mission assigné ou en cours.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
