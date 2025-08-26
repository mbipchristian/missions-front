"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
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
import { Eye, EyeOff, UserPlus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Types based on the Java DTOs
interface RegisterUserDto {
  matricule: string
  email: string
  password: string
  username: string
  roleId: number
  rangId: number
  quotaAnnuel: number
  fonction: string
}

interface RoleResponseDto {
  id: number
  name: string
  description: string
}

interface RangResponseDto {
  id: number
  nom: string
  description: string
  rang: number
}

interface UserRegistrationFormProps {
  onSuccess?: () => void
  className?: string
}

export default function UserRegistrationForm({ onSuccess, className }: UserRegistrationFormProps) {
  const t = useTranslations("UserRegistrationForm")
  const [roles, setRoles] = useState<RoleResponseDto[]>([])
  const [rangs, setRangs] = useState<RangResponseDto[]>([])
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false)
  const [fonctionSearch, setFonctionSearch] = useState("")
  const [showFonctionDropdown, setShowFonctionDropdown] = useState(false)
  const [formData, setFormData] = useState<RegisterUserDto>({
    matricule: "",
    email: "",
    password: "",
    username: "",
    roleId: 0,
    rangId: 0,
    quotaAnnuel: 0,
    fonction: "",
  })

  const { toast } = useToast()

  // Fetch roles and rangs on component mount
  useEffect(() => {
    fetchRoles()
    fetchRangs()
  }, [])

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
        title: t("errors.title"),
        description: t("errors.fetchRoles"),
        variant: "destructive",
      })
    }
  }

  const fonctions = [
    "Directeur Général Adjoint",
    "conseiller technique", 
    "Secrétaire",
    "Directeur",
    "Responsable d'Audit",
    "chef de brigade",
    "chef de division",
    "Sous Directeur",
    "Auditeur junior",
    "Chargé d'étude",
    "Cadre PCA",
    "Chef de cellule",
    "Chef de brigade Adjoint",
    "Attaché de Direction",
    "Agent service",
    "chargée d'étude Assistant",
    "chef Secrétariat PCA",
    "Chef d'unité",
    "Chef Secrétariat DG",
    "comptable matière DG",
    "auditeur Junior",
    "Chef de bureau",
    "Chef Secrétariat",
    "Comptable matière",
    "Cadre",
    "Agent maîtrise",
    "AE",
    "Chauffeur"
  ]

  // Filtrer et trier les fonctions selon la recherche
  const filteredFonctions = fonctions
    .filter(fonction => 
      fonction.toLowerCase().includes(fonctionSearch.toLowerCase())
    )
    .sort((a, b) => a.localeCompare(b))

  // Fetch all rangs
  const fetchRangs = async () => {
    try {
      const response = await fetch("http://localhost:8080/auth/rangs/all")
      if (!response.ok) {
        throw new Error("Failed to fetch rangs")
      }
      const data = await response.json()
      setRangs(data)
    } catch (error) {
      console.error("Error fetching rangs:", error)
      toast({
        title: t("errors.title"),
        description: t("errors.fetchRangs"),
        variant: "destructive",
      })
    }
  }

  // Validate form data
  const validateForm = (): boolean => {
    if (!formData.matricule.trim()) {
      toast({
        title: t("validation.title"),
        description: t("validation.matriculeRequired"),
        variant: "destructive",
      })
      return false
    }

    if (!formData.email.trim()) {
      toast({
        title: t("validation.title"),
        description: t("validation.emailRequired"),
        variant: "destructive",
      })
      return false
    }

    if (!formData.email.includes("@")) {
      toast({
        title: t("validation.title"),
        description: t("validation.emailInvalid"),
        variant: "destructive",
      })
      return false
    }

    if (!formData.password.trim()) {
      toast({
        title: t("validation.title"),
        description: t("validation.passwordRequired"),
        variant: "destructive",
      })
      return false
    }

    if (formData.password.length < 6) {
      toast({
        title: t("validation.title"),
        description: t("validation.passwordMinLength"),
        variant: "destructive",
      })
      return false
    }

    if (!formData.username.trim()) {
      toast({
        title: t("validation.title"),
        description: t("validation.usernameRequired"),
        variant: "destructive",
      })
      return false
    }

    if (formData.roleId === 0) {
      toast({
        title: t("validation.title"),
        description: t("validation.roleRequired"),
        variant: "destructive",
      })
      return false
    }

    if (formData.rangId === 0) {
      toast({
        title: t("validation.title"),
        description: t("validation.rangRequired"),
        variant: "destructive",
      })
      return false
    }

    return true
  }

  // Handle user registration
  const handleRegister = async () => {
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch("http://localhost:8080/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData?.error || "Failed to register user")
      }

      toast({
        title: t("success.title"),
        description: t("success.userRegistered"),
      })

      setIsSuccessDialogOpen(true)
      onSuccess?.()
    } catch (error) {
      console.error("Error registering user:", error)
      toast({
        title: t("errors.title"),
        description: error instanceof Error ? error.message : t("errors.registerFailed"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      matricule: "",
      email: "",
      password: "",
      username: "",
      roleId: 0,
      rangId: 0,
      quotaAnnuel: 0,
      fonction: "",
    })
    setFonctionSearch("")
    setShowFonctionDropdown(false)
    setIsSuccessDialogOpen(false)
    
  }
  // Gérer la sélection d'une fonction
  const handleFonctionSelect = (fonction: string) => {
    setFormData({ ...formData, fonction })
    setFonctionSearch(fonction)
    setShowFonctionDropdown(false)
  }

  // Gérer le changement de la recherche de fonction
  const handleFonctionChange = (value: string) => {
    setFonctionSearch(value)
    setFormData({ ...formData, fonction: value })
    setShowFonctionDropdown(true)
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-6 w-6" />
            {t("registration.title")}
          </CardTitle>
          <CardDescription>{t("registration.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="matricule">{t("form.matricule")} *</Label>
                <Input
                  id="matricule"
                  placeholder={t("form.matriculePlaceholder")}
                  value={formData.matricule}
                  onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="username">{t("form.username")} *</Label>
                <Input
                  id="username"
                  placeholder={t("form.usernamePlaceholder")}
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">{t("form.email")} *</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("form.emailPlaceholder")}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">{t("form.password")} *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("form.passwordPlaceholder")}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="sr-only">{showPassword ? t("form.hidePassword") : t("form.showPassword")}</span>
                </Button>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="fonction">{t("form.fonction")} *</Label>
              <div className="relative">
                <Input
                  id="fonction"
                  placeholder={t("form.fonctionPlaceholder")}
                  value={fonctionSearch}
                  onChange={(e) => handleFonctionChange(e.target.value)}
                  onFocus={() => setShowFonctionDropdown(true)}
                  onBlur={() => {
                    setTimeout(() => setShowFonctionDropdown(false), 200)
                  }}
                  className="w-full"
                />
                {showFonctionDropdown && filteredFonctions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredFonctions.map((fonction, index) => (
                      <div
                        key={index}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        onMouseDown={(e) => {
                          e.preventDefault(); // Empêche le onBlur de l'input
                          handleFonctionSelect(fonction);
                        }}
                      >
                        {fonction}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="role">{t("form.role")} *</Label>
                <Select
                  value={formData.roleId.toString()}
                  onValueChange={(value) => setFormData({ ...formData, roleId: Number.parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("form.rolePlaceholder")} />
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
              <div className="grid gap-2">
                <Label htmlFor="rang">{t("form.rang")} *</Label>
                <Select
                  value={formData.rangId.toString()}
                  onValueChange={(value) => setFormData({ ...formData, rangId: Number.parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("form.rangPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {rangs.map((rang) => (
                      <SelectItem key={rang.id} value={rang.id.toString()}>
                        {rang.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">{t("form.requiredFields")}</div>

            <Button onClick={handleRegister} disabled={loading} className="w-full">
              {loading ? t("form.registering") : t("form.registerButton")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Success Dialog */}
      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("successDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("successDialog.description")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={resetForm}>
              {t("successDialog.registerAnother")}
            </Button>
            <Button onClick={() => setIsSuccessDialogOpen(false)}>
              {t("successDialog.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}