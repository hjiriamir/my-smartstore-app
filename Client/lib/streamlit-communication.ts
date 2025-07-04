// Utility functions for Streamlit communication - Version améliorée

export interface StreamlitMessage {
  type: string
  data?: any
  requestId?: number
  timestamp?: number
}

export interface StreamlitPlanogramData {
  planogram_info: {
    planogram_id: string
    nom_planogram: string
    statut: string
    date_creation: string
    magasin_id: string
    categorie_id: string
  }
  furniture: Array<{
    furniture_id: string
    furniture_type_id: number
    furniture_type_name: string
    faces: number
    available_faces: string[]
    largeur: number
    hauteur: number
    profondeur: number
    imageUrl: string
    nb_etageres_unique_face: number
    nb_colonnes_unique_face: number
    nb_etageres_front_back: number
    nb_colonnes_front_back: number
    nb_etageres_left_right: number
    nb_colonnes_left_right: number
  }>
  product_positions: Array<{
    position_id: string
    furniture_id: string
    produit_id: string
    face: string
    etagere: number
    colonne: number
    quantite: number
  }>
}

export class StreamlitCommunicator {
  private iframe: HTMLIFrameElement | null = null
  private allowedOrigins: string[]
  private messageHandlers: Map<string, (data: any) => void> = new Map()
  private requestCallbacks: Map<number, (data: any) => void> = new Map()
  private isPolling = false
  private pollInterval: NodeJS.Timeout | null = null
  private maxRetries = 10
  private retryCount = 0

  constructor(origins = ["http://localhost:8501", "http://127.0.0.1:8501"]) {
    this.allowedOrigins = origins
    this.setupMessageListener()
    this.setupStorageListener()
  }

  setIframe(iframe: HTMLIFrameElement) {
    this.iframe = iframe
    console.log("Iframe configurée:", iframe.src)

    // Attendre que l'iframe soit chargée
    iframe.onload = () => {
      console.log("Iframe chargée, prête pour la communication")
      // Envoyer un message de test après un délai
      setTimeout(() => {
        this.sendTestMessage()
      }, 2000)
    }
  }

  private setupMessageListener() {
    const handleMessage = (event: MessageEvent) => {
      console.log("Message reçu:", {
        origin: event.origin,
        data: event.data,
        type: typeof event.data,
      })

      // Vérifier l'origine (plus flexible pour le développement)
      if (event.origin !== "null" && !this.allowedOrigins.includes(event.origin)) {
        console.warn("Message ignoré - origine non autorisée:", event.origin)
        return
      }

      try {
        let messageData = event.data

        // Gérer différents formats de message
        if (typeof messageData === "string") {
          try {
            messageData = JSON.parse(messageData)
          } catch (e) {
            console.warn("Impossible de parser le message JSON:", messageData)
            return
          }
        }

        // Vérifier si c'est des données de planogramme Streamlit
        if (this.isStreamlitPlanogramData(messageData)) {
          console.log("Données de planogramme Streamlit détectées!")
          const handler = this.messageHandlers.get("planogram_data")
          if (handler) {
            handler(messageData)
          }
          this.stopPolling()
        }

        // Gérer les réponses avec requestId
        if (messageData.requestId && this.requestCallbacks.has(messageData.requestId)) {
          const callback = this.requestCallbacks.get(messageData.requestId)
          if (callback) {
            callback(messageData.data || messageData)
            this.requestCallbacks.delete(messageData.requestId)
          }
        }
      } catch (error) {
        console.error("Erreur lors du traitement du message:", error)
      }
    }

    window.addEventListener("message", handleMessage)
    console.log("Listener de messages configuré")
  }

  private setupStorageListener() {
    // Écouter les changements dans localStorage (fallback)
    window.addEventListener("storage", (event) => {
      if (event.key === "streamlit-planogram-data" && event.newValue) {
        try {
          const data = JSON.parse(event.newValue)
          if (this.isStreamlitPlanogramData(data)) {
            console.log("Données trouvées dans localStorage!")
            const handler = this.messageHandlers.get("planogram_data")
            if (handler) {
              handler(data)
            }
            // Nettoyer après utilisation
            localStorage.removeItem("streamlit-planogram-data")
            this.stopPolling()
          }
        } catch (error) {
          console.error("Erreur parsing localStorage:", error)
        }
      }
    })
  }

