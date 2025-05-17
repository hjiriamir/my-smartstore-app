"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import * as THREE from "three"

interface PlanogramCell {
  id: string
  productId: string | null
  instanceId: string | null
  x: number
  y: number
  furnitureType: string
  quantity?: number
}

interface Product {
  primary_Id: string
  name: string
  image?: string
  color?: string
  [key: string]: any
}

interface PlanogramConfig {
  id?: string
  name: string
  rows: number
  columns: number
  cellWidth: number
  cellHeight: number
  furnitureType: string
  displayMode: "compact" | "spaced"
  furnitureDimensions: {
    width: number
    height: number
    depth: number
    baseHeight: number
    shelfThickness: number
  }
}

interface PlanogramViewer3DProps {
  config: PlanogramConfig | null
  cells: PlanogramCell[]
  products: Product[]
  shelfHeight: number
}

// Créer une texture à partir d'une URL d'image
const createTextureFromImage = (imageUrl: string, product: Product): Promise<THREE.Texture> => {
  return new Promise((resolve, reject) => {
    const loader = new THREE.TextureLoader()
    loader.crossOrigin = "anonymous"
    loader.load(
      imageUrl,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace
        texture.anisotropy = 8 // Augmenter l'anisotropie pour une meilleure qualité
        texture.minFilter = THREE.LinearMipMapLinearFilter
        texture.magFilter = THREE.LinearFilter
        resolve(texture)
      },
      undefined,
      (error) => {
        console.error("Error loading texture:", error)
        // Créer une texture de secours avec la couleur du produit et le nom
        const canvas = document.createElement("canvas")
        canvas.width = 256
        canvas.height = 256
        const ctx = canvas.getContext("2d")!

        // Fond avec la couleur du produit
        ctx.fillStyle = product.color || "#3b82f6"
        ctx.fillRect(0, 0, 256, 256)

        // Bordure
        ctx.strokeStyle = "white"
        ctx.lineWidth = 8
        ctx.strokeRect(10, 10, 236, 236)

        // Texte avec le nom du produit
        ctx.fillStyle = "white"
        ctx.font = "bold 32px Arial"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"

        // Diviser le nom en lignes si nécessaire
        const name = product.name || product.primary_Id || "Produit"
        const words = name.split(" ")
        const lines = []
        let currentLine = words[0]

        for (let i = 1; i < words.length; i++) {
          if (currentLine.length + words[i].length + 1 <= 15) {
            currentLine += " " + words[i]
          } else {
            lines.push(currentLine)
            currentLine = words[i]
          }
        }
        lines.push(currentLine)

        // Afficher chaque ligne
        lines.forEach((line, index) => {
          const yPos = 128 - (lines.length - 1) * 20 + index * 40
          ctx.fillText(line, 128, yPos)
        })

        const defaultTexture = new THREE.CanvasTexture(canvas)
        defaultTexture.anisotropy = 4
        resolve(defaultTexture)
      },
    )
  })
}

