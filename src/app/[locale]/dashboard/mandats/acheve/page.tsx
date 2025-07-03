"use client"

import { useEffect, useState, useMemo } from "react"
import { MandatTable } from "@/components/mandat/mandat-table"
import { MandatActions } from "@/components/mandat/mandat-actions"
import { Filters, type FilterState } from "@/components/ui/filters"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import { apiService } from "@/lib/api"
import type { Mandat } from "@/types"

export default function MandatsAchevesPage() {
  const [mandats, setMandats] = useState<Mandat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    dateDebut: undefined,
    dateFin: undefined,
    createdBy: "",
  })

  const filteredMandats = useMemo(() => {
    return mandats.filter((mandat) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        if (
          !mandat.reference.toLowerCase().includes(searchLower) &&
          !mandat.objectif.toLowerCase().includes(searchLower)
        ) {
          return false
        }
      }

      if (filters.dateDebut) {
        const mandatDate = new Date(mandat.dateDebut)
        if (mandatDate < filters.dateDebut) {
          return false
        }
      }

      if (filters.dateFin) {
        const mandatDate = new Date(mandat.dateFin)
        if (mandatDate > filters.dateFin) {
          return false
        }
      }

      if (filters.createdBy) {
        const createdByLower = filters.createdBy.toLowerCase()
        if (!mandat.createdBy.toLowerCase().includes(createdByLower)) {
          return false
        }
      }

      return true
    })
  }, [mandats, filters])

  const fetchMandats = async () => {
    try {
      setLoading(true)
      const data = await apiService.getMandatsAcheves()
      setMandats(data)
    } catch (err) {
      setError("Erreur lors du chargement des mandats achevés")
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
      createdBy: "",
    })
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  return (
    <div>
    

      <Filters filters={filters} onFiltersChange={setFilters} onClearFilters={clearFilters} />

      <MandatTable
        mandats={filteredMandats}
        title="Mandats achevés"
        renderActions={(mandat) => (
          <MandatActions mandat={mandat} actions={["addReport"]} onActionComplete={fetchMandats} />
        )}
      />
    </div>
  )
}
