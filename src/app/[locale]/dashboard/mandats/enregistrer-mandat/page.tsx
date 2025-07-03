"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, differenceInDays, isAfter, isBefore, startOfDay } from "date-fns"
import { fr } from "date-fns/locale"
import {
  CalendarIcon,
  RefreshCw,
  ArrowLeft,
  Upload,
  FileText,
  X,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Users, MapPin, Package } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { apiService } from "@/lib/api"

// Interfaces pour les entités existantes
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

interface MandatDto {
  reference: string
  objectif?: string
  dateDebut: Date | null
  dateFin: Date | null
  duree: number
  missionDeControle?: boolean
  userIds: number[]
  villeIds: number[]
  ressourceIds: number[]
}

interface CreatedMandat {
  id: number
  reference: string
  objectif?: string
  dateDebut: Date
  dateFin: Date
  duree: number
  missionDeControle: boolean
  userIds: number[]
  villeIds: number[]
  ressourceIds: number[]
  created_at: Date
  updated_at: Date
  attachments?: {
    id: number
    filename: string
    size: number
    createdAt: Date
  }[]

}

// Composant pour le formulaire de création
export default function CreateMandatForm({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) {
  const [users, setUsers] = useState<UserResponseDto[]>([])
  const [villes, setVilles] = useState<VilleResponseDto[]>([])
  const [ressources, setRessources] = useState<RessourceResponseDto[]>([])
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([])
  const [createdMandat, setCreatedMandat] = useState<CreatedMandat | null>(null)
  const [isAttachmentDialogOpen, setIsAttachmentDialogOpen] = useState(false)
  const [formData, setFormData] = useState<MandatDto>({
    reference: "",
    objectif: "",
    dateDebut: null,
    dateFin: null,
    duree: 0,
    missionDeControle: false,
    userIds: [],
    villeIds: [],
    ressourceIds: [],
  })
  const [loading, setLoading] = useState<string | null>(null)
  const [dateErrors, setDateErrors] = useState<string[]>([])
  const [isDateDebutOpen, setIsDateDebutOpen] = useState(false)
  const [isDateFinOpen, setIsDateFinOpen] = useState(false)
  const { toast } = useToast()

  // Calculate duration automatically when dates change
  useEffect(() => {
    const errors: string[] = []
    let duree = 0

    if (formData.dateDebut && formData.dateFin) {
      const debut = startOfDay(formData.dateDebut)
      const fin = startOfDay(formData.dateFin)

      if (isAfter(debut, fin)) {
        errors.push("La date de début ne peut pas être postérieure à la date de fin")
      } else {
        duree = differenceInDays(fin, debut) + 1 // +1 pour inclure le jour de début
      }
    }

    if (formData.dateDebut && isBefore(startOfDay(formData.dateDebut), startOfDay(new Date()))) {
      errors.push("La date de début ne peut pas être antérieure à aujourd'hui")
    }

    setDateErrors(errors)
    setFormData((prev) => ({ ...prev, duree }))
  }, [formData.dateDebut, formData.dateFin])

  // Fetch data on component mount
  useEffect(() => {
    fetchUsers()
    fetchVilles()
    fetchRessources()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:8080/auth/users/all")
      if (!response.ok) throw new Error("Failed to fetch users")
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs",
        variant: "destructive",
      })
    }
  }

  const fetchVilles = async () => {
    try {
      const response = await fetch("http://localhost:8080/auth/villes/all")
      if (!response.ok) throw new Error("Failed to fetch villes")
      const data = await response.json()
      setVilles(data)
    } catch (error) {
      console.error("Error fetching villes:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les villes",
        variant: "destructive",
      })
    }
  }

  const fetchRessources = async () => {
    try {
      const response = await fetch("http://localhost:8080/auth/ressources/all")
      if (!response.ok) throw new Error("Failed to fetch ressources")
      const data = await response.json()
      setRessources(data)
    } catch (error) {
      console.error("Error fetching ressources:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les ressources",
        variant: "destructive",
      })
    }
  }

  const handleDateDebutChange = (date: Date | undefined) => {
    const newDateDebut = date || null
    setFormData((prev) => {
      let newDateFin = prev.dateFin

      // Si la date de fin est antérieure à la nouvelle date de début, la réinitialiser
      if (newDateDebut && prev.dateFin && isBefore(prev.dateFin, newDateDebut)) {
        newDateFin = null
      }

      return {
        ...prev,
        dateDebut: newDateDebut,
        dateFin: newDateFin,
      }
    })
    setIsDateDebutOpen(false)
  }

  const handleDateFinChange = (date: Date | undefined) => {
    setFormData((prev) => ({ ...prev, dateFin: date || null }))
    setIsDateFinOpen(false)
  }

  // Handle file upload
  const addAttachmentFile = (file: File) => {
    setAttachmentFiles((prev) => [...prev, file])
  }

  const removeAttachmentFile = (index: number) => {
    setAttachmentFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleAddAttachments = async () => {
    if (attachmentFiles.length === 0 || !createdMandat) {
      // Si aucun fichier n'est sélectionné, simplement fermer le dialogue et terminer
      setIsAttachmentDialogOpen(false)
      resetFormAndGoBack()
      return
    }

    try {
      setLoading("addAttachments")
      
      // Envoyer chaque fichier individuellement
      for (let i = 0; i < attachmentFiles.length; i++) {
        const file = attachmentFiles[i]
        
        // CORRECTION: Utiliser le bon nom de méthode et les bons paramètres
        await apiService.addMandatAttachments(createdMandat.id, file)
      }

      toast({
        title: "Succès",
        description: "Pièces jointes ajoutées avec succès",
      })
      
      setAttachmentFiles([])
      setIsAttachmentDialogOpen(false)
      resetFormAndGoBack()
    } catch (error) {
      console.error("Erreur upload:", error)
      toast({
        title: "Erreur",
        description: `Erreur lors de l'ajout des pièces jointes: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  const handleSkipAttachments = () => {
    setIsAttachmentDialogOpen(false)
    resetFormAndGoBack()
  }

  const resetFormAndGoBack = () => {
    // Reset form
    setFormData({
      reference: "",
      objectif: "",
      dateDebut: null,
      dateFin: null,
      duree: 0,
      missionDeControle: false,
      userIds: [],
      villeIds: [],
      ressourceIds: [],
    })
    setAttachmentFiles([])
    setCreatedMandat(null)
    //onSuccess()
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Create a new mandat
  const handleCreateMandat = async () => {
    // Validate form data
    if (!formData.reference.trim()) {
      toast({
        title: "Erreur de validation",
        description: "La référence est obligatoire",
        variant: "destructive",
      })
      return
    }

    if (!formData.dateDebut) {
      toast({
        title: "Erreur de validation",
        description: "La date de début est obligatoire",
        variant: "destructive",
      })
      return
    }

    if (!formData.dateFin) {
      toast({
        title: "Erreur de validation",
        description: "La date de fin est obligatoire",
        variant: "destructive",
      })
      return
    }

    if (dateErrors.length > 0) {
      toast({
        title: "Erreur de validation",
        description: dateErrors[0],
        variant: "destructive",
      })
      return
    }

    if (formData.userIds.length === 0) {
      toast({
        title: "Erreur de validation",
        description: "Au moins un utilisateur doit être sélectionné",
        variant: "destructive",
      })
      return
    }

    if (formData.villeIds.length === 0) {
      toast({
        title: "Erreur de validation",
        description: "Au moins une ville doit être sélectionnée",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading("createMandat")

      // Prepare the payload as JSON
      const payload = {
        reference: formData.reference,
        objectif: formData.objectif || "",
        dateDebut: formData.dateDebut?.toISOString(),
        dateFin: formData.dateFin?.toISOString(),
        duree: formData.duree,
        missionDeControle: formData.missionDeControle || false,
        userIds: formData.userIds,
        villeIds: formData.villeIds,
        ressourceIds: formData.ressourceIds,
      }

      console.log("Sending payload:", payload) // For debugging

      const response = await fetch("http://localhost:8080/auth/mandats/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(payload),
      })
      
      if (!response.ok) {
        let errorMessage = "Échec de création du mandat"
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log("Mandat created successfully:", result)
      
      setCreatedMandat(result)

      toast({
        title: "Succès",
        description: "Mandat créé avec succès",
      })

      // Toujours ouvrir le dialogue des pièces jointes après création du mandat
      setIsAttachmentDialogOpen(true)

    } catch (error) {
      console.error("Erreur lors de la création du mandat:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Échec de création du mandat",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Créer un Nouveau Mandat</h1>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Détails du Mandat</CardTitle>
          <CardDescription>Remplissez les informations pour créer un nouveau mandat de mission.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Référence */}
          <div className="grid gap-2">
            <Label htmlFor="reference">Référence *</Label>
            <Input
              id="reference"
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              placeholder="Entrez la référence du mandat"
              className="max-w-md"
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
                    onClick={() => setIsDateDebutOpen(true)}
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
                    onSelect={handleDateDebutChange}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
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
                    onClick={() => setIsDateFinOpen(true)}
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
                    onSelect={handleDateFinChange}
                    disabled={(date) =>
                      formData.dateDebut ? date < formData.dateDebut : date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
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

          {/* Objectif */}
          <div className="grid gap-2">
            <Label htmlFor="objectif">Objectif</Label>
            <Textarea
              id="objectif"
              value={formData.objectif}
              onChange={(e) => setFormData({ ...formData, objectif: e.target.value })}
              placeholder="Décrivez l'objectif du mandat"
              rows={3}
            />
          </div>

          {/* Type de mission */}
          <div className="grid gap-2">
            <Label>Type de Mission</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="missionDeControle"
                checked={formData.missionDeControle}
                onCheckedChange={(checked) => setFormData({ ...formData, missionDeControle: checked as boolean })}
              />
              <label htmlFor="missionDeControle" className="text-sm font-medium">
                Mission de Contrôle
              </label>
            </div>
          </div>

          {/* Sélection des utilisateurs */}
          <div className="grid gap-2">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Utilisateurs *
            </Label>
            <ScrollArea className="h-[150px] border rounded-md p-4">
              <div className="space-y-2">
                {users.map((user) => (
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
          </div>

          {/* Sélection des villes */}
          <div className="grid gap-2">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Villes *
            </Label>
            <ScrollArea className="h-[150px] border rounded-md p-4">
              <div className="space-y-2">
                {villes.map((ville) => (
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
          </div>

          {/* Sélection des ressources */}
          <div className="grid gap-2">
            <Label className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Ressources
            </Label>
            <ScrollArea className="h-[150px] border rounded-md p-4">
              <div className="space-y-2">
                {ressources.map((ressource) => (
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
                    <label htmlFor={`ressource-${ressource.id}`} className="text-sm font-medium">
                      {ressource.name}
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Erreurs de validation */}
          {dateErrors.length > 0 && (
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <div className="text-sm text-red-600">
                {dateErrors.map((error, index) => (
                  <p key={index} className="flex items-center gap-2">
                    <span className="text-red-500">•</span>
                    {error}
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="text-sm text-muted-foreground">* Champs obligatoires</div>

          {/* Actions */}
          <div className="flex gap-4 pt-6">
            <Button variant="outline" onClick={onBack}>
              Annuler
            </Button>
            <Button onClick={handleCreateMandat} disabled={loading === "createMandat" || dateErrors.length > 0} className="min-w-[120px]">
              {loading === "createMandat" ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                "Créer le Mandat"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialog pour les pièces jointes - s'ouvre automatiquement après création */}
      <Dialog open={isAttachmentDialogOpen} onOpenChange={(open) => {
        if (!open && createdMandat) {
          // Si on ferme le dialogue et qu'un mandat a été créé, terminer le processus
          handleSkipAttachments()
        } else {
          setIsAttachmentDialogOpen(open)
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ajouter des pièces jointes au mandat</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Zone de drop et bouton d'upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                    Cliquez pour télécharger des fichiers
                  </span>
                  <span className="text-sm text-gray-500"> ou glissez-déposez</span>
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  multiple
                  onChange={(e) => {
                    const files = e.target.files
                    if (files) {
                      Array.from(files).forEach(file => {
                        if (file.size > 10 * 1024 * 1024) {
                          toast({
                            title: "Fichier trop volumineux",
                            description: `Le fichier "${file.name}" dépasse la taille maximale de 10MB`,
                            variant: "destructive",
                          })
                          return
                        }
                        addAttachmentFile(file)
                      })
                    }
                    e.target.value = ""
                  }}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (max. 10MB par fichier)
              </p>
            </div>

            {attachmentFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Fichiers sélectionnés ({attachmentFiles.length}) :</h4>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {attachmentFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <FileText className="h-4 w-4" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeAttachmentFile(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={handleSkipAttachments}
                disabled={loading === "addAttachments"}
              >
                {attachmentFiles.length > 0 ? "Ignorer les pièces jointes" : "Terminer sans pièces jointes"}
              </Button>
              {attachmentFiles.length > 0 && (
                <Button
                  onClick={handleAddAttachments}
                  disabled={loading === "addAttachments"}
                >
                  {loading === "addAttachments" ? "Ajout..." : "Ajouter les pièces jointes"}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}