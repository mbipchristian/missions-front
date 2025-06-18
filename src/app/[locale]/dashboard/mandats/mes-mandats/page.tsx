"use client"

import { useEffect, useState, useMemo } from "react"
import { MesMandatsTable } from "@/components/mandat/mes-mandats-table"
import { Filters, type FilterState } from "@/components/ui/filters"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiService } from "@/lib/api"
import type { Mandat } from "@/types"
import { MandatStatut } from "@/types"
import { Users, Clock, Play, CheckCircle } from "lucide-react"

const statusOptions = [
  { value: MandatStatut.EN_ATTENTE_EXECUTION, label: "En attente d'exécution" },
  { value: MandatStatut.EN_COURS, label: "En cours" },
  { value: MandatStatut.ACHEVE, label: "Achevé" },
]

export default function MesMandatsPage() {
  const [mandats, setMandats] = useState<Mandat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    dateDebut: undefined,
    dateFin: undefined,
    statut: "",
  })

  const filteredMandats = useMemo(() => {
    return mandats.filter((mandat) => {
      // Filtre de recherche
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        if (
          !mandat.reference.toLowerCase().includes(searchLower) &&
          !mandat.objectif.toLowerCase().includes(searchLower)
        ) {
          return false
        }
      }

      // Filtre par statut
      if (filters.statut && filters.statut !== "all") {
        if (mandat.statut !== filters.statut) {
          return false
        }
      }

      // Filtre par date de début
      if (filters.dateDebut) {
        const mandatDate = new Date(mandat.dateDebut)
        if (mandatDate < filters.dateDebut) {
          return false
        }
      }

      // Filtre par date de fin
      if (filters.dateFin) {
        const mandatDate = new Date(mandat.dateFin)
        if (mandatDate > filters.dateFin) {
          return false
        }
      }

      return true
    })
  }, [mandats, filters])

  const fetchMandats = async () => {
    try {
      setLoading(true)
      const data = await apiService.getMesMandats()
      setMandats(data)
    } catch (err) {
      setError("Erreur lors du chargement de vos mandats")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMandats()
  }, [])

  const clearFilters = () => {
    setFilters({
      search: "",
      dateDebut: undefined,
      dateFin: undefined,
      statut: "",
    })
  }

  // Statistiques
  const stats = useMemo(() => {
    const enAttente = mandats.filter((m) => m.statut === MandatStatut.EN_ATTENTE_EXECUTION).length
    const enCours = mandats.filter((m) => m.statut === MandatStatut.EN_COURS).length
    const acheves = mandats.filter((m) => m.statut === MandatStatut.ACHEVE).length
    const totalJours = mandats.reduce((sum, m) => sum + m.duree, 0)

    return { enAttente, enCours, acheves, totalJours }
  }, [mandats])

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Mes Mandats</h1>
        <p className="text-muted-foreground">
          Tous les mandats où vous êtes assigné et qui ont été confirmés par la direction
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mandats.length}</div>
            <p className="text-xs text-muted-foreground">mandats assignés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.enAttente}</div>
            <p className="text-xs text-muted-foreground">à démarrer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En cours</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.enCours}</div>
            <p className="text-xs text-muted-foreground">en exécution</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achevés</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.acheves}</div>
            <p className="text-xs text-muted-foreground">terminés</p>
          </CardContent>
        </Card>
      </div>

      <Filters
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
        showStatusFilter={true}
        statusOptions={statusOptions}
      />

      <MesMandatsTable mandats={filteredMandats} title="Mes mandats" />
    </div>
  )
}
