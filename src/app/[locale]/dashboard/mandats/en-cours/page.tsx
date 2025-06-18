"use client"

import { useEffect, useState } from "react"
import { MandatTable } from "@/components/mandat/mandat-table"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import { apiService } from "@/lib/api"
import type { Mandat } from "@/types"

export default function MandatsEnCoursPage() {
  const [mandats, setMandats] = useState<Mandat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMandats = async () => {
      try {
        setLoading(true)
        const data = await apiService.getMandatsEnCours()
        setMandats(data)
      } catch (err) {
        setError("Erreur lors du chargement des mandats en cours")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchMandats()
  }, [])

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Mandats en cours</h1>
        <p className="text-muted-foreground">Liste des mandats actuellement en cours d'exécution</p>
      </div>

      <MandatTable mandats={mandats} title="Mandats en cours" />
    </div>
  )
}
