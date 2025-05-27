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
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, MoreVertical, Edit, Trash, RefreshCw, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Types based on the Java DTOs
interface RoleDto {
  name: string
  code: string
}

interface PermissionResponseDto {
  id: number
  name: string
  code: string
  createdAt: string
  updatedAt: string
}

interface RoleResponseDto {
  id: number
  name: string
  code: string
  permissions: PermissionResponseDto[]
  createdAt: string
  updatedAt: string
}

interface RolePermissionUpdateDto {
  roleId: number
  permissionIds: number[]
}

export default function Roles() {
  const [roles, setRoles] = useState<RoleResponseDto[]>([])
  const [permissions, setPermissions] = useState<PermissionResponseDto[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState<RoleResponseDto | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false)
  const [formData, setFormData] = useState<RoleDto>({
    name: "",
    code: "",
  })
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([])

  const { toast } = useToast()

  // Fetch all roles and permissions on component mount
  useEffect(() => {
    fetchRoles()
    fetchPermissions()
  }, [])

  // Fetch all roles
  const fetchRoles = async () => {
    setLoading(true)
    try {
      const response = await fetch("http://localhost:8080/auth/roles/all")
      if (!response.ok) {
        throw new Error("Failed to fetch roles")
      }
      const data = await response.json()
      setRoles(data)
    } catch (error) {
      console.error("Error fetching roles:", error)
      toast({
        title: "Error",
        description: "Failed to load roles. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch all permissions
  const fetchPermissions = async () => {
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
    }
  }

  // Create a new role
  const handleCreateRole = async () => {
    try {
      const response = await fetch("http://localhost:8080/auth/roles/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData || "Failed to create role")
      }

      toast({
        title: "Success",
        description: "Role created successfully",
      })

      setIsCreateDialogOpen(false)
      setFormData({ name: "", code: "" })
      fetchRoles()
    } catch (error) {
      console.error("Error creating role:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create role",
        variant: "destructive",
      })
    }
  }

  // Update a role
  const handleUpdateRole = async () => {
    if (!selectedRole) return

    try {
      const response = await fetch(`http://localhost:8080/auth/roles/${selectedRole.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData || "Failed to update role")
      }

      toast({
        title: "Success",
        description: "Role updated successfully",
      })

      setIsEditDialogOpen(false)
      setSelectedRole(null)
      setFormData({ name: "", code: "" })
      fetchRoles()
    } catch (error) {
      console.error("Error updating role:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update role",
        variant: "destructive",
      })
    }
  }

  // Delete a role
  const handleDeleteRole = async () => {
    if (!selectedRole) return

    try {
      const response = await fetch(`http://localhost:8080/auth/roles/${selectedRole.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData || "Failed to delete role")
      }

      toast({
        title: "Success",
        description: "Role deleted successfully",
      })

      setIsDeleteDialogOpen(false)
      setSelectedRole(null)
      fetchRoles()
    } catch (error) {
      console.error("Error deleting role:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete role",
        variant: "destructive",
      })
    }
  }

  // Update role permissions
  const handleUpdateRolePermissions = async () => {
    if (!selectedRole) return

    const updateDto: RolePermissionUpdateDto = {
      roleId: selectedRole.id,
      permissionIds: selectedPermissions,
    }

    try {
      const response = await fetch("http://localhost:8080/auth/roles/permissions", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateDto),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData || "Failed to update role permissions")
      }

      toast({
        title: "Success",
        description: "Role permissions updated successfully",
      })

      setIsPermissionsDialogOpen(false)
      setSelectedRole(null)
      setSelectedPermissions([])
      fetchRoles()
    } catch (error) {
      console.error("Error updating role permissions:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update role permissions",
        variant: "destructive",
      })
    }
  }

  // Open edit dialog and populate form
  const openEditDialog = (role: RoleResponseDto) => {
    setSelectedRole(role)
    setFormData({
      name: role.name,
      code: role.code,
    })
    setIsEditDialogOpen(true)
  }

  // Open delete dialog
  const openDeleteDialog = (role: RoleResponseDto) => {
    setSelectedRole(role)
    setIsDeleteDialogOpen(true)
  }

  // Open permissions dialog
  const openPermissionsDialog = (role: RoleResponseDto) => {
    setSelectedRole(role)
    setSelectedPermissions(role.permissions.map((p) => p.id))
    setIsPermissionsDialogOpen(true)
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Role Management</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Role
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Roles List</CardTitle>
          <CardDescription>Manage your roles and their permissions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : roles.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No roles found. Add a new role to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Updated At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>{role.id}</TableCell>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell>{role.code}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.length > 0 ? (
                          role.permissions.map((permission) => (
                            <span
                              key={permission.id}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                            >
                              {permission.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted-foreground">No permissions</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(role.createdAt)}</TableCell>
                    <TableCell>{formatDate(role.updatedAt)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(role)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openPermissionsDialog(role)}>
                            <Shield className="mr-2 h-4 w-4" /> Manage Permissions
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDeleteDialog(role)}>
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

      {/* Create Role Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Role</DialogTitle>
            <DialogDescription>Enter the details for the new role.</DialogDescription>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRole}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>Update the details for this role.</DialogDescription>
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
                Description
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
            <Button onClick={handleUpdateRole}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Permissions Dialog */}
      <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Permissions</DialogTitle>
            <DialogDescription>Select the permissions for the role {selectedRole?.name}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {permissions.map((permission) => (
                  <div key={permission.id} className="flex items-start space-x-2">
                    <Checkbox
                      id={`permission-${permission.id}`}
                      checked={selectedPermissions.includes(permission.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedPermissions([...selectedPermissions, permission.id])
                        } else {
                          setSelectedPermissions(selectedPermissions.filter((id) => id !== permission.id))
                        }
                      }}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor={`permission-${permission.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {permission.name}
                      </Label>
                      <p className="text-sm text-muted-foreground">{permission.code}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPermissionsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRolePermissions}>Save Permissions</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Role Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the role
              {selectedRole && ` "${selectedRole.name}"`} and remove it from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRole} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
