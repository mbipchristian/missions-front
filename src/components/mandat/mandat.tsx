"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
  Eye,
  FileDown,
  ListTodo,
  Paperclip,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Users, MapPin, Package } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { EtapesManagement } from "@/components/etapes/etapes"
import { PiecesJointesManagement } from "@/components/pieces-jointes"
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

interface MandatDetails {
  id: string
  reference: string
  objectif?: string
  dateDebut: Date
  dateFin: Date
  duree: number
  missionDeControle: boolean
  created_at: string
  updated_at: string
  users: UserResponseDto[]
  villes: VilleResponseDto[]
  ressources: RessourceResponseDto[]
}

interface Mandat {
  id: string
  reference: string
  objectif?: string
  dateDebut: Date
  dateFin: Date
  duree: number
}

// Composant Modal pour les détails du mandat
function MandatDetailsModal({
  mandatId,
  isOpen,
  onClose,
}: { mandatId: string | null; isOpen: boolean; onClose: () => void }) {
  const [mandatDetails, setMandatDetails] = useState<MandatDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen && mandatId) {
      fetchMandatDetails(mandatId)
    }
  }, [isOpen, mandatId])

  const fetchMandatDetails = async (id: string) => {
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:8080/auth/mandats/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch mandat details")
      }
      const data = await response.json()
      setMandatDetails(data)
    } catch (error) {
      console.error("Error fetching mandat details:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les détails du mandat",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, "dd/MM/yyyy", { locale: fr })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Détails du Mandat</DialogTitle>
          <DialogDescription>Informations complètes du mandat de mission</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : mandatDetails ? (
          <div className="space-y-6">
            {/* Informations générales */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informations Générales</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Référence</Label>
                  <p className="font-medium">{mandatDetails.reference}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Type de Mission</Label>
                  <div className="mt-1">
                    <Badge variant={mandatDetails.missionDeControle ? "default" : "secondary"}>
                      {mandatDetails.missionDeControle ? "Mission de Contrôle" : "Mission Standard"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Date de Début</Label>
                  <p className="font-medium">{formatDate(mandatDetails.dateDebut.toString())}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Date de Fin</Label>
                  <p className="font-medium">{formatDate(mandatDetails.dateFin.toString())}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Durée</Label>
                  <p className="font-medium">
                    {mandatDetails.duree} jour{mandatDetails.duree > 1 ? "s" : ""}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Créé le</Label>
                  <p className="font-medium">{formatDate(mandatDetails.created_at)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Objectif */}
            {mandatDetails.objectif && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Objectif</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{mandatDetails.objectif}</p>
                </CardContent>
              </Card>
            )}

            {/* Utilisateurs assignés */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Utilisateurs Assignés ({mandatDetails.users.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {mandatDetails.users.map((user) => (
                    <div key={user.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-muted-foreground">{user.matricule}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Villes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Villes de Mission ({mandatDetails.villes.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {mandatDetails.villes.map((ville) => (
                    <div key={ville.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{ville.name}</p>
                        <p className="text-sm text-muted-foreground">{ville.code}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Ressources */}
            {mandatDetails.ressources.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Ressources Allouées ({mandatDetails.ressources.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {mandatDetails.ressources.map((ressource) => (
                      <div key={ressource.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Package className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{ressource.name}</p>
                          
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="text-center py-10 text-muted-foreground">Aucun détail disponible pour ce mandat.</div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// Composant pour la liste des mandats
function MandatsList() {
  const [mandats, setMandats] = useState<Mandat[]>([])
  const [loading, setLoading] = useState(false)
  const [currentView, setCurrentView] = useState<"list" | "create" | "edit" | "etapes" | "pieces-jointes">("list")
  const [selectedMandatId, setSelectedMandatId] = useState<string | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [mandatToDelete, setMandatToDelete] = useState<string | null>(null)
  const { toast } = useToast()

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, "dd/MM/yyyy", { locale: fr })
  }

  // Fetch mandats on component mount
  useEffect(() => {
    if (currentView === "list") {
      fetchMandats()
    }
  }, [currentView])

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
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (id: string) => {
    setSelectedMandatId(id)
    setIsDetailsModalOpen(true)
  }

  const handleEditMandat = (id: string) => {
    setSelectedMandatId(id)
    setCurrentView("edit")
  }

  const handleDeleteMandat = (id: string) => {
    setMandatToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteMandat = async () => {
    if (!mandatToDelete) return

    try {
      const response = await fetch(`http://localhost:8080/auth/mandats/${mandatToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete mandat")
      }

      toast({
        title: "Succès",
        description: "Mandat supprimé avec succès",
      })

      fetchMandats()
    } catch (error) {
      console.error("Error deleting mandat:", error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le mandat",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setMandatToDelete(null)
    }
  }

  const handleDownloadPDF = async (id: string) => {
    try {
      toast({
        title: "Téléchargement en cours",
        description: "Préparation du PDF...",
      })

      // Example API call to download PDF
      const response = await fetch(`http://localhost:8080/auth/mandats/${id}/pdf`, {
        method: "GET",
      })

      if (!response.ok) {
        throw new Error("Échec du téléchargement du PDF")
      }

      // Create a blob from the PDF Stream
      const blob = await response.blob()
      // Create a link element, set the download attribute and click it
      const link = document.createElement("a")
      link.href = window.URL.createObjectURL(blob)
      link.download = `mandat-${id}.pdf`
      link.click()

      toast({
        title: "Succès",
        description: "PDF téléchargé avec succès",
      })
    } catch (error) {
      console.error("Erreur lors du téléchargement du PDF:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Échec du téléchargement du PDF",
        variant: "destructive",
      })
    }
  }

  const handleAddSteps = (id: string) => {
    setSelectedMandatId(id)
    setCurrentView("etapes")
  }

  const handleAddAttachments = (id: string) => {
    setSelectedMandatId(id)
    setCurrentView("pieces-jointes")
  }

  if (currentView === "create") {
    return <CreateMandatForm onBack={() => setCurrentView("list")} onSuccess={() => setCurrentView("list")} />
  }

  if (currentView === "edit" && selectedMandatId) {
    return (
      <EditMandatForm
        mandatId={selectedMandatId}
        onBack={() => {
          setCurrentView("list")
          setSelectedMandatId(null)
        }}
        onSuccess={() => {
          setCurrentView("list")
          setSelectedMandatId(null)
        }}
      />
    )
  }

  if (currentView === "etapes" && selectedMandatId) {
    return <EtapesManagement mandatId={selectedMandatId} onBack={() => setCurrentView("list")} />
  }

  if (currentView === "pieces-jointes" && selectedMandatId) {
    return <PiecesJointesManagement mandatId={selectedMandatId} onBack={() => setCurrentView("list")} />
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Mandats</h1>
        <Button onClick={() => setCurrentView("create")}>
          <Plus className="mr-2 h-4 w-4" /> Nouveau Mandat
        </Button>
      </div>

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
                  <TableHead>Dates</TableHead>
                  <TableHead>Durée (jours)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mandats.map((mandat) => (
                  <TableRow key={mandat.id}>
                    <TableCell className="font-medium">{mandat.reference}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{mandat.objectif || "-"}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">
                          Début: {formatDate(mandat.dateDebut.toString())}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Fin: {formatDate(mandat.dateFin.toString())}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{mandat.duree}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Ouvrir le menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleEditMandat(mandat.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewDetails(mandat.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Détails
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownloadPDF(mandat.id)}>
                            <FileDown className="mr-2 h-4 w-4" />
                            Télécharger PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAddSteps(mandat.id)}>
                            <ListTodo className="mr-2 h-4 w-4" />
                            Ajouter des étapes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAddAttachments(mandat.id)}>
                            <Paperclip className="mr-2 h-4 w-4" />
                            Ajouter des pièces jointes
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteMandat(mandat.id)}>
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

      {/* Modal pour les détails */}
      <MandatDetailsModal
        mandatId={selectedMandatId}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false)
          setSelectedMandatId(null)
        }}
      />

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce mandat ? Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteMandat} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Composant pour éditer un mandat
function EditMandatForm({
  mandatId,
  onBack,
  onSuccess,
}: { mandatId: string; onBack: () => void; onSuccess: () => void }) {
  const [users, setUsers] = useState<UserResponseDto[]>([])
  const [villes, setVilles] = useState<VilleResponseDto[]>([])
  const [ressources, setRessources] = useState<RessourceResponseDto[]>([])
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
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(true)
  const [dateErrors, setDateErrors] = useState<string[]>([])
  const [isDateDebutOpen, setIsDateDebutOpen] = useState(false)
  const [isDateFinOpen, setIsDateFinOpen] = useState(false)
  const { toast } = useToast()

  // Fetch mandat data for editing
  useEffect(() => {
    const fetchMandatData = async () => {
      try {
        const response = await fetch(`http://localhost:8080/auth/mandats/${mandatId}`)
        if (!response.ok) throw new Error("Failed to fetch mandat")
        const data = await response.json()

        setFormData({
          reference: data.reference,
          objectif: data.objectif || "",
          dateDebut: new Date(data.dateDebut),
          dateFin: new Date(data.dateFin),
          duree: data.duree,
          missionDeControle: data.missionDeControle || false,
          userIds: data.users.map((u: UserResponseDto) => u.id),
          villeIds: data.villes.map((v: VilleResponseDto) => v.id),
          ressourceIds: data.ressources.map((r: RessourceResponseDto) => r.id),
        })
      } catch (error) {
        console.error("Error fetching mandat:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger les données du mandat",
          variant: "destructive",
        })
      } finally {
        setFetchingData(false)
      }
    }

    fetchMandatData()
  }, [mandatId, toast])

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

  // Update the mandat
  const handleUpdateMandat = async () => {
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
      setLoading(true)

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

      const response = await fetch(`http://localhost:8080/auth/mandats/${mandatId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        let errorMessage = "Échec de modification du mandat"
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
      console.log("Mandat updated successfully:", result)

      toast({
        title: "Succès",
        description: "Mandat modifié avec succès",
      })

      onSuccess()
    } catch (error) {
      console.error("Erreur lors de la modification du mandat:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Échec de modification du mandat",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (fetchingData) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center h-40">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Modifier le Mandat</h1>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Modifier le Mandat</CardTitle>
          <CardDescription>Modifiez les informations du mandat de mission.</CardDescription>
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
            <Button onClick={handleUpdateMandat} disabled={loading || dateErrors.length > 0} className="min-w-[120px]">
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Modification...
                </>
              ) : (
                "Modifier le Mandat"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Composant pour le formulaire de création
function CreateMandatForm({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) {
  const [users, setUsers] = useState<UserResponseDto[]>([])
  const [villes, setVilles] = useState<VilleResponseDto[]>([])
  const [ressources, setRessources] = useState<RessourceResponseDto[]>([])
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
  const [loading, setLoading] = useState(false)
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
      setLoading(true)

      // Prepare the payload as JSON instead of FormData
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

      toast({
        title: "Succès",
        description: "Mandat créé avec succès",
      })

      // Reset form and go back to list
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

      onSuccess()
    } catch (error) {
      console.error("Erreur lors de la création du mandat:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Échec de création du mandat",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
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
            <Button onClick={handleCreateMandat} disabled={loading || dateErrors.length > 0} className="min-w-[120px]">
              {loading ? (
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
    </div>
  )
}

// Composant principal
export default function Mandats() {
  return <MandatsList />
}
