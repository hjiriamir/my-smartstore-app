"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, AlertTriangle, Camera, MessageSquare, Upload, Calendar, User } from "lucide-react"
import axios from "axios"

interface PlanogramImplementation {
  id: number
  planogram_id: number
  magasin_id: string
  idUser: number
  statut: "terminé" | "en cours" | "à faire" | "en retard"
  date_debut: string | null
  date_fin_prevue: string
  date_fin_reelle: string | null
  type: string
  commentaire: string
  priorite: string | null
  planogram: {
    planogram_id: number
    magasin_id: string
    zone_id: string
    nom: string
    description: string
    date_creation: string
    update_date: string | null
    created_by: number
    statut: string
    pdfUrl: string | null
    imageUrl: string | null
  }
  user: {
    id: number
    name: string
    email: string
}
}

interface UploadedPhoto {
  file: File;
  previewUrl: string;
  name: string;
  size: number;
  type: string;
}

interface Task {
  id: number
  planogram_id: number
  magasin_id: string
  idUser: number
  statut: "terminé" | "en cours" | "à faire" | "en retard"
  date_debut: string | null
  date_fin_prevue: string
  date_fin_reelle: string | null
  type: string
  commentaire: string
  priorite: string | null
  completed: boolean
  user?: { // Ajouté ici
    id: number
    name: string
    email: string
  }
}

interface Comment {
  id: number;
  contenu: string;
  date_creation: string;
  utilisateur_id: number;
  tache_id: number | null;
  planogram_id: number;
  piece_jointe_url: string | null;
  lu: boolean;
  utilisateur?: {
    id: number;
    name: string;
    email: string;
  };
}

interface Implementation {
  id: number
  planogramName: string
  status: "Terminé" | "En cours" | "À implémenter" | "En retard"
  progress: number
  assignedTo: string
  dueDate: string
  startDate: string | null
  estimatedTime: string
  actualTime: string | null
  tasks: Task[]
  comments: Comment[]
}

