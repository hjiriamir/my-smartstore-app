"use client"

import { useMemo } from "react"
import * as THREE from "three"
import { useProductTexture } from "@/lib/use-product-texture"

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
  }
}

// Fonction utilitaire pour grouper les éléments par section
const groupItemsBySection = (displayItems) => {
  const itemsBySection = {}
  displayItems.forEach((item) => {
    if (!itemsBySection[item.section]) {
      itemsBySection[item.section] = []
    }
    itemsBySection[item.section].push(item)
  })
  return itemsBySection
}

// Fonction pour ajuster les couleurs
const adjustColor = (color, amount) => {
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
  quantity = 1, // Add quantity parameter with default value
}) => {
  const { texture: productTexture, textureLoaded } = useProductTexture(product?.image)

  // Déterminer la couleur de secours en fonction du type de produit
  const getFallbackColor = () => {
    if (isRefrigerated) return "#CCFFCC"
    if (isBottom) return product?.color || "#000033"
    if (isAccessory) return product?.color || "#663300"
    if (isFolded) return product?.color || "#000066"
    if (isSuit) return product?.color || "#333333"
    if (isShirt) return product?.color || "#FFFFFF"
    return product?.color || "#333333"
  }

  // If quantity is greater than 1 and we're not already handling a single product instance,
  // render multiple products with slight offsets side by side
  if (quantity > 1) {
    // Calculate spacing between products - use smaller spacing for better side-by-side display
    const spacing = width * 0.8

    return (
      <group>
        {Array.from({ length: quantity }).map((_, index) => {
          // Position products side by side (primarily on X axis)
          // For odd quantities, center the middle product
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
    // Rendu amélioré pour les chemises pliées
    return (
      <group>
        {textureLoaded && productTexture ? (
          <mesh castShadow receiveShadow>
            <boxGeometry args={[width, height, depth]} />
            <meshBasicMaterial map={productTexture} />
          </mesh>
        ) : (
          <group>
            {/* Corps de la chemise pliée */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[width, height, depth]} />
              <meshStandardMaterial color={getFallbackColor()} />
            </mesh>
            {/* Détails du col */}
            <mesh castShadow receiveShadow position={[0, height / 2 + 0.01, depth / 2 - 0.01]}>
              <boxGeometry args={[width * 0.8, 0.03, 0.01]} />
              <meshStandardMaterial color={adjustColor(getFallbackColor(), 20)} />
            </mesh>
            {/* Plis de la chemise */}
            {[-width * 0.25, 0, width * 0.25].map((x, i) => (
              <mesh key={`fold-${i}`} castShadow receiveShadow position={[x, 0, depth / 2 + 0.001]}>
                <boxGeometry args={[0.01, height * 0.8, 0.01]} />
                <meshStandardMaterial color={adjustColor(getFallbackColor(), -10)} />
              </mesh>
            ))}
            {/* Étiquette de prix */}
            <mesh castShadow receiveShadow position={[width * 0.3, height / 2, depth / 2 + 0.01]}>
              <boxGeometry args={[0.1, 0.05, 0.01]} />
              <meshStandardMaterial color="#FFFFFF" />
            </mesh>
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
              <meshStandardMaterial color={adjustColor(getFallbackColor(), -20)} />
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

// 3D Wall Display Component
export const WallDisplay = ({ furniture, displayItems, products, onRemove }) => {
  const { width, height, depth, sections, slots, color, x, y, z, rotation } = furniture
  const materials = useMemo(() => createMaterials(), [])
  const itemsBySection = useMemo(() => groupItemsBySection(displayItems), [displayItems])

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

      <mesh position={[width / 2 + 0.025, height / 2, 0]} castShadow receiveShadow>
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

          const itemX = (item.position - slots / 2 + 0.5) * slotWidth

          // Determine item type
          const name = product.name?.toLowerCase() || ""
          const isBottom =
            name.includes("pantalon") || name.includes("jean") || name.includes("short") || name.includes("jupe")

          // Get quantity if available
          const quantity = item.quantity || 1

          if (isBottom) {
            // Pants/trousers
            return (
              <group key={item.id} position={[itemX, sectionY - sectionHeight * 0.2, depth / 4]}>
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
              <group key={item.id} position={[itemX, sectionY - sectionHeight * 0.2, depth / 4]}>
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

          const itemX = (item.position - slots / 2 + 0.5) * slotWidth

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

          const itemX = (item.position - slots / 2 + 0.5) * slotWidth

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

          const itemX = (col - slots / 2 + 0.5) * slotSize
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

          // Calculer la position X relative à chaque face
          // Pour la face A: positions 0 à (slots/2 - 1) mappées sur toute la largeur
          // Pour la face B: positions (slots/2) à (slots - 1) mappées sur toute la largeur
          const relativePosition = isFaceA ? item.position : item.position - slotsPerFace

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

// Modification du composant PlanogramDisplay pour supprimer les colonnes verticales
export const PlanogramDisplay = ({ furniture, displayItems, products, onRemove, cellWidth, cellHeight }) => {
  const { width, height, depth, sections, slots, color, x, y, z, rotation } = furniture
  const materials = useMemo(() => createMaterials(), [])
  const itemsBySection = useMemo(() => groupItemsBySection(displayItems), [displayItems])

  // Calculate dimensions if not provided
  const actualCellWidth = cellWidth || width / slots
  const actualCellHeight = cellHeight || height / sections

  return (
    <group position={[x, y, z]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
      {/* Back panel */}
      <mesh position={[0, height / 2, -depth / 2]} castShadow receiveShadow>
        <boxGeometry args={[width, height, 0.05]} />
        <meshStandardMaterial color={color || "#f0f0f0"} />
      </mesh>

      {/* Side panels */}
      <mesh position={[-width / 2 - 0.025, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.05, height, depth]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>

      <mesh position={[width / 2 + 0.025, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.05, height, depth]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>

      {/* Horizontal shelves - Gardons uniquement les étagères horizontales */}
      {Array.from({ length: sections + 1 }).map((_, i) => (
        <mesh key={`shelf-${i}`} position={[0, i * actualCellHeight, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, 0.03, depth]} />
          <meshStandardMaterial color="#e0e0e0" />
        </mesh>
      ))}

      {/* Display items in a grid layout */}
      {Object.entries(itemsBySection).map(([sectionIndex, items]) => {
        const sectionY = Number.parseInt(sectionIndex) * actualCellHeight + actualCellHeight / 2

        return items.map((item) => {
          const product = products.find((p) => p.primary_Id === item.productId)
          if (!product) return null

          const position = item.position || 0
          const itemX = -width / 2 + (position + 0.5) * actualCellWidth

          // Determine product type for display
          const name = product.name?.toLowerCase() || ""
          const isFood =
            name.includes("food") || name.includes("snack") || name.includes("drink") || name.includes("beverage")

          const isBox = name.includes("box") || name.includes("package") || name.includes("pack")

          // Calculate product size to fit in cell
          const productWidth = actualCellWidth * 0.9
          const productHeight = actualCellHeight * 0.9
          const productDepth = depth * 0.7

          // Get quantity if available
          const quantity = item.quantity || 1

          // Get the texture for this product outside the map function
          const { texture: productTexture, textureLoaded } = useProductTexture(product?.image)

          // Si la quantité est supérieure à 1, afficher plusieurs produits côte à côte
          if (quantity > 1) {
            return (
              <group key={item.id} position={[itemX, sectionY, depth / 4]}>
                {Array.from({ length: quantity }).map((_, index) => {
                  // Calculer le décalage pour centrer les produits
                  const offsetX = (index - (quantity - 1) / 2) * (productWidth * 0.8)

                  return (
                    <group key={`product-${index}`} position={[offsetX, 0, 0]}>
                      {isBox ? (
                        <mesh castShadow receiveShadow>
                          <boxGeometry args={[productWidth / Math.sqrt(quantity), productHeight, productDepth]} />
                          <meshStandardMaterial color={product.color || "#CD853F"} />
                        </mesh>
                      ) : (
                        <mesh castShadow receiveShadow>
                          {product && product.image && textureLoaded ? (
                            <>
                              <planeGeometry args={[productWidth / Math.sqrt(quantity), productHeight]} />
                              <meshBasicMaterial map={productTexture} transparent side={THREE.DoubleSide} />
                            </>
                          ) : (
                            <>
                              <boxGeometry args={[productWidth / Math.sqrt(quantity), productHeight, productDepth]} />
                              <meshStandardMaterial color={product?.color || "#333333"} />
                            </>
                          )}
                        </mesh>
                      )}
                    </group>
                  )
                })}
              </group>
            )
          }

          // Pour un seul produit, affichage normal
          return (
            <group key={item.id} position={[itemX, sectionY, depth / 4]}>
              {isBox ? (
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[productWidth, productHeight, productDepth]} />
                  <meshStandardMaterial color={product.color || "#CD853F"} />
                </mesh>
              ) : (
                <mesh castShadow receiveShadow>
                  {product && product.image && textureLoaded ? (
                    <>
                      <planeGeometry args={[productWidth, productHeight]} />
                      <meshBasicMaterial map={productTexture} transparent side={THREE.DoubleSide} />
                    </>
                  ) : (
                    <>
                      <boxGeometry args={[productWidth, productHeight, productDepth]} />
                      <meshStandardMaterial color={product?.color || "#333333"} />
                    </>
                  )}
                </mesh>
              )}
            </group>
          )
        })
      })}

      {/* Price tags on shelf edges */}
      {Object.entries(itemsBySection).map(([sectionIndex, items]) => {
        const sectionY = Number.parseInt(sectionIndex) * actualCellHeight

        return items.map((item) => {
          const product = products.find((p) => p.primary_Id === item.productId)
          if (!product) return null

          const position = item.position || 0
          const itemX = -width / 2 + (position + 0.5) * actualCellWidth

          return (
            <mesh
              key={`tag-${item.id}`}
              position={[itemX, sectionY + 0.015, depth / 2 - 0.01]}
              castShadow
              receiveShadow
            >
              <planeGeometry args={[actualCellWidth * 0.8, 0.03]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
          )
        })
      })}
    </group>
  )
}

// ShelvesDisplay Component
export const ShelvesDisplay = ({ furniture, displayItems, products, onRemove }) => {
  const { width, height, depth, sections, slots, color, x, y, z, rotation } = furniture
  const materials = useMemo(() => createMaterials(), [])
  const itemsBySection = useMemo(() => groupItemsBySection(displayItems), [displayItems])

  // Calculate dimensions
  const sectionHeight = height / sections
  const slotWidth = width / slots
  const baseHeight = 0.3
  const shelfThickness = 0.05

  // Colors for the shelves display
  const baseColor = "#f5f5f5"
  const shelfColor = "#ffffff"
  const metalColor = "#e0e0e0"
  const structureColor = "#f0f0f0"
  const backPanelColor = "#f8f8f8"
  const leftSideColor = "#f0f0f0"
  const rightSideColor = "#e8e8e8"

  // Calculate column quarters for the 4 sides
  const columnQuarter = slots / 4

  return (
    <group position={[x, y, z]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
      {/* Base of the furniture */}
      <mesh position={[0, baseHeight / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[width, baseHeight, depth]} />
        <meshStandardMaterial color={baseColor} roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Main structure */}
      <group>
        {/* Central back panel */}
        <mesh position={[0, height / 2, 0]} receiveShadow castShadow>
          <boxGeometry args={[width, height, 0.05]} />
          <meshStandardMaterial color={backPanelColor} roughness={0.6} metalness={0.1} />
        </mesh>

        {/* Side panels */}
        <mesh position={[-width / 2 + 0.025, height / 2, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.05, height, depth]} />
          <meshStandardMaterial color={leftSideColor} roughness={0.6} metalness={0.1} />
        </mesh>

        <mesh position={[width / 2 - 0.025, height / 2, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.05, height, depth]} />
          <meshStandardMaterial color={rightSideColor} roughness={0.6} metalness={0.1} />
        </mesh>

        {/* Shelves - for all four sides */}
        {Array.from({ length: sections }).map((_, rowIndex) => {
          const shelfY = (rowIndex + 1) * sectionHeight

          return (
            <group key={`shelf-group-${rowIndex}`}>
              {/* Front side */}
              <mesh position={[0, shelfY, depth / 2 - 0.05]} receiveShadow castShadow>
                <boxGeometry args={[width - 0.1, shelfThickness, 0.6]} />
                <meshStandardMaterial color={shelfColor} roughness={0.5} metalness={0.1} />
              </mesh>

              {/* Back side */}
              <mesh position={[0, shelfY, -depth / 2 + 0.05]} receiveShadow castShadow>
                <boxGeometry args={[width - 0.1, shelfThickness, 0.6]} />
                <meshStandardMaterial color={shelfColor} roughness={0.5} metalness={0.1} />
              </mesh>

              {/* Left side - outward facing shelf */}
              <mesh position={[-width / 2, shelfY, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow castShadow>
                <boxGeometry args={[depth - 0.1, shelfThickness, 1.2]} />
                <meshStandardMaterial color={shelfColor} roughness={0.5} metalness={0.1} />
              </mesh>

              {/* Right side - outward facing shelf */}
              <mesh position={[width / 2, shelfY, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow castShadow>
                <boxGeometry args={[depth - 0.1, shelfThickness, 1.2]} />
                <meshStandardMaterial color={shelfColor} roughness={0.5} metalness={0.1} />
              </mesh>

              {/* Metal edges */}
              <mesh position={[0, shelfY + 0.02, depth / 2]} receiveShadow castShadow>
                <boxGeometry args={[width - 0.1, shelfThickness + 0.04, 0.05]} />
                <meshStandardMaterial color={metalColor} metalness={0.3} roughness={0.3} />
              </mesh>

              <mesh position={[0, shelfY + 0.02, -depth / 2]} receiveShadow castShadow>
                <boxGeometry args={[width - 0.1, shelfThickness + 0.04, 0.05]} />
                <meshStandardMaterial color={metalColor} metalness={0.3} roughness={0.3} />
              </mesh>
            </group>
          )
        })}
      </group>

      {/* Display items organized by side */}
      {Object.entries(itemsBySection).map(([sectionIndex, items]) => {
        const sectionY = Number.parseInt(sectionIndex) * sectionHeight + sectionHeight / 2

        return items.map((item) => {
          const product = products.find((p) => p.primary_Id === item.productId)
          if (!product) return null

          let itemX, itemZ, itemRotation

          // First, check if the item has a side property (from saved planogram)
          if (item.side) {
            // Position based on the saved side information
            switch (item.side) {
              case "left":
                itemX = -width / 2 - 0.1
                itemZ = 0
                itemRotation = [0, -Math.PI / 2, 0] // 90° to the left
                break
              case "front":
                // Calculate position within the front section
                const frontPosition = item.position % columnQuarter
                itemX = -width / 4 + (frontPosition / columnQuarter) * (width / 2)
                itemZ = depth / 2 - 0.05
                itemRotation = [0, 0, 0] // No rotation
                break
              case "back":
                // Calculate position within the back section
                const backPosition = item.position % columnQuarter
                itemX = -width / 4 + (backPosition / columnQuarter) * (width / 2)
                itemZ = -depth / 2 + 0.05
                itemRotation = [0, Math.PI, 0] // 180° rotation
                break
              case "right":
                itemX = width / 2 + 0.1
                itemZ = 0
                itemRotation = [0, Math.PI / 2, 0] // 90° to the right
                break
              default:
                // Fallback to position-based calculation
                if (item.position < columnQuarter) {
                  // Left side
                  itemX = -width / 2 - 0.1
                  itemZ = 0
                  itemRotation = [0, -Math.PI / 2, 0] // 90° to the left
                } else if (item.position < columnQuarter * 2) {
                  // Front side
                  itemX = -width / 4 + ((item.position - columnQuarter) / columnQuarter) * (width / 2)
                  itemZ = depth / 2 - 0.05
                  itemRotation = [0, 0, 0] // No rotation
                } else if (item.position < columnQuarter * 3) {
                  // Back side
                  itemX = -width / 4 + ((item.position - columnQuarter * 2) / columnQuarter) * (width / 2)
                  itemZ = -depth / 2 + 0.05
                  itemRotation = [0, Math.PI, 0] // 180° rotation
                } else {
                  // Right side
                  itemX = width / 2 + 0.1
                  itemZ = 0
                  itemRotation = [0, Math.PI / 2, 0] // 90° to the right
                }
            }
          } else {
            // Fallback to position-based calculation if no side information is available
            if (item.position < columnQuarter) {
              // Left side
              itemX = -width / 2 - 0.1
              itemZ = 0
              itemRotation = [0, -Math.PI / 2, 0] // 90° to the left
            } else if (item.position < columnQuarter * 2) {
              // Front side
              itemX = -width / 4 + ((item.position - columnQuarter) / columnQuarter) * (width / 2)
              itemZ = depth / 2 - 0.05
              itemRotation = [0, 0, 0] // No rotation
            } else if (item.position < columnQuarter * 3) {
              // Back side
              itemX = -width / 4 + ((item.position - columnQuarter * 2) / columnQuarter) * (width / 2)
              itemZ = -depth / 2 + 0.05
              itemRotation = [0, Math.PI, 0] // 180° rotation
            } else {
              // Right side
              itemX = width / 2 + 0.1
              itemZ = 0
              itemRotation = [0, Math.PI / 2, 0] // 90° to the right
            }
          }

          // Get quantity if available
          const quantity = item.quantity || 1

          // For multiple products, create a group with proper spacing
          if (quantity > 1) {
            // Get the texture for this product outside the map function
            const { texture: productTexture, textureLoaded } = useProductTexture(product?.image)

            return (
              <group key={item.id} position={[itemX, sectionY, itemZ]} rotation={itemRotation}>
                {Array.from({ length: quantity }).map((_, index) => {
                  // Calculate offset for each product - position them side by side
                  const offsetX = (index - (quantity - 1) / 2) * (slotWidth * 0.6)

                  return (
                    <group key={`${item.id}-${index}`} position={[offsetX, 0, 0]}>
                      <mesh castShadow receiveShadow>
                        {product && product.image && textureLoaded ? (
                          <>
                            <planeGeometry args={[slotWidth * 0.7, sectionHeight * 0.8]} />
                            <meshBasicMaterial map={productTexture} transparent side={THREE.DoubleSide} />
                          </>
                        ) : (
                          <>
                            <boxGeometry args={[slotWidth * 0.7, sectionHeight * 0.8, 0.05]} />
                            <meshStandardMaterial color={product?.color || "#333333"} />
                          </>
                        )}
                      </mesh>
                    </group>
                  )
                })}

                {/* Remove quantity indicator */}
              </group>
            )
          }

          // For single products, use the standard display
          return (
            <group key={item.id} position={[itemX, sectionY, itemZ]} rotation={itemRotation}>
              <ProductDisplayComponent
                product={product}
                width={slotWidth * 0.8}
                height={sectionHeight * 0.8}
                depth={0.05}
                isHanging={false}
                quantity={1}
              />
            </group>
          )
        })
      })}

      {/* Lighting */}
      <pointLight position={[0, height + 0.5, 0]} intensity={0.5} distance={5} decay={2} />
    </group>
  )
}

// Export all components
