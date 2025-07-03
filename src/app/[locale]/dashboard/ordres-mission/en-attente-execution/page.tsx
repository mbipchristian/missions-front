"use client"

import { useEffect, useMemo, useState } from "react"
import { OrdreMissionTable } from "@/components/ordre-mission/ordre-mission-table"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import { apiService } from "@/lib/api"
import type { OrdreMission } from "@/types"
import { Filters, type FilterState } from "@/components/ui/filters"


export default function OrdresMissionEnAttenteExecutionPage() {
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
    
    const clearFilters = () => {
    setFilters({
      search: "",
      dateDebut: undefined,
      dateFin: undefined,
    })
  }

  useEffect(() => {
    const fetchOrdresMission = async () => {
      try {
        setLoading(true)
        const data = await apiService.getOrdresMissionEnAttenteExecution()
        setOrdresMission(data)
      } catch (err) {
        setError("Erreur lors du chargement des ordres de mission en attente d'exécution")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrdresMission()
  }, [])

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Ordres de mission en attente d'exécution</h1>
        <p className="text-muted-foreground">Liste des ordres de mission confirmés qui attendent leur date de début</p>
      </div>

       <Filters filters={filters} onFiltersChange={setFilters} onClearFilters={clearFilters} />


      <OrdreMissionTable 
      ordresMission={filteredOrdresMission}
    
      title="Ordres de mission en attente d'exécution" />
    </div>
  )
}
