"use client"

import { useState, useEffect, Suspense, useRef } from "react"
import { useDrop } from "react-dnd"
import { Canvas, useThree } from "@react-three/fiber"
import { OrbitControls, Html, useTexture, Environment, ContactShadows } from "@react-three/drei"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Map } from "lucide-react"
import { useTranslation } from "react-i18next"
import * as THREE from "three"
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Maximize } from "lucide-react"

// Import furniture components
import {
  ClothingRack,
  WallDisplay,
  AccessoryDisplay,
  ModularCube,
  GondolaDisplay,
  TableDisplay,
  PlanogramDisplay,
  RefrigeratedShowcase,
  CashierDisplay,
  ShelvesDisplay,
  ClothingWallDisplay,
  ClothingDisplay,
  SupermarketFridge,
} from "@/components/editor2D/furniture-3d-components"
import { Wall, Window, Door } from "@/components/editor2D/structural-3d-components"

import { ROOM_CONFIG, ItemTypes } from "@/lib/constants"
import { getElementColor } from "@/lib/utils1"
import type { PlacedFurniture, FloorPlan } from "@/lib/types1"

interface StoreDisplayAreaProps {
  onDrop: (furnitureId: string, x: number, y: number, z: number) => void
  placedFurniture: PlacedFurniture[]
  products: any[]
  onSelectFurniture: (id: string) => void
  selectedFurnitureId: string | null
  triggerCapture: boolean
  onCaptureComplete: (dataURL: string | null) => void
  sceneScale: number
  floorPlan: FloorPlan | null
  showFloorPlan: boolean
  floorPlanOpacity: number
  disabled: boolean
  lightIntensity: number
  environmentPreset: string
  showShadows: boolean
  setShowFloorPlanSelector: (show: boolean) => void
  isSidebarVisible: boolean
  screenSize: {
    width: number
    height: number
    isMobile: boolean
    isTablet: boolean
    isDesktop: boolean
  }
}

// Component to preload product textures
const TexturePreloader = ({ products }: { products: any[] }) => {
  const productImages = products.map((product) => product.image).filter(Boolean)
  useTexture(productImages)
  return null
}

// Component to capture the Three.js scene
const SceneCapture = ({
  triggerCapture,
  onCaptureComplete,
  products,
}: {
  triggerCapture: boolean
  onCaptureComplete: (dataURL: string | null) => void
  products: any[]
}) => {
  const { gl, scene, camera } = useThree()
  const [texturesLoaded, setTexturesLoaded] = useState(false)

  // Preload textures
  useEffect(() => {
    const textureLoader = new THREE.TextureLoader()
    const texturePromises = products
      .map((product) => product.image)
      .filter(Boolean)
      .map(
        (url) =>
          new Promise((resolve) => {
            textureLoader.load(url, resolve, undefined, resolve)
          }),
      )

    Promise.all(texturePromises)
      .then(() => {
        setTexturesLoaded(true)
        console.log("Toutes les textures sont chargées")
      })
      .catch((error) => {
        console.error("Erreur lors du chargement des textures:", error)
        setTexturesLoaded(true)
      })
  }, [products])

  useEffect(() => {
    if (triggerCapture && texturesLoaded) {
      setTimeout(() => {
        try {
          gl.render(scene, camera)
          const dataURL = gl.domElement.toDataURL("image/png", 1.0)
          onCaptureComplete(dataURL)
        } catch (error) {
          console.error("Erreur lors de la capture:", error)
          onCaptureComplete(null)
        }
      }, 500)
    }
  }, [triggerCapture, texturesLoaded, gl, scene, camera, onCaptureComplete])

  return null
}

