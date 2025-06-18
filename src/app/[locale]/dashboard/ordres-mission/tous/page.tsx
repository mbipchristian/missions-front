"use client"

import { useEffect, useState } from "react"
import { OrdreMissionTable } from "@/components/ordre-mission/ordre-mission-table"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import { apiService } from "@/lib/api"
import type { OrdreMission } from "@/types"

export default function TousOrdresMissionPage() {
  const [ordresMission, setOrdresMission] = useState<OrdreMission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrdresMission = async () => {
      try {
        setLoading(true)
        const data = await apiService.getAllOrdresMission()
        setOrdresMission(data)
      } catch (err) {
        setError("Erreur lors du chargement de tous les ordres de mission")
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
        <h1 className="text-3xl font-bold tracking-tight">Tous les ordres de mission</h1>
        <p className="text-muted-foreground">Vue d'ensemble de tous les ordres de mission, tous statuts confondus</p>
      </div>

      <OrdreMissionTable ordresMission={ordresMission} title="Tous les ordres de mission" />
    </div>
  )
}
