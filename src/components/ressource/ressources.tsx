"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
import { Search, Plus, MoreVertical, Edit, Trash, RefreshCw } from "lucide-react"
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

export default function Ressources() {
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
        throw new Error("Failed to fetch resources")
      }
      const data = await response.json()
      setRessources(data)
    } catch (error) {
      console.error("Error fetching resources:", error)
      toast({
        title: "Error",
        description: "Failed to load resources. Please try again.",
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
        throw new Error("Failed to search resources")
      }
      const data = await response.json()
      setRessources(data)
    } catch (error) {
      console.error("Error searching resources:", error)
      toast({
        title: "Search Error",
        description: "Failed to search resources. Please try again.",
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
        throw new Error(errorData?.error || "Failed to create resource")
      }

      toast({
        title: "Success",
        description: "Resource created successfully",
      })

      setIsCreateDialogOpen(false)
      setFormData({ name: "" })
      fetchRessources()
    } catch (error) {
      console.error("Error creating resource:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create resource",
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
        throw new Error(errorData?.error || "Failed to update resource")
      }

      toast({
        title: "Success",
        description: "Resource updated successfully",
      })

      setIsEditDialogOpen(false)
      setSelectedRessource(null)
      setFormData({ name: "" })
      fetchRessources()
    } catch (error) {
      console.error("Error updating resource:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update resource",
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
        throw new Error(errorData?.error || "Failed to delete resource")
      }

      toast({
        title: "Success",
        description: "Resource deleted successfully",
      })

      setIsDeleteDialogOpen(false)
      setSelectedRessource(null)
      fetchRessources()
    } catch (error) {
      console.error("Error deleting resource:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete resource",
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
        <h1 className="text-3xl font-bold">Resource Management</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Resource
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search Resources</CardTitle>
          <CardDescription>Search resources by name</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by resource name..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch(searchQuery)}
              />
            </div>
            <Button onClick={() => handleSearch(searchQuery)}>Search</Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={fetchRessources}>
            <RefreshCw className="mr-2 h-4 w-4" /> Reset
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resources List</CardTitle>
          <CardDescription>Manage your resources</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : ressources.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No resources found. Add a new resource or adjust your search.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Updated At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(ressource)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDeleteDialog(ressource)}>
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

      {/* Create Resource Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Resource</DialogTitle>
            <DialogDescription>Enter the details for the new resource.</DialogDescription>
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
                placeholder="Enter resource name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRessource}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Resource Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Resource</DialogTitle>
            <DialogDescription>Update the details for this resource.</DialogDescription>
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
                placeholder="Enter resource name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRessource}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Resource Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the resource
              {selectedRessource && ` "${selectedRessource.name}"`} and remove it from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRessource} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}