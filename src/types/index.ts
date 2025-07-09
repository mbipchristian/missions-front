export interface User {
  id: number
  username: string
  email: string
  matricule: string
  quotaAnnuel: number
  fonction: string
  created_at: string
  updated_at: string
}

export interface Ville {
  id: number
  name: string
  code: string
  interieur: boolean
  created_at: string
  updated_at: string
}

export interface Ressource {
  id: number
  name: string
  created_at: string
  updated_at: string
}

export enum MandatStatut {
  EN_ATTENTE_CONFIRMATION = "EN_ATTENTE_CONFIRMATION",
  EN_ATTENTE_EXECUTION = "EN_ATTENTE_EXECUTION",
  EN_COURS = "EN_COURS",
  ACHEVE = "ACHEVE",
}

export enum OrdreMissionStatut {
  EN_ATTENTE_JUSTIFICATIF = "EN_ATTENTE_JUSTIFICATIF",
  EN_ATTENTE_CONFIRMATION = "EN_ATTENTE_CONFIRMATION",
  EN_ATTENTE_EXECUTION = "EN_ATTENTE_EXECUTION",
  EN_COURS = "EN_COURS",
  ACHEVE = "ACHEVE",
}

export interface Mandat {
  id: number
  reference: string
  objectif: string
  missionDeControle: boolean
  dateDebut: string
  dateFin: string
  duree: number
  statut: MandatStatut
  createdAt: string
  updatedAt: string
  users: User[]
  villes: Ville[]
  ressources: Ressource[]
  createdBy: string
  confirmePar: number | null
  confirmele: string | null
  usersCount: number
  villesCount: number
  ressourcesCount: number
}

export interface OrdreMission {
  id: number
  reference: string
  objectif: string
  modePaiement: string
  devise: string
  dateDebut: string
  dateFin: string
  duree: number
  tauxAvance: number
  decompteTotal: number
  decompteAvance: number
  decompteRelicat: number
  statut: OrdreMissionStatut
  created_at: string
  updated_at: string
  confirmele: string | null
}

export interface OrdreMissionDto {
  reference: string;
  objectif: string;
  modePaiement: string;
  devise: string;
  tauxAvance: number;
  dateDebut: string; // ISO string
  dateFin: string; // ISO string
  duree: number;
  decompteTotal: number;
  decompteAvance: number;
  decompteRelicat: number;
  mandatId: number;
}

export interface VilleDto {
  name: string;
  code: string;
  interieur: boolean;
}

export interface RessourceDto {
  name: string;
}


