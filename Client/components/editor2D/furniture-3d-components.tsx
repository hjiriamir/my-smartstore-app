"use client"

import { useMemo, useState, useEffect } from "react"
import * as THREE from "three"
import { useProductTexture } from "@/lib/use-product-texture"
import { useTranslation } from "react-i18next"
// Utilitaire pour créer des matériaux réutilisables

const createMaterials = () => {
  return {
    glass: new THREE.MeshPhysicalMaterial({
      color: "#ffffff",
      transparent: true,
      opacity: 0.2,
      roughness: 0.1,
      metalness: 0.1,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      reflectivity: 1,
    }),
    glassTinted: new THREE.MeshPhysicalMaterial({
      color: "#a0d8ef",
      transparent: true,
      opacity: 0.3,
      roughness: 0.1,
      metalness: 0.1,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      reflectivity: 1,
    }),
    metal: new THREE.MeshStandardMaterial({ color: "#444444" }),
    metalDark: new THREE.MeshStandardMaterial({ color: "#333333" }),
    metalLight: new THREE.MeshStandardMaterial({ color: "#CCCCCC" }),
    wood: new THREE.MeshStandardMaterial({ color: "#8B4513" }),
    woodDark: new THREE.MeshStandardMaterial({ color: "#5D4037" }),
    woodMedium: new THREE.MeshStandardMaterial({ color: "#795548" }),
    plastic: new THREE.MeshStandardMaterial({ color: "#f0f0f0" }),
    wallWhite: new THREE.MeshStandardMaterial({ color: "#f5f5f5", roughness: 0.9, metalness: 0.1 }),
    wallGray: new THREE.MeshStandardMaterial({ color: "#e0e0e0", roughness: 0.9, metalness: 0.1 }),
    woodLight: new THREE.MeshStandardMaterial({ color: "#d7ccc8", roughness: 0.7, metalness: 0.1 }),
    woodFloor: new THREE.MeshStandardMaterial({ color: "#a1887f", roughness: 0.8, metalness: 0.1 }),
    railMetal: new THREE.MeshStandardMaterial({ color: "#9e9e9e", roughness: 0.3, metalness: 0.7 }),
  }
}

// Fonction utilitaire pour grouper les éléments par section
const groupItemsBySection = (displayItems) => {
  const itemsBySection = {}

  if (!displayItems || !Array.isArray(displayItems)) {
    console.warn("displayItems is not an array:", displayItems)
    return {}
  }

  displayItems.forEach((item) => {
    if (!itemsBySection[item.section]) {
      itemsBySection[item.section] = []
    }
    itemsBySection[item.section].push(item)
  })

  // Log pour déboguer
  console.log("Grouped items by section:", itemsBySection)

  return itemsBySection
}

// Fonction pour ajuster les couleurs
const adjustColorFn = (color, amount) => {
  // Convertir la couleur hex en RGB
  let r = Number.parseInt(color.substring(1, 3), 16)
  let g = Number.parseInt(color.substring(3, 5), 16)
  let b = Number.parseInt(color.substring(5, 7), 16)

  // Ajuster les valeurs
  r = Math.max(0, Math.min(255, r + amount))
  g = Math.max(0, Math.min(255, g + amount))
  b = Math.max(0, Math.min(255, b + amount))

  // Convertir en hex
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
}