// Composant Product amélioré pour afficher les images réelles
const Product = ({
  position,
  size,
  product,
  cellSize,
}: {
  position: [number, number, number]
  size: [number, number, number]
  product: Product
  cellSize: [number, number, number]
}) => {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)
  const meshRef = useRef<THREE.Group>(null)

  useEffect(() => {
    if (product?.image) {
      createTextureFromImage(product.image, product)
        .then((tex) => {
          tex.anisotropy = 4
          tex.minFilter = THREE.LinearFilter
          tex.magFilter = THREE.LinearFilter
          setTexture(tex)
        })
        .catch(console.error)
    }
  }, [product.primary_Id, product.image, product])

  // Calculer les dimensions pour un affichage plus réaliste
  const productHeight = size[1] * 0.9 // 90% de la hauteur de la cellule
  const productWidth = size[0] * 0.8 // 80% de la largeur de la cellule
  const productDepth = size[2] * 0.7 // 70% de la profondeur de l'étagère

  return (
    <group ref={meshRef} position={position}>
      {/* Conteneur principal */}
      <group position={[0, productHeight / 2, 0]}>
        {texture ? (
          // Utiliser une texture plane avec l'image du produit sur les deux faces
          <>
            {/* Face avant avec l'image du produit */}
            <mesh position={[0, 0, productDepth / 2]}>
              <planeGeometry args={[productWidth, productHeight]} />
              <meshBasicMaterial map={texture} transparent side={THREE.FrontSide} />
            </mesh>

            {/* Face arrière avec l'image du produit */}
            <mesh position={[0, 0, -productDepth / 2]}>
              <planeGeometry args={[productWidth, productHeight]} />
              <meshBasicMaterial map={texture} transparent side={THREE.BackSide} />
            </mesh>

            {/* Faces latérales avec couleur semi-transparente */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[productWidth, productHeight, productDepth]} />
              <meshStandardMaterial
                color={product.color || "#ffffff"}
                transparent
                opacity={0.2}
                side={THREE.DoubleSide}
              />
            </mesh>
          </>
        ) : (
          // Fallback pour les produits sans image
          <mesh>
            <boxGeometry args={[productWidth, productHeight, productDepth]} />
            <meshStandardMaterial color={product.color || "#3b82f6"} transparent opacity={0.8} />
          </mesh>
        )}

        {/* Nom du produit en dessous */}
        <Text
          position={[0, -productHeight / 2 - 0.05, 0]}
          fontSize={0.08}
          color="black"
          anchorX="center"
          anchorY="top"
          maxWidth={cellSize[0] * 0.9}
        >
          {product.name.length > 10 ? `${product.name.substring(0, 10)}...` : product.name}
        </Text>
      </group>
    </group>
  )
}

