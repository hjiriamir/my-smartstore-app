"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Send, Search, Plus, Reply, Archive, Trash2, Star, Clock } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

interface Message {
  id: number
  email: string
  phone: string
  company_name: string
  message: string
  name: string
  address: string
  subject: string
  status: 'unread' | 'read' | 'replied' | 'archived'
  category: 'support' | 'billing' | 'feature' | 'bug'
  created_at: string
}

interface EmailRequest {
  emetteur: string
  recepteur: string
  objet: string
  contenuHtml: string
}

export function MessagesInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [replyContent, setReplyContent] = useState("")
  const [adminEmail, setAdminEmail] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [newMessageOpen, setNewMessageOpen] = useState(false)
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [newMessageData, setNewMessageData] = useState({
    emetteur: "",
    recepteur: "",
    objet: "",
    contenu: ""
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [messageToDelete, setMessageToDelete] = useState<number | null>(null)
  const { toast } = useToast()

  // Récupérer les messages depuis l'API
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/message/contact-messages`)
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des messages')
        }
        const data = await response.json()
        setMessages(data)
      } catch (error) {
        console.error(error)
        toast({
          title: "Erreur",
          description: "Impossible de charger les messages",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessages()
  }, [toast])

  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.company_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || message.status === statusFilter
    const matchesCategory = categoryFilter === "all" || message.category === categoryFilter
    
    return matchesSearch && matchesStatus && matchesCategory
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'unread':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Non lu</Badge>
      case 'read':
        return <Badge variant="secondary">Lu</Badge>
      case 'replied':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Répondu</Badge>
      case 'archived':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Archivé</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'support':
        return <Badge variant="outline">Support</Badge>
      case 'billing':
        return <Badge variant="outline">Facturation</Badge>
      case 'feature':
        return <Badge variant="outline">Fonctionnalité</Badge>
      case 'bug':
        return <Badge variant="outline">Bug</Badge>
      default:
        return <Badge variant="outline">{category}</Badge>
    }
  }

  const unreadCount = messages.filter(m => m.status === 'unread').length

  const markAsRead = async (messageId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/message/messagesLire/${messageId}`, {
        method: 'PUT'
      })

      if (!response.ok) {
        throw new Error('Erreur lors du marquage comme lu')
      }

      const updatedMessages = messages.map(msg => 
        msg.id === messageId ? { ...msg, status: 'read' } : msg
      )
      setMessages(updatedMessages)

      if (selectedMessage?.id === messageId) {
        setSelectedMessage({ ...selectedMessage, status: 'read' })
      }
    } catch (error) {
      console.error(error)
      toast({
        title: "Erreur",
        description: "Échec du marquage comme lu",
        variant: "destructive",
      })
    }
  }

  const markAsReplied = async (messageId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/message/messagesRepondre/${messageId}`, {
        method: 'PUT'
      })

      if (!response.ok) {
        throw new Error('Erreur lors du marquage comme répondu')
      }

      const updatedMessages = messages.map(msg => 
        msg.id === messageId ? { ...msg, status: 'replied' } : msg
      )
      setMessages(updatedMessages)

      if (selectedMessage?.id === messageId) {
        setSelectedMessage({ ...selectedMessage, status: 'replied' })
      }
    } catch (error) {
      console.error(error)
      toast({
        title: "Erreur",
        description: "Échec du marquage comme répondu",
        variant: "destructive",
      })
    }
  }

  const handleReply = async () => {
    if (!selectedMessage || !replyContent.trim() || !adminEmail.trim()) return

    setIsSending(true)
    
    const emailRequest: EmailRequest = {
      emetteur: adminEmail,
      recepteur: selectedMessage.email,
      objet: `Re: ${selectedMessage.subject}`,
      contenuHtml: replyContent
    }

    try {
      // Envoyer l'email
      const emailResponse = await fetch(`${API_BASE_URL}/message/envoyer-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailRequest)
      })

      if (!emailResponse.ok) {
        throw new Error('Erreur lors de l\'envoi de la réponse')
      }

      // Marquer comme répondu
      await markAsReplied(selectedMessage.id)

      toast({
        title: "Succès",
        description: "Réponse envoyée avec succès",
      })

      setSelectedMessage(null)
      setReplyContent("")
    } catch (error) {
      console.error(error)
      toast({
        title: "Erreur",
        description: "Échec de l'envoi de la réponse",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleSendNewMessage = async () => {
    if (!newMessageData.emetteur || !newMessageData.recepteur || 
        !newMessageData.objet || !newMessageData.contenu) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)
    
    const emailRequest: EmailRequest = {
      emetteur: newMessageData.emetteur,
      recepteur: newMessageData.recepteur,
      objet: newMessageData.objet,
      contenuHtml: newMessageData.contenu
    }

    try {
      const response = await fetch(`${API_BASE_URL}/message/envoyer-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailRequest)
      })

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du message')
      }

      toast({
        title: "Succès",
        description: "Message envoyé avec succès",
      })

      setNewMessageOpen(false)
      setNewMessageData({
        emetteur: "",
        recepteur: "",
        objet: "",
        contenu: ""
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Erreur",
        description: "Échec de l'envoi du message",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleArchive = async (messageId: number) => {
    try {
      
      
      const updatedMessages = messages.map(msg => 
        msg.id === messageId ? { ...msg, status: 'archived' } : msg
      )
      setMessages(updatedMessages)

      toast({
        title: "Succès",
        description: "Message archivé",
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Erreur",
        description: "Échec de l'archivage du message",
        variant: "destructive",
      })
    }
  }

  const confirmDelete = async () => {
    if (!messageToDelete) return

    try {
      const response = await fetch(`${API_BASE_URL}/message/contact-messages/${messageToDelete}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du message')
      }

      const updatedMessages = messages.filter(msg => msg.id !== messageToDelete)
      setMessages(updatedMessages)

      if (selectedMessage?.id === messageToDelete) {
        setSelectedMessage(null)
      }

      toast({
        title: "Succès",
        description: "Message supprimé avec succès",
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Erreur",
        description: "Échec de la suppression du message",
        variant: "destructive",
      })
    } finally {
      setMessageToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  const handleDeleteClick = (messageId: number) => {
    setMessageToDelete(messageId)
    setDeleteDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 w-full">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messages
            {unreadCount > 0 && (
              <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                {unreadCount} non lus
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Gérez les messages et demandes de vos clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtres et actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher dans les messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="unread">Non lus</SelectItem>
                <SelectItem value="read">Lus</SelectItem>
                <SelectItem value="replied">Répondus</SelectItem>
                
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                <SelectItem value="support">Support</SelectItem>
                <SelectItem value="billing">Facturation</SelectItem>
                <SelectItem value="feature">Fonctionnalité</SelectItem>
                <SelectItem value="bug">Bug</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={newMessageOpen} onOpenChange={setNewMessageOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau Message
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Nouveau Message</DialogTitle>
                  <DialogDescription>
                    Envoyer un message à un client
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Votre email</label>
                    <Input
                      placeholder="Email de l'émetteur"
                      value={newMessageData.emetteur}
                      onChange={(e) => setNewMessageData({
                        ...newMessageData,
                        emetteur: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Destinataire</label>
                    <Input
                      placeholder="Email du destinataire"
                      value={newMessageData.recepteur}
                      onChange={(e) => setNewMessageData({
                        ...newMessageData,
                        recepteur: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Sujet</label>
                    <Input 
                      placeholder="Sujet du message"
                      value={newMessageData.objet}
                      onChange={(e) => setNewMessageData({
                        ...newMessageData,
                        objet: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Message</label>
                    <Textarea 
                      placeholder="Votre message..."
                      value={newMessageData.contenu}
                      onChange={(e) => setNewMessageData({
                        ...newMessageData,
                        contenu: e.target.value
                      })}
                      className="min-h-[120px]"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setNewMessageOpen(false)}
                    >
                      Annuler
                    </Button>
                    <Button 
                      onClick={handleSendNewMessage}
                      disabled={isSending}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isSending ? "Envoi en cours..." : "Envoyer"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Liste des messages */}
        
          <ScrollArea className="h-[calc(100vh-300px)] rounded-md border">
            <div className="space-y-2 w-full overflow-x-auto">
              {filteredMessages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun message trouvé
                </div>
              ) : (
                filteredMessages.map((message) => (
                  <Card 
                    key={message.id} 
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                      message.status === 'unread' ? 'border-l-4 border-l-blue-500' : ''
                    }`}
                    onClick={() => {
                      setSelectedMessage(message)
                      if (message.status === 'unread') {
                        markAsRead(message.id)
                      }
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {message.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`font-medium ${message.status === 'unread' ? 'font-bold' : ''}`}>
                                {message.name}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {message.company_name}
                              </span>
                              <div className="flex gap-1">
                                {getCategoryBadge(message.category)}
                              </div>
                            </div>
                            <div className={`text-sm mb-1 ${message.status === 'unread' ? 'font-semibold' : ''}`}>
                              {message.subject}
                            </div>
                            <div className="text-sm text-muted-foreground line-clamp-2">
                              {message.message}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(message.created_at).toLocaleDateString('fr-FR')}
                          </div>
                          {getStatusBadge(message.status)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Modal de détail du message */}
          {selectedMessage && (
            <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
              <DialogContent className="max-w-4xl max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    {selectedMessage.subject}
                  </DialogTitle>
                  <DialogDescription>
                    Message de {selectedMessage.name} - {selectedMessage.company_name}
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh]">
                  <div className="space-y-4">
                    {/* En-tête du message */}
                    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          {selectedMessage.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-medium">{selectedMessage.name}</div>
                            <div className="text-sm text-muted-foreground">{selectedMessage.email}</div>
                            <div className="text-sm text-muted-foreground">{selectedMessage.company_name}</div>
                            <div className="text-sm text-muted-foreground">{selectedMessage.phone}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">
                              {new Date(selectedMessage.created_at).toLocaleDateString('fr-FR')} à{' '}
                              {new Date(selectedMessage.created_at).toLocaleTimeString('fr-FR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                            <div className="flex gap-2 mt-1">
                              {getCategoryBadge(selectedMessage.category)}
                              {getStatusBadge(selectedMessage.status)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contenu du message */}
                    <div className="p-4 border rounded-lg">
                      <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                    </div>

                    {/* Zone de réponse */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Votre email</label>
                        <Input
                          placeholder="Votre email"
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Réponse</label>
                        <Textarea
                          placeholder="Votre réponse..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          className="min-h-[120px]"
                        />
                      </div>
                    </div>
                  </div>
                </ScrollArea>
                <DialogFooter className="gap-2">
                  <Button 
                    variant="destructive" 
                    onClick={() => handleDeleteClick(selectedMessage.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                  <div className="flex-1" />
                  <Button variant="outline" onClick={() => setSelectedMessage(null)}>
                    Fermer
                  </Button>
                  <Button 
                    onClick={handleReply} 
                    disabled={isSending || !replyContent.trim() || !adminEmail.trim()}
                  >
                    <Reply className="h-4 w-4 mr-2" />
                    {isSending ? "Envoi en cours..." : "Répondre"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* Confirmation de suppression */}
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action supprimera définitivement le message et ne pourra pas être annulée.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={confirmDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}