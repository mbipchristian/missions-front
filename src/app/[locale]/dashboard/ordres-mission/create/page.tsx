"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { OrdreMissionDto, Mandat, User, OrdreMission } from "@/types"
import { apiService } from "@/lib/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertTriangle } from "lucide-react"

export default function CreateOrdreMissionPage() {
  const [mandats, setMandats] = useState<Mandat[]>([])
  const [selectedMandat, setSelectedMandat] = useState<Mandat | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [form, setForm] = useState<Partial<OrdreMissionDto>>({})
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [mandatOrdresMission, setMandatOrdresMission] = useState<OrdreMission[]>([])

  // Charger les mandats confirmés au montage
  useEffect(() => {
    apiService.getMandatsEnAttenteExecution().then(setMandats)
  }, [])

  // Charger les ordres de mission du mandat sélectionné
  useEffect(() => {
    if (selectedMandat) {
      apiService.getOrdresMissionByMandat(selectedMandat.id).then(setMandatOrdresMission)
    } else {
      setMandatOrdresMission([])
    }
  }, [selectedMandat])

  // Quand un mandat est sélectionné, reset user et form
  useEffect(() => {
    setSelectedUser(null)
    setForm({})
  }, [selectedMandat])

  // Quand un user est sélectionné ou tauxAvance change, calculer les décomptes
  useEffect(() => {
    const fetchDecomptes = async () => {
      if (selectedMandat && selectedUser && form.tauxAvance) {
        try {
          const decomptes = await apiService.getOrdreMissionDecomptes(
            selectedMandat.id,
            selectedUser.id,
            Number(form.tauxAvance)
          ) as any as { decompteTotal: number; decompteAvance: number; decompteRelicat: number }
          setForm(f => ({
            ...f,
            decompteTotal: decomptes.decompteTotal,
            decompteAvance: decomptes.decompteAvance,
            decompteRelicat: decomptes.decompteRelicat,
          }))
        } catch (e) {
          // Optionnel : afficher une erreur
        }
      }
    }
    fetchDecomptes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMandat, selectedUser, form.tauxAvance])

  // Quand un user est sélectionné, pré-remplir le formulaire avec les infos du mandat
  useEffect(() => {
    if (selectedMandat && selectedUser) {
      setForm({
        reference: `OM-${selectedMandat.reference}-${selectedUser.matricule}`,
        objectif: selectedMandat.objectif,
        modePaiement: "VIREMENT",
        devise: "FCFA",
        tauxAvance: 50,
        dateDebut: selectedMandat.dateDebut,
        dateFin: selectedMandat.dateFin,
        duree: selectedMandat.duree,
        decompteTotal: 0,
        decompteAvance: 0,
        decompteRelicat: 0,
        mandatId: selectedMandat.id,
      })
    }
  }, [selectedMandat, selectedUser])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Conversion des dates en ISO string si besoin
      const payload: OrdreMissionDto = {
        ...form,
        userId: selectedUser?.id, // Ajoutez cette ligne
        dateDebut: form.dateDebut ? new Date(form.dateDebut).toISOString() : "",
        dateFin: form.dateFin ? new Date(form.dateFin).toISOString() : "",
        tauxAvance: Number(form.tauxAvance),
        duree: Number(form.duree),
        decompteTotal: Number(form.decompteTotal),
        decompteAvance: Number(form.decompteAvance),
        decompteRelicat: Number(form.decompteRelicat),
        mandatId: Number(form.mandatId),
      } as OrdreMissionDto
      await apiService.createOrdreMission(payload)
      toast({ title: "Succès", description: "Ordre de mission créé avec succès" })
      router.push("../ordres-mission/tous")
    } catch (error: any) {
      const errorMessage = error.message || "Erreur lors de la création de l'ordre de mission"
      // Détection des erreurs de validation utilisateur (chevauchement, quota)
      if (
        errorMessage.includes("chevauchement") ||
        errorMessage.includes("quota") ||
        errorMessage.includes("Ordre de mission en cours") ||
        errorMessage.includes("Dépassement du quota annuel")
      ) {
        // Découper le message en détails si besoin
        const details = errorMessage.split(":").pop() || errorMessage
        const reasons = details.split(",").map((r: string) => r.trim()).filter(Boolean)
        setValidationErrors(reasons)
        setShowValidationModal(true)
      } else {
        toast({
          title: "Erreur",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Créer un Ordre de Mission</h1>
      {/* 1. Sélection du mandat */}
      <div className="mb-4">
        <Label>Choisir un mandat confirmé</Label>
        <select
          className="w-full border rounded p-2 mt-1"
          value={selectedMandat?.id || ""}
          onChange={e => {
            const mandat = mandats.find(m => m.id === Number(e.target.value)) || null
            setSelectedMandat(mandat)
          }}
        >
          <option value="">-- Sélectionner un mandat --</option>
          {mandats.map(mandat => (
            <option key={mandat.id} value={mandat.id}>
              {mandat.reference} - {mandat.objectif}
            </option>
          ))}
        </select>
      </div>

      {/* 2. Sélection de l'utilisateur du mandat */}
      {selectedMandat && (
        <div className="mb-4">
          <Label>Choisir un utilisateur du mandat</Label>
          <select
            className="w-full border rounded p-2 mt-1"
            value={selectedUser?.id || ""}
            onChange={e => {
              const user = selectedMandat.users.find(u => u.id === Number(e.target.value)) || null
              setSelectedUser(user)
            }}
          >
            <option value="">-- Sélectionner un utilisateur --</option>
            {selectedMandat.users
              .filter(user => !mandatOrdresMission.some(om => om && om.reference && om.reference.includes(user.matricule)))
              .map(user => (
                <option key={user.id} value={user.id}>
                  {user.username} ({user.matricule})
                </option>
              ))}
          </select>
        </div>
      )}

      {/* 3. Formulaire de création d'ordre de mission */}
      {selectedMandat && selectedUser && (
        <>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Référence</Label>
            <Input name="reference" value={form.reference || ""} onChange={handleChange} required />
          </div>
          <div>
            <Label>Objectif</Label>
            <Input name="objectif" value={form.objectif || ""} onChange={handleChange} required />
          </div>
          <div>
            <Label>Mode de Paiement</Label>
            <Input name="modePaiement" value={form.modePaiement || ""} onChange={handleChange} required />
          </div>
          <div>
            <Label>Devise</Label>
            <Input name="devise" value={form.devise || ""} onChange={handleChange} required />
          </div>
          <div>
            <Label>Taux d'avance (%)</Label>
            <Input name="tauxAvance" type="number" value={form.tauxAvance || ""} onChange={handleChange} required />
          </div>
          <div>
            <Label>Date de début</Label>
            <Input name="dateDebut" type="date" value={form.dateDebut ? form.dateDebut.slice(0,10) : ""} onChange={handleChange} required />
          </div>
          <div>
            <Label>Date de fin</Label>
            <Input name="dateFin" type="date" value={form.dateFin ? form.dateFin.slice(0,10) : ""} onChange={handleChange} required />
          </div>
          <div>
            <Label>Durée (jours)</Label>
            <Input name="duree" type="number" value={form.duree || ""} onChange={handleChange} required />
          </div>
          <div>
            <Label>Décompte total</Label>
            <Input name="decompteTotal" type="number" value={form.decompteTotal || ""} onChange={handleChange} required />
          </div>
          <div>
            <Label>Décompte avance</Label>
            <Input name="decompteAvance" type="number" value={form.decompteAvance || ""} onChange={handleChange} required />
          </div>
          <div>
            <Label>Décompte reliquat</Label>
            <Input name="decompteRelicat" type="number" value={form.decompteRelicat || ""} onChange={handleChange} required />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Création..." : "Créer l'ordre de mission"}
          </Button>
        </form>
        {/* Modal pour erreurs de validation utilisateur */}
        <Dialog open={showValidationModal} onOpenChange={setShowValidationModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Utilisateur non conforme
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                L'ordre de mission ne peut pas être créé car l'utilisateur ne respecte pas les critères suivants :
              </p>
              <div className="space-y-2">
                {validationErrors.map((error, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setShowValidationModal(false)}>
                  Compris
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </>
      )}
    </div>
  )
} 