import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2 } from "lucide-react"

interface FAQ {
  id: number
  question: string
  reponse: string
  vues: number
  personnes_aidees: number
  categorie: string
  entreprise_id: number
  date_creation: string
}

interface Entreprise {
  id: number
  // Ajoutez d'autres propriétés de l'entreprise si nécessaire
}

export function FAQContent() {
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [entreprise, setEntreprise] = useState<Entreprise | null>(null)
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  
  // État pour la nouvelle FAQ
  const [newFaq, setNewFaq] = useState({
    question: "",
    reponse: "",
    categorie: "Divers",
    vues: 0,
    personnes_aidees: 0,
    entreprise_id: 0
  })

  const categories = ["Visualisation", "Technique", "Validation", "Export", "Formation", "Connexion", "Notifications", "Parametrage", "Support", "Divers"]

  // Fonction pour gérer les erreurs de fetch
  const fetchWithErrorHandling = async (url: string, options?: RequestInit) => {
    try {
      const response = await fetch(url, options)
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error("Fetch error:", error)
      throw error
    }
  }

  // Récupérer l'utilisateur connecté
  useEffect(() => {
    const fetchCurrentUserId = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("Token d'authentification manquant")
        }

        const data = await fetchWithErrorHandling("http://localhost:8081/api/auth/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          credentials: "include"
        })

        const userId = data.user?.idUtilisateur || data.idUtilisateur || data.id
        setCurrentUserId(userId)
      } catch (error) {
        console.error("Error fetching current user ID:", error)
        setError("Erreur lors de la récupération de l'utilisateur")
      }
    }

    fetchCurrentUserId()
  }, [])

  // Récupérer l'entreprise de l'utilisateur
  useEffect(() => {
    if (!currentUserId) return

    const fetchEntreprise = async () => {
      try {
        const data = await fetchWithErrorHandling(
          `http://localhost:8081/api/auth1/getEntrepriseByUser/${currentUserId}`
        )
        setEntreprise(data.entreprise)
        setNewFaq(prev => ({ ...prev, entreprise_id: data.entreprise.id }))
      } catch (error) {
        console.error("Error fetching entreprise:", error)
        setError("Erreur lors de la récupération de l'entreprise")
      }
    }

    fetchEntreprise()
  }, [currentUserId])

  // Récupérer les FAQs de l'entreprise
  useEffect(() => {
    if (!entreprise?.id) return

    const fetchFaqs = async () => {
      try {
        setLoading(true)
        const data = await fetchWithErrorHandling(
          `http://localhost:8081/api/faq/getFaqByEntreprise/${entreprise.id}`
        )
        setFaqs(data.faqs?.rows || [])
        setLoading(false)
      } catch (error) {
        console.error("Error fetching FAQs:", error)
        setError("Erreur lors de la récupération des FAQs")
        setLoading(false)
      }
    }

    fetchFaqs()
  }, [entreprise])

  // Créer une nouvelle FAQ
  const handleCreateFaq = async () => {
    if (!newFaq.question || !newFaq.reponse || !newFaq.entreprise_id) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }
  
    try {
      const token = localStorage.getItem("token");
      const response = await fetchWithErrorHandling("http://localhost:8081/api/faq/createFaq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          question: newFaq.question,
        reponse: newFaq.reponse,
        vues: 0, // Ajouté
        personnes_aidees: 0, // Ajouté
        categorie: newFaq.categorie,
        entreprise_id: newFaq.entreprise_id
        })
      });
  
      // La réponse est directement l'objet FAQ, pas besoin de response.faq
      const createdFaq: FAQ = {
        id: response.id,
      question: response.question,
      reponse: response.reponse,
      categorie: response.categorie,
      vues: response.vues || 0,
      personnes_aidees: response.personnes_aidees || 0,
      entreprise_id: response.entreprise_id,
      date_creation: response.date_creation || new Date().toISOString()
      };
  
      // Ajouter la nouvelle FAQ à la liste
      setFaqs([createdFaq, ...faqs]);
  
      // Réinitialiser le formulaire
      setNewFaq({
        question: "",
        reponse: "",
        categorie: "Divers",
        vues: 0,
        personnes_aidees: 0,
        entreprise_id: entreprise?.id || 0
      });
  
    } catch (error) {
      console.error("Error creating FAQ:", error);
      setError("Erreur lors de la création de la FAQ");
    }
  };
  // Filtrer les FAQs selon la recherche
  const filteredFaqs = faqs.filter(faq => 
    faq && 
    typeof faq === 'object' && 
    faq.question && 
    faq.reponse && 
    faq.categorie &&
    (
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.reponse.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.categorie.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  if (loading && !faqs.length) {
    return <div className="flex justify-center items-center h-64">Chargement en cours...</div>
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des FAQ</h1>
          <p className="text-gray-600 mt-2">Gérez les questions fréquemment posées</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Liste des FAQ</CardTitle>
              <CardDescription>Gérez vos questions et réponses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex gap-2">
                <Input 
                  placeholder="Rechercher une FAQ..." 
                  className="flex-1" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="outline">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4" style={{ maxHeight: 'calc(4 * 150px)', overflowY: 'auto' }}>
  {filteredFaqs.length > 0 ? (
    filteredFaqs.map((faq) => (
      <div key={faq.id} className="border rounded-lg p-4 hover:bg-gray-50">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-gray-900">{faq.question}</h3>
              <Badge variant="default">Publié</Badge>
            </div>
            <Badge variant="outline" className="mb-2">
              {faq.categorie}
            </Badge>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{faq.reponse}</p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>{faq.vues} vues</span>
              <span>{faq.personnes_aidees} votes utiles</span>
              <span>Créé le {new Date(faq.date_creation).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex gap-1 ml-4">
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    ))
  ) : (
    <div className="text-center py-8 text-gray-500">
      {searchTerm ? "Aucune FAQ ne correspond à votre recherche" : "Aucune FAQ disponible"}
    </div>
  )}
</div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Ajouter une FAQ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Question</label>
                <Input 
                  placeholder="Entrez votre question..." 
                  value={newFaq.question}
                  onChange={(e) => setNewFaq({...newFaq, question: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Réponse</label>
                <Textarea 
                  placeholder="Entrez la réponse..." 
                  rows={4}
                  value={newFaq.reponse}
                  onChange={(e) => setNewFaq({...newFaq, reponse: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Catégorie</label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={newFaq.categorie}
                  onChange={(e) => setNewFaq({...newFaq, categorie: e.target.value})}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <Button 
                className="w-full"
                onClick={handleCreateFaq}
              >
                Ajouter la FAQ
              </Button>
              {error && <div className="text-red-500 text-sm">{error}</div>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}