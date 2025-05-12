"use client"

import { useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Calendar, User } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function DashboardContent() {
  // Exemple de données pour le camembert
  const [missionDays, setMissionDays] = useState(65) // Jours de mission utilisés
  const maxDays = 100 // Maximum de jours autorisés
  const remainingDays = maxDays - missionDays

  const data = [
    { name: "Jours utilisés", value: missionDays, color: "#0ea5e9" },
    { name: "Jours restants", value: remainingDays, color: "#e2e8f0" },
  ]

  const currentYear = new Date().getFullYear()

  return (
    <div className="flex flex-col">
      <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Tableau de bord</h1>
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
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Jours de mission</CardTitle>
              <CardDescription>Suivi des jours de mission pour l'année {currentYear}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {data.map((entry, index) => (
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
                  Vous avez utilisé <span className="font-bold text-primary">{missionDays} jours</span> sur un maximum
                  de {maxDays} jours autorisés.
                </p>
                {missionDays > 80 && (
                  <p className="mt-2 text-sm text-orange-500 font-medium">
                    Attention: Vous approchez de la limite annuelle de jours de mission.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

    
        </div>
      </main>
    </div>
  )
}
