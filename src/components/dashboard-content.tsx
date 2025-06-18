"use client"

import { useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts"
import { Calendar, User, Users, FileText, Package, MapPin, AlertTriangle, Shield } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/hooks/use-auth"

interface DashboardStats {
  missionDays: number
  maxDays: number
  totalMissions: number
  activeMissions: number
  pendingApprovals: number
  resourceCount: number
  lowStockResources: number
  userCount: number
  budget: number
  budgetUsed: number
}

export function DashboardContent() {
  const { user, hasPermission } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    missionDays: 65,
    maxDays: 100,
    totalMissions: 24,
    activeMissions: 8,
    pendingApprovals: 5,
    resourceCount: 150,
    lowStockResources: 8,
    userCount: 45,
    budget: 250000,
    budgetUsed: 125000,
  })

  const currentYear = new Date().getFullYear()

  // Données pour le graphique des jours de mission
  const missionData = [
    { name: "Jours utilisés", value: stats.missionDays, color: "#0ea5e9" },
    { name: "Jours restants", value: stats.maxDays - stats.missionDays, color: "#e2e8f0" },
  ]

  // Données pour les graphiques par rôle
  const getMissionsByMonth = () => [
    { month: "Jan", missions: 12 },
    { month: "Fév", missions: 19 },
    { month: "Mar", missions: 15 },
    { month: "Avr", missions: 22 },
    { month: "Mai", missions: 18 },
    { month: "Juin", missions: 25 },
  ]

  const getResourcesByType = () => [
    { type: "Informatique", count: 45, color: "#0ea5e9" },
    { type: "Transport", count: 28, color: "#10b981" },
    { type: "Communication", count: 32, color: "#f59e0b" },
    { type: "Bureautique", count: 45, color: "#ef4444" },
  ]

  const getUsersByDepartment = () => [
    { dept: "RH", count: 12, color: "#8b5cf6" },
    { dept: "Technique", count: 18, color: "#06b6d4" },
    { dept: "Administration", count: 15, color: "#84cc16" },
  ]

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <User className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      AGENT_ART: "Agent ART",
      AGENT_RESSOURCES_HUMAINES: "Agent Ressources Humaines",
      DIRECTEUR_RESSOURCES_HUMAINES: "Directeur Ressources Humaines",
      DIRECTEUR_PATRIMOINE: "Directeur Patrimoine",
      ADMIN: "Administrateur",
    }
    const roleString = String(role)
    return roleNames[roleString as keyof typeof roleNames] || roleString
  }

  return (
    <div className="flex flex-col">
      <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Tableau de bord - {getRoleDisplayName(String(user.role))}</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            {currentYear}
          </Button>
          <Avatar>
            <AvatarImage src="/placeholder-user.jpg" alt="User" />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="space-y-6">
          {/* Message de bienvenue personnalisé */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Bienvenue {user.name}, vous êtes connecté en tant que {getRoleDisplayName(user.role.name)}.
            </AlertDescription>
          </Alert>

          {/* Statistiques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Statistiques communes à tous les rôles */}
        

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Mes Jours de Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.missionDays}</div>
                <Progress className="mt-2" value={(stats.missionDays / stats.maxDays) * 100} />
                <p className="text-xs text-muted-foreground mt-1">sur {stats.maxDays} jours autorisés</p>
              </CardContent>
            </Card>

            

            

            {/* Statistiques pour les directeurs */}
            {hasPermission(["DIRECTEUR_RESSOURCES_HUMAINES", "DIRECTEUR_PATRIMOINE", "ADMIN"]) && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Approbations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
                  <p className="text-xs text-muted-foreground mt-1">En attente de validation</p>
                </CardContent>
              </Card>
            )}

            
          </div>

          {/* Contenu principal avec onglets basés sur le rôle */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>

              {/* Onglet RH pour les rôles concernés */}
              {hasPermission(["AGENT_RESSOURCES_HUMAINES", "DIRECTEUR_RESSOURCES_HUMAINES", "ADMIN"]) && (
                <TabsTrigger value="hr">Ressources Humaines</TabsTrigger>
              )}

              {/* Onglet Ressources pour les rôles concernés */}
              {hasPermission(["AGENT_ART", "DIRECTEUR_PATRIMOINE", "ADMIN"]) && (
                <TabsTrigger value="resources">Ressources</TabsTrigger>
              )}

              {/* Onglet Approbations pour les directeurs */}
              {hasPermission(["DIRECTEUR_RESSOURCES_HUMAINES", "DIRECTEUR_PATRIMOINE", "ADMIN"]) && (
                <TabsTrigger value="approvals">Approbations</TabsTrigger>
              )}
            </TabsList>

            {/* Onglet Vue d'ensemble */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Graphique des jours de mission - pour tous */}
                <Card>
                  <CardHeader>
                    <CardTitle>Jours de mission</CardTitle>
                    <CardDescription>Suivi des jours de mission pour l&apos;année {currentYear}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={missionData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {missionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} jours`, null]} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        Vous avez utilisé <span className="font-bold text-primary">{stats.missionDays} jours</span> sur
                        un maximum de {stats.maxDays} jours autorisés.
                      </p>
                      {stats.missionDays > 80 && (
                        <p className="mt-2 text-sm text-orange-500 font-medium">
                          Attention: Vous approchez de la limite annuelle de jours de mission.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Évolution des missions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Évolution des missions</CardTitle>
                    <CardDescription>Nombre de missions par mois</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getMissionsByMonth()}>
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="missions" fill="#0ea5e9" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Onglet RH */}
            {hasPermission(["AGENT_RESSOURCES_HUMAINES", "DIRECTEUR_RESSOURCES_HUMAINES", "ADMIN"]) && (
              <TabsContent value="hr" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Répartition du personnel</CardTitle>
                      <CardDescription>Personnel par département</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={getUsersByDepartment()}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              dataKey="count"
                              label={({ dept, count }) => `${dept}: ${count}`}
                            >
                              {getUsersByDepartment().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Actions RH rapides</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button className="w-full justify-start" variant="outline">
                        <Users className="mr-2 h-4 w-4" />
                        Gérer les utilisateurs
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <User className="mr-2 h-4 w-4" />
                        Créer un compte
                      </Button>
                      {hasPermission(["DIRECTEUR_RESSOURCES_HUMAINES", "ADMIN"]) && (
                        <Button className="w-full justify-start" variant="outline">
                          <Shield className="mr-2 h-4 w-4" />
                          Gérer les fonctions
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            )}

            {/* Onglet Ressources */}
            {hasPermission(["AGENT_ART", "DIRECTEUR_PATRIMOINE", "ADMIN"]) && (
              <TabsContent value="resources" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Ressources par type</CardTitle>
                      <CardDescription>Répartition de l&apos;inventaire</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={getResourcesByType()}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              dataKey="count"
                              label={({ type, count }) => `${type}: ${count}`}
                            >
                              {getResourcesByType().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Actions rapides</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button className="w-full justify-start" variant="outline">
                        <Package className="mr-2 h-4 w-4" />
                        Gérer les ressources
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <MapPin className="mr-2 h-4 w-4" />
                        Gérer les villes
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Alertes de stock ({stats.lowStockResources})
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            )}

            {/* Onglet Approbations */}
            {hasPermission(["DIRECTEUR_RESSOURCES_HUMAINES", "DIRECTEUR_PATRIMOINE", "ADMIN"]) && (
              <TabsContent value="approvals" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Approbations en attente</CardTitle>
                    <CardDescription>{stats.pendingApprovals} éléments nécessitent votre validation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[...Array(stats.pendingApprovals)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Ordre de mission OM-2023-{40 + i}</p>
                              <p className="text-sm text-muted-foreground">Soumis par Agent {i + 1}</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              Voir
                            </Button>
                            <Button size="sm">Approuver</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>
    </div>
  )
}
