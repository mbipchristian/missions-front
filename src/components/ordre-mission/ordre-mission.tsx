"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarIcon, Plus, MoreVertical, Edit, Trash, RefreshCw, Eye, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Types based on the Java DTOs
interface OrdreMissionDto {
  reference: string
  objectif: string
  modePaiement: string
  devise: string
  tauxAvance: number
  dateDebut: Date | null
  dateFin: Date | null
  duree: number
  decompteTotal: number
  decompteAvance: number
  decompteRelicat: number
  pieceJointe: string
  mandatId: number
}

interface OrdreMissionResponseDto {
  id: number
  reference: string
  objectif: string
  modePaiement: string
  devise: string
  dateDebut: string
  dateFin: string
  durée: number
  tauxAvance: number
  decompteTotal: number
  decompteAvance: number
  decompteRelicat: number
  pieceJointe: string
  createdAt: string
  updatedAt: string
}

interface MandatResponseDto {
  id: number
  reference: string
  objectif: string
}

interface UserResponseDto {
  id: number
  username: string
  email: string
  matricule: string
  quotaAnnuel: number
}

export default function OrdresMissionPage() {
  const [ordresMission, setOrdresMission] = useState<OrdreMissionResponseDto[]>([])
  const [mandats, setMandats] = useState<MandatResponseDto[]>([])
  const [users, setUsers] = useState<UserResponseDto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [selectedMandatId, setSelectedMandatId] = useState<string>("")
  const [selectedOrdreMission, setSelectedOrdreMission] = useState<OrdreMissionResponseDto | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [formData, setFormData] = useState<OrdreMissionDto>({
    reference: "",
    objectif: "",
    modePaiement: "Virement",
    devise: "EUR",
    tauxAvance: 30,
    dateDebut: null,
    dateFin: null,
    duree: 1,
    decompteTotal: 0,
    decompteAvance: 0,
    decompteRelicat: 0,
    pieceJointe: "",
    mandatId: 0,
  })

  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Payment methods and currencies
  const paymentMethods = ["Virement", "Chèque", "Espèces", "Carte bancaire"]
  const currencies = ["EUR", "USD", "GBP", "CHF", "CAD"]

  // Fetch all data on component mount
  useEffect(() => {
    fetchOrdresMission()
    fetchMandats()
    fetchUsers()
  }, [])

  // Auto-calculate amounts when relevant fields change
  useEffect(() => {
    if (formData.decompteTotal && formData.tauxAvance) {
      const avance = Math.round((formData.decompteTotal * formData.tauxAvance) / 100)
      const relicat = formData.decompteTotal - avance
      setFormData((prev) => ({
        ...prev,
        decompteAvance: avance,
        decompteRelicat: relicat,
      }))
    }
  }, [formData.decompteTotal, formData.tauxAvance])

  // Auto-calculate duration when dates change
  useEffect(() => {
    if (formData.dateDebut && formData.dateFin) {
      const diffTime = Math.abs(formData.dateFin.getTime() - formData.dateDebut.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      setFormData((prev) => ({ ...prev, duree: diffDays }))
    }
  }, [formData.dateDebut, formData.dateFin])

  // Fetch all ordres mission
  const fetchOrdresMission = async () => {
    setLoading(true)
    try {
      const response = await fetch("http://localhost:8080/auth/ordres-mission/all")
      if (!response.ok) {
        throw new Error("Failed to fetch ordres mission")
      }
      const data = await response.json()
      setOrdresMission(data)
    } catch (error) {
      console.error("Error fetching ordres mission:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les ordres de mission. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch ordres mission by user
  const fetchOrdresMissionByUser = async (userId: string) => {
    if (!userId) {
      fetchOrdresMission()
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`http://localhost:8080/auth/ordres-mission/user/${userId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch ordres mission by user")
      }
      const data = await response.json()
      setOrdresMission(data)
    } catch (error) {
      console.error("Error fetching ordres mission by user:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les ordres de mission pour cet utilisateur.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch ordres mission by mandat
  const fetchOrdresMissionByMandat = async (mandatId: string) => {
    if (!mandatId) {
      fetchOrdresMission()
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`http://localhost:8080/auth/ordres-mission/mandat/${mandatId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch ordres mission by mandat")
      }
      const data = await response.json()
      setOrdresMission(data)
    } catch (error) {
      console.error("Error fetching ordres mission by mandat:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les ordres de mission pour ce mandat.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch mandats
  const fetchMandats = async () => {
    try {
      const response = await fetch("http://localhost:8080/auth/mandats")
      if (!response.ok) {
        throw new Error("Failed to fetch mandats")
      }
      const data = await response.json()
      setMandats(data)
    } catch (error) {
      console.error("Error fetching mandats:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les mandats.",
        variant: "destructive",
      })
    }
  }

  // Fetch users
  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:8080/auth/users")
      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs.",
        variant: "destructive",
      })
    }
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    if (value === "all") {
      fetchOrdresMission()
    } else if (value === "user" && selectedUserId) {
      fetchOrdresMissionByUser(selectedUserId)
    } else if (value === "mandat" && selectedMandatId) {
      fetchOrdresMissionByMandat(selectedMandatId)
    }
  }

  // Create ordre mission
  const handleCreateOrdreMission = async () => {
    // Validation
    if (!formData.reference.trim()) {
      toast({
        title: "Erreur de validation",
        description: "La référence est obligatoire",
        variant: "destructive",
      })
      return
    }

    if (!formData.objectif.trim()) {
      toast({
        title: "Erreur de validation",
        description: "L'objectif est obligatoire",
        variant: "destructive",
      })
      return
    }

    if (!formData.dateDebut || !formData.dateFin) {
      toast({
        title: "Erreur de validation",
        description: "Les dates de début et de fin sont obligatoires",
        variant: "destructive",
      })
      return
    }

    if (formData.mandatId === 0) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez sélectionner un mandat",
        variant: "destructive",
      })
      return
    }

    if (!selectedUserId) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez sélectionner un utilisateur",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`http://localhost:8080/auth/ordres-mission/user/${selectedUserId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create ordre mission")
      }

      toast({
        title: "Succès",
        description: "Ordre de mission créé avec succès",
      })

      // Mettre à jour le quota annuel de l'utilisateur
      try {
        await fetch(`http://localhost:8080/auth/users/${selectedUserId}/quota`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ duree: formData.duree }),
        })
      } catch (error) {
        console.error("Error updating user quota:", error)
        // Ne pas empêcher la création même si la mise à jour du quota échoue
      }

      setIsCreateDialogOpen(false)
      resetFormData()
      fetchOrdresMission()
    } catch (error) {
      console.error("Error creating ordre mission:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de créer l'ordre de mission",
        variant: "destructive",
      })
    }
  }

  // Update ordre mission
  const handleUpdateOrdreMission = async () => {
    if (!selectedOrdreMission) return

    // Same validation as create
    if (!formData.reference.trim()) {
      toast({
        title: "Erreur de validation",
        description: "La référence est obligatoire",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`http://localhost:8080/auth/ordres-mission/${selectedOrdreMission.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userId: selectedUserId ? Number.parseInt(selectedUserId) : undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update ordre mission")
      }

      toast({
        title: "Succès",
        description: "Ordre de mission mis à jour avec succès",
      })

      setIsEditDialogOpen(false)
      setSelectedOrdreMission(null)
      resetFormData()
      fetchOrdresMission()
    } catch (error) {
      console.error("Error updating ordre mission:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de mettre à jour l'ordre de mission",
        variant: "destructive",
      })
    }
  }

  // Delete ordre mission
  const handleDeleteOrdreMission = async () => {
    if (!selectedOrdreMission) return

    try {
      const response = await fetch(`http://localhost:8080/auth/ordres-mission/${selectedOrdreMission.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete ordre mission")
      }

      toast({
        title: "Succès",
        description: "Ordre de mission supprimé avec succès",
      })

      setIsDeleteDialogOpen(false)
      setSelectedOrdreMission(null)
      fetchOrdresMission()
    } catch (error) {
      console.error("Error deleting ordre mission:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de supprimer l'ordre de mission",
        variant: "destructive",
      })
    }
  }

  // Reset form data
  const resetFormData = () => {
    setFormData({
      reference: "",
      objectif: "",
      modePaiement: "Virement",
      devise: "EUR",
      tauxAvance: 30,
      dateDebut: null,
      dateFin: null,
      duree: 1,
      decompteTotal: 0,
      decompteAvance: 0,
      decompteRelicat: 0,
      pieceJointe: "",
      mandatId: 0,
    })
    setSelectedUserId("")
  }

  // Open edit dialog
  const openEditDialog = (ordreMission: OrdreMissionResponseDto) => {
    setSelectedOrdreMission(ordreMission)
    setFormData({
      reference: ordreMission.reference,
      objectif: ordreMission.objectif,
      modePaiement: ordreMission.modePaiement,
      devise: ordreMission.devise,
      tauxAvance: ordreMission.tauxAvance,
      dateDebut: new Date(ordreMission.dateDebut),
      dateFin: new Date(ordreMission.dateFin),
      duree: ordreMission.durée,
      decompteTotal: ordreMission.decompteTotal,
      decompteAvance: ordreMission.decompteAvance,
      decompteRelicat: ordreMission.decompteRelicat,
      pieceJointe: ordreMission.pieceJointe,
      mandatId: 0, // This would need to be fetched from the backend
    })
    setIsEditDialogOpen(true)
  }

  // Open delete dialog
  const openDeleteDialog = (ordreMission: OrdreMissionResponseDto) => {
    setSelectedOrdreMission(ordreMission)
    setIsDeleteDialogOpen(true)
  }

  // Open view dialog
  const openViewDialog = (ordreMission: OrdreMissionResponseDto) => {
    setSelectedOrdreMission(ordreMission)
    setIsViewDialogOpen(true)
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR")
  }

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  // Get status based on dates
  const getStatus = (dateDebut: string, dateFin: string) => {
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
        <h1 className="text-3xl font-bold">Gestion des Ordres de Mission</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nouvel Ordre de Mission
        </Button>
      </div>

      {/* Filter Tabs */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
          <CardDescription>Filtrez les ordres de mission par critère</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">Tous</TabsTrigger>
              <TabsTrigger value="user">Par Utilisateur</TabsTrigger>
              <TabsTrigger value="mandat">Par Mandat</TabsTrigger>
            </TabsList>
            <TabsContent value="user">
              <div className="flex gap-2">
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Sélectionner un utilisateur" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.username} ({user.matricule})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={() => fetchOrdresMissionByUser(selectedUserId)} disabled={!selectedUserId}>
                  <Search className="mr-2 h-4 w-4" /> Filtrer
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="mandat">
              <div className="flex gap-2">
                <Select value={selectedMandatId} onValueChange={setSelectedMandatId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Sélectionner un mandat" />
                  </SelectTrigger>
                  <SelectContent>
                    {mandats.map((mandat) => (
                      <SelectItem key={mandat.id} value={mandat.id.toString()}>
                        {mandat.reference} - {mandat.objectif}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={() => fetchOrdresMissionByMandat(selectedMandatId)} disabled={!selectedMandatId}>
                  <Search className="mr-2 h-4 w-4" /> Filtrer
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Ordres de Mission</CardTitle>
          <CardDescription>Gérez vos ordres de mission</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : ordresMission.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              Aucun ordre de mission trouvé. Créez un nouvel ordre de mission pour commencer.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Référence</TableHead>
                  <TableHead>Objectif</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Durée</TableHead>
                  <TableHead>Paiement</TableHead>
                  <TableHead>Montants</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordresMission.map((ordre) => {
                  const status = getStatus(ordre.dateDebut, ordre.dateFin)
                  return (
                    <TableRow key={ordre.id}>
                      <TableCell className="font-medium">{ordre.reference}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{ordre.objectif}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">Début: {formatDate(ordre.dateDebut)}</span>
                          <span className="text-xs text-muted-foreground">Fin: {formatDate(ordre.dateFin)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{ordre.durée} jours</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">{ordre.modePaiement}</span>
                          <span className="text-xs text-muted-foreground">{ordre.devise}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            Total: {formatCurrency(ordre.decompteTotal, ordre.devise)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Avance: {formatCurrency(ordre.decompteAvance, ordre.devise)} ({ordre.tauxAvance}%)
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={status.color}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Ouvrir le menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openViewDialog(ordre)}>
                              <Eye className="mr-2 h-4 w-4" /> Voir détails
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(ordre)}>
                              <Edit className="mr-2 h-4 w-4" /> Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openDeleteDialog(ordre)}>
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

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Créer un Nouvel Ordre de Mission</DialogTitle>
            <DialogDescription>Remplissez les détails pour le nouvel ordre de mission.</DialogDescription>
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
                  <Label htmlFor="user">Utilisateur *</Label>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un utilisateur" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.username} ({user.matricule})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

              <div className="grid gap-2">
                <Label htmlFor="mandat">Mandat *</Label>
                <Select
                  value={formData.mandatId.toString()}
                  onValueChange={(value) => setFormData({ ...formData, mandatId: Number.parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un mandat" />
                  </SelectTrigger>
                  <SelectContent>
                    {mandats.map((mandat) => (
                      <SelectItem key={mandat.id} value={mandat.id.toString()}>
                        {mandat.reference} - {mandat.objectif}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.dateDebut || undefined}
                        onSelect={(date) => setFormData({ ...formData, dateDebut: date || null })}
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
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.dateFin || undefined}
                        onSelect={(date) => setFormData({ ...formData, dateFin: date || null })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="duree">Durée (jours)</Label>
                  <Input
                    id="duree"
                    type="number"
                    min="1"
                    value={formData.duree}
                    onChange={(e) => setFormData({ ...formData, duree: Number.parseInt(e.target.value) || 1 })}
                    disabled
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="modePaiement">Mode de Paiement</Label>
                  <Select
                    value={formData.modePaiement}
                    onValueChange={(value) => setFormData({ ...formData, modePaiement: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="devise">Devise</Label>
                  <Select
                    value={formData.devise}
                    onValueChange={(value) => setFormData({ ...formData, devise: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="decompteTotal">Décompte Total</Label>
                  <Input
                    id="decompteTotal"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.decompteTotal}
                    onChange={(e) =>
                      setFormData({ ...formData, decompteTotal: Number.parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tauxAvance">Taux d'Avance (%)</Label>
                  <Input
                    id="tauxAvance"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.tauxAvance}
                    onChange={(e) => setFormData({ ...formData, tauxAvance: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="decompteAvance">Décompte Avance</Label>
                  <Input
                    id="decompteAvance"
                    type="number"
                    value={formData.decompteAvance}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="decompteRelicat">Décompte Relicat</Label>
                  <Input
                    id="decompteRelicat"
                    type="number"
                    value={formData.decompteRelicat}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="pieceJointe">Pièce Jointe (URL)</Label>
                <Input
                  id="pieceJointe"
                  value={formData.pieceJointe}
                  onChange={(e) => setFormData({ ...formData, pieceJointe: e.target.value })}
                  placeholder="https://example.com/document.pdf"
                />
              </div>

              <div className="text-sm text-muted-foreground">* Champs obligatoires</div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateOrdreMission}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Modifier l'Ordre de Mission</DialogTitle>
            <DialogDescription>Modifiez les détails de l'ordre de mission.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <div className="grid gap-6 py-4 px-1">
              {/* Same form fields as create dialog */}
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
                  <Label htmlFor="edit-user">Utilisateur</Label>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un utilisateur" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.username} ({user.matricule})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

              {/* Rest of the form fields similar to create dialog */}
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
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.dateDebut || undefined}
                        onSelect={(date) => setFormData({ ...formData, dateDebut: date || null })}
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
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.dateFin || undefined}
                        onSelect={(date) => setFormData({ ...formData, dateFin: date || null })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-duree">Durée (jours)</Label>
                  <Input id="edit-duree" type="number" min="1" value={formData.duree} disabled className="bg-muted" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-modePaiement">Mode de Paiement</Label>
                  <Select
                    value={formData.modePaiement}
                    onValueChange={(value) => setFormData({ ...formData, modePaiement: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-devise">Devise</Label>
                  <Select
                    value={formData.devise}
                    onValueChange={(value) => setFormData({ ...formData, devise: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-decompteTotal">Décompte Total</Label>
                  <Input
                    id="edit-decompteTotal"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.decompteTotal}
                    onChange={(e) =>
                      setFormData({ ...formData, decompteTotal: Number.parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-tauxAvance">Taux d'Avance (%)</Label>
                  <Input
                    id="edit-tauxAvance"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.tauxAvance}
                    onChange={(e) => setFormData({ ...formData, tauxAvance: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-decompteAvance">Décompte Avance</Label>
                  <Input
                    id="edit-decompteAvance"
                    type="number"
                    value={formData.decompteAvance}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-decompteRelicat">Décompte Relicat</Label>
                  <Input
                    id="edit-decompteRelicat"
                    type="number"
                    value={formData.decompteRelicat}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-pieceJointe">Pièce Jointe (URL)</Label>
                <Input
                  id="edit-pieceJointe"
                  value={formData.pieceJointe}
                  onChange={(e) => setFormData({ ...formData, pieceJointe: e.target.value })}
                  placeholder="https://example.com/document.pdf"
                />
              </div>

              <div className="text-sm text-muted-foreground">* Champs obligatoires</div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateOrdreMission}>Mettre à jour</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Détails de l'Ordre de Mission</DialogTitle>
            <DialogDescription>Informations complètes sur l'ordre de mission.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            {selectedOrdreMission && (
              <div className="grid gap-6 py-4 px-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Référence</h3>
                    <p className="text-base">{selectedOrdreMission.reference}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Statut</h3>
                    <Badge
                      variant="outline"
                      className={getStatus(selectedOrdreMission.dateDebut, selectedOrdreMission.dateFin).color}
                    >
                      {getStatus(selectedOrdreMission.dateDebut, selectedOrdreMission.dateFin).label}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Objectif</h3>
                  <p className="text-base whitespace-pre-line">{selectedOrdreMission.objectif}</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Date de Début</h3>
                    <p className="text-base">{formatDate(selectedOrdreMission.dateDebut)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Date de Fin</h3>
                    <p className="text-base">{formatDate(selectedOrdreMission.dateFin)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Durée</h3>
                    <p className="text-base">{selectedOrdreMission.durée} jours</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Mode de Paiement</h3>
                    <p className="text-base">{selectedOrdreMission.modePaiement}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Devise</h3>
                    <p className="text-base">{selectedOrdreMission.devise}</p>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Détails Financiers</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium">Décompte Total</h4>
                      <p className="text-lg font-semibold text-primary">
                        {formatCurrency(selectedOrdreMission.decompteTotal, selectedOrdreMission.devise)}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Taux d'Avance</h4>
                      <p className="text-lg font-semibold">{selectedOrdreMission.tauxAvance}%</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Décompte Avance</h4>
                      <p className="text-lg font-semibold text-green-600">
                        {formatCurrency(selectedOrdreMission.decompteAvance, selectedOrdreMission.devise)}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Décompte Relicat</h4>
                      <p className="text-lg font-semibold text-orange-600">
                        {formatCurrency(selectedOrdreMission.decompteRelicat, selectedOrdreMission.devise)}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedOrdreMission.pieceJointe && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Pièce Jointe</h3>
                    <a
                      href={selectedOrdreMission.pieceJointe}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {selectedOrdreMission.pieceJointe}
                    </a>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Créé le</h3>
                    <p className="text-sm">{new Date(selectedOrdreMission.createdAt).toLocaleString("fr-FR")}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Dernière mise à jour</h3>
                    <p className="text-sm">{new Date(selectedOrdreMission.updatedAt).toLocaleString("fr-FR")}</p>
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

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Cela supprimera définitivement l'ordre de mission
              {selectedOrdreMission && ` "${selectedOrdreMission.reference}"`} et toutes ses données associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOrdreMission}
              className="bg-destructive text-destructive-foreground"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
