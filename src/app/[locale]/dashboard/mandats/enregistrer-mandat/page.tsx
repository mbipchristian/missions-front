"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Users,
  MapPin,
  Package,
  CheckCircle,
  AlertCircle,
  Clock,
  Target,
  Search,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
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

export default function EnregistrerMandatPage() {
  const router = useRouter()
  const onBack = () => router.back()
  const onSuccess = () => router.back()
  const [users, setUsers] = useState<UserResponseDto[]>([])
  const [villes, setVilles] = useState<VilleResponseDto[]>([])
  const [ressources, setRessources] = useState<RessourceResponseDto[]>([])
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([])
  const [createdMandat, setCreatedMandat] = useState<CreatedMandat | null>(null)
  const [isAttachmentDialogOpen, setIsAttachmentDialogOpen] = useState(false)
  const [currentTab, setCurrentTab] = useState("informations")
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

  const [searchUsers, setSearchUsers] = useState("")
  const [searchVilles, setSearchVilles] = useState("")
  const [searchRessources, setSearchRessources] = useState("")

  // Calculate completion progress
  const getCompletionProgress = () => {
    let completed = 0
    const total = 5 // Total required sections

    if (formData.reference.trim()) completed++
    if (formData.dateDebut && formData.dateFin && dateErrors.length === 0) completed++
    if (formData.objectif?.trim()) completed++
    if (formData.userIds.length > 0) completed++
    if (formData.villeIds.length > 0) completed++

    return (completed / total) * 100
  }

  // Validation functions
  const isInformationsValid = () => {
    return formData.reference.trim() && formData.objectif?.trim()
  }

  const isDatesValid = () => {
    return formData.dateDebut && formData.dateFin && dateErrors.length === 0
  }

  const isUsersValid = () => {
    return formData.userIds.length > 0
  }

  const isVillesValid = () => {
    return formData.villeIds.length > 0
  }

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
        duree = differenceInDays(fin, debut)
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

  const addAttachmentFile = (file: File) => {
    setAttachmentFiles((prev) => [...prev, file])
  }

  const removeAttachmentFile = (index: number) => {
    setAttachmentFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleAddAttachments = async () => {
    if (attachmentFiles.length === 0 || !createdMandat) {
      setIsAttachmentDialogOpen(false)
      resetFormAndGoBack()
      return
    }

    try {
      setLoading("addAttachments")

      for (let i = 0; i < attachmentFiles.length; i++) {
        const file = attachmentFiles[i]
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
        description: `Erreur lors de l'ajout des pièces jointes: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
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
    setCurrentTab("informations")
    router.back()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Filter functions
  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchUsers.toLowerCase()) ||
      user.email.toLowerCase().includes(searchUsers.toLowerCase()) ||
      user.matricule.toLowerCase().includes(searchUsers.toLowerCase()),
  )

  const filteredVilles = villes.filter(
    (ville) =>
      ville.name.toLowerCase().includes(searchVilles.toLowerCase()) ||
      ville.code.toLowerCase().includes(searchVilles.toLowerCase()),
  )

  const filteredRessources = ressources.filter((ressource) =>
    ressource.name.toLowerCase().includes(searchRessources.toLowerCase()),
  )

  const handleCreateMandat = async () => {
    // Validate form data
    if (!formData.reference.trim()) {
      toast({
        title: "Erreur de validation",
        description: "La référence est obligatoire",
        variant: "destructive",
      })
      setCurrentTab("informations")
      return
    }

    if (!formData.dateDebut || !formData.dateFin) {
      toast({
        title: "Erreur de validation",
        description: "Les dates de début et fin sont obligatoires",
        variant: "destructive",
      })
      setCurrentTab("dates")
      return
    }

    if (dateErrors.length > 0) {
      toast({
        title: "Erreur de validation",
        description: dateErrors[0],
        variant: "destructive",
      })
      setCurrentTab("dates")
      return
    }

    if (formData.userIds.length === 0) {
      toast({
        title: "Erreur de validation",
        description: "Au moins un utilisateur doit être sélectionné",
        variant: "destructive",
      })
      setCurrentTab("utilisateurs")
      return
    }

    if (formData.villeIds.length === 0) {
      toast({
        title: "Erreur de validation",
        description: "Au moins une ville doit être sélectionnée",
        variant: "destructive",
      })
      setCurrentTab("villes")
      return
    }

    try {
      setLoading("createMandat")

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

      const response = await fetch("http://localhost:8080/auth/mandats/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        let errorMessage = "Échec de création du mandat"
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch (e) {
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()
      setCreatedMandat(result)

      toast({
        title: "Succès",
        description: "Mandat créé avec succès",
      })

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

  const canProceedToNext = (tab: string) => {
    switch (tab) {
      case "informations":
        return isInformationsValid()
      case "dates":
        return isDatesValid()
      case "utilisateurs":
        return isUsersValid()
      case "villes":
        return isVillesValid()
      default:
        return true
    }
  }

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Nouveau Mandat</h1>
          <p className="text-muted-foreground">Enrégistrez un nouveau mandat de mission en quelques étapes</p>
        </div>
      </div>

      {/* Progress indicator */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progression du formulaire</span>
              <span>{Math.round(getCompletionProgress())}% complété</span>
            </div>
            <Progress value={getCompletionProgress()} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="informations" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">Informations</span>
                {isInformationsValid() && <CheckCircle className="h-3 w-3 text-green-500" />}
              </TabsTrigger>
              <TabsTrigger value="dates" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">Dates</span>
                {isDatesValid() && <CheckCircle className="h-3 w-3 text-green-500" />}
              </TabsTrigger>
              <TabsTrigger value="utilisateurs" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Équipe</span>
                {isUsersValid() && <CheckCircle className="h-3 w-3 text-green-500" />}
              </TabsTrigger>
              <TabsTrigger value="villes" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Lieux</span>
                {isVillesValid() && <CheckCircle className="h-3 w-3 text-green-500" />}
              </TabsTrigger>
              <TabsTrigger value="ressources" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Ressources</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="informations" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Informations générales</h3>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="reference" className="flex items-center gap-2">
                        Référence du mandat
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="reference"
                        value={formData.reference}
                        onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                        placeholder="Ex: MANDAT-2024-001"
                        className="max-w-md"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="objectif" className="flex items-center gap-2">
                        Objectif de la mission
                        <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="objectif"
                        value={formData.objectif}
                        onChange={(e) => setFormData({ ...formData, objectif: e.target.value })}
                        placeholder="Décrivez l'objectif et le contexte de cette mission..."
                        rows={4}
                        className="resize-none"
                      />
                    </div>

                    <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg">
                      <Checkbox
                        id="missionDeControle"
                        checked={formData.missionDeControle}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, missionDeControle: checked as boolean })
                        }
                      />
                      <Label htmlFor="missionDeControle" className="text-sm font-medium">
                        Mission de contrôle
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="dates" className="space-y-6 mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Planification temporelle</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      Date de début
                      <span className="text-red-500">*</span>
                    </Label>
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
                          onSelect={handleDateDebutChange}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                          locale={fr}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      Date de fin
                      <span className="text-red-500">*</span>
                    </Label>
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
                          onSelect={handleDateFinChange}
                          disabled={(date) =>
                            formData.dateDebut
                              ? date < formData.dateDebut
                              : date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                          locale={fr}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {formData.duree > 0 && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-800">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">
                        Durée: {formData.duree} jour{formData.duree > 1 ? "s" : ""}
                      </span>
                    </div>
                    <p className="text-sm text-blue-600 mt-1">
                      Du {formData.dateDebut && format(formData.dateDebut, "dd/MM/yyyy")} au{" "}
                      {formData.dateFin && format(formData.dateFin, "dd/MM/yyyy")}
                    </p>
                  </div>
                )}

                {dateErrors.length > 0 && (
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <div className="flex items-center gap-2 text-red-800 mb-2">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">Erreurs de validation</span>
                    </div>
                    <div className="text-sm text-red-600 space-y-1">
                      {dateErrors.map((error, index) => (
                        <p key={index}>• {error}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="utilisateurs" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Équipe de mission
                    <span className="text-red-500">*</span>
                  </h3>
                  {formData.userIds.length > 0 && (
                    <Badge variant="secondary">
                      {formData.userIds.length} sélectionné{formData.userIds.length > 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>

                {/* Barre de recherche pour les utilisateurs */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Rechercher par nom, email ou matricule..."
                    value={searchUsers}
                    onChange={(e) => setSearchUsers(e.target.value)}
                    className="pl-10"
                  />
                  {searchUsers && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                      onClick={() => setSearchUsers("")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                <ScrollArea className="h-[300px] border rounded-lg p-4">
                  <div className="space-y-3">
                    {filteredUsers.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Aucun utilisateur trouvé</p>
                        {searchUsers && <p className="text-sm">Essayez de modifier votre recherche</p>}
                      </div>
                    ) : (
                      filteredUsers.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center space-x-3 p-3 hover:bg-muted/50 rounded-lg transition-colors"
                        >
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
                          <div className="flex-1">
                            <label htmlFor={`user-${user.id}`} className="text-sm font-medium cursor-pointer">
                              {user.username}
                            </label>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                            <p className="text-xs text-muted-foreground">Matricule: {user.matricule}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>

                {searchUsers && (
                  <p className="text-sm text-muted-foreground">
                    {filteredUsers.length} résultat{filteredUsers.length > 1 ? "s" : ""} sur {users.length} utilisateur
                    {users.length > 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="villes" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Lieux de mission
                    <span className="text-red-500">*</span>
                  </h3>
                  {formData.villeIds.length > 0 && (
                    <Badge variant="secondary">
                      {formData.villeIds.length} sélectionnée{formData.villeIds.length > 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>

                {/* Barre de recherche pour les villes */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Rechercher par nom de ville ou code..."
                    value={searchVilles}
                    onChange={(e) => setSearchVilles(e.target.value)}
                    className="pl-10"
                  />
                  {searchVilles && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                      onClick={() => setSearchVilles("")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                <ScrollArea className="h-[300px] border rounded-lg p-4">
                  <div className="space-y-3">
                    {filteredVilles.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Aucune ville trouvée</p>
                        {searchVilles && <p className="text-sm">Essayez de modifier votre recherche</p>}
                      </div>
                    ) : (
                      filteredVilles.map((ville) => (
                        <div
                          key={ville.id}
                          className="flex items-center space-x-3 p-3 hover:bg-muted/50 rounded-lg transition-colors"
                        >
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
                          <div className="flex-1">
                            <label htmlFor={`ville-${ville.id}`} className="text-sm font-medium cursor-pointer">
                              {ville.name}
                            </label>
                            <p className="text-xs text-muted-foreground">Code: {ville.code}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>

                {searchVilles && (
                  <p className="text-sm text-muted-foreground">
                    {filteredVilles.length} résultat{filteredVilles.length > 1 ? "s" : ""} sur {villes.length} ville
                    {villes.length > 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="ressources" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Ressources nécessaires
                    <span className="text-muted-foreground text-sm font-normal"></span>
                  </h3>
                  {formData.ressourceIds.length > 0 && (
                    <Badge variant="secondary">
                      {formData.ressourceIds.length} sélectionnée{formData.ressourceIds.length > 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>

                {/* Barre de recherche pour les ressources */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Rechercher une ressource..."
                    value={searchRessources}
                    onChange={(e) => setSearchRessources(e.target.value)}
                    className="pl-10"
                  />
                  {searchRessources && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                      onClick={() => setSearchRessources("")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                <ScrollArea className="h-[300px] border rounded-lg p-4">
                  <div className="space-y-3">
                    {filteredRessources.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Aucune ressource trouvée</p>
                        {searchRessources && <p className="text-sm">Essayez de modifier votre recherche</p>}
                      </div>
                    ) : (
                      filteredRessources.map((ressource) => (
                        <div
                          key={ressource.id}
                          className="flex items-center space-x-3 p-3 hover:bg-muted/50 rounded-lg transition-colors"
                        >
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
                          <div className="flex-1">
                            <label htmlFor={`ressource-${ressource.id}`} className="text-sm font-medium cursor-pointer">
                              {ressource.name}
                            </label>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>

                {searchRessources && (
                  <p className="text-sm text-muted-foreground">
                    {filteredRessources.length} résultat{filteredRessources.length > 1 ? "s" : ""} sur{" "}
                    {ressources.length} ressource{ressources.length > 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <Separator className="my-6" />

          {/* Navigation and actions */}
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={onBack}>
              Annuler
            </Button>

            <div className="flex gap-2">
              {currentTab !== "informations" && (
                <Button
                  variant="outline"
                  onClick={() => {
                    const tabs = ["informations", "dates", "utilisateurs", "villes", "ressources"]
                    const currentIndex = tabs.indexOf(currentTab)
                    if (currentIndex > 0) {
                      setCurrentTab(tabs[currentIndex - 1])
                    }
                  }}
                >
                  Précédent
                </Button>
              )}

              {currentTab !== "ressources" ? (
                <Button
                  onClick={() => {
                    const tabs = ["informations", "dates", "utilisateurs", "villes", "ressources"]
                    const currentIndex = tabs.indexOf(currentTab)
                    if (currentIndex < tabs.length - 1) {
                      setCurrentTab(tabs[currentIndex + 1])
                    }
                  }}
                  disabled={!canProceedToNext(currentTab)}
                >
                  Suivant
                </Button>
              ) : (
                <Button
                  onClick={handleCreateMandat}
                  disabled={
                    loading === "createMandat" ||
                    !isInformationsValid() ||
                    !isDatesValid() ||
                    !isUsersValid() ||
                    !isVillesValid()
                  }
                  className="min-w-[140px]"
                >
                  {loading === "createMandat" ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Création...
                    </>
                  ) : (
                    "Créer le mandat"
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog pour les pièces jointes */}
      <Dialog
        open={isAttachmentDialogOpen}
        onOpenChange={(open) => {
          if (!open && createdMandat) {
            handleSkipAttachments()
          } else {
            setIsAttachmentDialogOpen(open)
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Ajouter des pièces jointes
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="space-y-2">
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-lg font-medium text-blue-600 hover:text-blue-500">
                    Cliquez pour sélectionner des fichiers
                  </span>
                </Label>
                <p className="text-sm text-gray-500">ou glissez-déposez vos fichiers ici</p>
                <Input
                  id="file-upload"
                  type="file"
                  multiple
                  onChange={(e) => {
                    const files = e.target.files
                    if (files) {
                      Array.from(files).forEach((file) => {
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
              <p className="text-xs text-gray-500 mt-4">
                Formats acceptés: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (max. 10MB par fichier)
              </p>
            </div>

            {attachmentFiles.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Fichiers sélectionnés ({attachmentFiles.length})
                </h4>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {attachmentFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
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

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={handleSkipAttachments} disabled={loading === "addAttachments"}>
                {attachmentFiles.length > 0 ? "Ignorer les pièces jointes" : "Terminer sans pièces jointes"}
              </Button>
              {attachmentFiles.length > 0 && (
                <Button onClick={handleAddAttachments} disabled={loading === "addAttachments"}>
                  {loading === "addAttachments" ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Ajout...
                    </>
                  ) : (
                    "Ajouter les pièces jointes"
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