// Realistic Room Components
const RealisticFloor = ({ screenSize }: { screenSize: any }) => {
  const floorTextures = useTexture({
    map: "/placeholder.svg?height=1024&width=1024",
    normalMap: "/placeholder.svg?height=1024&width=1024",
    roughnessMap: "/placeholder.svg?height=1024&width=1024",
    aoMap: "/placeholder.svg?height=1024&width=1024",
  })

  // Repeat the texture - adjust for mobile
  const textureScale = screenSize.isMobile ? ROOM_CONFIG.floorTextureScale * 0.5 : ROOM_CONFIG.floorTextureScale
  Object.keys(floorTextures).forEach((key) => {
    floorTextures[key].wrapS = floorTextures[key].wrapT = THREE.RepeatWrapping
    floorTextures[key].repeat.set(textureScale, textureScale)
  })

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[ROOM_CONFIG.width, ROOM_CONFIG.depth]} />
      <meshStandardMaterial {...floorTextures} color={ROOM_CONFIG.floorColor} roughness={0.8} metalness={0.2} />
    </mesh>
  )
}

const RealisticWalls = ({ screenSize }: { screenSize: any }) => {
  const wallTextures = useTexture({
    map: "/placeholder.svg?height=1024&width=1024",
    normalMap: "/placeholder.svg?height=1024&width=1024",
    roughnessMap: "/placeholder.svg?height=1024&width=1024",
  })

  // Repeat the texture - adjust for mobile
  const textureScale = screenSize.isMobile ? 2 : 4
  Object.keys(wallTextures).forEach((key) => {
    wallTextures[key].wrapS = wallTextures[key].wrapT = THREE.RepeatWrapping
    wallTextures[key].repeat.set(textureScale, 2)
  })

  return (
    <>
      {/* Back Wall */}
      <mesh position={[0, ROOM_CONFIG.height / 2, -ROOM_CONFIG.depth / 2]} receiveShadow>
        <planeGeometry args={[ROOM_CONFIG.width, ROOM_CONFIG.height]} />
        <meshStandardMaterial {...wallTextures} color={ROOM_CONFIG.wallColor} roughness={0.9} metalness={0.1} />
      </mesh>
      {/* Left Wall */}
      <mesh position={[-ROOM_CONFIG.width / 2, ROOM_CONFIG.height / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[ROOM_CONFIG.depth, ROOM_CONFIG.height]} />
        <meshStandardMaterial {...wallTextures} color={ROOM_CONFIG.wallColor} roughness={0.9} metalness={0.1} />
      </mesh>
    </>
  )
}

// Enhanced Controls Component - Responsive
const EnhancedControls = ({ screenSize }: { screenSize: any }) => {
  const { camera } = useThree()

  useEffect(() => {
    // Adjust camera position based on screen size
    const cameraDistance = screenSize.isMobile ? ROOM_CONFIG.width * 1.2 : ROOM_CONFIG.width / 2
    const cameraHeight = screenSize.isMobile ? ROOM_CONFIG.height * 1.8 : ROOM_CONFIG.height * 1.5

    camera.position.set(cameraDistance, cameraHeight, cameraDistance)
    camera.lookAt(ROOM_CONFIG.width / 2, 0, ROOM_CONFIG.depth / 2)
    camera.updateProjectionMatrix()
  }, [camera, screenSize])

  return (
    <OrbitControls
      makeDefault
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={screenSize.isMobile ? 5 : 3}
      maxDistance={screenSize.isMobile ? ROOM_CONFIG.width * 3 : ROOM_CONFIG.width * 2}
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI / 2}
      screenSpacePanning={false}
      target={[ROOM_CONFIG.width / 2, 0, ROOM_CONFIG.depth / 2]}
      // Touch settings for mobile
      enableDamping={true}
      dampingFactor={screenSize.isMobile ? 0.1 : 0.05}
      rotateSpeed={screenSize.isMobile ? 0.5 : 1}
      zoomSpeed={screenSize.isMobile ? 0.5 : 1}
      panSpeed={screenSize.isMobile ? 0.5 : 1}
    />
  )
}

