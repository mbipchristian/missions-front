"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Calendar, Clock, User } from "lucide-react"

interface ValidationError {
  type: "quota" | "chevauchement" | "general"
  message: string
  details?: {
    currentQuota?: number
    afterQuota?: number
    conflictEndDate?: string
  }
}

interface ValidationErrorModalProps {
  isOpen: boolean
  onClose: () => void
  errors: ValidationError[]
  userName?: string
}

export function ValidationErrorModal({ isOpen, onClose, errors, userName }: ValidationErrorModalProps) {
  const getErrorIcon = (type: ValidationError["type"]) => {
    switch (type) {
      case "quota":
        return <Clock className="h-4 w-4 text-orange-500" />
      case "chevauchement":
        return <Calendar className="h-4 w-4 text-red-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-red-500" />
    }
  }

  const getErrorColor = (type: ValidationError["type"]) => {
    switch (type) {
      case "quota":
        return "bg-orange-50 border-orange-200"
      case "chevauchement":
        return "bg-red-50 border-red-200"
      default:
        return "bg-red-50 border-red-200"
    }
  }

  const getErrorTextColor = (type: ValidationError["type"]) => {
    switch (type) {
      case "quota":
        return "text-orange-700"
      case "chevauchement":
        return "text-red-700"
      default:
        return "text-red-700"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-500" />
            Utilisateur non conforme
            {userName && <span className="text-sm font-normal text-gray-500">({userName})</span>}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            L'ordre de mission ne peut pas être créé car l'utilisateur ne respecte pas les critères suivants :
          </p>

          <div className="space-y-3">
            {errors.map((error, index) => (
              <div key={index} className={`flex items-start gap-3 p-4 rounded-lg border ${getErrorColor(error.type)}`}>
                <div className="flex-shrink-0 mt-0.5">{getErrorIcon(error.type)}</div>

                <div className="flex-1 space-y-2">
                  <div className={`text-sm font-medium ${getErrorTextColor(error.type)}`}>
                    {error.type === "quota" && "Dépassement du quota annuel"}
                    {error.type === "chevauchement" && "Chevauchement de missions"}
                    {error.type === "general" && "Erreur de validation"}
                  </div>

                  <div className={`text-sm ${getErrorTextColor(error.type)}`}>{error.message}</div>

                  {/* Détails supplémentaires pour les erreurs de quota */}
                  {error.type === "quota" && error.details && (
                    <div className="mt-2 p-2 bg-white/50 rounded text-xs space-y-1">
                      <div>Quota actuel: {error.details.currentQuota} jours</div>
                      <div>Quota après mission: {error.details.afterQuota} jours</div>
                      <div className="text-orange-600 font-medium">Limite autorisée: 100 jours</div>
                    </div>
                  )}

                  {/* Détails supplémentaires pour les conflits de planning */}
                  {error.type === "chevauchement" && error.details?.conflictEndDate && (
                    <div className="mt-2 p-2 bg-white/50 rounded text-xs">
                      <div>Mission en cours jusqu'au: {error.details.conflictEndDate}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <div className="font-medium mb-1">Que faire ?</div>
                <ul className="space-y-1 text-xs">
                  <li>• Modifiez les dates de la mission pour éviter les chevauchement</li>
                  
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={onClose} variant="default">
              Compris
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
