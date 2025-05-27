"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

interface RoleResponseDto {
  id: number
  name: string
  description: string
}

interface UserRoleUpdateDto {
  userId: number
  roleId: number
}

export default function UpdateUserRole() {
  const [roles, setRoles] = useState<RoleResponseDto[]>([])
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string>("")
  const [selectedRoleId, setSelectedRoleId] = useState<string>("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { toast } = useToast()

  // Fetch all roles on component mount
  useEffect(() => {
    fetchRoles()
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

  // Update user role
  const handleUpdateUserRole = async () => {
    if (!userId || !selectedRoleId) {
      toast({
        title: "Error",
        description: "User ID and Role are required",
        variant: "destructive",
      })
      return
    }

    const userIdNum = Number.parseInt(userId, 10)
    const roleIdNum = Number.parseInt(selectedRoleId, 10)

    if (isNaN(userIdNum) || isNaN(roleIdNum)) {
      toast({
        title: "Error",
        description: "Invalid User ID or Role ID",
        variant: "destructive",
      })
      return
    }

    const updateDto: UserRoleUpdateDto = {
      userId: userIdNum,
      roleId: roleIdNum,
    }

    try {
      const response = await fetch(`http://localhost:8080/auth/users/${userIdNum}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateDto),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData?.error || "Failed to update user role")
      }

      toast({
        title: "Success",
        description: "User role updated successfully",
      })

      setIsDialogOpen(true)
    } catch (error) {
      console.error("Error updating user role:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update user role",
        variant: "destructive",
      })
    }
  }

  // Reset form
  const resetForm = () => {
    setUserId("")
    setSelectedRoleId("")
    setIsDialogOpen(false)
  }

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Update User Role</CardTitle>
            <CardDescription>Assign a new role to a user</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  type="number"
                  placeholder="Enter user ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleUpdateUserRole} disabled={!userId || !selectedRoleId || loading}>
                Update Role
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Success Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Role Updated</DialogTitle>
            <DialogDescription>The user's role has been updated successfully.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={resetForm}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
