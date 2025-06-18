"use client"

import { useEffect, useState } from "react"
import { MandatTable } from "@/components/mandat/mandat-table"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import { apiService } from "@/lib/api"
import type { Mandat } from "@/types"

export default function TousMandatsPage() {
  const [mandats, setMandats] = useState<Mandat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMandats = async () => {
      try {
        setLoading(true)
        const data = await apiService.getAllMandats()
        setMandats(data)
      } catch (err) {
        setError("Erreur lors du chargement de tous les mandats")
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
        <h1 className="text-3xl font-bold tracking-tight">Tous les mandats</h1>
        <p className="text-muted-foreground">Vue d'ensemble de tous les mandats, tous statuts confondus</p>
      </div>

      <MandatTable mandats={mandats} title="Tous les mandats" />
    </div>
  )
}
