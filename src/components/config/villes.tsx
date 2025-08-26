"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, MoreVertical, Edit, Trash, RefreshCw } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

// Types based on the Java DTOs
interface VilleDto {
  name: string
  code: string
  interieur: boolean
}

interface VilleResponseDto {
  id: number
  name: string
  code: string
  interieur: boolean
  createdAt: string
  updatedAt: string
}

export default function VillesPage() {
  const t = useTranslations("VillesPage")
  const [villes, setVilles] = useState<VilleResponseDto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchType, setSearchType] = useState<"name" | "code">("name")
  const [selectedVille, setSelectedVille] = useState<VilleResponseDto | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [formData, setFormData] = useState<VilleDto>({ name: "", code: "", interieur: false })
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Fetch all cities on component mount
  useEffect(() => {
    fetchVilles()
  }, [])

  // Handle search from URL params
  useEffect(() => {
    const q = searchParams.get("q")
    const type = searchParams.get("type") as "name" | "code"
    if (q) {
      setSearchQuery(q)
      if (type && (type === "name" || type === "code")) {
        setSearchType(type)
        handleSearch(q, type)
      } else {
        handleSearch(q, "name")
      }
    }
  }, [searchParams])

  // Fetch all cities
  const fetchVilles = async () => {
    setLoading(true)
    try {
      const response = await fetch("http://localhost:8080/auth/villes/all")
      if (!response.ok) {
        throw new Error(t("errors.fetchFailed"))
      }
      const data = await response.json()
      setVilles(data)
    } catch (error) {
      console.error("Error fetching cities:", error)
      toast({
        title: t("errors.title"),
        description: t("errors.loadCities"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Search cities by name or code
  const handleSearch = async (query: string, type: "name" | "code") => {
    if (!query.trim()) {
      fetchVilles()
      return
    }
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:8080/auth/villes/search/${type}?q=${encodeURIComponent(query)}`)
      if (!response.ok) {
        throw new Error(t("errors.searchFailed", { type }))
      }
      const data = await response.json()
      setVilles(data)
    } catch (error) {
      console.error(`Error searching cities by ${type}:`, error)
      toast({
        title: t("errors.searchTitle"),
        description: t("errors.searchFailed", { type }),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Create a new city
  const handleCreateVille = async () => {
    try {
      const response = await fetch("http://localhost:8080/auth/villes/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData || t("errors.createFailed"))
      }
      toast({
        title: t("success.title"),
        description: t("success.cityCreated"),
      })
      setIsCreateDialogOpen(false)
      setFormData({ name: "", code: "", interieur: false })
      fetchVilles()
    } catch (error) {
      console.error("Error creating city:", error)
      toast({
        title: t("errors.title"),
        description: error instanceof Error ? error.message : t("errors.createFailed"),
        variant: "destructive",
      })
    }
  }

  // Update a city
  const handleUpdateVille = async () => {
    if (!selectedVille) return
    try {
      const response = await fetch(`http://localhost:8080/auth/villes/${selectedVille.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData || t("errors.updateFailed"))
      }
      toast({
        title: t("success.title"),
        description: t("success.cityUpdated"),
      })
      setIsEditDialogOpen(false)
      setSelectedVille(null)
      setFormData({ name: "", code: "", interieur: false })
      fetchVilles()
    } catch (error) {
      console.error("Error updating city:", error)
      toast({
        title: t("errors.title"),
        description: error instanceof Error ? error.message : t("errors.updateFailed"),
        variant: "destructive",
      })
    }
  }

  // Delete a city
  const handleDeleteVille = async () => {
    if (!selectedVille) return
    try {
      const response = await fetch(`http://localhost:8080/auth/villes/${selectedVille.id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData || t("errors.deleteFailed"))
      }
      toast({
        title: t("success.title"),
        description: t("success.cityDeleted"),
      })
      setIsDeleteDialogOpen(false)
      setSelectedVille(null)
      fetchVilles()
    } catch (error) {
      console.error("Error deleting city:", error)
      toast({
        title: t("errors.title"),
        description: error instanceof Error ? error.message : t("errors.deleteFailed"),
        variant: "destructive",
      })
    }
  }

  // Open edit dialog and populate form
  const openEditDialog = (ville: VilleResponseDto) => {
    setSelectedVille(ville)
    setFormData({
      name: ville.name,
      code: ville.code,
      interieur: ville.interieur,
    })
    setIsEditDialogOpen(true)
  }

  // Open delete dialog
  const openDeleteDialog = (ville: VilleResponseDto) => {
    setSelectedVille(ville)
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
          <Plus className="mr-2 h-4 w-4" /> {t("buttons.addCity")}
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t("search.title")}</CardTitle>
          <CardDescription>{t("search.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="name"
            value={searchType}
            onValueChange={(value) => setSearchType(value as "name" | "code")}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="name">{t("search.tabs.byName")}</TabsTrigger>
              <TabsTrigger value="code">{t("search.tabs.byCode")}</TabsTrigger>
            </TabsList>
            <TabsContent value="name">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={t("search.placeholders.name")}
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch(searchQuery, "name")}
                  />
                </div>
                <Button onClick={() => handleSearch(searchQuery, "name")}>{t("buttons.search")}</Button>
              </div>
            </TabsContent>
            <TabsContent value="code">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={t("search.placeholders.code")}
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch(searchQuery, "code")}
                  />
                </div>
                <Button onClick={() => handleSearch(searchQuery, "code")}>{t("buttons.search")}</Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={fetchVilles}>
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
          ) : villes.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              {t("table.noData")}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("table.headers.id")}</TableHead>
                  <TableHead>{t("table.headers.name")}</TableHead>
                  <TableHead>{t("table.headers.code")}</TableHead>
                  <TableHead>{t("table.headers.location")}</TableHead>
                  <TableHead>{t("table.headers.createdAt")}</TableHead>
                  <TableHead>{t("table.headers.updatedAt")}</TableHead>
                  <TableHead className="text-right">{t("table.headers.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {villes.map((ville) => (
                  <TableRow key={ville.id}>
                    <TableCell>{ville.id}</TableCell>
                    <TableCell className="font-medium">{ville.name}</TableCell>
                    <TableCell>{ville.code}</TableCell>
                    <TableCell>
                      <Badge variant={ville.interieur ? "default" : "secondary"}>
                        {ville.interieur ? t("location.interior") : t("location.exterior")}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(ville.createdAt)}</TableCell>
                    <TableCell>{formatDate(ville.updatedAt)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">{t("actions.openMenu")}</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(ville)}>
                            <Edit className="mr-2 h-4 w-4" /> {t("actions.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDeleteDialog(ville)}>
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

      {/* Create City Dialog */}
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
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right">
                {t("form.labels.code")}
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="interieur" className="text-right">
                {t("form.labels.interiorLocation")}
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch
                  id="interieur"
                  checked={formData.interieur}
                  onCheckedChange={(checked) => setFormData({ ...formData, interieur: checked })}
                />
                <Label htmlFor="interieur" className="text-sm text-muted-foreground">
                  {formData.interieur ? t("form.labels.interiorCity") : t("form.labels.exteriorCity")}
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              {t("buttons.cancel")}
            </Button>
            <Button onClick={handleCreateVille}>{t("buttons.create")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit City Dialog */}
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
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-code" className="text-right">
                {t("form.labels.code")}
              </Label>
              <Input
                id="edit-code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-interieur" className="text-right">
                {t("form.labels.interiorLocation")}
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch
                  id="edit-interieur"
                  checked={formData.interieur}
                  onCheckedChange={(checked) => setFormData({ ...formData, interieur: checked })}
                />
                <Label htmlFor="edit-interieur" className="text-sm text-muted-foreground">
                  {formData.interieur ? t("form.labels.interiorCity") : t("form.labels.exteriorCity")}
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t("buttons.cancel")}
            </Button>
            <Button onClick={handleUpdateVille}>{t("buttons.update")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete City Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dialogs.delete.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("dialogs.delete.description")}
              {selectedVille && ` "${selectedVille.name}"`} {t("dialogs.delete.warning")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("buttons.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteVille} className="bg-destructive text-destructive-foreground">
              {t("buttons.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
