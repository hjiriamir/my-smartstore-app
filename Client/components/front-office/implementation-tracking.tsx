"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, AlertTriangle, Camera, MessageSquare, Upload, Calendar, User } from "lucide-react"

export default function ImplementationTracking() {
  const [selectedImplementation, setSelectedImplementation] = useState<any>(null)
  const [comment, setComment] = useState("")
  const [photos, setPhotos] = useState<File[]>([])

  const implementations = [
    {
      id: 1,
      planogramName: "Rayon Épicerie Salée",
      status: "En cours",
      progress: 65,
      assignedTo: "Marie Dubois",
      dueDate: "2024-01-20",
      startDate: "2024-01-18",
      estimatedTime: "4h",
      actualTime: "2h 30min",
      tasks: [
        { id: 1, name: "Retirer anciens produits", completed: true },
        { id: 2, name: "Nettoyer les étagères", completed: true },
        { id: 3, name: "Placer nouveaux produits", completed: false },
        { id: 4, name: "Vérifier les prix", completed: false },
        { id: 5, name: "Prendre photos finales", completed: false },
      ],
      comments: [
        {
          id: 1,
          author: "Marie Dubois",
          time: "10:30",
          message: "Début de l'implémentation, quelques produits manquants",
        },
        { id: 2, author: "Système", time: "11:15", message: "Étape 1 et 2 terminées avec succès" },
      ],
    },
    {
      id: 2,
      planogramName: "Produits Laitiers",
      status: "À implémenter",
      progress: 0,
      assignedTo: "Jean Martin",
      dueDate: "2024-01-22",
      startDate: null,
      estimatedTime: "3h",
      actualTime: null,
      tasks: [
        { id: 1, name: "Retirer anciens produits", completed: false },
        { id: 2, name: "Nettoyer les étagères", completed: false },
        { id: 3, name: "Placer nouveaux produits", completed: false },
        { id: 4, name: "Vérifier les prix", completed: false },
      ],
      comments: [],
    },
    {
      id: 3,
      planogramName: "Boissons Chaudes",
      status: "Terminé",
      progress: 100,
      assignedTo: "Sophie Laurent",
      dueDate: "2024-01-18",
      startDate: "2024-01-17",
      estimatedTime: "2h",
      actualTime: "1h 45min",
      tasks: [
        { id: 1, name: "Retirer anciens produits", completed: true },
        { id: 2, name: "Nettoyer les étagères", completed: true },
        { id: 3, name: "Placer nouveaux produits", completed: true },
        { id: 4, name: "Vérifier les prix", completed: true },
        { id: 5, name: "Prendre photos finales", completed: true },
      ],
      comments: [
        { id: 1, author: "Sophie Laurent", time: "09:00", message: "Implémentation terminée avec succès" },
        { id: 2, author: "Manager", time: "09:30", message: "Validation effectuée, excellent travail!" },
      ],
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Terminé":
        return "bg-green-100 text-green-800"
      case "En cours":
        return "bg-yellow-100 text-yellow-800"
      case "À implémenter":
        return "bg-red-100 text-red-800"
      case "En retard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Terminé":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "En cours":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "À implémenter":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const handleValidateImplementation = (implementationId: number) => {
    console.log(`Validation de l'implémentation ${implementationId}`)
    // Ici on ajouterait la logique de validation
  }

  const handleAddComment = (implementationId: number) => {
    if (comment.trim()) {
      console.log(`Ajout commentaire pour ${implementationId}: ${comment}`)
      setComment("")
    }
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setPhotos([...photos, ...files])
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
              {implementations.filter((i) => i.status === "En cours").length}
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
              <div>
                <h4 className="font-medium mb-2">
                  Tâches ({implementation.tasks.filter((t) => t.completed).length}/{implementation.tasks.length})
                </h4>
                <div className="space-y-1">
                  {implementation.tasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-center space-x-2 text-sm">
                      <CheckCircle className={`h-3 w-3 ${task.completed ? "text-green-600" : "text-gray-300"}`} />
                      <span className={task.completed ? "line-through text-muted-foreground" : ""}>{task.name}</span>
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
                <Button size="sm" variant="outline" onClick={() => setSelectedImplementation(implementation)}>
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
                {selectedImplementation.comments.map((comment: any) => (
                  <div key={comment.id} className="flex space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm">{comment.author}</span>
                        <span className="text-xs text-muted-foreground">{comment.time}</span>
                      </div>
                      <p className="text-sm">{comment.message}</p>
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
                  <Button size="sm" onClick={() => handleAddComment(selectedImplementation.id)}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Ajouter
                  </Button>
                  <Button size="sm" variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    Joindre photos
                  </Button>
                </div>
              </div>
            </div>

            {/* Photos jointes */}
            {photos.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Photos jointes ({photos.length})</h4>
                <div className="flex space-x-2">
                  {photos.map((photo, index) => (
                    <div key={index} className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Camera className="h-6 w-6 text-gray-400" />
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
