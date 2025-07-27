"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useThree } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera } from "@react-three/drei"
import * as THREE from "three"

import { Shelf } from "./furniture/Shelf"
import { Gondola } from "./furniture/Gondola"
import { ShelvesDisplay } from "./furniture/ShelvesDisplay"
import { Product3D } from "./Product3D"
import { SceneCapture } from "./SceneCapture"
import { FurnitureTypes } from "@/lib/furniture"
import type { PlanogramConfig, PlanogramCell } from "@/lib/planogram"
import type { Product, ProductInstance } from "@/lib/product-store"

// Debug component to log scene information
const DebugInfo = () => {
  const { scene } = useThree()
  useEffect(() => {
    console.log("Scene children:", scene.children)
  }, [scene])
  return null
}

interface PlanogramSceneProps {
  planogramConfig: PlanogramConfig
  cells: PlanogramCell[]
  products: Product[]
  productInstances: ProductInstance[]
  captureRef?: React.MutableRefObject<((callback: (dataUrl: string) => void) => void) | null>
  productSizeScale?: number
}

export const PlanogramScene = ({
  planogramConfig,
  cells,
  products,
  productInstances,
  captureRef,
  productSizeScale = 100,
}: PlanogramSceneProps) => {
  const { width, height, depth, shelfThickness } = planogramConfig.furnitureDimensions
  const [capturing, setCapturing] = useState(false)
  const [captureCallback, setCaptureCallback] = useState<((dataUrl: string) => void) | null>(null)
  const { scene, gl, camera } = useThree()
  const [isSceneReady, setIsSceneReady] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSceneReady(true)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const forceRender = useCallback(() => {
    gl.render(scene, camera)
  }, [gl, scene, camera])

  // Set background color
  useEffect(() => {
    scene.background = new THREE.Color("#f0f8ff")
  }, [scene])

  // Expose capture function through ref
  useEffect(() => {
    if (captureRef && isSceneReady) {
      captureRef.current = (callback) => {
        setCapturing(true)
        setCaptureCallback(() => callback)
        gl.render(scene, camera)
      }
    }
  }, [captureRef, isSceneReady, gl, scene, camera])

  // Handle capture completion
  const handleCapture = useCallback(
    (dataUrl: string) => {
      if (captureCallback) {
        captureCallback(dataUrl)
        setCapturing(false)
        setCaptureCallback(null)
      }
    },
    [captureCallback],
  )

  const shelfSpacing = height / planogramConfig.rows
  const cellWidth = width / planogramConfig.columns
  const standardProductWidth = cellWidth * 0.9 * (productSizeScale / 100)
  const standardProductHeight = shelfSpacing * 0.5 * (productSizeScale / 100)
  const standardProductDepth = depth * 0.3 * (productSizeScale / 100)

  const filteredProductInstances = productInstances.filter((pi) => pi.furnitureType === planogramConfig.furnitureType)

  return (
    <>
      {/* Main camera */}
      {/* Debug info */}
      <DebugInfo />
      <PerspectiveCamera
        makeDefault
        position={[
          planogramConfig.furnitureType === FurnitureTypes.GONDOLA
            ? 4
            : planogramConfig.furnitureType === FurnitureTypes.SHELVES_DISPLAY
              ? 0
              : 0,
          planogramConfig.furnitureType === FurnitureTypes.SHELVES_DISPLAY
            ? planogramConfig.rows * 0.5
            : planogramConfig.rows * 0.2,
          planogramConfig.furnitureType === FurnitureTypes.SHELVES_DISPLAY
            ? planogramConfig.rows * 2
            : planogramConfig.rows * 1.5,
        ]}
        fov={planogramConfig.furnitureType === FurnitureTypes.SHELVES_DISPLAY ? 30 : 35}
      />

      {/* Lighting */}
      <ambientLight intensity={0.8} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      >
        <orthographicCamera attach="shadow-camera" args={[-10, 10, 10, -10, 0.1, 50]} />
      </directionalLight>
      <directionalLight position={[-5, 5, -5]} intensity={0.5} />
      <directionalLight position={[0, 5, 10]} intensity={0.5} />

      {/* Additional lighting for shelves display */}
      {planogramConfig.furnitureType === FurnitureTypes.SHELVES_DISPLAY && (
        <>
          <pointLight position={[-width / 3, height, 0]} intensity={0.5} distance={5} decay={2} />
          <pointLight position={[0, height, 0]} intensity={0.5} distance={5} decay={2} />
          <pointLight position={[width / 3, height, 0]} intensity={0.5} distance={5} decay={2} />
        </>
      )}

      <spotLight position={[0, 8, 3]} angle={0.4} penumbra={0.5} intensity={0.6} castShadow shadow-bias={-0.0001} />
      <spotLight position={[0, 3, 8]} angle={0.6} penumbra={0.5} intensity={0.5} castShadow={false} />

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#e0e0e0" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Grid helper */}
      <gridHelper args={[30, 30, "#888888", "#AAAAAA"]} position={[0, 0.01, 0]} />

      {/* Furniture based on type */}
      {planogramConfig.furnitureType === FurnitureTypes.PLANOGRAM ? (
        <group>
          <Shelf position={[0, height / 2, -depth]} size={[width + 0.2, height, 0.05]} color="#EEEEEE" />
          <Shelf position={[-width / 2 - 0.1, height / 2, -depth / 2]} size={[0.1, height, depth]} color="#EEEEEE" />
          <Shelf position={[width / 2 + 0.1, height / 2, -depth / 2]} size={[0.1, height, depth]} color="#EEEEEE" />
          {Array.from({ length: planogramConfig.rows + 1 }).map((_, rowIndex) => (
            <Shelf
              key={`shelf-${rowIndex}`}
              position={[0, rowIndex * shelfSpacing, -depth / 2]}
              size={[width, shelfThickness, depth]}
              color="#FFFFFF"
            />
          ))}
        </group>
      ) : planogramConfig.furnitureType === FurnitureTypes.GONDOLA ? (
        <Gondola
          position={[0, 0, 0]}
          dimensions={planogramConfig.furnitureDimensions}
          rows={planogramConfig.rows}
          columns={planogramConfig.columns}
        />
      ) : planogramConfig.furnitureType === FurnitureTypes.SHELVES_DISPLAY ? (
        <ShelvesDisplay
          position={[0, 0, 0]}
          dimensions={planogramConfig.furnitureDimensions}
          rows={planogramConfig.rows}
          columns={planogramConfig.columns}
          planogramConfig={planogramConfig}
        />
      ) : null}

      {/* Products */}
      {cells
        .filter((cell) => cell.furnitureType === planogramConfig.furnitureType && cell.instanceId !== null)
        .map((cell, cellIndex) => {
          const productInstance = filteredProductInstances.find((pi) => pi.instanceId === cell.instanceId)
          if (!productInstance) return null

          const product = products.find((p) => p.primary_id === productInstance.productId)
          if (!product) return null

          // Calculate position based on furniture type
          let x = -width / 2 + cellWidth / 2 + cell.x * cellWidth
          const shelfY = (planogramConfig.rows - 1 - cell.y) * shelfSpacing
          let y = shelfY + shelfThickness / 2
          let z = -depth / 2 + standardProductDepth / 2

          if (planogramConfig.furnitureType === FurnitureTypes.GONDOLA) {
            const midColumn = planogramConfig.columns / 2
            if (cell.x < midColumn) {
              z = -depth / 4
            } else {
              z = depth / 4
            }
          } else if (planogramConfig.furnitureType === FurnitureTypes.SHELVES_DISPLAY) {
            const leftRightColumns = planogramConfig.shelvesConfig?.leftRightColumns || 1
            const frontBackColumns = planogramConfig.shelvesConfig?.frontBackColumns || 3
            const leftLimit = leftRightColumns
            const frontLimit = leftLimit + frontBackColumns
            const backLimit = frontLimit + frontBackColumns
            const shelfY = (cell.etagere - 1) * shelfSpacing

            if (cell.x < leftLimit) {
              z = -depth / 2 + 0.7
              x = -width / 2 - 0.1
              if (leftRightColumns > 1) {
                const positionRatio = (cell.colonne - 0.5) / leftRightColumns
                z = -depth / 2 + 0.2 + (depth - 0.4) * positionRatio
              }
              productInstance.rotation = [0, Math.PI / 2, 0]
            } else if (cell.x >= leftLimit && cell.x < frontLimit) {
              z = depth / 2 - 0.2
              const relativeCol = cell.colonne - 1
              const columnWidth = width / frontBackColumns
              x = -width / 2 + columnWidth * (relativeCol + 0.5)
              productInstance.rotation = [0, 0, 0]
            } else if (cell.x >= frontLimit && cell.x < backLimit) {
              z = -depth / 2 + 0.2
              const relativeCol = cell.colonne - 1
              const columnWidth = width / frontBackColumns
              x = -width / 2 + columnWidth * (relativeCol + 0.5)
              productInstance.rotation = [0, Math.PI, 0]
            } else {
              z = 0
              x = width / 2 - 0.15
              if (leftRightColumns > 1) {
                const positionRatio = (cell.colonne - 0.5) / leftRightColumns
                z = depth / 2 - 0.2 - (depth - 0.4) * positionRatio
              }
              productInstance.rotation = [0, Math.PI / 2, 0]
            }

            y = shelfY + shelfThickness / 2
          }

          const quantity = cell.quantity || 1
          return (
            <Product3D
              key={cell.instanceId}
              position={[x, y, z]}
              size={[standardProductWidth, standardProductHeight, standardProductDepth]}
              product={product}
              quantity={quantity}
              displayMode={planogramConfig.displayMode}
              cellIndex={cellIndex}
              rotation={productInstance.rotation || [0, 0, 0]}
            />
          )
        })}

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={2}
        maxDistance={20}
        target={[0, planogramConfig.rows / 2, 0]}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2}
      />

      {capturing && <SceneCapture onCapture={handleCapture} />}
    </>
  )
}
