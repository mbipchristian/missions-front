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
    return this.request(`/auth/mandats/${mandatId}/confirmer`, {
      method: "POST",
    })
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

  async downloadOrdreMissionPdf(ordreMissionId: number) {
    return this.requestBlob(`/auth/ordres-mission/${ordreMissionId}/pdf`)
  }

  async addOrdreMissionAttachments(ordreMissionId: number, formData: FormData) {
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

  // NOUVEAU: Informations utilisateur
  async getCurrentUser() {
    return this.request<any>("/auth/user/me")
  }
}

export const apiService = new ApiService()
