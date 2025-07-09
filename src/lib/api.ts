const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = localStorage.getItem("authToken")

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  private async requestBlob(endpoint: string, options?: RequestInit): Promise<Blob> {
    const token = localStorage.getItem("authToken")

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.blob()
  }

  // Mandats endpoints
  async getMandatsEnAttenteConfirmation() {
    return this.request<any[]>("/auth/mandats/en-attente-confirmation")
  }

  async getMandatsEnAttenteExecution() {
    return this.request<any[]>("/auth/mandats/en-attente-execution")
  }

  async getMandatsEnCours() {
    return this.request<any[]>("/auth/mandats/en-cours")
  }

  async getMandatsAcheves() {
    return this.request<any[]>("/auth/mandats/acheves")
  }

  async getAllMandats() {
    return this.request<any[]>("/auth/mandats/all")
  }

  // NOUVEAU: Mes mandats (mandats où l'utilisateur connecté figure)
  async getMesMandats() {
    return this.request<any[]>("/auth/mandats/mes-mandats")
  }

  async confirmMandat(mandatId: number) {
    try {
      return await this.request(`/auth/mandats/${mandatId}/confirmer`, {
        method: "POST",
      })
    } catch (error: any) {
      // Si le backend retourne un message d'erreur détaillé, le propager
      if (error instanceof Error && error.message) {
        throw new Error(error.message)
      }
      throw error
    }
  }

  async downloadMandatPdf(mandatId: number) {
    return this.requestBlob(`/auth/mandats/${mandatId}/pdf`)
  }

  async addMandatReport(mandatId: number, formData: FormData) {
    const token = localStorage.getItem("authToken")
    const response = await fetch(`${API_BASE_URL}/auth/mandats/${mandatId}/rapport`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Ajouter les nouveaux endpoints pour la création de mandats et gestion des entités

  // Endpoints pour la création de mandats
  async createMandat(mandatData: any) {
    return this.request("/auth/mandats/create", {
      method: "POST",
      body: JSON.stringify(mandatData),
    })
  }

  // Endpoints pour les utilisateurs
  async getAllUsers() {
    return this.request<any[]>("/auth/users/all")
  }

  // Endpoints pour les villes
  async getAllVilles() {
    return this.request<any[]>("/auth/villes/all")
  }

  async searchVillesByName(name: string) {
    return this.request<any[]>(`/auth/villes/search/name?q=${encodeURIComponent(name)}`)
  }

  // Endpoints pour les ressources
  async getAllRessources() {
    return this.request<any[]>("/auth/ressources/all")
  }

  async searchRessourcesByName(name: string) {
    return this.request<any[]>(`/auth/ressources/search?name=${encodeURIComponent(name)}`)
  }

  // Endpoints pour les pièces jointes
  async uploadPieceJointe(formData: FormData) {
    const token = localStorage.getItem("authToken")
    const response = await fetch(`${API_BASE_URL}/auth/pieces-jointes/upload`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Ordres de mission endpoints
  async getOrdresMissionEnAttenteJustificatif() {
    return this.request<any[]>("/auth/ordres-mission/en-attente-justificatif")
  }

  async getOrdresMissionEnAttenteConfirmation() {
    return this.request<any[]>("/auth/ordres-mission/en-attente-confirmation")
  }

  async getOrdresMissionEnAttenteExecution() {
    return this.request<any[]>("/auth/ordres-mission/en-attente-execution")
  }

  async getOrdresMissionEnCours() {
    return this.request<any[]>("/auth/ordres-mission/en-cours")
  }

  async getOrdresMissionAcheves() {
    return this.request<any[]>("/auth/ordres-mission/acheves")
  }

  async getAllOrdresMission() {
    return this.request<any[]>("/auth/ordres-mission/all")
  }

  async getOrdreMissionById(ordreMissionId: number) {
    return this.request<any>(`/auth/ordres-mission/${ordreMissionId}`)
  }

  // NOUVEAU: Mes ordres de mission (ordres assignés à l'utilisateur connecté)
  async getMesOrdresMission() {
    return this.request<any[]>("/auth/ordres-mission/mes-ordres")
  }

  async confirmOrdreMission(ordreMissionId: number) {
    return this.request(`/auth/ordres-mission/${ordreMissionId}/confirmer`, {
      method: "POST",
    })
  }

  async rejectOrdreMission(ordreMissionId: number) {
    return this.request(`/auth/ordres-mission/${ordreMissionId}/rejeter`, {
      method: "POST",
    })
  }

   // NOUVEAU: Mettre à jour un ordre de mission
  async updateOrdreMission(ordreMissionId: number, updateData: any) {
    return this.request(`/auth/ordres-mission/${ordreMissionId}/update`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    })
  }

  // NOUVEAU: Télécharger le PDF d'un ordre de mission
  async telechargerOrdreMissionPdf(ordreMissionId: number): Promise<{ blob: Blob; filename: string }> {
    const token = localStorage.getItem("authToken")

    const response = await fetch(`${API_BASE_URL}/auth/ordres-mission/${ordreMissionId}/pdf`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    // Extraire le nom de fichier depuis les headers si disponible
    const contentDisposition = response.headers.get('Content-Disposition')
    let filename = `ordre_mission_${ordreMissionId}.pdf`
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '')
      }
    }

    const blob = await response.blob()
    return { blob, filename }
  }

  async downloadOrdreMissionPdf(ordreMissionId: number) {
    return this.requestBlob(`/auth/ordres-mission/${ordreMissionId}/pdf`)
  }

  // Helper method pour télécharger et sauvegarder automatiquement le PDF
  async downloadAndSaveOrdreMissionPdf(ordreMissionId: number) {
    try {
      const { blob, filename } = await this.telechargerOrdreMissionPdf(ordreMissionId)
      
      // Créer un URL temporaire pour le blob
      const url = window.URL.createObjectURL(blob)
      
      // Créer un élément <a> temporaire pour déclencher le téléchargement
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      
      // Nettoyer
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      return { success: true, filename }
    } catch (error) {
      console.error('Erreur lors du téléchargement du PDF:', error)
      throw error
    }
  }

  // Version pour un seul fichier
async addOrdreMissionAttachments(ordreMissionId: number, file: File, description?: string) {
  const token = localStorage.getItem("authToken");
  
  try {
    // Récupérer les informations de l'utilisateur actuel
    const currentUser = await this.getCurrentUser();
    
    // Créer le FormData
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", currentUser.id.toString());
    formData.append("ordreMissionId", ordreMissionId.toString());
    
    if (description) {
      formData.append("description", description);
    }
    
    const response = await fetch(`${API_BASE_URL}/auth/pieces-jointes/upload`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        // Ne pas définir Content-Type pour multipart/form-data
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
    }

    return response.json();
  } catch (error) {
    console.error("Erreur lors de l'upload:", error);
    throw error;
  }
}

// VERSION CORRIGÉE - addMandatAttachments avec gestion des erreurs
async addMandatAttachments(mandatId: number, file: File, description?: string) {
  const token = localStorage.getItem("authToken");
  
  try {
    // CORRECTION: Vérifier que mandatId existe
    if (!mandatId) {
      throw new Error("ID du mandat manquant");
    }

    // Récupérer les informations de l'utilisateur actuel
    const currentUser = await this.getCurrentUser();
    
    // CORRECTION: Vérifier que currentUser et currentUser.id existent
    if (!currentUser || !currentUser.id) {
      throw new Error("Utilisateur non trouvé ou ID utilisateur manquant");
    }
    
    // Créer le FormData
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", currentUser.id.toString());
    formData.append("mandatId", mandatId.toString());
    
    if (description) {
      formData.append("description", description);
    }
    
    const response = await fetch(`${API_BASE_URL}/auth/pieces-jointes/upload`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        // Ne pas définir Content-Type pour multipart/form-data
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
    }

    return response.json();
  } catch (error) {
    console.error("Erreur lors de l'upload:", error);
    throw error;
  }
}

  // Création d'un ordre de mission
  async createOrdreMission(ordreMissionData: any) {
    try {
      return await this.request("/auth/ordres-mission/create", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          // Autres headers nécessaires (Authorization, etc.)
        },
        body: JSON.stringify(ordreMissionData),
      })
    } catch (error: any) {
      // Extraire le message d'erreur du backend si disponible
    if (error.message && error.message.includes("API Error:")) {
      // Tenter de parser la réponse JSON pour obtenir le message détaillé
      try {
        const response = await fetch(`${API_BASE_URL}/auth/ordres-mission/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify(ordreMissionData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || error.message)
        }
      } catch (fetchError: any) {
        throw new Error(fetchError.message || error.message)
      }
    }
    throw error
    }
    
    
  }

  // NOUVEAU: Informations utilisateur
  async getCurrentUser() {
    return this.request<any>("/auth/me")
  }

  // Calcul des décomptes pour un ordre de mission
  async getOrdreMissionDecomptes(mandatId: number, userId: number, tauxAvance: number) {
    const params = new URLSearchParams({
      mandatId: String(mandatId),
      userId: String(userId),
      tauxAvance: String(tauxAvance),
    })
    return this.request(`/auth/ordres-mission/calcul-decomptes?${params.toString()}`)
  }

  // Villes CRUD
  async createVille(villeData: any) {
    return this.request("/auth/villes/create", {
      method: "POST",
      body: JSON.stringify(villeData),
    })
  }
  async updateVille(villeId: number, villeData: any) {
    return this.request(`/auth/villes/${villeId}`, {
      method: "PUT",
      body: JSON.stringify(villeData),
    })
  }
  async deleteVille(villeId: number) {
    return this.request(`/auth/villes/${villeId}`, {
      method: "DELETE" })
  }
  // Ressources CRUD
  async createRessource(ressourceData: any) {
    return this.request("/auth/ressources/create", {
      method: "POST",
      body: JSON.stringify(ressourceData),
    })
  }
  async updateRessource(ressourceId: number, ressourceData: any) {
    return this.request(`/auth/ressources/${ressourceId}`, {
      method: "PUT",
      body: JSON.stringify(ressourceData),
    })
  }
  async deleteRessource(ressourceId: number) {
    return this.request(`/auth/ressources/${ressourceId}`, {
      method: "DELETE" })
  }

  async getOrdresMissionByMandat(mandatId: number) {
    return this.request<any[]>(`/auth/ordres-mission/mandat/${mandatId}`)
  }
}

export const apiService = new ApiService()