// Camera Scaler Component - Responsive
const CameraScaler = ({ scale, screenSize }: { scale: number; screenSize: any }) => {
  const { camera } = useThree()

  useEffect(() => {
    const baseDistance = screenSize.isMobile ? ROOM_CONFIG.width * 1.2 : ROOM_CONFIG.width / 2
    const baseHeight = screenSize.isMobile ? ROOM_CONFIG.height * 1.8 : ROOM_CONFIG.height * 1.5

    camera.position.set(baseDistance / scale, baseHeight / scale, baseDistance / scale)
    camera.zoom = scale
    camera.updateProjectionMatrix()
  }, [camera, scale, screenSize])

  return null
}

// Composant pour les contrôles de déplacement de la scène (à l'extérieur du Canvas) - Responsive
const SceneControls = ({
  onMoveScene,
  screenSize,
}: {
  onMoveScene: (direction: "up" | "down" | "left" | "right" | "reset") => void
  screenSize: any
}) => {
  if (screenSize.isMobile) {
    // Version mobile compacte
    return (
      <div className="absolute top-2 right-2 bg-white/90 rounded-lg shadow-lg p-1 z-10">
        <div className="text-[10px] font-medium text-center mb-1 text-gray-600">Déplacer</div>
        <div className="grid grid-cols-3 gap-0.5">
          <div></div>
          <Button size="sm" variant="outline" className="h-6 w-6 p-0 bg-transparent" onClick={() => onMoveScene("up")}>
            <ArrowUp className="h-2 w-2" />
          </Button>
          <div></div>

          <Button
            size="sm"
            variant="outline"
            className="h-6 w-6 p-0 bg-transparent"
            onClick={() => onMoveScene("left")}
          >
            <ArrowLeft className="h-2 w-2" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-6 w-6 p-0 bg-transparent"
            onClick={() => onMoveScene("reset")}
            title="Centrer"
          >
            <Maximize className="h-2 w-2" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-6 w-6 p-0 bg-transparent"
            onClick={() => onMoveScene("right")}
          >
            <ArrowRight className="h-2 w-2" />
          </Button>

          <div></div>
          <Button
            size="sm"
            variant="outline"
            className="h-6 w-6 p-0 bg-transparent"
            onClick={() => onMoveScene("down")}
          >
            <ArrowDown className="h-2 w-2" />
          </Button>
          <div></div>
        </div>
      </div>
    )
  }

  // Version desktop
  return (
    <div className="absolute top-4 right-4 bg-white/90 rounded-lg shadow-lg p-2 z-10">
      <div className="text-xs font-medium text-center mb-2 text-gray-600">Déplacer la scène</div>
      <div className="grid grid-cols-3 gap-1">
        <div></div>
        <Button size="sm" variant="outline" className="h-8 w-8 p-0 bg-transparent" onClick={() => onMoveScene("up")}>
          <ArrowUp className="h-3 w-3" />
        </Button>
        <div></div>

        <Button size="sm" variant="outline" className="h-8 w-8 p-0 bg-transparent" onClick={() => onMoveScene("left")}>
          <ArrowLeft className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8 w-8 p-0 bg-transparent"
          onClick={() => onMoveScene("reset")}
          title="Centrer"
        >
          <Maximize className="h-3 w-3" />
        </Button>
        <Button size="sm" variant="outline" className="h-8 w-8 p-0 bg-transparent" onClick={() => onMoveScene("right")}>
          <ArrowRight className="h-3 w-3" />
        </Button>

        <div></div>
        <Button size="sm" variant="outline" className="h-8 w-8 p-0 bg-transparent" onClick={() => onMoveScene("down")}>
          <ArrowDown className="h-3 w-3" />
        </Button>
        <div></div>
      </div>
    </div>
  )
}

