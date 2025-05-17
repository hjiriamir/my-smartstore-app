"use client"

import { useMemo } from "react"
import * as THREE from "three"
import { useProductTexture } from "@/lib/use-product-texture"

// Composant pour le présentoir de vêtements spécifique aux images fournies
export const ClothingDisplay = ({ furniture, displayItems, products, onRemove }) => {
  const { width, height, depth, sections, slots, color, x, y, z, rotation } = furniture
  const itemsBySection = useMemo(() => groupItemsBySection(displayItems), [displayItems])

  // Calculer les dimensions
  const sectionHeight = height / sections
  const slotWidth = width / slots

  // Matériaux pour le présentoir
  const materials = useMemo(() => {
    return {
      frame: new THREE.MeshStandardMaterial({ color: "#f5f5f5" }), // Blanc pour la structure
      metal: new THREE.MeshStandardMaterial({ color: "#d0d0d0" }), // Métal pour les barres
      shelf: new THREE.MeshStandardMaterial({ color: "#e0e0e0" }), // Étagères
      base: new THREE.MeshStandardMaterial({ color: "#c0c0c0" }), // Base
    }
  }, [])

  return (
    <group position={[x, y, z]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
      {/* Structure principale - cadre */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={color} transparent opacity={0.1} />
      </mesh>

      {/* Montants verticaux */}
      {[-width / 2, width / 2].map((xPos, i) => (
        <mesh key={`vertical-${i}`} position={[xPos, height / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.05, height, 0.05]} />
          <primitive object={materials.frame} />
        </mesh>
      ))}

      {/* Barres horizontales supérieures pour suspendre les vêtements */}
      {Array.from({ length: sections }).map((_, i) => (
        <mesh
          key={`horizontal-bar-${i}`}
          position={[0, height - i * sectionHeight - 0.1, 0]}
          rotation={[0, 0, Math.PI / 2]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.015, 0.015, width - 0.1, 8]} />
          <primitive object={materials.metal} />
        </mesh>
      ))}

      {/* Base du présentoir */}
      <mesh position={[0, 0.025, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, 0.05, depth]} />
        <primitive object={materials.base} />
      </mesh>

      {/* Étagères du bas pour les boîtes (uniquement dans la section inférieure) */}
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width - 0.1, 0.02, depth - 0.1]} />
        <primitive object={materials.shelf} />
      </mesh>

      {/* Afficher les produits */}
      {Object.entries(itemsBySection).map(([sectionIndex, items]) => {
        const sectionY = height - Number.parseInt(sectionIndex) * sectionHeight - 0.3

        return items.map((item) => {
          const product = products.find((p) => p.primary_Id === item.productId)
          if (!product) return null

          const itemX = (item.position - slots / 2 + 0.5) * slotWidth
          const isBottomSection = Number.parseInt(sectionIndex) === sections - 1

          // Déterminer le type de produit
          const name = product.name?.toLowerCase() || ""
          const isBottom =
            name.includes("pantalon") || name.includes("jean") || name.includes("short") || name.includes("jupe")
          const isAccessory =
            name.includes("cravate") ||
            name.includes("écharpe") ||
            name.includes("foulard") ||
            name.includes("ceinture") ||
            name.includes("accessoire")
          const isBox =
            name.includes("boîte") ||
            name.includes("box") ||
            name.includes("carton") ||
            name.includes("emballage") ||
            name.includes("package")

          if (isBottomSection && isBox) {
            // Boîtes sur l'étagère du bas
            return (
              <group key={item.id} position={[itemX, 0.3, 0]}>
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[slotWidth * 0.7, 0.2, depth * 0.7]} />
                  <meshStandardMaterial color={product.color || "#8B4513"} />
                </mesh>
              </group>
            )
          } else if (isAccessory) {
            // Accessoires (cravates, écharpes, etc.)
            return (
              <group key={item.id} position={[itemX, sectionY - 0.3, 0]}>
                <ProductDisplay
                  product={product}
                  width={slotWidth * 0.2}
                  height={0.6}
                  depth={0.02}
                  isHanging={true}
                  isAccessory={true}
                />
              </group>
            )
          } else if (isBottom) {
            // Pantalons/jupes
            return (
              <group key={item.id} position={[itemX, sectionY - 0.3, 0]}>
                <ProductDisplay
                  product={product}
                  width={slotWidth * 0.6}
                  height={0.8}
                  depth={0.05}
                  isHanging={true}
                  isBottom={true}
                />
              </group>
            )
          } else {
            // Autres vêtements
            return (
              <group key={item.id} position={[itemX, sectionY - 0.3, 0]}>
                <ProductDisplay product={product} width={slotWidth * 0.6} height={0.7} depth={0.1} isHanging={true} />
              </group>
            )
          }
        })
      })}
    </group>
  )
}

// Composant pour afficher un produit
const ProductDisplay = ({
  product,
  width,
  height,
  depth,
  isHanging = false,
  isBottom = false,
  isAccessory = false,
}) => {
  const { texture, textureLoaded } = useProductTexture(product?.image)

  // Déterminer la couleur de secours en fonction du type de produit
  const getFallbackColor = () => {
    if (isBottom) return product?.color || "#666666"
    if (isAccessory) return product?.color || "#333333"
    return product?.color || "#444444"
  }

  if (isAccessory) {
    // Rendu spécifique pour les accessoires (cravates, écharpes)
    return (
      <group>
        {textureLoaded && texture ? (
          <mesh castShadow receiveShadow>
            <planeGeometry args={[width, height]} />
            <meshBasicMaterial map={texture} transparent side={THREE.DoubleSide} />
          </mesh>
        ) : (
          <mesh castShadow receiveShadow>
            <boxGeometry args={[width, height, 0.01]} />
            <meshStandardMaterial color={getFallbackColor()} />
          </mesh>
        )}
      </group>
    )
  } else if (isHanging) {
    // Vêtements suspendus
    return (
      <group>
        {/* Cintre */}
        <mesh position={[0, height / 2 - 0.05, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.01, 0.01, width * 0.7, 8]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#CCCCCC" />
        </mesh>
        <mesh position={[0, height / 2 - 0.1, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.01, 0.01, 0.1, 8]} />
          <meshStandardMaterial color="#CCCCCC" />
        </mesh>

        {/* Vêtement */}
        {textureLoaded && texture ? (
          <mesh castShadow receiveShadow position={[0, height / 4 - 0.1, 0]}>
            <planeGeometry args={[width, height * 0.8]} />
            <meshBasicMaterial map={texture} transparent side={THREE.DoubleSide} />
          </mesh>
        ) : (
          <mesh castShadow receiveShadow position={[0, height / 4 - 0.1, 0]}>
            <boxGeometry args={[width, height * 0.8, depth]} />
            <meshStandardMaterial color={getFallbackColor()} />
          </mesh>
        )}
      </group>
    )
  } else {
    // Rendu par défaut
    return (
      <group>
        {textureLoaded && texture ? (
          <mesh castShadow receiveShadow>
            <planeGeometry args={[width, height]} />
            <meshBasicMaterial map={texture} transparent side={THREE.DoubleSide} />
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