// Composant pour une étagère colorée
const ColoredShelf = ({
  position,
  size,
  color,
  sectionIndex,
  totalSections,
}: {
  position: [number, number, number]
  size: [number, number, number]
  color: string
  sectionIndex: number
  totalSections: number
}) => {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

// Composant pour le cadre de l'étagère
const ShelfFrame = ({
  position,
  size,
  color = "#ffffff",
}: {
  position: [number, number, number]
  size: [number, number, number]
  color?: string
}) => {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

// Composant principal pour la scène 3D
const PlanogramScene = ({
  config,
  cells,
  products,
  shelfHeight,
}: {
  config: PlanogramConfig
  cells: PlanogramCell[]
  products: Product[]
  shelfHeight: number
}) => {
  const { camera } = useThree()

  useEffect(() => {
    // Positionner la caméra pour voir l'ensemble du planogramme
    const width = config.columns
    const height = config.rows
    const distance = Math.max(width, height) * 1.5
    camera.position.set(width / 2, height / 2, distance)
    camera.lookAt(width / 2, height / 2, 0)
  }, [camera, config])

  // Dimensions
  const shelfThickness = 0.05
  const shelfDepth = 0.6
  const cellWidth = 1
  const cellHeight = 1
  const productSize: [number, number, number] = [0.8, 0.8, 0.1]
  const cellSize: [number, number, number] = [cellWidth, cellHeight, shelfDepth]

  // Couleurs des sections d'étagères (comme dans l'image)
  const sectionColors = ["#f9d423", "#00b4db", "#ff7e5f"]
  const numSections = 3
  const columnsPerSection = Math.ceil(config.columns / numSections)

  return (
    <>
      {/* Éclairage amélioré */}
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[10, 10, 10]}
        intensity={1.0}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight position={[-10, 10, 5]} intensity={0.6} />
      <directionalLight position={[0, -10, 5]} intensity={0.2} />
      <pointLight position={[config.columns / 2, config.rows / 2, 2]} intensity={0.5} color="#fff" />

      {/* Mur de fond */}
      <mesh position={[config.columns / 2 - 0.5, config.rows / 2, -0.1]}>
        <planeGeometry args={[config.columns + 4, config.rows + 4]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>

      {/* Structure du planogramme */}
      <group position={[0, 0, 0]}>
        {/* Base du planogramme (socle blanc) */}
        <ShelfFrame
          position={[config.columns / 2 - 0.5, -0.25, shelfDepth / 2]}
          size={[config.columns, 0.5, shelfDepth + 0.1]}
          color="#ffffff"
        />

        {/* Montants verticaux blancs */}
        <ShelfFrame
          position={[-0.5 - shelfThickness / 2, config.rows / 2, shelfDepth / 2]}
          size={[shelfThickness * 2, config.rows + 0.5, shelfDepth]}
          color="#ffffff"
        />
        <ShelfFrame
          position={[config.columns - 0.5 + shelfThickness / 2, config.rows / 2, shelfDepth / 2]}
          size={[shelfThickness * 2, config.rows + 0.5, shelfDepth]}
          color="#ffffff"
        />

        {/* Étagères colorées par sections */}
        {Array.from({ length: config.rows }).map((_, rowIndex) => {
          return sectionColors.map((color, sectionIndex) => {
            const sectionWidth = columnsPerSection
            const startX = sectionIndex * columnsPerSection
            const adjustedWidth = Math.min(sectionWidth, config.columns - startX)

            if (adjustedWidth <= 0) return null

            return (
              <ColoredShelf
                key={`shelf-${rowIndex}-${sectionIndex}`}
                position={[startX + adjustedWidth / 2 - 0.5, rowIndex + shelfThickness / 2, shelfDepth / 2]}
                size={[adjustedWidth, shelfThickness, shelfDepth]}
                color={color}
                sectionIndex={sectionIndex}
                totalSections={numSections}
              />
            )
          })
        })}

        {/* Séparateurs verticaux entre les sections (blancs) */}
        {Array.from({ length: numSections - 1 }).map((_, index) => {
          const xPos = (index + 1) * columnsPerSection - 0.5
          return (
            <ShelfFrame
              key={`divider-${index}`}
              position={[xPos, config.rows / 2, shelfDepth / 2]}
              size={[shelfThickness, config.rows, shelfDepth]}
              color="#ffffff"
            />
          )
        })}

        {/* Produits */}
        {cells
          .filter((cell) => cell.productId)
          .map((cell) => {
            const product = products.find((p) => p.primary_Id === cell.productId)
            if (!product) return null

            // Important: Adjust the position to match the 2D view coordinates
            // In the 2D view, coordinates start from 1,1 at the top-right and increase to the left and down
            // We need to transform these coordinates for the 3D view
            const adjustedX = config.columns - 1 - cell.x
            const adjustedY = config.rows - 1 - cell.y

            return (
              <Product
                key={cell.id}
                position={[adjustedX, adjustedY + shelfThickness, shelfDepth / 2]}
                size={productSize}
                product={product}
                cellSize={cellSize}
              />
            )
          })}
      </group>

      {/* Contrôles améliorés */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={20}
        autoRotate={false}
        autoRotateSpeed={0.5}
        enableDamping={true}
        dampingFactor={0.1}
      />
    </>
  )
}

// Composant d'exportation
const PlanogramViewer3D: React.FC<PlanogramViewer3DProps> = ({ config, cells, products, shelfHeight }) => {
  if (!config || cells.length === 0) {
    return <div className="flex items-center justify-center h-full">Aucune donnée disponible</div>
  }

  return (
    <Canvas shadows camera={{ position: [0, 0, 10], fov: 45 }}>
      <color attach="background" args={["#f8f9fa"]} />
      <fog attach="fog" args={["#f8f9fa", 15, 25]} />
      <PlanogramScene config={config} cells={cells} products={products} shelfHeight={shelfHeight} />
    </Canvas>
  )
}

export default PlanogramViewer3D