// Composant pour la scène avec contrôles améliorés - Responsive
const ControllableScene = ({
  floorPlan,
  showFloorPlan,
  floorPlanOpacity,
  onMoveScene,
  screenSize,
}: {
  floorPlan: FloorPlan | null
  showFloorPlan: boolean
  floorPlanOpacity: number
  onMoveScene: (direction: "up" | "down" | "left" | "right" | "reset") => void
  screenSize: any
}) => {
  const groupRef = useRef<THREE.Group>(null)
  const [scenePosition, setScenePosition] = useState<THREE.Vector3>(new THREE.Vector3(0, 0, 0))

  const moveScene = (direction: "up" | "down" | "left" | "right" | "reset") => {
    if (!groupRef.current) return

    // Adjust move step based on screen size
    const moveStep = screenSize.isMobile ? 1.5 : 2
    let newPosition = scenePosition.clone()

    switch (direction) {
      case "up":
        newPosition.z -= moveStep
        break
      case "down":
        newPosition.z += moveStep
        break
      case "left":
        newPosition.x -= moveStep
        break
      case "right":
        newPosition.x += moveStep
        break
      case "reset":
        newPosition = new THREE.Vector3(0, 0, 0)
        break
    }

    setScenePosition(newPosition)
    groupRef.current.position.copy(newPosition)
  }

  // Exposer la fonction moveScene via onMoveScene
  useEffect(() => {
    if (onMoveScene) {
      // Créer une référence à la fonction moveScene pour l'utiliser depuis l'extérieur
      window.moveSceneFunction = moveScene
    }
  }, [onMoveScene])

  // Calculer les éléments du plan d'étage - Responsive
  const floorPlanElements = () => {
    if (!showFloorPlan || !floorPlan || !floorPlan.elements || floorPlan.elements.length === 0) {
      return null
    }

    // Calculer les limites du plan pour le centrer
    const bounds = floorPlan.elements.reduce(
      (acc, element) => ({
        minX: Math.min(acc.minX, element.x),
        maxX: Math.max(acc.maxX, element.x + element.width),
        minY: Math.min(acc.minY, element.y),
        maxY: Math.max(acc.maxY, element.y + element.height),
      }),
      {
        minX: Number.POSITIVE_INFINITY,
        maxX: Number.NEGATIVE_INFINITY,
        minY: Number.POSITIVE_INFINITY,
        maxY: Number.NEGATIVE_INFINITY,
      },
    )

    const planWidth = bounds.maxX - bounds.minX
    const planHeight = bounds.maxY - bounds.minY
    const planCenterX = (bounds.minX + bounds.maxX) / 2
    const planCenterY = (bounds.minY + bounds.maxY) / 2

    // Échelle pour adapter le plan à la taille de la pièce - adjust for mobile
    const scaleX = ROOM_CONFIG.width / (planWidth / 100)
    const scaleZ = ROOM_CONFIG.depth / (planHeight / 100)
    const baseScale = Math.min(scaleX, scaleZ) * 0.8
    const scale = screenSize.isMobile ? baseScale * 0.8 : baseScale

    return floorPlan.elements.map((element, index) => {
      // Conversion simplifiée avec centrage
      const elementX = ((element.x - planCenterX) / 100) * scale
      const elementZ = ((element.y - planCenterY) / 100) * scale
      const elementWidth = (element.width / 100) * scale
      const elementDepth = (element.height / 100) * scale

      return (
        <group key={element.id}>
          <mesh
            position={[elementX, 0.05, elementZ]}
            rotation={[-Math.PI / 2, 0, ((element.rotation || 0) * Math.PI) / 180]}
          >
            <planeGeometry args={[elementWidth, elementDepth]} />
            <meshStandardMaterial color={getElementColor(element.type)} transparent={true} opacity={floorPlanOpacity} />
          </mesh>

          {/* Element label - Responsive */}
          <Html position={[elementX, 0.1, elementZ]} center distanceFactor={screenSize.isMobile ? 20 : 15}>
            <div
              className={`bg-white bg-opacity-50 px-1 py-0.5 rounded font-medium whitespace-nowrap pointer-events-none ${
                screenSize.isMobile ? "text-[6px]" : "text-[8px]"
              }`}
            >
              {element.name || element.type}
            </div>
          </Html>
        </group>
      )
    })
  }

  return (
    <>
      <group ref={groupRef} position={scenePosition}>
        {/* Sol de la pièce */}
        <Suspense fallback={null}>
          <RealisticFloor screenSize={screenSize} />
        </Suspense>

        {/* Éléments du plan d'étage */}
        {floorPlanElements()}
      </group>
    </>
  )
}

