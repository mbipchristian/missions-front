"use client"

import { useTranslations } from "next-intl"
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
import { Search, MoreVertical, Trash, RefreshCw, User, Mail, Shield, Eye, Star, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Types corrigés selon le DTO Java
interface UserResponseDto {
  id: number
  username: string
  email: string
  matricule: string
  quotaAnnuel: number
  role: {
    id: number
    name: string
    description: string
  }
  rang: {
    id: number
    nom: string
    code: string
    fraisExterne: number
    fraisInterne: number
  } | null

  fonction: string
  created_at: string
  updated_at: string
}

interface RoleResponseDto {
  id: number
  name: string
  description: string
}
interface RangResponseDto {
  id: number
  nom: string
  code: string
  fraisExterne: number
  fraisInterne: number
}

interface UserRoleUpdateDto {
  userId: number
  roleId: number
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserResponseDto[]>([])
  const [roles, setRoles] = useState<RoleResponseDto[]>([])
  const [rangs, setRangs] = useState<RangResponseDto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchType, setSearchType] = useState<"email" | "username">("email")
  const [selectedUser, setSelectedUser] = useState<UserResponseDto | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [selectedRoleId, setSelectedRoleId] = useState<string>("")
  const t = useTranslations("UsersPage")
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
        title: t("messages.error"),
        description: t("messages.failedToLoadUsers"),
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
        title: t("messages.error"),
        description: t("messages.failedToLoadRoles"),
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
            title: t("messages.noResults"),
            description: t("messages.noUserFound", { type, query }),
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
        title: t("messages.searchError"),
        description: t("messages.failedToSearch", { type }),
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
        title: t("messages.success"),
        description: t("messages.userDeletedSuccess"),
      })

      setIsDeleteDialogOpen(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: t("messages.error"),
        description: error instanceof Error ? error.message : t("messages.failedToDeleteUser"),
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
        title: t("messages.success"),
        description: t("messages.userRoleUpdatedSuccess"),
      })

      setIsRoleDialogOpen(false)
      setSelectedUser(null)
      setSelectedRoleId("")
      fetchUsers()
    } catch (error) {
      console.error("Error updating user role:", error)
      toast({
        title: t("messages.error"),
        description: error instanceof Error ? error.message : t("messages.failedToUpdateUserRole"),
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

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XAF",
    }).format(amount)
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

  // Get rang color
  const getRangColor = (rangCode: string) => {
    const colors: Record<string, string> = {
      A: "bg-yellow-100 text-yellow-800",
      B: "bg-orange-100 text-orange-800",
      C: "bg-blue-100 text-blue-800",
      DG: "bg-green-100 text-green-800",
    }
    return colors[rangCode] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <Button onClick={() => router.push("configurations/register")}>
          <User className="mr-2 h-4 w-4" /> {t("newUser")}
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t("searchTitle")}</CardTitle>
          <CardDescription>{t("searchDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="email"
            value={searchType}
            onValueChange={(value) => setSearchType(value as "email" | "username")}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="email">{t("searchByEmail")}</TabsTrigger>
              <TabsTrigger value="username">{t("searchByUsername")}</TabsTrigger>
            </TabsList>
            <TabsContent value="email">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={t("searchEmailPlaceholder")}
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch(searchQuery, "email")}
                  />
                </div>
                <Button onClick={() => handleSearch(searchQuery, "email")}>{t("searchButton")}</Button>
              </div>
            </TabsContent>
            <TabsContent value="username">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={t("searchUsernamePlaceholder")}
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch(searchQuery, "username")}
                  />
                </div>
                <Button onClick={() => handleSearch(searchQuery, "username")}>{t("searchButton")}</Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={fetchUsers}>
            <RefreshCw className="mr-2 h-4 w-4" /> {t("resetButton")}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("usersList")}</CardTitle>
          <CardDescription>{t("usersListDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">{t("noUsersFound")}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("tableHeaders.user")}</TableHead>
                    <TableHead>{t("tableHeaders.email")}</TableHead>
                    <TableHead>{t("tableHeaders.matricule")}</TableHead>
                    <TableHead>{t("tableHeaders.role")}</TableHead>
                    <TableHead>{t("tableHeaders.rang")}</TableHead>
                    <TableHead>{t("tableHeaders.fonction")}</TableHead>
                    <TableHead>{t("tableHeaders.quotaAnnuel")}</TableHead>
                    <TableHead>{t("tableHeaders.createdAt")}</TableHead>
                    <TableHead className="text-right">{t("tableHeaders.actions")}</TableHead>
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
                        {user.rang ? (
                          <div className="flex flex-col gap-1">
                            <Badge variant="outline" className={getRangColor(user.rang.code)}>
                              <Star className="h-3 w-3 mr-1" />
                              {user.rang.nom}
                            </Badge>
                            <div className="text-xs text-muted-foreground">
                              <div>Ext: {formatCurrency(user.rang.fraisExterne)}</div>
                              <div>Int: {formatCurrency(user.rang.fraisInterne)}</div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">{t("noRang")}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{user.fonction}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {user.quotaAnnuel} {t("days")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">{t("actions.openMenu")}</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openViewDialog(user)}>
                              <Eye className="mr-2 h-4 w-4" /> {t("actions.viewDetails")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openRoleDialog(user)}>
                              <Shield className="mr-2 h-4 w-4" /> {t("actions.changeRole")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openDeleteDialog(user)}>
                              <Trash className="mr-2 h-4 w-4" /> {t("actions.delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View User Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t("viewDialog.title")}</DialogTitle>
            <DialogDescription>{t("viewDialog.description")}</DialogDescription>
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
                  <h4 className="text-sm font-medium text-muted-foreground">{t("viewDialog.email")}</h4>
                  <p className="text-base">{selectedUser.email}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">{t("viewDialog.matricule")}</h4>
                  <p className="text-base font-mono">{selectedUser.matricule}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">{t("viewDialog.role")}</h4>
                  <div className="mt-1">
                    <Badge variant="outline" className={getRoleColor(selectedUser.role.name)}>
                      <Shield className="h-3 w-3 mr-1" />
                      {selectedUser.role.name}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">{selectedUser.role.description}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">{t("viewDialog.fonction")}</h4>
                  <div className="mt-1">
                    <p className="font-medium">{selectedUser.fonction}</p>
                  </div>
                </div>
              </div>

              {/* Section Rang */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">{t("viewDialog.rang")}</h4>
                {selectedUser.rang ? (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className={getRangColor(selectedUser.rang.code)}>
                        <Star className="h-3 w-3 mr-1" />
                        {selectedUser.rang.nom} ({selectedUser.rang.code})
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">{t("viewDialog.fraisExterne")}</span>
                        <div className="font-medium flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {formatCurrency(selectedUser.rang.fraisExterne)}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t("viewDialog.fraisInterne")}</span>
                        <div className="font-medium flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {formatCurrency(selectedUser.rang.fraisInterne)}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">{t("viewDialog.noRangAssigned")}</p>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground">{t("viewDialog.quotaAnnuel")}</h4>
                <div className="mt-1">
                  <p className="font-medium">
                    {selectedUser.quotaAnnuel} {t("viewDialog.daysUsed")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("viewDialog.onYear")} {new Date().getFullYear()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">{t("viewDialog.createdAt")}</h4>
                  <p className="text-sm">{formatDate(selectedUser.created_at)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">{t("viewDialog.updatedAt")}</h4>
                  <p className="text-sm">{formatDate(selectedUser.updated_at)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>{t("viewDialog.close")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Role Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("roleDialog.title")}</DialogTitle>
            <DialogDescription>{t("roleDialog.description", { username: selectedUser?.username })}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="role">{t("roleDialog.newRole")}</Label>
              <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                <SelectTrigger>
                  <SelectValue placeholder={t("roleDialog.selectRole")} />
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
                {t("roleDialog.currentRole")} <strong>{selectedUser.role.name}</strong>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
              {t("roleDialog.cancel")}
            </Button>
            <Button onClick={handleUpdateUserRole} disabled={!selectedRoleId}>
              {t("roleDialog.update")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteDialog.description", { username: selectedUser?.username })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("deleteDialog.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground">
              {t("deleteDialog.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