// Composant générique pour afficher les produits
const ProductDisplayComponent = ({
  product,
  width,
  height,
  depth,
  isHanging = false,
  isBottom = false,
  isAccessory = false,
  isFolded = false,
  isRefrigerated = false,
  isSuit = false,
  isShirt = false,
  isHat = false,
  isShoe = false,
  quantity = 1, // Add quantity parameter with default value
}) => {
  const { texture: productTexture, textureLoaded } = useProductTexture(product?.image)

  // Log pour déboguer
  console.log("ProductDisplayComponent - Rendering product:", {
    name: product?.name,
    image: product?.image,
    textureLoaded,
    quantity,
    position: product?.position,
    section: product?.section,
  })

  // Déterminer la couleur de secours en fonction du type de produit
  const getFallbackColor = () => {
    if (isRefrigerated) return "#CCFFCC"
    if (isBottom) return product?.color || "#000033"
    if (isAccessory) return product?.color || "#663300"
    if (isFolded) return product?.color || "#000066"
    if (isSuit) return product?.color || "#333333"
    if (isShirt) return product?.color || "#FFFFFF"
    if (isHat) return product?.color || "#222222"
    if (isShoe) return product?.color || "#111111"
    return product?.color || "#333333"
  }

  // If quantity is greater than 1, render multiple products with slight offsets
  if (quantity > 1) {
    // Calculate spacing between products - use smaller spacing for better side-by-side display
    const spacing = width * 0.5

    return (
      <group>
        {Array.from({ length: quantity }).map((_, index) => {
          // Position products side by side with proper spacing
          const offsetX = (index - (quantity - 1) / 2) * spacing

          return (
            <group key={`product-${index}`} position={[offsetX, 0, 0]}>
              <ProductDisplayComponent
                product={product}
                width={width * 0.9} // Make each product slightly smaller
                height={height}
                depth={depth}
                isHanging={isHanging}
                isBottom={isBottom}
                isAccessory={isAccessory}
                isFolded={isFolded}
                isRefrigerated={isRefrigerated}
                isSuit={isSuit}
                isShirt={isShirt}
                isHat={isHat}
                isShoe={isShoe}
                quantity={1} // Important: set to 1 to avoid infinite recursion
              />
            </group>
          )
        })}
      </group>
    )
  }

  // Rendu conditionnel en fonction du type de produit
  if (isRefrigerated) {
    return (
      <group rotation={[0, 0, 0]}>
        {textureLoaded && productTexture ? (
          <mesh castShadow receiveShadow rotation={[0, 0, 0]}>
            <planeGeometry args={[width, height]} />
            <meshBasicMaterial map={productTexture} transparent side={THREE.DoubleSide} />
          </mesh>
        ) : (
          <mesh castShadow receiveShadow rotation={[0, 0, 0]}>
            <boxGeometry args={[width, height, 0.05]} />
            <meshStandardMaterial color={getFallbackColor()} transparent opacity={0.9} />
          </mesh>
        )}
      </group>
    )
  } else if (isHat) {
    // Rendu pour les chapeaux/casquettes
    return (
      <group>
        {textureLoaded && productTexture ? (
          <mesh castShadow receiveShadow>
            <planeGeometry args={[width, height]} />
            <meshBasicMaterial map={productTexture} transparent side={THREE.DoubleSide} />
          </mesh>
        ) : (
          <group>
            {/* Base du chapeau */}
            <mesh castShadow receiveShadow position={[0, 0, 0]}>
              <cylinderGeometry args={[width * 0.4, width * 0.5, height * 0.3, 16]} />
              <meshStandardMaterial color={getFallbackColor()} />
            </mesh>
            {/* Visière (pour les casquettes) */}
            <mesh castShadow receiveShadow position={[0, 0, width * 0.3]}>
              <boxGeometry args={[width * 0.8, height * 0.1, width * 0.4]} />
              <meshStandardMaterial color={getFallbackColor()} />
            </mesh>
          </group>
        )}
      </group>
    )
  } else if (isShoe) {
    // Rendu pour les chaussures
    return (
      <group>
        {textureLoaded && productTexture ? (
          <mesh castShadow receiveShadow>
            <planeGeometry args={[width, height]} />
            <meshBasicMaterial map={productTexture} transparent side={THREE.DoubleSide} />
          </mesh>
        ) : (
          <group>
            {/* Corps de la chaussure */}
            <mesh castShadow receiveShadow position={[0, 0, 0]}>
              <boxGeometry args={[width, height * 0.4, depth * 1.5]} />
              <meshStandardMaterial color={getFallbackColor()} />
            </mesh>
            {/* Semelle */}
            <mesh castShadow receiveShadow position={[0, -height * 0.25, 0]}>
              <boxGeometry args={[width * 1.1, height * 0.1, depth * 1.6]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          </group>
        )}
      </group>
    )
  } else if (isSuit) {
    // Rendu amélioré pour les costumes
    return (
      <group>
        {/* Cintre */}
        <mesh position={[0, height / 2 - 0.05, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.015, 0.015, width * 0.8, 8]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#CCCCCC" />
        </mesh>
        <mesh position={[0, height / 2 - 0.1, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.15, 8]} />
          <meshStandardMaterial color="#CCCCCC" />
        </mesh>

        {/* Veste */}
        {textureLoaded && productTexture ? (
          <mesh castShadow receiveShadow position={[0, height / 4 - 0.1, 0]}>
            <planeGeometry args={[width, height * 0.8]} />
            <meshBasicMaterial map={productTexture} transparent side={THREE.DoubleSide} />
          </mesh>
        ) : (
          <group>
            {/* Corps de la veste */}
            <mesh castShadow receiveShadow position={[0, height / 4 - 0.1, 0]}>
              <boxGeometry args={[width, height * 0.6, depth]} />
              <meshStandardMaterial color={getFallbackColor()} />
            </mesh>
            {/* Col de la veste */}
            <mesh castShadow receiveShadow position={[0, height / 2 - 0.15, 0]}>
              <boxGeometry args={[width * 0.7, height * 0.2, depth * 1.2]} />
              <meshStandardMaterial color={getFallbackColor()} />
            </mesh>
            {/* Boutons */}
            {[0.1, 0, -0.1].map((y, i) => (
              <mesh key={`button-${i}`} castShadow receiveShadow position={[-width * 0.1, y, depth / 2 + 0.01]}>
                <cylinderGeometry args={[0.02, 0.02, 0.01, 8]} rotation={[Math.PI / 2, 0, 0]} />
                <meshStandardMaterial color="#111111" />
              </mesh>
            ))}
            {/* Étiquette de prix */}
            <mesh castShadow receiveShadow position={[width * 0.3, height * 0.3, depth / 2 + 0.01]}>
              <boxGeometry args={[0.1, 0.05, 0.01]} />
              <meshStandardMaterial color="#FFFFFF" />
            </mesh>
          </group>
        )}
      </group>
    )
  } else if (isShirt) {
    // Rendu amélioré pour les chemises
    return (
      <group>
        {textureLoaded && productTexture ? (
          <mesh castShadow receiveShadow>
            <planeGeometry args={[width, height]} />
            <meshBasicMaterial map={productTexture} transparent side={THREE.DoubleSide} />
          </mesh>
        ) : (
          <group>
            {/* Corps de la chemise */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[width, height * 0.6, depth]} />
              <meshStandardMaterial color={getFallbackColor()} />
            </mesh>
            {/* Col de la chemise */}
            <mesh castShadow receiveShadow position={[0, height * 0.35, 0]}>
              <boxGeometry args={[width * 0.7, height * 0.1, depth * 1.1]} />
              <meshStandardMaterial color={adjustColorFn(getFallbackColor(), 20)} />
            </mesh>
            {/* Manches */}
            <mesh castShadow receiveShadow position={[-width * 0.4, height * 0.25, 0]}>
              <boxGeometry args={[width * 0.2, height * 0.1, depth]} />
              <meshStandardMaterial color={getFallbackColor()} />
            </mesh>
            <mesh castShadow receiveShadow position={[width * 0.4, height * 0.25, 0]}>
              <boxGeometry args={[width * 0.2, height * 0.1, depth]} />
              <meshStandardMaterial color={getFallbackColor()} />
            </mesh>
            {/* Boutons */}
            {[0.2, 0.1, 0, -0.1].map((y, i) => (
              <mesh key={`button-${i}`} castShadow receiveShadow position={[0, y, depth / 2 + 0.01]}>
                <cylinderGeometry args={[0.01, 0.01, 0.01, 8]} rotation={[Math.PI / 2, 0, 0]} />
                <meshStandardMaterial color="#FFFFFF" />
              </mesh>
            ))}
          </group>
        )}
      </group>
    )
  } else if (isHanging) {
    return (
      <group>
        {/* Cintre */}
        <mesh position={[0, height / 2 - 0.05, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.015, 0.015, width * 0.7, 8]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#CCCCCC" />
        </mesh>
        <mesh position={[0, height / 2 - 0.1, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.1, 8]} />
          <meshStandardMaterial color="#CCCCCC" />
        </mesh>

        {/* Vêtement */}
        {textureLoaded && productTexture ? (
          <mesh castShadow receiveShadow position={[0, height / 4 - 0.1, 0]}>
            <planeGeometry args={[width, height * 0.8]} />
            <meshBasicMaterial map={productTexture} transparent side={THREE.DoubleSide} />
          </mesh>
        ) : (
          <mesh castShadow receiveShadow position={[0, height / 4 - 0.1, 0]}>
            <boxGeometry args={[width, height * 0.8, depth]} />
            <meshStandardMaterial color={getFallbackColor()} />
          </mesh>
        )}
      </group>
    )
  } else if (isFolded) {
    return (
      <group>
        {textureLoaded && productTexture ? (
          <mesh castShadow receiveShadow>
            <boxGeometry args={[width, height, depth]} />
            <meshBasicMaterial map={productTexture} />
          </mesh>
        ) : (
          <mesh castShadow receiveShadow>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial color={getFallbackColor()} />
          </mesh>
        )}
      </group>
    )
  } else if (isBottom && isHanging) {
    // Pantalons suspendus améliorés
    return (
      <group>
        {/* Cintre spécial pour pantalon */}
        <mesh position={[0, height / 2 - 0.05, 0]} castShadow receiveShadow>
          <boxGeometry args={[width * 0.8, 0.02, 0.02]} />
          <meshStandardMaterial color="#CCCCCC" />
        </mesh>
        <mesh position={[0, height / 2 - 0.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.02, 0.1, 0.02]} />
          <meshStandardMaterial color="#CCCCCC" />
        </mesh>

        {/* Pantalon */}
        {textureLoaded && productTexture ? (
          <mesh castShadow receiveShadow position={[0, height / 4 - 0.2, 0]}>
            <planeGeometry args={[width * 0.6, height * 0.8]} />
            <meshBasicMaterial map={productTexture} transparent side={THREE.DoubleSide} />
          </mesh>
        ) : (
          <group>
            {/* Jambes du pantalon */}
            <mesh castShadow receiveShadow position={[-width * 0.15, height / 4 - 0.2, 0]}>
              <boxGeometry args={[width * 0.25, height * 0.8, depth * 0.5]} />
              <meshStandardMaterial color={getFallbackColor()} />
            </mesh>
            <mesh castShadow receiveShadow position={[width * 0.15, height / 4 - 0.2, 0]}>
              <boxGeometry args={[width * 0.25, height * 0.8, depth * 0.5]} />
              <meshStandardMaterial color={getFallbackColor()} />
            </mesh>
            {/* Ceinture */}
            <mesh castShadow receiveShadow position={[0, height / 2 - 0.2, 0]}>
              <boxGeometry args={[width * 0.6, 0.05, depth * 0.6]} />
              <meshStandardMaterial color={adjustColorFn(getFallbackColor(), -20)} />
            </mesh>
            {/* Étiquette de prix */}
            <mesh castShadow receiveShadow position={[width * 0.3, height * 0.3, depth / 2 + 0.01]}>
              <boxGeometry args={[0.1, 0.05, 0.01]} />
              <meshStandardMaterial color="#FFFFFF" />
            </mesh>
          </group>
        )}
      </group>
    )
  } else {
    // Rendu par défaut pour les autres types de produits
    return (
      <group>
        {textureLoaded && productTexture ? (
          <mesh castShadow receiveShadow>
            <planeGeometry args={[width, height]} />
            <meshBasicMaterial map={productTexture} transparent side={THREE.DoubleSide} />
          </mesh>
        ) : (
          <mesh castShadow receiveShadow>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial color={getFallbackColor()} />
          </mesh>
        )}
      </group>
    )
  }
}

// Composant pour un mannequin simple
const MannequinComponent = ({ height = 1.8, color = "#f0f0f0" }) => {
  return (
    <group>
      {/* Tête */}
      <mesh position={[0, height - 0.15, 0]} castShadow>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Cou */}
      <mesh position={[0, height - 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.05, 0.1, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Torse */}
      <mesh position={[0, height - 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 0.5, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Support */}
      <mesh position={[0, height / 2 - 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, height - 0.6, 8]} />
        <meshStandardMaterial color="#888888" />
      </mesh>

      {/* Base */}
      <mesh position={[0, 0.025, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.05, 16]} />
        <meshStandardMaterial color="#888888" />
      </mesh>
    </group>
  )
}

// Composant amélioré pour afficher les produits dans le frigo-présentoir
const EnhancedRefrigeratedProductDisplay = ({ product, width, height }) => {
  const { texture, textureLoaded } = useProductTexture(product?.image)

  // Déterminer si le produit est une bouteille ou un autre type de produit
  const isBottle =
    product?.name?.toLowerCase().includes("eau") ||
    product?.name?.toLowerCase().includes("bouteille") ||
    product?.image?.toLowerCase().includes("bottle")

  // Ajuster les dimensions en fonction du type de produit
  const productWidth = isBottle ? width * 0.5 : width * 0.9
  const productHeight = isBottle ? height * 0.95 : height * 0.8

  // Créer un effet de réflexion pour les produits réfrigérés
  const reflectionMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: "#ffffff",
      metalness: 0.2,
      roughness: 0.1,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      reflectivity: 1,
    })
  }, [])

  // Créer un matériau pour le contour qui met en valeur le produit
  const outlineMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: "#ffffff",
      transparent: true,
      opacity: 0.5,
      side: THREE.BackSide,
    })
  }, [])

  return (
    <group>
      {/* Contour lumineux pour améliorer la visibilité */}
      <mesh scale={[1.05, 1.05, 1.05]}>
        <planeGeometry args={[productWidth, productHeight]} />
        <primitive object={outlineMaterial} />
      </mesh>

      {textureLoaded && texture ? (
        // Affichage avec texture - toujours orienté vers la face avant
        <mesh castShadow receiveShadow>
          <planeGeometry args={[productWidth, productHeight]} />
          <meshBasicMaterial map={texture} transparent side={THREE.DoubleSide} />
        </mesh>
      ) : (
        // Fallback - représentation 3D améliorée
        <group>
          {isBottle ? (
            // Représentation 3D d'une bouteille avec plus de détails
            <>
              {/* Corps de la bouteille */}
              <mesh castShadow receiveShadow position={[0, 0, 0]}>
                <cylinderGeometry args={[productWidth * 0.3, productWidth * 0.3, productHeight * 0.7, 16]} />
                <meshPhysicalMaterial
                  color={product?.color || "#a0d8ef"}
                  transparent
                  opacity={0.9}
                  clearcoat={1}
                  clearcoatRoughness={0.1}
                  emissive={product?.color || "#a0d8ef"}
                  emissiveIntensity={0.2}
                />
              </mesh>
              {/* Goulot de la bouteille */}
              <mesh castShadow receiveShadow position={[0, productHeight * 0.4, 0]}>
                <cylinderGeometry args={[productWidth * 0.15, productWidth * 0.15, productHeight * 0.2, 16]} />
                <meshPhysicalMaterial
                  color={product?.color || "#a0d8ef"}
                  transparent
                  opacity={0.9}
                  clearcoat={1}
                  clearcoatRoughness={0.1}
                  emissive={product?.color || "#a0d8ef"}
                  emissiveIntensity={0.2}
                />
              </mesh>
              {/* Bouchon */}
              <mesh castShadow receiveShadow position={[0, productHeight * 0.5, 0]}>
                <cylinderGeometry args={[productWidth * 0.18, productWidth * 0.18, productHeight * 0.05, 16]} />
                <meshStandardMaterial color="#ffffff" />
              </mesh>
              {/* Étiquette (pour plus de réalisme) */}
              <mesh castShadow receiveShadow position={[0, 0, productWidth * 0.31]}>
                <planeGeometry args={[productWidth * 0.5, productHeight * 0.3]} />
                <meshBasicMaterial color={product?.color === "#a0d8ef" ? "#ffffff" : "#f0f0f0"} />
              </mesh>
            </>
          ) : (
            // Représentation générique pour les autres produits avec plus de détails
            <>
              <mesh castShadow receiveShadow>
                <boxGeometry args={[productWidth, productHeight, productWidth * 0.3]} />
                <meshPhysicalMaterial
                  color={product?.color || "#CCFFCC"}
                  transparent
                  opacity={0.95}
                  clearcoat={0.5}
                  clearcoatRoughness={0.1}
                  emissive={product?.color || "#CCFFCC"}
                  emissiveIntensity={0.2}
                />
              </mesh>
              {/* Étiquette frontale */}
              <mesh castShadow receiveShadow position={[0, 0, productWidth * 0.16]}>
                <planeGeometry args={[productWidth * 0.8, productHeight * 0.6]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            </>
          )}
        </group>
      )}

      {/* Effet de réflexion/brillance sur le sol */}
      <mesh position={[0, -productHeight / 2 - 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[productWidth * 1.2, productWidth * 0.6]} />
        <primitive object={reflectionMaterial} />
      </mesh>

      {/* Lumière ponctuelle pour chaque produit */}
      <pointLight position={[0, 0, 0.2]} intensity={0.5} distance={0.5} color="#ffffff" />
    </group>
  )
}

// Modify the Product3D component to better handle side-facing products
// Replace the entire Product3D component with this improved version:

// Modify the Product3D component to better handle side-facing products
const Product3D = ({
  position,
  size,
  product,
  quantity = 1,
  displayMode = "compact",
  cellIndex,
  rotation = [0, 0, 0],
}) => {
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

  // Déterminer si c'est une rotation latérale (pour les côtés gauche/droit)
  const isLateralRotation = Math.abs(rotation[1]) === Math.PI / 2

  // Calculate the appropriate scale factor based on quantity
  const scaleFactor = quantity > 1 ? 0.7 : 0.85

  // Calculate product width based on orientation
  const productWidth = isLateralRotation ? (depth / quantity) * scaleFactor : (totalWidth / quantity) * scaleFactor

  // Calculate spacing between products (reduced for better display)
  const spacing = productWidth * 0.1

  const productInstances = []

  for (let i = 0; i < quantity; i++) {
    // Calculate position with even spacing
    const offset = (i - (quantity - 1) / 2) * (productWidth + spacing)
    const x = baseX + (isLateralRotation ? 0 : offset)
    const z = baseZ + (isLateralRotation ? offset : 0)

    // Add slight random variation for realism
    const jitterX = (Math.random() - 0.5) * 0.002
    const jitterY = (Math.random() - 0.5) * 0.002
    const jitterZ = (Math.random() - 0.5) * 0.002

    // Adjust dimensions based on orientation
    const adjustedWidth = isLateralRotation ? height * 0.9 : productWidth
    const adjustedHeight = isLateralRotation ? productWidth * 1.2 : height * 0.9

    productInstances.push(
      <group
        key={`product-${cellIndex}-${i}`}
        position={[x + jitterX, baseY + jitterY, z + jitterZ]}
        rotation={rotation}
        castShadow
        receiveShadow
      >
        {texture ? (
          // Use a plane with the product texture
          <mesh castShadow receiveShadow position={[0, adjustedHeight / 2, 0]}>
            <planeGeometry args={[adjustedWidth, adjustedHeight]} />
            <meshBasicMaterial map={texture} transparent={true} side={THREE.DoubleSide} />
          </mesh>
        ) : (
          // Fallback if no texture
          <mesh castShadow receiveShadow position={[0, adjustedHeight / 2, 0]}>
            <planeGeometry args={[adjustedWidth, adjustedHeight]} />
            <meshBasicMaterial color={product.color || "#f3f4f6"} />
          </mesh>
        )}
      </group>,
    )
  }

  return <>{productInstances}</>
}

// 3D Wall Display Component
export const WallDisplay = ({ furniture, displayItems, products, onRemove }) => {
  const { width, height, depth, sections, slots, color, x, y, z, rotation } = furniture
  const materials = useMemo(() => createMaterials(), [])
  const itemsBySection = useMemo(() => groupItemsBySection(displayItems), [displayItems])
  const { i18n } = useTranslation()
  const isRTL = i18n.language === "ar"

  // Calculate dimensions
  const sectionHeight = height / sections
  const slotWidth = width / slots

  return (
    <group position={[x, y, z]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
      {/* Back panel */}
      <mesh position={[0, height / 2, -depth / 2]} castShadow receiveShadow>
        <boxGeometry args={[width, height, 0.05]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>

      {/* Side panels */}
      <mesh position={[-width / 2 - 0.025, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.05, height, depth]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>

      {/* Shelves/rails */}
      {Array.from({ length: sections + 1 }).map((_, i) => (
        <mesh key={`shelf-${i}`} position={[0, i * sectionHeight, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, 0.03, depth]} />
          <meshStandardMaterial color={color || "#333333"} />
        </mesh>
      ))}

      {/* Display items */}
      {Object.entries(itemsBySection).map(([sectionIndex, items]) => {
        const sectionY = Number.parseInt(sectionIndex) * sectionHeight + sectionHeight / 2

        return items.map((item) => {
          const product = products.find((p) => p.primary_Id === item.productId)
          if (!product) return null

          // Calculate position based on slot, adjusting for RTL if needed
          const itemX = isRTL
            ? (slots - 1 - item.position - slots / 2 + 0.5) * slotWidth
            : (item.position - slots / 2 + 0.5) * slotWidth

          // Determine item type
          const name = product.name?.toLowerCase() || ""
          const isBottom =
            name.includes("pantalon") || name.includes("jean") || name.includes("short") || name.includes("jupe")

          // Get quantity if available
          const quantity = item.quantity || 1

          // Adjust position based on section
          const adjustedY = sectionY - sectionHeight * 0.2

          if (isBottom) {
            // Pants/trousers
            return (
              <group key={item.id} position={[itemX, adjustedY, depth / 4]}>
                <ProductDisplayComponent
                  product={product}
                  width={slotWidth * 0.8}
                  height={sectionHeight * 0.8}
                  depth={0.05}
                  isHanging={true}
                  isBottom={true}
                  quantity={quantity}
                />
              </group>
            )
          } else {
            // Tops/jackets
            return (
              <group key={item.id} position={[itemX, adjustedY, depth / 4]}>
                <ProductDisplayComponent
                  product={product}
                  width={slotWidth * 0.8}
                  height={sectionHeight * 0.8}
                  depth={0.1}
                  isHanging={true}
                  isBottom={false}
                  quantity={quantity}
                />
              </group>
            )
          }
        })
      })}
    </group>
  )
}

// 3D Clothing Rack Component
export const ClothingRack = ({ furniture, displayItems, products, onRemove }) => {
  const { width, height, depth, sections, slots, color, x, y, z, rotation } = furniture
  const materials = useMemo(() => createMaterials(), [])
  const itemsBySection = useMemo(() => groupItemsBySection(displayItems), [displayItems])
  const { i18n } = useTranslation()
  const isRTL = i18n.language === "ar"

  // Calculate dimensions
  const sectionSpacing = height / sections
  const slotWidth = width / slots

  return (
    <group position={[x, y, z]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
      {/* Base */}
      <mesh position={[0, 0.025, 0]} castShadow receiveShadow>
        <boxGeometry args={[width * 0.8, 0.05, depth * 0.8]} />
        <meshStandardMaterial color="#444444" />
      </mesh>

      {/* Vertical supports */}
      <mesh position={[-width / 2 + 0.05, height / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.03, 0.03, height, 8]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      <mesh position={[width / 2 - 0.05, height / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.03, 0.03, height, 8]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Horizontal rails */}
      {Array.from({ length: sections }).map((_, i) => (
        <mesh
          key={`rail-${i}`}
          position={[0, (i + 1) * sectionSpacing, 0]}
          rotation={[0, 0, Math.PI / 2]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.015, 0.015, width, 8]} />
          <meshStandardMaterial color={color || "#666666"} />
        </mesh>
      ))}

      {/* Display items */}
      {Object.entries(itemsBySection).map(([sectionIndex, items]) => {
        const sectionY = (Number.parseInt(sectionIndex) + 1) * sectionSpacing

        return items.map((item) => {
          const product = products.find((p) => p.primary_Id === item.productId)
          if (!product) return null

          // Calculate position based on slot, adjusting for RTL if needed
          const itemX = isRTL
            ? (slots - 1 - item.position - slots / 2 + 0.5) * slotWidth
            : (item.position - slots / 2 + 0.5) * slotWidth

          // Determine item type
          const name = product.name?.toLowerCase() || ""
          const isBottom =
            name.includes("pantalon") || name.includes("jean") || name.includes("short") || name.includes("jupe")

          // Get quantity if available
          const quantity = item.quantity || 1

          if (isBottom) {
            // Pants/trousers
            return (
              <group key={item.id} position={[itemX, sectionY - 0.4, 0]}>
                <ProductDisplayComponent
                  product={product}
                  width={slotWidth * 0.8}
                  height={0.8}
                  depth={0.05}
                  isHanging={true}
                  isBottom={true}
                  quantity={quantity}
                />
              </group>
            )
          } else {
            // Tops/jackets
            return (
              <group key={item.id} position={[itemX, sectionY - 0.4, 0]}>
                <ProductDisplayComponent
                  product={product}
                  width={slotWidth * 0.8}
                  height={0.8}
                  depth={0.1}
                  isHanging={true}
                  isBottom={false}
                  quantity={quantity}
                />
              </group>
            )
          }
        })
      })}
    </group>
  )
}

// 3D Accessory Display Component
export const AccessoryDisplay = ({ furniture, displayItems, products, onRemove }) => {
  const { width, height, depth, sections, slots, color, x, y, z, rotation } = furniture
  const materials = useMemo(() => createMaterials(), [])
  const itemsBySection = useMemo(() => groupItemsBySection(displayItems), [displayItems])
  const { i18n } = useTranslation()
  const isRTL = i18n.language === "ar"

  // Calculate dimensions
  const sectionHeight = height / sections
  const slotWidth = width / slots

  return (
    <group position={[x, y, z]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
      {/* Base */}
      <mesh position={[0, 0.025, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, 0.05, depth]} />
        <meshStandardMaterial color="#444444" />
      </mesh>

      {/* Main stand */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.05, 0.05, height, 8]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Horizontal arms */}
      {Array.from({ length: sections }).map((_, i) => (
        <mesh key={`arm-${i}`} position={[0, (i + 1) * sectionHeight, 0]} rotation={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, 0.03, 0.03]} />
          <meshStandardMaterial color={color || "#666666"} />
        </mesh>
      ))}

      {/* Display items */}
      {Object.entries(itemsBySection).map(([sectionIndex, items]) => {
        const sectionY = (Number.parseInt(sectionIndex) + 1) * sectionHeight

        return items.map((item) => {
          const product = products.find((p) => p.primary_Id === item.productId)
          if (!product) return null

          // Calculate position based on slot, adjusting for RTL if needed
          const itemX = isRTL
            ? (slots - 1 - item.position - slots / 2 + 0.5) * slotWidth
            : (item.position - slots / 2 + 0.5) * slotWidth

          // Get quantity if available
          const quantity = item.quantity || 1

          // Accessories are displayed differently
          return (
            <group key={item.id} position={[itemX, sectionY, 0.05]}>
              <ProductDisplayComponent
                product={product}
                width={slotWidth * 0.6}
                height={0.3}
                depth={0.02}
                isHanging={false}
                isAccessory={true}
                quantity={quantity}
              />
            </group>
          )
        })
      })}
    </group>
  )
}

// 3D Modular Cube Component
export const ModularCube = ({ furniture, displayItems, products, onRemove }) => {
  const { width, height, depth, sections, slots, color, x, y, z, rotation } = furniture
  const materials = useMemo(() => createMaterials(), [])
  const itemsBySection = useMemo(() => groupItemsBySection(displayItems), [displayItems])
  const { i18n } = useTranslation()
  const isRTL = i18n.language === "ar"

  // Calculate dimensions
  const cubeSize = Math.min(width, height) / sections
  const slotSize = cubeSize / slots

  return (
    <group position={[x, y, z]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
      {/* Cube structure */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={color || "#8B4513"} transparent opacity={0.1} />
      </mesh>

      {/* Shelves/dividers */}
      {Array.from({ length: sections + 1 }).map((_, i) => (
        <mesh key={`shelf-${i}`} position={[0, i * cubeSize, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, 0.02, depth]} />
          <meshStandardMaterial color={color || "#8B4513"} />
        </mesh>
      ))}

      {Array.from({ length: sections + 1 }).map((_, i) => (
        <mesh
          key={`divider-${i}`}
          position={[i * cubeSize - width / 2 + cubeSize / 2, height / 2, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.02, height, depth]} />
          <meshStandardMaterial color={color || "#8B4513"} />
        </mesh>
      ))}

      {/* Display items */}
      {Object.entries(itemsBySection).map(([sectionIndex, items]) => {
        const sectionY = Number.parseInt(sectionIndex) * cubeSize + cubeSize / 2

        return items.map((item) => {
          const product = products.find((p) => p.primary_Id === item.productId)
          if (!product) return null

          const row = Math.floor(item.position / slots)
          const col = item.position % slots

          // Adjust column position for RTL
          const adjustedCol = isRTL ? slots - 1 - col : col

          const itemX = (adjustedCol - slots / 2 + 0.5) * slotSize
          const itemZ = (row - slots / 2 + 0.5) * slotSize

          // Get quantity if available
          const quantity = item.quantity || 1

          return (
            <group key={item.id} position={[itemX, sectionY, itemZ]}>
              <ProductDisplayComponent
                product={product}
                width={slotSize * 0.8}
                height={slotSize * 0.8}
                depth={0.05}
                isHanging={false}
                isFolded={true}
                quantity={quantity}
              />
            </group>
          )
        })
      })}
    </group>
  )
}

// Modification du composant GondolaDisplay pour améliorer la synchronisation des positions des produits
export const GondolaDisplay = ({ furniture, displayItems, products, onRemove }) => {
  const { width, height, depth, sections, slots, color, x, y, z, rotation } = furniture
  const materials = useMemo(() => createMaterials(), [])
  const itemsBySection = useMemo(() => groupItemsBySection(displayItems), [displayItems])
  const { i18n } = useTranslation()
  const isRTL = i18n.language === "ar"

  // Calculate dimensions
  const sectionHeight = height / sections
  const slotWidth = width / slots

  // Couleurs pour la gondole
  const baseColor = "#333333"
  const structureColor = "#222222"
  const shelfColor = "#444444"
  const edgeColor = "#555555"

  // Calculer le nombre de slots par face
  const slotsPerFace = Math.floor(slots / 2)

  return (
    <group position={[x, y, z]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
      {/* Base */}
      <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, 0.1, depth]} />
        <meshStandardMaterial color={baseColor} />
      </mesh>

      {/* Structure centrale */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, 0.05]} />
        <meshStandardMaterial color={structureColor} />
      </mesh>

      {/* Montants verticaux */}
      <mesh position={[-width / 2 + 0.025, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.05, height, depth]} />
        <meshStandardMaterial color={structureColor} />
      </mesh>

      <mesh position={[width / 2 - 0.025, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.05, height, depth]} />
        <meshStandardMaterial color={structureColor} />
      </mesh>

      {/* Étagères pour les deux faces */}
      {Array.from({ length: sections + 1 }).map((_, i) => {
        const shelfY = i * sectionHeight

        return (
          <group key={`shelf-group-${i}`}>
            {/* Étagère face A */}
            <mesh position={[0, shelfY, depth / 2 - 0.1]} castShadow receiveShadow>
              <boxGeometry args={[width - 0.1, 0.03, depth / 2 - 0.1]} />
              <meshStandardMaterial color={shelfColor} />
            </mesh>

            {/* Étagère face B */}
            <mesh position={[0, shelfY, -depth / 2 + 0.1]} castShadow receiveShadow>
              <boxGeometry args={[width - 0.1, 0.03, depth / 2 - 0.1]} />
              <meshStandardMaterial color={shelfColor} />
            </mesh>

            {/* Bordures des étagères */}
            <mesh position={[0, shelfY, depth / 2 - 0.05]} castShadow receiveShadow>
              <boxGeometry args={[width - 0.05, 0.04, 0.02]} />
              <meshStandardMaterial color={edgeColor} />
            </mesh>

            <mesh position={[0, shelfY, -depth / 2 + 0.05]} castShadow receiveShadow>
              <boxGeometry args={[width - 0.05, 0.04, 0.02]} />
              <meshStandardMaterial color={edgeColor} />
            </mesh>
          </group>
        )
      })}

      {/* Display items - Séparation des produits par face avec synchronisation améliorée */}
      {Object.entries(itemsBySection).map(([sectionIndex, items]) => {
        const sectionY = Number.parseInt(sectionIndex) * sectionHeight + sectionHeight / 2

        return items.map((item) => {
          const product = products.find((p) => p.primary_Id === item.productId)
          if (!product) return null

          // Déterminer si c'est la face A ou B de la gondole
          // Face A: positions 0 à (slots/2 - 1)
          // Face B: positions (slots/2) à (slots - 1)
          const isFaceA = item.position < slotsPerFace

          // Calculer la position relative à chaque face
          // Pour la face A: positions 0 à (slots/2 - 1) mappées sur toute la largeur
          // Pour la face B: positions (slots/2) à (slots - 1) mappées sur toute la largeur
          let relativePosition = isFaceA ? item.position : item.position - slotsPerFace

          // Adjust for RTL if needed
          if (isRTL) {
            relativePosition = isFaceA ? slotsPerFace - 1 - relativePosition : slotsPerFace - 1 - relativePosition
          }

          // Calculer la position X en fonction de la position relative
          const itemX = (relativePosition / slotsPerFace - 0.5) * width + width / slotsPerFace / 2

          // Ajuster la position Z en fonction de la face
          const itemZ = isFaceA ? depth / 2 - 0.15 : -depth / 2 + 0.15

          // Ajuster la rotation en fonction de la face
          const itemRotation = isFaceA ? [0, 0, 0] : [0, Math.PI, 0]

          // Get quantity if available
          const quantity = item.quantity || 1

          return (
            <group key={item.id} position={[itemX, sectionY, itemZ]} rotation={itemRotation}>
              <ProductDisplayComponent
                product={product}
                width={slotWidth * 0.8}
                height={sectionHeight * 0.8}
                depth={0.05}
                isHanging={false}
                quantity={quantity}
              />
            </group>
          )
        })
      })}
    </group>
  )
}

// TableDisplay Component
export const TableDisplay = ({ furniture, displayItems, products, onRemove }) => {
  const { width, height, depth, sections, slots, color, x, y, z, rotation } = furniture
  const materials = useMemo(() => createMaterials(), [])
  const itemsBySection = useMemo(() => groupItemsBySection(displayItems), [displayItems])
  const { i18n } = useTranslation()
  const isRTL = i18n.language === "ar"

  // Calculate dimensions
  const slotWidth = width / slots
  const tableTopHeight = 0.05
  const legRadius = 0.04
  const tableColor = color || "#8B4513"
  const legColor = "#5D4037"

  return (
    <group position={[x, y, z]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
      {/* Table top */}
      <mesh position={[0, height - tableTopHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, tableTopHeight, depth]} />
        <meshStandardMaterial color={tableColor} roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Table legs */}
      {[
        [-width / 2 + legRadius, height / 2, -depth / 2 + legRadius],
        [width / 2 - legRadius, height / 2, -depth / 2 + legRadius],
        [-width / 2 + legRadius, height / 2, depth / 2 - legRadius],
        [width / 2 - legRadius, height / 2, depth / 2 - legRadius],
      ].map((position, index) => (
        <mesh key={`leg-${index}`} position={position} castShadow receiveShadow>
          <cylinderGeometry args={[legRadius, legRadius, height, 8]} />
          <meshStandardMaterial color={legColor} roughness={0.8} metalness={0.1} />
        </mesh>
      ))}

      {/* Optional: Cross supports for stability */}
      <mesh position={[0, height / 4, 0]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
        <boxGeometry args={[Math.sqrt(width * width + depth * depth) * 0.7, 0.02, 0.02]} />
        <meshStandardMaterial color={legColor} />
      </mesh>

      <mesh position={[0, height / 4, 0]} rotation={[0, -Math.PI / 4, 0]} castShadow receiveShadow>
        <boxGeometry args={[Math.sqrt(width * width + depth * depth) * 0.7, 0.02, 0.02]} />
        <meshStandardMaterial color={legColor} />
      </mesh>

      {/* Display items on the table */}
      {Object.entries(itemsBySection).map(([sectionIndex, items]) => {
        return items.map((item) => {
          const product = products.find((p) => p.primary_Id === item.productId)
          if (!product) return null

          // Calculate position on the table
          const row = Math.floor(item.position / slots)
          const col = item.position % slots

          // Adjust column position for RTL
          const adjustedCol = isRTL ? slots - 1 - col : col

          // Distribute items evenly on the table surface
          const rowCount = Math.ceil(displayItems.length / slots)
          const rowSpacing = depth / (rowCount + 1)
          const colSpacing = width / (slots + 1)

          const itemX = (adjustedCol + 1) * colSpacing - width / 2
          const itemZ = (row + 1) * rowSpacing - depth / 2
          const itemY = height + 0.05 // Just above the table surface

          // Get quantity if available
          const quantity = item.quantity || 1

          // Determine if product is folded (like clothing) or displayed normally
          const name = product.name?.toLowerCase() || ""
          const isClothing =
            name.includes("shirt") || name.includes("pant") || name.includes("dress") || name.includes("jacket")

          return (
            <group key={item.id} position={[itemX, itemY, itemZ]}>
              <ProductDisplayComponent
                product={product}
                width={slotWidth * 0.7}
                height={0.1}
                depth={0.2}
                isHanging={false}
                isFolded={isClothing}
                isShirt={name.includes("shirt")}
                quantity={quantity}
              />
            </group>
          )
        })
      })}
    </group>
  )
}

// RefrigeratorDisplay Component
export const RefrigeratorDisplay = ({ furniture, displayItems, products, onRemove }) => {
  const { width, height, depth, sections, slots, color, x, y, z, rotation } = furniture
  const materials = useMemo(() => createMaterials(), [])
  const itemsBySection = useMemo(() => groupItemsBySection(displayItems), [displayItems])
  const { i18n } = useTranslation()
  const isRTL = i18n.language === "ar"

  // Paramètres de l'armoire
  const numberOfDoors = 3
  const doorHeight = height / numberOfDoors
  const glassThickness = 0.1
  const frameColor = "#181818"
  const glassColor = "#a0d0f0"
  const interiorColor = "#404040"

  return (
    <group position={[x, y, z]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
      {/* Structure principale */}
      <mesh position={[0, height/2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={frameColor} roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Portes vitrées */}
      {Array.from({ length: numberOfDoors }).map((_, i) => {
        const doorY = height - (i * doorHeight) - doorHeight/2
        
        return (
          <group key={`door-${i}`} position={[0, doorY, depth/2 - glassThickness/2]}>
            {/* Cadre de la porte */}
            <mesh receiveShadow>
              <boxGeometry args={[width, doorHeight, glassThickness]} />
              <meshStandardMaterial 
                color={frameColor} 
                roughness={0.8} 
                metalness={0.2}
              />
            </mesh>

            {/* Partie vitrée */}
            <mesh position={[0, 0, glassThickness/2]}>
  <boxGeometry args={[width * 0.95, doorHeight * 0.95, 0.01]} />
  <meshPhysicalMaterial
    color="#ffffff"
    transparent={true}
    opacity={0.3}
    roughness={0.05}
    metalness={0.1}
    transmission={1} // pour simuler le verre
    thickness={0.02}  // épaisseur physique du verre
    ior={1.5}         // indice de réfraction typique du verre
    reflectivity={1}
    clearcoat={1}
    clearcoatRoughness={0}
  />
</mesh>
          </group>
        )
      })}

      {/* Intérieur visible */}
      <mesh position={[0, height/2, -depth/4]}>
        <boxGeometry args={[width * 0.9, height * 0.98, depth * 0.5]} />
        <meshStandardMaterial color={interiorColor} roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Étagères intérieures */}
      {Array.from({ length: sections }).map((_, i) => {
        const shelfY = (i + 1) * (height / (sections + 1))
        
        return (
          <mesh key={`shelf-${i}`} position={[0, shelfY, -depth/4]} castShadow>
            <boxGeometry args={[width * 0.85, 0.02, depth * 0.4]} />
            <meshStandardMaterial color="#505050" roughness={0.7} metalness={0.3} />
          </mesh>
        )
      })}

      {/* Produits visibles à travers le verre */}
      {Object.entries(itemsBySection).map(([sectionIndex, items]) => {
        const sectionY = (Number.parseInt(sectionIndex) + 1) * (height / (sections + 1))
        
        return items.map((item) => {
          const product = products.find((p) => p.primary_Id === item.productId)
          if (!product) return null
          
          const itemX = (item.position - slots/2 + 0.5) * (width / slots)
          
          return (
            <group 
              key={item.id} 
              position={[itemX, sectionY, -depth/4 + 0.1]}
              rotation={[0, Math.PI, 0]}
            >
              <ProductDisplayComponent
                product={product}
                width={width/slots * 0.8}
                height={height/(sections + 2) * 0.8}
                depth={depth * 0.3}
                isRefrigerated={true}
              />
            </group>
          )
        })
      })}

      {/* Éclairage intérieur */}
      <pointLight 
        position={[0, height * 0.9, -depth/4]} 
        intensity={2} 
        distance={depth} 
        color="#ffffff"
      />
      <pointLight 
        position={[0, height * 0.5, -depth/4]} 
        intensity={1} 
        distance={depth} 
        color="#ffffff"
      />
    </group>
  )
}
export const Fridge3D = ({ furniture, displayItems, products, onRemove }) => {
  const { width, height, depth, sections, slots, color, x, y, z, rotation } = furniture;
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const sectionHeight = height / sections;
  const slotWidth = width / slots;

  const colors = {
    frame: '#4a4a4a',
    base: '#1a1a1a',
    stripe: '#fefefe',
    glass: '#e0f7fa',
    interior: '#fefefe',
    shelf: '#dcdcdc',
    accent: '#b3e5fc',
  };

  const materials = useMemo(() => ({
    glass: new THREE.MeshPhysicalMaterial({
      color: colors.glass,
      transparent: true,
      opacity: 0.15,
      roughness: 0.05,
      metalness: 0.25,
      reflectivity: 0.9,
      transmission: 1,
      thickness: 0.05,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      side: THREE.DoubleSide,
    }),
    frame: new THREE.MeshStandardMaterial({
      color: colors.frame,
      roughness: 0.3,
      metalness: 0.8,
    }),
    base: new THREE.MeshStandardMaterial({
      color: colors.base,
      roughness: 0.4,
      metalness: 0.7,
    }),
    stripe: new THREE.MeshStandardMaterial({
      color: colors.stripe,
      roughness: 0.2,
      metalness: 0.1,
    }),
    interior: new THREE.MeshStandardMaterial({
      color: colors.interior,
      roughness: 0.7,
      metalness: 0.1,
    }),
    shelf: new THREE.MeshStandardMaterial({
      color: colors.shelf,
      roughness: 0.6,
      metalness: 0.1,
    }),
    accent: new THREE.MeshStandardMaterial({
      color: colors.accent,
      emissive: colors.accent,
      emissiveIntensity: 0.8,
    }),
  }), []);

  const itemsBySection = useMemo(() => {
    const grouped = {};
    displayItems.forEach((item) => {
      if (!grouped[item.section]) grouped[item.section] = [];
      grouped[item.section].push(item);
    });
    return grouped;
  }, [displayItems]);

  return (
    <group position={[x, y, z]} rotation={[0, rotation, 0]}>
      {/* Base */}
      <mesh position={[0, -height / 2, 0]} material={materials.base} castShadow receiveShadow>
        <boxGeometry args={[width, 0.1, depth]} />
      </mesh>

      {/* Stripe */}
      <mesh position={[0, -height / 2 + 0.06, depth / 2 - 0.01]} material={materials.stripe}>
        <boxGeometry args={[width * 0.9, 0.02, 0.02]} />
      </mesh>

      {/* Frame structure */}
      {[ -width / 2, 0, width / 2 ].map((xPos, i) => (
        <mesh key={`vertical-frame-${i}`} position={[xPos, 0, 0]} material={materials.frame}>
          <boxGeometry args={[0.03, height, 0.05]} />
        </mesh>
      ))}
      <mesh position={[0, height / 2, 0]} material={materials.frame}>
        <boxGeometry args={[width, 0.05, 0.05]} />
      </mesh>

      {/* Side Glass Panels */}
      {[ -width / 2, width / 2 ].map((xPos, i) => (
        <mesh key={`side-glass-${i}`} position={[xPos, 0, depth / 2 - 0.01]} material={materials.glass}>
          <boxGeometry args={[0.01, height - 0.1, depth]} />
        </mesh>
      ))}

      {/* Sliding Doors */}
      {[-width / 3, 0, width / 3].map((xPos, i) => (
        <mesh key={`door-${i}`} position={[xPos, 0, depth / 2 - 0.01]} material={materials.glass}>
          <boxGeometry args={[width / 3 - 0.03, height - 0.1, 0.01]} />
        </mesh>
      ))}

      {/* Interior back wall */}
      <mesh position={[0, 0, depth / 2 - depth / 4]} material={materials.interior}>
        <boxGeometry args={[width - 0.1, height - 0.1, 0.1]} />
      </mesh>

      {/* Lighting */}
      {[height / 2 - 0.05, -height / 2 + 0.1].map((yPos, i) => (
        <mesh key={`accent-${i}`} position={[0, yPos, depth / 2 - 0.05]} material={materials.accent}>
          <boxGeometry args={[width * 0.9, 0.01, 0.01]} />
        </mesh>
      ))}

      {/* Shelves */}
      {Array.from({ length: sections }).map((_, i) => {
        const y = (i + 1) * sectionHeight - height / 2;
        return (
          <mesh key={`shelf-${i}`} position={[0, y, depth / 2 - depth / 4]} material={materials.shelf}>
            <boxGeometry args={[width - 0.1, 0.02, depth / 2 - 0.1]} />
          </mesh>
        );
      })}

      {/* Display Products */}
      {Object.entries(itemsBySection).map(([sectionIndex, items]) => {
        const sectionY = parseInt(sectionIndex) * sectionHeight - height / 2 + sectionHeight / 2;
        return items.map((item) => {
          const product = products.find((p) => p.primary_Id === item.productId);
          if (!product) return null;

          const itemX = isRTL
            ? (slots - 1 - item.position - slots / 2 + 0.5) * slotWidth
            : (item.position - slots / 2 + 0.5) * slotWidth;

          const itemZ = depth / 2 - depth / 4 + 0.05;

          return (
            <group key={`item-${item.id}`} position={[itemX, sectionY, itemZ]} onClick={(e) => {
              e.stopPropagation();
              onRemove(item);
            }}>
              <EnhancedRefrigeratedProductDisplay
                product={product}
                width={slotWidth * 0.8}
                height={sectionHeight * 0.7}
              />
            </group>
          );
        });
      })}

      {/* Lighting setup */}
      <pointLight position={[0, height / 4, depth / 2 - 0.1]} intensity={1} distance={height / 2} castShadow />
      <pointLight position={[0, -height / 4, depth / 2 - 0.1]} intensity={1} distance={height / 2} castShadow />
      <ambientLight intensity={0.4} />
    </group>
  );
};

export const SupermarketFridge = ({ 
  furniture, 
  displayItems = [], 
  products = [], 
  onRemove 
}: {
  furniture: any;
  displayItems?: any[];
  products?: any[];
  onRemove: (id: string) => void;
}) => {
  // Destructure furniture props with defaults
  const {
    width = 1.5,
    height = 2,
    depth = 0.8,
    sections = 3, // Correspond à furniture.sections
    slots = 6,    // Correspond à furniture.slots
    color = "#3a3a3a",
    x = 0,
    y = 0,
    z = 0,
    rotation = 0
  } = furniture || {};

  // Materials and colors
  const frameColor = color;
  const glassOpacity = 0.2;
  const shelfColor = "#f0f0f0";
  const backPanelColor = "#333333";
  const interiorColor = "#333333";
  const accentColor = "#a0d8ef";

  // Calculate dimensions based on furniture configuration
  const sectionHeight = height / sections;
  const slotWidth = width / slots;

  const glassMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#ffffff",
    transparent: true,
    opacity: glassOpacity,
    roughness: 0.05,
    metalness: 0,
    clearcoat: 1,
    reflectivity: 0.8,
    transmission: 1,
    ior: 1.5,
  }), [glassOpacity]);

  // Group items by section and position
  const itemsBySection = useMemo(() => {
    const sectionsMap = Array(sections).fill(null).map(() => Array(slots).fill(null));
    
    displayItems.forEach(item => {
      const sectionIndex = Math.min(Math.max(0, item.section || 0), sections - 1);
      const slotIndex = Math.min(Math.max(0, item.position || 0), slots - 1);
      
      if (!sectionsMap[sectionIndex]) {
        sectionsMap[sectionIndex] = [];
      }
      sectionsMap[sectionIndex][slotIndex] = item;
    });

    return sectionsMap;
  }, [displayItems, sections, slots]);

  return (
    <group position={[x, y, z]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
      {/* Base structure */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[width, 0.2, depth]} />
        <meshStandardMaterial color={frameColor} metalness={0.6} roughness={0.2} />
      </mesh>

      {/* Back panel */}
      <mesh position={[0, height / 2, -depth / 2 + 0.05]}>
        <boxGeometry args={[width, height, 0.1]} />
        <meshStandardMaterial color={backPanelColor} />
      </mesh>

      {/* Side panels */}
      <mesh position={[-width / 2 + 0.05, height / 2, 0]}>
        <boxGeometry args={[0.1, height, depth]} />
        <meshStandardMaterial color={frameColor} />
      </mesh>
      <mesh position={[width / 2 - 0.05, height / 2, 0]}>
        <boxGeometry args={[0.1, height, depth]} />
        <meshStandardMaterial color={frameColor} />
      </mesh>

      {/* Top panel */}
      <mesh position={[0, height, 0]}>
        <boxGeometry args={[width, 0.1, depth]} />
        <meshStandardMaterial color={frameColor} />
      </mesh>

      {/* Interior */}
      <mesh position={[0, height / 2, -depth / 2 + 0.15]}>
        <boxGeometry args={[width - 0.2, height - 0.2, 0.01]} />
        <meshStandardMaterial color={interiorColor} roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Door accent */}
      <mesh position={[0, 0.25, depth / 2 - 0.05]}>
        <boxGeometry args={[width - 0.1, 0.05, 0.01]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.2} />
      </mesh>

      {/* Shelves - one per section */}
      {Array.from({ length: sections - 1 }).map((_, i) => {
        const yPos = ((i + 1) * sectionHeight);
        return (
          <mesh key={`shelf-${i}`} position={[0, yPos, 0]}>
            <boxGeometry args={[width - 0.2, 0.02, depth - 0.2]} />
            <meshStandardMaterial color={shelfColor} roughness={0.8} metalness={0.1} />
          </mesh>
        );
      })}

      {/* Glass doors - one per section */}
      {Array.from({ length: sections }).map((_, i) => {
        const yPos = (i * sectionHeight) + (sectionHeight / 2);
        return (
          <mesh key={`door-${i}`} position={[0, yPos, depth / 2 - 0.01]}>
            <boxGeometry args={[width - 0.1, sectionHeight - 0.1, 0.02]} />
            <meshStandardMaterial {...glassMaterial} />
          </mesh>
        );
      })}

      {/* Products - organized by sections and slots */}
      {itemsBySection.map((sectionItems, sectionIndex) => {
        return sectionItems.map((item, slotIndex) => {
          if (!item) return null;
          
          const product = products.find((p) => p.primary_Id === item.productId);
          if (!product) return null;

          // Calculate position based on slot and section
          const sectionY = (sectionIndex * sectionHeight) + (sectionHeight / 2);
          const slotX = (slotIndex - (slots / 2) + 0.5) * slotWidth;
          const itemZ = depth / 4;

          return (
            <group key={item.id} position={[slotX, sectionY, itemZ]}>
              <EnhancedRefrigeratedProductDisplay
                product={product}
                width={slotWidth * 0.8}
                height={sectionHeight * 0.7}
                depth={depth * 0.3}
                onClick={() => onRemove(item.id)}
              />
            </group>
          );
        });
      })}

      {/* Refrigeration effects */}
      <group position={[0, 0.3, depth / 2 - 0.1]}>
        {Array.from({ length: 5 }).map((_, i) => (
          <mesh 
            key={`mist-${i}`} 
            position={[
              (Math.random() - 0.5) * width * 0.8,
              Math.random() * height * 0.9,
              (Math.random() - 0.5) * 0.2
            ]} 
            scale={[0.05 + Math.random() * 0.1, 0.05 + Math.random() * 0.1, 0.05 + Math.random() * 0.1]}
          >
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial color="#a0d8ef" transparent opacity={0.2 + Math.random() * 0.1} depthWrite={false} />
          </mesh>
        ))}
      </group>

      {/* Lighting */}
      <pointLight 
        position={[0, height - 0.1, 0]} 
        intensity={1} 
        color="#ffffff" 
        distance={depth * 2} 
      />
      <pointLight 
        position={[0, height / 2, -depth / 3]} 
        intensity={0.5} 
        color="#a0d8ef" 
        distance={depth * 1.5} 
      />
    </group>
  );
};
// RefrigeratedShowcase Component (open-front refrigerated display)
export const RefrigeratedShowcase = ({ furniture, displayItems, products, onRemove }) => {
  const { width, height, depth, sections, slots, color, x, y, z, rotation } = furniture
  const materials = useMemo(() => createMaterials(), [])
  const itemsBySection = useMemo(() => groupItemsBySection(displayItems), [displayItems])
  const { i18n } = useTranslation()
  const isRTL = i18n.language === "ar"

  // Calculate dimensions
  const sectionHeight = height / sections
  const slotWidth = width / slots

  // Colors
  const showcaseColor = color || "#e0e0e0"
  const interiorColor = "#f8f8f8"
  const shelfColor = "#d0d0d0"
  const accentColor = "#a0d8ef" // Light blue for refrigeration accent

  // Glass material for the sides and top
  const glassMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: "#ffffff",
      transparent: true,
      opacity: 0.3,
      roughness: 0.1,
      metalness: 0.1,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      reflectivity: 1,
    })
  }, [])

  return (
    <group position={[x, y, z]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
      {/* Base */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, 0.2, depth]} />
        <meshStandardMaterial color={showcaseColor} roughness={0.5} metalness={0.3} />
      </mesh>

      {/* Back panel */}
      <mesh position={[0, height / 2, -depth / 2 + 0.05]} castShadow receiveShadow>
        <boxGeometry args={[width, height, 0.1]} />
        <meshStandardMaterial color={showcaseColor} roughness={0.5} metalness={0.3} />
      </mesh>

      {/* Side panels (glass) */}
      <mesh position={[-width / 2 + 0.05, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.1, height, depth]} />
        <primitive object={glassMaterial} />
      </mesh>

      <mesh position={[width / 2 - 0.05, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.1, height, depth]} />
        <primitive object={glassMaterial} />
      </mesh>

      {/* Top panel (glass) */}
      <mesh position={[0, height - 0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, 0.1, depth]} />
        <primitive object={glassMaterial} />
      </mesh>

      {/* Interior back panel */}
      <mesh position={[0, height / 2, -depth / 2 + 0.15]} castShadow receiveShadow>
        <boxGeometry args={[width - 0.2, height - 0.2, 0.01]} />
        <meshStandardMaterial color={interiorColor} roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Refrigeration accent (blue strip at the bottom) */}
      <mesh position={[0, 0.25, depth / 2 - 0.05]} castShadow receiveShadow>
        <boxGeometry args={[width - 0.1, 0.05, 0.01]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.2} />
      </mesh>

      {/* Shelves */}
      {Array.from({ length: sections }).map((_, i) => {
        const shelfY = (i + 1) * sectionHeight

        return (
          <mesh key={`shelf-${i}`} position={[0, shelfY, 0]} castShadow receiveShadow>
            <boxGeometry args={[width - 0.3, 0.02, depth - 0.2]} />
            <meshStandardMaterial color={shelfColor} roughness={0.7} metalness={0.2} />
          </mesh>
        )
      })}

      {/* Display items on shelves with enhanced refrigerated display */}
      {Object.entries(itemsBySection).map(([sectionIndex, items]) => {
        const sectionY = Number.parseInt(sectionIndex) * sectionHeight + sectionHeight / 2

        return items.map((item) => {
          const product = products.find((p) => p.primary_Id === item.productId)
          if (!product) return null

          // Calculate position based on slot, adjusting for RTL if needed
          const itemX = isRTL
            ? (slots - 1 - item.position - slots / 2 + 0.5) * slotWidth
            : (item.position - slots / 2 + 0.5) * slotWidth

          const itemZ = depth / 4 // Position items toward the front for better visibility

          // Get quantity if available
          const quantity = item.quantity || 1

          // Use the enhanced refrigerated product display for better visuals
          return (
            <group key={item.id} position={[itemX, sectionY, itemZ]}>
              <EnhancedRefrigeratedProductDisplay
                product={product}
                width={slotWidth * 0.7}
                height={sectionHeight * 0.7}
              />
            </group>
          )
        })
      })}

      {/* Cool mist effect at the bottom (subtle particle-like geometry) */}
      <group position={[0, 0.3, depth / 2 - 0.1]}>
        {Array.from({ length: 5 }).map((_, i) => {
          const mistX = (Math.random() - 0.5) * width * 0.8
          const mistY = Math.random() * 0.1
          const mistZ = (Math.random() - 0.5) * 0.2
          const mistScale = 0.05 + Math.random() * 0.1

          return (
            <mesh key={`mist-${i}`} position={[mistX, mistY, mistZ]} scale={[mistScale, mistScale, mistScale]}>
              <sphereGeometry args={[1, 8, 8]} />
              <meshBasicMaterial color="#a0d8ef" transparent opacity={0.2 + Math.random() * 0.1} depthWrite={false} />
            </mesh>
          )
        })}
      </group>

      {/* Interior lighting */}
      <pointLight position={[0, height - 0.2, 0]} intensity={0.4} distance={depth} color="#ffffff" />
      <pointLight position={[0, height / 2, -depth / 3]} intensity={0.3} distance={depth} color="#a0d8ef" />
    </group>
  )
}

