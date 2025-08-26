export interface User {
  id: number
  username: string
  email: string
  matricule: string
  quotaAnnuel: number
  fonction: string
  rang: Rang
  created_at: string
  updated_at: string
}

export interface Rang {
  id: number
  nom: string
  fraisInterne: number
  fraisExterne: number
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

export interface PieceJointe {
  id: number
  nom: string
  nomOriginal: string
  cheminFichier: string
  typeMime: string
  taille: number
  description: string
  created_at: string
  updated_at: string
}

export enum MandatStatut {
  EN_ATTENTE_CONFIRMATION = "EN_ATTENTE_CONFIRMATION",
  EN_ATTENTE_EXECUTION = "EN_ATTENTE_EXECUTION",
  EN_COURS = "EN_COURS",
  ACHEVE = "ACHEVE",
  ACHEVE_AVEC_RAPPORT = "ACHEVE_AVEC_RAPPORT",
}

export enum OrdreMissionStatut {
  EN_ATTENTE_JUSTIFICATIF = "EN_ATTENTE_JUSTIFICATIF",
  EN_ATTENTE_CONFIRMATION = "EN_ATTENTE_CONFIRMATION",
  EN_ATTENTE_EXECUTION = "EN_ATTENTE_EXECUTION",
  EN_COURS = "EN_COURS",
  ACHEVE = "ACHEVE",
  REJETE = "REJETE",
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
  piecesJointes: PieceJointe[]
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
  rejetele: string | null
  piecesJointes: PieceJointe[]
  villes?: Ville[] // Ajout des villes spécifiques à l'ordre de mission
  user?: User // Ajout de l'utilisateur spécifique à l'ordre de mission
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
  userId: number // Ajout de l'ID utilisateur
  villeIds: number[] // Ajout des IDs des villes sélectionnées
}

export interface VilleDto {
  name: string;
  code: string;
  interieur: boolean;
}

export interface RessourceDto {
  name: string;
}

// Interface pour la réponse du calcul des décomptes
export interface DecomptesResponse {
  decompteTotal: number
  decompteAvance: number
  decompteRelicat: number
}

// Interface pour la requête de calcul pré-création
export interface DecomptesPreCreationRequest {
  mandatId: number
  userId: number
  tauxAvance: number
  duree: number
  dateDebut: string
  dateFin: string
  villeIds: number[]
}



