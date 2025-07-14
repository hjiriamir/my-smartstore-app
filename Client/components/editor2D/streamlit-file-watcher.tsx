"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface StreamlitFileWatcherProps {
  onDataReceived: (data: any) => void
  isActive: boolean
}

export function StreamlitFileWatcher({ onDataReceived, isActive }: StreamlitFileWatcherProps) {
  const { toast } = useToast()
  const [isWatching, setIsWatching] = useState(false)
  const IA_SERVICE_URL = process.env.NEXT_PUBLIC_IA_SERVICE_URL;

  useEffect(() => {
    if (!isActive) return

    setIsWatching(true)

    // Surveiller localStorage
    const checkLocalStorage = () => {
      try {
        const streamlitData = localStorage.getItem("planogram_data_direct")
        if (streamlitData) {
          const parsedData = JSON.parse(streamlitData)
          console.log("📦 Données Streamlit détectées dans localStorage")

          // Nettoyer après utilisation
          localStorage.removeItem("planogram_data_direct")

          onDataReceived(parsedData)
          setIsWatching(false)

          toast({
            title: "🚀 Import automatique",
            description: "Données Streamlit importées automatiquement!",
            variant: "default",
          })

          return true
        }
      } catch (error) {
        console.error("Erreur localStorage:", error)
      }
      return false
    }

    // Surveiller les messages window
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== IA_SERVICE_URL) return;

      if (event.data.type === "PLANOGRAM_DATA_DIRECT" || event.data.type === "planogram_generated") {
        console.log("📨 Message Streamlit reçu")
        const data = event.data.data || event.data.planogram
        onDataReceived(data)
        setIsWatching(false)

        toast({
          title: "🚀 Import automatique",
          description: "Données Streamlit reçues par message!",
          variant: "default",
        })
      }
    }

    // Surveiller les changements de focus (retour sur l'onglet)
    const handleFocus = () => {
      if (checkLocalStorage()) {
        return
      }
    }

    window.addEventListener("message", handleMessage)
    window.addEventListener("focus", handleFocus)

    // Vérification périodique
    const interval = setInterval(() => {
      if (checkLocalStorage()) {
        clearInterval(interval)
      }
    }, 3000)

    // Nettoyage après 10 minutes
    const timeout = setTimeout(() => {
      setIsWatching(false)
      clearInterval(interval)
    }, 600000)

    return () => {
      window.removeEventListener("message", handleMessage)
      window.removeEventListener("focus", handleFocus)
      clearInterval(interval)
      clearTimeout(timeout)
      setIsWatching(false)
    }
  }, [isActive, onDataReceived, toast])

  if (!isWatching) return null

  return (
    <div className="fixed bottom-4 right-4 bg-blue-500 text-white p-3 rounded-lg shadow-lg z-50">
      <div className="flex items-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
        <span className="text-sm">Surveillance Streamlit active...</span>
      </div>
    </div>
  )
}