  private isStreamlitPlanogramData(data: any): data is StreamlitPlanogramData {
    return (
      data &&
      typeof data === "object" &&
      data.planogram_info &&
      data.furniture &&
      Array.isArray(data.furniture) &&
      data.product_positions &&
      Array.isArray(data.product_positions)
    )
  }

  private sendTestMessage() {
    if (this.iframe?.contentWindow) {
      console.log("Envoi d'un message de test...")
      this.iframe.contentWindow.postMessage(
        {
          type: "TEST_CONNECTION",
          timestamp: Date.now(),
        },
        "*",
      )
    }
  }

  onPlanogramData(handler: (data: StreamlitPlanogramData) => void) {
    this.messageHandlers.set("planogram_data", handler)
  }

  async requestPlanogramData(): Promise<StreamlitPlanogramData | null> {
    return new Promise((resolve, reject) => {
      if (!this.iframe?.contentWindow) {
        reject(new Error("Iframe non disponible"))
        return
      }

      const requestId = Date.now()
      const timeout = 15000 // 15 secondes

      // Configurer le callback pour cette requête
      this.requestCallbacks.set(requestId, (data) => {
        if (this.isStreamlitPlanogramData(data)) {
          resolve(data)
        } else {
          resolve(null)
        }
      })

      // Timeout
      setTimeout(() => {
        if (this.requestCallbacks.has(requestId)) {
          this.requestCallbacks.delete(requestId)
          reject(new Error("Timeout - Pas de réponse de Streamlit"))
        }
      }, timeout)

      // Envoyer la requête avec plusieurs méthodes
      this.sendMultipleRequests(requestId)

      // Démarrer le polling en parallèle
      this.startPolling()
    })
  }

  private sendMultipleRequests(requestId: number) {
    const message = {
      type: "REQUEST_PLANOGRAM_JSON",
      requestId: requestId,
      timestamp: Date.now(),
    }

    if (this.iframe?.contentWindow) {
      // Méthode 1: PostMessage vers l'iframe
      this.iframe.contentWindow.postMessage(message, "*")

      // Méthode 2: PostMessage avec origine spécifique
      this.allowedOrigins.forEach((origin) => {
        this.iframe!.contentWindow!.postMessage(message, origin)
      })

      console.log("Requêtes envoyées vers Streamlit avec ID:", requestId)
    }

    // Méthode 3: Stocker la requête dans localStorage
    localStorage.setItem("react-planogram-request", JSON.stringify(message))

    // Méthode 4: BroadcastChannel
    try {
      const channel = new BroadcastChannel("planogram-communication")
      channel.postMessage(message)
      setTimeout(() => channel.close(), 1000)
    } catch (error) {
      console.warn("BroadcastChannel non supporté:", error)
    }
  }

  private startPolling() {
    if (this.isPolling) return

    this.isPolling = true
    this.retryCount = 0

    console.log("Démarrage du polling...")

    this.pollInterval = setInterval(() => {
      this.retryCount++
      console.log(`Polling tentative ${this.retryCount}/${this.maxRetries}`)

      // Vérifier localStorage
      try {
        const storedData = localStorage.getItem("streamlit-planogram-data")
        if (storedData) {
          const data = JSON.parse(storedData)
          if (this.isStreamlitPlanogramData(data)) {
            console.log("Données trouvées dans localStorage via polling!")
            const handler = this.messageHandlers.get("planogram_data")
            if (handler) {
              handler(data)
            }
            localStorage.removeItem("streamlit-planogram-data")
            this.stopPolling()
            return
          }
        }
      } catch (error) {
        console.error("Erreur polling localStorage:", error)
      }

      // Renvoyer une requête
      if (this.iframe?.contentWindow) {
        this.iframe.contentWindow.postMessage(
          {
            type: "REQUEST_PLANOGRAM_JSON",
            requestId: Date.now(),
            retry: this.retryCount,
          },
          "*",
        )
      }

      // Arrêter après le nombre max de tentatives
      if (this.retryCount >= this.maxRetries) {
        this.stopPolling()
      }
    }, 2000) // Toutes les 2 secondes
  }

  private stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
      this.pollInterval = null
    }
    this.isPolling = false
    console.log("Polling arrêté")
  }

  sendMessage(message: StreamlitMessage) {
    if (!this.iframe?.contentWindow) {
      throw new Error("Iframe non disponible")
    }

    this.iframe.contentWindow.postMessage(message, "*")
  }

  // Méthode pour nettoyer les ressources
  cleanup() {
    this.stopPolling()
    this.requestCallbacks.clear()
    this.messageHandlers.clear()
  }
}
