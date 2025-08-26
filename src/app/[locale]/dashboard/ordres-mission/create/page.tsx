"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import type { OrdreMissionDto, Mandat, User, OrdreMission, DecomptesResponse } from "@/types"
import { apiService } from "@/lib/api"
import { ValidationErrorModal } from "@/components/validationErrorModal"
import { parseValidationError } from "@/lib/validation-parser"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { CalendarIcon, UserIcon, FileText, CreditCard, Calculator, MapPin, Loader2 } from "lucide-react"

export default function CreateOrdreMissionPage() {
  const [mandats, setMandats] = useState<Mandat[]>([])
  const [selectedMandat, setSelectedMandat] = useState<Mandat | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedVilles, setSelectedVilles] = useState<number[]>([])
  const [form, setForm] = useState<Partial<OrdreMissionDto>>({})
  const [loading, setLoading] = useState(false)
  const [calculatingDecomptes, setCalculatingDecomptes] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const [validationErrors, setValidationErrors] = useState<
    Array<{
      type: "quota" | "chevauchement" | "general"
      message: string
      details?: {
        currentQuota?: number
        afterQuota?: number
        conflictEndDate?: string
      }
    }>
  >([])
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [mandatOrdresMission, setMandatOrdresMission] = useState<OrdreMission[]>([])

  // Fonction pour calculer la durée en jours
  const calculateDuration = (dateDebut: string | Date, dateFin: string | Date): number => {
    if (!dateDebut || !dateFin) return 0

    const startDate = new Date(dateDebut)
    const endDate = new Date(dateFin)

    // Calcul de la différence en millisecondes
    const diffTime = endDate.getTime() - startDate.getTime()
    // Conversion en jours (+ 1 pour inclure le jour de début)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays > 0 ? diffDays : 0
  }

  // Fonction pour calculer les décomptes localement (fallback)
  const calculateLocalDecomptes = (
    user: User,
    duree: number,
    tauxAvance: number,
    hasVilleExterieure: boolean,
  ): DecomptesResponse => {
    // Valeurs par défaut si le rang n'est pas disponible
    const fraisExterne = user.rang?.fraisExterne || 0
    const fraisInterne = user.rang?.fraisInterne || 0

    const tauxJournalier = hasVilleExterieure ? fraisExterne : fraisInterne
    const decompteTotal = tauxJournalier * duree
    const decompteAvance = Math.round((decompteTotal * tauxAvance) / 100)
    const decompteRelicat = decompteTotal - decompteAvance

    return {
      decompteTotal,
      decompteAvance,
      decompteRelicat,
    }
  }

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

  // Quand un mandat est sélectionné, reset user, villes et form
  useEffect(() => {
    setSelectedUser(null)
    setSelectedVilles([])
    setForm({})
  }, [selectedMandat])

  // Quand un user est sélectionné ou tauxAvance change, calculer les décomptes
  useEffect(() => {
    const fetchDecomptes = async () => {
      if (selectedMandat && selectedUser && form.tauxAvance && selectedVilles.length > 0 && form.duree) {
        setCalculatingDecomptes(true)
        try {
          // Créer un ordre de mission temporaire pour le calcul
          const tempOrdreMission = {
            mandatId: selectedMandat.id,
            userId: selectedUser.id,
            tauxAvance: Number(form.tauxAvance),
            duree: Number(form.duree),
            dateDebut: form.dateDebut || selectedMandat.dateDebut,
            dateFin: form.dateFin || selectedMandat.dateFin,
            villeIds: selectedVilles,
          }

          const decomptes: DecomptesResponse = await apiService.calculerDecomptesPreCreation(tempOrdreMission)

          setForm((f) => ({
            ...f,
            decompteTotal: decomptes.decompteTotal,
            decompteAvance: decomptes.decompteAvance,
            decompteRelicat: decomptes.decompteRelicat,
          }))
        } catch (error) {
          console.error("Erreur lors du calcul des décomptes:", error)

          // Calcul local en cas d'erreur
          const hasVilleExterieure = selectedMandat.villes
            .filter((v) => selectedVilles.includes(v.id))
            .some((v) => !v.interieur)

          const localDecomptes = calculateLocalDecomptes(
            selectedUser,
            Number(form.duree),
            Number(form.tauxAvance),
            hasVilleExterieure,
          )

          setForm((f) => ({
            ...f,
            decompteTotal: localDecomptes.decompteTotal,
            decompteAvance: localDecomptes.decompteAvance,
            decompteRelicat: localDecomptes.decompteRelicat,
          }))

          toast({
            title: "Information",
            description: "Calcul automatique des décomptes",
            variant: "default",
          })
        } finally {
          setCalculatingDecomptes(false)
        }
      }
    }

    fetchDecomptes()
  }, [selectedMandat, selectedUser, form.tauxAvance, form.duree, selectedVilles, toast])

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
        userId: selectedUser.id,
        villeIds: selectedVilles,
      })
    }
  }, [selectedMandat, selectedUser, selectedVilles])

  // Calcul automatique de la durée quand les dates changent
  useEffect(() => {
    if (form.dateDebut && form.dateFin) {
      const calculatedDuration = calculateDuration(form.dateDebut, form.dateFin)
      setForm((prevForm) => ({
        ...prevForm,
        duree: calculatedDuration,
      }))
    }
  }, [form.dateDebut, form.dateFin])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleVilleToggle = (villeId: number) => {
    setSelectedVilles((prev) => {
      const newSelection = prev.includes(villeId) ? prev.filter((id) => id !== villeId) : [...prev, villeId]

      // Mettre à jour le formulaire avec les nouvelles villes sélectionnées
      setForm((prevForm) => ({
        ...prevForm,
        villeIds: newSelection,
      }))

      return newSelection
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation des champs requis
    if (!selectedUser || !selectedMandat) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un mandat et un utilisateur",
        variant: "destructive",
      })
      return
    }

    // Validation des villes
    if (selectedVilles.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins une ville de destination",
        variant: "destructive",
      })
      return
    }

    // Validation des champs du formulaire
    if (!form.reference || !form.objectif || !form.modePaiement || !form.devise) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Création du payload avec tous les champs requis
      const payload: OrdreMissionDto = {
        reference: form.reference,
        objectif: form.objectif,
        modePaiement: form.modePaiement,
        devise: form.devise,
        userId: selectedUser.id,
        dateDebut: form.dateDebut
          ? new Date(form.dateDebut).toISOString()
          : new Date(selectedMandat.dateDebut).toISOString(),
        dateFin: form.dateFin ? new Date(form.dateFin).toISOString() : new Date(selectedMandat.dateFin).toISOString(),
        tauxAvance: Number(form.tauxAvance) || 50,
        duree: Number(form.duree) || selectedMandat.duree,
        decompteTotal: Number(form.decompteTotal) || 0,
        decompteAvance: Number(form.decompteAvance) || 0,
        decompteRelicat: Number(form.decompteRelicat) || 0,
        mandatId: selectedMandat.id,
        villeIds: selectedVilles,
      }

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
        // Parser le message d'erreur pour extraire les détails
        const parsedErrors = parseValidationError(errorMessage)
        setValidationErrors(parsedErrors)
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

  const availableUsers =
    selectedMandat?.users.filter(
      (user) => !mandatOrdresMission.some((om) => om && om.reference && om.reference.includes(user.matricule)),
    ) || []

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Créer un Ordre de Mission</h1>
        <p className="text-gray-600">Sélectionnez un mandat et un utilisateur pour créer un nouvel ordre de mission</p>
      </div>

      <div className="grid gap-6">
        {/* Étape 1: Sélection du mandat */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Étape 1 : Sélection du mandat
            </CardTitle>
            <CardDescription>Choisissez un mandat confirmé parmi ceux en attente d'exécution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="mandat-select">Mandat confirmé</Label>
              <select
                id="mandat-select"
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedMandat?.id || ""}
                onChange={(e) => {
                  const mandat = mandats.find((m) => m.id === Number(e.target.value)) || null
                  setSelectedMandat(mandat)
                }}
              >
                <option value="">-- Sélectionner un mandat --</option>
                {mandats.map((mandat) => (
                  <option key={mandat.id} value={mandat.id}>
                    {mandat.reference} - {mandat.objectif}
                  </option>
                ))}
              </select>
            </div>

            {selectedMandat && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Informations du mandat sélectionné</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Référence:</span> {selectedMandat.reference}
                  </div>
                  <div>
                    <span className="font-medium">Durée:</span> {selectedMandat.duree} jours
                  </div>
                  <div>
                    <span className="font-medium">Date début:</span>{" "}
                    {new Date(selectedMandat.dateDebut).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Date fin:</span>{" "}
                    {new Date(selectedMandat.dateFin).toLocaleDateString()}
                  </div>
                </div>
                <div className="mt-2">
                  <span className="font-medium">Objectif:</span> {selectedMandat.objectif}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Étape 2: Sélection de l'utilisateur */}
        {selectedMandat && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Étape 2 : Sélection de l'utilisateur
              </CardTitle>
              <CardDescription>
                Choisissez un utilisateur du mandat qui n'a pas encore d'ordre de mission
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="user-select">Utilisateur disponible</Label>
                <select
                  id="user-select"
                  className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectedUser?.id || ""}
                  onChange={(e) => {
                    const user = selectedMandat.users.find((u) => u.id === Number(e.target.value)) || null
                    setSelectedUser(user)
                  }}
                >
                  <option value="">-- Sélectionner un utilisateur --</option>
                  {availableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.username} ({user.matricule})
                    </option>
                  ))}
                </select>
              </div>

              {availableUsers.length === 0 && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    Aucun utilisateur disponible. Tous les utilisateurs de ce mandat ont déjà un ordre de mission.
                  </p>
                </div>
              )}

              {selectedUser && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Utilisateur sélectionné</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{selectedUser.matricule}</Badge>
                    <span className="text-sm">{selectedUser.username}</span>
                    {selectedUser.rang && (
                      <Badge variant="secondary" className="text-xs">
                        {selectedUser.rang.nom}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Étape 3: Sélection des villes */}
        {selectedMandat && selectedUser && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Étape 3 : Sélection des destinations
              </CardTitle>
              <CardDescription>Choisissez les villes de destination pour cet ordre de mission</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Label>Villes disponibles dans le mandat</Label>

                {selectedMandat.villes.length === 0 ? (
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <p className="text-yellow-800 text-sm">Aucune ville définie dans ce mandat.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedMandat.villes.map((ville) => (
                      <div
                        key={ville.id}
                        className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedVilles.includes(ville.id)
                            ? "bg-blue-50 border-blue-300"
                            : "bg-white border-gray-200 hover:bg-gray-50"
                        }`}
                        onClick={() => handleVilleToggle(ville.id)}
                      >
                        <Checkbox
                          checked={selectedVilles.includes(ville.id)}
                          onChange={() => handleVilleToggle(ville.id)}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{ville.name}</div>
                          <div className="text-xs text-gray-500">
                            {ville.code} • {ville.interieur ? "Intérieur" : "Extérieur"}
                          </div>
                        </div>
                        {ville.interieur ? (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                            Intérieur
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-300">
                            Extérieur
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {selectedVilles.length > 0 && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">
                      Villes sélectionnées ({selectedVilles.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedMandat.villes
                        .filter((ville) => selectedVilles.includes(ville.id))
                        .map((ville) => (
                          <Badge key={ville.id} className="bg-green-100 text-green-800 border-green-300">
                            {ville.name}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Étape 4: Formulaire de création */}
        {selectedMandat && selectedUser && selectedVilles.length > 0 && (
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Étape 4 : Informations de l'ordre de mission
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Informations générales */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Informations générales</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reference">Référence</Label>
                      <Input
                        id="reference"
                        name="reference"
                        value={form.reference || ""}
                        onChange={handleChange}
                        required
                        className="mt-1"
                        readOnly
                      />
                    </div>
                    <div>
                      <Label htmlFor="objectif">Objectif</Label>
                      <Input
                        id="objectif"
                        name="objectif"
                        value={form.objectif || ""}
                        onChange={handleChange}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Informations financières */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Informations financières
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
  <Label htmlFor="modePaiement">Mode de paiement</Label>
  <select
    id="modePaiement"
    name="modePaiement"
    value={form.modePaiement || ""}
    onChange={(e) => setForm(prev => ({ ...prev, modePaiement: e.target.value }))}
    required
    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  >
    <option value="">Sélectionner</option>
    <option value="especes">Espèces</option>
    <option value="cheque">Chèque</option>
    <option value="virement">Virement bancaire</option>
    <option value="carte">Carte bancaire</option>
    <option value="mobile">Paiement mobile</option>
    <option value="credit">Crédit</option>
  </select>
</div>
<div>
  <Label htmlFor="devise">Devise</Label>
  <select
    id="devise"
    name="devise"
    value={form.devise || ""}
    onChange={(e) => setForm(prev => ({ ...prev, devise: e.target.value }))}
    required
    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  >
    <option value="">Sélectionner une devise</option>
    <option value="XAF">FCFA</option>
    <option value="EUR">EUR</option>
    <option value="USD">USD</option>
    <option value="GBP">GBP</option>
    <option value="CHF">CHF</option>
    <option value="CAD">CAD</option>
  </select>
</div>
                    <div>
                      <Label htmlFor="tauxAvance">Taux d'avance (%)</Label>
                      <Input
                        id="tauxAvance"
                        name="tauxAvance"
                        type="number"
                        value={form.tauxAvance || ""}
                        onChange={handleChange}
                        required
                        className="mt-1"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Dates et durée */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Périodes et durée
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label>Date de début</Label>
                      <div className="mt-2 border rounded-md p-2">
                        <Calendar
                          mode="single"
                          selected={form.dateDebut ? new Date(form.dateDebut) : undefined}
                          onSelect={(date) => setForm((f) => ({ ...f, dateDebut: date ? date.toISOString() : "" }))}
                          disabled={{
                            before: new Date(selectedMandat.dateDebut),
                            after: new Date(selectedMandat.dateFin),
                          }}
                          className="rounded-md border-0"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Date de fin</Label>
                      <div className="mt-2 border rounded-md p-2">
                        <Calendar
                          mode="single"
                          selected={form.dateFin ? new Date(form.dateFin) : undefined}
                          onSelect={(date) => setForm((f) => ({ ...f, dateFin: date ? date.toISOString() : "" }))}
                          disabled={{
                            before: new Date(selectedMandat.dateDebut),
                            after: new Date(selectedMandat.dateFin),
                          }}
                          className="rounded-md border-0"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="duree">Durée (jours)</Label>
                      <Input
                        id="duree"
                        name="duree"
                        type="number"
                        value={form.duree || ""}
                        onChange={handleChange}
                        required
                        className="mt-1"
                        min="1"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Décomptes */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Calculs financiers
                    {calculatingDecomptes && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="decompteTotal">Décompte total</Label>
                      <Input
                        id="decompteTotal"
                        name="decompteTotal"
                        type="number"
                        value={form.decompteTotal || ""}
                        onChange={handleChange}
                        required
                        className="mt-1"
                        min="0"
                        disabled={calculatingDecomptes}
                        readOnly
                      />
                    </div>
                    <div>
                      <Label htmlFor="decompteAvance">Décompte avance</Label>
                      <Input
                        id="decompteAvance"
                        name="decompteAvance"
                        type="number"
                        value={form.decompteAvance || ""}
                        onChange={handleChange}
                        required
                        className="mt-1"
                        min="0"
                        disabled={calculatingDecomptes}
                        readOnly
                      />
                    </div>
                    <div>
                      <Label htmlFor="decompteRelicat">Décompte reliquat</Label>
                      <Input
                        id="decompteRelicat"
                        name="decompteRelicat"
                        type="number"
                        value={form.decompteRelicat || ""}
                        onChange={handleChange}
                        required
                        className="mt-1"
                        min="0"
                        disabled={calculatingDecomptes}
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Boutons d'action */}
                <div className="flex justify-end gap-4 pt-4">
                  <Button type="button" variant="outline" onClick={() => router.push("../ordres-mission/tous")}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={loading || calculatingDecomptes} className="min-w-[150px]">
                    {loading ? "Création..." : "Créer l'ordre de mission"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        )}
      </div>

      <ValidationErrorModal
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        errors={validationErrors}
        userName={selectedUser?.username}
      />
    </div>
  )
}
