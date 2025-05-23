"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { useTexture } from "@react-three/drei"
import * as THREE from "three"

// Wall component
export const Wall = ({ width = 5, height = 3, depth = 0.2, color = "#f5f5f5" }) => {
  const wallTextures = useTexture({
    map: "/placeholder.svg?height=1024&width=1024",
    normalMap: "/placeholder.svg?height=1024&width=1024",
    roughnessMap: "/placeholder.svg?height=1024&width=1024",
  })

  // Répéter la texture
  Object.keys(wallTextures).forEach((key) => {
    wallTextures[key].wrapS = wallTextures[key].wrapT = THREE.RepeatWrapping
    wallTextures[key].repeat.set(width / 2, height / 2)
  })

  const meshRef = useRef()

  // Highlight when selected
  useFrame((state, delta) => {
    if (meshRef.current && meshRef.current.parent && meshRef.current.parent.userData.selected) {
      meshRef.current.material.emissive.set("#2a2a2a")
    } else if (meshRef.current) {
      meshRef.current.material.emissive.set("#000000")
    }
  })

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial {...wallTextures} color={color} roughness={0.9} metalness={0.1} />
    </mesh>
  )
}

// Window component
export const Window = ({ width = 2, height = 1.5, depth = 0.1, frameColor = "#555555", glassColor = "#87CEEB" }) => {
  const frameRef = useRef()
  const glassRef = useRef()

  // Highlight when selected
  useFrame((state, delta) => {
    if (frameRef.current && frameRef.current.parent && frameRef.current.parent.userData.selected) {
      frameRef.current.material.emissive.set("#2a2a2a")
      if (glassRef.current) {
        glassRef.current.material.emissive.set("#2a2a2a")
      }
    } else {
      if (frameRef.current) {
        frameRef.current.material.emissive.set("#000000")
      }
      if (glassRef.current) {
        glassRef.current.material.emissive.set("#000000")
      }
    }
  })

  return (
    <group>
      {/* Window frame */}
      <mesh position={[0, height / 2 - 0.05, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, 0.1, depth]} />
          <meshStandardMaterial color={frameColor} metalness={0.6} roughness={0.5} />
        </mesh>
        <mesh position={[0, -height / 2 + 0.05, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, 0.1, depth]} />
          <meshStandardMaterial color={frameColor} metalness={0.6} roughness={0.5} />
        </mesh>
        <mesh position={[-width / 2 + 0.05, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.1, height - 0.2, depth]} />
          <meshStandardMaterial color={frameColor} metalness={0.6} roughness={0.5} />
        </mesh>
        <mesh position={[width / 2 - 0.05, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.1, height - 0.2, depth]} />
          <meshStandardMaterial color={frameColor} metalness={0.6} roughness={0.5} />
        </mesh>

      {/* Window glass */}
      <mesh ref={glassRef} position={[0, 0, depth / 4]}>
        <boxGeometry args={[width - 0.15, height - 0.15, depth / 2]} />
        <meshPhysicalMaterial
          color={glassColor}
          roughness={0}
          metalness={0}
          transmission={1}
          thickness={0.1}
          transparent={true}
          opacity={0.6}
          reflectivity={0.8}
          clearcoat={1}
          clearcoatRoughness={0}
          ior={1.52}
          envMapIntensity={1}
        />
      </mesh>

    </group>
  )
}

// Door component
export const Door = ({ width = 1, height = 2.2, depth = 0.05, color = "#8B4513" }) => {
  const doorRef = useRef()

  // Highlight when selected
  useFrame((state, delta) => {
    if (doorRef.current && doorRef.current.parent && doorRef.current.parent.userData.selected) {
      doorRef.current.material.emissive.set("#2a2a2a")
    } else if (doorRef.current) {
      doorRef.current.material.emissive.set("#000000")
    }
  })

  return (
    <group>
<mesh ref={doorRef} castShadow receiveShadow>
  <boxGeometry args={[width, height, depth]} />
  <meshStandardMaterial color={color} roughness={0.8} metalness={0.2} />
</mesh>

<mesh position={[0, 0, depth / 2 + 0.01]}>
  <boxGeometry args={[width - 0.2, height - 0.2, 0.01]} />
  <meshPhysicalMaterial
    color={"#87CEEB"}
    roughness={0.05}
    metalness={0}
    transmission={1}
    transparent
    opacity={0.5}
    thickness={0.05}
    reflectivity={0.8}
    clearcoat={1}
    ior={1.52}
  />
</mesh>
</group>
  )
}