export default function ImplementationTracking() {
  const [selectedImplementation, setSelectedImplementation] = useState<Implementation | null>(null)
  const [comment, setComment] = useState("")
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [implementations, setImplementations] = useState<Implementation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)


  const fetchComments = async (planogramId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }
  
      const response = await axios.get(
        `http://localhost:8081/api/commentaireRoutes/getCommentairesByPlanogram/${planogramId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des commentaires:", error);
      throw error;
    }
  };

  const handleSelectImplementation = async (implementation: Implementation) => {
    try {
      setSelectedImplementation(implementation);
      
      // Récupérer les commentaires du planogramme
      const comments = await fetchComments(implementation.id);
      
      // Transformer les données pour correspondre à votre interface
      const formattedComments = comments.map((comment: any) => ({
        id: comment.id,
        author: comment.utilisateur?.name || `Utilisateur ${comment.utilisateur_id}`,
        time: new Date(comment.date_creation).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        message: comment.contenu,
        piece_jointe_url: comment.piece_jointe_url,
        // Ajoutez d'autres champs si nécessaire
      }));
  
      setSelectedImplementation(prev => ({
        ...prev!,
        comments: formattedComments
      }));
    } catch (error) {
      console.error("Erreur lors de la sélection du planogramme:", error);
      alert("Impossible de charger les commentaires");
    }
  };
  useEffect(() => {
    return () => {
      // Cleanup des URLs créées
      photos.forEach(photo => URL.revokeObjectURL(photo.previewUrl));
    };
  }, [photos]);

  const getCurrentUserId = async (): Promise<number> => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Token d'authentification manquant");
    }
  
    const response = await fetch("http://localhost:8081/api/auth/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      credentials: "include"
    });
  
    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des données utilisateur");
    }
  
    const data = await response.json();
    return data.user?.idUtilisateur || data.idUtilisateur || data.id;
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
    
        // 1. Vérification du token
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token d'authentification manquant");
        }
    
        // 2. Récupération des infos utilisateur (version compatible avec votre API)
        let userId: number;
        try {
          const response = await fetch("http://localhost:8081/api/auth/me", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            credentials: "include"
          });
    
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Erreur lors de la récupération des données utilisateur");
          }
    
          const data = await response.json();
          console.log("Réponse complète de /api/auth/me:", data);
    
          // Récupération de l'ID selon la structure que vous avez observée
          userId = data.user?.idUtilisateur || data.idUtilisateur || data.id;
          
          if (!userId) {
            throw new Error("ID utilisateur non trouvé dans la réponse");
          }
    
          console.log("ID utilisateur confirmé:", userId);
        } catch (userError) {
          console.error("Erreur récupération utilisateur:", userError);
          throw new Error(`Impossible de récupérer les informations utilisateur: ${userError.message}`);
        }
    
        // 3. Récupération du magasin
        let magasinId: string;
        try {
          const magasinResponse = await axios.get(
            `http://localhost:8081/api/magasins/getMagasinByUser/${userId}`,
            {
              headers: {
                "Authorization": `Bearer ${token}`
              }
            }
          );
    
          console.log("Réponse magasin:", magasinResponse.data);
    
          if (!magasinResponse.data?.magasin_id) {
            throw new Error("Aucun magasin trouvé pour cet utilisateur");
          }
    
          magasinId = magasinResponse.data.magasin_id;
        } catch (magasinError: any) {
          console.error("Erreur magasin:", magasinError);
          
          if (magasinError.response?.status === 404 || magasinError.message.includes("Aucun magasin")) {
            setImplementations([]);
            setError("Vous n'êtes associé à aucun magasin. Veuillez contacter votre administrateur.");
            setLoading(false);
            return;
          }
          
          throw new Error(`Erreur lors de la récupération du magasin: ${magasinError.message}`);
        }
    
        // 4. Récupération des planogrammes
        const planogramsResponse = await axios.get(
          `http://localhost:8081/api/planogram/getPlanogramsByMagasin/${magasinId}/${userId}`,
          {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          }
        );
    
        console.log("Réponse planogrammes:", planogramsResponse.data);
    
        if (!Array.isArray(planogramsResponse.data)) {
          throw new Error("Format de données inattendu pour les planogrammes");
        }
    
        // Transformation des données (identique à votre version précédente)
        const transformedData = planogramsResponse.data
  .map((item: any) => {
    try {
      if (!item?.planogram || typeof item.planogram !== 'object') {
        console.warn('Élément invalide dans les planogrammes:', item);
        return null;
      }

      // Détermination du statut principal basé sur la progression et les dates
      const currentDate = new Date();
      const dueDate = new Date(item.planogram.taches?.[0]?.date_fin_prevue || item.date_fin_prevue);
      
      let status: "Terminé" | "En cours" | "À implémenter" | "En retard";
      
      // 1. Vérifier d'abord si en retard (date dépassée et pas terminé)
      if (currentDate > dueDate && item.progression < 100) {
        status = "En retard";
      } 
      // 2. Puis vérifier la progression
      else if (item.progression === 0) {
        status = "À implémenter";
      } else if (item.progression === 100) {
        status = "Terminé";
      } else {
        status = "En cours";
      }

      // Gestion sécurisée des dates
      const formatDate = (dateString: string | null): string | null => {
        if (!dateString) return null;
        try {
          return new Date(dateString).toISOString().split('T')[0];
        } catch {
          return null;
        }
      };

      // Transformation des tâches de l'API
      const tasks: Task[] = (item.planogram.taches || []).map((task: any) => ({
        ...task,
        completed: task.statut === 'terminé',
        name: `Tâche #${task.id}` // Ou un autre nom si disponible
      }));

      // Commentaires basés sur les commentaires des tâches
      const comments: Comment[] = (item.planogram.taches || [])
        .filter((t: any) => t.commentaire)
        .map((t: any, index: number) => ({
          id: index + 1,
          author: t.user?.name || `Utilisateur ${t.idUser}`,
          time: t.date_fin_reelle 
            ? new Date(t.date_fin_reelle).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          message: t.commentaire.substring(0, 200)
        }));

      // Trouver la première tâche pour les dates et l'utilisateur
      const firstTask = item.planogram.taches?.[0] || {};
      
      return {
        id: item.planogram.planogram_id || Math.random().toString(36).substring(2, 9),
        planogramName: item.planogram.nom || "Planogramme sans nom",
        status,
        progress: item.progression || 0,
        assignedTo: firstTask.user?.name || `Utilisateur ${firstTask.idUser}` || 'Non assigné',
        dueDate: formatDate(firstTask.date_fin_prevue) || "Non spécifié",
        startDate: formatDate(firstTask.date_debut),
        estimatedTime: firstTask.estimatedTime || "4h",
        actualTime: firstTask.date_fin_reelle ? "3h 30min" : null,
        tasks,
        comments,
        _raw: item
      };
    } catch (error) {
      console.error('Erreur lors de la transformation des données:', error, item);
      return null;
    }
  })
  .filter((item): item is Implementation => item !== null);
    
        setImplementations(transformedData);
        setLoading(false);
    
      } catch (err: any) {
        console.error("Erreur fetchData complète:", err);
        
        let errorMessage = "Erreur lors du chargement des données";
        
        if (err.message) {
          errorMessage = err.message;
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }
        
        setError(errorMessage);
        setLoading(false);
        setImplementations([]);
      }
    };

    fetchData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Terminé":
        return "bg-green-100 text-green-800";
      case "En cours":
        return "bg-yellow-100 text-yellow-800";
      case "À implémenter":
        return "bg-gray-100 text-gray-800"; // Changé de rouge à gris pour "à implémenter"
      case "En retard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Terminé":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "En cours":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "À implémenter":
        return <AlertTriangle className="h-4 w-4 text-gray-600" />; // Changé de rouge à gris
      case "En retard":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleValidateImplementation = (implementationId: number) => {
    console.log(`Validation de l'implémentation ${implementationId}`)
    // Ici on ajouterait la logique de validation via API
  }

  const handleAddComment = async () => {
    if (!comment.trim() && photoUrls.length === 0) return;
  
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token manquant");
  
      const userId = await getCurrentUserId();
  
      const commentData = {
        contenu: comment,
        date_creation: new Date().toISOString(),
        utilisateur_id: userId,
        tache_id: selectedImplementation?.tasks[0]?.id || null,
        planogram_id: selectedImplementation?.id,
        piece_jointe_url: photoUrls.length > 0 ? photoUrls[0] : null, // Prend la première photo ou null
        lu: false,
      };
  
      const response = await axios.post(
        "http://localhost:8081/api/commentaireRoutes/createCommentaire",
        commentData,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      // Rafraîchir les commentaires
      if (selectedImplementation) {
        const comments = await fetchComments(selectedImplementation.id);
        const formattedComments = comments.map((c: any) => ({
          id: c.id,
          author: c.utilisateur?.name || `Utilisateur ${c.utilisateur_id}`,
          time: new Date(c.date_creation).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          message: c.contenu,
          piece_jointe_url: c.piece_jointe_url,
        }));
  
        setSelectedImplementation(prev => ({
          ...prev!,
          comments: formattedComments,
        }));
      }
  
      setComment("");
      setPhotos([]);
      setPhotoUrls([]);
  
    } catch (error) {
      console.error("Erreur lors de l'ajout du commentaire:", error);
      alert("Erreur lors de l'ajout du commentaire");
    }
  };
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token manquant");
  
      const files = Array.from(event.target.files || []);
      if (files.length === 0) return;
  
      // Limiter à 5 photos max
      if (photos.length + files.length > 5) {
        alert("Maximum 5 photos autorisées");
        return;
      }
  
      // Upload chaque photo et récupérer les URLs
      const uploadedUrls = await Promise.all(
        files.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
  
          const response = await axios.post(
            "http://localhost:8081/api/upload", // Remplacez par votre endpoint d'upload
            formData,
            {
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );
  
          return response.data.url; // Supposons que l'API retourne { url: "..." }
        })
      );
  
      // Stocker les URLs pour les utiliser dans le commentaire
      setPhotoUrls([...photoUrls, ...uploadedUrls]);
  
      // Créer les prévisualisations
      const newPhotos = files.map(file => ({
        file,
        previewUrl: URL.createObjectURL(file),
        name: file.name,
      }));
  
      setPhotos([...photos, ...newPhotos]);
      event.target.value = ""; // Réinitialiser l'input
  
    } catch (error) {
      console.error("Erreur lors de l'upload des photos:", error);
      alert("Erreur lors de l'upload des photos");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Chargement en cours...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Vue d'ensemble */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">En cours</CardTitle>
    <Clock className="h-4 w-4 text-yellow-600" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold text-yellow-600">
      {implementations?.filter((i) => i?.status === "En cours").length || 0}
    </div>
  </CardContent>
</Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">À implémenter</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {implementations.filter((i) => i.status === "À implémenter").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terminées</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {implementations.filter((i) => i.status === "Terminé").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des implémentations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {implementations.map((implementation) => (
          <Card key={implementation.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{implementation.planogramName}</CardTitle>
                  <CardDescription className="flex items-center space-x-2 mt-1">
                    <User className="h-4 w-4" />
                    <span>{implementation.assignedTo}</span>
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(implementation.status)}
                  <Badge className={getStatusColor(implementation.status)}>{implementation.status}</Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Progression */}
