"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, MoreVertical, Download, Trash, RefreshCw, ArrowLeft, FileText, Upload, File } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

// Interfaces
interface MandatResponseDto {
  id: number
  reference: string
  objectif?: string
}

interface OrdreMissionResponseDto {
  id: number
  reference: string
}

interface RapportResponseDto {
  id: number
  titre: string
}

interface UserResponseDto {
  id: number
  username: string
  email: string
  matricule: string
}

interface PieceJointeDto {
  nom: string
  nomOriginal: string
  description?: string
  mandatId?: number
  ordreMissionId?: number
  rapportId?: number
  userId: number
}

interface PieceJointeResponseDto {
  id: number
  nom: string
  nomOriginal: string
  cheminFichier: string
  typeMime: string
  taille: number
  description?: string
  created_at: string
  updated_at: string
  actif: boolean
  mandatId?: number
  mandatReference?: string
  ordreMissionId?: number
  ordreMissionReference?: string
  rapportId?: number
  rapportReference?: string
  userId: number
  userName: string
}

export default function PiecesJointes() {
  const [piecesJointes, setPiecesJointes] = useState<PieceJointeResponseDto[]>([])
  const [mandats, setMandats] = useState<MandatResponseDto[]>([])
  const [ordresMission, setOrdresMission] = useState<OrdreMissionResponseDto[]>([])
  const [rapports, setRapports] = useState<RapportResponseDto[]>([])
  const [users, setUsers] = useState<UserResponseDto[]>([])
  const [loading, setLoading] = useState(true)
  const [currentView, setCurrentView] = useState<"list" | "upload">("list")
  const [selectedPieceJointe, setSelectedPieceJointe] = useState<PieceJointeResponseDto | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [formData, setFormData] = useState<PieceJointeDto>({
    nom: "",
    nomOriginal: "",
    description: "",
    mandatId: undefined,
    ordreMissionId: undefined,
    rapportId: undefined,
    userId: 0,
  })
  const [associationType, setAssociationType] = useState<"mandat" | "ordre" | "rapport" | "none">("none")

  const { toast } = useToast()

  // Fetch data on component mount
  useEffect(() => {
    if (currentView === "list") {
      fetchPiecesJointes()
    }
    fetchMandats()
    fetchOrdresMission()
    fetchRapports()
    fetchUsers()
  }, [currentView])

  const fetchPiecesJointes = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/pieces-jointes")
      if (!response.ok) throw new Error("Failed to fetch pieces jointes")
      const data = await response.json()
      setPiecesJointes(data)
    } catch (error) {
      console.error("Error fetching pieces jointes:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les pièces jointes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchMandats = async () => {
    try {
      const response = await fetch("/api/mandats")
      if (!response.ok) throw new Error("Failed to fetch mandats")
      const data = await response.json()
      setMandats(data)
    } catch (error) {
      console.error("Error fetching mandats:", error)
    }
  }

  const fetchOrdresMission = async () => {
    try {
      const response = await fetch("/api/ordres-mission/all")
      if (!response.ok) throw new Error("Failed to fetch ordres mission")
      const data = await response.json()
      setOrdresMission(data)
    } catch (error) {
      console.error("Error fetching ordres mission:", error)
    }
  }

  const fetchRapports = async () => {
    try {
      const response = await fetch("/api/rapports")
      if (!response.ok) throw new Error("Failed to fetch rapports")
      const data = await response.json()
      setRapports(data)
    } catch (error) {
      console.error("Error fetching rapports:", error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users")
      if (!response.ok) throw new Error("Failed to fetch users")
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newFiles = Array.from(files)
      setSelectedFiles([...selectedFiles, ...newFiles])
    }
  }

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index))
  }

  const handleUploadFiles = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez sélectionner au moins un fichier",
        variant: "destructive",
      })
      return
    }

    if (formData.userId === 0) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez sélectionner un utilisateur",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const uploadPromises = selectedFiles.map(async (file) => {
        const fileFormData = new FormData()
        fileFormData.append("file", file)
        fileFormData.append("nom", formData.nom || file.name)
        fileFormData.append("nomOriginal", file.name)
        fileFormData.append("description", formData.description || "")
        fileFormData.append("userId", formData.userId.toString())

        // Add association based on type
        if (associationType === "mandat" && formData.mandatId) {
          fileFormData.append("mandatId", formData.mandatId.toString())
        } else if (associationType === "ordre" && formData.ordreMissionId) {
          fileFormData.append("ordreMissionId", formData.ordreMissionId.toString())
        } else if (associationType === "rapport" && formData.rapportId) {
          fileFormData.append("rapportId", formData.rapportId.toString())
        }

        return fetch("/api/pieces-jointes/upload", {
          method: "POST",
          body: fileFormData,
        })
      })

      const responses = await Promise.all(uploadPromises)
      const failedUploads = responses.filter((response) => !response.ok)

      if (failedUploads.length > 0) {
        throw new Error(`${failedUploads.length} fichier(s) n'ont pas pu être téléchargés`)
      }

      toast({
        title: "Succès",
        description: `${selectedFiles.length} fichier(s) téléchargé(s) avec succès`,
      })

      resetForm()
      setCurrentView("list")
    } catch (error) {
      console.error("Error uploading files:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Échec du téléchargement",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadFile = async (pieceJointe: PieceJointeResponseDto) => {
    try {
      const response = await fetch(`/api/pieces-jointes/${pieceJointe.id}/download`)
      if (!response.ok) throw new Error("Failed to download file")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = pieceJointe.nomOriginal
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Succès",
        description: "Fichier téléchargé avec succès",
      })
    } catch (error) {
      console.error("Error downloading file:", error)
      toast({
        title: "Erreur",
        description: "Échec du téléchargement du fichier",
        variant: "destructive",
      })
    }
  }

  const handleDeletePieceJointe = async () => {
    if (!selectedPieceJointe) return

    try {
      const response = await fetch(`/api/pieces-jointes/${selectedPieceJointe.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Échec de suppression de la pièce jointe")
      }

      toast({
        title: "Succès",
        description: "Pièce jointe supprimée avec succès",
      })

      setIsDeleteDialogOpen(false)
      setSelectedPieceJointe(null)
      fetchPiecesJointes()
    } catch (error) {
      console.error("Error deleting piece jointe:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Échec de suppression de la pièce jointe",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      nom: "",
      nomOriginal: "",
      description: "",
      mandatId: undefined,
      ordreMissionId: undefined,
      rapportId: undefined,
      userId: 0,
    })
    setSelectedFiles([])
    setAssociationType("none")
  }

  const openDeleteDialog = (pieceJointe: PieceJointeResponseDto) => {
    setSelectedPieceJointe(pieceJointe)
    setIsDeleteDialogOpen(true)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getFileIcon = (typeMime: string) => {
    if (typeMime.includes("pdf")) return "📄"
    if (typeMime.includes("image")) return "🖼️"
    if (typeMime.includes("word") || typeMime.includes("document")) return "📝"
    if (typeMime.includes("excel") || typeMime.includes("spreadsheet")) return "📊"
    return "📎"
  }

  if (currentView === "upload") {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => setCurrentView("list")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Télécharger des Pièces Jointes</h1>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Nouveau Téléchargement</CardTitle>
            <CardDescription>
              Téléchargez des fichiers et associez-les à vos mandats, ordres de mission ou rapports.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sélection des fichiers */}
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Fichiers à télécharger *
                </Label>
                <div>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Sélectionner des fichiers
                  </Button>
                </div>
              </div>

              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center gap-3">
                        <File className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="font-medium">{file.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatFileSize(file.size)} - {file.type}
                          </div>
                        </div>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveFile(index)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Nom personnalisé */}
            <div className="grid gap-2">
              <Label htmlFor="nom">Nom personnalisé</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Laissez vide pour utiliser le nom du fichier"
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description optionnelle du fichier"
                rows={3}
              />
            </div>

            {/* Utilisateur */}
            <div className="grid gap-2">
              <Label htmlFor="user">Utilisateur *</Label>
              <Select
                value={formData.userId.toString()}
                onValueChange={(value) => setFormData({ ...formData, userId: Number.parseInt(value) })}
              >
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

            {/* Type d'association */}
            <div className="grid gap-2">
              <Label htmlFor="associationType">Associer à</Label>
              <Select value={associationType} onValueChange={(value: any) => setAssociationType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type d'association" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune association</SelectItem>
                  <SelectItem value="mandat">Mandat</SelectItem>
                  <SelectItem value="ordre">Ordre de Mission</SelectItem>
                  <SelectItem value="rapport">Rapport</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Association spécifique */}
            {associationType === "mandat" && (
              <div className="grid gap-2">
                <Label htmlFor="mandat">Mandat</Label>
                <Select
                  value={formData.mandatId?.toString() || ""}
                  onValueChange={(value) => setFormData({ ...formData, mandatId: Number.parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un mandat" />
                  </SelectTrigger>
                  <SelectContent>
                    {mandats.map((mandat) => (
                      <SelectItem key={mandat.id} value={mandat.id.toString()}>
                        {mandat.reference} - {mandat.objectif || "Sans objectif"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {associationType === "ordre" && (
              <div className="grid gap-2">
                <Label htmlFor="ordre">Ordre de Mission</Label>
                <Select
                  value={formData.ordreMissionId?.toString() || ""}
                  onValueChange={(value) => setFormData({ ...formData, ordreMissionId: Number.parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un ordre de mission" />
                  </SelectTrigger>
                  <SelectContent>
                    {ordresMission.map((ordre) => (
                      <SelectItem key={ordre.id} value={ordre.id.toString()}>
                        {ordre.reference}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {associationType === "rapport" && (
              <div className="grid gap-2">
                <Label htmlFor="rapport">Rapport</Label>
                <Select
                  value={formData.rapportId?.toString() || ""}
                  onValueChange={(value) => setFormData({ ...formData, rapportId: Number.parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rapport" />
                  </SelectTrigger>
                  <SelectContent>
                    {rapports.map((rapport) => (
                      <SelectItem key={rapport.id} value={rapport.id.toString()}>
                        {rapport.titre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="text-sm text-muted-foreground">* Champs obligatoires</div>

            {/* Actions */}
            <div className="flex gap-4 pt-6">
              <Button variant="outline" onClick={() => setCurrentView("list")}>
                Annuler
              </Button>
              <Button onClick={handleUploadFiles} disabled={loading} className="min-w-[120px]">
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Téléchargement...
                  </>
                ) : (
                  "Télécharger"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Pièces Jointes</h1>
        <Button onClick={() => setCurrentView("upload")}>
          <Plus className="mr-2 h-4 w-4" /> Télécharger des Fichiers
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Pièces Jointes</CardTitle>
          <CardDescription>Gérez vos documents et fichiers</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : piecesJointes.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              Aucune pièce jointe trouvée. Téléchargez des fichiers pour commencer.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fichier</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Taille</TableHead>
                  <TableHead>Associé à</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {piecesJointes.map((pieceJointe) => (
                  <TableRow key={pieceJointe.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getFileIcon(pieceJointe.typeMime)}</span>
                        <div>
                          <div className="font-medium">{pieceJointe.nom}</div>
                          <div className="text-sm text-muted-foreground">{pieceJointe.nomOriginal}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{pieceJointe.typeMime.split("/")[1]?.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell>{formatFileSize(pieceJointe.taille)}</TableCell>
                    <TableCell>
                      {pieceJointe.mandatReference && (
                        <Badge variant="outline" className="mr-1">
                          Mandat: {pieceJointe.mandatReference}
                        </Badge>
                      )}
                      {pieceJointe.ordreMissionReference && (
                        <Badge variant="outline" className="mr-1">
                          Ordre: {pieceJointe.ordreMissionReference}
                        </Badge>
                      )}
                      {pieceJointe.rapportReference && (
                        <Badge variant="outline" className="mr-1">
                          Rapport: {pieceJointe.rapportReference}
                        </Badge>
                      )}
                      {!pieceJointe.mandatReference &&
                        !pieceJointe.ordreMissionReference &&
                        !pieceJointe.rapportReference && <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell>{pieceJointe.userName}</TableCell>
                    <TableCell>{formatDate(pieceJointe.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Ouvrir le menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleDownloadFile(pieceJointe)}>
                            <Download className="mr-2 h-4 w-4" />
                            Télécharger
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => openDeleteDialog(pieceJointe)}>
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
              Cette action ne peut pas être annulée. Cela supprimera définitivement la pièce jointe
              {selectedPieceJointe && ` "${selectedPieceJointe.nom}"`} et le fichier associé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePieceJointe} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
