"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Send, Phone, Video, Paperclip, Users, Plus } from "lucide-react"
import { useTranslation } from "react-i18next"
import "@/components/multilingue/i18n.js"


interface User {
  id: number
  name: string
  email: string
  role: string
  magasin_id: string
}

interface Conversation {
  id: number
  titre: string
  date_creation: string
  participants?: User[]
  lastMessage?: string
  nbParticipants?: number
  lastTime?: Date
  unread?: number
  status?: "active" | "urgent"
  type?: "support" | "team" | "management"
}

interface Message {
  id: number
  conversation_id: number
  utilisateur_id: number
  message: string
  date_envoi: string
  lu: boolean
  fichier_joint_url?: string
  utilisateur: {
    id: number
    name: string
    email: string
  }
}

interface Magasin {
  id: number
  magasin_id: string
  nom_magasin: string
}

export default function Communication() {

  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"
  
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [showNewConversationDialog, setShowNewConversationDialog] = useState(false)
  const [newConversationTitle, setNewConversationTitle] = useState("")
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [currentMagasin, setCurrentMagasin] = useState<Magasin | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [conversationParticipants, setConversationParticipants] = useState<User[]>([])

  useEffect(() => {
    const fetchConversationParticipants = async () => {
      if (!selectedConversation) return

      try {
        const token = localStorage.getItem("token")
        const response = await fetch(
          `http://localhost:8081/api/conversation/getAllConversations/${selectedConversation}`,
          {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          }
        )

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des participants")
        }

        const data = await response.json()
        if (data.length > 0 && data[0].Users) {
          setConversationParticipants(data[0].Users)
        }
      } catch (error) {
        console.error("Error fetching conversation participants:", error)
      }
    }

    fetchConversationParticipants()
  }, [selectedConversation])

  useEffect(() => {
    const fetchCurrentUserId = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("Token d'authentification manquant")
        }

        const response = await fetch("http://localhost:8081/api/auth/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          credentials: "include"
        })

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des données utilisateur")
        }

        const data = await response.json()
        const userId = data.user?.idUtilisateur || data.idUtilisateur || data.id
        setCurrentUserId(userId)
        return userId
      } catch (error) {
        console.error("Error fetching current user ID:", error)
      }
    }

    fetchCurrentUserId()
  }, [])

  useEffect(() => {
    const fetchUserMagasin = async () => {
      if (!currentUserId) return

      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`http://localhost:8081/api/magasins/getMagasinByUser/${currentUserId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération du magasin")
        }

        const data = await response.json()
        setCurrentMagasin(data)
      } catch (error) {
        console.error("Error fetching user's magasin:", error)
      }
    }

    fetchUserMagasin()
  }, [currentUserId])

  useEffect(() => {
    const fetchAllUsers = async () => {
      if (!currentMagasin) return
    
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("Token d'authentification manquant")
        }
    
        const response = await fetch(
          `http://localhost:8081/api/auth1/users/store/${currentMagasin.magasin_id}`,
          {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          }
        )
    
        if (!response.ok) {
          const errorData = await response.json().catch(() => null)
          throw new Error(
            errorData?.message || 
            `Erreur ${response.status} lors de la récupération des utilisateurs`
          )
        }
    
        const data = await response.json()
        setAllUsers(data)
      } catch (error) {
        console.error("Error fetching all users:", error)
      }
    }

    fetchAllUsers()
  }, [currentMagasin])

  useEffect(() => {
    const fetchConversations = async () => {
      if (!currentUserId) return

      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`http://localhost:8081/api/conversation/getConversationsByParticipant/${currentUserId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des conversations")
        }

        const data = await response.json()
        
        const transformedConversations = data.map((conv: any) => ({
          id: conv.id,
          titre: conv.titre,
          nbParticipants: conv.nbParticipants,
          date_creation: conv.date_creation,
          lastMessage: "Nouvelle conversation",
          lastTime: new Date(conv.date_creation).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          unread: 0,
          status: "active",
          type: "team"
        }))

        setConversations(transformedConversations)
        
        if (transformedConversations.length > 0) {
          setSelectedConversation(transformedConversations[0].id)
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching conversations:", error)
        setIsLoading(false)
      }
    }

    fetchConversations()
  }, [currentUserId])

  const fetchMessages = async () => {
    if (!selectedConversation || !currentUserId) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(
        `http://localhost:8081/api/chatMessageRoutes/getMessagesByConversation/${selectedConversation}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des messages")
      }

      const apiMessages = await response.json()
      setMessages(apiMessages)
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [selectedConversation, currentUserId])

  useEffect(() => {
    if (!selectedConversation) return

    const interval = setInterval(() => {
      fetchMessages()
    }, 5000)

    return () => clearInterval(interval)
  }, [selectedConversation, currentUserId])

  const handleAddParticipant = (participantId: number) => {
    if (!selectedParticipants.includes(participantId)) {
      setSelectedParticipants([...selectedParticipants, participantId])
    }
  }
  
  const handleRemoveParticipant = (participantId: number) => {
    setSelectedParticipants(selectedParticipants.filter((id) => id !== participantId))
  }
  
  const handleCreateConversation = async () => {
    if (!newConversationTitle.trim() || selectedParticipants.length === 0 || !currentUserId) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:8081/api/conversation/createConversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          titre: newConversationTitle,
          participants: [...selectedParticipants, currentUserId]  
        })
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la création de la conversation")
      }

      const newConversation = await response.json()
      
      setConversations([...conversations, {
        id: newConversation.id,
        titre: newConversation.titre,
        date_creation: newConversation.date_creation,
        lastMessage: "Nouvelle conversation créée",
        lastTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        unread: 0,
        status: "active",
        type: "team"
      }])

      setShowNewConversationDialog(false)
      setNewConversationTitle("")
      setSelectedParticipants([])
    } catch (error) {
      console.error("Error creating conversation:", error)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !currentUserId) return
  
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:8081/api/chatMessageRoutes/createMessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          conversation_id: selectedConversation,
          utilisateur_id: currentUserId,
          message: newMessage,
          date_envoi: new Date().toISOString(),
          fichier_joint_url: ""
        })
      })
  
      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi du message")
      }
  
      const newMessageFromApi = await response.json()
      
      setMessages([...messages, newMessageFromApi])
      setNewMessage("")
      
      setConversations(conversations.map(conv => 
        conv.id === selectedConversation 
          ? { 
              ...conv, 
              lastMessage: newMessage,
              lastTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            } 
          : conv
      ))
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !selectedConversation || !currentUserId) return
  
    const file = e.target.files[0]
    const formData = new FormData()
    formData.append('file', file)
    formData.append('conversation_id', selectedConversation.toString())
    formData.append('utilisateur_id', currentUserId.toString())
  
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:8081/api/chatMessageRoutes/upload-message", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      })
  
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de l'upload du fichier")
      }
  
      const newMessage = await response.json()
      
      setMessages([...messages, newMessage])
      
      setConversations(conversations.map(conv => 
        conv.id === selectedConversation 
          ? { 
              ...conv, 
              lastMessage: "Fichier joint",
              lastTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            } 
          : conv
      ))
    } catch (error) {
      console.error("Error uploading file:", error)
      alert(error.message)
    } finally {
      e.target.value = ''
    }
  }

  const getFileNameFromUrl = (url: string) => {
    try {
      const urlObj = new URL(url)
      const pathname = urlObj.pathname
      return pathname.split('/').pop() || "Fichier joint"
    } catch {
      return url.split('/').pop() || "Fichier joint"
    }
  }
  
  const isImageFile = (url: string) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif']
    const extension = url.substring(url.lastIndexOf('.')).toLowerCase()
    return imageExtensions.includes(extension)
  }

  const getConversationIcon = (type?: string) => {
    switch (type) {
      case "support":
        return <MessageSquare className="h-4 w-4 text-blue-600" />
      case "team":
        return <Users className="h-4 w-4 text-green-600" />
      case "management":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Chargement...</div>
  }

  const currentMessages = messages.filter((m) => m.conversation_id === selectedConversation)
  const currentConversation = conversations.find((c) => c.id === selectedConversation)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[calc(100vh-150px)]">
      {/* Liste des conversations - plus large */}
      <Card className="lg:col-span-2 border-0 shadow-none">
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">{t("front.communication.conversations")}</h2>
            </div>
            <Button 
              size="sm" 
              onClick={() => setShowNewConversationDialog(true)}
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              <span>{t("front.communication.nouvelle")}</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-2">
          <div className="h-[calc(100vh-220px)] overflow-y-auto">
            <div className="space-y-2 pr-2">
              <div className="px-3 py-1 text-sm text-muted-foreground">
              {t("front.communication.messageSupport")}
              </div>
              
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedConversation === conversation.id
                      ? "bg-blue-50"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedConversation(conversation.id)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {getConversationIcon(conversation.type)}
                      <span className="font-medium text-sm">{conversation.titre}</span>
                    </div>
                    {conversation.unread && conversation.unread > 0 && (
                      <Badge variant="destructive" className="h-5 w-5 p-0 text-xs flex items-center justify-center">
                        {conversation.unread}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{conversation.lastMessage}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {conversation.nbParticipants || 0}
                    </span>
                    <span className="text-xs text-muted-foreground">{conversation.lastTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zone de chat - plus large */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg">{currentConversation?.titre}</CardTitle>
              <CardDescription>
                {conversationParticipants.length > 0 
                  ? conversationParticipants.map(p => p.name).join(", ") 
                  : "Aucun participant"}
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline">
                <Phone className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline">
                <Video className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col h-[calc(100vh-220px)]">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {currentMessages.length > 0 ? (
              currentMessages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${
                    message.utilisateur_id === currentUserId ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.utilisateur_id === currentUserId 
                        ? "bg-blue-600 text-white" 
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {message.utilisateur_id !== currentUserId && (
                      <div className="text-xs font-medium mb-1">
                        {message.utilisateur?.name || "Utilisateur inconnu"}
                      </div>
                    )}
                    <div className="text-sm">{message.message}</div>
                    {message.fichier_joint_url && (
                      <div className="mt-2">
                        <a 
                          href={message.fichier_joint_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`inline-flex items-center text-xs ${
                            message.utilisateur_id === currentUserId 
                              ? "text-blue-100 hover:text-blue-200" 
                              : "text-blue-600 hover:text-blue-800"
                          }`}
                          download
                        >
                          <Paperclip className="h-3 w-3 mr-1" />
                          {getFileNameFromUrl(message.fichier_joint_url)}
                        </a>
                        {isImageFile(message.fichier_joint_url) && (
                          <div className="mt-2">
                            <img 
                              src={message.fichier_joint_url} 
                              alt="Fichier joint" 
                              className="max-w-xs max-h-40 rounded-md"
                            />
                          </div>
                        )}
                      </div>
                    )}
                    <div className={`text-xs mt-1 ${
                      message.utilisateur_id === currentUserId 
                        ? "text-blue-100" 
                        : "text-gray-500"
                    }`}>
                      {new Date(message.date_envoi).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                {t("front.communication.noMessage")}
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            <div className="relative">
              <Button 
                size="sm" 
                variant="outline" 
                type="button"
                className="relative"
              >
                <Paperclip className="h-4 w-4" />
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
                />
              </Button>
            </div>
            <Input
              placeholder= {t("front.communication.tapezMessage")}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1"
            />
            <Button 
              size="sm" 
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialog for new conversation */}
      {showNewConversationDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle> {t("front.communication.nouvConversation")}</CardTitle>
              <CardDescription>{t("front.communication.nouvConversationDescr")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t("front.communication.titreConversation")}</label>
                <Input
                  placeholder="Titre"
                  value={newConversationTitle}
                  onChange={(e) => setNewConversationTitle(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">{t("front.communication.participants")}</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedParticipants.map((participantId) => {
                    const participant = allUsers.find(u => u.id === participantId)
                    return (
                      <Badge key={participantId} className="flex items-center gap-1">
                        {participant?.name || "Unknown"}
                        <button 
                          onClick={() => handleRemoveParticipant(participantId)}
                          className="ml-1"
                        >
                          ×
                        </button>
                      </Badge>
                    )
                  })}
                </div>
                
                <select
                  className="w-full p-2 border rounded"
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddParticipant(Number(e.target.value))
                      e.target.value = ""
                    }
                  }}
                >
                  <option value="">{t("front.communication.selectParticipant")}</option>
                  {allUsers
                    .filter(u => !selectedParticipants.includes(u.id))
                    .map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </option>
                    ))}
                </select>
              </div>
            </CardContent>
            <div className="flex justify-end gap-2 p-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setShowNewConversationDialog(false)}
              >
                {t("front.communication.annuler")}
              </Button>
              <Button 
                onClick={handleCreateConversation}
                disabled={!newConversationTitle.trim() || selectedParticipants.length === 0}
              >
                {t("front.communication.creer")}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}