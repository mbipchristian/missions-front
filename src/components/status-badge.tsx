import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, AlertTriangle, FileText } from "lucide-react"

interface StatusBadgeProps {
  status: string
  type?: "mandat" | "ordre"
  size?: "sm" | "md" | "lg"
}

export function StatusBadge({ status, type = "mandat", size = "md" }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "EN_ATTENTE_CONFIRMATION":
        return {
          label: "En attente de confirmation",
          color: "bg-orange-100 text-orange-800 border-orange-200",
          icon: Clock,
        }
      case "EN_ATTENTE_EXECUTION":
        return {
          label: "En attente d'exécution",
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: Clock,
        }
      case "EN_COURS":
        return {
          label: "En cours",
          color: "bg-green-100 text-green-800 border-green-200",
          icon: CheckCircle,
        }
      case "ACHEVE":
        return {
          label: "Achevé",
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: CheckCircle,
        }
      case "EN_ATTENTE_JUSTIFICATIF":
        return {
          label: "En attente de justificatif",
          color: "bg-red-100 text-red-800 border-red-200",
          icon: FileText,
        }
      default:
        return {
          label: status ? status.replace(/_/g, " ") : "Statut inconnu",
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: AlertTriangle,
        }
    }
  }

  const config = getStatusConfig(status)
  const Icon = config.icon

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-2",
  }

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  return (
    <Badge variant="outline" className={`${config.color} ${sizeClasses[size]} flex items-center gap-1`}>
      <Icon className={iconSizes[size]} />
      {config.label}
    </Badge>
  )
}
