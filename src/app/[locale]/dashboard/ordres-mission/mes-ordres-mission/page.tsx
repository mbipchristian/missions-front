"use client"

import { useEffect, useState, useMemo } from "react"
import { MesOrdresMissionTable } from "@/components/ordre-mission/mes-ordres-mission-table"
import { Filters, type FilterState } from "@/components/ui/filters"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiService } from "@/lib/api"
import type { OrdreMission } from "@/types"
import { OrdreMissionStatut } from "@/types"
import { FileText, Play, CheckCircle, AlertCircle, CreditCard } from "lucide-react"

const statusOptions = [
  { value: OrdreMissionStatut.EN_ATTENTE_JUSTIFICATIF, label: "En attente de justificatif" },
  { value: OrdreMissionStatut.EN_ATTENTE_CONFIRMATION, label: "En attente de confirmation" },
  { value: OrdreMissionStatut.EN_ATTENTE_EXECUTION, label: "En attente d'exécution" },
  { value: OrdreMissionStatut.EN_COURS, label: "En cours" },
  { value: OrdreMissionStatut.ACHEVE, label: "Achevé" },
]

export default function MesOrdresMissionPage() {
  const [ordresMission, setOrdresMission] = useState<OrdreMission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    dateDebut: undefined,
    dateFin: undefined,
    statut: "",
  })

  const filteredOrdresMission = useMemo(() => {
    return ordresMission.filter((ordre) => {
      // Filtre de recherche
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        if (
          !ordre.reference.toLowerCase().includes(searchLower) &&
          !ordre.objectif.toLowerCase().includes(searchLower)
        ) {
          return false
        }
      }

      // Filtre par statut
      if (filters.statut && filters.statut !== "all") {
        if (ordre.statut !== filters.statut) {
          return false
        }
      }

      // Filtre par date de début
      if (filters.dateDebut) {
        const ordreDate = new Date(ordre.dateDebut)
        if (ordreDate < filters.dateDebut) {
          return false
        }
      }

      // Filtre par date de fin
      if (filters.dateFin) {
        const ordreDate = new Date(ordre.dateFin)
        if (ordreDate > filters.dateFin) {
          return false
        }
      }

      return true
    })
  }, [ordresMission, filters])

  const fetchOrdresMission = async () => {
    try {
      setLoading(true)
      const data = await apiService.getMesOrdresMission()
      setOrdresMission(data)
    } catch (err) {
      setError("Erreur lors du chargement de vos ordres de mission")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrdresMission()
  }, [])

  const clearFilters = () => {
    setFilters({
      search: "",
      dateDebut: undefined,
      dateFin: undefined,
      statut: "",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Statistiques
  const stats = useMemo(() => {
    const enAttenteJustificatif = ordresMission.filter(
      (o) => o.statut === OrdreMissionStatut.EN_ATTENTE_JUSTIFICATIF,
    ).length
    const enAttenteConfirmation = ordresMission.filter(
      (o) => o.statut === OrdreMissionStatut.EN_ATTENTE_CONFIRMATION,
    ).length
    const enCours = ordresMission.filter((o) => o.statut === OrdreMissionStatut.EN_COURS).length
    const acheves = ordresMission.filter((o) => o.statut === OrdreMissionStatut.ACHEVE).length
    const montantTotal = ordresMission.reduce((sum, o) => sum + o.decompteTotal, 0)

    return { enAttenteJustificatif, enAttenteConfirmation, enCours, acheves, montantTotal }
  }, [ordresMission])

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Mes Ordres de Mission</h1>
        <p className="text-muted-foreground">
          Tous vos ordres de mission personnels générés à partir des mandats confirmés
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-5 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ordresMission.length}</div>
            <p className="text-xs text-muted-foreground">ordres de mission</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.enAttenteJustificatif + stats.enAttenteConfirmation}</div>
            <p className="text-xs text-muted-foreground">à traiter</p>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Montant total</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{formatCurrency(stats.montantTotal)}</div>
            <p className="text-xs text-muted-foreground">toutes missions</p>
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

      <MesOrdresMissionTable ordresMission={filteredOrdresMission} title="Mes ordres de mission" />
    </div>
  )
}
