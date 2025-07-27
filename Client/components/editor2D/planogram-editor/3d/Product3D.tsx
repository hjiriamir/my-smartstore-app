"use client"

import { useState, useEffect } from "react"
import * as THREE from "three"
import type { Product } from "@/lib/product-store"

interface Product3DProps {
  position: [number, number, number]
  size: [number, number, number]
  product: Product
  quantity?: number
  displayMode?: "compact" | "spaced"
  cellIndex: number
  rotation?: [number, number, number]
}

export const Product3D = ({
  position,
  size,
  product,
  quantity = 1,
  displayMode = "compact",
  cellIndex,
  rotation = [0, 0, 0],
}: Product3DProps) => {
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
              loadedTexture.encoding = THREE.SRGBColorSpace
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

  const scaleFactor = quantity > 1 ? 0.8 : 0.9
  const productWidth = isLateralRotation ? (depth / quantity) * scaleFactor : (totalWidth / quantity) * scaleFactor
  const spacing = isLateralRotation
    ? ((depth - productWidth * quantity) / (quantity + 1)) * 0.15
    : ((totalWidth - productWidth * quantity) / (quantity + 1)) * 0.15

  const productInstances = []
  for (let i = 0; i < quantity; i++) {
    let x = baseX
    let z = baseZ

    if (isLateralRotation) {
      const effectiveDepth = depth * 0.8
      const startZ = baseZ - effectiveDepth / 2 + spacing
      z = startZ + i * (productWidth + spacing)
    } else {
      const effectiveWidth = totalWidth * 0.9
      const startX = baseX - effectiveWidth / 2 + spacing
      x = startX + i * (productWidth + spacing)
    }

    const jitterX = (Math.random() - 0.5) * 0.0005
    const jitterY = (Math.random() - 0.5) * 0.0005
    const jitterZ = (Math.random() - 0.5) * 0.0005

    const adjustedWidth = isLateralRotation ? height * 0.7 : productWidth
    const adjustedHeight = isLateralRotation ? productWidth * 1.1 : height * 0.8
    const standardProductHeight = 0.5

    productInstances.push(
      <group
        key={`product-${cellIndex}-${i}`}
        position={[x + jitterX, baseY + jitterY, z + jitterZ]}
        rotation={rotation}
        castShadow
        receiveShadow
      >
        {texture ? (
          <mesh castShadow receiveShadow position={[0, standardProductHeight / 2, 0]}>
            <planeGeometry args={[adjustedWidth, adjustedHeight]} />
            <meshBasicMaterial map={texture} transparent={true} side={THREE.DoubleSide} />
          </mesh>
        ) : (
          <mesh castShadow receiveShadow position={[0, standardProductHeight / 2, 0]}>
            <planeGeometry args={[adjustedWidth, adjustedHeight]} />
            <meshBasicMaterial color={product.color || "#f3f4f6"} />
          </mesh>
        )}
      </group>,
    )
  }

  return <>{productInstances}</>
}
