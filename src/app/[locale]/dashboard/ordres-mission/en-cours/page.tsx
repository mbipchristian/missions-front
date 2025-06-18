"use client"

import { useEffect, useState } from "react"
import { OrdreMissionTable } from "@/components/ordre-mission/ordre-mission-table"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import { apiService } from "@/lib/api"
import type { OrdreMission } from "@/types"

export default function OrdresMissionEnCoursPage() {
  const [ordresMission, setOrdresMission] = useState<OrdreMission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrdresMission = async () => {
      try {
        setLoading(true)
        const data = await apiService.getOrdresMissionEnCours()
        setOrdresMission(data)
      } catch (err) {
        setError("Erreur lors du chargement des ordres de mission en cours")
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
        <h1 className="text-3xl font-bold tracking-tight">Ordres de mission en cours</h1>
        <p className="text-muted-foreground">Liste des ordres de mission actuellement en cours d'exécution</p>
      </div>

      <OrdreMissionTable ordresMission={ordresMission} title="Ordres de mission en cours" />
    </div>
  )
}
