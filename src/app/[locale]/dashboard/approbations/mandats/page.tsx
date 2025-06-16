"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/status-badge"
import { useAuth } from "@/hooks/use-auth"
import { Search, Eye, CheckCircle, XCircle, Calendar, User, Users, Clock, Loader2 } from "lucide-react"

interface MandatPendingApproval {
  id: number
  reference: string
  objectif: string
  statut: string
  dateDebut: string
  dateFin: string
  duree: number
  createdBy: string
  createdAt: string
  usersCount: number
  villesCount: number
  ressourcesCount: number
}

export default function ApprobationMandatsPage() {
  const { user, hasPermission } = useAuth()
  const [mandats, setMandats] = useState<MandatPendingApproval[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const { toast } = useToast()
 
  // Fetch des mandats en attente de confirmation
  useEffect(() => {
    // Only fetch if user has permission
    if (!hasPermission(["DIRECTEUR_RESSOURCES_HUMAINES", "ADMIN"])) {
      setLoading(false)
      return
    }

    const fetchMandats = async () => {
      try {
        setLoading(true)
        const response = await fetch('http://localhost:8080/auth/mandats/en-attente-confirmation', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const data = await response.json()
          // Transformer les données backend en format attendu par le frontend
          const transformedMandats = data.map((mandat: any) => ({
            id: mandat.id,
            reference: mandat.reference,
            objectif: mandat.objectif,
            statut: mandat.statut,
            dateDebut: mandat.dateDebut,
            dateFin: mandat.dateFin,
            duree: mandat.duree,
            createdBy: mandat.createdBy || 'Utilisateur inconnu',
            createdAt: mandat.createdAt,
            usersCount: mandat.usersCount || 0,
            villesCount: mandat.villesCount || 0,
            ressourcesCount: mandat.ressourcesCount || 0,
          }))
          setMandats(transformedMandats)
        } else {
          console.error('Erreur lors de la récupération des mandats')
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des mandats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMandats()
  }, [hasPermission])

  const filteredMandats = mandats.filter(
    (mandat) =>
      mandat.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mandat.objectif.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mandat.createdBy.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleApprove = async (mandatId: number) => {
    const token = localStorage.getItem("authToken");
    console.log("Token envoyé:", token);
    setActionLoading(mandatId)
    try {
      const response = await fetch(`http://localhost:8080/auth/mandats/${mandatId}/confirmer`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
        
      })

      if (response.ok) {
        // Retirer le mandat de la liste
        setMandats((prev) => prev.filter((m) => m.id !== mandatId))
          toast({
          title: "Succès",
          description: "Mandat confirmé avec succès",
        })
      } else {
        console.error('Erreur lors de l\'approbation')
        toast({
          title: "Erreur",
          description: "Erreur lors de l'approbation",
        })
      }
    } catch (error) {
      console.error("Erreur lors de l'approbation:", error)
      toast({
          title: "Erreur",
          description: "Erreur lors de l'approbation",
        })
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (mandatId: number) => {
    setActionLoading(mandatId)
    try {
      const response = await fetch(`http://localhost:8080/auth/mandats/${mandatId}/rejeter`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        // Retirer le mandat de la liste
        setMandats((prev) => prev.filter((m) => m.id !== mandatId))
        toast({
          title: "Succes",
          description: "Rejeté avec succes",
        })
      } else {
        console.error('Erreur lors du rejet')
        toast({
          title: "Erreur",
          description: "Erreur lors du rejet",
        })
      }
    } catch (error) {
      console.error("Erreur lors du rejet:", error)
      toast({
          title: "Erreur",
          description: "Erreur lors du rejet",
        })
    } finally {
      setActionLoading(null)
    }
  }

  

  // Check permissions - render access denied if no permission
  if (!hasPermission(["DIRECTEUR_RESSOURCES_HUMAINES", "ADMIN"])) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Accès refusé</h3>
              <p className="text-muted-foreground">
                Vous n&apos;avez pas les permissions nécessaires pour accéder à cette page.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement des mandats...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Approbation des Mandats</h1>
          <p className="text-muted-foreground">{filteredMandats.length} mandat(s) en attente de votre confirmation</p>
        </div>
        <Badge variant="outline" className="bg-orange-100 text-orange-800">
          {filteredMandats.length} en attente
        </Badge>
      </div>

      {/* Barre de recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par référence, objectif ou créateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Liste des mandats */}
      <div className="space-y-4">
        {filteredMandats.map((mandat) => (
          <Card key={mandat.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold">{mandat.reference}</h3>
                    <StatusBadge status={mandat.statut} type="mandat" />
                    
                  </div>
                  <p className="text-muted-foreground">{mandat.objectif}</p>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Eye className="mr-2 h-4 w-4" />
                    Voir détails
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApprove(mandat.id)}
                    disabled={actionLoading === mandat.id}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {actionLoading === mandat.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    )}
                    Approuver
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={() => handleReject(mandat.id)} 
                    disabled={actionLoading === mandat.id}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Rejeter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Période</p>
                    <p className="text-muted-foreground">
                      {new Date(mandat.dateDebut).toLocaleDateString()} -{" "}
                      {new Date(mandat.dateFin).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Durée</p>
                    <p className="text-muted-foreground">{mandat.duree} jours</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Assignations</p>
                    <p className="text-muted-foreground">
                      {mandat.usersCount} utilisateurs, {mandat.villesCount} villes
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Créé par</p>
                    <p className="text-muted-foreground">{mandat.createdBy}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredMandats.length === 0 && !loading && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun mandat en attente</h3>
                <p className="text-muted-foreground">
                  Tous les mandats ont été traités ou aucun ne correspond à votre recherche.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}