// ClothingDisplay Component - Based on the first image (modular clothing display wall)
export const ClothingDisplay = ({ furniture, displayItems, products, onRemove }) => {
  const { width, height, depth, sections = 3, slots = 6, color, x, y, z, rotation } = furniture
  const materials = useMemo(() => createMaterials(), [])
  const itemsBySection = useMemo(() => groupItemsBySection(displayItems), [displayItems])
  const { i18n } = useTranslation()
  const isRTL = i18n.language === "ar"

  // Calculate dimensions
  const sectionHeight = height / sections
  const slotWidth = width / slots

  // Colors
  const frameColor = "#333333"
  const wallColor = "#f5f5f5"
  const shelfColor = "#e0e0e0"
  const railColor = "#9e9e9e"

  return (
    <group position={[x, y, z]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
      {/* Back wall panel */}
      <mesh position={[0, height / 2, -depth / 2 + 0.01]} castShadow receive Shadow>
        <boxGeometry args={[width, height, 0.05]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Frame structure */}
      {/* Vertical frames */}
      {[-width / 2, width / 2].map((xPos, i) => (
        <mesh key={`vertical-frame-${i}`} position={[xPos, height / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.05, height, depth]} />
          <meshStandardMaterial color={frameColor} roughness={0.5} metalness={0.3} />
        </mesh>
      ))}

      {/* Horizontal dividers for sections */}
      {Array.from({ length: sections + 1 }).map((_, i) => (
        <mesh key={`horizontal-divider-${i}`} position={[0, i * sectionHeight, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, 0.05, depth]} />
          <meshStandardMaterial color={frameColor} roughness={0.5} metalness={0.3} />
        </mesh>
      ))}

      {/* Vertical dividers for slots */}
      {Array.from({ length: slots - 1 }).map((_, i) => {
        const xPos = -width / 2 + (i + 1) * (width / slots)
        return (
          <mesh key={`vertical-divider-${i}`} position={[xPos, height / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.03, height, 0.03]} />
            <meshStandardMaterial color={frameColor} roughness={0.5} metalness={0.3} />
          </mesh>
        )
      })}

      {/* Section-specific elements */}
      {Array.from({ length: sections }).map((_, sectionIndex) => {
        const sectionY = sectionIndex * sectionHeight + sectionHeight / 2
        const sectionType = sectionIndex % 3 // Cycle through different section types

        // Different section types based on the reference image
        if (sectionType === 0) {
          // Top section - hanging clothes and accessories
          return (
            <group key={`section-${sectionIndex}`}>
              {/* Hanging rail */}
              <mesh
                position={[0, sectionY + sectionHeight * 0.3, depth / 4]}
                rotation={[0, 0, Math.PI / 2]}
                castShadow
                receiveShadow
              >
                <cylinderGeometry args={[0.015, 0.015, width - 0.1, 8]} />
                <meshStandardMaterial color={railColor} roughness={0.3} metalness={0.7} />
              </mesh>

              {/* Display items */}
              {itemsBySection[sectionIndex]?.map((item) => {
                const product = products.find((p) => p.primary_Id === item.productId)
                if (!product) return null

                // Calculate position based on slot, adjusting for RTL if needed
                const itemX = isRTL
                  ? (slots - 1 - item.position - slots / 2 + 0.5) * slotWidth
                  : (item.position - slots / 2 + 0.5) * slotWidth

                const quantity = item.quantity || 1

                // Determine if it's a top or accessory
                const name = product.name?.toLowerCase() || ""
                const isTop = name.includes("shirt") || name.includes("jacket") || name.includes("sweater")

                return (
                  <group key={item.id} position={[itemX, sectionY + sectionHeight * 0.2, depth / 4]}>
                    <ProductDisplayComponent
                      product={product}
                      width={slotWidth * 0.8}
                      height={sectionHeight * 0.6}
                      depth={0.1}
                      isHanging={true}
                      quantity={quantity}
                    />
                  </group>
                )
              })}
            </group>
          )
        } else if (sectionType === 1) {
          // Middle section - jackets and pants
          return (
            <group key={`section-${sectionIndex}`}>
              {/* Hanging rail for jackets */}
              <mesh
                position={[0, sectionY + sectionHeight * 0.3, depth / 4]}
                rotation={[0, 0, Math.PI / 2]}
                castShadow
                receiveShadow
              >
                <cylinderGeometry args={[0.015, 0.015, width - 0.1, 8]} />
                <meshStandardMaterial color={railColor} roughness={0.3} metalness={0.7} />
              </mesh>

              {/* Display items */}
              {itemsBySection[sectionIndex]?.map((item) => {
                const product = products.find((p) => p.primary_Id === item.productId)
                if (!product) return null

                // Calculate position based on slot, adjusting for RTL if needed
                const itemX = isRTL
                  ? (slots - 1 - item.position - slots / 2 + 0.5) * slotWidth
                  : (item.position - slots / 2 + 0.5) * slotWidth

                const quantity = item.quantity || 1

                // Determine if it's a jacket or pants
                const name = product.name?.toLowerCase() || ""
                const isBottom = name.includes("pant") || name.includes("jean") || name.includes("trouser")
                const isJacket = name.includes("jacket") || name.includes("coat")

                if (isBottom) {
                  return (
                    <group key={item.id} position={[itemX, sectionY - sectionHeight * 0.1, depth / 4]}>
                      <ProductDisplayComponent
                        product={product}
                        width={slotWidth * 0.7}
                        height={sectionHeight * 0.6}
                        depth={0.05}
                        isHanging={true}
                        isBottom={true}
                        quantity={quantity}
                      />
                    </group>
                  )
                } else {
                  return (
                    <group key={item.id} position={[itemX, sectionY + sectionHeight * 0.2, depth / 4]}>
                      <ProductDisplayComponent
                        product={product}
                        width={slotWidth * 0.8}
                        height={sectionHeight * 0.6}
                        depth={0.1}
                        isHanging={true}
                        isSuit={isJacket}
                        quantity={quantity}
                      />
                    </group>
                  )
                }
              })}
            </group>
          )
        } else {
          // Bottom section - accessories, shoes, etc.
          return (
            <group key={`section-${sectionIndex}`}>
              {/* Shelves for accessories */}
              <mesh position={[0, sectionY, depth / 4]} castShadow receiveShadow>
                <boxGeometry args={[width - 0.1, 0.03, depth / 2]} />
                <meshStandardMaterial color={shelfColor} roughness={0.7} metalness={0.2} />
              </mesh>

              {/* Display items */}
              {itemsBySection[sectionIndex]?.map((item) => {
                const product = products.find((p) => p.primary_Id === item.productId)
                if (!product) return null

                // Calculate position based on slot, adjusting for RTL if needed
                const itemX = isRTL
                  ? (slots - 1 - item.position - slots / 2 + 0.5) * slotWidth
                  : (item.position - slots / 2 + 0.5) * slotWidth

                const quantity = item.quantity || 1

                // Determine if it's a shoe, hat, or other accessory
                const name = product.name?.toLowerCase() || ""
                const isShoe = name.includes("shoe") || name.includes("sneaker") || name.includes("boot")
                const isHat = name.includes("hat") || name.includes("cap")

                return (
                  <group key={item.id} position={[itemX, sectionY + 0.1, depth / 4]}>
                    <ProductDisplayComponent
                      product={product}
                      width={slotWidth * 0.7}
                      height={sectionHeight * 0.4}
                      depth={0.2}
                      isHanging={false}
                      isAccessory={!isShoe && !isHat}
                      isShoe={isShoe}
                      isHat={isHat}
                      quantity={quantity}
                    />
                  </group>
                )
              })}

              {/* Add a mannequin in one slot if no products are there */}
              {!itemsBySection[sectionIndex] && (
                <group position={[width / 4, sectionY + 0.1, depth / 4]}>
                  <MannequinComponent height={sectionHeight * 0.8} />
                </group>
              )}
            </group>
          )
        }
      })}

      {/* Add some decorative elements */}
      {/* Picture frame in the middle section */}
      <group position={[0, height * 0.6, depth / 4]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[width / 6, height / 8, 0.02]} />
          <meshStandardMaterial color="#222222" />
        </mesh>
        <mesh position={[0, 0, 0.015]}>
          <planeGeometry args={[width / 6 - 0.02, height / 8 - 0.02]} />
          <meshBasicMaterial color="#f8f8f8" />
        </mesh>
      </group>

      {/* Small decorative plants */}
      <group position={[width / 3, height * 0.6, depth / 4]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.05, 0.07, 0.1, 8]} />
          <meshStandardMaterial color="#d7ccc8" />
        </mesh>
        <mesh position={[0, 0.1, 0]} castShadow>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#4caf50" />
        </mesh>
      </group>
    </group>
  )
}

