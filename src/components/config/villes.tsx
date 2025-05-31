"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
import { Search, Plus, MoreVertical, Edit, Trash, RefreshCw } from "lucide-react"
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
        throw new Error("Failed to fetch cities")
      }
      const data = await response.json()
      setVilles(data)
    } catch (error) {
      console.error("Error fetching cities:", error)
      toast({
        title: "Error",
        description: "Failed to load cities. Please try again.",
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
        throw new Error(`Failed to search cities by ${type}`)
      }
      const data = await response.json()
      setVilles(data)
    } catch (error) {
      console.error(`Error searching cities by ${type}:`, error)
      toast({
        title: "Search Error",
        description: `Failed to search cities by ${type}. Please try again.`,
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
        throw new Error(errorData || "Failed to create city")
      }

      toast({
        title: "Success",
        description: "City created successfully",
      })

      setIsCreateDialogOpen(false)
      setFormData({ name: "", code: "", interieur: false })
      fetchVilles()
    } catch (error) {
      console.error("Error creating city:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create city",
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
        throw new Error(errorData || "Failed to update city")
      }

      toast({
        title: "Success",
        description: "City updated successfully",
      })

      setIsEditDialogOpen(false)
      setSelectedVille(null)
      setFormData({ name: "", code: "", interieur: false })
      fetchVilles()
    } catch (error) {
      console.error("Error updating city:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update city",
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
        throw new Error(errorData || "Failed to delete city")
      }

      toast({
        title: "Success",
        description: "City deleted successfully",
      })

      setIsDeleteDialogOpen(false)
      setSelectedVille(null)
      fetchVilles()
    } catch (error) {
      console.error("Error deleting city:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete city",
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
        <h1 className="text-3xl font-bold">City Management</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add City
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search Cities</CardTitle>
          <CardDescription>Search cities by name or code</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="name"
            value={searchType}
            onValueChange={(value) => setSearchType(value as "name" | "code")}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="name">Search by Name</TabsTrigger>
              <TabsTrigger value="code">Search by Code</TabsTrigger>
            </TabsList>
            <TabsContent value="name">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search by city name..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch(searchQuery, "name")}
                  />
                </div>
                <Button onClick={() => handleSearch(searchQuery, "name")}>Search</Button>
              </div>
            </TabsContent>
            <TabsContent value="code">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search by city code..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch(searchQuery, "code")}
                  />
                </div>
                <Button onClick={() => handleSearch(searchQuery, "code")}>Search</Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={fetchVilles}>
            <RefreshCw className="mr-2 h-4 w-4" /> Reset
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cities List</CardTitle>
          <CardDescription>Manage your cities</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : villes.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No cities found. Add a new city or adjust your search.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Updated At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                        {ville.interieur ? "Interior" : "Exterior"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(ville.createdAt)}</TableCell>
                    <TableCell>{formatDate(ville.updatedAt)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(ville)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDeleteDialog(ville)}>
                            <Trash className="mr-2 h-4 w-4" /> Delete
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
            <DialogTitle>Add New City</DialogTitle>
            <DialogDescription>Enter the details for the new city.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
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
                Code
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
                Interior Location
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch
                  id="interieur"
                  checked={formData.interieur}
                  onCheckedChange={(checked) => setFormData({ ...formData, interieur: checked })}
                />
                <Label htmlFor="interieur" className="text-sm text-muted-foreground">
                  {formData.interieur ? "Interior city" : "Exterior city"}
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateVille}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit City Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit City</DialogTitle>
            <DialogDescription>Update the details for this city.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
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
              <Label htmlFor="edit-interieur" className="text-right">
                Interior Location
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch
                  id="edit-interieur"
                  checked={formData.interieur}
                  onCheckedChange={(checked) => setFormData({ ...formData, interieur: checked })}
                />
                <Label htmlFor="edit-interieur" className="text-sm text-muted-foreground">
                  {formData.interieur ? "Interior city" : "Exterior city"}
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateVille}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete City Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the city
              {selectedVille && ` "${selectedVille.name}"`} and remove it from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteVille} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}