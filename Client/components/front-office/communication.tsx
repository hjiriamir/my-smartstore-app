"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Send, Phone, Video, Paperclip, Bell, Clock, AlertCircle, Users } from "lucide-react"

export default function Communication() {
  const [selectedConversation, setSelectedConversation] = useState(1)
  const [newMessage, setNewMessage] = useState("")
  const [showNotifications, setShowNotifications] = useState(true)

  const conversations = [
    {
      id: 1,
      title: "Support Planogramme Épicerie",
      participants: ["Marie Dubois", "Support Technique"],
      lastMessage: "Merci pour votre aide, le problème est résolu",
      lastTime: "10:30",
      unread: 0,
      status: "active",
      type: "support",
    },
    {
      id: 2,
      title: "Équipe Magasin Centre-Ville",
      participants: ["Jean Martin", "Sophie Laurent", "Marie Dubois"],
      lastMessage: "Nouveau planogramme disponible pour demain",
      lastTime: "09:45",
      unread: 2,
      status: "active",
      type: "team",
    },
    {
      id: 3,
      title: "Siège - Modifications Urgentes",
      participants: ["Direction Retail", "Marie Dubois"],
      lastMessage: "Planogramme modifié, implémentation prioritaire",
      lastTime: "08:15",
      unread: 1,
      status: "urgent",
      type: "management",
    },
  ]

  const messages = [
    {
      id: 1,
      conversationId: 1,
      sender: "Support Technique",
      content:
        "Bonjour Marie, j'ai vu votre demande concernant le planogramme Épicerie. Pouvez-vous me préciser quel est le problème exactement ?",
      time: "09:30",
      type: "received",
    },
    {
      id: 2,
      conversationId: 1,
      sender: "Marie Dubois",
      content:
        "Bonjour, j'ai un problème avec l'affichage 3D du planogramme. Certains produits n'apparaissent pas à la bonne position.",
      time: "09:35",
      type: "sent",
    },
    {
      id: 3,
      conversationId: 1,
      sender: "Support Technique",
      content:
        "Je vois le problème. Il s'agit d'un bug connu que nous avons corrigé. Pouvez-vous actualiser votre navigateur et me dire si cela fonctionne ?",
      time: "09:40",
      type: "received",
    },
    {
      id: 4,
      conversationId: 1,
      sender: "Marie Dubois",
      content: "Parfait ! Ça fonctionne maintenant. Merci pour votre aide rapide.",
      time: "10:30",
      type: "sent",
    },
  ]

  const notifications = [
    {
      id: 1,
      type: "message",
      title: "Nouveau message",
      content: "Support Technique vous a répondu",
      time: "10:30",
      read: false,
    },
    {
      id: 2,
      type: "planogram",
      title: "Nouveau planogramme",
      content: "Rayon Boulangerie - Version 2.1 disponible",
      time: "09:15",
      read: false,
    },
    {
      id: 3,
      type: "reminder",
      title: "Rappel d'échéance",
      content: "Implémentation Produits Laitiers due demain",
      time: "08:45",
      read: true,
    },
  ]

  const currentMessages = messages.filter((m) => m.conversationId === selectedConversation)
  const currentConversation = conversations.find((c) => c.id === selectedConversation)

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      console.log("Envoi message:", newMessage)
      setNewMessage("")
    }
  }

  const getConversationIcon = (type: string) => {
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageSquare className="h-4 w-4 text-blue-600" />
      case "planogram":
        return <Bell className="h-4 w-4 text-green-600" />
      case "reminder":
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
      {/* Liste des conversations */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">Conversations</CardTitle>
          <CardDescription>Messages et support</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-1">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-3 cursor-pointer hover:bg-gray-50 border-l-4 ${
                  selectedConversation === conversation.id
                    ? "bg-blue-50 border-l-blue-500"
                    : conversation.status === "urgent"
                      ? "border-l-red-500"
                      : "border-l-transparent"
                }`}
                onClick={() => setSelectedConversation(conversation.id)}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    {getConversationIcon(conversation.type)}
                    <span className="font-medium text-sm truncate">{conversation.title}</span>
                  </div>
                  {conversation.unread > 0 && (
                    <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                      {conversation.unread}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{conversation.lastMessage}</p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-muted-foreground">{conversation.participants.length} participants</span>
                  <span className="text-xs text-muted-foreground">{conversation.lastTime}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Zone de chat */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg">{currentConversation?.title}</CardTitle>
              <CardDescription>{currentConversation?.participants.join(", ")}</CardDescription>
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

        <CardContent className="flex flex-col h-96">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {currentMessages.map((message) => (
              <div key={message.id} className={`flex ${message.type === "sent" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.type === "sent" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {message.type === "received" && <div className="text-xs font-medium mb-1">{message.sender}</div>}
                  <div className="text-sm">{message.content}</div>
                  <div className={`text-xs mt-1 ${message.type === "sent" ? "text-blue-100" : "text-gray-500"}`}>
                    {message.time}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Zone de saisie */}
          <div className="flex space-x-2">
            <Button size="sm" variant="outline">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              placeholder="Tapez votre message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1"
            />
            <Button size="sm" onClick={handleSendMessage}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Notifications</CardTitle>
            <Button size="sm" variant="ghost" onClick={() => setShowNotifications(!showNotifications)}>
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 border-b hover:bg-gray-50 ${!notification.read ? "bg-blue-50" : ""}`}
              >
                <div className="flex items-start space-x-3">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium truncate">{notification.title}</h4>
                      {!notification.read && <div className="w-2 h-2 bg-blue-600 rounded-full ml-2" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{notification.content}</p>
                    <span className="text-xs text-muted-foreground">{notification.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t">
            <Button size="sm" variant="outline" className="w-full">
              Marquer tout comme lu
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