// ClothingWallDisplay Component - Based on the second image (retail store wall display)
export const ClothingWallDisplay = ({ furniture, displayItems, products, onRemove }) => {
  const { width, height, depth, sections = 4, slots = 6, color, x, y, z, rotation } = furniture
  const materials = useMemo(() => createMaterials(), [])
  const itemsBySection = useMemo(() => groupItemsBySection(displayItems), [displayItems])
  const { i18n } = useTranslation()
  const isRTL = i18n.language === "ar"

  // Calculate dimensions
  const sectionHeight = height / sections
  const slotWidth = width / slots

  // Colors
  const wallColor = "#f5f5f5"
  const shelfColor = "#5D4037" // Wood tone color matching the 2D view
  const railColor = "#9e9e9e"
  const accentColor = "#303f9f" // Dark blue accent color from the image

  // Log pour déboguer
  console.log("ClothingWallDisplay - Rendering with:", {
    furniture,
    displayItems,
    itemsBySection,
    sections,
    slots,
    width,
    height,
    depth,
  })

  return (
    <group position={[x, y, z]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
      {/* Back wall panel */}
      <mesh position={[0, height / 2, -depth / 2 + 0.01]} castShadow receiveShadow>
        <boxGeometry args={[width, height, 0.05]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Accent wall on left side - matches the 2D view */}
      <mesh position={[-width / 2 + width / 8, height / 2, -depth / 2 + 0.02]} castShadow receiveShadow>
        <boxGeometry args={[width / 4, height, 0.03]} />
        <meshStandardMaterial color={accentColor} roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Vertical supports - matching the 2D view */}
      {[-1, 1 / 3, 2 / 3, 1].map((pos, i) => (
        <mesh key={`support-${i}`} position={[pos * width - width / 2, height / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.05, height, depth / 2]} />
          <meshStandardMaterial color={shelfColor} roughness={0.7} metalness={0.1} />
        </mesh>
      ))}

      {/* Horizontal shelves - matching the 2D view */}
      {Array.from({ length: sections + 1 }).map((_, i) => (
        <mesh key={`shelf-${i}`} position={[0, i * sectionHeight, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, 0.04, depth / 2]} />
          <meshStandardMaterial color={shelfColor} roughness={0.7} metalness={0.1} />
        </mesh>
      ))}

      {/* Base of the furniture */}
      <mesh position={[0, -0.025, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, 0.08, depth]} />
        <meshStandardMaterial color={shelfColor} roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Display items by section */}
      {Object.entries(itemsBySection).map(([sectionIndex, items]) => {
        const sectionY = Number.parseInt(sectionIndex) * sectionHeight + sectionHeight / 2

        return items.map((item) => {
          const product = products.find((p) => p.primary_Id === item.productId)
          if (!product) {
            console.warn("Product not found:", item.productId)
            return null
          }

          // Calculate position based on slot, adjusting for RTL if needed
          const itemX = isRTL
            ? (slots - 1 - item.position - slots / 2 + 0.5) * slotWidth
            : (item.position - slots / 2 + 0.5) * slotWidth

          // Get quantity if available
          const quantity = item.quantity || 1

          // Determine product type
          const name = product.name?.toLowerCase() || ""
          const isShirt = name.includes("shirt") || name.includes("tee") || name.includes("top")
          const isPants = name.includes("pant") || name.includes("jean") || name.includes("trouser")
          const isJacket = name.includes("jacket") || name.includes("coat")
          const isHanging = isPants || isJacket || isShirt

          // Log pour déboguer
          console.log("Rendering product in ClothingWallDisplay:", {
            name: product.name,
            position: item.position,
            section: sectionIndex,
            itemX,
            sectionY,
            isHanging,
            isPants,
            isShirt,
            quantity,
          })

          return (
            <group key={item.id} position={[itemX, sectionY, depth / 4]}>
              <ProductDisplayComponent
                product={product}
                width={slotWidth * 0.8}
                height={sectionHeight * 0.7}
                depth={0.1}
                isHanging={isHanging}
                isBottom={isPants}
                isShirt={isShirt}
                quantity={quantity}
              />
            </group>
          )
        })
      })}

      {/* Floor */}
      <mesh position={[0, -0.025, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width * 1.5, depth * 1.5]} />
        <meshStandardMaterial color="#a1887f" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Ceiling lights */}
      {[-width / 3, width / 3].map((lightX, i) => (
        <group key={`light-${i}`} position={[lightX, height + 0.1, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.05, 16]} />
            <meshStandardMaterial color="#e0e0e0" />
          </mesh>
          <pointLight intensity={0.8} distance={3} decay={2} color="#ffffff" />
        </group>
      ))}
    </group>
  )
}

