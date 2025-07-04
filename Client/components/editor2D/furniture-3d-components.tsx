"use client"

import { useMemo, useState, useEffect } from "react"
import * as THREE from "three"
import { useProductTexture } from "@/lib/use-product-texture"
import { useTranslation } from "react-i18next"

// Utility function to create reusable materials
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

// Function to group items by section
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

  console.log("Grouped items by section:", itemsBySection)
  return itemsBySection
}

// Function to adjust colors
const adjustColorFn = (color, amount) => {
  let r = Number.parseInt(color.substring(1, 3), 16)
  let g = Number.parseInt(color.substring(3, 5), 16)
  let b = Number.parseInt(color.substring(5, 7), 16)

  r = Math.max(0, Math.min(255, r + amount))
  g = Math.max(0, Math.min(255, g + amount))
  b = Math.max(0, Math.min(255, b + amount))

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
}

// Generic Product Display Component
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
  quantity = 1,
}) => {
  const { texture: productTexture, textureLoaded } = useProductTexture(product?.image)

  console.log("ProductDisplayComponent - Rendering product:", {
    name: product?.name,
    image: product?.image,
    textureLoaded,
    quantity,
    position: product?.position,
    section: product?.section,
  })

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

  // If quantity is greater than 1, render multiple products
  if (quantity > 1) {
    const spacing = width * 0.5

    return (
      <group>
        {Array.from({ length: quantity }).map((_, index) => {
          const offsetX = (index - (quantity - 1) / 2) * spacing

          return (
            <group key={`product-${index}`} position={[offsetX, 0, 0]}>
              <ProductDisplayComponent
                product={product}
                width={width * 0.9}
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
                quantity={1}
              />
            </group>
          )
        })}
      </group>
    )
  }

  // Conditional rendering based on product type
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
    return (
      <group>
        {textureLoaded && productTexture ? (
          <mesh castShadow receiveShadow>
            <planeGeometry args={[width, height]} />
            <meshBasicMaterial map={productTexture} transparent side={THREE.DoubleSide} />
          </mesh>
        ) : (
          <group>
            <mesh castShadow receiveShadow position={[0, 0, 0]}>
              <cylinderGeometry args={[width * 0.4, width * 0.5, height * 0.3, 16]} />
              <meshStandardMaterial color={getFallbackColor()} />
            </mesh>
            <mesh castShadow receiveShadow position={[0, 0, width * 0.3]}>
              <boxGeometry args={[width * 0.8, height * 0.1, width * 0.4]} />
              <meshStandardMaterial color={getFallbackColor()} />
            </mesh>
          </group>
        )}
      </group>
    )
  } else if (isShoe) {
    return (
      <group>
        {textureLoaded && productTexture ? (
          <mesh castShadow receiveShadow>
            <planeGeometry args={[width, height]} />
            <meshBasicMaterial map={productTexture} transparent side={THREE.DoubleSide} />
          </mesh>
        ) : (
          <group>
            <mesh castShadow receiveShadow position={[0, 0, 0]}>
              <boxGeometry args={[width, height * 0.4, depth * 1.5]} />
              <meshStandardMaterial color={getFallbackColor()} />
            </mesh>
            <mesh castShadow receiveShadow position={[0, -height * 0.25, 0]}>
              <boxGeometry args={[width * 1.1, height * 0.1, depth * 1.6]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          </group>
        )}
      </group>
    )
  } else if (isSuit) {
    return (
      <group>
        <mesh position={[0, height / 2 - 0.05, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.015, 0.015, width * 0.8, 8]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#CCCCCC" />
        </mesh>
        <mesh position={[0, height / 2 - 0.1, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.15, 8]} />
          <meshStandardMaterial color="#CCCCCC" />
        </mesh>

        {textureLoaded && productTexture ? (
          <mesh castShadow receiveShadow position={[0, height / 4 - 0.1, 0]}>
            <planeGeometry args={[width, height * 0.8]} />
            <meshBasicMaterial map={productTexture} transparent side={THREE.DoubleSide} />
          </mesh>
        ) : (
          <group>
            <mesh castShadow receiveShadow position={[0, height / 4 - 0.1, 0]}>
              <boxGeometry args={[width, height * 0.6, depth]} />
              <meshStandardMaterial color={getFallbackColor()} />
            </mesh>
            <mesh castShadow receiveShadow position={[0, height / 2 - 0.15, 0]}>
              <boxGeometry args={[width * 0.7, height * 0.2, depth * 1.2]} />
              <meshStandardMaterial color={getFallbackColor()} />
            </mesh>
            {[0.1, 0, -0.1].map((y, i) => (
              <mesh key={`button-${i}`} castShadow receiveShadow position={[-width * 0.1, y, depth / 2 + 0.01]}>
                <cylinderGeometry args={[0.02, 0.02, 0.01, 8]} rotation={[Math.PI / 2, 0, 0]} />
                <meshStandardMaterial color="#111111" />
              </mesh>
            ))}
            <mesh castShadow receiveShadow position={[width * 0.3, height * 0.3, depth / 2 + 0.01]}>
              <boxGeometry args={[0.1, 0.05, 0.01]} />
              <meshStandardMaterial color="#FFFFFF" />
            </mesh>
          </group>
        )}
      </group>
    )
  } else if (isShirt) {
    return (
      <group>
        {textureLoaded && productTexture ? (
          <mesh castShadow receiveShadow>
            <planeGeometry args={[width, height]} />
            <meshBasicMaterial map={productTexture} transparent side={THREE.DoubleSide} />
          </mesh>
        ) : (
          <group>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[width, height * 0.6, depth]} />
              <meshStandardMaterial color={getFallbackColor()} />
            </mesh>
            <mesh castShadow receiveShadow position={[0, height * 0.35, 0]}>
              <boxGeometry args={[width * 0.7, height * 0.1, depth * 1.1]} />
              <meshStandardMaterial color={adjustColorFn(getFallbackColor(), 20)} />
            </mesh>
            <mesh castShadow receiveShadow position={[-width * 0.4, height * 0.25, 0]}>
              <boxGeometry args={[width * 0.2, height * 0.1, depth]} />
              <meshStandardMaterial color={getFallbackColor()} />
            </mesh>
            <mesh castShadow receiveShadow position={[width * 0.4, height * 0.25, 0]}>
              <boxGeometry args={[width * 0.2, height * 0.1, depth]} />
              <meshStandardMaterial color={getFallbackColor()} />
            </mesh>
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
        <mesh position={[0, height / 2 - 0.05, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.015, 0.015, width * 0.7, 8]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#CCCCCC" />
        </mesh>
        <mesh position={[0, height / 2 - 0.1, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.1, 8]} />
          <meshStandardMaterial color="#CCCCCC" />
        </mesh>

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
    return (
      <group>
        <mesh position={[0, height / 2 - 0.05, 0]} castShadow receiveShadow>
          <boxGeometry args={[width * 0.8, 0.02, 0.02]} />
          <meshStandardMaterial color="#CCCCCC" />
        </mesh>
        <mesh position={[0, height / 2 - 0.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.02, 0.1, 0.02]} />
          <meshStandardMaterial color="#CCCCCC" />
        </mesh>

        {textureLoaded && productTexture ? (
          <mesh castShadow receiveShadow position={[0, height / 4 - 0.2, 0]}>
            <planeGeometry args={[width * 0.6, height * 0.8]} />
            <meshBasicMaterial map={productTexture} transparent side={THREE.DoubleSide} />
          </mesh>
        ) : (
          <group>
            <mesh castShadow receiveShadow position={[-width * 0.15, height / 4 - 0.2, 0]}>
              <boxGeometry args={[width * 0.25, height * 0.8, depth * 0.5]} />
              <meshStandardMaterial color={getFallbackColor()} />
            </mesh>
            <mesh castShadow receiveShadow position={[width * 0.15, height / 4 - 0.2, 0]}>
              <boxGeometry args={[width * 0.25, height * 0.8, depth * 0.5]} />
              <meshStandardMaterial color={getFallbackColor()} />
            </mesh>
            <mesh castShadow receiveShadow position={[0, height / 2 - 0.2, 0]}>
              <boxGeometry args={[width * 0.6, 0.05, depth * 0.6]} />
              <meshStandardMaterial color={adjustColorFn(getFallbackColor(), -20)} />
            </mesh>
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

// Simple Mannequin Component
const MannequinComponent = ({ height = 1.8, color = "#f0f0f0" }) => {
  return (
    <group>
      <mesh position={[0, height - 0.15, 0]} castShadow>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>

      <mesh position={[0, height - 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.05, 0.1, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>

      <mesh position={[0, height - 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 0.5, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>

      <mesh position={[0, height / 2 - 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, height - 0.6, 8]} />
        <meshStandardMaterial color="#888888" />
      </mesh>

      <mesh position={[0, 0.025, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.05, 16]} />
        <meshStandardMaterial color="#888888" />
      </mesh>
    </group>
  )
}

// Enhanced Refrigerated Product Display
const EnhancedRefrigeratedProductDisplay = ({ product, width, height }) => {
  const { texture, textureLoaded } = useProductTexture(product?.image)

  const isBottle =
    product?.name?.toLowerCase().includes("eau") ||
    product?.name?.toLowerCase().includes("bouteille") ||
    product?.image?.toLowerCase().includes("bottle")

  const productWidth = isBottle ? width * 0.5 : width * 0.9
  const productHeight = isBottle ? height * 0.95 : height * 0.8

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
      <mesh scale={[1.05, 1.05, 1.05]}>
        <planeGeometry args={[productWidth, productHeight]} />
        <primitive object={outlineMaterial} />
      </mesh>

      {textureLoaded && texture ? (
        <mesh castShadow receiveShadow>
          <planeGeometry args={[productWidth, productHeight]} />
          <meshBasicMaterial map={texture} transparent side={THREE.DoubleSide} />
        </mesh>
      ) : (
        <group>
          {isBottle ? (
            <>
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
              <mesh castShadow receiveShadow position={[0, productHeight * 0.4, 0]}>
                <cylinderGeometry args={[productWidth * 0.15, productWidth * 0.15, productHeight * 0.2, 16]} />
                <meshPhysicalMaterial
                  color={product?.color || "#a0d8ef"}
                  transparent
                  opacity={0.9}
                  clearcoat={1}
                  clearcoatRoughness={0.1}
                />
              </mesh>
              <mesh castShadow receiveShadow position={[0, productHeight * 0.5, 0]}>
                <cylinderGeometry args={[productWidth * 0.18, productWidth * 0.18, productHeight * 0.05, 16]} />
                <meshStandardMaterial color="#ffffff" />
              </mesh>
              <mesh castShadow receiveShadow position={[0, 0, productWidth * 0.31]}>
                <planeGeometry args={[productWidth * 0.5, productHeight * 0.3]} />
                <meshBasicMaterial color={product?.color === "#a0d8ef" ? "#ffffff" : "#f0f0f0"} />
              </mesh>
            </>
          ) : (
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
              <mesh castShadow receiveShadow position={[0, 0, productWidth * 0.16]}>
                <planeGeometry args={[productWidth * 0.8, productHeight * 0.6]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            </>
          )}
        </group>
      )}

      <mesh position={[0, -productHeight / 2 - 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[productWidth * 1.2, productWidth * 0.6]} />
        <primitive object={reflectionMaterial} />
      </mesh>

      <pointLight position={[0, 0, 0.2]} intensity={0.5} distance={0.5} color="#ffffff" />
    </group>
  )
}

// Product3D Component for better side-facing products
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

    const loadTexture = async () => {
      try {
        const textureLoader = new THREE.TextureLoader()
        textureLoader.crossOrigin = "anonymous"

        const texturePromise = new Promise<THREE.Texture>((resolve, reject) => {
          textureLoader.load(
            product.image,
            (loadedTexture) => {
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

  const [baseX, baseY, baseZ] = position
  const [totalWidth, height, depth] = size

  const isLateralRotation = Math.abs(rotation[1]) === Math.PI / 2
  const scaleFactor = quantity > 1 ? 0.7 : 0.85
  const productWidth = isLateralRotation ? (depth / quantity) * scaleFactor : (totalWidth / quantity) * scaleFactor
  const spacing = productWidth * 0.1

  const productInstances = []

  for (let i = 0; i < quantity; i++) {
    const offset = (i - (quantity - 1) / 2) * (productWidth + spacing)
    const x = baseX + (isLateralRotation ? 0 : offset)
    const z = baseZ + (isLateralRotation ? offset : 0)

    const jitterX = (Math.random() - 0.5) * 0.002
    const jitterY = (Math.random() - 0.5) * 0.002
    const jitterZ = (Math.random() - 0.5) * 0.002

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
          <mesh castShadow receiveShadow position={[0, adjustedHeight / 2, 0]}>
            <planeGeometry args={[adjustedWidth, adjustedHeight]} />
            <meshBasicMaterial map={texture} transparent={true} side={THREE.DoubleSide} />
          </mesh>
        ) : (
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

  const sectionHeight = height / sections
  const slotWidth = width / slots

  return (
    <group position={[x, y, z]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
      <mesh position={[0, height / 2, -depth / 2]} castShadow receiveShadow>
        <boxGeometry args={[width, height, 0.05]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>

      <mesh position={[-width / 2 - 0.025, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.05, height, depth]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>

      {Array.from({ length: sections + 1 }).map((_, i) => (
        <mesh key={`shelf-${i}`} position={[0, i * sectionHeight, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, 0.03, depth]} />
          <meshStandardMaterial color={color || "#333333"} />
        </mesh>
      ))}

      {Object.entries(itemsBySection).map(([sectionIndex, items]) => {
        const sectionY = Number.parseInt(sectionIndex) * sectionHeight + sectionHeight / 2

        return items.map((item) => {
          const product = products.find((p) => p.primary_id === item.productId)
          if (!product) return null

          const itemX = isRTL
            ? (slots - 1 - item.position - slots / 2 + 0.5) * slotWidth
            : (item.position - slots / 2 + 0.5) * slotWidth

          const name = product.name?.toLowerCase() || ""
          const isBottom =
            name.includes("pantalon") || name.includes("jean") || name.includes("short") || name.includes("jupe")

          const quantity = item.quantity || 1
          const adjustedY = sectionY - sectionHeight * 0.2

          if (isBottom) {
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

  const sectionSpacing = height / sections
  const slotWidth = width / slots

  return (
    <group position={[x, y, z]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
      <mesh position={[0, 0.025, 0]} castShadow receiveShadow>
        <boxGeometry args={[width * 0.8, 0.05, depth * 0.8]} />
        <meshStandardMaterial color="#444444" />
      </mesh>

      <mesh position={[-width / 2 + 0.05, height / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.03, 0.03, height, 8]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      <mesh position={[width / 2 - 0.05, height / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.03, 0.03, height, 8]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

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

      {Object.entries(itemsBySection).map(([sectionIndex, items]) => {
        const sectionY = (Number.parseInt(sectionIndex) + 1) * sectionSpacing

        return items.map((item) => {
          const product = products.find((p) => p.primary_id === item.productId)
          if (!product) return null

          const itemX = isRTL
            ? (slots - 1 - item.position - slots / 2 + 0.5) * slotWidth
            : (item.position - slots / 2 + 0.5) * slotWidth

          const name = product.name?.toLowerCase() || ""
          const isBottom =
            name.includes("pantalon") || name.includes("jean") || name.includes("short") || name.includes("jupe")

          const quantity = item.quantity || 1

          if (isBottom) {
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

  const sectionHeight = height / sections
  const slotWidth = width / slots

  return (
    <group position={[x, y, z]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
      <mesh position={[0, 0.025, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, 0.05, depth]} />
        <meshStandardMaterial color="#444444" />
      </mesh>

      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.05, 0.05, height, 8]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {Array.from({ length: sections }).map((_, i) => (
        <mesh key={`arm-${i}`} position={[0, (i + 1) * sectionHeight, 0]} rotation={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, 0.03, 0.03]} />
          <meshStandardMaterial color={color || "#666666"} />
        </mesh>
      ))}

      {Object.entries(itemsBySection).map(([sectionIndex, items]) => {
        const sectionY = (Number.parseInt(sectionIndex) + 1) * sectionHeight

        return items.map((item) => {
          const product = products.find((p) => p.primary_id === item.productId)
          if (!product) return null

          const itemX = isRTL
            ? (slots - 1 - item.position - slots / 2 + 0.5) * slotWidth
            : (item.position - slots / 2 + 0.5) * slotWidth

          const quantity = item.quantity || 1

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

  const cubeSize = Math.min(width, height) / sections
  const slotSize = cubeSize / slots

  return (
    <group position={[x, y, z]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={color || "#8B4513"} transparent opacity={0.1} />
      </mesh>

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

      {Object.entries(itemsBySection).map(([sectionIndex, items]) => {
        const sectionY = Number.parseInt(sectionIndex) * cubeSize + cubeSize / 2

        return items.map((item) => {
          const product = products.find((p) => p.primary_id === item.productId)
          if (!product) return null

          const row = Math.floor(item.position / slots)
          const col = item.position % slots

          const adjustedCol = isRTL ? slots - 1 - col : col

          const itemX = (adjustedCol - slots / 2 + 0.5) * slotSize
          const itemZ = (row - slots / 2 + 0.5) * slotSize

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

// Gondola Display Component
export const GondolaDisplay = ({ furniture, displayItems, products, onRemove }) => {
  const { width, height, depth, sections, slots, color, x, y, z, rotation } = furniture
  const materials = useMemo(() => createMaterials(), [])
  const itemsBySection = useMemo(() => groupItemsBySection(displayItems), [displayItems])
  const { i18n } = useTranslation()
  const isRTL = i18n.language === "ar"

  const sectionHeight = height / sections
  const slotWidth = width / slots

  const baseColor = "#333333"
  const structureColor = "#222222"
  const shelfColor = "#444444"
  const edgeColor = "#555555"

  const slotsPerFace = Math.floor(slots / 2)

  return (
    <group position={[x, y, z]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
      <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, 0.1, depth]} />
        <meshStandardMaterial color={baseColor} />
      </mesh>

      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, 0.05]} />
        <meshStandardMaterial color={structureColor} />
      </mesh>

      <mesh position={[-width / 2 + 0.025, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.05, height, depth]} />
        <meshStandardMaterial color={structureColor} />
      </mesh>

      <mesh position={[width / 2 - 0.025, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.05, height, depth]} />
        <meshStandardMaterial color={structureColor} />
      </mesh>

      {Array.from({ length: sections + 1 }).map((_, i) => {
        const shelfY = i * sectionHeight

        return (
          <group key={`shelf-group-${i}`}>
            <mesh position={[0, shelfY, depth / 2 - 0.1]} castShadow receiveShadow>
              <boxGeometry args={[width - 0.1, 0.03, depth / 2 - 0.1]} />
              <meshStandardMaterial color={shelfColor} />
            </mesh>

            <mesh position={[0, shelfY, -depth / 2 + 0.1]} castShadow receiveShadow>
              <boxGeometry args={[width - 0.1, 0.03, depth / 2 - 0.1]} />
              <meshStandardMaterial color={shelfColor} />
            </mesh>

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

      {Object.entries(itemsBySection).map(([sectionIndex, items]) => {
        const sectionY = Number.parseInt(sectionIndex) * sectionHeight + sectionHeight / 2

        return items.map((item) => {
          const product = products.find((p) => p.primary_id === item.productId)
          if (!product) return null

          const isFaceA = item.position < slotsPerFace

          let relativePosition = isFaceA ? item.position : item.position - slotsPerFace

          if (isRTL) {
            relativePosition = isFaceA ? slotsPerFace - 1 - relativePosition : slotsPerFace - 1 - relativePosition
          }

          const itemX = (relativePosition / slotsPerFace - 0.5) * width + width / slotsPerFace / 2

          const itemZ = isFaceA ? depth / 2 - 0.15 : -depth / 2 + 0.15

          const itemRotation = isFaceA ? [0, 0, 0] : [0, Math.PI, 0]

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

// Table Display Component
export const TableDisplay = ({ furniture, displayItems, products, onRemove }) => {
  const { width, height, depth, sections, slots, color, x, y, z, rotation } = furniture
  const materials = useMemo(() => createMaterials(), [])
  const itemsBySection = useMemo(() => groupItemsBySection(displayItems), [displayItems])
  const { i18n } = useTranslation()
  const isRTL = i18n.language === "ar"

  const slotWidth = width / slots
  const tableTopHeight = 0.05
  const legRadius = 0.04
  const tableColor = color || "#8B4513"
  const legColor = "#5D4037"

  return (
    <group position={[x, y, z]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
      <mesh position={[0, height - tableTopHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, tableTopHeight, depth]} />
        <meshStandardMaterial color={tableColor} roughness={0.7} metalness={0.1} />
      </mesh>

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

      <mesh position={[0, height / 4, 0]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
        <boxGeometry args={[Math.sqrt(width * width + depth * depth) * 0.7, 0.02, 0.02]} />
        <meshStandardMaterial color={legColor} />
      </mesh>

      <mesh position={[0, height / 4, 0]} rotation={[0, -Math.PI / 4, 0]} castShadow receiveShadow>
        <boxGeometry args={[Math.sqrt(width * width + depth * depth) * 0.7, 0.02, 0.02]} />
        <meshStandardMaterial color={legColor} />
      </mesh>

      {Object.entries(itemsBySection).map(([sectionIndex, items]) => {
        return items.map((item) => {
          const product = products.find((p) => p.primary_id === item.productId)
          if (!product) return null

          const row = Math.floor(item.position / slots)
          const col = item.position % slots

          const adjustedCol = isRTL ? slots - 1 - col : col

          const rowCount = Math.ceil(displayItems.length / slots)
          const rowSpacing = depth / (rowCount + 1)
          const colSpacing = width / (slots + 1)

          const itemX = (adjustedCol + 1) * colSpacing - width / 2
          const itemZ = (row + 1) * rowSpacing - depth / 2
          const itemY = height + 0.05

          const quantity = item.quantity || 1

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

// Refrigerator Display Component
export const RefrigeratorDisplay = ({ furniture, displayItems, products, onRemove }) => {
  const { width, height, depth, sections, slots, color, x, y, z, rotation } = furniture
  const materials = useMemo(() => createMaterials(), [])
  const itemsBySection = useMemo(() => groupItemsBySection(displayItems), [displayItems])
  const { i18n } = useTranslation()
  const isRTL = i18n.language === "ar"

  const numberOfDoors = 3
  const doorHeight = height / numberOfDoors
  const glassThickness = 0.1
  const frameColor = "#181818"
  const glassColor = "#a0d0f0"
  const interiorColor = "#404040"

  return (
    <group position={[x, y, z]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={frameColor} roughness={0.8} metalness={0.2} />
      </mesh>

      {Array.from({ length: numberOfDoors }).map((_, i) => {
        const doorY = height - i * doorHeight - doorHeight / 2

        return (
          <group key={`door-${i}`} position={[0, doorY, depth / 2 - glassThickness / 2]}>
            <mesh receiveShadow>
              <boxGeometry args={[width, doorHeight, glassThickness]} />
              <meshStandardMaterial color={frameColor} roughness={0.8} metalness={0.2} />
            </mesh>

            <mesh position={[0, 0, glassThickness / 2]}>
              <boxGeometry args={[width * 0.95, doorHeight * 0.95, 0.01]} />
              <meshPhysicalMaterial
                color="#ffffff"
                transparent={true}
                opacity={0.3}
                roughness={0.05}
                metalness={0.1}
                transmission={1}
                thickness={0.02}
                ior={1.5}
                reflectivity={1}
                clearcoat={1}
                clearcoatRoughness={0}
              />
            </mesh>
          </group>
        )
      })}

      <mesh position={[0, height / 2, -depth / 4]}>
        <boxGeometry args={[width * 0.9, height * 0.98, depth * 0.5]} />
        <meshStandardMaterial color={interiorColor} roughness={0.9} metalness={0.1} />
      </mesh>

      {Array.from({ length: sections }).map((_, i) => {
        const shelfY = (i + 1) * (height / (sections + 1))

        return (
          <mesh key={`shelf-${i}`} position={[0, shelfY, -depth / 4]} castShadow>
            <boxGeometry args={[width * 0.85, 0.02, depth * 0.4]} />
            <meshStandardMaterial color="#505050" roughness={0.7} metalness={0.3} />
          </mesh>
        )
      })}

      {Object.entries(itemsBySection).map(([sectionIndex, items]) => {
        const sectionY = (Number.parseInt(sectionIndex) + 1) * (height / (sections + 1))

        return items.map((item) => {
          const product = products.find((p) => p.primary_id === item.productId)
          if (!product) return null

          const itemX = (item.position - slots / 2 + 0.5) * (width / slots)

          return (
            <group key={item.id} position={[itemX, sectionY, -depth / 4 + 0.1]} rotation={[0, Math.PI, 0]}>
              <ProductDisplayComponent
                product={product}
                width={(width / slots) * 0.8}
                height={(height / (sections + 2)) * 0.8}
                depth={depth * 0.3}
                isRefrigerated={true}
              />
            </group>
          )
        })
      })}

      <pointLight position={[0, height * 0.9, -depth / 4]} intensity={2} distance={depth} color="#ffffff" />
      <pointLight position={[0, height * 0.5, -depth / 4]} intensity={1} distance={depth} color="#ffffff" />
    </group>
  )
}

// Fridge3D Component
export const Fridge3D = ({ furniture, displayItems, products, onRemove }) => {
  const { width, height, depth, sections, slots, color, x, y, z, rotation } = furniture
  const { i18n } = useTranslation()
  const isRTL = i18n.language === "ar"

  const sectionHeight = height / sections
  const slotWidth = width / slots

  const colors = {
    frame: "#4a4a4a",
    base: "#1a1a1a",
    stripe: "#fefefe",
    glass: "#e0f7fa",
    interior: "#fefefe",
    shelf: "#dcdcdc",
    accent: "#b3e5fc",
  }

  const materials = useMemo(
    () => ({
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
    }),
    [],
  )

  const itemsBySection = useMemo(() => {
    const grouped = {}
    displayItems.forEach((item) => {
      if (!grouped[item.section]) grouped[item.section] = []
      grouped[item.section].push(item)
    })
    return grouped
  }, [displayItems])

  return (
    <group position={[x, y, z]} rotation={[0, rotation, 0]}>
      <mesh position={[0, -height / 2, 0]} material={materials.base} castShadow receiveShadow>
        <boxGeometry args={[width, 0.1, depth]} />
      </mesh>

      <mesh position={[0, -height / 2 + 0.06, depth / 2 - 0.01]} material={materials.stripe}>
        <boxGeometry args={[width * 0.9, 0.02, 0.02]} />
      </mesh>

      {[-width / 2, 0, width / 2].map((xPos, i) => (
        <mesh key={`vertical-frame-${i}`} position={[xPos, 0, 0]} material={materials.frame}>
          <boxGeometry args={[0.03, height, 0.05]} />
        </mesh>
      ))}
      <mesh position={[0, height / 2, 0]} material={materials.frame}>
        <boxGeometry args={[width, 0.05, 0.05]} />
      </mesh>

      {[-width / 2, width / 2].map((xPos, i) => (
        <mesh key={`side-glass-${i}`} position={[xPos, 0, depth / 2 - 0.01]} material={materials.glass}>
          <boxGeometry args={[0.01, height - 0.1, depth]} />
        </mesh>
      ))}

      {[-width / 3, 0, width / 3].map((xPos, i) => (
        <mesh key={`door-${i}`} position={[xPos, 0, depth / 2 - 0.01]} material={materials.glass}>
          <boxGeometry args={[width / 3 - 0.03, height - 0.1, 0.01]} />
        </mesh>
      ))}

      <mesh position={[0, 0, depth / 2 - depth / 4]} material={materials.interior}>
        <boxGeometry args={[width - 0.1, height - 0.1, 0.1]} />
      </mesh>

      {[height / 2 - 0.05, -height / 2 + 0.1].map((yPos, i) => (
        <mesh key={`accent-${i}`} position={[0, yPos, depth / 2 - 0.05]} material={materials.accent}>
          <boxGeometry args={[width * 0.9, 0.01, 0.01]} />
        </mesh>
      ))}

      {Array.from({ length: sections }).map((_, i) => {
        const y = (i + 1) * sectionHeight - height / 2
        return (
          <mesh key={`shelf-${i}`} position={[0, y, depth / 2 - depth / 4]} material={materials.shelf}>
            <boxGeometry args={[width - 0.1, 0.02, depth / 2 - 0.1]} />
          </mesh>
        )
      })}

      {Object.entries(itemsBySection).map(([sectionIndex, items]) => {
        const sectionY = Number.parseInt(sectionIndex) * sectionHeight - height / 2 + sectionHeight / 2
        return items.map((item) => {
          const product = products.find((p) => p.primary_id === item.productId)
          if (!product) return null

          const itemX = isRTL
            ? (slots - 1 - item.position - slots / 2 + 0.5) * slotWidth
            : (item.position - slots / 2 + 0.5) * slotWidth

          const itemZ = depth / 2 - depth / 4 + 0.05

          return (
            <group
              key={`item-${item.id}`}
              position={[itemX, sectionY, itemZ]}
              onClick={(e) => {
                e.stopPropagation()
                onRemove(item)
              }}
            >
              <EnhancedRefrigeratedProductDisplay
                product={product}
                width={slotWidth * 0.8}
                height={sectionHeight * 0.7}
              />
            </group>
          )
        })
      })}

      <pointLight position={[0, height / 4, depth / 2 - 0.1]} intensity={1} distance={height / 2} castShadow />
      <pointLight position={[0, -height / 4, depth / 2 - 0.1]} intensity={1} distance={height / 2} castShadow />
      <ambientLight intensity={0.4} />
    </group>
  )
}

// SupermarketFridge Component
export const SupermarketFridge = ({
  furniture,
  displayItems = [],
  products = [],
  onRemove,
}: {
  furniture: any
  displayItems?: any[]
  products?: any[]
  onRemove: (id: string) => void
}) => {
  const {
    width = 1.5,
    height = 2,
    depth = 0.8,
    sections = 3,
    slots = 6,
    color = "#3a3a3a",
    x = 0,
    y = 0,
    z = 0,
    rotation = 0,
  } = furniture || {}

  const frameColor = color
  const glassOpacity = 0.2
  const shelfColor = "#f0f0f0"
  const backPanelColor = "#333333"
  const interiorColor = "#333333"
  const accentColor = "#a0d8ef"

  const sectionHeight = height / sections
  const slotWidth = width / slots

  const glassMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#ffffff",
        transparent: true,
        opacity: glassOpacity,
        roughness: 0.05,
        metalness: 0,
        clearcoat: 1,
        reflectivity: 0.8,
        transmission: 1,
        ior: 1.5,
      }),
    [glassOpacity],
  )

  const itemsBySection = useMemo(() => {
    const sectionsMap = Array(sections)
      .fill(null)
      .map(() => Array(slots).fill(null))

    displayItems.forEach((item) => {
      const sectionIndex = Math.min(Math.max(0, item.section || 0), sections - 1)
      const slotIndex = Math.min(Math.max(0, item.position || 0), slots - 1)

      if (!sectionsMap[sectionIndex]) {
        sectionsMap[sectionIndex] = []
      }
      sectionsMap[sectionIndex][slotIndex] = item
    })

    return sectionsMap
  }, [displayItems, sections, slots])

  return (
    <group position={[x, y, z]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[width, 0.2, depth]} />
        <meshStandardMaterial color={frameColor} metalness={0.6} roughness={0.2} />
      </mesh>

      <mesh position={[0, height / 2, -depth / 2 + 0.05]}>
        <boxGeometry args={[width, height, 0.1]} />
        <meshStandardMaterial color={backPanelColor} />
      </mesh>

      <mesh position={[-width / 2 + 0.05, height / 2, 0]}>
        <boxGeometry args={[0.1, height, depth]} />
        <meshStandardMaterial color={frameColor} />
      </mesh>
      <mesh position={[width / 2 - 0.05, height / 2, 0]}>
        <boxGeometry args={[0.1, height, depth]} />
        <meshStandardMaterial color={frameColor} />
      </mesh>

      <mesh position={[0, height, 0]}>
        <boxGeometry args={[width, 0.1, depth]} />
        <meshStandardMaterial color={frameColor} />
      </mesh>

      <mesh position={[0, height / 2, -depth / 2 + 0.15]}>
        <boxGeometry args={[width - 0.2, height - 0.2, 0.01]} />
        <meshStandardMaterial color={interiorColor} roughness={0.9} metalness={0.1} />
      </mesh>

      <mesh position={[0, 0.25, depth / 2 - 0.05]}>
        <boxGeometry args={[width - 0.1, 0.05, 0.01]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.2} />
      </mesh>

      {Array.from({ length: sections - 1 }).map((_, i) => {
        const yPos = (i + 1) * sectionHeight
        return (
          <mesh key={`shelf-${i}`} position={[0, yPos, 0]}>
            <boxGeometry args={[width - 0.2, 0.02, depth - 0.2]} />
            <meshStandardMaterial color={shelfColor} roughness={0.8} metalness={0.1} />
          </mesh>
        )
      })}

      {Array.from({ length: sections }).map((_, i) => {
        const yPos = i * sectionHeight + sectionHeight / 2
        return (
          <mesh key={`door-${i}`} position={[0, yPos, depth / 2 - 0.01]}>
            <boxGeometry args={[width - 0.1, sectionHeight - 0.1, 0.02]} />
            <meshStandardMaterial {...glassMaterial} />
          </mesh>
        )
      })}

      {itemsBySection.map((sectionItems, sectionIndex) => {
        return sectionItems.map((item, slotIndex) => {
          if (!item) return null

          const product = products.find((p) => p.primary_id === item.productId)
          if (!product) return null

          const sectionY = sectionIndex * sectionHeight + sectionHeight / 2
          const slotX = (slotIndex - slots / 2 + 0.5) * slotWidth
          const itemZ = depth / 4

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
          )
        })
      })}

      <group position={[0, 0.3, depth / 2 - 0.1]}>
        {Array.from({ length: 5 }).map((_, i) => (
          <mesh
            key={`mist-${i}`}
            position={[(Math.random() - 0.5) * width * 0.8, Math.random() * height * 0.9, (Math.random() - 0.5) * 0.2]}
            scale={[0.05 + Math.random() * 0.1, 0.05 + Math.random() * 0.1, 0.05 + Math.random() * 0.1]}
          >
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial color="#a0d8ef" transparent opacity={0.2 + Math.random() * 0.1} depthWrite={false} />
          </mesh>
        ))}
      </group>

      <pointLight position={[0, height - 0.1, 0]} intensity={1} color="#ffffff" distance={depth * 2} />
      <pointLight position={[0, height / 2, -depth / 3]} intensity={0.5} color="#a0d8ef" distance={depth * 1.5} />
    </group>
  )
}

// RefrigeratedShowcase Component
export const RefrigeratedShowcase = ({ furniture, displayItems, products, onRemove }) => {
  const { width, height, depth, sections, slots, color, x, y, z, rotation } = furniture
  const materials = useMemo(() => createMaterials(), [])
  const itemsBySection = useMemo(() => groupItemsBySection(displayItems), [displayItems])
  const { i18n } = useTranslation()
  const isRTL = i18n.language === "ar"

  const sectionHeight = height / sections
  const slotWidth = width / slots

  const showcaseColor = color || "#e0e0e0"
  const interiorColor = "#f8f8f8"
  const shelfColor = "#d0d0d0"
  const accentColor = "#a0d8ef"

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
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, 0.2, depth]} />
        <meshStandardMaterial color={showcaseColor} roughness={0.5} metalness={0.3} />
      </mesh>

      <mesh position={[0, height / 2, -depth / 2 + 0.05]} castShadow receiveShadow>
        <boxGeometry args={[width, height, 0.1]} />
        <meshStandardMaterial color={showcaseColor} roughness={0.5} metalness={0.3} />
      </mesh>

      <mesh position={[-width / 2 + 0.05, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.1, height, depth]} />
        <primitive object={glassMaterial} />
      </mesh>

      <mesh position={[width / 2 - 0.05, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.1, height, depth]} />
        <primitive object={glassMaterial} />
      </mesh>

      <mesh position={[0, height - 0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, 0.1, depth]} />
        <primitive object={glassMaterial} />
      </mesh>

      <mesh position={[0, height / 2, -depth / 2 + 0.15]} castShadow receiveShadow>
        <boxGeometry args={[width - 0.2, height - 0.2, 0.01]} />
        <meshStandardMaterial color={interiorColor} roughness={0.9} metalness={0.1} />
      </mesh>

      <mesh position={[0, 0.25, depth / 2 - 0.05]} castShadow receiveShadow>
        <boxGeometry args={[width - 0.1, 0.05, 0.01]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.2} />
      </mesh>

      {Array.from({ length: sections }).map((_, i) => {
        const shelfY = (i + 1) * sectionHeight

        return (
          <mesh key={`shelf-${i}`} position={[0, shelfY, 0]} castShadow receiveShadow>
            <boxGeometry args={[width - 0.3, 0.02, depth - 0.2]} />
            <meshStandardMaterial color={shelfColor} roughness={0.7} metalness={0.2} />
          </mesh>
        )
      })}

      {Object.entries(itemsBySection).map(([sectionIndex, items]) => {
        const sectionY = Number.parseInt(sectionIndex) * sectionHeight + sectionHeight / 2

        return items.map((item) => {
          const product = products.find((p) => p.primary_id === item.productId)
          if (!product) return null

          const itemX = isRTL
            ? (slots - 1 - item.position - slots / 2 + 0.5) * slotWidth
            : (item.position - slots / 2 + 0.5) * slotWidth

          const itemZ = depth / 4

          const quantity = item.quantity || 1

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

      <pointLight position={[0, height - 0.2, 0]} intensity={0.4} distance={depth} color="#ffffff" />
      <pointLight position={[0, height / 2, -depth / 3]} intensity={0.3} distance={depth} color="#a0d8ef" />
    </group>
  )
}

// ClothingDisplay Component
export const ClothingDisplay = ({ furniture, displayItems, products, onRemove }) => {
  const { width, height, depth, sections = 3, slots = 6, color, x, y, z, rotation } = furniture
  const materials = useMemo(() => createMaterials(), [])
  const itemsBySection = useMemo(() => groupItemsBySection(displayItems), [displayItems])
  const { i18n } = useTranslation()
  const isRTL = i18n.language === "ar"

  const sectionHeight = height / sections
  const slotWidth = width / slots

  const frameColor = "#333333"
  const wallColor = "#f5f5f5"
  const shelfColor = "#e0e0e0"
  const railColor = "#9e9e9e"

  return (
    <group position={[x, y, z]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
      <mesh position={[0, height / 2, -depth / 2 + 0.01]} castShadow receiveShadow>
        <boxGeometry args={[width, height, 0.05]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} metalness={0.1} />
      </mesh>

      {[-width / 2, width / 2].map((xPos, i) => (
        <mesh key={`vertical-frame-${i}`} position={[xPos, height / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.05, height, depth]} />
          <meshStandardMaterial color={frameColor} roughness={0.5} metalness={0.3} />
        </mesh>
      ))}

      {Array.from({ length: sections + 1 }).map((_, i) => (
        <mesh key={`horizontal-divider-${i}`} position={[0, i * sectionHeight, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, 0.05, depth]} />
          <meshStandardMaterial color={frameColor} roughness={0.5} metalness={0.3} />
        </mesh>
      ))}

      {Array.from({ length: slots - 1 }).map((_, i) => {
        const xPos = -width / 2 + (i + 1) * (width / slots)
        return (
          <mesh key={`vertical-divider-${i}`} position={[xPos, height / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.03, height, 0.03]} />
            <meshStandardMaterial color={frameColor} roughness={0.5} metalness={0.3} />
          </mesh>
        )
      })}

      {Array.from({ length: sections }).map((_, sectionIndex) => {
        const sectionY = sectionIndex * sectionHeight + sectionHeight / 2
        const sectionType = sectionIndex % 3

        if (sectionType === 0) {
          return (
            <group key={`section-${sectionIndex}`}>
              <mesh
                position={[0, sectionY + sectionHeight * 0.3, depth / 4]}
                rotation={[0, 0, Math.PI / 2]}
                castShadow
                receiveShadow
              >
                <cylinderGeometry args={[0.015, 0.015, width - 0.1, 8]} />
                <meshStandardMaterial color={railColor} roughness={0.3} metalness={0.7} />
              </mesh>

              {itemsBySection[sectionIndex]?.map((item) => {
                const product = products.find((p) => p.primary_id === item.productId)
                if (!product) return null

                const itemX = isRTL
                  ? (slots - 1 - item.position - slots / 2 + 0.5) * slotWidth
                  : (item.position - slots / 2 + 0.5) * slotWidth

                const quantity = item.quantity || 1

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
          return (
            <group key={`section-${sectionIndex}`}>
              <mesh
                position={[0, sectionY + sectionHeight * 0.3, depth / 4]}
                rotation={[0, 0, Math.PI / 2]}
                castShadow
                receiveShadow
              >
                <cylinderGeometry args={[0.015, 0.015, width - 0.1, 8]} />
                <meshStandardMaterial color={railColor} roughness={0.3} metalness={0.7} />
              </mesh>

              {itemsBySection[sectionIndex]?.map((item) => {
                const product = products.find((p) => p.primary_id === item.productId)
                if (!product) return null

                const itemX = isRTL
                  ? (slots - 1 - item.position - slots / 2 + 0.5) * slotWidth
                  : (item.position - slots / 2 + 0.5) * slotWidth

                const quantity = item.quantity || 1

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
          return (
            <group key={`section-${sectionIndex}`}>
              <mesh position={[0, sectionY, depth / 4]} castShadow receiveShadow>
                <boxGeometry args={[width - 0.1, 0.03, depth / 2]} />
                <meshStandardMaterial color={shelfColor} roughness={0.7} metalness={0.2} />
              </mesh>

              {itemsBySection[sectionIndex]?.map((item) => {
                const product = products.find((p) => p.primary_id === item.productId)
                if (!product) return null

                const itemX = isRTL
                  ? (slots - 1 - item.position - slots / 2 + 0.5) * slotWidth
                  : (item.position - slots / 2 + 0.5) * slotWidth

                const quantity = item.quantity || 1

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

              {!itemsBySection[sectionIndex] && (
                <group position={[width / 4, sectionY + 0.1, depth / 4]}>
                  <MannequinComponent height={sectionHeight * 0.8} />
                </group>
              )}
            </group>
          )
        }
      })}

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

// ClothingWallDisplay Component
export const ClothingWallDisplay = ({ furniture, displayItems, products, onRemove }) => {
  const { width, height, depth, sections = 4, slots = 6, color, x, y, z, rotation } = furniture
  const materials = useMemo(() => createMaterials(), [])
  const itemsBySection = useMemo(() => groupItemsBySection(displayItems), [displayItems])
  const { i18n } = useTranslation()
  const isRTL = i18n.language === "ar"

  const sectionHeight = height / sections
  const slotWidth = width / slots

  const wallColor = "#f5f5f5"
  const shelfColor = "#5D4037"
  const railColor = "#9e9e9e"
  const accentColor = "#303f9f"

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
      <mesh position={[0, height / 2, -depth / 2 + 0.01]} castShadow receiveShadow>
        <boxGeometry args={[width, height, 0.05]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} metalness={0.1} />
      </mesh>

      <mesh position={[-width / 2 + width / 8, height / 2, -depth / 2 + 0.02]} castShadow receiveShadow>
        <boxGeometry args={[width / 4, height, 0.03]} />
        <meshStandardMaterial color={accentColor} roughness={0.8} metalness={0.2} />
      </mesh>

      {[-1, 1 / 3, 2 / 3, 1].map((pos, i) => (
        <mesh key={`support-${i}`} position={[pos * width - width / 2, height / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.05, height, depth / 2]} />
          <meshStandardMaterial color={shelfColor} roughness={0.7} metalness={0.1} />
        </mesh>
      ))}

      {Array.from({ length: sections + 1 }).map((_, i) => (
        <mesh key={`shelf-${i}`} position={[0, i * sectionHeight, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, 0.04, depth / 2]} />
          <meshStandardMaterial color={shelfColor} roughness={0.7} metalness={0.1} />
        </mesh>
      ))}

      <mesh position={[0, -0.025, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, 0.08, depth]} />
        <meshStandardMaterial color={shelfColor} roughness={0.7} metalness={0.1} />
      </mesh>

      {Object.entries(itemsBySection).map(([sectionIndex, items]) => {
        const sectionY = Number.parseInt(sectionIndex) * sectionHeight + sectionHeight / 2

        return items.map((item) => {
          const product = products.find((p) => p.primary_id === item.productId)
          if (!product) {
            console.warn("Product not found:", item.productId)
            return null
          }

          const itemX = isRTL
            ? (slots - 1 - item.position - slots / 2 + 0.5) * slotWidth
            : (item.position - slots / 2 + 0.5) * slotWidth

          const quantity = item.quantity || 1

          const name = product.name?.toLowerCase() || ""
          const isShirt = name.includes("shirt") || name.includes("tee") || name.includes("top")
          const isPants = name.includes("pant") || name.includes("jean") || name.includes("trouser")
          const isJacket = name.includes("jacket") || name.includes("coat")
          const isHanging = isPants || isJacket || isShirt

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

      <mesh position={[0, -0.025, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width * 1.5, depth * 1.5]} />
        <meshStandardMaterial color="#a1887f" roughness={0.8} metalness={0.1} />
      </mesh>

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

// CashierDisplay Component
export const CashierDisplay = ({ furniture, displayItems, products, onRemove }) => {
  const { width, height, depth, sections, slots, color, x, y, z, rotation } = furniture
  const { i18n } = useTranslation()
  const isRTL = i18n.language === "ar"

  const counterHeight = height * 0.8
  const registerHeight = height * 0.2
  const counterDepth = depth * 0.8

  const counterColor = color || "#D2691E"
  const registerColor = "#444444"
  const screenColor = "#222222"
  const keypadColor = "#666666"

  return (
    <group position={[x, y, z]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
      <mesh position={[0, counterHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, counterHeight, counterDepth]} />
        <meshStandardMaterial color={counterColor} roughness={0.7} metalness={0.2} />
      </mesh>

      <mesh position={[0, counterHeight + 0.02, 0]} castShadow receiveShadow>
        <boxGeometry args={[width + 0.1, 0.04, counterDepth + 0.1]} />
        <meshStandardMaterial color={adjustColorFn(counterColor, 20)} roughness={0.5} metalness={0.3} />
      </mesh>

      <mesh
        position={[width / 4, counterHeight + registerHeight / 2 + 0.04, -counterDepth / 4]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[width / 2, registerHeight, depth / 2]} />
        <meshStandardMaterial color={registerColor} roughness={0.5} metalness={0.5} />
      </mesh>

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

      <mesh position={[width / 4, counterHeight + 0.06, -counterDepth / 3]} castShadow receiveShadow>
        <boxGeometry args={[width / 4, 0.02, depth / 5]} />
        <meshStandardMaterial color={keypadColor} roughness={0.4} metalness={0.6} />
      </mesh>

      <mesh position={[width / 4, counterHeight - 0.15, -counterDepth / 2 + 0.05]} castShadow receiveShadow>
        <boxGeometry args={[width / 2, 0.1, 0.05]} />
        <meshStandardMaterial color={adjustColorFn(registerColor, 20)} roughness={0.5} metalness={0.5} />
      </mesh>

      <mesh
        position={[width / 4 + width / 6, counterHeight + registerHeight / 2 + 0.04, -counterDepth / 4]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.05, 0.05, 0.1, 16]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.9} metalness={0.1} />
      </mesh>

      <mesh position={[-width / 3, counterHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width / 3, counterHeight, counterDepth]} />
        <meshStandardMaterial color={counterColor} roughness={0.7} metalness={0.2} />
      </mesh>

      <mesh position={[-width / 3, counterHeight + 0.02, 0]} castShadow receiveShadow>
        <boxGeometry args={[width / 3 + 0.05, 0.04, counterDepth + 0.05]} />
        <meshStandardMaterial color={adjustColorFn(counterColor, 20)} roughness={0.5} metalness={0.3} />
      </mesh>

      <group position={[width / 3, counterHeight + 0.1, counterDepth / 3]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.3, 0.1, 0.2]} />
          <meshStandardMaterial color="#FF6B6B" roughness={0.7} metalness={0.2} />
        </mesh>
      </group>

      {displayItems &&
        displayItems.map((item, index) => {
          const product = products.find((p) => p.primary_id === item.productId)
          if (!product) return null

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

  const effectiveConfig = {
    rows: shelvesConfig?.rows || sections,
    frontBackColumns: shelvesConfig?.frontBackColumns || 6,
    leftRightColumns: shelvesConfig?.leftRightColumns || 1,
  }

  const shelfSpacing = height / effectiveConfig.rows
  const shelfThickness = 0.05
  const baseHeight = 0.3

  const baseColor = "#f5f5f5"
  const shelfColor = "#ffffff"
  const metalColor = "#e0e0e0"
  const backPanelColor = "#f8f8f8"
  const leftSideColor = "#f0f0f0"
  const rightSideColor = "#e8e8e8"

  const slotWidthFrontBack = width / effectiveConfig.frontBackColumns
  const slotWidthSides = depth / effectiveConfig.leftRightColumns

  return (
    <group position={[x, y, z]} rotation={[0, (rotation * Math.PI) / 180, 0]}>
      <mesh position={[0, baseHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, baseHeight, depth]} />
        <meshStandardMaterial color={baseColor} roughness={0.7} metalness={0.2} />
      </mesh>

      <group>
        <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, height, 0.05]} />
          <meshStandardMaterial color={backPanelColor} roughness={0.6} metalness={0.1} />
        </mesh>

        <mesh position={[-width / 2 + 0.025, height / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.05, height, depth]} />
          <meshStandardMaterial color={leftSideColor} roughness={0.6} metalness={0.1} />
        </mesh>

        <mesh position={[width / 2 - 0.025, height / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.05, height, depth]} />
          <meshStandardMaterial color={rightSideColor} roughness={0.6} metalness={0.1} />
        </mesh>

        {Array.from({ length: effectiveConfig.rows }).map((_, rowIndex) => {
          const shelfY = (rowIndex + 1) * shelfSpacing

          return (
            <group key={`shelf-${rowIndex}`}>
              <mesh position={[0, shelfY, depth / 2 - 0.05]} castShadow receiveShadow>
                <boxGeometry args={[width - 0.1, shelfThickness, 0.6]} />
                <meshStandardMaterial color={shelfColor} roughness={0.5} metalness={0.1} />
              </mesh>

              <mesh position={[0, shelfY, -depth / 2 + 0.05]} castShadow receiveShadow>
                <boxGeometry args={[width - 0.1, shelfThickness, 0.6]} />
                <meshStandardMaterial color={shelfColor} roughness={0.5} metalness={0.1} />
              </mesh>

              <mesh position={[-width / 2 - 0.1, shelfY, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[depth - 0.1, shelfThickness, 0.8]} />
                <meshStandardMaterial color={shelfColor} roughness={0.5} metalness={0.1} />
              </mesh>

              <mesh position={[width / 2, shelfY, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[depth - 0.1, shelfThickness, 1.2]} />
                <meshStandardMaterial color={shelfColor} roughness={0.5} metalness={0.1} />
              </mesh>

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

      {Object.entries(itemsBySection).map(([sectionIndex, items]) => {
        const sectionY = Number(sectionIndex) * shelfSpacing + shelfSpacing / 2 + shelfThickness / 2

        return items.map((item) => {
          const product = products.find((p) => p.primary_id === item.productId)
          if (!product) return null

          const quantity = Math.max(1, item.quantity || 1)

          let side, relativePosition, itemX, itemZ, itemRotation

          const totalColumns = effectiveConfig.leftRightColumns * 2 + effectiveConfig.frontBackColumns * 2

          const leftLimit = effectiveConfig.leftRightColumns
          const frontLimit = leftLimit + effectiveConfig.frontBackColumns
          const backLimit = frontLimit + effectiveConfig.frontBackColumns

          if (item.position < leftLimit) {
            side = "left"
            relativePosition = item.position
            itemX = -width / 2 - 0.1
            itemZ = -depth / 4 + (relativePosition * depth) / (effectiveConfig.leftRightColumns * 2)
            itemRotation = [0, Math.PI / 2, 0]
          } else if (item.position < frontLimit) {
            side = "front"
            relativePosition = item.position - leftLimit
            itemX = -width / 2 + (relativePosition + 0.5) * slotWidthFrontBack
            itemZ = depth / 2 - 0.2
            itemRotation = [0, 0, 0]
          } else if (item.position < backLimit) {
            side = "back"
            relativePosition = item.position - frontLimit
            itemX = -width / 2 + (relativePosition + 0.5) * slotWidthFrontBack
            itemZ = -depth / 2 + 0.2
            itemRotation = [0, Math.PI, 0]
          } else {
            side = "right"
            relativePosition = item.position - backLimit
            itemX = width / 2
            itemZ = depth / 4 - (relativePosition * depth) / (effectiveConfig.leftRightColumns * 2)
            itemRotation = [0, Math.PI / 2, 0]
          }

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
export const PlanogramDisplay = ({ furniture, displayItems, products, onRemove }) => {
  const { width, height, depth, sections = 4, slots, color, x, y, z, rotation } = furniture
  const materials = useMemo(() => createMaterials(), [])
  const itemsBySection = useMemo(() => groupItemsBySection(displayItems), [displayItems])
  const { i18n } = useTranslation()
  const isRTL = i18n.language === "ar"

  const shelfThickness = 0.03
  const sideThickness = 0.05
  const backThickness = 0.02

  const frameColor = color || "#a0a0a0"
  const shelfColor = "#d0d0d0"
  const backColor = "#c0c0c0"

  const shelfSpacing = height / sections

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
      <mesh position={[0, height / 2, -depth / 2 + backThickness / 2]} castShadow receiveShadow>
        <boxGeometry args={[width, height, backThickness]} />
        <meshStandardMaterial color={backColor} roughness={0.8} metalness={0.1} />
      </mesh>

      <mesh position={[-width / 2 + sideThickness / 2, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[sideThickness, height, depth]} />
        <meshStandardMaterial color={frameColor} roughness={0.6} metalness={0.2} />
      </mesh>

      <mesh position={[width / 2 - sideThickness / 2, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[sideThickness, height, depth]} />
        <meshStandardMaterial color={frameColor} roughness={0.6} metalness={0.2} />
      </mesh>

      <mesh position={[0, height - shelfThickness / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, shelfThickness, depth]} />
        <meshStandardMaterial color={frameColor} roughness={0.6} metalness={0.2} />
      </mesh>

      {Array.from({ length: sections - 1 }).map((_, i) => {
        const shelfY = (i + 1) * shelfSpacing

        return (
          <mesh key={`shelf-${i}`} position={[0, shelfY, 0]} castShadow receiveShadow>
            <boxGeometry args={[width - sideThickness * 0.5, shelfThickness, depth]} />
            <meshStandardMaterial color={shelfColor} roughness={0.4} metalness={0.3} />
          </mesh>
        )
      })}

      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, shelfThickness, depth]} />
        <meshStandardMaterial color={shelfColor} roughness={0.4} metalness={0.3} />
      </mesh>

      {Object.entries(itemsBySection).map(([sectionIndex, items]) => {
        const sectionY = Number(sectionIndex) * shelfSpacing + shelfSpacing / 2 + shelfThickness / 2 + 0.15

        return items.map((item) => {
          const product = products.find((p) => p.primary_id === item.productId)
          if (!product) return null

          const totalSlots = slots || 10
          const slotPosition = isRTL ? totalSlots - 1 - item.position : item.position
          const itemX = (slotPosition + 0.5) * (width / totalSlots) - width / 2

          const quantity = item.quantity || 1

          const productWidth = (width / totalSlots) * 0.9
          const productHeight = shelfSpacing * 0.7

          if (quantity > 1) {
            const spacing = productWidth * 0.8

            return (
              <group key={item.id} position={[itemX, sectionY, depth / 4]}>
                {Array.from({ length: quantity }).map((_, index) => {
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
  let r = Number.parseInt(color.substring(1, 3), 16)
  let g = Number.parseInt(color.substring(3, 5), 16)
  let b = Number.parseInt(color.substring(5, 7), 16)

  r = Math.max(0, Math.min(255, r + amount))
  g = Math.max(0, Math.min(255, g + amount))
  b = Math.max(0, Math.min(255, b + amount))

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
}

// Export all components
export { adjustColorFn as adjustColor }