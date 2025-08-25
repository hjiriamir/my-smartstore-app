import { API_BASE_URL } from "@/types/magasin-constants"
import type { EntrepriseStats, MagasinDetails } from "@/types/magasin-types"

export class MagasinService {
  private static getAuthHeaders() {
    const token = localStorage.getItem("token")
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }
  }

  static async getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: this.getAuthHeaders(),
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    return response.json()
  }

  static async getEntrepriseStats(entrepriseId: number): Promise<EntrepriseStats> {
    const response = await fetch(`${API_BASE_URL}/magasins/getEntrepriseStats/${entrepriseId}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des statistiques")
    }

    return response.json()
  }

  static async getMagasinDetails(magasinId: string): Promise<MagasinDetails> {
    const response = await fetch(`${API_BASE_URL}/magasins/getMagasinDetails/${magasinId}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des détails du magasin")
    }

    const data = await response.json()
    return {
      ...data.magasin,
      ville: data.magasin.adresse || "Non spécifié",
      telephone: "Non spécifié",
      horaires: "Non spécifié",
      coordonnees: { x: 0, y: 0 },
      zones:
        data.magasin.zones?.map((zone: any) => ({
          ...zone,
          nom: zone.nom_zone,
          couleur: zone.couleur || "#3B82F6",
          population: 0,
          superficie: zone.longueur && zone.largeur ? (zone.longueur * zone.largeur) / 1000000 : 0,
        })) || [],
    }
  }

  static async createZone(zoneData: any) {
    const response = await fetch(`${API_BASE_URL}/zones/createZone`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(zoneData),
    })

    if (!response.ok) {
      throw new Error("Erreur lors de la création de la zone")
    }

    return response.json()
  }

  static async deleteZone(zoneId: number) {
    const response = await fetch(`${API_BASE_URL}/zones/deleteZone/${zoneId}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erreur lors de la suppression de la zone")
    }

    return response.json()
  }
}