// Ajout des composants CashierDisplay et ShelvesDisplay dans wall-display.tsx

// CashierDisplay Component
export const CashierDisplay = ({ furniture, displayItems, products, onRemove }) => {
  const { width, height, depth, sections, slots, color, x, y, z, rotation } = furniture
  const { i18n } = useTranslation()
  const isRTL = i18n.language === "ar"

  // Calculate dimensions
  const counterHeight = height * 0.8
  const registerHeight = height * 0.2
  const counterDepth = depth * 0.8

  // Colors
  const counterColor = color || "#D2691E"
  const registerColor = "#444444"
  const screenColor = "#222222"
  const keypadColor = "#666666"

  return (
    <group position={[x, y, z]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
      {/* Counter base */}
      <mesh position={[0, counterHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, counterHeight, counterDepth]} />
        <meshStandardMaterial color={counterColor} roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Counter top with slight overhang */}
      <mesh position={[0, counterHeight + 0.02, 0]} castShadow receiveShadow>
        <boxGeometry args={[width + 0.1, 0.04, counterDepth + 0.1]} />
        <meshStandardMaterial color={adjustColorFn(counterColor, 20)} roughness={0.5} metalness={0.3} />
      </mesh>

      {/* Cash register */}
      <mesh
        position={[width / 4, counterHeight + registerHeight / 2 + 0.04, -counterDepth / 4]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[width / 2, registerHeight, depth / 2]} />
        <meshStandardMaterial color={registerColor} roughness={0.5} metalness={0.5} />
      </mesh>

      {/* Register screen */}
      <mesh
        position={[width / 4, counterHeight + registerHeight + 0.04, -counterDepth / 4]}
        rotation={[Math.PI / 6, 0, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[width / 3, 0.02, depth / 4]} />
        <meshStandardMaterial
          color={screenColor}
          roughness={0.3}
          metalness={0.7}
          emissive="#003366"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Keypad */}
      <mesh position={[width / 4, counterHeight + 0.06, -counterDepth / 3]} castShadow receiveShadow>
        <boxGeometry args={[width / 4, 0.02, depth / 5]} />
        <meshStandardMaterial color={keypadColor} roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Drawer */}
      <mesh position={[width / 4, counterHeight - 0.15, -counterDepth / 2 + 0.05]} castShadow receiveShadow>
        <boxGeometry args={[width / 2, 0.1, 0.05]} />
        <meshStandardMaterial color={adjustColorFn(registerColor, 20)} roughness={0.5} metalness={0.5} />
      </mesh>

      {/* Decorative elements - receipt roll */}
      <mesh
        position={[width / 4 + width / 6, counterHeight + registerHeight / 2 + 0.04, -counterDepth / 4]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.05, 0.05, 0.1, 16]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Customer side counter area */}
      <mesh position={[-width / 3, counterHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width / 3, counterHeight, counterDepth]} />
        <meshStandardMaterial color={counterColor} roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Customer side counter top */}
      <mesh position={[-width / 3, counterHeight + 0.02, 0]} castShadow receiveShadow>
        <boxGeometry args={[width / 3 + 0.05, 0.04, counterDepth + 0.05]} />
        <meshStandardMaterial color={adjustColorFn(counterColor, 20)} roughness={0.5} metalness={0.3} />
      </mesh>

      {/* Optional: Add some products on display near the cashier */}
      <group position={[width / 3, counterHeight + 0.1, counterDepth / 3]}>
        {/* Small display items like candy, magazines, etc. */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.3, 0.1, 0.2]} />
          <meshStandardMaterial color="#FF6B6B" roughness={0.7} metalness={0.2} />
        </mesh>
      </group>

      {/* Display items from the furniture configuration */}
      {displayItems &&
        displayItems.map((item, index) => {
          const product = products.find((p) => p.primary_Id === item.productId)
          if (!product) return null

          // Position items on the counter
          const xPos = ((index % 3) - 1) * 0.2
          const zPos = Math.floor(index / 3) * 0.2 - 0.1

          return (
            <group key={`product-${item.id}`} position={[xPos, counterHeight + 0.1, zPos]}>
              <mesh castShadow receiveShadow>
                <boxGeometry args={[0.1, 0.05, 0.1]} />
                <meshStandardMaterial color={product.color || "#CCCCCC"} />
              </mesh>
            </group>
          )
        })}
    </group>
  )
}

