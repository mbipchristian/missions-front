"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
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
  FileText,
  Users,
  MapPin,
  Package,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Types based on the Java DTOs
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
  code: string
  description?: string
  quantite: number
}

interface RapportResponseDto {
  id: number
  titre: string
  contenu: string
}

interface MandatDto {
  reference: string
  objectif: string
  missionDeControle: boolean
  dateDebut: Date | null
  dateFin: Date | null
  duree: number
  pieceJointe: File | null
  rapportId: number | null
  userIds: number[]
  ressourceIds: number[]
  villeIds: number[]
}

interface MandatResponseDto {
  id: number
  reference: string
  objectif: string
  missionDeControle: boolean
  dateDebut: Date 
  dateFin: Date
  duree: number
  pieceJointe: string
  created_at: string
  updated_at: string
  users: UserResponseDto[]
  villes: VilleResponseDto[]
  ressources: RessourceResponseDto[]
  rapport: RapportResponseDto | null
}

export default function Mandats() {
  const [mandats, setMandats] = useState<MandatResponseDto[]>([])
  const [users, setUsers] = useState<UserResponseDto[]>([])
  const [villes, setVilles] = useState<VilleResponseDto[]>([])
  const [ressources, setRessources] = useState<RessourceResponseDto[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMandat, setSelectedMandat] = useState<MandatResponseDto | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [formData, setFormData] = useState<MandatDto>({
    reference: "",
    objectif: "",
    missionDeControle: false,
    dateDebut: null,
    dateFin: null,
    duree: 0,
    pieceJointe: null,
    rapportId: null,
    userIds: [],
    ressourceIds: [],
    villeIds: [],
  })
  const [dateErrors, setDateErrors] = useState<string[]>([])
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
  }
  const handleDateFinChange = (date: Date | undefined) => {
    setFormData((prev) => ({ ...prev, dateFin: date || null }))
  }
  
  
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Fetch all mandats and related data on component mount
  useEffect(() => {
    fetchMandats()
    fetchUsers()
    fetchVilles()
    fetchRessources()
  }, [])

  // Fetch all mandats
  const fetchMandats = async () => {
    setLoading(true)
    try {
      const response = await fetch("http://localhost:8080/auth/mandats/all")
      if (!response.ok) {
        throw new Error("Failed to fetch mandats")
      }
      const data = await response.json()
      setMandats(data)
    } catch (error) {
      console.error("Error fetching mandats:", error)
      toast({
        title: "Error",
        description: "Failed to load mandats. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch active mandats
  const fetchActiveMandats = async () => {
    setLoading(true)
    try {
      const response = await fetch("http://localhost:8080/auth/mandats/active")
      if (!response.ok) {
        throw new Error("Failed to fetch active mandats")
      }
      const data = await response.json()
      setMandats(data)
    } catch (error) {
      console.error("Error fetching active mandats:", error)
      toast({
        title: "Error",
        description: "Failed to load active mandats. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:8080/auth/users/all")
      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Fetch all villes
  const fetchVilles = async () => {
    try {
      const response = await fetch("http://localhost:8080/auth/villes/all")
      if (!response.ok) {
        throw new Error("Failed to fetch villes")
      }
      const data = await response.json()
      setVilles(data)
    } catch (error) {
      console.error("Error fetching villes:", error)
      toast({
        title: "Error",
        description: "Failed to load villes. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Fetch all ressources
  const fetchRessources = async () => {
    try {
      const response = await fetch("http://localhost:8080/auth/ressources/all")
      if (!response.ok) {
        throw new Error("Failed to fetch ressources")
      }
      const data = await response.json()
      setRessources(data)
    } catch (error) {
      console.error("Error fetching ressources:", error)
      toast({
        title: "Error",
        description: "Failed to load ressources. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    if (value === "active") {
      fetchActiveMandats()
    } else {
      fetchMandats()
    }
  }

  // Create a new mandat
  const handleCreateMandat = async () => {
    // Validate form data
    if (!formData.reference.trim()) {
      toast({
        title: "Validation Error",
        description: "Reference is required",
        variant: "destructive",
      })
      return
    }

    if (!formData.objectif.trim()) {
      toast({
        title: "Validation Error",
        description: "Objective is required",
        variant: "destructive",
      })
      return
    }

    if (!formData.dateDebut) {
      toast({
        title: "Validation Error",
        description: "Start date is required",
        variant: "destructive",
      })
      return
    }

    if (!formData.dateFin) {
      toast({
        title: "Validation Error",
        description: "End date is required",
        variant: "destructive",
      })
      return
    }

    if (formData.userIds.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one user must be selected",
        variant: "destructive",
      })
      return
    }

    if (formData.villeIds.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one city must be selected",
        variant: "destructive",
      })
      return
    }

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("reference", formData.reference)
      formDataToSend.append("objectif", formData.objectif)
      formDataToSend.append("missionDeControle", formData.missionDeControle.toString())
      formDataToSend.append("dateDebut", formData.dateDebut?.toISOString() || "")
      formDataToSend.append("dateFin", formData.dateFin?.toISOString() || "")
      formDataToSend.append("duree", formData.duree.toString())
      if (formData.pieceJointe) {
        formDataToSend.append("pieceJointe", formData.pieceJointe)
      }
      formDataToSend.append("rapportId", formData.rapportId?.toString() || "")
      formData.userIds.forEach((id) => formDataToSend.append("userIds", id.toString()))
      formData.ressourceIds.forEach((id) => formDataToSend.append("ressourceIds", id.toString()))
      formData.villeIds.forEach((id) => formDataToSend.append("villeIds", id.toString()))

      const response = await fetch("http://localhost:8080/auth/mandats/create", {
        method: "POST",
        body: formDataToSend,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData || "Failed to create mandat")
      }

      toast({
        title: "Success",
        description: "Mandat created successfully",
      })

      setIsCreateDialogOpen(false)
      resetFormData()
      fetchMandats()
    } catch (error) {
      console.error("Error creating mandat:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create mandat",
        variant: "destructive",
      })
    }
  }

  // Update a mandat
  const handleUpdateMandat = async () => {
    if (!selectedMandat) return

    // Validate form data (same as create)
    if (!formData.reference.trim()) {
      toast({
        title: "Validation Error",
        description: "Reference is required",
        variant: "destructive",
      })
      return
    }

    if (!formData.objectif.trim()) {
      toast({
        title: "Validation Error",
        description: "Objective is required",
        variant: "destructive",
      })
      return
    }

    if (!formData.dateDebut) {
      toast({
        title: "Validation Error",
        description: "Start date is required",
        variant: "destructive",
      })
      return
    }

    if (!formData.dateFin) {
      toast({
        title: "Validation Error",
        description: "End date is required",
        variant: "destructive",
      })
      return
    }

    if (formData.userIds.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one user must be selected",
        variant: "destructive",
      })
      return
    }

    if (formData.villeIds.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one city must be selected",
        variant: "destructive",
      })
      return
    }

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("reference", formData.reference)
      formDataToSend.append("objectif", formData.objectif)
      formDataToSend.append("missionDeControle", formData.missionDeControle.toString())
      formDataToSend.append("dateDebut", formData.dateDebut?.toISOString() || "")
      formDataToSend.append("dateFin", formData.dateFin?.toISOString() || "")
      formDataToSend.append("duree", formData.duree.toString())
      if (formData.pieceJointe) {
        formDataToSend.append("pieceJointe", formData.pieceJointe)
      }
      formDataToSend.append("rapportId", formData.rapportId?.toString() || "")
      formData.userIds.forEach((id) => formDataToSend.append("userIds", id.toString()))
      formData.ressourceIds.forEach((id) => formDataToSend.append("ressourceIds", id.toString()))
      formData.villeIds.forEach((id) => formDataToSend.append("villeIds", id.toString()))

      const response = await fetch(`http://localhost:8080/auth/mandats/${selectedMandat.id}`, {
        method: "PUT",
        body: formDataToSend,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData || "Failed to update mandat")
      }

      toast({
        title: "Success",
        description: "Mandat updated successfully",
      })

      setIsEditDialogOpen(false)
      setSelectedMandat(null)
      resetFormData()
      fetchMandats()
    } catch (error) {
      console.error("Error updating mandat:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update mandat",
        variant: "destructive",
      })
    }
  }

  // Delete a mandat
  const handleDeleteMandat = async () => {
    if (!selectedMandat) return

    try {
      const response = await fetch(`http://localhost:8080/auth/mandats/${selectedMandat.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData || "Failed to delete mandat")
      }

      toast({
        title: "Success",
        description: "Mandat deleted successfully",
      })

      setIsDeleteDialogOpen(false)
      setSelectedMandat(null)
      fetchMandats()
    } catch (error) {
      console.error("Error deleting mandat:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete mandat",
        variant: "destructive",
      })
    }
  }

  // Reset form data
  const resetFormData = () => {
    setFormData({
      reference: "",
      objectif: "",
      missionDeControle: false,
      dateDebut: null,
      dateFin: null,
      duree: 1,
      pieceJointe: null,
      rapportId: null,
      userIds: [],
      ressourceIds: [],
      villeIds: [],
    })
  }

  // Open edit dialog and populate form
  const openEditDialog = (mandat: MandatResponseDto) => {
    setSelectedMandat(mandat)
    setFormData({
      reference: mandat.reference,
      objectif: mandat.objectif,
      missionDeControle: mandat.missionDeControle,
      dateDebut: new Date(mandat.dateDebut),
      dateFin: new Date(mandat.dateFin),
      duree: mandat.duree,
      pieceJointe: null, // Reset file input for editing
      rapportId: mandat.rapport?.id || null,
      userIds: mandat.users.map((user) => user.id),
      ressourceIds: mandat.ressources.map((ressource) => ressource.id),
      villeIds: mandat.villes.map((ville) => ville.id),
    })
    setIsEditDialogOpen(true)
  }

  // Open delete dialog
  const openDeleteDialog = (mandat: MandatResponseDto) => {
    setSelectedMandat(mandat)
    setIsDeleteDialogOpen(true)
  }

  // Open view dialog
  const openViewDialog = (mandat: MandatResponseDto) => {
    setSelectedMandat(mandat)
    setIsViewDialogOpen(true)
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR")
  }

  // Calculate status based on dates
  const calculateStatus = (dateDebut: string, dateFin: string) => {
    const now = new Date()
    const start = new Date(dateDebut)
    const end = new Date(dateFin)

    if (now < start) {
      return { label: "À venir", color: "bg-blue-100 text-blue-800" }
    } else if (now > end) {
      return { label: "Terminé", color: "bg-gray-100 text-gray-800" }
    } else {
      return { label: "En cours", color: "bg-green-100 text-green-800" }
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Mandats</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nouveau Mandat
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">Tous les Mandats</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Mandats</CardTitle>
          <CardDescription>Gérez vos mandats de mission</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : mandats.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              Aucun mandat trouvé. Créez un nouveau mandat pour commencer.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Référence</TableHead>
                  <TableHead>Objectif</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Durée (jours)</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Utilisateurs</TableHead>
                  <TableHead>Villes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mandats.map((mandat) => {
                  const status = calculateStatus(mandat.dateDebut.toString(), mandat.dateFin.toString())
                  return (
                    <TableRow key={mandat.id}>
                      <TableCell className="font-medium">{mandat.reference}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{mandat.objectif}</TableCell>
                      <TableCell>
                        {mandat.missionDeControle ? (
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                            Contrôle
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                            Standard
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">Début: {formatDate(mandat.dateDebut.toString())}</span>
                          <span className="text-xs text-muted-foreground">Fin: {formatDate(mandat.dateFin.toString())}</span>
                        </div>
                      </TableCell>
                      <TableCell>{mandat.duree}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={status.color}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex -space-x-2">
                          {mandat.users.slice(0, 3).map((user) => (
                            <div
                              key={user.id}
                              className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-medium"
                              title={user.username}
                            >
                              {user.username.substring(0, 2).toUpperCase()}
                            </div>
                          ))}
                          {mandat.users.length > 3 && (
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs">
                              +{mandat.users.length - 3}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {mandat.villes.slice(0, 2).map((ville) => (
                            <Badge key={ville.id} variant="outline">
                              {ville.name}
                            </Badge>
                          ))}
                          {mandat.villes.length > 2 && <Badge variant="outline">+{mandat.villes.length - 2}</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openViewDialog(mandat)}>
                              <FileText className="mr-2 h-4 w-4" /> Voir détails
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(mandat)}>
                              <Edit className="mr-2 h-4 w-4" /> Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openDeleteDialog(mandat)}>
                              <Trash className="mr-2 h-4 w-4" /> Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Mandat Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Créer un Nouveau Mandat</DialogTitle>
            <DialogDescription>Remplissez les détails pour le nouveau mandat de mission.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <div className="grid gap-6 py-4 px-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="reference">Référence *</Label>
                  <Input
                    id="reference"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="missionType">Type de Mission</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="missionType"
                      checked={formData.missionDeControle}
                      onCheckedChange={(checked) => setFormData({ ...formData, missionDeControle: checked as boolean })}
                    />
                    <label
                      htmlFor="missionType"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Mission de Contrôle
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="objectif">Objectif *</Label>
                <Textarea
                  id="objectif"
                  value={formData.objectif}
                  onChange={(e) => setFormData({ ...formData, objectif: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="dateDebut">Date de Début *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
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
                        }}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dateFin">Date de Fin *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
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
                        }}
                        disabled={(date) =>
                          formData.dateDebut
                            ? date < formData.dateDebut
                            : date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              

              <div className="grid gap-2">
                <Label htmlFor="duree">Durée (jours)</Label>
                <Input id="duree" type="number" value={formData.duree} readOnly className="bg-muted" />
                {formData.duree > 0 && (
                <p className="text-sm text-muted-foreground">
                  Du {formData.dateDebut && format(formData.dateDebut, "dd/MM/yyyy")} au{" "}
                  {formData.dateFin && format(formData.dateFin, "dd/MM/yyyy")} = {formData.duree} jour
                  {formData.duree > 1 ? "s" : ""}
                </p>
              )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="pieceJointe">Pièce Jointe (PDF)</Label>
                <Input
                  id="pieceJointe"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null
                    setFormData({ ...formData, pieceJointe: file })
                  }}
                  className="cursor-pointer"
                />
                {formData.pieceJointe && (
                  <p className="text-sm text-muted-foreground">Fichier sélectionné: {formData.pieceJointe.name}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Utilisateurs *
                </Label>
                <Select
                  value={formData.userIds.length > 0 ? formData.userIds[0].toString() : ""}
                  onValueChange={(value) => {
                    const userId = Number.parseInt(value)
                    if (!formData.userIds.includes(userId)) {
                      setFormData({ ...formData, userIds: [...formData.userIds, userId] })
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner des utilisateurs" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.username} ({user.matricule})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.userIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.userIds.map((userId) => {
                      const user = users.find((u) => u.id === userId)
                      return user ? (
                        <Badge key={userId} variant="secondary" className="flex items-center gap-1">
                          {user.username}
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                userIds: formData.userIds.filter((id) => id !== userId),
                              })
                            }
                            className="ml-1 text-xs hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      ) : null
                    })}
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Villes *
                </Label>
                <Select
                  value={formData.villeIds.length > 0 ? formData.villeIds[0].toString() : ""}
                  onValueChange={(value) => {
                    const villeId = Number.parseInt(value)
                    if (!formData.villeIds.includes(villeId)) {
                      setFormData({ ...formData, villeIds: [...formData.villeIds, villeId] })
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner des villes" />
                  </SelectTrigger>
                  <SelectContent>
                    {villes.map((ville) => (
                      <SelectItem key={ville.id} value={ville.id.toString()}>
                        {ville.name} ({ville.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.villeIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.villeIds.map((villeId) => {
                      const ville = villes.find((v) => v.id === villeId)
                      return ville ? (
                        <Badge key={villeId} variant="secondary" className="flex items-center gap-1">
                          {ville.name}
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                villeIds: formData.villeIds.filter((id) => id !== villeId),
                              })
                            }
                            className="ml-1 text-xs hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      ) : null
                    })}
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Ressources
                </Label>
                <Select
                  value={formData.ressourceIds.length > 0 ? formData.ressourceIds[0].toString() : ""}
                  onValueChange={(value) => {
                    const ressourceId = Number.parseInt(value)
                    if (!formData.ressourceIds.includes(ressourceId)) {
                      setFormData({ ...formData, ressourceIds: [...formData.ressourceIds, ressourceId] })
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner des ressources" />
                  </SelectTrigger>
                  <SelectContent>
                    {ressources.map((ressource) => (
                      <SelectItem key={ressource.id} value={ressource.id.toString()}>
                        {ressource.name} (Qté: {ressource.quantite})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.ressourceIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.ressourceIds.map((ressourceId) => {
                      const ressource = ressources.find((r) => r.id === ressourceId)
                      return ressource ? (
                        <Badge key={ressourceId} variant="secondary" className="flex items-center gap-1">
                          {ressource.name}
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                ressourceIds: formData.ressourceIds.filter((id) => id !== ressourceId),
                              })
                            }
                            className="ml-1 text-xs hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      ) : null
                    })}
                  </div>
                )}
              </div>

              <div className="text-sm text-muted-foreground">* Champs obligatoires</div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateMandat}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Mandat Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Modifier le Mandat</DialogTitle>
            <DialogDescription>Modifiez les détails du mandat.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <div className="grid gap-6 py-4 px-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-reference">Référence *</Label>
                  <Input
                    id="edit-reference"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-missionType">Type de Mission</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-missionType"
                      checked={formData.missionDeControle}
                      onCheckedChange={(checked) => setFormData({ ...formData, missionDeControle: checked as boolean })}
                    />
                    <label
                      htmlFor="edit-missionType"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Mission de Contrôle
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-objectif">Objectif *</Label>
                <Textarea
                  id="edit-objectif"
                  value={formData.objectif}
                  onChange={(e) => setFormData({ ...formData, objectif: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-dateDebut">Date de Début *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
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
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-dateFin">Date de Fin *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
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
                        }}
                        disabled={(date) => (formData.dateDebut ? date < formData.dateDebut : false)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-duree">Durée (jours) - Calculée automatiquement</Label>
                <Input id="edit-duree" type="number" value={formData.duree} readOnly className="bg-muted" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-pieceJointe">Pièce Jointe (PDF)</Label>
                <Input
                  id="edit-pieceJointe"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null
                    setFormData({ ...formData, pieceJointe: file })
                  }}
                  className="cursor-pointer"
                />
                {formData.pieceJointe && (
                  <p className="text-sm text-muted-foreground">Fichier sélectionné: {formData.pieceJointe.name}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Utilisateurs *
                </Label>
                <Select
                  value={formData.userIds.length > 0 ? formData.userIds[0].toString() : ""}
                  onValueChange={(value) => {
                    const userId = Number.parseInt(value)
                    if (!formData.userIds.includes(userId)) {
                      setFormData({ ...formData, userIds: [...formData.userIds, userId] })
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner des utilisateurs" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.username} ({user.matricule})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.userIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.userIds.map((userId) => {
                      const user = users.find((u) => u.id === userId)
                      return user ? (
                        <Badge key={userId} variant="secondary" className="flex items-center gap-1">
                          {user.username}
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                userIds: formData.userIds.filter((id) => id !== userId),
                              })
                            }
                            className="ml-1 text-xs hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      ) : null
                    })}
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Villes *
                </Label>
                <Select
                  value={formData.villeIds.length > 0 ? formData.villeIds[0].toString() : ""}
                  onValueChange={(value) => {
                    const villeId = Number.parseInt(value)
                    if (!formData.villeIds.includes(villeId)) {
                      setFormData({ ...formData, villeIds: [...formData.villeIds, villeId] })
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner des villes" />
                  </SelectTrigger>
                  <SelectContent>
                    {villes.map((ville) => (
                      <SelectItem key={ville.id} value={ville.id.toString()}>
                        {ville.name} ({ville.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.villeIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.villeIds.map((villeId) => {
                      const ville = villes.find((v) => v.id === villeId)
                      return ville ? (
                        <Badge key={villeId} variant="secondary" className="flex items-center gap-1">
                          {ville.name}
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                villeIds: formData.villeIds.filter((id) => id !== villeId),
                              })
                            }
                            className="ml-1 text-xs hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      ) : null
                    })}
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Ressources
                </Label>
                <Select
                  value={formData.ressourceIds.length > 0 ? formData.ressourceIds[0].toString() : ""}
                  onValueChange={(value) => {
                    const ressourceId = Number.parseInt(value)
                    if (!formData.ressourceIds.includes(ressourceId)) {
                      setFormData({ ...formData, ressourceIds: [...formData.ressourceIds, ressourceId] })
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner des ressources" />
                  </SelectTrigger>
                  <SelectContent>
                    {ressources.map((ressource) => (
                      <SelectItem key={ressource.id} value={ressource.id.toString()}>
                        {ressource.name} (Qté: {ressource.quantite})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.ressourceIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.ressourceIds.map((ressourceId) => {
                      const ressource = ressources.find((r) => r.id === ressourceId)
                      return ressource ? (
                        <Badge key={ressourceId} variant="secondary" className="flex items-center gap-1">
                          {ressource.name}
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                ressourceIds: formData.ressourceIds.filter((id) => id !== ressourceId),
                              })
                            }
                            className="ml-1 text-xs hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      ) : null
                    })}
                  </div>
                )}
              </div>

              <div className="text-sm text-muted-foreground">* Champs obligatoires</div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateMandat}>Mettre à jour</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Mandat Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Détails du Mandat</DialogTitle>
            <DialogDescription>Informations complètes sur le mandat.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            {selectedMandat && (
              <div className="grid gap-6 py-4 px-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Référence</h3>
                    <p className="text-base">{selectedMandat.reference}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Type de Mission</h3>
                    <p className="text-base">
                      {selectedMandat.missionDeControle ? "Mission de Contrôle" : "Mission Standard"}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Objectif</h3>
                  <p className="text-base whitespace-pre-line">{selectedMandat.objectif}</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Date de Début</h3>
                    <p className="text-base">{formatDate(selectedMandat.dateDebut.toString())}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Date de Fin</h3>
                    <p className="text-base">{formatDate(selectedMandat.dateFin.toString())}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Durée (jours)</h3>
                    <p className="text-base">{selectedMandat.duree}</p>
                  </div>
                </div>

                {selectedMandat.pieceJointe && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Pièce Jointe</h3>
                    <a
                      href={selectedMandat.pieceJointe}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {selectedMandat.pieceJointe}
                    </a>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Utilisateurs Assignés</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedMandat.users.map((user) => (
                      <div key={user.id} className="flex items-center gap-2 p-2 border rounded-md">
                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-medium">
                          {user.username.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user.username}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Villes</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedMandat.villes.map((ville) => (
                      <Badge key={ville.id} variant="outline" className="px-3 py-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {ville.name} ({ville.code})
                      </Badge>
                    ))}
                  </div>
                </div>

                {selectedMandat.ressources.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Ressources</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedMandat.ressources.map((ressource) => (
                        <div key={ressource.id} className="flex items-center gap-2 p-2 border rounded-md">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{ressource.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {ressource.description ? `${ressource.description} - ` : ""}Qté: {ressource.quantite}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedMandat.rapport && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Rapport</h3>
                    <div className="p-4 border rounded-md">
                      <h4 className="font-medium">{selectedMandat.rapport.titre}</h4>
                      <p className="text-sm text-muted-foreground mt-2 whitespace-pre-line">
                        {selectedMandat.rapport.contenu}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Créé le</h3>
                    <p className="text-sm">{new Date(selectedMandat.created_at).toLocaleString("fr-FR")}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Dernière mise à jour</h3>
                    <p className="text-sm">{new Date(selectedMandat.updated_at).toLocaleString("fr-FR")}</p>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Mandat Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Cela supprimera définitivement le mandat
              {selectedMandat && ` "${selectedMandat.reference}"`} et toutes ses données associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMandat} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
