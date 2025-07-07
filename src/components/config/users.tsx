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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, MoreVertical, Trash, RefreshCw, User, Mail, Shield, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Types based on the Java DTOs
interface UserResponseDto {
  id: number
  username: string
  email: string
  matricule: string
  role: {
    id: number
    name: string
    description: string
  }
  fonction: {
    id: number
    nom: string
    rangId: number
    rangNom: string
    rangCode: string
  }
  quotaAnnuel: number
  createdAt: string
  updatedAt: string
}

interface RoleResponseDto {
  id: number
  name: string
  description: string
}

interface UserRoleUpdateDto {
  userId: number
  roleId: number
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserResponseDto[]>([])
  const [roles, setRoles] = useState<RoleResponseDto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchType, setSearchType] = useState<"email" | "username">("email")
  const [selectedUser, setSelectedUser] = useState<UserResponseDto | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [selectedRoleId, setSelectedRoleId] = useState<string>("")

  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Fetch all users and roles on component mount
  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [])

  // Handle search from URL params
  useEffect(() => {
    const q = searchParams.get("q")
    const type = searchParams.get("type") as "email" | "username"

    if (q) {
      setSearchQuery(q)
      if (type && (type === "email" || type === "username")) {
        setSearchType(type)
        handleSearch(q, type)
      } else {
        handleSearch(q, "email")
      }
    }
  }, [searchParams])

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch("http://localhost:8080/auth/users/all")
      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch all roles
  const fetchRoles = async () => {
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
    }
  }

  // Search users by email or username
  const handleSearch = async (query: string, type: "email" | "username") => {
    if (!query.trim()) {
      fetchUsers()
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`http://localhost:8080/auth/users/${type}/${encodeURIComponent(query)}`)
      if (!response.ok) {
        if (response.status === 404) {
          setUsers([])
          toast({
            title: "No Results",
            description: `No user found with ${type}: ${query}`,
            variant: "default",
          })
        } else {
          throw new Error(`Failed to search users by ${type}`)
        }
      } else {
        const data = await response.json()
        setUsers([data]) // Single user result
      }
    } catch (error) {
      console.error(`Error searching users by ${type}:`, error)
      toast({
        title: "Search Error",
        description: `Failed to search users by ${type}. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Delete a user
  const handleDeleteUser = async () => {
    if (!selectedUser) return

    try {
      const response = await fetch(`http://localhost:8080/auth/users/${selectedUser.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete user")
      }

      toast({
        title: "Success",
        description: "User deleted successfully",
      })

      setIsDeleteDialogOpen(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete user",
        variant: "destructive",
      })
    }
  }

  // Update user role
  const handleUpdateUserRole = async () => {
    if (!selectedUser || !selectedRoleId) return

    const updateDto: UserRoleUpdateDto = {
      userId: selectedUser.id,
      roleId: Number.parseInt(selectedRoleId),
    }

    try {
      const response = await fetch(`http://localhost:8080/auth/users/${selectedUser.id}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateDto),
      })

      if (!response.ok) {
        throw new Error("Failed to update user role")
      }

      toast({
        title: "Success",
        description: "User role updated successfully",
      })

      setIsRoleDialogOpen(false)
      setSelectedUser(null)
      setSelectedRoleId("")
      fetchUsers()
    } catch (error) {
      console.error("Error updating user role:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update user role",
        variant: "destructive",
      })
    }
  }

  // Open delete dialog
  const openDeleteDialog = (user: UserResponseDto) => {
    setSelectedUser(user)
    setIsDeleteDialogOpen(true)
  }

  // Open view dialog
  const openViewDialog = (user: UserResponseDto) => {
    setSelectedUser(user)
    setIsViewDialogOpen(true)
  }

  // Open role dialog
  const openRoleDialog = (user: UserResponseDto) => {
    setSelectedUser(user)
    setSelectedRoleId(user.role.id.toString())
    setIsRoleDialogOpen(true)
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("fr-FR")
  }

  // Get user initials for avatar
  const getUserInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase()
  }

  // Get role color
  const getRoleColor = (roleName: string) => {
    const colors: Record<string, string> = {
      admin: "bg-red-100 text-red-800",
      manager: "bg-blue-100 text-blue-800",
      user: "bg-green-100 text-green-800",
      guest: "bg-gray-100 text-gray-800",
    }
    return colors[roleName.toLowerCase()] || "bg-purple-100 text-purple-800"
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
        <Button onClick={() => router.push("/register")}>
          <User className="mr-2 h-4 w-4" /> Nouvel Utilisateur
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Rechercher des Utilisateurs</CardTitle>
          <CardDescription>Recherchez des utilisateurs par email ou nom d&apos;utilisateur</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="email"
            value={searchType}
            onValueChange={(value) => setSearchType(value as "email" | "username")}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="email">Recherche par Email</TabsTrigger>
              <TabsTrigger value="username">Recherche par Nom d&apos;utilisateur</TabsTrigger>
            </TabsList>
            <TabsContent value="email">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Rechercher par email..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch(searchQuery, "email")}
                  />
                </div>
                <Button onClick={() => handleSearch(searchQuery, "email")}>Rechercher</Button>
              </div>
            </TabsContent>
            <TabsContent value="username">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Rechercher par nom d'utilisateur..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch(searchQuery, "username")}
                  />
                </div>
                <Button onClick={() => handleSearch(searchQuery, "username")}>Rechercher</Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={fetchUsers}>
            <RefreshCw className="mr-2 h-4 w-4" /> Réinitialiser
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Utilisateurs</CardTitle>
          <CardDescription>Gérez vos utilisateurs</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              Aucun utilisateur trouvé. Ajustez votre recherche ou ajoutez un nouvel utilisateur.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Matricule</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Fonction</TableHead>
                  <TableHead>Quota Annuel</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead>Mis à jour le</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{getUserInitials(user.username)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.username}</div>
                          <div className="text-sm text-muted-foreground">ID: {user.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{user.matricule}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getRoleColor(user.role.name)}>
                        <Shield className="h-3 w-3 mr-1" />
                        {user.role.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.fonction.nom}</span>
                        <span className="text-sm text-muted-foreground">
                          {user.fonction.rangNom} ({user.fonction.rangCode})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.quotaAnnuel} jours</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell>{formatDate(user.updatedAt)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Ouvrir le menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openViewDialog(user)}>
                            <Eye className="mr-2 h-4 w-4" /> Voir détails
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openRoleDialog(user)}>
                            <Shield className="mr-2 h-4 w-4" /> Changer le rôle
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDeleteDialog(user)}>
                            <Trash className="mr-2 h-4 w-4" /> Supprimer
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

      {/* View User Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Détails de l&apos;Utilisateur</DialogTitle>
            <DialogDescription>Informations complètes sur l&apos;utilisateur.</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="grid gap-6 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">{getUserInitials(selectedUser.username)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedUser.username}</h3>
                  <p className="text-sm text-muted-foreground">ID: {selectedUser.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
                  <p className="text-base">{selectedUser.email}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Matricule</h4>
                  <p className="text-base font-mono">{selectedUser.matricule}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Rôle</h4>
                  <div className="mt-1">
                    <Badge variant="outline" className={getRoleColor(selectedUser.role.name)}>
                      <Shield className="h-3 w-3 mr-1" />
                      {selectedUser.role.name}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">{selectedUser.role.description}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Fonction</h4>
                  <div className="mt-1">
                    <p className="font-medium">{selectedUser.fonction.nom}</p>
                    <p className="text-sm text-muted-foreground">
                      Rang: {selectedUser.fonction.rangNom} ({selectedUser.fonction.rangCode})
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Quota Annuel</h4>
                <div className="mt-1">
                  <p className="font-medium">{selectedUser.quotaAnnuel} jours utilisés</p>
                  <p className="text-sm text-muted-foreground">sur l&apos;année {new Date().getFullYear()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Créé le</h4>
                  <p className="text-sm">{formatDate(selectedUser.createdAt)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Dernière mise à jour</h4>
                  <p className="text-sm">{formatDate(selectedUser.updatedAt)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Role Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changer le Rôle de l&apos;Utilisateur</DialogTitle>
            <DialogDescription>Sélectionnez un nouveau rôle pour {selectedUser?.username}.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="role">Nouveau Rôle</Label>
              <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{role.name}</div>
                          <div className="text-sm text-muted-foreground">{role.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedUser && (
              <div className="text-sm text-muted-foreground">
                Rôle actuel: <strong>{selectedUser.role.name}</strong>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateUserRole} disabled={!selectedRoleId}>
              Mettre à jour
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Cela supprimera définitivement l&apos;utilisateur
              {selectedUser && ` "${selectedUser.username}"`} et toutes ses données associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
