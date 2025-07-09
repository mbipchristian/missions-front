"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Users, Calendar, TrendingUp, Activity, ChevronRight } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { apiService } from "@/lib/api"

interface User {
  id: number
  username: string
  email: string
  matricule: string
  quotaAnnuel: number
  fonction: string
}

interface Mandat {
  id: number
  reference: string
  statut: string
  duree: number
  users: User[]
}

interface DashboardStats {
  usersWithMostDays: Array<{ name: string; days: number }>
  usersWithLeastDays: Array<{ name: string; days: number }>
  currentUserDays: number
  currentUserQuota: number
  mandatsByStatus: Array<{ status: string; count: number; color: string }>
}

type ModalType = "most-days" | "least-days" | "user-quota" | "status-analysis" | null

export default function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeModal, setActiveModal] = useState<ModalType>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Récupérer les données en parallèle
      const [users, mandats, currentUser] = await Promise.all([
        apiService.getAllUsers(),
        apiService.getAllMandats(),
        apiService.getCurrentUser(),
      ])

      // Calculer les statistiques des utilisateurs par jours de missions
      const sortedUsersByDays = users
        .filter((user: User) => user.quotaAnnuel > 0)
        .sort((a: User, b: User) => b.quotaAnnuel - a.quotaAnnuel)

      const usersWithMostDays = sortedUsersByDays.slice(0, 5).map((user: User) => ({
        name: user.username,
        days: user.quotaAnnuel,
      }))

      const usersWithLeastDays = sortedUsersByDays
        .slice(-5)
        .reverse()
        .map((user: User) => ({
          name: user.username,
          days: user.quotaAnnuel,
        }))

      // Statistiques de l'utilisateur connecté
      const currentUserDays = currentUser.quotaAnnuel || 0
      const currentUserQuota = 100 // Quota maximum par défaut

      // Statistiques des mandats par statut
      const statusCounts = mandats.reduce((acc: any, mandat: Mandat) => {
        acc[mandat.statut] = (acc[mandat.statut] || 0) + 1
        return acc
      }, {})

      const statusColors: { [key: string]: string } = {
        EN_ATTENTE_EXECUTION: "#f59e0b",
        EN_COURS: "#3b82f6",
        ACHEVE: "#10b981",
        EN_ATTENTE_CONFIRMATION: "#6b7280",
      }

      const statusLabels: { [key: string]: string } = {
        EN_ATTENTE_EXECUTION: "En attente d'exécution",
        EN_COURS: "En cours",
        ACHEVE: "Achevées",
        EN_ATTENTE_CONFIRMATION: "En attente de confirmation",
      }

      const mandatsByStatus = Object.entries(statusCounts).map(([status, count]) => ({
        status: statusLabels[status] || status,
        count: count as number,
        color: statusColors[status] || "#6b7280",
      }))

      setStats({
        usersWithMostDays,
        usersWithLeastDays,
        currentUserDays,
        currentUserQuota,
        mandatsByStatus,
      })
    } catch (err) {
      setError("Erreur lors du chargement des données du dashboard")
      console.error("Dashboard error:", err)
    } finally {
      setLoading(false)
    }
  }

  const chartConfig = {
    days: {
      label: "Jours",
      color: "hsl(var(--chart-1))",
    },
    count: {
      label: "Nombre",
      color: "hsl(var(--chart-2))",
    },
  }

  if (loading) {
    return (
      <div className="h-screen grid grid-cols-2 grid-rows-2 gap-6 p-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!stats) return null

  const getQuotaStatus = () => {
    if (stats.currentUserDays >= stats.currentUserQuota) return { text: "Quota dépassé", color: "text-red-600" }
    if (stats.currentUserDays >= stats.currentUserQuota * 0.8)
      return { text: "Proche du quota", color: "text-orange-600" }
    return { text: "Vous pouvez encore faire des missions cette année !"}
  }

  const quotaStatus = getQuotaStatus()
  const totalMissions = stats.mandatsByStatus.reduce((sum, s) => sum + s.count, 0)

  return (
    <>
      <div className="h-screen grid grid-cols-2 grid-rows-2 gap-6 p-6">
        {/* Quartier 1: Top utilisateurs - Plus de jours */}
        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow duration-200 group bg-blue-50"
          onClick={() => setActiveModal("most-days")}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Top Utilisateurs
              </div>
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform " />
            </CardTitle>
            <CardDescription>Plus de jours de missions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-green-600">{stats.usersWithMostDays[0]?.days || 0}</div>
              <div className="text-sm text-muted-foreground">
                Jours max: {stats.usersWithMostDays[0]?.name || "N/A"}
              </div>
              <div className="text-xs text-muted-foreground">Cliquez pour voir le top 5</div>
            </div>
          </CardContent>
        </Card>

        {/* Quartier 2: Top utilisateurs - Moins de jours */}
        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow duration-200 group bg-green-50"
          onClick={() => setActiveModal("least-days")}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Utilisateurs Disponibles
              </div>
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </CardTitle>
            <CardDescription>Moins de jours de missions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-600">{stats.usersWithLeastDays[0]?.days || 0}</div>
              <div className="text-sm text-muted-foreground">
                Jours min: {stats.usersWithLeastDays[0]?.name || "N/A"}
              </div>
              <div className="text-xs text-muted-foreground">Cliquez pour voir le top 5</div>
            </div>
          </CardContent>
        </Card>

        {/* Quartier 3: Mon quota */}
        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow duration-200 group bg-green-50"
          onClick={() => setActiveModal("user-quota")}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Mon Quota
              </div>
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </CardTitle>
            <CardDescription>Mes jours de missions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-600">
                {stats.currentUserDays}/{stats.currentUserQuota}
              </div>
              <div className={`text-sm font-medium ${quotaStatus.color}`}>{quotaStatus.text}</div>
              <div className="text-xs text-muted-foreground">Cliquez pour voir les détails</div>
            </div>
          </CardContent>
        </Card>

        {/* Quartier 4: Analyse des statuts */}
        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow duration-200 group bg-blue-50"
          onClick={() => setActiveModal("status-analysis")}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                Analyse Missions
              </div>
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </CardTitle>
            <CardDescription>Répartition par statut</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-green-600">{totalMissions}</div>
              <div className="text-sm text-muted-foreground">Total des missions</div>
              <div className="text-xs text-muted-foreground">Cliquez pour voir la répartition</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal pour Top utilisateurs - Plus de jours */}
      <Dialog open={activeModal === "most-days"} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top 5 - Plus de jours de missions
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <ChartContainer config={chartConfig} className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.usersWithMostDays} layout="horizontal">
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="days" fill="var(--color-days)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal pour Top utilisateurs - Moins de jours */}
      <Dialog open={activeModal === "least-days"} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top 5 - Moins de jours de missions
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <ChartContainer config={chartConfig} className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.usersWithLeastDays} layout="horizontal">
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="days" fill="hsl(var(--chart-3))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal pour Mon quota */}
      <Dialog open={activeModal === "user-quota"} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Mes jours de missions
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">{stats.currentUserDays}</div>
              <div className="text-sm text-muted-foreground">sur {stats.currentUserQuota} jours</div>
            </div>

            {/* Barre de progression */}
            <div className="w-full bg-gray-200 rounded-full h-6">
              <div
                className="bg-primary h-6 rounded-full transition-all duration-300 flex items-center justify-center text-white text-xs font-medium"
                style={{
                  width: `${Math.min((stats.currentUserDays / stats.currentUserQuota) * 100, 100)}%`,
                }}
              >
                {Math.round((stats.currentUserDays / stats.currentUserQuota) * 100)}%
              </div>
            </div>

            <div className="flex justify-between text-sm text-muted-foreground">
              <span>0 jours</span>
              <span>{stats.currentUserQuota} jours</span>
            </div>

            {/* Indicateur de statut */}
            <div className="text-center p-4 rounded-lg bg-gray-50">
              <span className={`font-medium ${quotaStatus.color}`}>{quotaStatus.text}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal pour Analyse des statuts */}
      <Dialog open={activeModal === "status-analysis"} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Répartition des missions par statut
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 grid md:grid-cols-2 gap-6">
            {/* Graphique en secteurs */}
            <div className="flex justify-center">
              <ChartContainer config={chartConfig} className="h-64 w-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.mandatsByStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {stats.mandatsByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="bg-white p-2 border rounded shadow">
                              <p className="font-medium">{data.status}</p>
                              <p className="text-sm">
                                {data.count} mission{data.count > 1 ? "s" : ""}
                              </p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            {/* Légende et statistiques détaillées */}
            <div className="space-y-4">
              <h4 className="font-medium">Détails par statut</h4>
              <div className="space-y-3">
                {stats.mandatsByStatus.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded bg-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm">{item.status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.count}</span>
                      <span className="text-xs text-muted-foreground">
                        ({((item.count / totalMissions) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t pt-3">
                <div className="flex items-center justify-between font-medium text-lg">
                  <span>Total des missions</span>
                  <span>{totalMissions}</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
