"use client"

import { useState, useEffect, useRef } from "react"
import * as THREE from "three"

// Hook personnalisé pour charger les textures des produits
export const useProductTexture = (productImage) => {
  const [texture, setTexture] = useState(null)
  const [textureLoaded, setTextureLoaded] = useState(false)
  const [textureError, setTextureError] = useState(false)
  const textureRef = useRef(null)

  useEffect(() => {
    // Nettoyer la texture précédente si elle existe
    if (textureRef.current) {
      textureRef.current.dispose()
    }

    if (!productImage) {
      setTextureLoaded(false)
      setTextureError(false)
      return
    }

    // Méthode 1: Utiliser le TextureLoader de Three.js
    const loadWithTextureLoader = () => {
      const loader = new THREE.TextureLoader()
      loader.crossOrigin = "anonymous"

      return new Promise((resolve, reject) => {
        loader.load(
          productImage,
          (loadedTexture) => {
            loadedTexture.flipY = true
            loadedTexture.needsUpdate = true
            resolve(loadedTexture)
          },
          undefined,
          (error) => {
            console.warn("TextureLoader failed:", error)
            reject(error)
          },
        )
      })
    }

    // Méthode 2: Utiliser l'API Image et Canvas
    const loadWithImageAPI = () => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = "anonymous"

        img.onload = () => {
          const canvas = document.createElement("canvas")
          canvas.width = img.width
          canvas.height = img.height

          const ctx = canvas.getContext("2d")
          ctx.drawImage(img, 0, 0)

          const newTexture = new THREE.CanvasTexture(canvas)
          newTexture.needsUpdate = true
          resolve(newTexture)
        }

        img.onerror = (err) => {
          console.error("Image loading failed:", err)
          reject(err)
        }

        img.src = productImage
      })
    }

    // Essayer les deux méthodes en séquence
    loadWithTextureLoader()
      .then((loadedTexture) => {
        textureRef.current = loadedTexture
        setTexture(loadedTexture)
        setTextureLoaded(true)
      })
      .catch(() => {
        // Si la première méthode échoue, essayer la seconde
        loadWithImageAPI()
          .then((loadedTexture) => {
            textureRef.current = loadedTexture
            setTexture(loadedTexture)
            setTextureLoaded(true)
          })
          .catch((err) => {
            console.error("All texture loading methods failed:", err)
            setTextureError(true)
          })
      })

    return () => {
      // Nettoyer la texture lors du démontage
      if (textureRef.current) {
        textureRef.current.dispose()
      }
    }
  }, [productImage])

  return { texture, textureLoaded, textureError }
}
