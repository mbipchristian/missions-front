"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, differenceInDays, isAfter, isBefore, startOfDay } from "date-fns"
import { fr } from "date-fns/locale"
import {
  CalendarIcon,
  Plus,
  MoreVertical,
  Edit,
  Trash,
  RefreshCw,
  ArrowLeft,
  Users,
  MapPin,
  Package,
  AlertCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Interfaces
interface UserResponseDto {
  id: number
  username: string
  email: string
  matricule: string
}

interface VilleResponseDto {
  id: number
  name: string
  code: string
}

interface RessourceResponseDto {
  id: number
  name: string
}

interface MandatResponseDto {
  id: string
  reference: string
  objectif?: string
  dateDebut: string
  dateFin: string
  duree: number
  users: UserResponseDto[]
  villes: VilleResponseDto[]
  ressources: RessourceResponseDto[]
}

interface EtapeDto {
  nom: string
  dateDebut: Date | null
  dateFin: Date | null
  duree: number
  ordre: number
  mandatId: string
  userIds: number[]
  villeIds: number[]
  ressourceIds: number[]
}

interface EtapeResponseDto {
  id: number
  nom: string
  dateDebut: string
  dateFin: string
  duree: number
  ordre: number
  created_at: string
  updated_at: string
  users: UserResponseDto[]
  villes: VilleResponseDto[]
  ressources: RessourceResponseDto[]
  mandat?: {
    id: string
    reference: string
  }
}

export function EtapesManagement({ mandatId, onBack }: { mandatId: string; onBack: () => void }) {
  const [etapes, setEtapes] = useState<EtapeResponseDto[]>([])
  const [selectedMandat, setSelectedMandat] = useState<MandatResponseDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [mandatLoading, setMandatLoading] = useState(true)
  const [currentView, setCurrentView] = useState<"list" | "create" | "edit">("list")
  const [selectedEtape, setSelectedEtape] = useState<EtapeResponseDto | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [formData, setFormData] = useState<EtapeDto>({
    nom: "",
    dateDebut: null,
    dateFin: null,
    duree: 0,
    ordre: 1,
    mandatId: mandatId,
    userIds: [],
    villeIds: [],
    ressourceIds: [],
  })
  const [dateErrors, setDateErrors] = useState<string[]>([])
  const [isDateDebutOpen, setIsDateDebutOpen] = useState(false)
  const [isDateFinOpen, setIsDateFinOpen] = useState(false)

  const { toast } = useToast()

  // Fetch etapes and mandat details on component mount
  useEffect(() => {
    fetchEtapes()
    fetchMandatDetails()
  }, [mandatId])

  // Calculate duration when dates change
  useEffect(() => {
    const errors: string[] = []
    let duree = 0

    if (formData.dateDebut && formData.dateFin) {
      const debut = startOfDay(formData.dateDebut)
      const fin = startOfDay(formData.dateFin)

      if (isAfter(debut, fin)) {
        errors.push("La date de début ne peut pas être postérieure à la date de fin")
      } else {
        duree = differenceInDays(fin, debut) + 1
      }
    }

    // Vérifier que les dates sont comprises dans les dates du mandat
    if (selectedMandat && formData.dateDebut) {
      const mandatDebut = new Date(selectedMandat.dateDebut)
      if (isBefore(formData.dateDebut, mandatDebut)) {
        errors.push("La date de début ne peut pas être antérieure à la date de début du mandat")
      }
    }

    if (selectedMandat && formData.dateFin) {
      const mandatFin = new Date(selectedMandat.dateFin)
      if (isAfter(formData.dateFin, mandatFin)) {
        errors.push("La date de fin ne peut pas être postérieure à la date de fin du mandat")
      }
    }

    setDateErrors(errors)
    setFormData((prev) => ({ ...prev, duree }))
  }, [formData.dateDebut, formData.dateFin, selectedMandat])

  const fetchEtapes = async () => {
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:8080/auth/etapes/mandat/${mandatId}`)
      if (!response.ok) throw new Error("Failed to fetch etapes")
      const data = await response.json()
      setEtapes(data)
    } catch (error) {
      console.error("Error fetching etapes:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les étapes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchMandatDetails = async () => {
    setMandatLoading(true)
    try {
      const response = await fetch(`http://localhost:8080/auth/mandats/${mandatId}`)
      if (!response.ok) throw new Error("Failed to fetch mandat details")
      const data = await response.json()
      setSelectedMandat(data)
    } catch (error) {
      console.error("Error fetching mandat details:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les détails du mandat",
        variant: "destructive",
      })
    } finally {
      setMandatLoading(false)
    }
  }

  const handleCreateEtape = async () => {
    if (!validateForm()) return

    try {
      setLoading(true)
      const response = await fetch("http://localhost:8080/auth/etapes/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          dateDebut: formData.dateDebut?.toISOString(),
          dateFin: formData.dateFin?.toISOString(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Échec de création de l'étape")
      }

      toast({
        title: "Succès",
        description: "Étape créée avec succès",
      })

      resetForm()
      setCurrentView("list")
      fetchEtapes()
    } catch (error) {
      console.error("Error creating etape:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Échec de création de l'étape",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateEtape = async () => {
    if (!selectedEtape || !validateForm()) return

    try {
      setLoading(true)
      const response = await fetch(`http://localhost:8080/auth/etapes/${selectedEtape.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          dateDebut: formData.dateDebut?.toISOString(),
          dateFin: formData.dateFin?.toISOString(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Échec de mise à jour de l'étape")
      }

      toast({
        title: "Succès",
        description: "Étape mise à jour avec succès",
      })

      resetForm()
      setSelectedEtape(null)
      setCurrentView("list")
      fetchEtapes()
    } catch (error) {
      console.error("Error updating etape:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Échec de mise à jour de l'étape",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEtape = async () => {
    if (!selectedEtape) return

    try {
      const response = await fetch(`http://localhost:8080/auth/etapes/${selectedEtape.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Échec de suppression de l'étape")
      }

      toast({
        title: "Succès",
        description: "Étape supprimée avec succès",
      })

      setIsDeleteDialogOpen(false)
      setSelectedEtape(null)
      fetchEtapes()
    } catch (error) {
      console.error("Error deleting etape:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Échec de suppression de l'étape",
        variant: "destructive",
      })
    }
  }

  const validateForm = () => {
    if (!formData.nom.trim()) {
      toast({
        title: "Erreur de validation",
        description: "Le nom de l'étape est obligatoire",
        variant: "destructive",
      })
      return false
    }

    if (!formData.dateDebut) {
      toast({
        title: "Erreur de validation",
        description: "La date de début est obligatoire",
        variant: "destructive",
      })
      return false
    }

    if (!formData.dateFin) {
      toast({
        title: "Erreur de validation",
        description: "La date de fin est obligatoire",
        variant: "destructive",
      })
      return false
    }

    if (dateErrors.length > 0) {
      toast({
        title: "Erreur de validation",
        description: dateErrors[0],
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const resetForm = () => {
    setFormData({
      nom: "",
      dateDebut: null,
      dateFin: null,
      duree: 0,
      ordre: 1,
      mandatId: mandatId,
      userIds: [],
      villeIds: [],
      ressourceIds: [],
    })
  }

  const openEditDialog = (etape: EtapeResponseDto) => {
    setSelectedEtape(etape)
    setFormData({
      nom: etape.nom,
      dateDebut: new Date(etape.dateDebut),
      dateFin: new Date(etape.dateFin),
      duree: etape.duree,
      ordre: etape.ordre,
      mandatId: mandatId,
      userIds: etape.users.map((user) => user.id),
      villeIds: etape.villes.map((ville) => ville.id),
      ressourceIds: etape.ressources.map((ressource) => ressource.id),
    })
    setCurrentView("edit")
  }

  const openDeleteDialog = (etape: EtapeResponseDto) => {
    setSelectedEtape(etape)
    setIsDeleteDialogOpen(true)
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: fr })
  }

  if (currentView === "create" || currentView === "edit") {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => setCurrentView("list")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">
            {currentView === "create" ? "Créer une Nouvelle Étape" : "Modifier l'Étape"}
          </h1>
        </div>

        {mandatLoading ? (
          <div className="flex justify-center items-center h-40">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : selectedMandat ? (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Détails de l'Étape</CardTitle>
              <CardDescription>
                {currentView === "create"
                  ? "Remplissez les informations pour créer une nouvelle étape."
                  : "Modifiez les informations de l'étape."}
              </CardDescription>
              <div className="mt-2">
                <Badge variant="outline" className="text-sm">
                  Mandat: {selectedMandat.reference}
                </Badge>
                <div className="text-xs text-muted-foreground mt-1">
                  Période du mandat: {formatDate(selectedMandat.dateDebut)} au {formatDate(selectedMandat.dateFin)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Nom de l'étape */}
              <div className="grid gap-2">
                <Label htmlFor="nom">Nom de l'étape *</Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Entrez le nom de l'étape"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="dateDebut">Date de Début *</Label>
                  <Popover open={isDateDebutOpen} onOpenChange={setIsDateDebutOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${
                          !formData.dateDebut && "text-muted-foreground"
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.dateDebut ? (
                          format(formData.dateDebut, "PPP", { locale: fr })
                        ) : (
                          <span>Sélectionner une date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.dateDebut || undefined}
                        onSelect={(date) => {
                          setFormData({ ...formData, dateDebut: date || null })
                          setIsDateDebutOpen(false)
                        }}
                        disabled={(date) => {
                          // Désactiver les dates en dehors de la période du mandat
                          const mandatDebut = new Date(selectedMandat.dateDebut)
                          const mandatFin = new Date(selectedMandat.dateFin)
                          return isBefore(date, mandatDebut) || isAfter(date, mandatFin)
                        }}
                        initialFocus
                        locale={fr}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="dateFin">Date de Fin *</Label>
                  <Popover open={isDateFinOpen} onOpenChange={setIsDateFinOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${
                          !formData.dateFin && "text-muted-foreground"
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.dateFin ? (
                          format(formData.dateFin, "PPP", { locale: fr })
                        ) : (
                          <span>Sélectionner une date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.dateFin || undefined}
                        onSelect={(date) => {
                          setFormData({ ...formData, dateFin: date || null })
                          setIsDateFinOpen(false)
                        }}
                        disabled={(date) => {
                          // Désactiver les dates en dehors de la période du mandat ou avant la date de début
                          const mandatDebut = formData.dateDebut || new Date(selectedMandat.dateDebut)
                          const mandatFin = new Date(selectedMandat.dateFin)
                          return isBefore(date, mandatDebut) || isAfter(date, mandatFin)
                        }}
                        initialFocus
                        locale={fr}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Durée calculée */}
              <div className="grid gap-2">
                <Label htmlFor="duree">Durée Calculée</Label>
                <Input id="duree" type="number" value={formData.duree} readOnly className="bg-muted max-w-xs" />
                {formData.duree > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Du {formData.dateDebut && format(formData.dateDebut, "dd/MM/yyyy")} au{" "}
                    {formData.dateFin && format(formData.dateFin, "dd/MM/yyyy")} = {formData.duree} jour
                    {formData.duree > 1 ? "s" : ""}
                  </p>
                )}
              </div>

              {/* Ordre */}
              <div className="grid gap-2">
                <Label htmlFor="ordre">Ordre</Label>
                <Input
                  id="ordre"
                  type="number"
                  min="1"
                  value={formData.ordre}
                  onChange={(e) => setFormData({ ...formData, ordre: Number.parseInt(e.target.value) || 1 })}
                  className="max-w-xs"
                />
              </div>

              {/* Sélection des utilisateurs */}
              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Utilisateurs du Mandat
                </Label>
                {selectedMandat.users.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Aucun utilisateur associé à ce mandat.</div>
                ) : (
                  <ScrollArea className="h-[150px] border rounded-md p-4">
                    <div className="space-y-2">
                      {selectedMandat.users.map((user) => (
                        <div key={user.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`user-${user.id}`}
                            checked={formData.userIds.includes(user.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({ ...formData, userIds: [...formData.userIds, user.id] })
                              } else {
                                setFormData({
                                  ...formData,
                                  userIds: formData.userIds.filter((id) => id !== user.id),
                                })
                              }
                            }}
                          />
                          <label htmlFor={`user-${user.id}`} className="text-sm font-medium">
                            {user.username} ({user.matricule})
                          </label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>

              {/* Sélection des villes */}
              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Villes du Mandat
                </Label>
                {selectedMandat.villes.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Aucune ville associée à ce mandat.</div>
                ) : (
                  <ScrollArea className="h-[150px] border rounded-md p-4">
                    <div className="space-y-2">
                      {selectedMandat.villes.map((ville) => (
                        <div key={ville.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`ville-${ville.id}`}
                            checked={formData.villeIds.includes(ville.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({ ...formData, villeIds: [...formData.villeIds, ville.id] })
                              } else {
                                setFormData({
                                  ...formData,
                                  villeIds: formData.villeIds.filter((id) => id !== ville.id),
                                })
                              }
                            }}
                          />
                          <label htmlFor={`ville-${ville.id}`} className="text-sm font-medium">
                            {ville.name} ({ville.code})
                          </label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>

              {/* Sélection des ressources */}
              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Ressources du Mandat
                </Label>
                {selectedMandat.ressources.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Aucune ressource associée à ce mandat.</div>
                ) : (
                  <ScrollArea className="h-[150px] border rounded-md p-4">
                    <div className="space-y-2">
                      {selectedMandat.ressources.map((ressource) => (
                        <div key={ressource.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`ressource-${ressource.id}`}
                            checked={formData.ressourceIds.includes(ressource.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({ ...formData, ressourceIds: [...formData.ressourceIds, ressource.id] })
                              } else {
                                setFormData({
                                  ...formData,
                                  ressourceIds: formData.ressourceIds.filter((id) => id !== ressource.id),
                                })
                              }
                            }}
                          />
                          
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>

              {/* Erreurs de validation */}
              {dateErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erreurs de validation</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-5 mt-2">
                      {dateErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <div className="text-sm text-muted-foreground">* Champs obligatoires</div>

              {/* Actions */}
              <div className="flex gap-4 pt-6">
                <Button variant="outline" onClick={() => setCurrentView("list")}>
                  Annuler
                </Button>
                <Button
                  onClick={currentView === "create" ? handleCreateEtape : handleUpdateEtape}
                  disabled={loading || dateErrors.length > 0}
                  className="min-w-[120px]"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      {currentView === "create" ? "Création..." : "Mise à jour..."}
                    </>
                  ) : currentView === "create" ? (
                    "Créer l'Étape"
                  ) : (
                    "Mettre à jour"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Alert variant="destructive" className="max-w-4xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>Impossible de charger les détails du mandat.</AlertDescription>
          </Alert>
        )}
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Gestion des Étapes</h1>
        <div className="ml-auto">
          <Button onClick={() => setCurrentView("create")}>
            <Plus className="mr-2 h-4 w-4" /> Nouvelle Étape
          </Button>
        </div>
      </div>

      {selectedMandat && (
        <div className="mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Mandat: {selectedMandat.reference}</h2>
                  <p className="text-sm text-muted-foreground">
                    Période: {formatDate(selectedMandat.dateDebut)} au {formatDate(selectedMandat.dateFin)} (
                    {selectedMandat.duree} jours)
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Users className="h-3 w-3" /> {selectedMandat.users.length} utilisateurs
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {selectedMandat.villes.length} villes
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Package className="h-3 w-3" /> {selectedMandat.ressources.length} ressources
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Liste des Étapes</CardTitle>
          <CardDescription>Gérez les étapes du mandat</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : etapes.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              Aucune étape trouvée. Créez une nouvelle étape pour commencer.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Durée</TableHead>
                  <TableHead>Ordre</TableHead>
                  <TableHead>Assignations</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {etapes.map((etape) => (
                  <TableRow key={etape.id}>
                    <TableCell className="font-medium">{etape.nom}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Début: {formatDate(etape.dateDebut)}</span>
                        <span className="text-xs text-muted-foreground">Fin: {formatDate(etape.dateFin)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {etape.duree} jour{etape.duree > 1 ? "s" : ""}
                    </TableCell>
                    <TableCell>{etape.ordre}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span className="text-xs">{etape.users.length}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="text-xs">{etape.villes.length}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          <span className="text-xs">{etape.ressources.length}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Ouvrir le menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => openEditDialog(etape)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => openDeleteDialog(etape)}>
                            <Trash className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Cela supprimera définitivement l'étape
              {selectedEtape && ` "${selectedEtape.nom}"`} et toutes ses données associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEtape} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
