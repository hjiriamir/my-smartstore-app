import { type NextRequest, NextResponse } from "next/server"

// GET /api/user/profile - Récupérer le profil utilisateur
export async function GET(request: NextRequest) {
  try {
    // Dans un vrai cas, vous récupéreriez l'utilisateur depuis le token/session
    // Ici je simule un utilisateur connecté

    const user = {
      id: "USER_001",
      name: "Marie Dubois",
      email: "marie.dubois@store.com",
      role: "employee",
      storeId: "STORE_001",
      storeName: "Magasin Centre-Ville",
      permissions: ["view_meubles", "update_implementation", "add_comments"],
    }

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error("Erreur API profil:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
