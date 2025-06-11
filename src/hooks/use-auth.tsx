"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type RoleEnum =
  | "AGENT_ART"
  | "AGENT_RESSOURCES_HUMAINES"
  | "DIRECTEUR_RESSOURCES_HUMAINES"
  | "DIRECTEUR_PATRIMOINE"
  | "ADMIN"

interface Role {
  id: number
  name: string
  description: string
  created_at: string
  updated_at: string
}

interface Fonction {
  id: number
  nom: string
  rangNom: string
}

interface User {
  id: number
  name: string // Changé de username à name pour correspondre au backend
  email: string
  matricule: string
  quotaAnnuel: number
  role: Role // Structure complète du rôle  
  fonction: Fonction
  createdAt: string
  updatedAt: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (token: string, userData: User) => void
  logout: () => void
  hasPermission: (permissions: RoleEnum[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const formatRole = (role: RoleEnum | string): string => {
  return String(role).replace(/_/g, " ")
}

export const getRoleDisplayName = (role: RoleEnum | string): string => {
  const roleNames: Record<string, string> = {
    AGENT_ART: "Agent ART",
    AGENT_RESSOURCES_HUMAINES: "Agent Ressources Humaines",
    DIRECTEUR_RESSOURCES_HUMAINES: "Directeur Ressources Humaines",
    DIRECTEUR_PATRIMOINE: "Directeur Patrimoine",
    ADMIN: "Administrateur",
  }
  const roleString = String(role)
  return roleNames[roleString] || formatRole(roleString)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("authToken")

      if (token) {
        try {
          const response = await fetch("http://localhost:8080/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })

          if (response.ok) {
            const userData = await response.json()
            console.log("User data from backend:", userData)
            
            // Mapper les données du backend vers notre interface User
            const mappedUser: User = {
              id: userData.id,
              name: userData.name, // name du backend
              email: userData.email,
              matricule: userData.matricule,
              quotaAnnuel: userData.quotaAnnuel,
              role: userData.role, // Structure complète du rôle
              fonction: userData.fonction || { id: 0, nom: "Non défini", rangNom: "Non défini" },
              createdAt: userData.createdAt,
              updatedAt: userData.updatedAt
            }
            
            setUser(mappedUser)
          } else {
            localStorage.removeItem("authToken")
            console.error("Failed to fetch user data, status:", response.status)
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
          localStorage.removeItem("authToken")
          
          // Données mockées pour le développement uniquement
          // Supprimez cette partie en production
          if (process.env.NODE_ENV === "development") {
            const mockUser: User = {
              id: 1,
              name: "Christian MBIP",
              email: "christian@example.com",
              matricule: "MAT001",
              quotaAnnuel: 100,
              role: {
                id: 1,
                name: "ADMIN",
                description: "Administrateur système",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              },
              fonction: {
                id: 1,
                nom: "Administrateur Système",
                rangNom: "Administrateur",
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
            setUser(mockUser)
          }
        }
      }

      setLoading(false)
    }

    initAuth()
  }, [])

  const login = (token: string, userData: User) => {
    localStorage.setItem("authToken", token)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem("authToken")
    setUser(null)
  }

  const hasPermission = (allowedRoles: RoleEnum[]): boolean => {
    if (!user || !user.role) return false
    const userRoleName = user.role.name
    return allowedRoles.some((role) => String(role) === userRoleName)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}