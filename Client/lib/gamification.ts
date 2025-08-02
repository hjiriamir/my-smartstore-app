export interface Magasin {
  id: number // Clé primaire numérique pour les API calls
  magasin_id: string // Identifiant string comme "MG002"
  nom_magasin: string
}

export interface Challenge {
  id: number // L'API retourne un 'id' de type number
  nom: string
  description: string
  type: string
  date_debut: string // Format ISO 8601 de l'API
  date_fin: string // Format ISO 8601 de l'API
  recompense: string
  magasin_id: number // L'API attend un number pour magasin_id (pour l'ajout)
}

export interface Client {
  id: number // L'API retourne un 'id' de type number
  code_client: string
  nom: string
  prenom: string
  email: string
  telephone: string
  adresse: string
  ville: string
  entreprise_id: number // L'API attend un number pour entreprise_id
  pays: string
  date_naissance: string // Format YYYY-MM-DD
  genre: string
  date_creation: string // Format ISO 8601 de l'API
}

export interface GamificationParticipation {
  id: string // Pour la démo, peut être un UUID
  clientId: number // L'ID du client de l'API
  challengeId: number // L'ID du challenge de l'API
  progression: string // Ex: "0%", "50%", "Terminé"
  points_gagnes: number
  date_participation: string // Format YYYY-MM-DD
}

export interface LeaderboardEntry {
  clientId: number
  nom: string
  prenom: string
  total_points: number
  rank: number
}

// Nouvelle interface pour l'API du classement
export interface LeaderboardApiResponse {
  id: number
  client_id: number
  points_total: number
  rang: number
  client: {
    id: number
    code_client: string
    nom: string
    prenom: string
    email: string
  }
}

export interface Zone {
  zone_id: string
  nom_zone: string
  description: string
}