<div>
  <div className="flex justify-between items-center mb-2">
    <span className="text-sm font-medium">Progression</span>
    <span className="text-sm text-muted-foreground">{implementation.progress}%</span>
  </div>
  <Progress value={implementation.progress} className="h-2" />
</div>

              {/* Informations temporelles */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Échéance:</span>
                  <div className="flex items-center space-x-1 mt-1">
                    <Calendar className="h-3 w-3" />
                    <span>{implementation.dueDate}</span>
                  </div>
                </div>
                <div>
                  <span className="font-medium">Temps estimé:</span>
                  <div className="mt-1">{implementation.estimatedTime}</div>
                </div>
              </div>

              {/* Tâches */}
              {/* Tâches */}
<div>
  <h4 className="font-medium mb-2">
    Tâches ({implementation.tasks.filter((t) => t.completed).length}/{implementation.tasks.length})
  </h4>
  <div className="space-y-1">
    {implementation.tasks.slice(0, 3).map((task) => (
      <div key={task.id} className="flex items-center space-x-2 text-sm">
        <CheckCircle className={`h-3 w-3 ${task.completed ? "text-green-600" : "text-gray-300"}`} />
        <span className={task.completed ? "line-through text-muted-foreground" : ""}>
          {task.name || `Tâche #${task.id}`}
          {task.commentaire && (
            <span className="text-xs text-gray-500 ml-2">({task.commentaire.substring(0, 30)}...)</span>
          )}
        </span>
      </div>
    ))}
    {implementation.tasks.length > 3 && (
      <div className="text-xs text-muted-foreground">
        +{implementation.tasks.length - 3} autres tâches
      </div>
    )}
  </div>
</div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2">
                {implementation.status === "En cours" && (
                  <>
                    <Button size="sm" onClick={() => handleValidateImplementation(implementation.id)}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Valider
                    </Button>
                    <Button size="sm" variant="outline">
                      <Camera className="h-4 w-4 mr-2" />
                      Photo
                    </Button>
                  </>
                )}
              <Button 
  size="sm" 
  variant="outline" 
  onClick={() => handleSelectImplementation(implementation)}
>
  <MessageSquare className="h-4 w-4 mr-2" />
  Détails
</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de détails (simulé avec une card conditionnelle) */}
      {selectedImplementation && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Détails - {selectedImplementation.planogramName}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedImplementation(null)}>
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Commentaires */}
<div>
  <h4 className="font-medium mb-3">Commentaires et historique</h4>
  <div className="space-y-3 max-h-40 overflow-y-auto">
  {selectedImplementation.comments.map((comment) => (
    <div key={comment.id} className="flex space-x-3 p-3 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-1">
          <span className="font-medium text-sm">{comment.author}</span>
          <span className="text-xs text-muted-foreground">{comment.time}</span>
        </div>
        <p className="text-sm">{comment.message}</p>
        {comment.piece_jointe_url && (
          <div className="mt-2">
            <a 
              href={comment.piece_jointe_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-blue-600 hover:underline"
            >
              <Camera className="h-4 w-4 mr-1" />
              Voir la photo jointe
            </a>
          </div>
        )}
      </div>
    </div>
  ))}
</div>
</div>

            {/* Ajouter un commentaire */}
            <div>
              <h4 className="font-medium mb-2">Ajouter un commentaire</h4>
              <div className="space-y-3">
                <Textarea
                  placeholder="Votre commentaire..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                />
              <div className="flex space-x-2">
  <Button size="sm" onClick={handleAddComment}>
    <MessageSquare className="h-4 w-4 mr-2" />
    Ajouter
  </Button>
  <Button size="sm" variant="outline" asChild>
    <label className="cursor-pointer">
      <Upload className="h-4 w-4 mr-2" />
      Joindre photos
      <input 
        type="file" 
        multiple 
        accept="image/*" 
        onChange={handlePhotoUpload} 
        className="hidden" 
      />
    </label>
  </Button>
</div>
              </div>
            </div>

            {/* Photos jointes */}
            {photos.length > 0 && (
  <div className="mt-4">
    <h4 className="font-medium mb-2">Photos à joindre</h4>
    <div className="flex flex-wrap gap-3">
      {photos.map((photo, index) => (
        <div key={`${photo.name}-${index}`} className="relative group">
          <div className="w-24 h-24 rounded-md overflow-hidden border border-gray-200">
            <img
              src={photo.previewUrl}
              alt={`Preview ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
          <button
            onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            title="Supprimer"
          >
            ×
          </button>
          <div className="text-xs text-gray-500 mt-1 truncate w-24">
            {photo.name}
          </div>
        </div>
      ))}
    </div>
  </div>
)}
          </CardContent>
        </Card>
      )}
    </div>
  )
}