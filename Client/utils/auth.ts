const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export const fetchCurrentUserId = async () => {
  try {
    const token = localStorage.getItem("token")
    if (!token) {
      throw new Error("Token d'authentification manquant")
    }
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    })
    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des données utilisateur")
    }
    const data = await response.json()
    return data.user?.idUtilisateur || data.idUtilisateur || data.id
  } catch (error) {
    console.error("Error fetching current user ID:", error)
    throw error
  }
}
