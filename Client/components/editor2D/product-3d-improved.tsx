"use client"

import * as THREE from "three"
import { useEffect, useState } from "react"

// This is a modified version of the Product3D component with improved positioning
// You can replace the existing Product3D component with this one

// Composant Product3D amélioré pour résoudre le problème de positionnement vertical
const Product3D = ({ position, size, product, quantity = 1, displayMode = "compact", cellIndex }) => {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!product || !product.image) {
      setIsLoading(false)
      return
    }

    // Charger la texture de l'image du produit
    const loadTexture = async () => {
      try {
        // Créer un texture loader
        const textureLoader = new THREE.TextureLoader()
        textureLoader.crossOrigin = "anonymous"

        // Charger la texture normale
        const texturePromise = new Promise<THREE.Texture>((resolve, reject) => {
          textureLoader.load(
            product.image,
            (loadedTexture) => {
              // Configurer la texture pour une meilleure apparence
              loadedTexture.encoding = THREE.sRGBEncoding
              loadedTexture.needsUpdate = true
              resolve(loadedTexture)
            },
            undefined,
            reject,
          )
        })

        const loadedTexture = await texturePromise
        setTexture(loadedTexture)
        setIsLoading(false)
      } catch (err) {
        console.error("Error loading texture:", err)
        setError(true)
        setIsLoading(false)
      }
    }

    loadTexture()

    return () => {
      if (texture) {
        texture.dispose()
      }
    }
  }, [product])

  if (isLoading || !product) {
    return null
  }

  // Extraire les coordonnées de position
  const [baseX, baseY, baseZ] = position
  const [totalWidth, height, depth] = size

  // Réduire davantage la largeur individuelle pour éviter les chevauchements
  // Utiliser un facteur de réduction plus important quand la quantité augmente
  const scaleFactor = quantity > 1 ? 0.7 : 0.85 // Réduction plus importante pour les quantités multiples
  const productWidth = (totalWidth / quantity) * scaleFactor

  // Calculer l'espacement entre les produits
  const spacing = (totalWidth - productWidth * quantity) / (quantity + 1)

  const productInstances = []

  for (let i = 0; i < quantity; i++) {
    // Nouvelle méthode de positionnement avec espacement uniforme
    // Positionner les produits avec un espacement égal entre eux
    const x = baseX - totalWidth / 2 + spacing + i * (productWidth + spacing) + productWidth / 2

    // Ajouter une légère variation aléatoire pour plus de réalisme
    const jitterX = (Math.random() - 0.5) * 0.002
    const jitterY = (Math.random() - 0.5) * 0.002
    const jitterZ = (Math.random() - 0.5) * 0.002

    // Calculer un décalage vertical pour que le bas du produit soit sur l'étagère
    // Nous positionnons le bas du produit exactement sur l'étagère en ajustant la position Y
    const verticalOffset = height / 2 // Moitié de la hauteur pour aligner le bas sur l'étagère

    productInstances.push(
      <group
        key={`product-${cellIndex}-${i}`}
        position={[x + jitterX, baseY + jitterY, baseZ + jitterZ]}
        castShadow
        receiveShadow
      >
        {texture ? (
          // Utiliser un plan avec la texture du produit
          // Ajuster la position Y pour que le bas du produit soit sur l'étagère
          <mesh castShadow receiveShadow position={[0, verticalOffset, 0]}>
            <planeGeometry args={[productWidth, height]} />
            <meshBasicMaterial map={texture} transparent={true} side={THREE.DoubleSide} />
          </mesh>
        ) : (
          // Fallback si pas de texture
          <mesh castShadow receiveShadow position={[0, verticalOffset, 0]}>
            <planeGeometry args={[productWidth, height]} />
            <meshBasicMaterial color={product.color || "#f3f4f6"} />
          </mesh>
        )}
      </group>,
    )
  }

  return <>{productInstances}</>
}
