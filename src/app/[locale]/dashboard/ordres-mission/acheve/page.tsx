"use client"

import { useEffect, useState, useMemo } from "react"
import { OrdreMissionTable } from "@/components/ordre-mission/ordre-mission-table"
import { OrdreMissionActions } from "@/components/ordre-mission/ordre-mission-actions"
import { Filters, type FilterState } from "@/components/ui/filters"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import { apiService } from "@/lib/api"
import type { OrdreMission } from "@/types"

export default function OrdresMissionAchevesPage() {
  const [ordresMission, setOrdresMission] = useState<OrdreMission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    dateDebut: undefined,
    dateFin: undefined,
  })

  const filteredOrdresMission = useMemo(() => {
    return ordresMission.filter((ordre) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        if (
          !ordre.reference.toLowerCase().includes(searchLower) &&
          !ordre.objectif.toLowerCase().includes(searchLower)
        ) {
          return false
        }
      }

      if (filters.dateDebut) {
        const ordreDate = new Date(ordre.dateDebut)
        if (ordreDate < filters.dateDebut) {
          return false
        }
      }

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
      const data = await apiService.getOrdresMissionAcheves()
      setOrdresMission(data)
    } catch (err) {
      setError("Erreur lors du chargement des ordres de mission achevés")
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
    })
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Ordres de mission achevés</h1>
        <p className="text-muted-foreground">Liste des ordres de mission terminés avec succès</p>
      </div>

      <Filters filters={filters} onFiltersChange={setFilters} onClearFilters={clearFilters} />

      <OrdreMissionTable
        ordresMission={filteredOrdresMission}
        title="Ordres de mission achevés"
        renderActions={(ordre : OrdreMission) => (
          <OrdreMissionActions
            ordreMission={ordre}
            actions={["addAttachments"]}
            onActionComplete={fetchOrdresMission}
          />
        )}
      />
    </div>
  )
}
