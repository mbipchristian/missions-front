"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Plus, MoreVertical, Edit, Trash, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Types based on the Java DTOs
interface PermissionDto {
  name: string
  code: string
  icone: string
  url: string
}

interface PermissionResponseDto {
  id: number
  name: string
  code: string
  createdAt: string
  updatedAt: string
}

export default function Permissions() {
  const [permissions, setPermissions] = useState<PermissionResponseDto[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPermission, setSelectedPermission] = useState<PermissionResponseDto | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [formData, setFormData] = useState<PermissionDto>({
    name: "",
    code: "",
    icone: "",
    url: "",
  })

  const { toast } = useToast()

  // Fetch all permissions on component mount
  useEffect(() => {
    fetchPermissions()
  }, [])

  // Fetch all permissions
  const fetchPermissions = async () => {
    setLoading(true)
    try {
      const response = await fetch("http://localhost:8080/auth/permissions/all")
      if (!response.ok) {
        throw new Error("Failed to fetch permissions")
      }
      const data = await response.json()
      setPermissions(data)
    } catch (error) {
      console.error("Error fetching permissions:", error)
      toast({
        title: "Error",
        description: "Failed to load permissions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Create a new permission
  const handleCreatePermission = async () => {
    try {
      const response = await fetch("http://localhost:8080/auth/permissions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData || "Failed to create permission")
      }

      toast({
        title: "Success",
        description: "Permission created successfully",
      })

      setIsCreateDialogOpen(false)
      setFormData({ name: "", code: "", icone: "", url: "" })
      fetchPermissions()
    } catch (error) {
      console.error("Error creating permission:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create permission",
        variant: "destructive",
      })
    }
  }

  // Update a permission
  const handleUpdatePermission = async () => {
    if (!selectedPermission) return

    try {
      const response = await fetch(`http://localhost:8080/auth/permissions/${selectedPermission.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData || "Failed to update permission")
      }

      toast({
        title: "Success",
        description: "Permission updated successfully",
      })

      setIsEditDialogOpen(false)
      setSelectedPermission(null)
      setFormData({ name: "", code: "", icone: "", url: "" })
      fetchPermissions()
    } catch (error) {
      console.error("Error updating permission:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update permission",
        variant: "destructive",
      })
    }
  }

  // Delete a permission
  const handleDeletePermission = async () => {
    if (!selectedPermission) return

    try {
      const response = await fetch(`http://localhost:8080/auth/permissions/${selectedPermission.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData || "Failed to delete permission")
      }

      toast({
        title: "Success",
        description: "Permission deleted successfully",
      })

      setIsDeleteDialogOpen(false)
      setSelectedPermission(null)
      fetchPermissions()
    } catch (error) {
      console.error("Error deleting permission:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete permission",
        variant: "destructive",
      })
    }
  }

  // Open edit dialog and populate form
  const openEditDialog = (permission: PermissionResponseDto) => {
    setSelectedPermission(permission)
    setFormData({
      name: permission.name,
      code: permission.code,
      icone: "", // Assuming icon is not editable for now
      url: "", // Assuming URL is not editable for now
    })
    setIsEditDialogOpen(true)
  }

  // Open delete dialog
  const openDeleteDialog = (permission: PermissionResponseDto) => {
    setSelectedPermission(permission)
    setIsDeleteDialogOpen(true)
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Permission Management</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Permission
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Permissions List</CardTitle>
          <CardDescription>Manage your permissions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : permissions.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No permissions found. Add a new permission to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Updated At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions.map((permission) => (
                  <TableRow key={permission.id}>
                    <TableCell>{permission.id}</TableCell>
                    <TableCell className="font-medium">{permission.name}</TableCell>
                    <TableCell>{permission.code}</TableCell>
                    <TableCell>{formatDate(permission.createdAt)}</TableCell>
                    <TableCell>{formatDate(permission.updatedAt)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(permission)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDeleteDialog(permission)}>
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

      {/* Create Permission Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Permission</DialogTitle>
            <DialogDescription>Enter the details for the new permission.</DialogDescription>
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
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePermission}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Permission Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Permission</DialogTitle>
            <DialogDescription>Update the details for this permission.</DialogDescription>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePermission}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Permission Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the permission
              {selectedPermission && ` "${selectedPermission.name}"`} and remove it from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePermission} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
