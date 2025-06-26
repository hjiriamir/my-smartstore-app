import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Send, MessageCircle, Paperclip, PlusCircle, Loader2, Users, X } from "lucide-react"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Participant {
  id: number;
  conversation_id: number;
  utilisateur_id: number;
  utilisateur: {
    id: number;
    name: string;
    email: string;
  };
}

interface Conversation {
  id: number;
  titre: string;
  date_creation: string;
  participants: Participant[];
  nbParticipants: number;
}

interface Message {
  id: number;
  conversation_id: number;
  utilisateur_id: number;
  message: string;
  date_envoi: string;
  lu: boolean;
  fichier_joint_url: string;
  utilisateur: {
    id: number;
    name: string;
    email: string;
  };
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  entreprises_id: number;
}

export function CommunicationContent() {
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentUserEntrepriseId, setCurrentUserEntrepriseId] = useState<number | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState({
    conversations: false,
    messages: false,
    sending: false,
    users: false,
    creatingConversation: false
  });
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false);
  const [newConversationTitle, setNewConversationTitle] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);

  // Récupérer l'ID de l'utilisateur courant et son entreprise
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
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
          throw new Error("Erreur lors de la récupération de l'utilisateur");
        }

        const data = await response.json();
        const userId = data.user?.idUtilisateur || data.idUtilisateur || data.id;
        const entrepriseId = data.user?.entreprises_id || data.entreprises_id;
        
        setCurrentUserId(userId);
        setCurrentUserEntrepriseId(entrepriseId);
      } catch (error) {
        console.error("Error fetching current user ID:", error);
        setError("Erreur lors de la récupération de l'utilisateur");
      }
    };

    fetchCurrentUser();
  }, []);

  // Récupérer les utilisateurs actifs de l'entreprise
  useEffect(() => {
    if (!currentUserEntrepriseId || !isNewConversationOpen) return;

    const fetchActiveUsers = async () => {
      try {
        setLoading(prev => ({...prev, users: true}));
        const token = localStorage.getItem("token");
        
        const response = await fetch(
          `http://localhost:8081/api/auth1/getActifUsersByEntreprise/${currentUserEntrepriseId}`, 
          {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          }
        );

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des utilisateurs");
        }

        const data = await response.json();
        setAvailableUsers(data.rows);
      } catch (error) {
        console.error("Error fetching active users:", error);
        setError("Erreur lors de la récupération des utilisateurs");
      } finally {
        setLoading(prev => ({...prev, users: false}));
      }
    };

    fetchActiveUsers();
  }, [currentUserEntrepriseId, isNewConversationOpen]);

  // Récupérer les conversations de l'utilisateur
  useEffect(() => {
    if (!currentUserId) return;

    const fetchConversations = async () => {
      try {
        setLoading(prev => ({...prev, conversations: true}));
        const token = localStorage.getItem("token");
        
        const response = await fetch(
          `http://localhost:8081/api/conversation/getConversationsByParticipant/${currentUserId}`, 
          {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          }
        );

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des conversations");
        }

        const data = await response.json();
        setConversations(data);
        if (data.length > 0 && !selectedConversation) {
          setSelectedConversation(data[0]);
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
        setError("Erreur lors de la récupération des conversations");
      } finally {
        setLoading(prev => ({...prev, conversations: false}));
      }
    };

    fetchConversations();
  }, [currentUserId]);

  // Récupérer les messages de la conversation sélectionnée
  useEffect(() => {
    if (!selectedConversation) return;

    const fetchMessages = async () => {
      try {
        setLoading(prev => ({...prev, messages: true}));
        const token = localStorage.getItem("token");
        
        const response = await fetch(
          `http://localhost:8081/api/chatMessageRoutes/getMessagesByConversation/${selectedConversation.id}`, 
          {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          }
        );

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des messages");
        }

        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
        setError("Erreur lors de la récupération des messages");
      } finally {
        setLoading(prev => ({...prev, messages: false}));
      }
    };

    fetchMessages();
  }, [selectedConversation]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !currentUserId) return;

    try {
      setLoading(prev => ({...prev, sending: true}));
      const token = localStorage.getItem("token");
      
      const response = await fetch(
        "http://localhost:8081/api/chatMessageRoutes/createMessage",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            conversation_id: selectedConversation.id,
            utilisateur_id: currentUserId,
            message: newMessage,
            fichier_joint_url: null
          })
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi du message");
      }

      // Rafraîchir les messages après envoi
      const updatedMessages = await fetch(
        `http://localhost:8081/api/chatMessageRoutes/getMessagesByConversation/${selectedConversation.id}`, 
        {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      ).then(res => res.json());

      setMessages(updatedMessages);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Erreur lors de l'envoi du message");
    } finally {
      setLoading(prev => ({...prev, sending: false}));
    }
  };

  const handleCreateConversation = async () => {
    if (!newConversationTitle.trim() || selectedUsers.length === 0 || !currentUserId) return;
  
    try {
      setLoading(prev => ({...prev, creatingConversation: true}));
      const token = localStorage.getItem("token");
      
      // Ajouter l'utilisateur courant aux participants
      const allParticipants = [...selectedUsers, currentUserId];
      
      const response = await fetch(
        "http://localhost:8081/api/conversation/createConversation/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            titre: newConversationTitle,
            participants: allParticipants
          })
        }
      );
  
      if (!response.ok) {
        throw new Error("Erreur lors de la création de la conversation");
      }
  
      const newConversation = await response.json();
      
      // Rafraîchir la liste des conversations
      const conversationsResponse = await fetch(
        `http://localhost:8081/api/conversation/getConversationsByParticipant/${currentUserId}`, 
        {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );
  
      if (conversationsResponse.ok) {
        const conversationsData = await conversationsResponse.json();
        // Vérifier que la réponse contient bien un tableau
        if (Array.isArray(conversationsData)) {
          setConversations(conversationsData);
          setSelectedConversation(newConversation);
        } else {
          console.error("La réponse de l'API n'est pas un tableau:", conversationsData);
          setError("Format de réponse inattendu de l'API");
        }
      } else {
        throw new Error("Erreur lors du rafraîchissement des conversations");
      }
  
      // Fermer le modal et réinitialiser les champs
      setIsNewConversationOpen(false);
      setNewConversationTitle("");
      setSelectedUsers([]);
    } catch (error) {
      console.error("Error creating conversation:", error);
      setError(error instanceof Error ? error.message : "Erreur lors de la création de la conversation");
    } finally {
      setLoading(prev => ({...prev, creatingConversation: false}));
    }
  };

  const getStatusBadge = (conversation: Conversation) => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return <Badge variant="default" className="bg-green-100 text-green-800">Nouveau</Badge>;
    
    const messageDate = new Date(lastMessage.date_envoi);
    const now = new Date();
    const diffHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 24) return <Badge variant="default" className="bg-blue-100 text-blue-800">Récent</Badge>;
    return <Badge variant="outline">Ancien</Badge>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatConversationDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString();
  };

  const getParticipantNames = (conversation: Conversation | null) => {
    if (!conversation || !conversation.participants) return "Aucun participant";
    
    // Exclure l'utilisateur courant de la liste
    const otherParticipants = conversation.participants
      .filter(p => p.utilisateur_id !== currentUserId)
      .map(p => p.utilisateur?.name || `Utilisateur ${p.utilisateur_id}`);
    
    if (otherParticipants.length === 0) return "Vous (seul)";
    
    // Limiter à 3 noms
    const displayedNames = otherParticipants.slice(0, 3);
    let result = displayedNames.join(", ");
    
    if (otherParticipants.length > 3) {
      result += ` et ${otherParticipants.length - 3} autres`;
    }
    
    return result;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Messagerie</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Communiquez avec votre équipe en temps réel</p>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-red-100 text-red-700 rounded-md"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des conversations */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageCircle className="h-5 w-5 text-blue-600" />
                <span className="text-gray-800 dark:text-white">Conversations</span>
                <Button 
                  size="sm" 
                  className="ml-auto"
                  onClick={() => setIsNewConversationOpen(true)}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Nouvelle
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading.conversations ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  Aucune conversation trouvée
                </div>
              ) : (
                <div className="divide-y">
                  {conversations.map((conversation) => (
                    <motion.div
                      key={conversation.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedConversation?.id === conversation.id 
                          ? "bg-blue-50 dark:bg-gray-800" 
                          : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      }`}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {conversation.titre}
                        </h4>
                        {getStatusBadge(conversation)}
                      </div>
                      <div className="flex items-center mt-1 space-x-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {conversation.nbParticipants} participant{conversation.nbParticipants > 1 ? 's' : ''}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          • {formatConversationDate(conversation.date_creation)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Détails de la conversation */}
        <div className="lg:col-span-2 space-y-4">
          {selectedConversation ? (
            <Card className="shadow-sm h-full flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-gray-900 dark:text-white">
                    {selectedConversation.titre}
                  </CardTitle>
                  <Badge variant="outline" className="flex items-center gap-1">
  <Users className="h-4 w-4" />
  {selectedConversation.participants?.length || 0}
</Badge>
                </div>
                <div className="flex items-center mt-1 text-sm text-gray-600 dark:text-gray-400">
                  <span className="truncate">
                    Avec {getParticipantNames(selectedConversation)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto max-h-[500px]">
                  {loading.messages ? (
                    <div className="flex justify-center items-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <MessageCircle className="h-12 w-12 mb-4 opacity-30" />
                      <p>Aucun message dans cette conversation</p>
                      <p className="text-sm mt-2">Envoyez le premier message !</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${
                            message.utilisateur_id === currentUserId 
                              ? "justify-end" 
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md p-4 rounded-2xl ${
                              message.utilisateur_id === currentUserId
                                ? "bg-blue-600 text-white rounded-br-none"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none"
                            } shadow-sm`}
                          >
                            <div className={`font-medium ${
                              message.utilisateur_id === currentUserId
                                ? "text-blue-100"
                                : "text-gray-700 dark:text-gray-300"
                            }`}>
                              {message.utilisateur.name}
                            </div>
                            
                            <div className={`mt-1 ${
                              message.utilisateur_id === currentUserId
                                ? "text-white"
                                : "text-gray-800 dark:text-gray-200"
                            }`}>
                              {message.fichier_joint_url ? (
                                <a 
                                  href={message.fichier_joint_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center mt-2 p-2 bg-white/10 dark:bg-black/20 rounded hover:underline"
                                >
                                  <Paperclip className="inline mr-2" size={16} />
                                  Fichier joint
                                </a>
                              ) : (
                                message.message
                              )}
                            </div>
                            
                            <div className={`text-xs mt-2 ${
                              message.utilisateur_id === currentUserId
                                ? "text-blue-200 opacity-80"
                                : "text-gray-500 dark:text-gray-400"
                            }`}>
                              {formatDate(message.date_envoi)}
                              {message.lu && message.utilisateur_id === currentUserId && (
                                <span className="ml-2">✓✓</span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Zone d'envoi de message */}
                <div className="border-t p-4 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
                  <Textarea
                    placeholder="Écrivez votre message ici..."
                    className="min-h-[80px] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={loading.sending}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <div className="flex justify-between items-center mt-3">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      disabled={loading.sending}
                      className="text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      <Paperclip className="mr-2 h-4 w-4" />
                      Joindre un fichier
                    </Button>
                    <Button 
                      onClick={handleSendMessage}
                      disabled={loading.sending || !newMessage.trim()}
                      className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                    >
                      {loading.sending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Envoi...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Envoyer
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center shadow-sm">
              <CardContent className="p-8 text-center">
                <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Aucune conversation sélectionnée</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Sélectionnez une conversation existante ou créez-en une nouvelle
                </p>
                <Button 
                  className="mt-4"
                  onClick={() => setIsNewConversationOpen(true)}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Nouvelle conversation
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modal pour créer une nouvelle conversation */}
      <Dialog open={isNewConversationOpen} onOpenChange={setIsNewConversationOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Nouvelle conversation</DialogTitle>
            <DialogDescription>
              Créez une nouvelle conversation avec vos collègues
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Titre de la conversation
              </label>
              <Input
                id="title"
                placeholder="Entrez un titre..."
                value={newConversationTitle}
                onChange={(e) => setNewConversationTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="participants" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Participants
              </label>
              {loading.users ? (
                <div className="flex justify-center items-center h-20">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : (
                <Select 
                  onValueChange={(value) => {
                    if (!selectedUsers.includes(parseInt(value))) {
                      setSelectedUsers([...selectedUsers, parseInt(value)]);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez des utilisateurs..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers
                      .filter(user => user.id !== currentUserId) // Exclure l'utilisateur courant
                      .map(user => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.name} ({user.role})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
              
              {/* Liste des participants sélectionnés */}
              {selectedUsers.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Participants sélectionnés:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map(userId => {
                      const user = availableUsers.find(u => u.id === userId);
                      return (
                        <Badge 
                          key={userId} 
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          {user?.name || `Utilisateur ${userId}`}
                          <button
                            onClick={() => setSelectedUsers(selectedUsers.filter(id => id !== userId))}
                            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsNewConversationOpen(false);
                setNewConversationTitle("");
                setSelectedUsers([]);
              }}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleCreateConversation}
              disabled={loading.creatingConversation || !newConversationTitle.trim() || selectedUsers.length === 0}
            >
              {loading.creatingConversation ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                'Créer la conversation'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}