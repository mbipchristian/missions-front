"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
import { Plus, MoreVertical, Edit, Trash, RefreshCw } from "lucide-react"
// Mock toast hook pour la démonstration
const useToast = () => ({
  toast: (options: { title: string; description: string; variant?: 'destructive' }) => {
    alert(`${options.title}: ${options.description}`)
  }
})

// Types basés sur les nouveaux attributs
interface GradeDto {
  name: string
  code: string
  fraisInterne: number
  fraisExterne: number
}

interface GradeResponseDto {
  id: number
  name: string
  code: string
  fraisInterne: number
  fraisExterne: number
  createdAt: string
  updatedAt: string
}

export default function Grades() {
  const [grades, setGrades] = useState<GradeResponseDto[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGrade, setSelectedGrade] = useState<GradeResponseDto | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [formData, setFormData] = useState<GradeDto>({
    name: "",
    code: "",
    fraisInterne: 0,
    fraisExterne: 0,
  })

  const { toast } = useToast()

  // Récupérer tous les grades au chargement du composant
  useEffect(() => {
    fetchGrades()
  }, [])

  // Récupérer tous les grades
  const fetchGrades = async () => {
    setLoading(true)
    try {
      const response = await fetch("http://localhost:8080/auth/grades/all")
      if (!response.ok) {
        throw new Error("Échec de la récupération des grades")
      }
      const data = await response.json()
      setGrades(data)
    } catch (error) {
      console.error("Erreur lors de la récupération des grades:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les grades. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Créer un nouveau grade
  const handleCreateGrade = async () => {
    try {
      const response = await fetch("http://localhost:8080/auth/grades/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData || "Échec de la création du grade")
      }

      toast({
        title: "Succès",
        description: "Grade créé avec succès",
      })

      setIsCreateDialogOpen(false)
      setFormData({ name: "", code: "", fraisInterne: 0, fraisExterne: 0 })
      fetchGrades()
    } catch (error) {
      console.error("Erreur lors de la création du grade:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Échec de la création du grade",
        variant: "destructive",
      })
    }
  }

  // Mettre à jour un grade
  const handleUpdateGrade = async () => {
    if (!selectedGrade) return

    try {
      const response = await fetch(`http://localhost:8080/auth/grades/${selectedGrade.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData || "Échec de la mise à jour du grade")
      }

      toast({
        title: "Succès",
        description: "Grade mis à jour avec succès",
      })

      setIsEditDialogOpen(false)
      setSelectedGrade(null)
      setFormData({ name: "", code: "", fraisInterne: 0, fraisExterne: 0 })
      fetchGrades()
    } catch (error) {
      console.error("Erreur lors de la mise à jour du grade:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Échec de la mise à jour du grade",
        variant: "destructive",
      })
    }
  }

  // Supprimer un grade
  const handleDeleteGrade = async () => {
    if (!selectedGrade) return

    try {
      const response = await fetch(`http://localhost:8080/auth/grades/${selectedGrade.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData || "Échec de la suppression du grade")
      }

      toast({
        title: "Succès",
        description: "Grade supprimé avec succès",
      })

      setIsDeleteDialogOpen(false)
      setSelectedGrade(null)
      fetchGrades()
    } catch (error) {
      console.error("Erreur lors de la suppression du grade:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Échec de la suppression du grade",
        variant: "destructive",
      })
    }
  }

  // Ouvrir le dialogue d'édition et remplir le formulaire
  const openEditDialog = (grade: GradeResponseDto) => {
    setSelectedGrade(grade)
    setFormData({
      name: grade.name,
      code: grade.code,
      fraisInterne: grade.fraisInterne,
      fraisExterne: grade.fraisExterne,
    })
    setIsEditDialogOpen(true)
  }

  // Ouvrir le dialogue de suppression
  const openDeleteDialog = (grade: GradeResponseDto) => {
    setSelectedGrade(grade)
    setIsDeleteDialogOpen(true)
  }

  // Formater la date pour l'affichage
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  // Formater les montants en devise
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(amount)
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Grades</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Ajouter un Grade
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Grades</CardTitle>
          <CardDescription>Gérez vos grades et leurs frais associés</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : grades.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              Aucun grade trouvé. Ajoutez un nouveau grade pour commencer.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">ID</th>
                    <th className="text-left p-2">Nom</th>
                    <th className="text-left p-2">Code</th>
                    <th className="text-left p-2">Frais Interne</th>
                    <th className="text-left p-2">Frais Externe</th>
                    <th className="text-left p-2">Créé le</th>
                    <th className="text-left p-2">Modifié le</th>
                    <th className="text-right p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((grade) => (
                    <tr key={grade.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{grade.id}</td>
                      <td className="p-2 font-medium">{grade.name}</td>
                      <td className="p-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {grade.code}
                        </span>
                      </td>
                      <td className="p-2 text-green-600 font-medium">
                        {formatCurrency(grade.fraisInterne)}
                      </td>
                      <td className="p-2 text-orange-600 font-medium">
                        {formatCurrency(grade.fraisExterne)}
                      </td>
                      <td className="p-2">{formatDate(grade.createdAt)}</td>
                      <td className="p-2">{formatDate(grade.updatedAt)}</td>
                      <td className="p-2 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Ouvrir le menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(grade)}>
                              <Edit className="mr-2 h-4 w-4" /> Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openDeleteDialog(grade)}>
                              <Trash className="mr-2 h-4 w-4" /> Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogue de Création de Grade */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ajouter un Nouveau Grade</DialogTitle>
            <DialogDescription>Entrez les détails du nouveau grade.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nom
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
                placeholder="Ex: Directeur"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right">
                Code
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="col-span-3"
                placeholder="Ex: DIR001"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fraisInterne" className="text-right">
                Frais Interne
              </Label>
              <Input
                id="fraisInterne"
                type="number"
                min="0"
                step="1"
                value={formData.fraisInterne}
                onChange={(e) => setFormData({ ...formData, fraisInterne: Number.parseFloat(e.target.value) || 0 })}
                className="col-span-3"
                placeholder="0"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fraisExterne" className="text-right">
                Frais Externe
              </Label>
              <Input
                id="fraisExterne"
                type="number"
                min="0"
                step="1"
                value={formData.fraisExterne}
                onChange={(e) => setFormData({ ...formData, fraisExterne: Number.parseFloat(e.target.value) || 0 })}
                className="col-span-3"
                placeholder="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateGrade}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue de Modification de Grade */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier le Grade</DialogTitle>
            <DialogDescription>Mettez à jour les détails de ce grade.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Nom
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-code" className="text-right">
                Code
              </Label>
              <Input
                id="edit-code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-fraisInterne" className="text-right">
                Frais Interne
              </Label>
              <Input
                id="edit-fraisInterne"
                type="number"
                min="0"
                step="1"
                value={formData.fraisInterne}
                onChange={(e) => setFormData({ ...formData, fraisInterne: Number.parseFloat(e.target.value) || 0 })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-fraisExterne" className="text-right">
                Frais Externe
              </Label>
              <Input
                id="edit-fraisExterne"
                type="number"
                min="0"
                step="1"
                value={formData.fraisExterne}
                onChange={(e) => setFormData({ ...formData, fraisExterne: Number.parseFloat(e.target.value) || 0 })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateGrade}>Mettre à jour</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue de Suppression de Grade */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Cela supprimera définitivement le grade
              {selectedGrade && ` "${selectedGrade.name}"`} de la base de données.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteGrade} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}