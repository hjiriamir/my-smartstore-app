// Fonctions utilitaires pour les appels API

import type { Meuble, Product } from './types'

export async function getUserStoreId(): Promise<string> {
  try {
    const response = await fetch("/api/user/profile")
    const userData = await response.json()
    return userData.storeId
  } catch (error) {
    console.error("Erreur lors de la récupération du profil utilisateur:", error)
    throw error
  }
}

export async function getMeublesForStore(storeId: string): Promise<Meuble[]> {
  try {
    const response = await fetch(`/api/meubles?storeId=${storeId}`)
    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des meubles")
    }
    const data = await response.json()
    return data.meubles
  } catch (error) {
    console.error("Erreur lors de la récupération des meubles:", error)
    throw error
  }
}

export async function getMeubleById(meubleId: string): Promise<Meuble> {
  try {
    const response = await fetch(`/api/meubles/${meubleId}`)
    if (!response.ok) {
      throw new Error("Meuble non trouvé")
    }
    const data = await response.json()
    return data.meuble
  } catch (error) {
    console.error("Erreur lors de la récupération du meuble:", error)
    throw error
  }
}

export async function updateImplementationStatus(
  meubleId: string,
  status: string,
  progress: number,
  comments?: string,
  photos?: File[],
): Promise<void> {
  try {
    const formData = new FormData()
    formData.append("status", status)
    formData.append("progress", progress.toString())
    if (comments) formData.append("comments", comments)

    if (photos) {
      photos.forEach((photo, index) => {
        formData.append(`photo_${index}`, photo)
      })
    }

    const response = await fetch(`/api/meubles/${meubleId}/implementation`, {
      method: "PUT",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Erreur lors de la mise à jour du statut")
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour:", error)
    throw error
  }
}

export async function searchProducts(
  query: string,
  searchType: "name" | "barcode" | "brand" | "category" = "name",
  storeId?: string,
): Promise<Product[]> {
  try {
    const params = new URLSearchParams({
      q: query,
      type: searchType,
      ...(storeId && { storeId }),
    })

    const response = await fetch(`/api/products/search?${params}`)
    if (!response.ok) {
      throw new Error("Erreur lors de la recherche de produits")
    }

    const data = await response.json()
    return data.products
  } catch (error) {
    console.error("Erreur lors de la recherche:", error)
    throw error
  }
}
