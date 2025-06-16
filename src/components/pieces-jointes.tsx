"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Plus,
  Upload,
  FileText,
  ImageIcon,
  File,
  Download,
  Trash,
  RefreshCw,
  ArrowLeft,
  Paperclip,
  Search,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

// Interfaces
interface PieceJointeDto {
  nom: string
  nomOriginal: string
  cheminFichier: string
  typeMime: string
  taille: number
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

// Composant principal pour la gestion des pièces jointes
export function PiecesJointesManagement({ mandatId, onBack }: { mandatId: string; onBack: () => void }) {
  const [piecesJointes, setPiecesJointes] = useState<PieceJointeResponseDto[]>([])
  const [loading, setLoading] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchPiecesJointes()
  }, [mandatId])

  const fetchPiecesJointes = async () => {
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:8080/auth/pieces-jointes/mandat/${mandatId}`)
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

  const handleDeletePieceJointe = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8080/auth/pieces-jointes/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete piece jointe")

      toast({
        title: "Succès",
        description: "Pièce jointe supprimée avec succès",
      })
      fetchPiecesJointes()
    } catch (error) {
      console.error("Error deleting piece jointe:", error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la pièce jointe",
        variant: "destructive",
      })
    }
  }

  const handleDownloadPieceJointe = async (pieceJointe: PieceJointeResponseDto) => {
    try {
      // Simuler le téléchargement - vous devrez implémenter l'endpoint de téléchargement
      toast({
        title: "Téléchargement",
        description: `Téléchargement de ${pieceJointe.nomOriginal}`,
      })
    } catch (error) {
      console.error("Error downloading piece jointe:", error)
      toast({
        title: "Erreur",
        description: "Impossible de télécharger la pièce jointe",
        variant: "destructive",
      })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (typeMime: string) => {
    if (typeMime.startsWith("image/")) return <ImageIcon className="h-4 w-4" />
    if (typeMime.includes("pdf")) return <FileText className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  const getFileTypeColor = (typeMime: string) => {
    if (typeMime.startsWith("image/")) return "bg-green-100 text-green-800"
    if (typeMime.includes("pdf")) return "bg-red-100 text-red-800"
    if (typeMime.includes("word") || typeMime.includes("document")) return "bg-blue-100 text-blue-800"
    if (typeMime.includes("excel") || typeMime.includes("spreadsheet")) return "bg-emerald-100 text-emerald-800"
    return "bg-gray-100 text-gray-800"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const filteredPiecesJointes = piecesJointes.filter(
    (piece) =>
      piece.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      piece.nomOriginal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      piece.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Gestion des Pièces Jointes</h1>
        <Button onClick={() => setIsUploadModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Ajouter des Fichiers
        </Button>
      </div>

      {/* Barre de recherche */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher des pièces jointes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Paperclip className="h-5 w-5" />
            Pièces Jointes du Mandat ({filteredPiecesJointes.length})
          </CardTitle>
          <CardDescription>Gérez les fichiers attachés à ce mandat de mission</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredPiecesJointes.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              {searchTerm
                ? "Aucune pièce jointe trouvée pour cette recherche."
                : "Aucune pièce jointe trouvée. Ajoutez des fichiers pour commencer."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fichier</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Taille</TableHead>
                  <TableHead>Ajouté par</TableHead>
                  <TableHead>Date d&apos;ajout</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPiecesJointes.map((piece) => (
                  <TableRow key={piece.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {getFileIcon(piece.typeMime)}
                        <div>
                          <p className="font-medium">{piece.nom}</p>
                          <p className="text-sm text-muted-foreground">{piece.nomOriginal}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getFileTypeColor(piece.typeMime)}>
                        {piece.typeMime.split("/")[1]?.toUpperCase() || "FICHIER"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatFileSize(piece.taille)}</TableCell>
                    <TableCell>{piece.userName}</TableCell>
                    <TableCell>{formatDate(piece.created_at)}</TableCell>
                    <TableCell className="max-w-[200px]">
                      <p className="truncate text-sm">{piece.description || "-"}</p>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="icon" onClick={() => handleDownloadPieceJointe(piece)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeletePieceJointe(piece.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal d'upload */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => {
          setIsUploadModalOpen(false)
          fetchPiecesJointes()
        }}
        mandatId={Number.parseInt(mandatId)}
      />
    </div>
  )
}

// Composant Modal pour l'upload de fichiers
function UploadModal({
  isOpen,
  onClose,
  onSuccess,
  mandatId,
}: {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  mandatId: number
}) {
  const [files, setFiles] = useState<File[]>([])
  const [descriptions, setDescriptions] = useState<{ [key: string]: string }>({})
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    setFiles(selectedFiles)

    // Initialiser les descriptions
    const newDescriptions: { [key: string]: string } = {}
    selectedFiles.forEach((file) => {
      newDescriptions[file.name] = ""
    })
    setDescriptions(newDescriptions)
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins un fichier",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Simuler l'upload - vous devrez implémenter l'upload réel
      for (const file of files) {
        const pieceJointeDto: PieceJointeDto = {
          nom: file.name,
          nomOriginal: file.name,
          cheminFichier: `/uploads/${file.name}`, // Chemin simulé
          typeMime: file.type,
          taille: file.size,
          description: descriptions[file.name] || "",
          mandatId: mandatId,
          userId: 1, // Vous devrez récupérer l'ID de l'utilisateur connecté
        }

        const response = await fetch("http://localhost:8080/auth/pieces-jointes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(pieceJointeDto),
        })

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`)
        }
      }

      toast({
        title: "Succès",
        description: `${files.length} fichier(s) uploadé(s) avec succès`,
      })

      // Reset
      setFiles([])
      setDescriptions({})
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      onSuccess()
    } catch (error) {
      console.error("Error uploading files:", error)
      toast({
        title: "Erreur",
        description: "Erreur lors de l'upload des fichiers",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const removeFile = (fileName: string) => {
    setFiles(files.filter((f) => f.name !== fileName))
    const newDescriptions = { ...descriptions }
    delete newDescriptions[fileName]
    setDescriptions(newDescriptions)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter des Pièces Jointes</DialogTitle>
          <DialogDescription>Sélectionnez et uploadez des fichiers pour ce mandat</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sélection de fichiers */}
          <div className="grid gap-2">
            <Label htmlFor="files">Sélectionner des fichiers</Label>
            <Input
              id="files"
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="cursor-pointer"
            />
            <p className="text-sm text-muted-foreground">Vous pouvez sélectionner plusieurs fichiers à la fois</p>
          </div>

          {/* Liste des fichiers sélectionnés */}
          {files.length > 0 && (
            <div className="space-y-4">
              <Label>Fichiers sélectionnés ({files.length})</Label>
              <div className="space-y-3">
                {files.map((file) => (
                  <Card key={file.name}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          {file.type.startsWith("image/") ? (
                            <ImageIcon className="h-5 w-5 text-green-600" />
                          ) : file.type.includes("pdf") ? (
                            <FileText className="h-5 w-5 text-red-600" />
                          ) : (
                            <File className="h-5 w-5 text-gray-600" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                            </p>
                            <div className="mt-2">
                              <Label htmlFor={`desc-${file.name}`} className="text-sm">
                                Description (optionnelle)
                              </Label>
                              <Textarea
                                id={`desc-${file.name}`}
                                value={descriptions[file.name] || ""}
                                onChange={(e) =>
                                  setDescriptions({
                                    ...descriptions,
                                    [file.name]: e.target.value,
                                  })
                                }
                                placeholder="Décrivez ce fichier..."
                                rows={2}
                                className="mt-1"
                              />
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="icon" onClick={() => removeFile(file.name)} className="ml-2">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-6">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button onClick={handleUpload} disabled={loading || files.length === 0}>
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Upload en cours...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Uploader {files.length} fichier{files.length > 1 ? "s" : ""}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
