"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Search, Plus, MoreVertical, Edit, Trash, RefreshCw } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

// Types based on the Java DTOs
interface RessourceDto {
  name: string
}

interface RessourceResponseDto {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

export default function RessourcesPage() {
  const t = useTranslations("Ressources")
  const [ressources, setRessources] = useState<RessourceResponseDto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRessource, setSelectedRessource] = useState<RessourceResponseDto | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [formData, setFormData] = useState<RessourceDto>({
    name: "",
  })
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Fetch all resources on component mount
  useEffect(() => {
    fetchRessources()
  }, [])

  // Handle search from URL params
  useEffect(() => {
    const q = searchParams.get("q")
    if (q) {
      setSearchQuery(q)
      handleSearch(q)
    }
  }, [searchParams])

  // Fetch all resources
  const fetchRessources = async () => {
    setLoading(true)
    try {
      const response = await fetch("http://localhost:8080/auth/ressources/all")
      if (!response.ok) {
        throw new Error(t("errors.fetchFailed"))
      }
      const data = await response.json()
      setRessources(data)
    } catch (error) {
      console.error("Error fetching resources:", error)
      toast({
        title: t("errors.title"),
        description: t("errors.loadResources"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Search resources by name
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      fetchRessources()
      return
    }
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:8080/auth/ressources/search?name=${encodeURIComponent(query)}`)
      if (!response.ok) {
        throw new Error(t("errors.searchFailed"))
      }
      const data = await response.json()
      setRessources(data)
    } catch (error) {
      console.error("Error searching resources:", error)
      toast({
        title: t("errors.title"),
        description: t("errors.searchFailed"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Create a new resource
  const handleCreateRessource = async () => {
    try {
      const response = await fetch("http://localhost:8080/auth/ressources/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData?.error || t("errors.createFailed"))
      }
      toast({
        title: t("success.title"),
        description: t("success.resourceCreated"),
      })
      setIsCreateDialogOpen(false)
      setFormData({ name: "" })
      fetchRessources()
    } catch (error) {
      console.error("Error creating resource:", error)
      toast({
        title: t("errors.title"),
        description: error instanceof Error ? error.message : t("errors.createFailed"),
        variant: "destructive",
      })
    }
  }

  // Update a resource
  const handleUpdateRessource = async () => {
    if (!selectedRessource) return
    try {
      const response = await fetch(`http://localhost:8080/auth/ressources/${selectedRessource.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData?.error || t("errors.updateFailed"))
      }
      toast({
        title: t("success.title"),
        description: t("success.resourceUpdated"),
      })
      setIsEditDialogOpen(false)
      setSelectedRessource(null)
      setFormData({ name: "" })
      fetchRessources()
    } catch (error) {
      console.error("Error updating resource:", error)
      toast({
        title: t("errors.title"),
        description: error instanceof Error ? error.message : t("errors.updateFailed"),
        variant: "destructive",
      })
    }
  }

  // Delete a resource
  const handleDeleteRessource = async () => {
    if (!selectedRessource) return
    try {
      const response = await fetch(`http://localhost:8080/auth/ressources/${selectedRessource.id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData?.error || t("errors.deleteFailed"))
      }
      toast({
        title: t("success.title"),
        description: t("success.resourceDeleted"),
      })
      setIsDeleteDialogOpen(false)
      setSelectedRessource(null)
      fetchRessources()
    } catch (error) {
      console.error("Error deleting resource:", error)
      toast({
        title: t("errors.title"),
        description: error instanceof Error ? error.message : t("errors.deleteFailed"),
        variant: "destructive",
      })
    }
  }

  // Open edit dialog and populate form
  const openEditDialog = (ressource: RessourceResponseDto) => {
    setSelectedRessource(ressource)
    setFormData({
      name: ressource.name,
    })
    setIsEditDialogOpen(true)
  }

  // Open delete dialog
  const openDeleteDialog = (ressource: RessourceResponseDto) => {
    setSelectedRessource(ressource)
    setIsDeleteDialogOpen(true)
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> {t("buttons.addResource")}
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t("search.title")}</CardTitle>
          <CardDescription>{t("search.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t("search.placeholder")}
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch(searchQuery)}
              />
            </div>
            <Button onClick={() => handleSearch(searchQuery)}>{t("buttons.search")}</Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={fetchRessources}>
            <RefreshCw className="mr-2 h-4 w-4" /> {t("buttons.reset")}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("table.title")}</CardTitle>
          <CardDescription>{t("table.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : ressources.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              {t("table.noData")}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("table.headers.id")}</TableHead>
                  <TableHead>{t("table.headers.name")}</TableHead>
                  <TableHead>{t("table.headers.createdAt")}</TableHead>
                  <TableHead>{t("table.headers.updatedAt")}</TableHead>
                  <TableHead className="text-right">{t("table.headers.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ressources.map((ressource) => (
                  <TableRow key={ressource.id}>
                    <TableCell>{ressource.id}</TableCell>
                    <TableCell className="font-medium">{ressource.name}</TableCell>
                    <TableCell>{formatDate(ressource.createdAt)}</TableCell>
                    <TableCell>{formatDate(ressource.updatedAt)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">{t("actions.openMenu")}</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(ressource)}>
                            <Edit className="mr-2 h-4 w-4" /> {t("actions.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDeleteDialog(ressource)}>
                            <Trash className="mr-2 h-4 w-4" /> {t("actions.delete")}
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

      {/* Create Resource Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("dialogs.create.title")}</DialogTitle>
            <DialogDescription>{t("dialogs.create.description")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                {t("form.labels.name")}
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
                placeholder={t("form.placeholders.name")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              {t("buttons.cancel")}
            </Button>
            <Button onClick={handleCreateRessource}>{t("buttons.create")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Resource Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("dialogs.edit.title")}</DialogTitle>
            <DialogDescription>{t("dialogs.edit.description")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                {t("form.labels.name")}
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
                placeholder={t("form.placeholders.name")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t("buttons.cancel")}
            </Button>
            <Button onClick={handleUpdateRessource}>{t("buttons.update")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Resource Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dialogs.delete.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("dialogs.delete.description")}
              {selectedRessource && ` "${selectedRessource.name}"`}{t("dialogs.delete.warning")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("buttons.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRessource} className="bg-destructive text-destructive-foreground">
              {t("buttons.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