export const StoreDisplayArea = ({
  onDrop,
  placedFurniture,
  products,
  onSelectFurniture,
  selectedFurnitureId,
  triggerCapture,
  onCaptureComplete,
  sceneScale = 1,
  floorPlan,
  showFloorPlan,
  floorPlanOpacity,
  disabled = false,
  lightIntensity,
  environmentPreset,
  showShadows,
  setShowFloorPlanSelector,
  isSidebarVisible,
  screenSize,
}: StoreDisplayAreaProps) => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"

  // Fonction pour gérer le déplacement de la scène
  const [sceneMoveFunction, setSceneMoveFunction] = useState<
    ((direction: "up" | "down" | "left" | "right" | "reset") => void) | null
  >(null)

  const handleMoveScene = (direction: "up" | "down" | "left" | "right" | "reset") => {
    if (window.moveSceneFunction) {
      window.moveSceneFunction(direction)
    }
  }

  // Responsive drop zone
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.FURNITURE,
    drop: (item: { id: string }, monitor) => {
      const offset = monitor.getClientOffset()
      const initialClientOffset = monitor.getClientOffset()
      const initialSourceClientOffset = monitor.getInitialSourceClientOffset()

      if (offset && initialClientOffset && initialSourceClientOffset) {
        const dropAreaRect = document.getElementById("store-display-area")?.getBoundingClientRect()
        if (dropAreaRect) {
          const x = ((offset.x - dropAreaRect.left) / dropAreaRect.width) * ROOM_CONFIG.width - ROOM_CONFIG.width / 2
          const z = ((offset.y - dropAreaRect.top) / dropAreaRect.height) * ROOM_CONFIG.depth - ROOM_CONFIG.depth / 2
          onDrop(item.id, x, 0, z)
        }
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }))

  return (
    <div
      id="store-display-area"
      ref={drop}
      className={`
        relative border rounded-md overflow-hidden transition-all duration-300 w-full h-full
        ${isOver ? "border-primary" : "border-muted"}
        ${disabled ? "cursor-not-allowed" : ""}
      `}
      dir={textDirection}
    >
      {disabled && (
        <div className="absolute inset-0 bg-gray-200 bg-opacity-50 z-10 flex items-center justify-center">
          <div
            className={`bg-white p-4 rounded-md shadow-lg text-center ${
              screenSize.isMobile ? "max-w-[90vw] mx-2" : "max-w-md"
            }`}
          >
            <AlertCircle className={`text-amber-500 mx-auto mb-2 ${screenSize.isMobile ? "h-8 w-8" : "h-12 w-12"}`} />
            <h3 className={`font-medium mb-2 ${screenSize.isMobile ? "text-base" : "text-lg"}`}>
              {t("productImport.floorPlan.required")}
            </h3>
            <p className={`text-muted-foreground mb-4 ${screenSize.isMobile ? "text-sm" : ""}`}>
              {t("productImport.floorPlan.loadPrompt")}
            </p>
            <Button
              variant="outline"
              className="mx-auto bg-transparent"
              onClick={() => setShowFloorPlanSelector(true)}
              size={screenSize.isMobile ? "sm" : "default"}
            >
              <Map className="h-4 w-4 mr-2" />
              {t("productImport.load")}
            </Button>
          </div>
        </div>
      )}

      {/* Contrôles de scène à l'extérieur du Canvas - Responsive */}
      {showFloorPlan && floorPlan && <SceneControls onMoveScene={handleMoveScene} screenSize={screenSize} />}

      <Canvas
        shadows={showShadows}
        camera={{
          position: screenSize.isMobile
            ? [ROOM_CONFIG.width * 1.2, ROOM_CONFIG.width * 1.8, ROOM_CONFIG.width * 1.2]
            : [ROOM_CONFIG.width / 2, ROOM_CONFIG.width / 2, ROOM_CONFIG.width / 2],
          fov: screenSize.isMobile ? 60 : 50,
        }}
        style={{ width: "100%", height: "100%" }}
        dpr={screenSize.isMobile ? [1, 1.5] : [1, 2]} // Optimize pixel ratio for mobile
      >
        <TexturePreloader products={products} />
        <CameraScaler scale={sceneScale} screenSize={screenSize} />

        {/* Environment and lighting - Responsive */}
        <Environment preset={environmentPreset} background={false} />
        <ambientLight intensity={lightIntensity * (screenSize.isMobile ? 0.6 : 0.5)} />
        <directionalLight
          position={[ROOM_CONFIG.width / 2, ROOM_CONFIG.width / 2, ROOM_CONFIG.width / 2]}
          intensity={lightIntensity * (screenSize.isMobile ? 0.8 : 1)}
          castShadow={showShadows && !screenSize.isMobile} // Disable shadows on mobile for performance
          shadow-mapSize-width={screenSize.isMobile ? 512 : 1024}
          shadow-mapSize-height={screenSize.isMobile ? 512 : 1024}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />

        {/* Murs (fixes, ne bougent pas avec la scène) */}
        <Suspense fallback={null}>
          <RealisticWalls screenSize={screenSize} />
        </Suspense>

        {/* Scène contrôlable (sol + plan d'étage) */}
        <ControllableScene
          floorPlan={floorPlan}
          showFloorPlan={showFloorPlan}
          floorPlanOpacity={floorPlanOpacity}
          onMoveScene={handleMoveScene}
          screenSize={screenSize}
        />

        {/* Placed furniture - Responsive rendering */}
        <Suspense fallback={null}>
          {placedFurniture.map((item) => {
            if (item.type === "door") {
              return (
                <group
                  key={`door-${item.id}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectFurniture(item.id)
                  }}
                  userData-selected={item.id === selectedFurnitureId}
                  position={[item.x, item.y, item.z]}
                  rotation={[0, (item.rotation * Math.PI) / 180, 0]}
                >
                  <Door width={item.width || 1} height={item.height || 2} depth={item.depth || 0.1} />
                </group>
              )
            }

            if (item.type === "wall") {
              return (
                <group
                  key={`wall-${item.id}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectFurniture(item.id)
                  }}
                  userData-selected={item.id === selectedFurnitureId}
                  position={[item.x, item.y, item.z]}
                  rotation={[0, (item.rotation * Math.PI) / 180, 0]}
                >
                  <Wall width={item.width || 5} height={item.height || 3} depth={item.depth || 0.2} />
                </group>
              )
            }

            if (item.type === "window") {
              return (
                <group
                  key={`window-${item.id}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectFurniture(item.id)
                  }}
                  userData-selected={item.id === selectedFurnitureId}
                  position={[item.x, item.y, item.z]}
                  rotation={[0, (item.rotation * Math.PI) / 180, 0]}
                >
                  <Window width={item.width || 2} height={item.height || 1.5} depth={item.depth || 0.1} />
                </group>
              )
            }

            // Original furniture rendering code
            const savedFurniture = item.savedFurniture
            if (!savedFurniture) return null

            const furnitureProps = {
              furniture: {
                ...savedFurniture.furniture,
                x: item.x,
                y: item.y,
                z: item.z,
                rotation: item.rotation,
              },
              displayItems: savedFurniture.products.map((p: any) => ({
                id: `display-${p.productId}-${item.id}-${p.section}-${p.position}`,
                productId: p.productId,
                section: p.section,
                position: p.position,
                quantity: p.quantity || 1,
                furnitureId: savedFurniture.furniture.id,
              })),
              products,
              onRemove: () => {},
              screenSize, // Pass screen size to furniture components
            }

            const groupProps = {
              onClick: (e: any) => {
                e.stopPropagation()
                onSelectFurniture(item.id)
              },
              "userData-selected": item.id === selectedFurnitureId,
              position: [item.x, item.y, item.z] as [number, number, number],
              rotation: [0, (item.rotation * Math.PI) / 180, 0] as [number, number, number],
            }

            switch (savedFurniture.furniture.type) {
              case "clothing-rack":
                return (
                  <group key={`furniture-${item.id}`} {...groupProps}>
                    <ClothingRack {...furnitureProps} />
                  </group>
                )
              case "wall-display":
                return (
                  <group key={`furniture-${item.id}`} {...groupProps}>
                    <WallDisplay {...furnitureProps} />
                  </group>
                )
              case "accessory-display":
                return (
                  <group key={`furniture-${item.id}`} {...groupProps}>
                    <AccessoryDisplay {...furnitureProps} />
                  </group>
                )
              case "modular-cube":
                return (
                  <group key={`furniture-${item.id}`} {...groupProps}>
                    <ModularCube {...furnitureProps} />
                  </group>
                )
              case "gondola":
                return (
                  <group key={`furniture-${item.id}`} {...groupProps}>
                    <GondolaDisplay {...furnitureProps} />
                  </group>
                )
              case "table":
                return (
                  <group key={`furniture-${item.id}`} {...groupProps}>
                    <TableDisplay {...furnitureProps} />
                  </group>
                )
              case "planogram":
                return (
                  <group key={`furniture-${item.id}`} {...groupProps}>
                    <PlanogramDisplay
                      {...furnitureProps}
                      cellWidth={savedFurniture.furniture.width / savedFurniture.furniture.slots}
                      cellHeight={savedFurniture.furniture.height / savedFurniture.furniture.sections}
                    />
                  </group>
                )
              case "shelves-display":
                return (
                  <group key={`furniture-${item.id}`} {...groupProps}>
                    <ShelvesDisplay
                      {...furnitureProps}
                      cellWidth={savedFurniture.furniture.width / savedFurniture.furniture.slots}
                      cellHeight={savedFurniture.furniture.height / savedFurniture.furniture.sections}
                    />
                  </group>
                )
              case "refrigerator":
                return (
                  <group key={`furniture-${item.id}`} {...groupProps}>
                    <SupermarketFridge {...furnitureProps} />
                  </group>
                )
              case "refrigerated-showcase":
                return (
                  <group key={`furniture-${item.id}`} {...groupProps}>
                    <RefrigeratedShowcase {...furnitureProps} />
                  </group>
                )
              case "clothing-display":
                return (
                  <group key={`furniture-${item.id}`} {...groupProps}>
                    <ClothingDisplay {...furnitureProps} />
                  </group>
                )
              case "clothing-wall":
                return (
                  <group key={`furniture-${item.id}`} {...groupProps}>
                    <ClothingWallDisplay {...furnitureProps} />
                  </group>
                )
              case "cashier":
                return (
                  <group key={`furniture-${item.id}`} {...groupProps}>
                    <CashierDisplay {...furnitureProps} />
                  </group>
                )
              default:
                return null
            }
          })}
        </Suspense>

        {/* Contact shadows for realistic look - Disable on mobile for performance */}
        {showShadows && !screenSize.isMobile && (
          <ContactShadows
            position={[0, 0.01, 0]}
            opacity={0.4}
            scale={40}
            blur={2}
            far={10}
            resolution={256}
            color="#000000"
          />
        )}

        <EnhancedControls screenSize={screenSize} />
        <SceneCapture triggerCapture={triggerCapture} onCaptureComplete={onCaptureComplete} products={products} />
      </Canvas>
    </div>
  )
}
