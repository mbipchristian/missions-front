"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import { useToast } from "@/hooks/use-toast"
import { useTranslations } from 'next-intl'; 
import { apiService } from "@/lib/api"
import type { OrdreMission } from "@/types"
import { ArrowLeft, Save, X, FileText } from "lucide-react"

export default function ModifierOrdreMissionPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const t = useTranslations('ModifierOrdreMissionPage');
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ordreMission, setOrdreMission] = useState<OrdreMission | null>(null)
  const [formData, setFormData] = useState({
    objectif: "",
    dateDebut: "",
    dateFin: "",
    duree: 0,
    modePaiement: "",
    devise: "XAF",
    decompteTotal: 0,
    tauxAvance: 0,
    decompteAvance: 0,
    decompteRelicat: 0,
  })

  useEffect(() => {
    const fetchOrdreMission = async () => {
      try {
        setLoading(true)
        const data = await apiService.getOrdreMissionById(Number(params.id))
        setOrdreMission(data)
        setFormData({
          objectif: data.objectif,
          dateDebut: new Date(data.dateDebut).toISOString().split("T")[0],
          dateFin: new Date(data.dateFin).toISOString().split("T")[0],
          duree: data.duree,
          modePaiement: data.modePaiement,
          devise: data.devise,
          decompteTotal: data.decompteTotal,
          tauxAvance: data.tauxAvance,
          decompteAvance: data.decompteAvance,
          decompteRelicat: data.decompteRelicat,
        })
      } catch (err) {
        setError("Erreur lors du chargement de l'ordre de mission")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchOrdreMission()
    }
  }, [params.id])

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value }

      // Recalculer automatiquement les montants si nécessaire
      if (field === "decompteTotal" || field === "tauxAvance") {
        const total = field === "decompteTotal" ? Number(value) : newData.decompteTotal
        const taux = field === "tauxAvance" ? Number(value) : newData.tauxAvance

        newData.decompteAvance = Math.round((total * taux) / 100)
        newData.decompteRelicat = total - newData.decompteAvance
      }

      // Recalculer la durée si les dates changent
      if (field === "dateDebut" || field === "dateFin") {
        const debut = new Date(field === "dateDebut" ? (value as string) : newData.dateDebut)
        const fin = new Date(field === "dateFin" ? (value as string) : newData.dateFin)

        if (debut && fin && fin > debut) {
          const diffTime = Math.abs(fin.getTime() - debut.getTime())
          newData.duree = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        }
      }

      return newData
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)
      await apiService.updateOrdreMission(Number(params.id), formData)

      toast({
        title: "Succès",
        description: "Ordre de mission modifié avec succès",
      })

      router.push("/ordres-mission/en-attente-justificatif")
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la modification de l'ordre de mission",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />
  if (!ordreMission) return <ErrorMessage message="Ordre de mission non trouvé" />

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Modifier l'ordre de mission</h1>
            <p className="text-muted-foreground">Référence: {ordreMission.reference}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations générales */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
            <CardTitle className="flex items-center text-blue-800">
              <FileText className="h-5 w-5 mr-2" />
              Informations générales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="objectif">Objectif *</Label>
                <Textarea
                  id="objectif"
                  value={formData.objectif}
                  onChange={(e) => handleInputChange("objectif", e.target.value)}
                  placeholder="Décrivez l'objectif de la mission..."
                  required
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="dateDebut">Date de début *</Label>
                <Input
                  id="dateDebut"
                  type="date"
                  value={formData.dateDebut}
                  onChange={(e) => handleInputChange("dateDebut", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="dateFin">Date de fin *</Label>
                <Input
                  id="dateFin"
                  type="date"
                  value={formData.dateFin}
                  onChange={(e) => handleInputChange("dateFin", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="duree">Durée (jours)</Label>
                <Input
                  id="duree"
                  type="number"
                  value={formData.duree}
                  onChange={(e) => handleInputChange("duree", Number.parseInt(e.target.value))}
                  min="1"
                  readOnly
                  className="bg-muted"
                />
              </div>

              <div>
                <Label htmlFor="modePaiement">Mode de paiement</Label>
                <Input
                  id="modePaiement"
                  value={formData.modePaiement}
                  onChange={(e) => handleInputChange("modePaiement", e.target.value)}
                  placeholder="Ex: Virement bancaire"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations financières */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
            <CardTitle className="flex items-center text-green-800">
              <FileText className="h-5 w-5 mr-2" />
              Informations financières
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="devise">Devise</Label>
                <select
                  id="devise"
                  value={formData.devise}
                  onChange={(e) => handleInputChange("devise", e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md"
                >
                  <option value="XAF">XAF (Franc CFA)</option>
                  <option value="EUR">EUR (Euro)</option>
                  <option value="USD">USD (Dollar)</option>
                </select>
              </div>

              <div>
                <Label htmlFor="decompteTotal">Montant total *</Label>
                <Input
                  id="decompteTotal"
                  type="number"
                  value={formData.decompteTotal}
                  onChange={(e) => handleInputChange("decompteTotal", Number.parseFloat(e.target.value))}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <Label htmlFor="tauxAvance">Taux d'avance (%)</Label>
                <Input
                  id="tauxAvance"
                  type="number"
                  value={formData.tauxAvance}
                  onChange={(e) => handleInputChange("tauxAvance", Number.parseFloat(e.target.value))}
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>

              <div>
                <Label htmlFor="decompteAvance">Montant d'avance</Label>
                <Input
                  id="decompteAvance"
                  type="number"
                  value={formData.decompteAvance}
                  readOnly
                  className="bg-muted"
                />
              </div>

              <div>
                <Label htmlFor="decompteRelicat">Reliquat</Label>
                <Input
                  id="decompteRelicat"
                  type="number"
                  value={formData.decompteRelicat}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4 mr-2" />
            Annuler
          </Button>
          <Button type="submit" disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </form>
    </div>
  )
}
