interface ValidationError {
    type: "quota" | "chevauchement" | "general"
    message: string
    details?: {
      currentQuota?: number
      afterQuota?: number
      conflictEndDate?: string
    }
  }
  
  export function parseValidationError(errorMessage: string): ValidationError[] {
    const errors: ValidationError[] = []
  
    // Parser pour les erreurs de quota
    const quotaMatch = errorMessage.match(
      /Dépassement du quota annuel $$actuel: (\d+) jours, après mandat: (\d+) jours$$/,
    )
    if (quotaMatch) {
      errors.push({
        type: "quota",
        message: `Le quota annuel serait dépassé avec cette mission (${quotaMatch[2]} jours au total)`,
        details: {
          currentQuota: Number.parseInt(quotaMatch[1]),
          afterQuota: Number.parseInt(quotaMatch[2]),
        },
      })
    }
  
    // Parser pour les erreurs de chevauchement
    const chevauchementMatch = errorMessage.match(/Ordre de mission en cours jusqu'au (.+)/)
    if (chevauchementMatch) {
      errors.push({
        type: "chevauchement",
        message: `L'utilisateur a déjà une mission en cours qui se termine le ${chevauchementMatch[1]}`,
        details: {
          conflictEndDate: chevauchementMatch[1],
        },
      })
    }
  
    // Si aucun pattern spécifique n'est trouvé, traiter comme erreur générale
    if (errors.length === 0) {
      errors.push({
        type: "general",
        message: errorMessage,
      })
    }
  
    return errors
  }
  