// ShelvesDisplay Component
export const ShelvesDisplay = ({ furniture, displayItems, products, onRemove }) => {
  const { width, height, depth, sections, slots, color, x, y, z, rotation, shelvesConfig } = furniture
  const materials = useMemo(() => createMaterials(), [])
  const itemsBySection = useMemo(() => groupItemsBySection(displayItems), [displayItems])
  const { i18n } = useTranslation()
  const isRTL = i18n.language === "ar"

  // Configuration from furniture or defaults
  const effectiveConfig = {
    rows: shelvesConfig?.rows || sections,
    frontBackColumns: shelvesConfig?.frontBackColumns || 6,
    leftRightColumns: shelvesConfig?.leftRightColumns || 1,
  }

  // Calculate dimensions
  const shelfSpacing = height / effectiveConfig.rows
  const shelfThickness = 0.05
  const baseHeight = 0.3

  // Colors
  const baseColor = "#f5f5f5"
  const shelfColor = "#ffffff"
  const metalColor = "#e0e0e0"
  const backPanelColor = "#f8f8f8"
  const leftSideColor = "#f0f0f0"
  const rightSideColor = "#e8e8e8"

  // Calculate slot widths
  const slotWidthFrontBack = width / effectiveConfig.frontBackColumns
  const slotWidthSides = depth / effectiveConfig.leftRightColumns

  return (
    <group position={[x, y, z]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
      {/* Base */}
      <mesh position={[0, baseHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, baseHeight, depth]} />
        <meshStandardMaterial color={baseColor} roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Main structure */}
      <group>
        {/* Back panel */}
        <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, height, 0.05]} />
          <meshStandardMaterial color={backPanelColor} roughness={0.6} metalness={0.1} />
        </mesh>

        {/* Side panels */}
        <mesh position={[-width / 2 + 0.025, height / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.05, height, depth]} />
          <meshStandardMaterial color={leftSideColor} roughness={0.6} metalness={0.1} />
        </mesh>

        <mesh position={[width / 2 - 0.025, height / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.05, height, depth]} />
          <meshStandardMaterial color={rightSideColor} roughness={0.6} metalness={0.1} />
        </mesh>

        {/* Shelves for all four sides */}
        {Array.from({ length: effectiveConfig.rows }).map((_, rowIndex) => {
          const shelfY = (rowIndex + 1) * shelfSpacing

          return (
            <group key={`shelf-${rowIndex}`}>
              {/* Front shelf - full width for 6 columns */}
              <mesh position={[0, shelfY, depth / 2 - 0.05]} castShadow receiveShadow>
                <boxGeometry args={[width - 0.1, shelfThickness, 0.6]} />
                <meshStandardMaterial color={shelfColor} roughness={0.5} metalness={0.1} />
              </mesh>

              {/* Back shelf - full width for 6 columns */}
              <mesh position={[0, shelfY, -depth / 2 + 0.05]} castShadow receiveShadow>
                <boxGeometry args={[width - 0.1, shelfThickness, 0.6]} />
                <meshStandardMaterial color={shelfColor} roughness={0.5} metalness={0.1} />
              </mesh>

              {/* Left shelf */}
              <mesh position={[-width / 2 - 0.1, shelfY, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[depth - 0.1, shelfThickness, 0.8]} />
                <meshStandardMaterial color={shelfColor} roughness={0.5} metalness={0.1} />
              </mesh>

              {/* Right shelf */}
              <mesh position={[width / 2, shelfY, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[depth - 0.1, shelfThickness, 1.2]} />
                <meshStandardMaterial color={shelfColor} roughness={0.5} metalness={0.1} />
              </mesh>

              {/* Metal edges */}
              <mesh position={[0, shelfY + 0.02, depth / 2]} castShadow receiveShadow>
                <boxGeometry args={[width - 0.1, shelfThickness + 0.04, 0.05]} />
                <meshStandardMaterial color={metalColor} metalness={0.3} roughness={0.3} />
              </mesh>

              <mesh position={[0, shelfY + 0.02, -depth / 2]} castShadow receiveShadow>
                <boxGeometry args={[width - 0.1, shelfThickness + 0.04, 0.05]} />
                <meshStandardMaterial color={metalColor} metalness={0.3} roughness={0.3} />
              </mesh>

              <mesh
                position={[-width / 2 - 0.1, shelfY + 0.02, 0]}
                rotation={[0, Math.PI / 2, 0]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[depth - 0.1, shelfThickness + 0.04, 0.05]} />
                <meshStandardMaterial color={metalColor} metalness={0.3} roughness={0.3} />
              </mesh>

              <mesh position={[width / 2, shelfY + 0.02, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[depth - 0.1, shelfThickness + 0.04, 0.05]} />
                <meshStandardMaterial color={metalColor} metalness={0.3} roughness={0.3} />
              </mesh>
            </group>
          )
        })}
      </group>

      {/* Products placement */}
      {Object.entries(itemsBySection).map(([sectionIndex, items]) => {
        const sectionY = Number(sectionIndex) * shelfSpacing + shelfSpacing / 2 + shelfThickness / 2

        return items.map((item) => {
          const product = products.find((p) => p.primary_Id === item.productId)
          if (!product) return null

          const quantity = Math.max(1, item.quantity || 1)

          // Determine position and side
          let side, relativePosition, itemX, itemZ, itemRotation

          // Total columns calculation
          const totalColumns = effectiveConfig.leftRightColumns * 2 + effectiveConfig.frontBackColumns * 2

          // Calculate boundaries for each section
          const leftLimit = effectiveConfig.leftRightColumns
          const frontLimit = leftLimit + effectiveConfig.frontBackColumns
          const backLimit = frontLimit + effectiveConfig.frontBackColumns

          if (item.position < leftLimit) {
            // Left side
            side = "left"
            relativePosition = item.position
            itemX = -width / 2 - 0.1
            itemZ = -depth / 4 + (relativePosition * depth) / (effectiveConfig.leftRightColumns * 2)
            itemRotation = [0, Math.PI / 2, 0]
          } else if (item.position < frontLimit) {
            // Front side - 6 columns
            side = "front"
            relativePosition = item.position - leftLimit
            itemX = -width / 2 + (relativePosition + 0.5) * slotWidthFrontBack
            itemZ = depth / 2 - 0.2
            itemRotation = [0, 0, 0]
          } else if (item.position < backLimit) {
            // Back side - 6 columns
            side = "back"
            relativePosition = item.position - frontLimit
            itemX = -width / 2 + (relativePosition + 0.5) * slotWidthFrontBack
            itemZ = -depth / 2 + 0.2
            itemRotation = [0, Math.PI, 0]
          } else {
            // Right side
            side = "right"
            relativePosition = item.position - backLimit
            itemX = width / 2
            itemZ = depth / 4 - (relativePosition * depth) / (effectiveConfig.leftRightColumns * 2)
            itemRotation = [0, Math.PI / 2, 0]
          }

          // Product dimensions
          const productWidth = side === "front" || side === "back" ? slotWidthFrontBack * 0.8 : shelfSpacing * 0.7
          const productHeight = shelfSpacing * 0.7
          const productDepth = 0.05

          return (
            <group key={item.id} position={[itemX, sectionY, itemZ]} rotation={itemRotation}>
              <ProductDisplayComponent
                product={product}
                width={productWidth}
                height={productHeight}
                depth={productDepth}
                quantity={quantity}
              />
            </group>
          )
        })
      })}

      {/* Enhanced lighting */}
      <group>
        <spotLight
          position={[-width / 2 - 1.5, height / 2, 0]}
          intensity={1.2}
          angle={0.6}
          penumbra={0.5}
          distance={5}
          decay={1.5}
          target-position={[-width / 2 - 0.1, height / 2, 0]}
          castShadow
        />
        <spotLight
          position={[width / 2 + 1.5, height / 2, 0]}
          intensity={1.2}
          angle={0.6}
          penumbra={0.5}
          distance={5}
          decay={1.5}
          target-position={[width / 2 + 0.1, height / 2, 0]}
          castShadow
        />
        <pointLight position={[0, height + 0.5, 0]} intensity={0.5} distance={5} decay={2} />
      </group>
    </group>
  )
}

// PlanogramDisplay Component
export const PlanogramDisplay = ({ furniture, displayItems, products, onRemove, cellWidth, cellHeight }) => {
  const { width, height, depth, sections = 4, slots, color, x, y, z, rotation } = furniture
  const materials = useMemo(() => createMaterials(), [])
  const itemsBySection = useMemo(() => groupItemsBySection(displayItems), [displayItems])
  const { i18n } = useTranslation()
  const isRTL = i18n.language === "ar"

  // Calculate dimensions
  const shelfThickness = 0.03
  const sideThickness = 0.05
  const backThickness = 0.02

  // Colors based on the reference image
  const frameColor = color || "#a0a0a0" // Gris moyen pour la structure
  const shelfColor = "#d0d0d0" // Gris clair pour les étagères
  const backColor = "#c0c0c0" // Gris pour le panneau arrière

  // Calculate shelf spacing
  const shelfSpacing = height / sections

  // Log pour déboguer
  console.log("PlanogramDisplay - Rendering with:", {
    furniture,
    displayItems,
    itemsBySection,
    sections,
    slots,
    width,
    height,
    depth,
  })

  return (
    <group position={[x, y, z]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
      {/* Back panel */}
      <mesh position={[0, height / 2, -depth / 2 + backThickness / 2]} castShadow receiveShadow>
        <boxGeometry args={[width, height, backThickness]} />
        <meshStandardMaterial color={backColor} roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Side panels */}
      <mesh position={[-width / 2 + sideThickness / 2, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[sideThickness, height, depth]} />
        <meshStandardMaterial color={frameColor} roughness={0.6} metalness={0.2} />
      </mesh>

      <mesh position={[width / 2 - sideThickness / 2, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[sideThickness, height, depth]} />
        <meshStandardMaterial color={frameColor} roughness={0.6} metalness={0.2} />
      </mesh>

      {/* Top panel */}
      <mesh position={[0, height - shelfThickness / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, shelfThickness, depth]} />
        <meshStandardMaterial color={frameColor} roughness={0.6} metalness={0.2} />
      </mesh>

      {/* Shelves */}
      {Array.from({ length: sections - 1 }).map((_, i) => {
        const shelfY = (i + 1) * shelfSpacing

        return (
          <mesh key={`shelf-${i}`} position={[0, shelfY, 0]} castShadow receiveShadow>
            <boxGeometry args={[width - sideThickness * 0.5, shelfThickness, depth]} />
            <meshStandardMaterial color={shelfColor} roughness={0.4} metalness={0.3} />
          </mesh>
        )
      })}

      {/* Bottom shelf/base */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, shelfThickness, depth]} />
        <meshStandardMaterial color={shelfColor} roughness={0.4} metalness={0.3} />
      </mesh>

      {/* Display products on shelves */}
      {Object.entries(itemsBySection).map(([sectionIndex, items]) => {
        const sectionY = Number(sectionIndex) * shelfSpacing + shelfSpacing / 2 + shelfThickness / 2 + 0.15

        return items.map((item) => {
          const product = products.find((p) => p.primary_Id === item.productId)
          if (!product) return null

          // Calculate position based on slot, adjusting for RTL if needed
          const totalSlots = slots || 10
          const slotPosition = isRTL ? totalSlots - 1 - item.position : item.position
          const itemX = (slotPosition + 0.5) * (width / totalSlots) - width / 2

          // Get quantity if available
          const quantity = item.quantity || 1

          // Product dimensions - make them more compact to match the planogram-editor style
          const productWidth = (width / totalSlots) * 0.9
          const productHeight = shelfSpacing * 0.7

          // Si la quantité est supérieure à 1, afficher plusieurs produits côte à côte
          if (quantity > 1) {
            // Calculer l'espacement entre les produits
            const spacing = productWidth * 0.8

            return (
              <group key={item.id} position={[itemX, sectionY, depth / 4]}>
                {Array.from({ length: quantity }).map((_, index) => {
                  // Calculer le décalage pour chaque produit
                  const offsetX = (index - (quantity - 1) / 2) * spacing

                  return (
                    <group key={`product-${index}`} position={[offsetX, 0, 0]}>
                      <ProductDisplayComponent
                        product={product}
                        width={productWidth * 0.8}
                        height={productHeight}
                        depth={0.05}
                        quantity={1}
                      />
                    </group>
                  )
                })}
              </group>
            )
          } else {
            // Pour les produits avec quantité = 1, afficher normalement
            return (
              <group key={item.id} position={[itemX, sectionY, depth / 4]}>
                <ProductDisplayComponent
                  product={product}
                  width={productWidth}
                  height={productHeight}
                  depth={0.05}
                  quantity={1}
                />
              </group>
            )
          }
        })
      })}
    </group>
  )
}

// Helper function to adjust colors
function adjustColor(color, amount) {
  // Convert hex to RGB
  let r = Number.parseInt(color.substring(1, 3), 16)
  let g = Number.parseInt(color.substring(3, 5), 16)
  let b = Number.parseInt(color.substring(5, 7), 16)

  // Adjust values
  r = Math.max(0, Math.min(255, r + amount))
  g = Math.max(0, Math.min(255, g + amount))
  b = Math.max(0, Math.min(255, b + amount))

  // Convert back to hex
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
}

// Export all components
export { adjustColorFn as adjustColor }
